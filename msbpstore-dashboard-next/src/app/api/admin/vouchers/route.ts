import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

// GET — List all vouchers
export async function GET() {
    try {
        const session = await auth();
        if (!session || (session.user as any)?.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const vouchers = await prisma.voucher.findMany({
            include: {
                category: { select: { id: true, name: true } },
                _count: { select: { usages: true } }
            },
            orderBy: { createdAt: "desc" }
        });

        const serialized = vouchers.map(v => ({
            ...v,
            id: v.id.toString(),
            categoryId: v.categoryId?.toString() || null,
            discountValue: v.discountValue,
            maxDiscount: v.maxDiscount,
            minPurchase: v.minPurchase,
            usageLimit: v.usageLimit,
            usageCount: v.usageCount,
            perUserLimit: v.perUserLimit,
            category: v.category ? { id: v.category.id.toString(), name: v.category.name } : null,
            totalUsages: v._count.usages
        }));

        return NextResponse.json(serialized);
    } catch (error) {
        console.error("GET /api/admin/vouchers error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// POST — Create new voucher
export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session || (session.user as any)?.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const {
            code,
            description,
            discountType,
            discountValue,
            maxDiscount,
            minPurchase,
            usageLimit,
            perUserLimit,
            categoryId,
            expiresAt,
            active
        } = body;

        if (!code || !discountValue) {
            return NextResponse.json({ error: "Kode voucher dan nilai diskon wajib diisi." }, { status: 400 });
        }

        // Check unique code
        const existing = await prisma.voucher.findUnique({ where: { code: code.toUpperCase() } });
        if (existing) {
            return NextResponse.json({ error: "Kode voucher sudah digunakan." }, { status: 409 });
        }

        const voucher = await prisma.voucher.create({
            data: {
                code: code.toUpperCase().trim(),
                description: description || null,
                discountType: discountType || "NOMINAL",
                discountValue: parseInt(discountValue),
                maxDiscount: maxDiscount ? parseInt(maxDiscount) : null,
                minPurchase: minPurchase ? parseInt(minPurchase) : null,
                usageLimit: usageLimit ? parseInt(usageLimit) : null,
                perUserLimit: perUserLimit ? parseInt(perUserLimit) : 1,
                categoryId: categoryId ? BigInt(categoryId) : null,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                active: active !== false
            }
        });

        return NextResponse.json({
            success: true,
            id: voucher.id.toString(),
            code: voucher.code
        });
    } catch (error) {
        console.error("POST /api/admin/vouchers error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// PUT — Update voucher
export async function PUT(req: Request) {
    try {
        const session = await auth();
        if (!session || (session.user as any)?.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { id, ...data } = body;

        if (!id) {
            return NextResponse.json({ error: "ID voucher wajib." }, { status: 400 });
        }

        // If code is changing, check uniqueness
        if (data.code) {
            const existing = await prisma.voucher.findFirst({
                where: {
                    code: data.code.toUpperCase(),
                    id: { not: BigInt(id) }
                }
            });
            if (existing) {
                return NextResponse.json({ error: "Kode voucher sudah digunakan." }, { status: 409 });
            }
        }

        const updateData: any = {};
        if (data.code) updateData.code = data.code.toUpperCase().trim();
        if (data.description !== undefined) updateData.description = data.description || null;
        if (data.discountType) updateData.discountType = data.discountType;
        if (data.discountValue !== undefined) updateData.discountValue = parseInt(data.discountValue);
        if (data.maxDiscount !== undefined) updateData.maxDiscount = data.maxDiscount ? parseInt(data.maxDiscount) : null;
        if (data.minPurchase !== undefined) updateData.minPurchase = data.minPurchase ? parseInt(data.minPurchase) : null;
        if (data.usageLimit !== undefined) updateData.usageLimit = data.usageLimit ? parseInt(data.usageLimit) : null;
        if (data.perUserLimit !== undefined) updateData.perUserLimit = parseInt(data.perUserLimit) || 1;
        if (data.categoryId !== undefined) updateData.categoryId = data.categoryId ? BigInt(data.categoryId) : null;
        if (data.expiresAt !== undefined) updateData.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
        if (data.active !== undefined) updateData.active = data.active;

        await prisma.voucher.update({
            where: { id: BigInt(id) },
            data: updateData
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("PUT /api/admin/vouchers error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// DELETE — Delete voucher
export async function DELETE(req: Request) {
    try {
        const session = await auth();
        if (!session || (session.user as any)?.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID voucher wajib." }, { status: 400 });
        }

        await prisma.voucher.delete({ where: { id: BigInt(id) } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/admin/vouchers error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
