"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { useSession } from "next-auth/react";
import BlackHoleLogo from "./BlackHoleLogo";

export default function Footer() {
    const pathname = usePathname();
    const { data: session } = useSession();

    if (pathname?.startsWith("/admin")) return null;

    return (
        <footer style={{ background: "var(--bg-surface)", borderTop: "var(--border-default)", marginTop: "auto" }}>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

                {/* Top */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 mb-6">
                    {/* Brand */}
                    <div className="flex items-center gap-2.5">
                        <BlackHoleLogo size="sm" />
                        <div>
                            <span style={{ fontWeight: 800, fontSize: "15px", letterSpacing: "-0.02em", color: "var(--text-primary)", display: "block", lineHeight: 1.2 }}>
                                MSBPSTORE
                            </span>
                            <p style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>Pusat Top Up Game Terpercaya</p>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
                        {[
                            { label: "Game", href: "/" },
                            { label: "Cek Status", href: "/status" },
                            ...(session
                                ? [{ label: "Riwayat", href: "/history" }]
                                : [{ label: "Masuk", href: "/login" }, { label: "Daftar", href: "/register" }]
                            ),
                        ].map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                style={{
                                    fontSize: "13px",
                                    fontWeight: 500,
                                    color: "var(--text-secondary)",
                                    textDecoration: "none",
                                    transition: "color 150ms ease",
                                }}
                                className="hover:text-[var(--text-primary)]"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div style={{ height: "1px", background: "var(--bg-border)", marginBottom: "20px" }} />

                {/* Bottom */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>
                        © {new Date().getFullYear()} MSBP Store. All rights reserved.
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>
                        <ShieldCheck style={{ width: "13px", height: "13px", color: "var(--success)", flexShrink: 0 }} />
                        <span>Transaksi Aman &amp; Terenkripsi</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
