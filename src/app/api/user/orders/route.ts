import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Ambil data user dari database berdasarkan email di sesi
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Performance Optimization: Removed synchronous updateMany. 
        // Status is recalculated on frontend, and sync'd via Webhooks.

        // Ambil riwayat order berdasarkan customerUserId (ini field yang benar untuk link ke User)
        // Jika schema berbeda, pastikan field mencocokkan model Order di prisma/schema.prisma
        const orders = await prisma.order.findMany({
            where: {
                customerUserId: user.id
            },
            orderBy: {
                createdAt: "desc"
            },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        category: {
                            select: {
                                name: true,
                                slug: true,
                                image: true
                            }
                        }
                    }
                }
            }
        });

        // Transform data untuk memudahkan frontend
        const formattedOrders = orders.map(order => {
            let targetString = order.customer_no || "-";
            if (!order.customer_no && order.custom_fields && typeof order.custom_fields === 'object') {
                const values = Object.values(order.custom_fields).filter(v => v);
                if (values.length === 1) {
                    targetString = String(values[0]);
                } else if (values.length >= 2) {
                    targetString = `${values[0]} (${values.slice(1).join(', ')})`;
                }
            }

            return {
                id: order.orderId,
                productName: order.product?.name || "Produk dihapus",
                productCategory: order.product?.category?.name || "Kategori dihapus",
                categorySlug: order.product?.category?.slug || "",
                categoryImage: order.product?.category?.image || null,
                productId: order.product?.id ? order.product.id.toString() : null,
                target: targetString,
                customFields: order.custom_fields || {},
                price: order.product?.price || 0,
                status: order.status,
                createdAt: order.createdAt,
                paymentData: order.paymentData,
            };
        });

        return NextResponse.json(formattedOrders);
    } catch (error) {
        console.error("Fetch User Orders Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
