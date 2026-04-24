import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";

// 16. Input Validation Schema
const profileSchema = z.object({
    name: z.string().min(2).max(50).optional(),
    oldPassword: z.string().optional(),
    newPassword: z.string().min(8).max(100).optional(),
    confirmPassword: z.string().optional(),
}).refine((data) => {
    if (data.newPassword && data.newPassword !== data.confirmPassword) {
        return false;
    }
    return true;
}, {
    message: "Konfirmasi sandi baru tidak cocok.",
    path: ["confirmPassword"],
});

export async function POST(req: Request) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        
        // 16. Validate input with Zod
        const validation = profileSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ 
                error: validation.error.issues[0].message 
            }, { status: 400 });
        }

        const { name, oldPassword, newPassword } = validation.data;

        if (!name && !newPassword) {
            return NextResponse.json({ error: "Tidak ada data yang diubah." }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });
        }

        const updateData: any = {};
        if (name) updateData.name = name;

        if (newPassword) {
            // Verifikasi Password Lama
            if (user.password) {
                if (!oldPassword) {
                    return NextResponse.json({ error: "Sandi lama diperlukan." }, { status: 400 });
                }
                const isMatch = await bcrypt.compare(oldPassword, user.password);
                if (!isMatch) {
                    return NextResponse.json({ error: "Sandi lama salah." }, { status: 401 });
                }
            }

            updateData.password = await bcrypt.hash(newPassword, 10);
        }

        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: updateData,
        });

        // 11. Data Exposure: Only return safe fields
        return NextResponse.json({
            success: true,
            message: "Profil berhasil diperbarui!",
            user: { name: updatedUser.name }
        });

    } catch (error) {
        // 17. Error Handling: Log internally, return generic message
        console.error("Profile Update Error:", error);
        return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
    }
}
