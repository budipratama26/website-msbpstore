import { NextResponse } from "next/server";
import { sendVerificationEmail } from "@/lib/resend";
import { verifyPendingToken, signPendingToken } from "@/lib/tokens";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/utils";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const ip = getClientIp(req);
        const rl = await checkRateLimit(`ip:${ip}`, 'auth');
        if (!rl.allowed) return NextResponse.json({ error: "Terlalu banyak permintaan otentikasi. Silakan tunggu sebentar." }, { status: 429 });

        const body = await req.json();
        const { pendingToken } = body;

        if (!pendingToken) {
            return NextResponse.json({ error: "Token pendaftaran wajib ada." }, { status: 400 });
        }

        // 1. Verifikasi token lama untuk mengambil data pendaftaran
        const data = verifyPendingToken(pendingToken);
        if (!data) {
            return NextResponse.json({
                error: "Sesi pendaftaran kedaluwarsa. Silakan daftar kembali."
            }, { status: 400 });
        }

        const { email, name, username, password } = data;

        // 2. Generate new 6-digit OTP - SECURE CRYPTOGRAPHIC RNG
        const otpCode = crypto.randomInt(100000, 999999).toString();

        // 3. Buat token BARU dengan OTP baru (Data user tetap sama)
        const newPendingToken = signPendingToken({
            name,
            username,
            email,
            password,
            otp: otpCode
        });

        // 4. SEND OTP VIA HELPER
        const emailResult = await sendVerificationEmail(email, name || "User", otpCode);

        if (!emailResult.success) {
            console.error("Resend OTP Failed:", emailResult.error);
            return NextResponse.json({
                error: "Gagal mengirim email verifikasi. Silakan coba lagi nanti.",
                detail: emailResult.error
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: "Kode OTP baru telah dikirim ke email Anda.",
            pendingToken: newPendingToken // Kirim token baru ke client
        });

    } catch (error: any) {
        console.error("Resend OTP API Error:", error);
        return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
    }
}
