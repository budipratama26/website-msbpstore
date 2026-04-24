import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { stringifyBigInt } from "@/lib/utils";

async function checkAdmin() {
    const session = await auth();
    if (!session?.user?.email) return null;
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user || user.role !== "admin") return null;
    return user;
}

export async function POST(req: Request) {
    try {
        const admin = await checkAdmin();
        if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { code, reward, productId } = await req.json();

        if (!code || !productId) {
            return NextResponse.json({ error: "Kode dan produk wajib diisi." }, { status: 400 });
        }

        let pId: bigint;
        try {
            pId = BigInt(productId);
        } catch (e) {
            return NextResponse.json({ error: "ID Produk tidak valid." }, { status: 400 });
        }

        // Verify product exists
        const product = await prisma.product.findUnique({ where: { id: pId } });
        if (!product) {
            return NextResponse.json({ error: "Produk dengan ID ini tidak ditemukan." }, { status: 404 });
        }

        const existing = await prisma.redeemCode.findUnique({ where: { code } });
        if (existing) {
            return NextResponse.json({ error: "Kode redeem sudah ada." }, { status: 409 });
        }

        const redeemCode = await prisma.redeemCode.create({
            data: {
                code: code.toUpperCase(),
                reward: reward || null,
                productId: pId,
            },
        });

        return NextResponse.json(stringifyBigInt({ success: true, redeemCode }));
    } catch (error) {
        console.error("RedeemCode Create Error:", error);
        return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const admin = await checkAdmin();
        if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "ID wajib." }, { status: 400 });

        await prisma.redeemCode.delete({ where: { id: BigInt(id) } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("RedeemCode Delete Error:", error);
        return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
    }
}
