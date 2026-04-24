import prisma from "@/lib/prisma";
import OrdersClient from "./OrdersClient";

export const dynamic = "force-dynamic";

export default async function OrdersAdminPage() {
    const orders = await prisma.order.findMany({
        include: { product: true, telegramUser: true, customerUser: true },
        orderBy: { createdAt: 'desc' }
    });

    const serialized = orders.map(o => ({
        orderId: o.orderId,
        status: o.status,
        customer_email: o.customer_email,
        target: (() => {
            if (o.customer_no) return o.customer_no;
            if (o.custom_fields && typeof o.custom_fields === 'object') {
                return Object.entries(o.custom_fields)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(', ');
            }
            return '-';
        })(),
        createdAt: o.createdAt.toISOString(),
        productName: o.product?.name || "Unknown",
        // Determine user display name and source
        userName: o.telegramUser
            ? `@${o.telegramUser.username || o.telegramUser.firstName || 'Telegram User'}`
            : o.customerUser?.name || null,
        buyerSource: o.telegramUser ? 'telegram' : 'web',
    }));

    return <OrdersClient initialOrders={serialized} />;
}
