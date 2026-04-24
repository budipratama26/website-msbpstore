"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Plus, Trash2, TicketPercent, Edit, Loader2, Search, X,
    Calendar, Hash, Tag, Percent, BadgeCheck, BadgeX
} from "lucide-react";

interface Voucher {
    id: string;
    code: string;
    description: string | null;
    discountType: string;
    discountValue: number;
    maxDiscount: number | null;
    minPurchase: number | null;
    usageLimit: number | null;
    usageCount: number;
    perUserLimit: number;
    active: boolean;
    expiresAt: string | null;
    categoryId: string | null;
    categoryName: string | null;
    totalUsages: number;
    createdAt: string;
}

interface Category {
    id: string;
    name: string;
}

export default function VouchersClient({
    initialVouchers,
    categories
}: {
    initialVouchers: Voucher[];
    categories: Category[];
}) {
    const router = useRouter();
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    const filtered = initialVouchers.filter(v => {
        const q = search.toLowerCase();
        return (
            v.code.toLowerCase().includes(q) ||
            (v.description || "").toLowerCase().includes(q) ||
            (v.categoryName || "").toLowerCase().includes(q)
        );
    });

    const handleDelete = async (id: string, code: string) => {
        if (!confirm(`Hapus voucher "${code}"?`)) return;
        setDeleteId(id);
        try {
            const res = await fetch(`/api/admin/vouchers?id=${id}`, { method: "DELETE" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            router.refresh();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setDeleteId(null);
        }
    };

    const toggleActive = async (id: string, currentActive: boolean) => {
        try {
            const res = await fetch("/api/admin/vouchers", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, active: !currentActive })
            });
            if (!res.ok) throw new Error("Gagal mengubah status");
            router.refresh();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const formatDiscount = (v: Voucher) => {
        if (v.discountType === "PERCENTAGE") {
            return `${v.discountValue}%${v.maxDiscount ? ` (max Rp ${v.maxDiscount.toLocaleString("id-ID")})` : ""}`;
        }
        return `Rp ${v.discountValue.toLocaleString("id-ID")}`;
    };

    const getStatus = (v: Voucher) => {
        if (!v.active) return { label: "Nonaktif", cls: "badge-danger" };
        if (v.expiresAt && new Date(v.expiresAt) < new Date()) return { label: "Expired", cls: "badge-warning" };
        if (v.usageLimit && v.usageCount >= v.usageLimit) return { label: "Habis", cls: "badge-neutral" };
        return { label: "Aktif", cls: "badge-success" };
    };

    return (
        <div className="space-y-5">
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
                <div>
                    <h1 style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "10px" }}>
                        <TicketPercent style={{ width: "20px", height: "20px", color: "var(--accent-primary)" }} />
                        Manajemen Voucher
                    </h1>
                    <p style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 500, marginTop: "4px" }}>Kelola kupon diskon untuk pelanggan.</p>
                </div>
                <Link href="/admin/vouchers/create" className="btn btn-primary" style={{ textDecoration: "none" }}>
                    <Plus style={{ width: "15px", height: "15px" }} />
                    Buat Voucher
                </Link>
            </div>

            <div style={{ position: "relative", width: "100%", maxWidth: "380px" }}>
                <Search style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: "var(--text-muted)", pointerEvents: "none" }} />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari kode voucher..." className="form-input form-input-icon" style={{ paddingRight: search ? "36px" : undefined }} />
                {search && (
                    <button onClick={() => setSearch("")} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                        <X style={{ width: "14px", height: "14px" }} />
                    </button>
                )}
            </div>

            {/* Stats Summary */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }} className="lg:grid-cols-4">
                {[
                    { label: "Total Voucher", value: initialVouchers.length, color: "var(--text-primary)" },
                    { label: "Aktif", value: initialVouchers.filter(v => v.active && (!v.expiresAt || new Date(v.expiresAt) > new Date())).length, color: "var(--success)" },
                    { label: "Expired", value: initialVouchers.filter(v => v.expiresAt && new Date(v.expiresAt) < new Date()).length, color: "var(--warning)" },
                    { label: "Total Pemakaian", value: initialVouchers.reduce((sum, v) => sum + v.usageCount, 0), color: "var(--text-primary)" },
                ].map(({ label, value, color }) => (
                    <div key={label} className="card" style={{ padding: "16px", textAlign: "center" }}>
                        <p style={{ fontSize: "10px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "2px", color: "var(--text-muted)", marginBottom: "4px" }}>{label}</p>
                        <p style={{ fontSize: "24px", fontWeight: 900, color }}>{value}</p>
                    </div>
                ))}
            </div>

            {/* Voucher Table */}
            <div className="card" style={{ overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                    <table className="tbl" style={{ minWidth: "1000px" }}>
                        <thead style={{ background: "var(--bg-elevated)" }}>
                            <tr>
                                <th>Kode</th>
                                <th>Diskon</th>
                                <th>Scope</th>
                                <th>Min. Beli</th>
                                <th>Pemakaian</th>
                                <th>Batas/User</th>
                                <th>Expired</th>
                                <th>Status</th>
                                <th style={{ textAlign: "right" }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((v) => {
                                const status = getStatus(v);
                                return (
                                    <tr key={v.id}>
                                        <td>
                                            <span style={{ fontWeight: 800, fontSize: "13px", color: "var(--text-primary)", background: "var(--bg-elevated)", padding: "4px 10px", borderRadius: "var(--radius-sm)", border: "var(--border-default)", fontFamily: "monospace", letterSpacing: "1px" }}>
                                                {v.code}
                                            </span>
                                            {v.description && <p style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "4px", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.description}</p>}
                                        </td>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                {v.discountType === "PERCENTAGE"
                                                    ? <Percent style={{ width: "13px", height: "13px", color: "var(--accent-primary)" }} />
                                                    : <Tag style={{ width: "13px", height: "13px", color: "var(--accent-primary)" }} />}
                                                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{formatDiscount(v)}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--accent-primary)", background: "var(--accent-muted)", padding: "3px 10px", borderRadius: "var(--radius-full)", border: "1px solid var(--accent-border)" }}>
                                                {v.categoryName || "SEMUA"}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)" }}>
                                            {v.minPurchase ? `Rp ${v.minPurchase.toLocaleString("id-ID")}` : "—"}
                                        </td>
                                        <td style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                                            {v.usageCount}{v.usageLimit ? `/${v.usageLimit}` : "/∞"}
                                        </td>
                                        <td style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)" }}>{v.perUserLimit}x</td>
                                        <td style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)" }}>
                                            {v.expiresAt ? new Date(v.expiresAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                                        </td>
                                        <td>
                                            <button onClick={() => toggleActive(v.id, v.active)} className={`badge ${status.cls}`} style={{ cursor: "pointer", border: "none" }}>
                                                {status.label}
                                            </button>
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
                                                <Link href={`/admin/vouchers/${v.id}/edit`} style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-elevated)", border: "var(--border-default)", borderRadius: "var(--radius-md)", color: "var(--text-muted)", textDecoration: "none", transition: "all 150ms ease" }} className="hover:border-[var(--accent-border)] hover:text-[var(--accent-primary)]">
                                                    <Edit style={{ width: "14px", height: "14px" }} />
                                                </Link>
                                                <button onClick={() => handleDelete(v.id, v.code)} disabled={deleteId === v.id} style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-elevated)", border: "var(--border-default)", borderRadius: "var(--radius-md)", color: "var(--text-muted)", cursor: "pointer", transition: "all 150ms ease", opacity: deleteId === v.id ? 0.5 : 1 }} className="hover:border-[rgba(239,68,68,0.4)] hover:text-[var(--error)]">
                                                    {deleteId === v.id ? <Loader2 style={{ width: "14px", height: "14px", animation: "spin 0.7s linear infinite" }} /> : <Trash2 style={{ width: "14px", height: "14px" }} />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filtered.length === 0 && (
                                <tr><td colSpan={9} className="p-0 border-b-0">
                                    <div className="empty-state" style={{ border: "none", borderRadius: 0, background: "transparent" }}>
                                        <div className="empty-icon"><TicketPercent style={{ width: "22px", height: "22px" }} /></div>
                                        <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>Belum ada voucher</p>
                                        <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Buat voucher pertama Anda.</p>
                                    </div>
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
