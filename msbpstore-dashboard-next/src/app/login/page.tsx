"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { LogIn, Mail, Lock, AlertCircle, Eye, EyeOff, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GoogleButton } from "@/components/GoogleButton";
import BlackHoleLogo from "@/components/BlackHoleLogo";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        try {
            const result = await signIn("credentials", { email, password, redirect: false });
            if (result?.error) {
                if (result.error.includes("OAuthOnly") || result.error === "Configuration") {
                    setError("Akun terdaftar menggunakan Google. Silakan klik 'Lanjutkan dengan Google'.");
                } else {
                    setError("Email atau password salah.");
                }
            }
            else if (result?.ok) { router.push("/"); router.refresh(); }
        } catch {
            setError("Terjadi kesalahan sistem.");
        } finally {
            setIsLoading(false);
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

                {/* Card */}
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
                    <Link href="/" className="back-btn" style={{ position: "absolute", top: "20px", left: "20px", zIndex: 10 }} title="Kembali ke Beranda">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>

                    {/* Header */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "28px", marginTop: "20px" }}>
                        <div
                            style={{
                                width: "48px",
                                height: "48px",
                                background: "var(--accent-muted)",
                                border: "1px solid var(--accent-border)",
                                borderRadius: "var(--radius-lg)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: "16px",
                            }}
                        >
                            <BlackHoleLogo size="sm" />
                        </div>
                        <h1
                            style={{
                                fontSize: "22px",
                                fontWeight: 700,
                                color: "var(--text-primary)",
                                letterSpacing: "-0.02em",
                                textAlign: "center",
                                marginBottom: "6px",
                            }}
                        >
                            Masuk ke{" "}
                            <span style={{ color: "var(--accent-primary)" }}>MSBP Store</span>
                        </h1>
                        <p style={{ fontSize: "13px", color: "var(--text-secondary)", textAlign: "center" }}>Selamat datang kembali!</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div
                            style={{
                                marginBottom: "16px",
                                padding: "12px 14px",
                                background: "var(--error-muted)",
                                border: "var(--border-error)",
                                borderRadius: "var(--radius-md)",
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                fontSize: "13px",
                                fontWeight: 500,
                                color: "var(--error)",
                            }}
                        >
                            <AlertCircle style={{ width: "15px", height: "15px", flexShrink: 0 }} />
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">

                        <div>
                            <label className="form-label">Email</label>
                            <div style={{ position: "relative" }}>
                                <Mail
                                    style={{
                                        position: "absolute",
                                        left: "13px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        width: "15px",
                                        height: "15px",
                                        color: "var(--text-muted)",
                                        pointerEvents: "none",
                                    }}
                                />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="contoh@email.com"
                                    required
                                    className="form-input form-input-icon"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="form-label">Password</label>
                            <div style={{ position: "relative" }}>
                                <Lock
                                    style={{
                                        position: "absolute",
                                        left: "13px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        width: "15px",
                                        height: "15px",
                                        color: "var(--text-muted)",
                                        pointerEvents: "none",
                                    }}
                                />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Masukkan password"
                                    required
                                    className="form-input form-input-icon"
                                    style={{ paddingRight: "44px" }}
                                />
                                {password && (
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: "absolute",
                                            right: "13px",
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            color: "var(--text-muted)",
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            padding: 0,
                                            transition: "color 150ms ease",
                                        }}
                                        className="hover:text-[var(--text-primary)]"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                )}
                            </div>
                            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
                                <Link
                                    href="/forgot-password"
                                    style={{ fontSize: "12px", fontWeight: 600, color: "var(--accent-primary)", textDecoration: "none", transition: "opacity 150ms ease" }}
                                    className="hover:opacity-75"
                                >
                                    Lupa password?
                                </Link>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn btn-primary btn-full btn-lg"
                            style={{ marginTop: "4px" }}
                        >
                            {isLoading ? (
                                <div style={{ width: "18px", height: "18px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                            ) : (
                                <>
                                    <LogIn className="w-4 h-4" />
                                    Masuk Sekarang
                                </>
                            )}
                        </button>
                    </form>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "20px 0" }}>
                        <div style={{ flex: 1, height: "1px", background: "var(--bg-border)" }} />
                        <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>atau</span>
                        <div style={{ flex: 1, height: "1px", background: "var(--bg-border)" }} />
                    </div>

                    <GoogleButton text="Lanjutkan dengan Google" />

                    <p style={{ fontSize: "11px", color: "var(--text-muted)", textAlign: "center", marginTop: "16px", lineHeight: 1.5 }}>
                        Dengan mendaftar atau masuk menggunakan Google, Anda menyetujui <Link href="/terms" style={{ color: "var(--accent-primary)", textDecoration: "none" }} className="hover:opacity-75">Syarat Ketentuan</Link> dan <Link href="/privacy" style={{ color: "var(--accent-primary)", textDecoration: "none" }} className="hover:opacity-75">Kebijakan Privasi</Link> MSBP Store.
                    </p>
                </div>

                <p style={{ textAlign: "center", fontSize: "13px", color: "var(--text-secondary)", marginTop: "20px" }}>
                    Belum punya akun?{" "}
                    <Link
                        href="/register"
                        style={{ color: "var(--accent-primary)", fontWeight: 600, textDecoration: "none", transition: "opacity 150ms ease" }}
                        className="hover:opacity-75"
                    >
                        Daftar Gratis
                    </Link>
                </p>
                <p style={{ textAlign: "center", fontSize: "12px", color: "var(--text-muted)", marginTop: "8px" }}>
                    🔒 Transaksi aman &amp; terenkripsi
                </p>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}