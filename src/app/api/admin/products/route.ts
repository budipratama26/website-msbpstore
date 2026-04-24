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

export async function GET(req: Request) {
    try {
        const admin = await checkAdmin();
        if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            const products = await prisma.product.findMany({
                include: { category: true },
                orderBy: { id: "desc" },
            });
            return NextResponse.json(stringifyBigInt({ products }));
        }

        const product = await prisma.product.findUnique({
            where: { id: BigInt(id) },
            include: { category: true },
        });

        if (!product) return NextResponse.json({ error: "Produk tidak ditemukan." }, { status: 404 });

        return NextResponse.json(stringifyBigInt({
            success: true,
            product,
        }));
    } catch (error) {
        console.error("Product GET Error:", error);
        return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const admin = await checkAdmin();
        if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { name, description, image, price, stock, categoryId, active } = await req.json();

        if (!name || price === undefined) {
            return NextResponse.json({ error: "Nama dan harga wajib diisi." }, { status: 400 });
        }

        const product = await prisma.product.create({
            data: {
                name,
                description: description || null,
                image: image || null,
                price: parseInt(price),
                stock: parseInt(stock) || 0,
                categoryId: categoryId ? BigInt(categoryId) : null,
                active: active !== undefined ? active : true,
            },
        });

        return NextResponse.json(stringifyBigInt({ success: true, product }));
    } catch (error) {
        console.error("Product Create Error:", error);
        return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const admin = await checkAdmin();
        if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id, name, description, image, price, stock, categoryId, active } = await req.json();
        if (!id) return NextResponse.json({ error: "ID produk wajib." }, { status: 400 });

        const product = await prisma.product.update({
            where: { id: BigInt(id) },
            data: {
                ...(name !== undefined && { name }),
                ...(description !== undefined && { description }),
                ...(image !== undefined && { image }),
                ...(price !== undefined && { price: parseInt(price) }),
                ...(stock !== undefined && { stock: parseInt(stock) }),
                ...(categoryId !== undefined && { categoryId: categoryId ? BigInt(categoryId) : null }),
                ...(active !== undefined && { active }),
            },
        });

        return NextResponse.json(stringifyBigInt({ success: true, product }));
    } catch (error) {
        console.error("Product Update Error:", error);
        return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const admin = await checkAdmin();
        if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "ID produk wajib." }, { status: 400 });

        const orderCount = await prisma.order.count({ where: { productId: BigInt(id) } });
        if (orderCount > 0) {
            return NextResponse.json({ error: `Produk ini terkait dengan ${orderCount} pesanan. Tidak bisa dihapus.` }, { status: 409 });
        }

        await prisma.redeemCode.deleteMany({ where: { productId: BigInt(id) } });
        await prisma.product.delete({ where: { id: BigInt(id) } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Product Delete Error:", error);
        return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
    }
}
