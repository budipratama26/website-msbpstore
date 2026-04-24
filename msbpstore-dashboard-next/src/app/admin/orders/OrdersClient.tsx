"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Eye, Package, Search, X } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
    PENDING: "badge-warning",
    PAID: "badge-success",
    PROCESSING: "badge-success",
    COMPLETED: "badge-success",
    CANCELLED: "badge-danger",
    FAILED: "badge-danger",
};

export default function OrdersClient({ initialOrders }: { initialOrders: any[] }) {
    const [search, setSearch] = useState("");

    const filtered = initialOrders.filter(o => {
        const q = search.toLowerCase();
        return (
            o.orderId.toLowerCase().includes(q) ||
            (o.userName || "").toLowerCase().includes(q) ||
            (o.customer_email || "").toLowerCase().includes(q) ||
            (o.productName || "").toLowerCase().includes(q) ||
            (o.target || "").toLowerCase().includes(q) ||
            (o.status || "").toLowerCase().includes(q)
        );
    });

    return (
        <div className="space-y-5">
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px", borderBottom: "var(--border-default)", paddingBottom: "16px" }}>
                <div>
                    <h1 style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "10px" }}>
                        <ShoppingCart style={{ width: "20px", height: "20px", color: "var(--accent-primary)" }} />
                        Manajemen Pesanan
                    </h1>
                    <p style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 500, marginTop: "4px" }}>Pantau dan kelola riwayat transaksi pelanggan.</p>
                </div>
                <div style={{ position: "relative", width: "100%", maxWidth: "380px" }}>
                    <Search style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", width: "15px", height: "15px", color: "var(--text-muted)", pointerEvents: "none" }} />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Cari ID, pesanan..."
                        className="form-input form-input-icon"
                        style={{ paddingRight: "40px" }}
                    />
                    {search && (
                        <button onClick={() => setSearch("")} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", padding: 0, transition: "color 150ms ease" }} className="hover:text-[var(--text-primary)]">
                            <X style={{ width: "15px", height: "15px" }} />
                        </button>
                    )}
                </div>
            </div>

            <div className="card" style={{ overflow: "hidden" }}>
                <div style={{ overflowX: "auto", maxHeight: "calc(100vh - 240px)", overflowY: "auto" }}>
                    <table className="tbl" style={{ minWidth: "1000px" }}>
                        <thead style={{ position: "sticky", top: 0, zIndex: 10, background: "var(--bg-elevated)" }}>
                            <tr>
                                <th>Order ID</th>
                                <th>Pelanggan</th>
                                <th>Produk</th>
                                <th>Data Tujuan</th>
                                <th>Status</th>
                                <th>Waktu</th>
                                <th className="text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((order) => (
                                <tr key={order.orderId}>
                                    <td>
                                        <Link href={`/admin/orders/${order.orderId}`} style={{ color: "var(--accent-primary)", fontFamily: "monospace", fontSize: "13px", fontWeight: 700, textDecoration: "none" }} className="hover:underline">
                                            {order.orderId}
                                        </Link>
                                    </td>
                                    <td>
                                        <div style={{ display: "flex", flexDirection: "column" }}>
                                            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.3 }}>{order.userName || order.customer_email || 'Anonymous'}</span>
                                            <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{order.customer_email || 'Guest'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <Package style={{ width: "14px", height: "14px", color: "var(--accent-primary)", flexShrink: 0 }} />
                                            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "160px" }}>{order.productName || 'Unknown'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: "11px", fontFamily: "monospace", color: "var(--text-muted)", background: "var(--bg-elevated)", border: "var(--border-default)", padding: "3px 8px", borderRadius: "var(--radius-sm)", display: "inline-block", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {order.target}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge ${STATUS_COLORS[order.status] || "badge-neutral"}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: "flex", flexDirection: "column" }}>
                                            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                                                {new Date(order.createdAt).toLocaleDateString("id-ID")}
                                            </span>
                                            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                                                {new Date(order.createdAt).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="text-right">
                                        <Link 
                                            href={`/admin/orders/${order.orderId}`} 
                                            className="btn btn-secondary btn-sm"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            Detail
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="p-0 border-b-0">
                                        <div className="empty-state border-0 rounded-none bg-transparent">
                                            <div className="empty-icon">
                                                <ShoppingCart className="w-6 h-6" />
                                            </div>
                                            <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" }}>Data tidak ditemukan</p>
                                            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>Belum ada transaksi pada periode ini.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {search && filtered.length > 0 && (
                <div className="flex justify-center pt-2">
                    <p className="label-text">
                        Total {filtered.length} Hasil Pencarian
                    </p>
                </div>
            )}
        </div>
    );
}
