import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const REDEEM_COST = 30; // Points needed
const DISCOUNT_VALUE = 5000; // Rp 5,000 Voucher

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            console.error(`Points API: Missing user ID in session for ${session?.user?.email || 'Unknown'}`);
            return NextResponse.json({ error: "Unauthorized: Missing identity" }, { status: 401 });
        }

        const user = await (prisma.user as any).findUnique({
            where: { id: BigInt(session.user.id as string) },
            select: { points: true, id: true }
        });

        if (!user) {
            console.error(`Points API: User not found with ID ${session.user.id} (Email: ${session.user.email})`);
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const pointHistory = await (prisma as any).pointTransaction.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
            take: 20
        });

        return NextResponse.json({
            points: (user as any).points,
            history: pointHistory.map((h: any) => ({
                ...h,
                id: h.id.toString(),
                userId: h.userId.toString()
            }))
        });
    } catch (err) {
        console.error("Points API Error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

/**
 * REDEEM 30 POINTS FOR VOUCHER
 */
export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = BigInt(session.user.id as string);

        const result = await prisma.$transaction(async (tx) => {
            // 🛡️ SECURITY: Atomic Update Pattern (Prevents Race Conditions)
            // We search for a user whose points are >= REDEEM_COST
            const updatedUser = await (tx.user as any).update({
                where: { 
                    id: userId,
                    points: { gte: REDEEM_COST } 
                },
                data: {
                    points: { decrement: REDEEM_COST }
                }
            }).catch(() => null);

            if (!updatedUser) {
                throw new Error(`Poin tidak cukup. Butuh ${REDEEM_COST} poin.`);
            }

            // 1. Generate Unique Voucher Code (8 characters entropy)
            const randomSuffix = crypto.randomBytes(4).toString("hex").toUpperCase();
            const voucherCode = `LOYAL-PT-${randomSuffix}`;

            // 2. Create Voucher in DB (Expires in 30 days)
            await (tx as any).voucher.create({
                data: {
                    code: voucherCode,
                    description: `Reward Loyalitas (Tukar 30 Poin)`,
                    discountType: "NOMINAL",
                    discountValue: DISCOUNT_VALUE,
                    perUserLimit: 1,
                    active: true,
                    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 Days expiry
                }
            });

            // 3. Log Point Transaction
            await (tx as any).pointTransaction.create({
                data: {
                    userId: userId,
                    amount: -REDEEM_COST,
                    type: "SPEND",
                    description: `Tukar Voucher Diskon: ${voucherCode}`
                }
            });

            return { code: voucherCode };
        });

        return NextResponse.json({
            success: true,
            message: `Berhasil menukar ${REDEEM_COST} Poin!`,
            voucherCode: result.code
        });

    } catch (err: any) {
        return NextResponse.json({ error: err.message || "Gagal menukar poin." }, { status: 400 });
    }
}
