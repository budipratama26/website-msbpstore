import prisma from "@/lib/prisma";
import CategoriesClient from "./CategoriesClient";

export const dynamic = "force-dynamic";

export default async function CategoriesAdminPage() {
    const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' },
        include: { _count: { select: { products: true } } },
    });

    const serialized = categories.map(c => ({
        ...c,
        id: c.id.toString(),
    }));

    return <CategoriesClient initialCategories={serialized} />;
}
