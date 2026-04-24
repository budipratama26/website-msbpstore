"use client";

import { useState } from "react";
import { Search, Loader2, CheckCircle2, Clock, XCircle, Package, Receipt, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export default function StatusPage() {
    const [orderId, setOrderId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [order, setOrder] = useState<any>(null);

    const checkStatus = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orderId.trim()) return;

        setLoading(true);
        setError("");
        setOrder(null);

        try {
            const res = await fetch(`/api/orders/status/${encodeURIComponent(orderId.trim())}`);
            
            // Check content type before parsing
            const contentType = res.headers.get("content-type") || "";
            if (!contentType.includes("application/json")) {
                setError("Pesanan tidak ditemukan. Pastikan Order ID sudah benar.");
                return;
            }

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Pesanan tidak ditemukan.");
            } else {
                setOrder(data);
            }
        } catch (err) {
            setError("Pesanan tidak ditemukan. Pastikan Order ID sudah benar.");
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status.toUpperCase()) {
            case "SUCCESS":
            case "COMPLETED":
            case "PAID":    return "badge-success";
            case "PENDING": return "badge-warning";
            case "FAILED":
            case "CANCELLED": return "badge-danger";
            default: return "badge-neutral";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toUpperCase()) {
            case "SUCCESS":
            case "COMPLETED":
            case "PAID":
                return <CheckCircle2 className="w-4 h-4" />;
            case "PENDING":
                return <Clock className="w-4 h-4" />;
            case "FAILED":
            case "CANCELLED":
                return <XCircle className="w-4 h-4" />;
            default:
                return <Package className="w-4 h-4" />;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status.toUpperCase()) {
            case "SUCCESS": return "BERHASIL";
            case "PENDING": return "MENUNGGU PEMBAYARAN";
            case "CANCELLED": return "DIBATALKAN";
            case "FAILED": return "GAGAL";
            default: return status.toUpperCase();
        }
    };

    return (
        <div style={{ minHeight: "calc(100vh - var(--header-height, 56px))", background: "var(--bg-base)", padding: "24px 16px 60px" }}>
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                <div className="card p-6 sm:p-8" style={{ minHeight: "400px" }}>
                    
                    {/* Header */}
                    <div className="page-header" style={{ marginBottom: "24px", borderBottom: "1px solid var(--bg-border)", paddingBottom: "24px" }}>
                        <div className="page-header-icon">
                            <Search className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>Cek Status Pesanan</h1>
                            <p style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 500, marginTop: "2px" }}>Lacak status top-up kamu dengan Order ID.</p>
                        </div>
                    </div>

                    {/* Search Box */}
                    <div style={{ marginBottom: "24px" }}>
                        <form onSubmit={checkStatus} style={{ position: "relative" }}>
                            <Search style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", width: "15px", height: "15px", color: "var(--text-muted)", pointerEvents: "none" }} />
                            <input
                                type="text"
                                placeholder="Masukkan nomor pesanan Anda"
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                                className="form-input form-input-icon"
                                style={{ paddingRight: "96px" }}
                            />
                            <button
                                type="submit"
                                disabled={loading || !orderId.trim()}
                                className="btn btn-primary btn-sm"
                                style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)" }}
                            >
                                {loading ? <Loader2 style={{ width: "14px", height: "14px", animation: "spin 0.7s linear infinite" }} /> : "Cari"}
                            </button>
                        </form>
                    </div>

                    {/* Content Area */}
                    <div style={{ minHeight: "200px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                        {/* Error */}
                        {error && (
                            <div style={{ background: "var(--error-muted)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "var(--radius-xl)", padding: "32px 20px", textAlign: "center" }}>
                                <XCircle style={{ width: "36px", height: "36px", color: "var(--error)", margin: "0 auto 10px", opacity: 0.5 }} />
                                <p style={{ color: "var(--error)", fontWeight: 700, fontSize: "14px", marginBottom: "4px" }}>{error}</p>
                                <p style={{ color: "var(--text-muted)", fontSize: "12px" }}>Pastikan Order ID yang kamu masukkan sudah benar.</p>
                            </div>
                        )}

                        {/* Empty State */}
                        {!order && !error && !loading && (
                            <div className="empty-state" style={{ border: "none", background: "transparent" }}>
                                <div className="empty-icon">
                                    <Receipt className="w-6 h-6" />
                                </div>
                                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>Masukkan Order ID</h3>
                                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>Cari status transaksi top-up kamu di sini.</p>
                                <Link href="/" style={{ color: "var(--accent-primary)", fontWeight: 600, fontSize: "13px", textDecoration: "none" }}>
                                    Lihat Katalog Game →
                                </Link>
                            </div>
                        )}

                        {/* Order Result */}
                        {order && (
                            <div style={{ overflow: "hidden", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-xl)", background: "var(--bg-base)" }}>
                        <div style={{ padding: "20px" }}>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className="flex gap-4 flex-1 min-w-0">
                                    <div style={{ width: "44px", height: "44px", borderRadius: "var(--radius-md)", background: "var(--accent-muted)", border: "1px solid var(--accent-border)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <Package style={{ width: "20px", height: "20px", color: "var(--accent-primary)" }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "15px", lineHeight: 1.3, marginBottom: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{order.productName}</h3>
                                        <p style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>{order.categoryName}</p>
                                        <span style={{ fontSize: "11px", fontFamily: "monospace", color: "var(--text-muted)", background: "var(--bg-elevated)", border: "var(--border-default)", padding: "2px 8px", borderRadius: "var(--radius-sm)", display: "inline-block", marginTop: "6px" }}>#{order.orderId}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <span className={`badge ${getStatusStyle(order.status)} flex items-center gap-1.5`}>
                                        {getStatusIcon(order.status)}
                                        {getStatusLabel(order.status)}
                                    </span>
                                </div>
                            </div>
                            <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "var(--border-default)" }}>
                                <span className="label-text" style={{ display: "block", marginBottom: "4px" }}>Waktu Transaksi</span>
                                <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                                    {new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>

                        {order.sn && (
                            <div style={{ borderTop: "var(--border-default)", background: "var(--success-muted)", padding: "16px 20px" }}>
                                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                                    <div style={{ width: "34px", height: "34px", background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.4)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
                                        <CheckCircle2 style={{ width: "16px", height: "16px", color: "var(--success)" }} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p className="label-text" style={{ color: "var(--success)", marginBottom: "8px" }}>Serial Number / Keterangan</p>
                                        <div style={{ background: "var(--bg-elevated)", padding: "12px", borderRadius: "var(--radius-md)", border: "1px solid rgba(16,185,129,0.3)", fontFamily: "monospace", fontSize: "14px", fontWeight: 700, color: "var(--success)", userSelect: "all", cursor: "copy", wordBreak: "break-all" }}>
                                            {order.sn}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div style={{ borderTop: "var(--border-default)", padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }} className="sm:flex-row sm:justify-between">
                            <p style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>Ada kendala? Hubungi CS kami.</p>
                            <a href="https://wa.me/62895324802172" target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                                Hubungi CS <ChevronRight style={{ width: "13px", height: "13px" }} />
                            </a>
                        </div>
                    </div>
                )}
                    </div>
                </div>
            </div>
        </div>
    );
}
