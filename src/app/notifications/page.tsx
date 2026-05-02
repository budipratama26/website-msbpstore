"use client";

import { useState, useEffect } from "react";
import { Bell, Info, CheckCircle2, Megaphone, AlertCircle, ChevronLeft, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { NotificationSkeleton } from "@/components/Skeletons";

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
}

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string; border: string; label: string }> = {
    SUCCESS: { icon: <CheckCircle2 style={{ width: "18px", height: "18px" }} />, color: "var(--success)", bg: "var(--success-muted)", border: "rgba(52,211,153,0.3)", label: "Sukses" },
    PROMO: { icon: <Megaphone style={{ width: "18px", height: "18px" }} />, color: "var(--info)", bg: "var(--info-muted)", border: "rgba(96,165,250,0.3)", label: "Promo" },
    WARNING: { icon: <AlertCircle style={{ width: "18px", height: "18px" }} />, color: "var(--error)", bg: "var(--error-muted)", border: "rgba(248,113,113,0.3)", label: "Peringatan" },
    INFO: { icon: <Info style={{ width: "18px", height: "18px" }} />, color: "var(--accent-primary)", bg: "var(--accent-muted)", border: "var(--accent-border)", label: "Info" },
};

function timeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return "Baru saja";
    if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} hari lalu`;
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export default function NotificationsPage() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");
    const unreadCount = notifications.filter(n => !n.isRead).length;

    const fetchNotifications = async () => {
        try {
            const res = await fetch("/api/notifications");
            if (res.ok) setNotifications(await res.json());
        } catch {} finally { setLoading(false); }
    };

    useEffect(() => { fetchNotifications(); }, []);

    const markAsRead = async (id?: string) => {
        try {
            const res = await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(id ? { id } : { all: true }) });
            if (res.ok) setNotifications(prev => id ? prev.map(n => n.id === id ? { ...n, isRead: true } : n) : prev.map(n => ({ ...n, isRead: true })));
        } catch {}
    };

    const filtered = filter === "UNREAD" ? notifications.filter(n => !n.isRead) : notifications;

    if (loading) return <NotificationSkeleton />;

    return (
        <div style={{ minHeight: "calc(100vh - var(--header-height, 60px))", background: "var(--bg-base)", padding: "24px 16px 40px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: "100%", maxWidth: "640px" }}>
                <div className="card animate-fade-in" style={{ padding: "24px", position: "relative" }}>

                    <button onClick={() => router.back()} className="back-btn" style={{ position: "absolute", top: "20px", left: "20px", zIndex: 10 }} title="Kembali">
                        <ChevronLeft style={{ width: "18px", height: "18px" }} />
                    </button>

                    {/* Header */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "24px", marginTop: "36px" }}>
                        <div style={{ width: "52px", height: "52px", background: "var(--accent-muted)", border: "1px solid var(--accent-border)", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                            <Bell style={{ width: "22px", height: "22px", color: "var(--accent-primary)" }} />
                        </div>
                        <h1 style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)", textAlign: "center", marginBottom: "6px" }}>Notifikasi</h1>
                        <p style={{ fontSize: "13px", color: "var(--text-muted)", textAlign: "center", marginBottom: unreadCount > 0 ? "16px" : "0" }}>
                            {unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : "Semua sudah dibaca, up to date!"}
                        </p>
                        {unreadCount > 0 && (
                            <button onClick={() => markAsRead()} className="btn btn-primary btn-sm">
                                <Check style={{ width: "13px", height: "13px" }} />
                                Tandai Semua Dibaca
                            </button>
                        )}
                    </div>

                    {/* Filter Tabs */}
                    <div style={{ display: "flex", gap: "8px", marginBottom: "24px", paddingBottom: "24px", borderBottom: "1px solid var(--bg-border)" }}>
                        {(["ALL", "UNREAD"] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                style={{ padding: "6px 16px", borderRadius: "var(--radius-full)", fontSize: "12px", fontWeight: 600, border: "none", cursor: "pointer", transition: "all 200ms ease", background: filter === f ? "var(--accent-primary)" : "var(--bg-elevated)", color: filter === f ? "#fff" : "var(--text-muted)" }}
                            >
                                {f === "ALL" ? "Semua" : `Belum Dibaca${unreadCount > 0 ? ` (${unreadCount})` : ""}`}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    {filtered.length === 0 ? (
                        <div className="empty-state" style={{ border: "none", background: "transparent" }}>
                            <div className="empty-icon"><Bell style={{ width: "24px", height: "24px" }} /></div>
                            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                                {filter === "UNREAD" ? "Semua sudah dibaca!" : "Belum ada notifikasi"}
                            </h3>
                            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                                {filter === "UNREAD" ? "Kamu sudah up to date 🎉" : "Notifikasi akan muncul di sini"}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filtered.map((notif) => {
                                const cfg = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.INFO;
                                const isUnread = !notif.isRead;
                                return (
                                    <div
                                        key={notif.id}
                                        onClick={() => isUnread && markAsRead(notif.id)}
                                        style={{ position: "relative", display: "flex", gap: "14px", padding: "16px", borderRadius: "var(--radius-xl)", border: `1px solid ${isUnread ? cfg.border : "var(--bg-border)"}`, background: isUnread ? cfg.bg : "var(--bg-elevated)", cursor: isUnread ? "pointer" : "default", transition: "border-color 200ms ease, background 200ms ease" }}
                                    >
                                        {isUnread && (
                                            <div style={{ position: "absolute", left: "8px", top: "50%", transform: "translateY(-50%)", width: "5px", height: "5px", borderRadius: "50%", background: "var(--accent-primary)" }} />
                                        )}
                                        <div style={{ width: "40px", height: "40px", borderRadius: "var(--radius-lg)", border: `1px solid ${cfg.border}`, background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: cfg.color }}>
                                            {cfg.icon}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px", marginBottom: "4px" }}>
                                                <h3 style={{ fontSize: "13px", fontWeight: isUnread ? 700 : 500, color: isUnread ? "var(--text-primary)" : "var(--text-secondary)", lineHeight: 1.3 }}>{notif.title}</h3>
                                                <span style={{ fontSize: "11px", color: "var(--text-muted)", flexShrink: 0, marginTop: "1px", whiteSpace: "nowrap" }}>{timeAgo(notif.createdAt)}</span>
                                            </div>
                                            <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "8px" }}>{notif.message}</p>
                                            <span style={{ fontSize: "10px", fontWeight: 700, padding: "3px 10px", borderRadius: "var(--radius-full)", border: `1px solid ${cfg.border}`, background: cfg.bg, color: cfg.color }}>
                                                {cfg.label}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div style={{ paddingTop: "28px", textAlign: "center" }}>
                        <p style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 500 }}>MSBP Store Notification System</p>
                    </div>
                </div>
            </div>
        </div>
    );
}