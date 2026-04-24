import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Schema for Banner validation
const bannerSchema = z.object({
    imageUrl: z.string().url("URL gambar tidak valid."),
    linkUrl: z.string().optional().or(z.literal("")),
    title: z.string().max(100, "Judul terlalu panjang (Maks 100 karakter).").optional(),
    active: z.boolean().optional().default(true),
    order: z.number().int().optional().default(0),
});

async function checkAdmin() {
    const session = await auth();
    return !!(session && (session.user as any)?.role === "admin");
}

// GET — ambil semua banner
export async function GET() {
    try {
        const banners = await prisma.banner.findMany({
            orderBy: { order: "asc" },
        });

        return NextResponse.json(
            banners.map((b) => ({
                id: b.id.toString(),
                imageUrl: b.imageUrl,
                linkUrl: b.linkUrl || "",
                title: b.title || "",
                active: b.active,
                order: b.order,
            }))
        );
    } catch (err) {
        return NextResponse.json({ error: "Gagal mengambil data." }, { status: 500 });
    }
}

// POST — tambah banner baru
export async function POST(req: NextRequest) {
    if (!(await checkAdmin())) {
        return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    try {
        const body = await req.json();
        const validatedData = bannerSchema.parse(body);

        const banner = await prisma.banner.create({
            data: validatedData,
        });

        return NextResponse.json({ id: banner.id.toString() }, { status: 201 });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
        }
        return NextResponse.json({ error: "Gagal menyimpan banner." }, { status: 500 });
    }
}

// PUT — update banner
export async function PUT(req: NextRequest) {
    if (!(await checkAdmin())) {
        return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { id, ...rest } = body;

        if (!id) return NextResponse.json({ error: "ID wajib diisi." }, { status: 400 });

        const validatedData = bannerSchema.parse(rest);

        await prisma.banner.update({
            where: { id: BigInt(id) },
            data: validatedData,
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
        }
        return NextResponse.json({ error: "Gagal mengupdate banner." }, { status: 500 });
    }
}

// DELETE — hapus banner
export async function DELETE(req: NextRequest) {
    if (!(await checkAdmin())) {
        return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    try {
        const id = req.nextUrl.searchParams.get("id");
        if (!id) return NextResponse.json({ error: "ID tidak ditemukan." }, { status: 400 });

        await prisma.banner.delete({ where: { id: BigInt(id) } });

        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: "Gagal menghapus banner." }, { status: 500 });
    }
}