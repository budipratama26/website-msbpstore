import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";

const setPasswordSchema = z.object({
    password: z.string()
        .min(8, "Password minimal 8 karakter.")
        .max(100)
        .refine(val => /[A-Z]/.test(val), "Password harus mengandung minimal 1 huruf besar.")
        .refine(val => /[a-z]/.test(val), "Password harus mengandung minimal 1 huruf kecil.")
        .refine(val => /[0-9]/.test(val), "Password harus mengandung minimal 1 angka."),
});
export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        
        const validation = setPasswordSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
        }
        
        const { password } = validation.data;

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
