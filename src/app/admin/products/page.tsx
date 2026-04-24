import prisma from "@/lib/prisma";
import ProductsClient from "./ProductsClient";

export const dynamic = "force-dynamic";

export default async function ProductsAdminPage() {
    const products = await prisma.product.findMany({
        include: { category: true },
        orderBy: { id: 'desc' }
    });

    const serialized = products.map(p => ({
        ...p,
        id: p.id.toString(),
        categoryId: p.categoryId?.toString() || null,
    }));

    return <ProductsClient initialProducts={serialized} />;
}
