import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/utils";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        const { orderId } = await params;
        const ip = getClientIp(request);

        // 🛡️ SECURITY FIX: Brute-force protection for order lookups.
        // Even with unguessable IDs, we limit attempts to prevent scrapers.
        const rl = await checkRateLimit(`ip:${ip}`, 'gen'); 
        if (!rl.allowed) return NextResponse.json({ error: "Terlalu banyak permintaan. Silakan tunggu sebentar." }, { status: 429 });

        if (!orderId) {
            return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
        }

        const order = await prisma.order.findUnique({
            where: { orderId: orderId },
            include: {
                product: {
                    select: {
                        name: true,
                        category: {
                            select: { name: true }
                        }
                    }
                }
            }
        });

        if (!order) {
            return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
        }

        // 11. Data Exposure: Return only public, safe fields
        return NextResponse.json({
            orderId: order.orderId,
            status: order.status,
            productName: order.product?.name || "Produk",
            categoryName: order.product?.category?.name || "Kategori",
            createdAt: order.createdAt,
            // provider_sn only if status is SUCCESS
            sn: order.status === "SUCCESS" ? order.provider_sn : null,
        });

    } catch (error) {
        console.error("Public Order Status Error:", error);
        return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
    }
}
