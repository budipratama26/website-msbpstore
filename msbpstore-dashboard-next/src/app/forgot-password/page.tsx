"use client";

import { useState } from "react";
import { Mail, AlertCircle, KeyRound, CheckCircle2, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError("");
        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Gagal mengirim kode reset.");
            setStep(2);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const iconStyle = (color: string, bg: string, border: string) => ({
        width: "48px", height: "48px", background: bg, border: `1px solid ${border}`,
        borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center",
        justifyContent: "center", marginBottom: "16px",
    });

    return (
        <div style={{ minHeight: "calc(100vh - var(--header-height, 56px))", background: "var(--bg-base)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
            <div style={{ width: "100%", maxWidth: "420px" }}>
                <div style={{ background: "var(--bg-surface)", border: "var(--border-default)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-lg)", padding: "28px 28px 32px", position: "relative" }} className="animate-fade-in">
                    <Link href="/login" className="back-btn" style={{ position: "absolute", top: "20px", left: "20px", zIndex: 10 }} title="Kembali ke Login">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>

                    {step === 1 && (
                        <div>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "24px", marginTop: "20px" }}>
                                <div style={iconStyle("var(--accent-primary)", "var(--accent-muted)", "var(--accent-border)")}>
                                    <KeyRound style={{ width: "22px", height: "22px", color: "var(--accent-primary)" }} />
                                </div>
                                <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em", textAlign: "center", marginBottom: "6px" }}>Lupa Password?</h1>
                                <p style={{ fontSize: "13px", color: "var(--text-secondary)", textAlign: "center" }}>Masukkan email Anda untuk reset</p>
                            </div>
                            {error && (
                                <div style={{ marginBottom: "16px", padding: "11px 14px", background: "var(--error-muted)", border: "var(--border-error)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", fontWeight: 500, color: "var(--error)" }}>
                                    <AlertCircle style={{ width: "15px", height: "15px", flexShrink: 0 }} />{error}
                                </div>
                            )}
                            <form onSubmit={handleSendOTP} className="space-y-4">
                                <div>
                                    <label className="form-label">Email</label>
                                    <div style={{ position: "relative" }}>
                                        <Mail style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", width: "15px", height: "15px", color: "var(--text-muted)", pointerEvents: "none" }} />
                                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contoh@email.com" required className="form-input form-input-icon" />
                                    </div>
                                </div>
                                <button type="submit" disabled={loading} className="btn btn-primary btn-full btn-lg" style={{ marginTop: "4px" }}>
                                    {loading ? <div style={{ width: "18px", height: "18px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> : "Kirim Link Reset"}
                                </button>
                            </form>
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "24px", marginTop: "20px" }}>
                                <div style={iconStyle("var(--info)", "var(--info-muted)", "rgba(56,189,248,0.4)")}>
                                    <Mail style={{ width: "22px", height: "22px", color: "var(--info)" }} />
                                </div>
                                <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em", textAlign: "center", marginBottom: "8px" }}>Cek Email Anda</h1>
                                <p style={{ fontSize: "13px", color: "var(--text-secondary)", textAlign: "center", lineHeight: 1.65, padding: "0 8px" }}>
                                    Kami telah mengirimkan instruksi reset ke:<br />
                                    <strong style={{ color: "var(--text-primary)", fontWeight: 600, display: "block", marginTop: "4px" }}>{email}</strong>
                                </p>
                            </div>
                            <div className="space-y-3">
                                <div style={{ padding: "12px 14px", background: "var(--bg-elevated)", border: "var(--border-default)", borderRadius: "var(--radius-md)", fontSize: "12px", color: "var(--text-muted)", textAlign: "center", lineHeight: 1.6 }}>
                                    Link berlaku selama 15 menit. Cek folder spam jika tidak menemukannya.
                                </div>
                                <Link href="/login" className="btn btn-secondary btn-full btn-lg">Kembali ke Login</Link>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "24px", marginTop: "20px" }}>
                                <div style={iconStyle("var(--success)", "var(--success-muted)", "rgba(16,185,129,0.4)")}>
                                    <CheckCircle2 style={{ width: "22px", height: "22px", color: "var(--success)" }} />
                                </div>
                                <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em", textAlign: "center", marginBottom: "8px" }}>Selesai!</h1>
                                <p style={{ fontSize: "13px", color: "var(--text-secondary)", textAlign: "center", lineHeight: 1.65, padding: "0 8px" }}>Password berhasil diperbarui. Silakan login kembali.</p>
                            </div>
                            <Link href="/login" className="btn btn-primary btn-full btn-lg" style={{ marginTop: "8px" }}>Masuk Sekarang</Link>
                        </div>
                    )}
                </div>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
