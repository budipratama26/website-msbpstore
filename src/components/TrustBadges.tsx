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
                        border: "var(--border-default)",
                        borderRadius: "var(--radius-lg)",
                        padding: "16px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                        gap: "10px",
                        transition: "border-color 150ms ease",
                    }}
                    className="hover:border-[var(--accent-border)]"
                >
                    <div
                        style={{
                            width: "40px",
                            height: "40px",
                            background: badge.iconBg,
                            borderRadius: "var(--radius-md)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <badge.icon style={{ width: "18px", height: "18px", color: badge.iconColor }} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.3, marginBottom: "4px" }}>
                            {badge.title}
                        </h3>
                        <p style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 500, lineHeight: 1.4 }}>{badge.desc}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
