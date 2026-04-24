import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { digiflazz } from "@/lib/digiflazz";
import redis from "@/lib/redis";
import { sendOrderInvoice } from "@/lib/resend";
import crypto from "crypto";

/**
 * PAKASIR WEBHOOK HANDLER
 * Handles automated payment confirmation and fulfillment.
 * 
 * Flow: Pakasir Payment → Webhook → Update Order → Fulfillment → Notify User
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log("📥 [PAKASIR WEBHOOK] Payload:", JSON.stringify(body, null, 2));

        // 1. Basic Validation
        const data = body.data || body;
        const merchant_ref = data.merchant_ref || data.order_id || data.reference;
        const status = data.status || data.payment_status;

        // 🛡️ SECURITY: Verify Webhook Secret via URL Token
        // Reject ALL webhooks if WEBHOOK_SECRET is not configured
        const url = new URL(req.url);
        const token = url.searchParams.get("token");
        const expectedSecret = process.env.WEBHOOK_SECRET;
        
        // CRITICAL: No fallback! If env not set, block everything
        if (!expectedSecret) {
            console.error(`🚨 [CRITICAL] WEBHOOK_SECRET not configured! All webhooks blocked.`);
            return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
        }

        // Timing-safe comparison to prevent timing attacks
        if (!token || token.length !== expectedSecret.length || 
            !crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expectedSecret))) {
            console.warn(`🚨 [SECURITY] Unauthorized webhook attempt for order ${merchant_ref || 'unknown'}`);
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        if (!merchant_ref) {
            return NextResponse.json({ error: "Missing merchant_ref" }, { status: 400 });
        }

        // 2. Check for success and failure statuses
        const isSuccess = ["completed", "PAID", "success"].includes(status);
        const isFailed = ["expired", "failed", "cancelled", "denied", "cancel"].includes(String(status).toLowerCase());

        if (!isSuccess && !isFailed) {
            console.log(`⏳ [WEBHOOK] Status pending/unknown: ${status} for ${merchant_ref}`);
            return NextResponse.json({ status: "received" });
        }

        // ═══════════════════════════════════════════════════════════
        // FIX #5: IDEMPOTENCY GUARD — prevent duplicate processing
        // If webhook fires twice (network retry), the second call
        // will see the lock and skip processing.
        // ═══════════════════════════════════════════════════════════
        const lockKey = `webhook_lock:${merchant_ref}`;
        const lockAcquired = await redis.set(lockKey, '1', 'EX', 30, 'NX');
        if (!lockAcquired) {
            console.log(`🔒 [WEBHOOK] Duplicate webhook skipped for ${merchant_ref}`);
            return NextResponse.json({ status: "already_processing" });
        }

        // 3. Find PENDING Order
        const order = await prisma.order.findFirst({
            where: {
                orderId: merchant_ref,
                status: "PENDING"
            },
            include: {
                product: {
                    include: { category: true }
                },
                telegramUser: true,
                customerUser: true
            }
        });

        if (!order) {
            console.log(`❌ [WEBHOOK] Order not found or already PAID: ${merchant_ref}`);
            await redis.del(lockKey); // Release lock
            return NextResponse.json({ status: "already_processed_or_not_found" });
        }

        // 4. Handle Failed/Expired Order
        if (isFailed) {
            try {
                await prisma.order.update({
                    where: { id: order.id, status: "PENDING" },
                    data: {
                        status: "CANCELLED",
                        provider_status: String(status),
                        provider_response: body
                    }
                });
            } catch (err) {
                console.warn(`🚨 [SECURITY TOCTOU] Handled failed status but order ${merchant_ref} wasn't PENDING.`);
                await redis.del(lockKey);
                return NextResponse.json({ status: "already_processed_or_not_found" });
            }

            // 🎟️ SECURITY FIX: Release voucher usage if order failed
            if ((order as any).voucherId) {
                await (prisma as any).voucher.update({
                    where: { id: (order as any).voucherId },
                    data: { usageCount: { decrement: 1 } }
                });
                console.log(`🎟️ [WEBHOOK] Voucher released for failed order ${merchant_ref}`);
            }

            console.log(`❌ [WEBHOOK] Order expired/failed, marked as CANCELLED: ${merchant_ref}`);

            // Notify Telegram user about cancellation
            if (order.telegramUser) {
                await sendTelegramMessage(
                    order.telegramUser.telegramId.toString(),
                    `❌ Waktu pembayaran habis atau dibatalkan.\n\n📦 Produk: ${order.product.name}\n🆔 Order ID: ${order.orderId}\n\nSilakan order ulang jika masih berminat.`
                );
            }

            // FIX #1: Notify web user about cancellation
            if (order.customerUser) {
                await prisma.notification.create({
                    data: {
                        userId: order.customerUser.id,
                        title: "Pembayaran Gagal",
                        message: `Pembayaran untuk ${order.product.name} telah dibatalkan atau expired. Order ID: ${order.orderId}`,
                        type: "WARNING"
                    }
                });
            }

            return NextResponse.json({ success: true, status: "cancelled", orderId: merchant_ref });
        }

        // 5. SECURITY CHECK: Verify Amount
        const rawAmount = data.amount || data.total_amount;
        const paidAmount = Number(rawAmount);
        const expectedPrice = order.product.price;
        const discount = (order as any).discountAmount || 0;
        const expectedAmount = expectedPrice - discount;

        // Tolerance of 100 rupiah for potential unique code additions (if any)
        // FIX: Enforce type boundaries and explicitly protect against NaN
        if (isNaN(paidAmount) || paidAmount <= 0 || Math.abs(paidAmount - expectedAmount) > 100) {
           console.error(`🚨 [SECURITY] Amount mismatch/invalid! Paid: ${rawAmount}, Expected: ${expectedAmount} for ${merchant_ref}`);
           // We mark as PAID but flag it for manual review or keep it PENDING?
           // Best to keep as PENDING or mark as SUSPICIOUS if we have that status.
           // For now, let's just log and skip fulfillment.
           await redis.del(lockKey);
           return NextResponse.json({ error: "Amount mismatch detected" }, { status: 400 });
        }

        // 6. MARK ORDER AS PAID
        try {
            await (prisma.order as any).update({
                where: { 
                    id: order.id,
                    status: "PENDING"
                },
                data: {
                    status: "PAID",
                    provider_status: String(status),
                    provider_response: body
                }
            });
        } catch (updateErr) {
            console.error(`🚨 [SECURITY TOCTOU] Order ${merchant_ref} was no longer PENDING during PAID update.`);
            await redis.del(lockKey);
            return NextResponse.json({ error: "Order state changed concurrently" }, { status: 409 });
        }

        console.log(`✅ [WEBHOOK] Order marked as PAID: ${merchant_ref}`);

        // 7. TRIGGER FULFILLMENT LOGIC
        const result = await triggerFulfillment(order);

        // ═══════════════════════════════════════════════════════════
        // FIX #2: Set order to COMPLETED & Grant Points (2 Fixed Points)
        // ═══════════════════════════════════════════════════════════
        if (result.success) {
            const earnedPoints = 2; // FIXED: 2 points per transaction

            await prisma.$transaction([
                prisma.order.update({
                    where: { id: order.id },
                    data: { 
                        status: "COMPLETED",
                        pointsEarned: earnedPoints
                    } as any
                }),
                // Only grant points if order has customerUserId
                ...(order.customerUserId ? [
                    (prisma as any).user.update({
                        where: { id: order.customerUserId },
                        data: { points: { increment: earnedPoints } }
                    }),
                    (prisma as any).pointTransaction.create({
                        data: {
                            userId: order.customerUserId,
                            amount: earnedPoints,
                            type: "EARN",
                            description: `Reward transaksi #${order.orderId}`
                        }
                    })
                ] : [])
            ]);

            console.log(`🎉 [WEBHOOK] Order COMPLETED & ${earnedPoints} points granted to user ${order.customerUserId || 'Guest'}`);
        }

        // 7. SEND EMAIL INVOICE
        const recipientEmail = order.customer_email || order.customerUser?.email;
        const orderDiscount = (order as any).discountAmount || 0;
        if (recipientEmail) {
            try {
                await sendOrderInvoice(recipientEmail, {
                    orderId: order.orderId,
                    productName: order.product.name,
                    target: order.customer_no || (order.custom_fields as any)?.user_id || "User",
                    price: order.product.price,
                    discount: orderDiscount,
                    finalPrice: order.product.price - orderDiscount
                });
                console.log(`📧 [WEBHOOK] Invoice sent to ${recipientEmail}`);
            } catch (emailErr) {
                console.error("❌ [WEBHOOK] Failed to send email invoice:", emailErr);
            }
        }

        // 8. NOTIFY USERS
        // Telegram notification
        if (order.telegramUser) {
            const discountText = orderDiscount > 0 ? `\n🎟️ Diskon: -Rp ${orderDiscount.toLocaleString("id-ID")}` : "";
            await sendTelegramMessage(
                order.telegramUser.telegramId.toString(),
                `🎉 Pembayaran berhasil diterima!\n\n📦 Produk: ${order.product.name}\n🆔 Order ID: ${order.orderId}${discountText}\n\n${result.message || 'Pesanan Anda sedang diproses.'}`
            );
        }

        // ═══════════════════════════════════════════════════════════
        // FIX #1: In-app notification for web users
        // ═══════════════════════════════════════════════════════════
        if (order.customerUser) {
            const discountInfo = orderDiscount > 0 ? ` (Diskon Rp ${orderDiscount.toLocaleString("id-ID")})` : "";
            await prisma.notification.create({
                data: {
                    userId: order.customerUser.id,
                    title: result.success ? "Pembayaran Berhasil! 🎉" : "Pembayaran Diterima",
                    message: result.success
                        ? `${order.product.name} berhasil diproses.${discountInfo} ${result.message || ''} Order ID: ${order.orderId}`
                        : `Pembayaran untuk ${order.product.name} diterima.${discountInfo} Pesanan sedang diproses manual oleh admin. Order ID: ${order.orderId}`,
                    type: result.success ? "SUCCESS" : "INFO"
                }
            });
        }

        return NextResponse.json({ success: true, orderId: merchant_ref });

    } catch (error) {
        console.error("💥 [WEBHOOK ERROR]:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

async function sendTelegramMessage(chatId: string, text: string) {
    const token = process.env.TELEGRAM_TOKEN;
    if (!token) {
        console.error("TELEGRAM_TOKEN missing in .env");
        return;
    }
    try {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" })
        });
    } catch (err) {
        console.error("Failed to send Telegram notification:", err);
    }
}

/**
 * Fulfillment Dispatcher
 * 
 * FIX #4: Logic perbaikan — provider_sku takes priority
 * - If product has provider_sku → Digiflazz (auto top-up)
 * - Otherwise → Manual (redeem code delivery)
 */
