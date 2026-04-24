"use client";

import { Lock, Trash2, ChevronLeft, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { signOut } from "next-auth/react";

export default function SecurityPage() {
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleDeleteAccount = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/user/delete", { method: "DELETE" });
            if (!res.ok) throw new Error("Gagal menghapus akun");
            await signOut({ callbackUrl: "/" });
        } catch (err: any) {
            alert("Error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: "calc(100vh - var(--header-height, 56px))", background: "var(--bg-base)", padding: "24px 16px 40px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: "100%", maxWidth: "540px" }}>
                <div className="card space-y-5" style={{ padding: "24px" }}>

                    {/* Header */}
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px", borderBottom: "1px solid var(--bg-border)", paddingBottom: "16px" }}>
                        <Link href="/profile" className="back-btn shrink-0" title="Kembali">
                            <ChevronLeft style={{ width: "18px", height: "18px" }} />
                        </Link>
                        <div>
                            <h1 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em", display: "flex", alignItems: "center", gap: "10px" }}>
                                <Lock style={{ width: "20px", height: "20px", color: "var(--accent-primary)" }} />
                                Keamanan Akun
                            </h1>
                            <p style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 500, marginTop: "4px" }}>Kelola keamanan dan privasi akun Anda.</p>
                        </div>
                    </div>

                    {/* Account Deletion Card */}
                    <div style={{ background: "var(--error-muted)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "var(--radius-xl)", padding: "20px", position: "relative", overflow: "hidden" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
                            <div style={{ width: "44px", height: "44px", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <Trash2 style={{ width: "20px", height: "20px", color: "var(--error)" }} />
                            </div>
                            <div>
                                <h3 style={{ fontWeight: 700, fontSize: "15px", color: "var(--text-primary)", letterSpacing: "-0.01em" }}>Hapus Akun</h3>
                                <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--error)", marginTop: "2px" }}>Tindakan ini permanen</p>
                            </div>
                        </div>

                        <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.65, marginBottom: "16px" }}>
                            Dengan menghapus akun, semua informasi profil dan histori transaksi akan hilang. Proses ini bersifat permanen dan <strong style={{ color: "var(--error)" }}>tidak dapat dibatalkan</strong>.
                        </p>

                        {!showConfirm ? (
                            <button
                                onClick={() => setShowConfirm(true)}
                                style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--error)", fontWeight: 700, fontSize: "13px", background: "none", border: "none", cursor: "pointer", padding: 0, transition: "opacity 150ms ease" }}
                                className="hover:opacity-70"
                            >
                                <span style={{ borderBottom: "2px solid rgba(239,68,68,0.3)" }}>Ya, hapus akun MSBPSTORE saya</span>
                                <Trash2 style={{ width: "14px", height: "14px" }} />
                            </button>
                        ) : (
                            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "var(--radius-lg)", padding: "16px" }} className="space-y-4">
                                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                                    <AlertTriangle style={{ width: "16px", height: "16px", color: "var(--error)", flexShrink: 0, marginTop: "1px" }} />
                                    <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--error)", lineHeight: 1.5 }}>
                                        APAKAH ANDA YAKIN? SEMUA DATA TRANSAKSI DAN SALDO AKAN HILANG SELAMANYA.
                                    </p>
                                </div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                                    <button
                                        disabled={loading}
                                        onClick={handleDeleteAccount}
                                        style={{ flex: 1, minWidth: "140px", background: "var(--error)", color: "#fff", fontWeight: 700, padding: "12px", borderRadius: "var(--radius-md)", border: "none", cursor: "pointer", fontSize: "13px", opacity: loading ? 0.5 : 1, transition: "opacity 150ms ease" }}
                                    >
                                        {loading ? "MENGHAPUS..." : "YA, HAPUS AKUN"}
                                    </button>
                                    <button
                                        disabled={loading}
                                        onClick={() => setShowConfirm(false)}
                                        className="btn btn-ghost"
                                        style={{ flex: 1, minWidth: "140px" }}
                                    >
                                        BATALKAN
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Security Info Card */}
                    <div style={{ background: "var(--accent-muted)", border: "1px solid var(--accent-border)", borderRadius: "var(--radius-xl)", padding: "20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                            <Lock style={{ width: "16px", height: "16px", color: "var(--accent-primary)" }} />
                            <h4 style={{ fontWeight: 700, fontSize: "13px", color: "var(--accent-primary)" }}>Informasi Keamanan</h4>
                        </div>
                        <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.65 }}>
                            Untuk perubahan alamat email atau pemulihan akun yang hilang, silakan hubungi tim administrasi kami melalui WhatsApp Customer Service resmi kami.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}
