import prisma from "@/lib/prisma";
import VouchersClient from "./VouchersClient";

export const dynamic = 'force-dynamic';

export default async function VouchersPage() {
    const vouchers = await (prisma as any).voucher.findMany({
        include: {
            category: { select: { id: true, name: true } },
            _count: { select: { usages: true } }
        },
        orderBy: { createdAt: "desc" }
    });

    const categories = await prisma.category.findMany({
        where: { active: true },
        select: { id: true, name: true },
        orderBy: { name: "asc" }
    });

    const serialized = vouchers.map((v: any) => ({
        id: v.id.toString(),
        code: v.code,
        description: v.description,
        discountType: v.discountType,
        discountValue: v.discountValue,
        maxDiscount: v.maxDiscount,
        minPurchase: v.minPurchase,
        usageLimit: v.usageLimit,
        usageCount: v.usageCount,
        perUserLimit: v.perUserLimit,
        active: v.active,
        expiresAt: v.expiresAt?.toISOString() || null,
        categoryId: v.categoryId?.toString() || null,
        categoryName: v.category?.name || null,
        totalUsages: v._count.usages,
        createdAt: v.createdAt.toISOString()
    }));

    const serializedCategories = categories.map(c => ({
        id: c.id.toString(),
        name: c.name
    }));

    return <VouchersClient initialVouchers={serialized} categories={serializedCategories} />;
}
