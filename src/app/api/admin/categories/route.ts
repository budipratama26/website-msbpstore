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

        if (id) {
            const category = await prisma.category.findUnique({
                where: { id: BigInt(id) },
            });
            if (!category) return NextResponse.json({ error: "Kategori tidak ditemukan." }, { status: 404 });
            return NextResponse.json(stringifyBigInt({ success: true, category }));
        }

        const categories = await prisma.category.findMany({
            orderBy: { name: 'asc' },
        });

        return NextResponse.json(stringifyBigInt({ categories }));
    } catch (error) {
        console.error("Category GET Error:", error);
        return NextResponse.json({ error: "Gagal mengambil kategori." }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const admin = await checkAdmin();
        if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { name, slug, image, description, keywords, fields, active, platform } = body;

        if (!name || !slug) {
            return NextResponse.json({ error: "Nama dan slug wajib diisi." }, { status: 400 });
        }

        const existing = await prisma.category.findUnique({ where: { slug } });
        if (existing) {
            return NextResponse.json({ error: "Slug sudah digunakan." }, { status: 409 });
        }

        const category = await prisma.category.create({
            data: {
                name,
                slug,
                image: image || null,
                description: description || null,
                keywords: keywords || null,
                fields: fields || null,
                active: active !== undefined ? active : true,
                platform: platform || "BOTH",
            },
        });

        return NextResponse.json(stringifyBigInt({ success: true, category }));
    } catch (error) {
        console.error("Category Create Error:", error);
        return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const admin = await checkAdmin();
        if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { id, name, slug, image, description, keywords, fields, active, platform } = body;

        if (!id) return NextResponse.json({ error: "ID kategori wajib." }, { status: 400 });

        const category = await prisma.category.update({
            where: { id: BigInt(id) },
            data: {
                ...(name !== undefined && { name }),
                ...(slug !== undefined && { slug }),
                ...(image !== undefined && { image }),
                ...(description !== undefined && { description }),
                ...(keywords !== undefined && { keywords }),
                ...(fields !== undefined && { fields }),
                ...(active !== undefined && { active }),
                ...(platform !== undefined && { platform }),
            },
        });

        return NextResponse.json(stringifyBigInt({ success: true, category }));
    } catch (error) {
        console.error("Category Update Error:", error);
        return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const admin = await checkAdmin();
        if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "ID kategori wajib." }, { status: 400 });

        const productCount = await prisma.product.count({ where: { categoryId: BigInt(id) } });
        if (productCount > 0) {
            return NextResponse.json({ error: `Kategori masih memiliki ${productCount} produk. Hapus produk terlebih dahulu.` }, { status: 409 });
        }

        await prisma.category.delete({ where: { id: BigInt(id) } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Category Delete Error:", error);
        return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
    }
}
