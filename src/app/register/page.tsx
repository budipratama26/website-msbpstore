"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Mail, Lock, User as UserIcon, CheckCircle2, ChevronLeft, Eye, EyeOff } from "lucide-react";
import { GoogleButton } from "@/components/GoogleButton";
import BlackHoleLogo from "@/components/BlackHoleLogo";

export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState<"form" | "otp" | "success">("form");
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [pendingToken, setPendingToken] = useState("");
    const [isAgreed, setIsAgreed] = useState(false);
    const [agreedError, setAgreedError] = useState(false);

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAgreed) { setAgreedError(true); return; }
        setIsLoading(true); setError("");
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, username, email, password }),
            });
            const data = await res.json();
            if (!res.ok) setError(data.error || "Gagal melakukan pendaftaran.");
            else { setPendingToken(data.pendingToken); setStep("otp"); }
        } catch { setError("Terjadi kesalahan sistem."); }
        finally { setIsLoading(false); }
    };

    const handleOtpSubmit = async (e?: React.FormEvent, directOtp?: string) => {
        if (e) e.preventDefault();
        setIsLoading(true); setError("");
        const otpString = directOtp || otp.join("");
        if (otpString.length !== 6) { setError("Masukkan 6 digit kode OTP."); setIsLoading(false); return; }
        try {
            const res = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pendingToken, otp: otpString }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || "Kode OTP salah atau kedaluwarsa."); setIsLoading(false); }
            else {
                setStep("success");
                setTimeout(async () => {
                    const result = await signIn("credentials", { email, password, redirect: false });
                    router.push(result?.ok ? "/" : "/login");
                    router.refresh();
                }, 2000);
            }
        } catch { setError("Terjadi kesalahan saat verifikasi."); setIsLoading(false); }
    };

    const handleResendOtp = async () => {
        if (resendTimer > 0 || isResending) return;
        setIsResending(true); setError(""); setSuccessMessage("");
        try {
            const res = await fetch("/api/auth/resend-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pendingToken }),
            });
            const data = await res.json();
            if (!res.ok) setError(data.error || "Gagal mengirim ulang OTP.");
            else {
                if (data.pendingToken) setPendingToken(data.pendingToken);
                setSuccessMessage("Kode OTP baru telah dikirim!");
                setResendTimer(15);
                const timer = setInterval(() => {
                    setResendTimer(prev => { if (prev <= 1) { clearInterval(timer); return 0; } return prev - 1; });
                }, 1000);
            }
        } catch { setError("Gagal menghubungi server."); }
        finally { setIsResending(false); }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1 || !/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 5) (document.getElementById(`otp-${index + 1}`) as HTMLInputElement)?.focus();
        const fullOtp = newOtp.join("");
        if (fullOtp.length === 6) handleOtpSubmit(undefined, fullOtp);
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            const prev = document.getElementById(`otp-${index - 1}`) as HTMLInputElement;
            if (prev) { prev.focus(); const newOtp = [...otp]; newOtp[index - 1] = ""; setOtp(newOtp); }
        }
    };

    return (
        <div
            style={{
                minHeight: "calc(100vh - var(--header-height, 56px))",
                background: "var(--bg-base)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "40px 16px",
            }}
        >
            <div style={{ width: "100%", maxWidth: "420px" }}>

                <div
                    style={{
                        background: "var(--bg-surface)",
                        border: "var(--border-default)",
                        borderRadius: "var(--radius-xl)",
                        boxShadow: "var(--shadow-lg)",
                        padding: "28px 28px 32px",
                        position: "relative",
                    }}
                    className="animate-fade-in"
                >
                    {/* Back */}
                    <button
                        onClick={() => {
                            if (step === "otp") { setStep("form"); setError(""); setSuccessMessage(""); }
                            else router.push("/login");
                        }}
                        className="back-btn"
                        style={{ position: "absolute", top: "20px", left: "20px", zIndex: 10, background: "var(--bg-elevated)", border: "var(--border-default)" }}
                        title="Kembali"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    {/* Header */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "24px", marginTop: "20px" }}>
                        <div
                            style={{
                                width: "48px",
                                height: "48px",
                                background: step === "success" ? "var(--success-muted)" : "var(--accent-muted)",
                                border: `1px solid ${step === "success" ? "rgba(16,185,129,0.4)" : "var(--accent-border)"}`,
                                borderRadius: "var(--radius-lg)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: "16px",
                            }}
                        >
                            {step === "success"
                                ? <CheckCircle2 style={{ width: "22px", height: "22px", color: "var(--success)" }} />
                                : <BlackHoleLogo size="sm" />
                            }
                        </div>
                        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em", textAlign: "center", marginBottom: "6px" }}>
                            {step === "form"    && <>Daftar ke <span style={{ color: "var(--accent-primary)" }}>MSBP Store</span></>}
                            {step === "otp"     && <>Verifikasi <span style={{ color: "var(--accent-primary)" }}>Email</span></>}
                            {step === "success" && <span style={{ color: "var(--success)" }}>Pendaftaran Berhasil!</span>}
                        </h1>
                        <p style={{ fontSize: "13px", color: "var(--text-secondary)", textAlign: "center" }}>
                            {step === "form"    && "Buat akun gratis sekarang"}
                            {step === "otp"     && `Kode dikirim ke ${email}`}
                            {step === "success" && "Mengalihkan ke beranda..."}
                        </p>
                    </div>

                    {/* Alerts */}
                    {error && (
                        <div style={{ marginBottom: "16px", padding: "11px 14px", background: "var(--error-muted)", border: "var(--border-error)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", fontWeight: 500, color: "var(--error)" }}>
                            <AlertCircle style={{ width: "15px", height: "15px", flexShrink: 0 }} />
                            {error}
                        </div>
                    )}
                    {successMessage && (
                        <div style={{ marginBottom: "16px", padding: "11px 14px", background: "var(--success-muted)", border: "1px solid rgba(16,185,129,0.4)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", fontWeight: 500, color: "var(--success)" }}>
                            <CheckCircle2 style={{ width: "15px", height: "15px", flexShrink: 0 }} />
                            {successMessage}
                        </div>
                    )}

                    {/* ── FORM ── */}
                    {step === "form" && (
                        <>
                            <form onSubmit={handleRegisterSubmit} className="space-y-4">
                                <div>
                                    <label className="form-label">Nama Lengkap</label>
                                    <div style={{ position: "relative" }}>
                                        <UserIcon style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", width: "15px", height: "15px", color: "var(--text-muted)", pointerEvents: "none" }} />
                                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nama kamu" required className="form-input form-input-icon" />
                                    </div>
                                </div>
                                <div>
                                    <label className="form-label">Username</label>
                                    <div style={{ position: "relative" }}>
                                        <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "14px", color: "var(--text-muted)", pointerEvents: "none", fontWeight: 600 }}>@</span>
                                        <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="username_unik" required className="form-input form-input-icon" />
                                    </div>
                                </div>
                                <div>
                                    <label className="form-label">Email</label>
                                    <div style={{ position: "relative" }}>
                                        <Mail style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", width: "15px", height: "15px", color: "var(--text-muted)", pointerEvents: "none" }} />
                                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="contoh@email.com" required className="form-input form-input-icon lowercase" />
                                    </div>
                                </div>
                                <div>
                                    <label className="form-label">Password</label>
                                    <div style={{ position: "relative" }}>
                                        <Lock style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", width: "15px", height: "15px", color: "var(--text-muted)", pointerEvents: "none" }} />
                                        <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 karakter" required minLength={6} className="form-input form-input-icon" style={{ paddingRight: "44px" }} />
                                        {password && (
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "13px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", padding: 0, transition: "color 150ms ease" }} className="hover:text-[var(--text-primary)]">
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* TOS Checkbox */}
                                <div>
                                    <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
                                        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", marginTop: "2px", flexShrink: 0 }}>
                                            <input
                                                type="checkbox"
                                                checked={isAgreed}
                                                onChange={(e) => { setIsAgreed(e.target.checked); if (e.target.checked) setAgreedError(false); }}
                                                style={{
                                                    width: "18px",
                                                    height: "18px",
                                                    appearance: "none",
                                                    background: isAgreed ? "var(--accent-primary)" : "var(--bg-elevated)",
                                                    border: `2px solid ${isAgreed ? "var(--accent-primary)" : "var(--bg-border)"}`,
                                                    borderRadius: "4px",
                                                    cursor: "pointer",
                                                    transition: "background 150ms ease, border-color 150ms ease",
                                                }}
                                            />
                                            {isAgreed && (
                                                <svg style={{ width: "11px", height: "11px", color: "#fff", position: "absolute", pointerEvents: "none" }} viewBox="0 0 14 14" fill="none">
                                                    <path d="M11.667 3.5L5.25 9.917 2.333 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            )}
                                        </div>
                                        <span style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                                            Dengan mendaftar, saya menyetujui{" "}
                                            <Link href="/terms" style={{ color: "var(--accent-primary)", fontWeight: 600, textDecoration: "none" }}>Syarat Ketentuan</Link>
                                            {" "}dan{" "}
                                            <Link href="/privacy" style={{ color: "var(--accent-primary)", fontWeight: 600, textDecoration: "none" }}>Kebijakan Privasi</Link>
                                            {" "}MSBP Store.
                                        </span>
                                    </label>
                                    {agreedError && (
                                        <p style={{ marginTop: "6px", fontSize: "12px", fontWeight: 500, color: "var(--error)", display: "flex", alignItems: "center", gap: "6px" }}>
                                            <AlertCircle style={{ width: "12px", height: "12px" }} />
                                            Kamu wajib menyetujui syarat &amp; ketentuan
                                        </p>
                                    )}
                                </div>

                                <button type="submit" disabled={isLoading} className="btn btn-primary btn-full btn-lg" style={{ marginTop: "4px" }}>
                                    {isLoading ? <div style={{ width: "18px", height: "18px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> : "Daftar Sekarang"}
                                </button>
                            </form>

                            <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "20px 0" }}>
                                <div style={{ flex: 1, height: "1px", background: "var(--bg-border)" }} />
                                <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>atau</span>
                                <div style={{ flex: 1, height: "1px", background: "var(--bg-border)" }} />
                            </div>
                            <GoogleButton
                                text="Daftar dengan Google"
                                onClick={() => {
                                    if (!isAgreed) setAgreedError(true);
                                    else signIn("google", { callbackUrl: "/" });
                                }}
                            />
                        </>
                    )}

                    {/* ── OTP ── */}
                    {step === "otp" && (
                        <form onSubmit={handleOtpSubmit} className="space-y-5">
                            <p style={{ fontSize: "13px", color: "var(--text-secondary)", textAlign: "center", lineHeight: 1.65 }}>
                                Kami mengirimkan kode 6 digit ke<br />
                                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{email}</span>
                            </p>
                            <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                                {otp.map((digit, i) => (
                                    <input
                                        key={i}
                                        id={`otp-${i}`}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={e => handleOtpChange(i, e.target.value)}
                                        onKeyDown={e => handleKeyDown(i, e)}
                                        style={{
                                            width: "46px",
                                            height: "52px",
                                            textAlign: "center",
                                            fontSize: "22px",
                                            fontWeight: 700,
                                            background: "var(--bg-elevated)",
                                            border: `2px solid ${digit ? "var(--accent-border)" : "var(--bg-border)"}`,
                                            borderRadius: "var(--radius-md)",
                                            color: "var(--text-primary)",
                                            outline: "none",
                                            transition: "border-color 150ms ease",
                                            fontFamily: "inherit",
                                        }}
                                    />
                                ))}
                            </div>
                            <button type="submit" disabled={isLoading} className="btn btn-primary btn-full btn-lg">
                                {isLoading ? <div style={{ width: "18px", height: "18px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> : "Verifikasi OTP"}
                            </button>
                            <div style={{ textAlign: "center" }}>
                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    disabled={resendTimer > 0 || isResending}
                                    style={{
                                        fontSize: "13px",
                                        fontWeight: 600,
                                        color: resendTimer > 0 || isResending ? "var(--text-muted)" : "var(--accent-primary)",
                                        background: "none",
                                        border: "none",
                                        cursor: resendTimer > 0 || isResending ? "not-allowed" : "pointer",
                                        transition: "opacity 150ms ease",
                                    }}
                                    className={!(resendTimer > 0 || isResending) ? "hover:opacity-75" : ""}
                                >
                                    {isResending ? "Mengirim..." : resendTimer > 0 ? `Kirim ulang (${resendTimer}s)` : "Kirim ulang OTP"}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* ── SUCCESS ── */}
                    {step === "success" && (
                        <div style={{ textAlign: "center", padding: "16px 0" }}>
                            <div style={{ width: "56px", height: "56px", background: "var(--success-muted)", border: "1px solid rgba(16,185,129,0.4)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                                <CheckCircle2 style={{ width: "28px", height: "28px", color: "var(--success)" }} />
                            </div>
                            <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>Akun Berhasil Dibuat!</h2>
                            <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Kamu akan dialihkan ke beranda...</p>
                        </div>
                    )}
                </div>

                {step === "form" && (
                    <p style={{ textAlign: "center", fontSize: "13px", color: "var(--text-secondary)", marginTop: "20px" }}>
                        Sudah punya akun?{" "}
                        <Link href="/login" style={{ color: "var(--accent-primary)", fontWeight: 600, textDecoration: "none", transition: "opacity 150ms ease" }} className="hover:opacity-75">
                            Masuk di sini
                        </Link>
                    </p>
                )}
                <p style={{ textAlign: "center", fontSize: "12px", color: "var(--text-muted)", marginTop: "8px" }}>
                    🔒 Transaksi aman &amp; terenkripsi
                </p>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}