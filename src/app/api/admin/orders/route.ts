import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { stringifyBigInt, getClientIp } from "@/lib/utils";
import { checkRateLimit } from "@/lib/rate-limit";

async function checkAdmin() {
    const session = await auth();
    if (!session?.user?.email) return null;
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user || user.role !== "admin") return null;
    return user;
}

export async function GET(req: Request) {
    try {
        const session = await auth();
        const ip = getClientIp(req);
        
        // Use identity-aware identifier (user:id or ip:ip)
        const identifier = session?.user?.id ? `user:${session.user.id}` : `ip:${ip}`;
        const rl = await checkRateLimit(identifier, 'admin');
        
        if (!rl.allowed) return NextResponse.json({ error: "Terlalu banyak permintaan." }, { status: 429 });

        const admin = await checkAdmin();
        if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const orderId = searchParams.get("orderId");
        if (!orderId) return NextResponse.json({ error: "Order ID wajib." }, { status: 400 });

        const order = await prisma.order.findUnique({
            where: { orderId },
            include: { product: { include: { category: true } }, telegramUser: true, customerUser: true },
        });

        if (!order) return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });

        return NextResponse.json(stringifyBigInt({
            success: true,
            order,
        }));
    } catch (error) {
        console.error("Order GET Error:", error);
        return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await auth();
        const ip = getClientIp(req);
        
        // Use identity-aware identifier (user:id or ip:ip)
        const identifier = session?.user?.id ? `user:${session.user.id}` : `ip:${ip}`;
        const rl = await checkRateLimit(identifier, 'admin');
        
        if (!rl.allowed) return NextResponse.json({ error: "Terlalu banyak permintaan." }, { status: 429 });

        const admin = await checkAdmin();
        if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { orderId, status } = await req.json();
        if (!orderId || !status) return NextResponse.json({ error: "Order ID dan status wajib." }, { status: 400 });

        const validStatuses = ["PENDING", "PAID", "PROCESSING", "COMPLETED", "CANCELLED", "FAILED"];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: "Status tidak valid." }, { status: 400 });
        }

        const order = await prisma.order.update({
            where: { orderId },
            data: { status },
        });

        return NextResponse.json(stringifyBigInt({
            success: true,
            order
        }));
    } catch (error) {
        console.error("Order Update Error:", error);
        return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
    }
}
