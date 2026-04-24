import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

const adjustSchema = z.object({
    userId: z.string(),
    amount: z.number(), // Positive or negative
});

/**
 * ADMIN POINTS ADJUSTMENT API
 * POST: Manually add or subtract points from a user
 */
export async function POST(req: Request) {
    try {
        const session = await auth();
        
        // 🛡️ SECURITY: Only Admin can access
        if (!session?.user || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const validation = adjustSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: "Invalid data" }, { status: 400 });
        }

        const { userId, amount } = validation.data;

        await prisma.$transaction(async (tx) => {
            // 1. Update User points
            await (tx.user as any).update({
                where: { id: BigInt(userId) },
                data: { points: { increment: amount } }
            });

            // 2. Log Point Transaction
            await (tx as any).pointTransaction.create({
                data: {
                    userId: BigInt(userId),
                    amount: amount,
                    type: "ADJUST",
                    description: `Manual adjustment by Admin (${session.user?.name})`
                }
            });
        });

        return NextResponse.json({ success: true, message: "Poin berhasil disesuaikan." });

    } catch (err: any) {
        console.error("Admin Points Error:", err);
        return NextResponse.json({ error: err.message || "Gagal menyesuaikan poin." }, { status: 500 });
    }
}
