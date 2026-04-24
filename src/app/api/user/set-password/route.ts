import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { password } = await req.json();
        if (!password || password.length < 6) {
            return NextResponse.json({ error: "Sandi minimal 6 karakter." }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: BigInt(session.user.id) },
            select: { password: true }
        });

        if (user?.password) {
            const isSamePassword = await bcrypt.compare(password, user.password);
            if (isSamePassword) {
                return NextResponse.json({ error: "Password baru tidak boleh sama dengan password saat ini." }, { status: 400 });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.update({
            where: { id: BigInt(session.user.id) },
            data: { password: hashedPassword },
        });

        return NextResponse.json({ success: true, message: "Sandi berhasil diset." });
    } catch (error) {
        console.error("Set Password Error:", error);
        return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
    }
}
