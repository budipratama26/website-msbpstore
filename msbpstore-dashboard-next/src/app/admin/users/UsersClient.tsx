"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Shield, UserCircle, Trash2, Loader2, ChevronDown, Search, X, Bot, Globe, Coins } from "lucide-react";

interface WebUser {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    avatar: string | null;
    points: number;
    createdAt: string;
}

interface TelegramUserData {
    id: string;
    telegramId: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    createdAt: string;
}

export default function UsersClient({ initialWebUsers, initialTelegramUsers }: { initialWebUsers: WebUser[]; initialTelegramUsers: TelegramUserData[] }) {
    const router = useRouter();
    const [loadingAction, setLoadingAction] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState<'web' | 'telegram'>('web');

    const filteredWeb = initialWebUsers.filter(u => {
        const q = search.toLowerCase();
        return (
            (u.name || "").toLowerCase().includes(q) ||
            (u.email || "").toLowerCase().includes(q) ||
            u.role.toLowerCase().includes(q)
        );
    });

    const filteredTelegram = initialTelegramUsers.filter(t => {
        const q = search.toLowerCase();
        return (
            (t.username || "").toLowerCase().includes(q) ||
            (t.firstName || "").toLowerCase().includes(q) ||
            (t.lastName || "").toLowerCase().includes(q) ||
            t.telegramId.includes(q)
        );
    });

    const handleRoleChange = async (userId: string, newRole: string) => {
        setLoadingAction(`role-${userId}`);
        try {
            const res = await fetch("/api/admin/users", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: userId, role: newRole }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            router.refresh();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoadingAction(null);
        }
    };

    const handleAdjustPoints = async (userId: string, name: string) => {
        const amount = prompt(`Masukkan jumlah penyesuaian poin untuk ${name}:\n(Gunakan angka negatif untuk mengurangi, misal: -100)`, "100");
        if (!amount || isNaN(parseInt(amount))) return;

        setLoadingAction(`points-${userId}`);
        try {
            const res = await fetch("/api/admin/users/points", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, amount: parseInt(amount) }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            router.refresh();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoadingAction(null);
        }
    };

    const handleDelete = async (userId: string, name: string) => {
        if (!confirm(`Hapus pengguna "${name}"? Tindakan ini tidak bisa dibatalkan.`)) return;
        setLoadingAction(`del-${userId}`);
        try {
            const res = await fetch(`/api/admin/users?id=${userId}`, { method: "DELETE" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            router.refresh();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoadingAction(null);
        }
    };

    return (
        <div className="space-y-5">
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px", borderBottom: "var(--border-default)", paddingBottom: "16px" }}>
                <div>
                    <h1 style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "10px" }}>
                        <User style={{ width: "20px", height: "20px", color: "var(--accent-primary)" }} />
                        Manajemen Pengguna
                    </h1>
                    <p style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 500, marginTop: "4px" }}>Kelola pengguna website dan telegram.</p>
                </div>
            </div>

            {/* Tab Switcher & Search Row */}
            <div className="card" style={{ padding: "12px 16px", display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", background: "var(--bg-base)", padding: "4px", borderRadius: "var(--radius-lg)", border: "var(--border-default)" }}>
                    {([['web', Globe, `Website (${initialWebUsers.length})`], ['telegram', Bot, `Telegram (${initialTelegramUsers.length})`]] as const).map(([tab, Icon, label]) => (
                        <button
                            key={tab}
                            onClick={() => { setActiveTab(tab); setSearch(""); }}
                            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 20px", borderRadius: "var(--radius-md)", fontSize: "12px", fontWeight: 700, border: "none", cursor: "pointer", transition: "all 150ms ease", background: activeTab === tab ? "var(--bg-surface)" : "transparent", color: activeTab === tab ? "var(--accent-primary)" : "var(--text-muted)", boxShadow: activeTab === tab ? "var(--shadow-sm)" : "none" }}
                        >
                            <Icon style={{ width: "14px", height: "14px" }} />
                            {label}
                        </button>
                    ))}
                </div>
                <div style={{ position: "relative", width: "100%", maxWidth: "320px" }}>
                    <Search style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: "var(--text-muted)", pointerEvents: "none" }} />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari pengguna..." className="form-input form-input-icon" style={{ paddingRight: search ? "36px" : undefined }} />
                    {search && (
                        <button onClick={() => setSearch("")} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                            <X style={{ width: "14px", height: "14px" }} />
                        </button>
                    )}
                </div>
            </div>

            {/* Table Container */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    {activeTab === 'web' ? (
                        <table className="tbl min-w-[900px]">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Profil Pengguna</th>
                                    <th>Poin Belanja</th>
                                    <th>Role</th>
                                    <th>Registrasi</th>
                                    <th className="text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                            {filteredWeb.map((u) => (
                                <tr key={u.id}>
                                    <td style={{ fontFamily: "monospace", color: "var(--text-muted)", fontSize: "12px" }}>#{u.id.slice(-4)}</td>
                                    <td>
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                            <div style={{ width: "36px", height: "36px", borderRadius: "var(--radius-md)", background: "var(--accent-muted)", border: "1px solid var(--accent-border)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                                                {u.avatar ? <img src={u.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <UserCircle style={{ width: "20px", height: "20px", color: "var(--accent-primary)" }} />}
                                            </div>
                                            <div style={{ display: "flex", flexDirection: "column" }}>
                                                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.3 }}>{u.name || 'Anonymous User'}</span>
                                                <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{u.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                            <Coins style={{ width: "14px", height: "14px", color: "var(--gold)" }} />
                                            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{u.points.toLocaleString("id-ID")}</span>
                                            <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 700 }}>PTS</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ position: "relative", display: "inline-block", width: "100%", maxWidth: "130px" }}>
                                            <select
                                                value={u.role}
                                                onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                                disabled={loadingAction === `role-${u.id}`}
                                                className="form-input"
                                                style={{ paddingTop: "6px", paddingBottom: "6px", fontSize: "12px", paddingRight: "28px", appearance: "none", cursor: "pointer", background: u.role === 'admin' ? "var(--accent-primary)" : undefined, color: u.role === 'admin' ? "#fff" : undefined, border: u.role === 'admin' ? "1px solid var(--accent-primary)" : undefined }}
                                            >
                                                <option value="admin">ADMIN</option>
                                                <option value="customer">CUSTOMER</option>
                                            </select>
                                            <ChevronDown style={{ width: "13px", height: "13px", position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: u.role === 'admin' ? "rgba(255,255,255,0.7)" : "var(--text-muted)" }} />
                                        </div>
                                    </td>
                                    <td style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>{new Date(u.createdAt).toLocaleDateString("id-ID")}</td>
                                    <td style={{ textAlign: "right" }}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
                                            <button onClick={() => handleAdjustPoints(u.id, u.name || u.email || 'User')} disabled={loadingAction === `points-${u.id}`} title="Adjust Points" style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-elevated)", border: "var(--border-default)", borderRadius: "var(--radius-md)", cursor: "pointer", color: "var(--text-muted)", transition: "all 150ms ease", opacity: loadingAction === `points-${u.id}` ? 0.5 : 1 }} className="hover:border-[var(--accent-border)] hover:text-[var(--accent-primary)]">
                                                {loadingAction === `points-${u.id}` ? <Loader2 style={{ width: "14px", height: "14px", animation: "spin 0.7s linear infinite" }} /> : <Coins style={{ width: "14px", height: "14px" }} />}
                                            </button>
                                            <button onClick={() => handleDelete(u.id, u.name || u.email || 'User')} disabled={loadingAction === `del-${u.id}`} style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-elevated)", border: "var(--border-default)", borderRadius: "var(--radius-md)", cursor: "pointer", color: "var(--text-muted)", transition: "all 150ms ease", opacity: loadingAction === `del-${u.id}` ? 0.5 : 1 }} className="hover:border-[rgba(239,68,68,0.4)] hover:text-[var(--error)]">
                                                {loadingAction === `del-${u.id}` ? <Loader2 style={{ width: "14px", height: "14px", animation: "spin 0.7s linear infinite" }} /> : <Trash2 style={{ width: "14px", height: "14px" }} />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                                {filteredWeb.length === 0 && (
                                    <tr><td colSpan={6} className="p-0 border-b-0">
                                        <div className="empty-state" style={{ border: "none", borderRadius: 0, background: "transparent" }}>
                                            <div className="empty-icon"><Globe style={{ width: "22px", height: "22px" }} /></div>
                                            <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" }}>Pengguna tidak ditemukan</p>
                                            <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Gunakan kata kunci pencarian lainnya.</p>
                                        </div>
                                    </td></tr>
                                )}
                            </tbody>
                        </table>
                    ) : (
                        <table className="tbl min-w-[800px]">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Profil Telegram</th>
                                    <th>Telegram User ID</th>
                                    <th>Terdaftar Pada</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTelegram.map((t) => (
                                    <tr key={t.id}>
                                        <td style={{ fontFamily: "monospace", color: "var(--text-muted)", fontSize: "12px" }}>#{t.id.slice(-4)}</td>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                <div style={{ width: "36px", height: "36px", borderRadius: "var(--radius-md)", background: "var(--info-muted)", border: "1px solid rgba(56,189,248,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                    <Bot style={{ width: "16px", height: "16px", color: "var(--info)" }} />
                                                </div>
                                                <div style={{ display: "flex", flexDirection: "column" }}>
                                                    <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.3 }}>
                                                        {t.username ? `@${t.username}` : (t.firstName || 'Anonymous Bot')}
                                                    </span>
                                                    {t.firstName && <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{[t.firstName, t.lastName].filter(Boolean).join(' ')}</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ fontSize: "12px", fontFamily: "monospace", fontWeight: 700, color: "var(--info)", background: "var(--info-muted)", padding: "3px 10px", borderRadius: "var(--radius-sm)", border: "1px solid rgba(56,189,248,0.3)" }}>
                                                {t.telegramId}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>{new Date(t.createdAt).toLocaleDateString("id-ID")}</td>
                                    </tr>
                                ))}
                                {filteredTelegram.length === 0 && (
                                    <tr><td colSpan={4} className="p-0 border-b-0">
                                        <div className="empty-state" style={{ border: "none", borderRadius: 0, background: "transparent" }}>
                                            <div className="empty-icon"><Bot style={{ width: "22px", height: "22px" }} /></div>
                                            <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" }}>Bot user tidak ditemukan</p>
                                            <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Gunakan kata kunci pencarian lainnya.</p>
                                        </div>
                                    </td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
