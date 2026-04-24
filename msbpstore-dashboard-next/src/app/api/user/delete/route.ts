import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function DELETE(req: Request) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Cari user berdasarkan email
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });
        }

        // Cek apakah masih ada order PENDING
        const pendingOrders = await prisma.order.count({
            where: {
                customerUserId: user.id,
                status: "PENDING"
            }
        });

        if (pendingOrders > 0) {
            return NextResponse.json({
                error: `Anda masih memiliki ${pendingOrders} pesanan aktif. Tunggu sampai semua pesanan selesai atau dibatalkan sebelum menghapus akun.`
            }, { status: 400 });
        }

        // Hapus akun
        await prisma.user.delete({
            where: { email: session.user.email },
        });

        return NextResponse.json({
            success: true,
            message: "Akun berhasil dihapus."
        });

    } catch (error) {
        console.error("Account Deletion Error:", error);
        return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
    }
}
