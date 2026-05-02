"use client";

import { ShieldCheck, Zap, MessageCircle, Clock } from "lucide-react";

const badges = [
    {
        icon: ShieldCheck,
        title: "Aman & Terenkripsi",
        desc: "Transaksi 100% dilindungi",
        iconColor: "var(--success)",
        iconBg: "var(--success-muted)",
    },
    {
        icon: Zap,
        title: "Proses Instan",
        desc: "Top up masuk dalam hitungan detik",
        iconColor: "var(--warning)",
        iconBg: "var(--warning-muted)",
    },
    {
        icon: MessageCircle,
        title: "CS 24/7",
        desc: "Siap bantu kapan saja",
        iconColor: "var(--info)",
        iconBg: "var(--info-muted)",
    },
    {
        icon: Clock,
        title: "Buka 24 Jam",
        desc: "Layanan nonstop setiap hari",
        iconColor: "var(--accent-primary)",
        iconBg: "var(--accent-subtle)",
    },
];

export default function TrustBadges() {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {badges.map((badge, i) => (
                <div
                    key={i}
                    style={{
                        background: "var(--bg-surface)",
                        border: "1px solid var(--bg-border)",
                        borderRadius: "var(--radius-lg)",
                        padding: "16px 14px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        gap: "12px",
                        transition: "border-color 200ms ease, transform 200ms ease",
                    }}
                    className="hover:border-[var(--bg-elevated)] hover:-translate-y-0.5"
                >
                    <div
                        style={{
                            width: "36px",
                            height: "36px",
                            background: badge.iconBg,
                            borderRadius: "var(--radius-md)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                        }}
                    >
                        <badge.icon style={{ width: "17px", height: "17px", color: badge.iconColor }} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.3, marginBottom: "3px" }}>
                            {badge.title}
                        </h3>
                        <p style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 400, lineHeight: 1.5 }}>{badge.desc}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
