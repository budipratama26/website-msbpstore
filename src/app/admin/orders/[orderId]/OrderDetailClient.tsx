"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ShoppingCart, User, Package, CreditCard, Clock, Check, Loader2, Hash, Mail, FileText, Globe, Bot } from "lucide-react";

const STATUS_OPTIONS = ["PENDING", "PAID", "PROCESSING", "COMPLETED", "CANCELLED", "FAILED"];
const STATUS_COLORS: Record<string, string> = {
    PENDING: "badge-warning",
    PAID: "badge-success",
    PROCESSING: "badge-info",
    COMPLETED: "badge-success",
    CANCELLED: "badge-danger",
    FAILED: "badge-danger",
};

export default function OrderDetailClient({ order }: { order: any }) {
    const router = useRouter();
    const [status, setStatus] = useState(order.status);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleUpdateStatus = async () => {
        if (status === order.status) return;
        setLoading(true);
        setSuccess(false);
        try {
            const res = await fetch("/api/admin/orders", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId: order.orderId, status }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setSuccess(true);
            router.refresh();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 0", borderBottom: "var(--border-default)" }} className="last:border-0 last:pb-0">
            <div style={{ width: "34px", height: "34px", background: "var(--accent-muted)", border: "1px solid var(--accent-border)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon style={{ width: "15px", height: "15px", color: "var(--accent-primary)" }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "var(--text-muted)", marginBottom: "3px" }}>{label}</p>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", wordBreak: "break-all" }}>{value || "-"}</p>
            </div>
        </div>
    );

    return (
        <div style={{ maxWidth: "900px", paddingBottom: "80px" }} className="space-y-5">
            <div className="page-header" style={{ borderBottom: "var(--border-default)", paddingBottom: "16px" }}>
                <Link href="/admin/orders" className="back-btn" style={{ flexShrink: 0 }}>
                    <ChevronLeft style={{ width: "18px", height: "18px" }} />
                </Link>
                <div>
                    <h1 style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "10px" }}>
                        <ShoppingCart style={{ width: "20px", height: "20px", color: "var(--accent-primary)" }} />
                        Detail Pesanan
                    </h1>
                    <p style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 500, marginTop: "4px" }}>Order ID <span style={{ color: "var(--accent-primary)", fontWeight: 700, fontFamily: "monospace" }}>{order.orderId}</span></p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Customer Info */}
                <div className="card" style={{ padding: "20px" }}>
                    <h3 className="label-text" style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "var(--border-default)", paddingBottom: "10px", marginBottom: "4px" }}>
                        <User style={{ width: "14px", height: "14px" }} /> Informasi Pelanggan
                    </h3>
                    <div className="space-y-0">
                        <InfoRow icon={Hash} label="ID Pesanan" value={order.orderId} />
                        <InfoRow icon={Mail} label="Email Pembeli" value={order.customer_email || "-"} />
                        <InfoRow icon={FileText} label="Nomor / Target" value={order.customer_no || "-"} />
                        <InfoRow icon={order.buyerSource === 'telegram' ? Bot : Globe} label="Nama Pemesan" value={order.userName || order.customer_email || "Guest"} />
                        <InfoRow icon={Hash} label="Sumber Checkout" value={order.buyerSource === 'telegram' ? 'Telegram Bot' : 'Website'} />
                        <InfoRow icon={Clock} label="Tanggal Buat" value={new Date(order.createdAt).toLocaleString("id-ID")} />
                    </div>
                </div>

                {/* Product & Payment */}
                <div className="card" style={{ padding: "20px" }}>
                    <h3 className="label-text" style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "var(--border-default)", paddingBottom: "10px", marginBottom: "4px" }}>
                        <Package style={{ width: "14px", height: "14px" }} /> Produk &amp; Pembayaran
                    </h3>
                    <div className="space-y-0">
                        <InfoRow icon={Package} label="Produk Layanan" value={order.product?.name || "Unknown Product"} />
                        <InfoRow icon={CreditCard} label="Harga Satuan" value={order.product ? `Rp ${order.product.price.toLocaleString("id-ID")}` : "-"} />
                        <InfoRow icon={FileText} label="Kategori Game" value={order.product?.category?.name || "-"} />
                        <div style={{ marginTop: "12px", padding: "14px", background: "var(--bg-elevated)", border: "var(--border-default)", borderRadius: "var(--radius-lg)" }} className="space-y-3">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>Status Saat Ini</span>
                                <span className={`badge ${STATUS_COLORS[order.status] || "badge-neutral"}`}>{order.status}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "10px", borderTop: "var(--border-default)" }}>
                                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>Ref ID Provider</span>
                                <span style={{ fontFamily: "monospace", fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)" }}>{order.provider_ref_id || "-"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Fields */}
            {order.custom_fields && Object.keys(order.custom_fields).length > 0 && (
                <div className="card" style={{ padding: "20px" }}>
                    <h3 className="label-text" style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "var(--border-default)", paddingBottom: "10px", marginBottom: "16px" }}>
                        <FileText style={{ width: "14px", height: "14px" }} /> Data Input Formulir
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {Object.entries(order.custom_fields as Record<string, string>).map(([key, value]) => (
                            <div key={key} style={{ padding: "14px", background: "var(--bg-elevated)", border: "var(--border-default)", borderRadius: "var(--radius-lg)" }}>
                                <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "var(--text-muted)", marginBottom: "4px" }}>{key}</p>
                                <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Status Update */}
            <div className="card" style={{ padding: "20px" }}>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "20px" }}>
                    <div style={{ maxWidth: "400px" }}>
                        <h3 style={{ fontWeight: 700, fontSize: "15px", color: "var(--text-primary)", marginBottom: "6px" }}>Perbarui Status Pesanan</h3>
                        <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6 }}>Gunakan ini untuk mengubah status secara manual jika fulfillment otomatis gagal.</p>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
                        <select
                            value={status}
                            onChange={e => setStatus(e.target.value)}
                            className="form-input"
                            style={{ paddingTop: "9px", paddingBottom: "9px", minWidth: "160px" }}
                        >
                            {STATUS_OPTIONS.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                        <button onClick={handleUpdateStatus} disabled={loading || status === order.status} className="btn btn-primary">
                            {loading ? <Loader2 style={{ width: "15px", height: "15px", animation: "spin 0.7s linear infinite" }} /> : success ? <Check style={{ width: "15px", height: "15px" }} /> : null}
                            Simpan Perubahan
                        </button>
                    </div>
                </div>
                {success && (
                    <div style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 700, color: "var(--success)", background: "var(--success-muted)", padding: "12px 16px", borderRadius: "var(--radius-md)", border: "1px solid rgba(16,185,129,0.3)" }}>
                        <Check style={{ width: "15px", height: "15px" }} /> Status pesanan berhasil diperbarui
                    </div>
                )}
            </div>
        </div>
    );
}
