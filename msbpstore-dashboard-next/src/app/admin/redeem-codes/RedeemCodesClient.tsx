"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, Ticket, CheckCircle2, XCircle, Loader2, Search, X } from "lucide-react";

export default function RedeemCodesClient({ initialCodes }: { initialCodes: any[] }) {
    const router = useRouter();
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    const filtered = initialCodes.filter(c => {
        const q = search.toLowerCase();
        return c.code.toLowerCase().includes(q) || (c.productName || "").toLowerCase().includes(q);
    });

    const handleDelete = async (id: string, code: string) => {
        if (!confirm(`Hapus kode redeem "${code}"?`)) return;
        setDeleteId(id);
        try {
            const res = await fetch(`/api/admin/redeem-codes?id=${id}`, { method: "DELETE" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            router.refresh();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setDeleteId(null);
        }
    };

    return (
        <div className="space-y-5">
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
                <div>
                    <h1 style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "10px" }}>
                        <Ticket style={{ width: "20px", height: "20px", color: "var(--accent-primary)" }} />
                        Manajemen Redeem Code
                    </h1>
                    <p style={{ color: "var(--text-muted)", fontSize: "13px", fontWeight: 500, marginTop: "4px" }}>
                        Buat dan atur kode tebusan khusus untuk integrasi Telegram.
                    </p>
                </div>
                <Link href="/admin/redeem-codes/create" className="btn btn-primary">
                    <Plus style={{ width: "15px", height: "15px" }} />
                    Buat Kode Baru
                </Link>
            </div>

            <div style={{ position: "relative", width: "100%", maxWidth: "380px" }}>
                <Search style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: "var(--text-muted)", pointerEvents: "none" }} />
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Cari kode redeem, produk..."
                    className="form-input form-input-icon"
                    style={{ paddingRight: search ? "36px" : undefined }}
                />
                {search && (
                    <button onClick={() => setSearch("")} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                        <X style={{ width: "14px", height: "14px" }} />
                    </button>
                )}
            </div>

            <div className="card overflow-hidden">
                <div style={{ overflowX: "auto" }}>
                    <table className="tbl" style={{ minWidth: "800px" }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: "center" }}>ID</th>
                                <th>Kode Redeem</th>
                                <th>Produk Terkait</th>
                                <th>Reward</th>
                                <th style={{ textAlign: "center" }}>Status</th>
                                <th style={{ textAlign: "right" }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((c) => (
                                <tr key={c.id}>
                                    <td style={{ fontFamily: "monospace", color: "var(--text-muted)", fontSize: "12px", textAlign: "center" }}>#{c.id}</td>
                                    <td>
                                        <span style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-md)", padding: "4px 12px", fontFamily: "monospace", fontSize: "13px", fontWeight: 700, color: "var(--accent-primary)", letterSpacing: "0.08em", display: "inline-block" }}>
                                            {c.code}
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: 700, fontSize: "13px", color: "var(--text-primary)" }}>{c.productName || "Product Removed"}</td>
                                    <td style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500, fontStyle: "italic" }}>{c.reward || "—"}</td>
                                    <td style={{ textAlign: "center" }}>
                                        {c.used ? (
                                            <span className="badge badge-danger" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                                <XCircle style={{ width: "11px", height: "11px" }} /> Terpakai
                                            </span>
                                        ) : (
                                            <span className="badge badge-success" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                                <CheckCircle2 style={{ width: "11px", height: "11px" }} /> Tersedia
                                            </span>
                                        )}
                                    </td>
                                    <td style={{ textAlign: "right" }}>
                                        <button
                                            onClick={() => handleDelete(c.id, c.code)}
                                            disabled={deleteId === c.id}
                                            style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-md)", cursor: "pointer", color: "var(--text-muted)", transition: "all 150ms ease", opacity: deleteId === c.id ? 0.5 : 1, marginLeft: "auto" }}
                                            className="hover:border-[rgba(239,68,68,0.4)] hover:text-[var(--error)]"
                                        >
                                            {deleteId === c.id
                                                ? <Loader2 style={{ width: "14px", height: "14px", animation: "spin 0.7s linear infinite" }} />
                                                : <Trash2 style={{ width: "14px", height: "14px" }} />
                                            }
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-0 border-b-0">
                                        <div className="empty-state" style={{ border: "none", borderRadius: 0, background: "transparent" }}>
                                            <div className="empty-icon"><Ticket style={{ width: "22px", height: "22px" }} /></div>
                                            <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>Kode redeem tidak ditemukan</p>
                                            <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Belum ada kode tebusan yang terdaftar.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