async function triggerFulfillment(order: any) {
    const { product, orderId } = order;

    // Case A: Digiflazz Product (has SKU → auto top-up)
    if (product.provider_sku) {
        console.log(`⚡ [FULFILLMENT] Digiflazz Flow for ${orderId}`);
        return await handleDigiflazzFulfillment(order);
    }

    // Case B: Manual Product (Redeem Codes)
    console.log(`📦 [FULFILLMENT] Manual/Redeem Flow for ${orderId}`);
    return await handleManualFulfillment(order);
}

/**
 * Handle Redeem Code delivery
 * 
 * FIX #3: Decrement product stock after successful delivery
 */
async function handleManualFulfillment(order: any) {
    try {
        const redeem = await prisma.redeemCode.findFirst({
            where: { productId: order.productId, used: false }
        });

        if (redeem) {
            // Mark code as used AND decrement stock in a transaction
            await prisma.$transaction([
                prisma.redeemCode.update({
                    where: { id: redeem.id },
                    data: { used: true }
                }),
                prisma.product.update({
                    where: { id: order.productId },
                    data: { stock: { decrement: 1 } }
                })
            ]);

            return { success: true, message: `🎁 Kode Redeem Anda:\n\`${redeem.code}\`\n\nTerima kasih sudah berbelanja! 💚` };
        } else {
            return { success: false, message: "❌ Maaf, stok kode redeem habis. Silakan hubungi admin @msbpstore untuk manual fulfillment." };
        }
    } catch (err) {
        console.error("Manual fulfillment error:", err);
        return { success: false, message: "Terjadi kesalahan saat mengambil kode redeem." };
    }
}

/**
 * Handle Digiflazz Top-up
 */
async function handleDigiflazzFulfillment(order: any) {
    try {
        const sku = order.product.provider_sku!;
        const target = order.customer_no || (order.custom_fields as any)?.user_id;

        if (!target) {
            return { success: false, message: "Target ID (User ID) tidak ditemukan untuk top-up." };
        }

        const res = await digiflazz.topup(sku, target, order.orderId);

        await prisma.order.update({
            where: { id: order.id },
            data: {
                provider_sn: res.sn || res.ref_id,
                provider_status: res.status
            }
        });

        return { success: true, message: `⚡ Top-up sedang diproses.\nSN: ${res.sn || 'Segera hadir'}\n\nTerima kasih sudah berbelanja! 💚` };
    } catch (err) {
        console.error("Digiflazz fulfillment error:", err);
        return { success: false, message: "Gagal memproses otomatis ke Digiflazz. Tenang, admin bakal proses manual." };
    }
}
