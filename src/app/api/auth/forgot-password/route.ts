import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendResetPasswordLinkEmail } from "@/lib/resend";
import { z } from "zod";

// 16. Input Validation Schema
const forgotPasswordSchema = z.object({
    email: z.string().email().max(255),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        
        // 16. Validate input with Zod
        const validation = forgotPasswordSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: "Email tidak valid." }, { status: 400 });
        }

        const email = validation.data.email.toLowerCase();

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // Updated for better UX requested by user: explicitly tell them email is not registered
            return NextResponse.json(
                { error: "Email salah!" },
                { status: 404 }
            );
        }

        // Generate dynamic token
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const expires = new Date(Date.now() + 900000); // 15 minutes

        await prisma.user.update({
            where: { email },
            data: {
                reset_password_token: token,
                reset_password_expires: expires,
            }
        });

        const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
        await sendResetPasswordLinkEmail(email, resetLink);

        return NextResponse.json({
            success: true,
            message: "Link reset telah dikirim ke email Anda."
        });

    } catch (error) {
        // 17. Error Handling: Log internally, generic message
        console.error("Forgot Password Error:", error);
        return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
    }
}
