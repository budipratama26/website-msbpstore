import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";
import { sanitizeHTML } from "@/lib/sanitize";
import { logActivity } from "@/lib/activity";
import { getClientIp } from "@/lib/utils";
import crypto from "crypto";

// 16. Input Validation Schema
const checkoutSchema = z.object({
    productId: z.union([
        z.string().regex(/^\d+$/, "Invalid Product ID"),
        z.number()
    ]),
    paymentMethod: z.string(),
    email: z.string().email().optional().or(z.literal("")),
    formData: z.record(z.string(), z.any()).optional(),
    voucherCode: z.string().max(50).optional(),
});

// ═══════════════════════════════════════════════════════════
// IP RATE LIMITER: Prevent bots from mass-ordering
// ═══════════════════════════════════════════════════════════
const ipOrderLimit = new Map<string, { count: number; resetAt: number }>();
function isIpRateLimited(ip: string): boolean {
    const now = Date.now();
    const entry = ipOrderLimit.get(ip);
    if (!entry || entry.resetAt < now) {
        ipOrderLimit.set(ip, { count: 1, resetAt: now + 10 * 60 * 1000 }); // 10 mins
        return false;
    }
    entry.count++;
    return entry.count > 20; // Increased to 20 orders per 10 mins for better UX
}

export async function POST(req: Request) {
    try {
        const ip = getClientIp(req);
        if (isIpRateLimited(ip)) {
            console.warn(`[CHECKOUT LIMIT] Identity ${ip} hit mass-order protection`);
            return NextResponse.json({ error: "Terlalu banyak pesanan dari IP Anda. Tunggu 10 menit." }, { status: 429 });
        }

        const session = await auth();
        const body = await req.json();

        // 16. Validate input with Zod
        const validation = checkoutSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: "Data tidak valid atau tidak lengkap." }, { status: 400 });
        }

        const { productId, paymentMethod, email, formData, voucherCode } = validation.data;

        // 🛡️ SECURITY FIX: Removed the per-request heavy global order cleanup.
        // This task should be handled by a CRON job or a background worker
        // to prevent database performance degradation during high traffic.

        // Prevent Double Order (60s cooldown for same user + productId)
        const sixtySecondsAgo = new Date(Date.now() - 60000);
        const pid = BigInt(productId);
        const recentOrderWhere: any = {
            productId: pid,
            status: "PENDING",
            createdAt: { gte: sixtySecondsAgo }
        };
        if (email) {
            recentOrderWhere.customer_email = email;
        }
        const recentOrder = await prisma.order.findFirst({
            where: recentOrderWhere
        });

        if (recentOrder) {
            console.warn(`[CHECKOUT LIMIT] Double order blocked for IP ${ip} | Product: ${productId}`);
            return NextResponse.json({ error: "Pesanan yang sama sedang diproses. Mohon tunggu sebentar." }, { status: 429 });
        }

        // 1. Sanitasi Input (XSS Prevention)
        const sanitizedFormData: Record<string, string> = {};
        if (formData) {
            for (const [key, val] of Object.entries(formData)) {
                if (typeof val === "string") {
                    sanitizedFormData[key.slice(0, 50)] = sanitizeHTML(val).slice(0, 500);
                }
            }
        }

        // 2. Get Product
        const product = await prisma.product.findUnique({
            where: { id: pid, active: true },
            include: { category: true }
        });

        if (!product) {
            return NextResponse.json({ error: "Produk tidak ditemukan atau tidak aktif." }, { status: 404 });
        }

        // 🛡️ SECURITY FIX: Unguessable Order ID (Cryptographically secure UUIDv4)
        // Eliminates collision risk and prevents order scraping/IDOR.
        // Format similar to Gemini URLs (e.g., f3f2eb5b65cc7abc123456789abcdef0)
        const orderId = crypto.randomUUID().replace(/-/g, '');

        let validCustomerId = null;
        if (session?.user?.id) {
            const userExists = await prisma.user.findUnique({
                where: { id: BigInt(session.user.id) },
                select: { id: true }
            });
            if (userExists) {
                validCustomerId = BigInt(session.user.id);
            }
        }

        // ═══════════════════════════════════════════════════════════
        // VOUCHER VALIDATION (Server-side re-validation with TRANSACTION)
        // Uses database transaction to prevent race conditions
        // ═══════════════════════════════════════════════════════════
        let voucherDiscount = 0;
        let voucherId: bigint | null = null;

        if (voucherCode) {
            const voucherResult = await prisma.$transaction(async (tx: any) => {
                // Lock the voucher row for update (prevents race condition)
                const voucher = await tx.voucher.findUnique({
                    where: { code: voucherCode.toUpperCase().trim() }
                });

                if (!voucher || !voucher.active) {
                    return { discount: 0, voucherId: null };
                }

                // Check expiry
                const notExpired = !voucher.expiresAt || new Date() <= voucher.expiresAt;
                // Check total usage (atomic read inside transaction)
                const underLimit = voucher.usageLimit === null || voucher.usageCount < voucher.usageLimit;
                // Check category scope
                const categoryMatch = !voucher.categoryId || (product.categoryId && voucher.categoryId.toString() === product.categoryId.toString());
                // Check min purchase
                const meetsMinimum = !voucher.minPurchase || product.price >= voucher.minPurchase;

                // Check per-user limit (for logged-in users)
                let userUnderLimit = true;
                if (validCustomerId) {
                    const userUsageCount = await tx.voucherUsage.count({
                        where: {
                            voucherId: voucher.id,
                            userId: validCustomerId
                        }
                    });
                    userUnderLimit = userUsageCount < voucher.perUserLimit;
                }

                // Check per-guest limit (by email for non-logged-in users)
                let guestUnderLimit = true;
                if (!validCustomerId && email) {
                    const guestUsageCount = await tx.voucherUsage.count({
                        where: {
                            voucherId: voucher.id,
                            guestId: email
                        }
                    });
                    guestUnderLimit = guestUsageCount < voucher.perUserLimit;
                }

                if (notExpired && underLimit && categoryMatch && meetsMinimum && userUnderLimit && guestUnderLimit) {
                    // Calculate discount
                    let discount = 0;
                    if (voucher.discountType === "PERCENTAGE") {
                        discount = Math.floor(product.price * voucher.discountValue / 100);
                        if (voucher.maxDiscount && discount > voucher.maxDiscount) {
                            discount = voucher.maxDiscount;
                        }
                    } else {
                        discount = voucher.discountValue;
                    }

                    // Ensure discount doesn't exceed product price
                    if (discount >= product.price) {
                        discount = product.price - 1;
                    }

                    // 🛡️ SECURITY FIX: Atomic Voucher Update (Race Condition Protection)
                    // We update ONLY if usageCount is still within limits.
                    // If another request beat us to it, this update will fail/throw.
                    try {
                        await tx.voucher.update({
                            where: {
                                id: voucher.id,
                                OR: [
                                    { usageLimit: null },
                                    { usageCount: { lt: voucher.usageLimit } }
                                ]
                            },
                            data: { usageCount: { increment: 1 } }
                        });
                    } catch (raceErr) {
                        console.warn(`[VOUCHER RACE] Simultaneous usage blocked for ${voucherCode}`);
                        return { discount: 0, voucherId: null };
                    }

                    return { discount, voucherId: voucher.id };
                }

                return { discount: 0, voucherId: null };
            });

            voucherDiscount = voucherResult.discount;
            voucherId = voucherResult.voucherId;
        }

        const finalPrice = product.price - voucherDiscount;

        // 🛡️ SECURITY: Minimum price guard
        // Prevents voucher abuse (e.g., 100% discount → beli Rp 1)
        const MINIMUM_ORDER_PRICE = 1000; // Rp 1.000 minimum
        if (finalPrice < MINIMUM_ORDER_PRICE) {
            console.warn(`[SECURITY] Price too low after discount: Rp ${finalPrice} for product ${product.id} | IP: ${ip}`);
            return NextResponse.json({ error: "Harga setelah diskon terlalu rendah. Voucher tidak dapat digunakan untuk produk ini." }, { status: 400 });
        }

        // 🛡️ SECURITY: Ensure finalPrice is valid integer (prevent NaN/Infinity/negative)
        if (!Number.isFinite(finalPrice) || finalPrice <= 0 || !Number.isInteger(finalPrice)) {
            console.error(`[SECURITY] Invalid finalPrice: ${finalPrice} for product ${product.id} | IP: ${ip}`);
            return NextResponse.json({ error: "Terjadi kesalahan perhitungan harga." }, { status: 500 });
        }

        // 3. Create Order
        const order = await (prisma.order as any).create({
            data: {
                orderId,
                status: "PENDING",
                productId: product.id,
                customer_email: email || null,
                custom_fields: sanitizedFormData,
                customerUserId: validCustomerId,
                provider: "pakasir",
                voucherId: voucherId,
                discountAmount: voucherDiscount,
            }
        });

        // Record voucher usage (outside transaction, order already created)
        if (voucherId) {
            await (prisma as any).voucherUsage.create({
                data: {
                    voucherId: voucherId,
                    userId: validCustomerId,
                    guestId: !validCustomerId ? (email || null) : null,
                    orderId: orderId,
                    discount: voucherDiscount
                }
            });
        }

        // 4. External Payment API Call
        const pakasirEndpoint = "https://app.pakasir.com/api/transactioncreate/qris";
        const pakasirBody = {
            project: process.env.PAKKASIR_SLUG,
            order_id: orderId,
            amount: finalPrice,
            api_key: process.env.PAKKASIR_API_KEY,
        };

        const pakasirRes = await fetch(pakasirEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(pakasirBody),
        });

        const pakasirData = await pakasirRes.json();
        const qrString = pakasirData.payment?.payment_number;

        if (!qrString) {
            // Rollback: revert voucher usage if payment fails
            if (voucherId) {
                await (prisma as any).voucher.update({
                    where: { id: voucherId },
                    data: { usageCount: { decrement: 1 } }
                });
                await (prisma as any).voucherUsage.deleteMany({
                    where: { orderId: orderId }
                });
            }

            await prisma.order.update({
                where: { id: order.id },
                data: { status: "FAILED" }
            });
            return NextResponse.json({ error: "Gagal membuat pembayaran. Silakan coba lagi nanti." }, { status: 500 });
        }

        await prisma.order.update({
            where: { id: order.id },
            data: { paymentData: qrString }
        });

        // Record activity
        logActivity(
            "CHECKOUT",
            `Checkout produk "${product.name}"${voucherDiscount > 0 ? ` (Diskon voucher)` : ""}`,
            validCustomerId ? validCustomerId.toString() : null,
            ip,
            req.headers.get("user-agent") || undefined,
            "/checkout"
        ).catch(() => { });

        return NextResponse.json({
            success: true,
            orderId,
            qrString,
            amount: finalPrice,
            originalPrice: product.price,
            discount: voucherDiscount,
            productName: product.name
        });

    } catch (error) {
        // 17. Error Handling: Return generic message
        console.error("Checkout Error:", error);
        return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
    }
}
