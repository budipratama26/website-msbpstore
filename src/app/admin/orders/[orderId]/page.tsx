import prisma from "@/lib/prisma";
import OrderDetailClient from "./OrderDetailClient";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
    const { orderId } = await params;

    const order = await prisma.order.findUnique({
        where: { orderId },
        include: { product: { include: { category: true } }, telegramUser: true, customerUser: true },
    });

    if (!order) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-slate-400 text-lg font-bold">Pesanan tidak ditemukan.</p>
            </div>
        );
    }

    const serialized = {
        ...order,
        id: order.id.toString(),
        productId: order.productId.toString(),
        telegramUserId: order.telegramUserId?.toString() || null,
        customerUserId: order.customerUserId?.toString() || null,
        product: order.product ? { ...order.product, id: order.product.id.toString(), categoryId: order.product.categoryId?.toString() || null, category: order.product.category ? { ...order.product.category, id: order.product.category.id.toString() } : null } : null,
        telegramUser: order.telegramUser ? { ...order.telegramUser, id: order.telegramUser.id.toString(), telegramId: order.telegramUser.telegramId.toString() } : null,
        customerUser: order.customerUser ? { ...order.customerUser, id: order.customerUser.id.toString() } : null,
        // Derive display name for the order
        buyerName: order.telegramUser
            ? `@${order.telegramUser.username || order.telegramUser.firstName || 'Telegram User'}`
            : order.customerUser?.name || order.customer_email || 'Guest',
        buyerSource: order.telegramUser ? 'telegram' : 'web',
    };

    return <OrderDetailClient order={serialized} />;
}
