import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

// ═══════════════════════════════════════════════════════════
// RATE LIMITER: In-memory store to prevent voucher brute force
// Limits: 5 attempts per IP per 60 seconds
// ═══════════════════════════════════════════════════════════
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 60 * 1000; // 60 seconds

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    // Cleanup expired entries periodically
    if (rateLimitMap.size > 10000) {
        for (const [key, val] of rateLimitMap) {
            if (val.resetAt < now) rateLimitMap.delete(key);
        }
    }

    if (!entry || entry.resetAt < now) {
        rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
        return false;
    }

    entry.count++;
    if (entry.count > RATE_LIMIT_MAX) {
        return true;
    }
    return false;
}

/**
 * POST /api/voucher/validate
 * Validates a voucher code and returns discount info.
 * Rate limited to prevent brute force code guessing.
 */
export async function POST(req: Request) {
    try {
        // Rate limiting by IP
        const forwarded = req.headers.get("x-forwarded-for");
        const ip = forwarded?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";

        if (isRateLimited(ip)) {
            console.warn(`[VOUCHER LIMIT] IP ${ip} blocked (Brute-force protection)`);
            return NextResponse.json(
                { valid: false, message: "Terlalu banyak percobaan. Coba lagi dalam 1 menit." },
                { status: 429 }
            );
        }

        const body = await req.json();
        const { code, productPrice, categoryId } = body;

        if (!code || typeof code !== "string" || code.length > 50) {
            return NextResponse.json({ valid: false, message: "Kode voucher tidak valid." }, { status: 400 });
        }

        if (!productPrice || typeof productPrice !== "number" || productPrice <= 0) {
            return NextResponse.json({ valid: false, message: "Harga produk tidak valid." }, { status: 400 });
        }

        const session = await auth();

        // 1. Find voucher
        const voucher = await (prisma as any).voucher.findUnique({
            where: { code: code.toUpperCase().trim() }
        });

        if (!voucher) {
            return NextResponse.json({ valid: false, message: "Kode voucher tidak ditemukan." });
        }

        // 2. Check active
        if (!voucher.active) {
            return NextResponse.json({ valid: false, message: "Voucher sudah tidak aktif." });
        }

        // 3. Check expiry
        if (voucher.expiresAt && new Date() > voucher.expiresAt) {
            return NextResponse.json({ valid: false, message: "Voucher sudah kadaluarsa." });
        }

        // 4. Check total usage limit
        if (voucher.usageLimit !== null && voucher.usageCount >= voucher.usageLimit) {
            return NextResponse.json({ valid: false, message: "Voucher sudah mencapai batas pemakaian." });
        }

        // 5. Check category scope
        if (voucher.categoryId && categoryId) {
            if (voucher.categoryId.toString() !== categoryId.toString()) {
                return NextResponse.json({ valid: false, message: "Voucher tidak berlaku untuk kategori ini." });
            }
        }

        // 6. Check minimum purchase
        if (voucher.minPurchase && productPrice < voucher.minPurchase) {
            return NextResponse.json({
                valid: false,
                message: `Minimum pembelian Rp ${voucher.minPurchase.toLocaleString("id-ID")} untuk voucher ini.`
            });
        }

        // 7. Check per-user usage limit (logged-in users)
        if (session?.user?.id) {
            const userUsageCount = await (prisma as any).voucherUsage.count({
                where: {
                    voucherId: voucher.id,
                    userId: BigInt(session.user.id)
                }
            });
            if (userUsageCount >= voucher.perUserLimit) {
                return NextResponse.json({ valid: false, message: "Anda sudah menggunakan voucher ini sebelumnya." });
            }
        }

        // 8. Calculate discount (preview only, NOT committed)
        let discount = 0;
        if (voucher.discountType === "PERCENTAGE") {
            discount = Math.floor(productPrice * voucher.discountValue / 100);
            if (voucher.maxDiscount && discount > voucher.maxDiscount) {
                discount = voucher.maxDiscount;
            }
        } else {
            // NOMINAL
            discount = voucher.discountValue;
        }

        // Ensure discount doesn't exceed product price
        if (discount >= productPrice) {
            discount = productPrice - 1; // minimal bayar Rp 1
        }

        const finalPrice = productPrice - discount;

        // Don't expose voucher internal ID to client
        return NextResponse.json({
            valid: true,
            discount,
            finalPrice,
            discountType: voucher.discountType,
            discountValue: voucher.discountValue,
            message: `Diskon Rp ${discount.toLocaleString("id-ID")} berhasil diterapkan!`
        });

    } catch (error) {
        console.error("Voucher validate error:", error);
        return NextResponse.json({ valid: false, message: "Terjadi kesalahan server." }, { status: 500 });
    }
}
