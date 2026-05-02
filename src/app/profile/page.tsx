"use client";

import { User as UserIcon, ChevronLeft, ChevronRight, Lock, Coins, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function ProfilePage() {
    const { data: session } = useSession();
    const [stats, setStats] = useState({ points: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/user/points")
            .then(res => res.json())
            .then(data => { if (!data.error) setStats({ points: data.points || 0 }); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const menuItems = [
        { title: "Poin Belanja", icon: <Coins className="w-5 h-5" style={{ color: "var(--accent-primary)" }} />, href: "/profile/redeem", description: "Lihat riwayat perolehan poin belanja Anda" },
        { title: "Keamanan Akun", icon: <Lock className="w-5 h-5" style={{ color: "var(--accent-primary)" }} />, href: "/profile/security", description: "Kelola keamanan akun & hapus akun secara permanen" },
    ];

    return (
        <div style={{ minHeight: "calc(100vh - var(--header-height, 60px))", background: "var(--bg-base)", padding: "24px 16px 40px", display: "flex", flexDirection: "column", alignItems: "center", position: "relative", overflow: "hidden" }}>


            <div style={{ width: "100%", maxWidth: "520px", position: "relative", zIndex: 1 }}>
                <div className="card space-y-5 animate-fade-in" style={{ padding: "24px 24px 28px", position: "relative" }}>

                    {/* Back */}
                    <Link href="/" className="back-btn" style={{ position: "absolute", top: "20px", left: "20px", zIndex: 10 }} title="Kembali ke Beranda">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>

                    {/* Header */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "24px" }}>
                        <h1 style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>Akun Saya</h1>
                    </div>

                    {/* User Info Card */}
                    <div className="card-lg" style={{ padding: "24px" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                            {/* Avatar with glow */}
                            <div style={{
                                width: "72px",
                                height: "72px",
                                background: "linear-gradient(135deg, var(--accent-primary), var(--accent-hover))",
                                border: "1px solid var(--accent-border)",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: "16px",
                                boxShadow: "none",
                            }}>
                                <UserIcon style={{ width: "32px", height: "32px", color: "#fff" }} />
                            </div>
                            <h2 style={{ fontSize: "18px", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text-primary)", textTransform: "uppercase", marginBottom: "4px" }}>
                                {session?.user?.name || "Member Store"}
                            </h2>
                            <p style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>
                                {session?.user?.email || "Belum terhubung email"}
                            </p>
                            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px", marginTop: "12px" }}>
                                <span className="badge badge-primary">{(session?.user as any)?.role || "USER"}</span>
                                <span className="badge badge-success">Verified Member 💎</span>
                            </div>
                        </div>
                    </div>

                    {/* Points Card */}
                    <div className="card" style={{ padding: "16px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{
                                    width: "38px",
                                    height: "38px",
                                    background: "var(--gold-muted)",
                                    borderRadius: "var(--radius-md)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                }}>
                                    <Coins style={{ width: "18px", height: "18px", color: "var(--gold)" }} />
                                </div>
                                <div>
                                    <p className="label-text" style={{ marginBottom: "3px" }}>Total Poin Belanja</p>
                                    <p style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em", lineHeight: 1 }}>
                                        {loading ? "..." : stats.points.toLocaleString("id-ID")}
                                        <span style={{ fontSize: "11px", color: "var(--gold)", fontWeight: 700, marginLeft: "4px" }}>PTS</span>
                                    </p>
                                </div>
                            </div>
                            <Link href="/profile/redeem" className="btn btn-primary btn-sm" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                Tukar <ArrowUpRight style={{ width: "13px", height: "13px" }} />
                            </Link>
                        </div>
                    </div>

                    {/* Menu List */}
                    <div className="card" style={{ overflow: "hidden" }}>
                        <div style={{ padding: "12px 16px", borderBottom: "var(--border-default)", background: "var(--bg-elevated)" }}>
                            <p className="label-text">Pusat Layanan &amp; Akun</p>
                        </div>
                        <div>
                            {menuItems.map((item, idx) => (
                                <Link
                                    href={item.href}
                                    key={idx}
                                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: idx < menuItems.length - 1 ? "var(--border-default)" : "none", transition: "background 150ms ease", textDecoration: "none" }}
                                    className="hover:bg-[var(--bg-elevated)] group"
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                                        <div style={{ width: "38px", height: "38px", background: "var(--bg-elevated)", border: "var(--border-default)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "border-color 180ms ease, background 180ms ease" }} className="group-hover:border-[var(--accent-border)] group-hover:bg-[var(--accent-subtle)]">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.3 }}>{item.title}</h3>
                                            <p style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500, marginTop: "2px" }}>{item.description}</p>
                                        </div>
                                    </div>
                                    <ChevronRight style={{ width: "15px", height: "15px", color: "var(--text-muted)", transition: "color 150ms ease, transform 150ms ease" }} className="group-hover:text-[var(--accent-primary)] group-hover:translate-x-0.5" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Help */}
                    <p style={{ textAlign: "center", fontSize: "12px", color: "var(--text-muted)", fontWeight: 500, padding: "0 16px", lineHeight: 1.6 }}>
                        Ada kendala? Hubungi <span style={{ color: "var(--accent-primary)", fontWeight: 600 }}>Customer Service</span> kami yang tersedia 24/7.
                    </p>
                </div>
            </div>
        </div>
    );
}