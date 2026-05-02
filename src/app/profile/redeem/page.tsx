"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, Coins, History, Loader2, AlertCircle, CheckCircle2, Ticket, ArrowRight, Copy } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RedeemPage() {
    const router = useRouter();
    const [stats, setStats] = useState({ points: 0, history: [] });
    const [loading, setLoading] = useState(true);
    const [redeemLoading, setRedeemLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "", code: "" });

    useEffect(() => { fetchStats(); }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch("/api/user/points");
            const data = await res.json();
            if (!data.error) setStats({ points: data.points || 0, history: data.history || [] });
        } catch {}
        finally { setLoading(false); }
    };

    const handleRedeem = async () => {
        if (stats.points < 30) return;
        setRedeemLoading(true);
        setMessage({ type: "", text: "", code: "" });
        try {
            const res = await fetch("/api/user/points", { method: "POST" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setMessage({ type: "success", text: "Voucher Berhasil Diklaim!", code: data.voucherCode });
            fetchStats();
            router.refresh();
        } catch (err: any) {
            setMessage({ type: "error", text: err.message, code: "" });
        } finally {
            setRedeemLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Kode Voucher disalin!");
    };

    return (
        <div style={{ minHeight: "calc(100vh - var(--header-height, 56px))", background: "var(--bg-base)", padding: "24px 16px 40px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: "100%", maxWidth: "540px" }}>
                <div className="card space-y-5" style={{ padding: "24px", position: "relative" }}>

                    {/* Back */}
                    <Link href="/profile" className="back-btn" style={{ position: "absolute", top: "20px", left: "20px", zIndex: 10 }} title="Kembali">
                        <ChevronLeft style={{ width: "18px", height: "18px" }} />
                    </Link>

                    {/* Header */}
                    <div style={{ textAlign: "center", paddingTop: "44px" }}>
                        <h1 style={{ fontSize: "20px", fontWeight: 900, letterSpacing: "-0.03em", color: "var(--text-primary)", textTransform: "uppercase" }}>
                            Loyalitas Member
                        </h1>
                    </div>

                    {/* Point Balance Card — Midnight Indigo gradient */}
                    <div
                        style={{
                            background: "linear-gradient(135deg, rgba(99,102,241,0.18) 0%, var(--bg-elevated) 100%)",
                            borderRadius: "var(--radius-xl)",
                            padding: "36px 20px",
                            textAlign: "center",
                            border: "1px solid var(--accent-border)",
                            position: "relative",
                            overflow: "hidden",
                        boxShadow: "var(--shadow-md)",
                        }}
                    >

                        <div style={{ position: "relative", zIndex: 1 }}>
                            <Coins style={{
                                width: "36px",
                                height: "36px",
                                color: "var(--accent-primary)",
                                margin: "0 auto 12px",
                                opacity: 0.6,
                            }} />
                            <p style={{
                                fontSize: "10px",
                                fontWeight: 900,
                                letterSpacing: "3px",
                                textTransform: "uppercase",
                                color: "var(--text-muted)",
                                marginBottom: "8px",
                            }}>
                                Poin Hadiah Anda
                            </p>
                            <h4 style={{
                                fontSize: "52px",
                                fontWeight: 900,
                                letterSpacing: "-2px",
                                color: "var(--text-primary)",
                                lineHeight: 1,
                            }}>
                                {loading ? "..." : stats.points.toLocaleString("id-ID")}
                            </h4>
                            <div style={{
                                marginTop: "16px",
                                display: "inline-block",
                                padding: "4px 16px",
                                background: "var(--accent-muted)",
                                border: "1px solid var(--accent-border)",
                                borderRadius: "var(--radius-full)",
                                fontSize: "10px",
                                fontWeight: 900,
                                letterSpacing: "2px",
                                textTransform: "uppercase",
                                color: "var(--accent-primary)",
                            }}>
                                +2 POIN TIAP TRANSAKSI
                            </div>
                        </div>
                    </div>

                    {/* Redeem Section */}
                    <div className="card" style={{ padding: "20px", overflow: "hidden" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "14px", paddingBottom: "16px", borderBottom: "var(--border-default)", marginBottom: "16px" }}>
                            <div style={{
                                width: "44px",
                                height: "44px",
                                background: "var(--accent-muted)",
                                border: "1px solid var(--accent-border)",
                                borderRadius: "var(--radius-md)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "none",
                            }}>
                                <Ticket style={{ width: "20px", height: "20px", color: "var(--accent-primary)" }} />
                            </div>
                            <div>
                                <h3 style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "14px" }}>
                                    Tukar Voucher Diskon
                                </h3>
                                <p style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500, marginTop: "2px" }}>
                                    Potongan Rp 5.000 (30 Poin)
                                </p>
                            </div>
                        </div>

                        {message.code ? (
                            <div style={{
                                background: "var(--success-muted)",
                                border: "2px dashed rgba(52,211,153,0.4)",
                                borderRadius: "var(--radius-xl)",
                                padding: "24px",
                                textAlign: "center",
                            }} className="space-y-3">
                                <p style={{ fontSize: "10px", fontWeight: 900, color: "var(--success)", textTransform: "uppercase", letterSpacing: "2px" }}>
                                    KODE VOUCHER ANDA:
                                </p>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
                                    <span style={{
                                        fontSize: "24px",
                                        fontWeight: 900,
                                        letterSpacing: "3px",
                                        color: "var(--text-primary)",
                                        background: "var(--bg-elevated)",
                                        padding: "10px 20px",
                                        borderRadius: "var(--radius-md)",
                                        fontFamily: "monospace",
                                    }}>
                                        {message.code}
                                    </span>
                                    <button
                                        onClick={() => copyToClipboard(message.code)}
                                        style={{
                                            width: "40px",
                                            height: "40px",
                                            background: "var(--bg-elevated)",
                                            border: "var(--border-default)",
                                            borderRadius: "var(--radius-md)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            cursor: "pointer",
                                            color: "var(--accent-primary)",
                                            transition: "background 150ms ease",
                                        }}
                                        className="hover:bg-[var(--accent-muted)]"
                                    >
                                        <Copy style={{ width: "16px", height: "16px" }} />
                                    </button>
                                </div>
                                <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--success)", textTransform: "uppercase", letterSpacing: "1px" }}>
                                    Gunakan kode ini saat proses Checkout!
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                    <div style={{
                                        padding: "14px",
                                        background: "var(--bg-elevated)",
                                        borderRadius: "var(--radius-lg)",
                                        border: "var(--border-default)",
                                    }}>
                                        <p style={{ fontSize: "10px", fontWeight: 900, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>
                                            Target Poin
                                        </p>
                                        <p style={{ fontSize: "14px", fontWeight: 900, color: "var(--text-primary)" }}>30 PTS</p>
                                    </div>
                                    <div style={{
                                        padding: "14px",
                                        background: "var(--bg-elevated)",
                                        borderRadius: "var(--radius-lg)",
                                        border: "var(--border-default)",
                                    }}>
                                        <p style={{ fontSize: "10px", fontWeight: 900, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>
                                            Voucher
                                        </p>
                                        <p style={{ fontSize: "14px", fontWeight: 900, color: "var(--success)" }}>Rp 5.000</p>
                                    </div>
                                </div>

                                {message.text && (
                                    <div style={{
                                        padding: "12px 14px",
                                        background: "var(--error-muted)",
                                        border: "1px solid rgba(248,113,113,0.3)",
                                        borderRadius: "var(--radius-md)",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px",
                                        fontSize: "13px",
                                        fontWeight: 600,
                                        color: "var(--error)",
                                    }}>
                                        <AlertCircle style={{ width: "16px", height: "16px" }} /> {message.text}
                                    </div>
                                )}

                                <button
                                    onClick={handleRedeem}
                                    disabled={redeemLoading || stats.points < 30}
                                    className="btn btn-primary btn-full btn-lg"
                                    style={{ letterSpacing: "1.5px", textTransform: "uppercase", fontSize: "12px" }}
                                >
                                    {redeemLoading
                                        ? <Loader2 style={{ width: "18px", height: "18px", animation: "spin 0.7s linear infinite" }} />
                                        : "KLAIM VOUCHER DISKON"
                                    }
                                    <ArrowRight style={{ width: "16px", height: "16px" }} />
                                </button>

                                {stats.points < 30 && (
                                    <p style={{
                                        textAlign: "center",
                                        fontSize: "11px",
                                        fontWeight: 700,
                                        color: "var(--text-muted)",
                                        textTransform: "uppercase",
                                        letterSpacing: "1.5px",
                                    }}>
                                        Butuh{" "}
                                        <span style={{ color: "var(--accent-primary)" }}>
                                            {30 - stats.points} poin lagi
                                        </span>{" "}
                                        untuk klaim voucher.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* History Section */}
                    <div className="space-y-3">
                        <h3 style={{
                            fontSize: "11px",
                            fontWeight: 900,
                            color: "var(--text-muted)",
                            textTransform: "uppercase",
                            letterSpacing: "2px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                        }}>
                            <History style={{ width: "13px", height: "13px" }} /> Aktivitas Poin
                        </h3>
                        <div className="card" style={{ overflow: "hidden" }}>
                            {stats.history.length > 0 ? stats.history.map((h: any) => (
                                <div
                                    key={h.id}
                                    style={{
                                        padding: "14px 16px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        borderBottom: "var(--border-default)",
                                        transition: "background 150ms ease",
                                    }}
                                    className="hover:bg-[var(--bg-elevated)]"
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                        <div style={{
                                            width: "36px",
                                            height: "36px",
                                            borderRadius: "var(--radius-md)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontWeight: 900,
                                            fontSize: "12px",
                                            background: h.amount > 0 ? "var(--success-muted)" : "var(--error-muted)",
                                            color: h.amount > 0 ? "var(--success)" : "var(--error)",
                                        }}>
                                            {h.amount > 0 ? "+" : "−"}
                                        </div>
                                        <div>
                                            <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "2px" }}>
                                                {h.description}
                                            </p>
                                            <p style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>
                                                {new Date(h.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })} · {h.type}
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: "13px", fontWeight: 900, color: h.amount > 0 ? "var(--success)" : "var(--error)" }}>
                                        {h.amount > 0 ? "+" : ""}{h.amount}{" "}
                                        <span style={{ fontSize: "9px", opacity: 0.5 }}>PTS</span>
                                    </div>
                                </div>
                            )) : (
                                <div className="empty-state" style={{ border: "none", borderRadius: 0 }}>
                                    <div className="empty-icon">
                                        <Coins style={{ width: "22px", height: "22px" }} />
                                    </div>
                                    <h3 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                                        Belum ada aktivitas poin
                                    </h3>
                                    <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                                        Kumpulkan poin dengan belanja untuk menukarkannya dengan Voucher!
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}