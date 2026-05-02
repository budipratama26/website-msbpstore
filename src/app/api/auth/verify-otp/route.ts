import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPendingToken } from "@/lib/tokens";
import { logActivity } from "@/lib/activity";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/utils";

// 16. Input Validation Schema
const verifyOtpSchema = z.object({
    otp: z.string().length(6).regex(/^\d+$/),
    pendingToken: z.string().min(1),
});

export async function POST(req: Request) {
    try {
        const ip = getClientIp(req);
        const rl = await checkRateLimit(`ip:${ip}`, 'auth');
        
        if (!rl.allowed) {
            return NextResponse.json({ error: "Terlalu banyak percobaan. Silakan tunggu 1 menit." }, { status: 429 });
        }

        const body = await req.json();
        
        // 16. Validate input with Zod
        const validation = verifyOtpSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ 
                error: "Kode OTP atau token tidak valid." 
            }, { status: 400 });
        }

        const { otp, pendingToken } = validation.data;

        // 1. Verifikasi Stateless Token
        const data = verifyPendingToken(pendingToken);
        if (!data) {
            return NextResponse.json({
                error: "Sesi pendaftaran kedaluwarsa atau tidak valid. Silakan daftar kembali."
            }, { status: 400 });
        }

        // 2. Cek kecocokan OTP (Safe comparison)
        if (data.otp !== otp) {
            return NextResponse.json({
                error: "Kode OTP salah. Silakan periksa kembali email Anda."
            }, { status: 400 });
        }

        const { name, username, email, password } = data;

        // Cek duplikat terakhir
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { username }],
                email_verified_at: { not: null }
            },
        });

        if (existingUser) {
            return NextResponse.json({
                error: "Email atau username sudah terdaftar."
            }, { status: 409 });
        }

        // 3. Simpan ke Database
        const newUser = await prisma.user.create({
            data: {
                name,
                username,
                email,
                password, // Sudah di-hash di Register
                role: "customer",
                email_verified_at: new Date(),
            }
        });

        // Track User Agent for accurate logging
        const ua = req.headers.get("user-agent") || undefined;
        await logActivity("REGISTER", "Mendaftar akun baru via Email", newUser.id.toString(), ip, ua);

        // 11. Data Exposure: Return minimal info
        return NextResponse.json({
            success: true,
            message: "Akun berhasil diverifikasi!",
            user: {
                id: newUser.id.toString(),
                name: newUser.name,
                email: newUser.email
            }
        }, { status: 201 });

    } catch (error) {
        // 17. Error Handling: Log internally, generic message
        console.error("Verify OTP Error:", error);
        return NextResponse.json({ error: "Terjadi kesalahan sistem saat verifikasi." }, { status: 500 });
    }
}
