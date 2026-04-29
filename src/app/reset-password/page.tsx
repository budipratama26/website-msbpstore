"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, ShieldCheck, CheckCircle2, ChevronLeft, Loader2 } from "lucide-react";
import Link from "next/link";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword1, setShowPassword1] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [isValidating, setIsValidating] = useState(true);
    const [isValidToken, setIsValidToken] = useState(false);

    useEffect(() => {
        if (!token) { router.push("/login"); return; }
        const verifyToken = async () => {
            try {
                const res = await fetch(`/api/auth/verify-token?token=${encodeURIComponent(token)}`);
                const data = await res.json();
                setIsValidToken(data.valid);
            } catch { setIsValidToken(false); }
            finally { setIsValidating(false); }
        };
        verifyToken();
    }, [token, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) { setError("Konfirmasi password tidak cocok."); return; }
        setIsLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, newPassword }) });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Gagal mereset password.");
            setIsSuccess(true);
            setTimeout(() => router.push("/login"), 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) return (
        <div style={{ textAlign: "center", padding: "32px 0 16px" }}>
            <div style={{ width: "52px", height: "52px", background: "var(--success-muted)", border: "1px solid rgba(52,211,153,0.4)", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <CheckCircle2 style={{ width: "24px", height: "24px", color: "var(--success)" }} />
            </div>
            <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: "8px" }}>Password Berhasil Diperbarui!</h1>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.65, marginBottom: "20px" }}>Mengalihkan ke halaman login dalam beberapa detik...</p>
            <div style={{ height: "3px", background: "var(--bg-elevated)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                <div style={{ height: "100%", background: "linear-gradient(90deg, var(--accent-primary), #a5b4fc)", animation: "progress 3s linear forwards", transformOrigin: "left" }} />
            </div>
            <style dangerouslySetInnerHTML={{ __html: `@keyframes progress { from { transform: scaleX(0); } to { transform: scaleX(1); } }` }} />
        </div>
    );

    if (isValidating) return (
        <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
            <Loader2 style={{ width: "28px", height: "28px", color: "var(--accent-primary)", animation: "spin 0.7s linear infinite" }} />
        </div>
    );

    if (!isValidToken) return (
        <div style={{ textAlign: "center", padding: "32px 0 16px" }}>
            <div style={{ width: "52px", height: "52px", background: "var(--error-muted)", border: "1px solid rgba(248,113,113,0.4)", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <ShieldCheck style={{ width: "24px", height: "24px", color: "var(--error)" }} />
            </div>
            <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: "8px" }}>Link Tidak Valid</h1>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.65, marginBottom: "20px" }}>Link reset password sudah kadaluarsa atau sudah digunakan. Silakan ajukan reset password kembali.</p>
            <Link href="/forgot-password" style={{ display: "inline-block", padding: "10px 20px", background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}>
                Ajukan Reset Ulang
            </Link>
        </div>
    );

    return (
        <div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "24px", marginTop: "32px" }}>
                <div style={{ width: "52px", height: "52px", background: "var(--accent-muted)", border: "1px solid var(--accent-border)", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px", boxShadow: "0 0 20px var(--accent-glow)" }}>
                    <ShieldCheck style={{ width: "22px", height: "22px", color: "var(--accent-primary)" }} />
                </div>
                <h1 style={{ fontSize: "20px", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text-primary)", textAlign: "center", marginBottom: "6px" }}>Reset Password</h1>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", textAlign: "center" }}>Masukkan password baru anda di bawah ini</p>
            </div>

            {error && (
                <div style={{ marginBottom: "16px", padding: "11px 14px", background: "var(--error-muted)", border: "1px solid var(--error)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", fontWeight: 500, color: "var(--error)" }}>
                    <ShieldCheck style={{ width: "15px", height: "15px", flexShrink: 0 }} />{error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="form-label">Password Baru</label>
                    <div style={{ position: "relative" }}>
                        <Lock style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", width: "15px", height: "15px", color: "var(--text-muted)", pointerEvents: "none" }} />
                        <input type={showPassword1 ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min. 6 karakter" required minLength={6} className="form-input form-input-icon" style={{ paddingRight: "44px" }} />
                        {newPassword && (
                            <button type="button" onClick={() => setShowPassword1(!showPassword1)} style={{ position: "absolute", right: "13px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", padding: 0 }} className="hover:text-[var(--text-primary)]">
                                {showPassword1 ? <EyeOff style={{ width: "15px", height: "15px" }} /> : <Eye style={{ width: "15px", height: "15px" }} />}
                            </button>
                        )}
                    </div>
                </div>
                <div>
                    <label className="form-label">Konfirmasi Password</label>
                    <div style={{ position: "relative" }}>
                        <Lock style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", width: "15px", height: "15px", color: "var(--text-muted)", pointerEvents: "none" }} />
                        <input type={showPassword2 ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Ketik ulang password" required minLength={6} className="form-input form-input-icon" style={{ paddingRight: "44px" }} />
                        {confirmPassword && (
                            <button type="button" onClick={() => setShowPassword2(!showPassword2)} style={{ position: "absolute", right: "13px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", padding: 0 }} className="hover:text-[var(--text-primary)]">
                                {showPassword2 ? <EyeOff style={{ width: "15px", height: "15px" }} /> : <Eye style={{ width: "15px", height: "15px" }} />}
                            </button>
                        )}
                    </div>
                </div>
                <button type="submit" disabled={isLoading} className="btn btn-primary btn-full btn-lg" style={{ marginTop: "4px" }}>
                    {isLoading ? <Loader2 style={{ width: "18px", height: "18px", animation: "spin 0.7s linear infinite" }} /> : "Simpan Password Baru"}
                </button>
            </form>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div style={{ minHeight: "calc(100vh - var(--header-height, 60px))", background: "var(--bg-base)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 16px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "-80px", left: "50%", transform: "translateX(-50%)", width: "400px", height: "200px", background: "radial-gradient(ellipse, var(--accent-glow) 0%, transparent 70%)", pointerEvents: "none" }} />
            <div style={{ width: "100%", maxWidth: "420px", position: "relative", zIndex: 1 }}>
                <div className="card animate-fade-in" style={{ padding: "24px 28px 32px", position: "relative", boxShadow: "var(--shadow-lg), 0 0 40px var(--accent-glow)" }}>
                    <Link href="/login" className="back-btn" style={{ position: "absolute", top: "20px", left: "20px", zIndex: 10 }} title="Kembali ke Login">
                        <ChevronLeft style={{ width: "18px", height: "18px" }} />
                    </Link>
                    <Suspense fallback={<div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}><Loader2 style={{ width: "28px", height: "28px", color: "var(--accent-primary)", animation: "spin 0.7s linear infinite" }} /></div>}>
                        <ResetPasswordForm />
                    </Suspense>
                </div>
                <p style={{ textAlign: "center", fontSize: "12px", color: "var(--text-muted)", marginTop: "20px" }}>🔒 Transaksi aman &amp; terenkripsi</p>
            </div>
        </div>
    );
}