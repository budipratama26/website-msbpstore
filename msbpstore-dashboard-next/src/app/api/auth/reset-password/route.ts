import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

// 16. Input Validation Schema
const resetPasswordSchema = z.object({
    token: z.string().min(10).max(100),
    newPassword: z.string().min(8).max(100),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        
        // 16. Validate input with Zod
        const validation = resetPasswordSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ 
                error: validation.error.issues[0].message 
            }, { status: 400 });
        }

        const { token, newPassword } = validation.data;

        const user = await prisma.user.findFirst({
            where: {
                reset_password_token: token,
                reset_password_expires: {
                    gt: new Date(),
                },
            },
        });

        if (!user) {
            return NextResponse.json({ error: "Token tidak valid atau telah kedaluwarsa." }, { status: 400 });
        }

        if (user.password) {
            const isSamePassword = await bcrypt.compare(newPassword, user.password);
            if (isSamePassword) {
                return NextResponse.json({ error: "Password baru tidak boleh sama dengan password saat ini." }, { status: 400 });
            }
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                reset_password_token: null,
                reset_password_expires: null,
            },
        });

        // 11. Data Exposure: Return minimal info
        return NextResponse.json({
            success: true,
            message: "Password berhasil diperbarui. Silakan login kembali."
        });

    } catch (error) {
        // 17. Error Handling: Log internally, generic message
        console.error("Reset Password Error:", error);
        return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
    }
}
