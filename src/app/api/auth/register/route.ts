import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/lib/resend";
import { signPendingToken } from "@/lib/tokens";
import { z } from "zod";
import { sanitizeHTML } from "@/lib/sanitize";
import crypto from "crypto";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/utils";

// 16. Input Validation Schema — Hardened password requirements
const registerSchema = z.object({
    name: z.string().min(2, "Nama minimal 2 karakter.").max(100),
    username: z.string().min(3, "Username minimal 3 karakter.").max(30).regex(/^[a-zA-Z0-9_]+$/, "Username hanya boleh huruf, angka, dan underscore."),
    email: z.string().email("Format email tidak valid.").max(255),
    password: z.string()
        .min(8, "Password minimal 8 karakter.")
        .max(100)
        .refine(val => /[A-Z]/.test(val), "Password harus mengandung minimal 1 huruf besar.")
        .refine(val => /[a-z]/.test(val), "Password harus mengandung minimal 1 huruf kecil.")
        .refine(val => /[0-9]/.test(val), "Password harus mengandung minimal 1 angka."),
});

export async function POST(req: Request) {
    try {
        const ip = getClientIp(req);
        const rl = await checkRateLimit(`ip:${ip}`, 'auth');
        
        if (!rl.allowed) {
            return NextResponse.json({ error: "Terlalu banyak permintaan pendaftaran. Silakan tunggu beberapa saat." }, { status: 429 });
        }

        const body = await req.json();
        
        // 16. Validate input with Zod
        const validation = registerSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ 
                error: validation.error.issues[0].message 
            }, { status: 400 });
        }

        let { name, username, password, email } = validation.data;
        email = email.toLowerCase().trim();

        // 1. Sanitize dynamic HTML input
        const sanitizedName = sanitizeHTML(name);

        // Check for existing verified user
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { username }],
                email_verified_at: { not: null }
            },
        });

        if (existingUser) {
            return NextResponse.json({ error: "Email atau username sudah digunakan." }, { status: 409 });
        }

        // Generate 6-digit OTP - SECURE CRYPTOGRAPHIC RNG
        const otpCode = crypto.randomInt(100000, 999999).toString();

        // Hash password before storing in token
        const hashedPassword = await bcrypt.hash(password, 10);

        // CREATE SIGNED PENDING TOKEN (Stateless)
        const pendingToken = signPendingToken({
            name: sanitizedName,
            username,
            email,
            password: hashedPassword,
            otp: otpCode
        });

        // SEND OTP VIA EMAIL
        let emailSent = false;
        if (process.env.RESEND_API_KEY) {
            const emailResult = await sendVerificationEmail(email, sanitizedName, otpCode);
            if (emailResult.success) {
                emailSent = true;
            } else {
                console.error("Resend delivery failed:", emailResult.error);
            }
        } else {
            console.warn(`[WARNING] RESEND_API_KEY not configured — email not sent to ${email}`);
        }

        // 11. Data Exposure: Return minimal info
        return NextResponse.json({
            success: true,
            message: "Registrasi dimulai. Kode OTP telah dikirim ke email Anda.",
            pendingToken,
            emailSent
        }, { status: 201 });

    } catch (error) {
        // 17. Error Handling: Log internally, return generic message
        console.error("Register Error:", error);
        return NextResponse.json({ error: "Terjadi kesalahan internal pada server." }, { status: 500 });
    }
}
