"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Receipt, Clock, CheckCircle2, XCircle, Search, ShoppingBag, Package, ChevronRight, Copy, Check } from "lucide-react";
import Link from "next/link";
import HistorySkeleton from "@/components/HistorySkeleton";

interface Order {
    id: string;
    productName: string;
    productCategory: string;
    target: string;
    price: number;
    status: string;
    createdAt: string;
    paymentData?: string;
}

export default function OrderHistoryPage() {
    const { data: session, status: sessionStatus } = useSession();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedQrOrder, setSelectedQrOrder] = useState<Order | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(text);
        setTimeout(() => setCopiedId(null), 2000);
    };

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (selectedQrOrder && selectedQrOrder.status === "PENDING" && !paymentSuccess) {
            const orderTime = new Date(selectedQrOrder.createdAt).getTime();
            const expiresAt = orderTime + (15 * 60 * 1000);
            const updateTimer = () => {
                const now = new Date().getTime();
                const diff = Math.max(0, Math.floor((expiresAt - now) / 1000));
                setTimeLeft(diff);
                if (diff <= 0) { clearInterval(timer); fetchOrders(); }
            };
            updateTimer();
            timer = setInterval(updateTimer, 1000);
        }
        return () => clearInterval(timer);
    }, [selectedQrOrder, paymentSuccess]);

    useEffect(() => {
        let pollTimer: NodeJS.Timeout;
        if (selectedQrOrder && !paymentSuccess) {
            pollTimer = setInterval(async () => {
                try {
                    const res = await fetch(`/api/orders/status/${selectedQrOrder.id}`);
                    if (res.ok) {
                        const data = await res.json();
                        if (["PAID", "COMPLETED", "PROCESSING"].includes(data.status)) {
                            setPaymentSuccess(true);
                            fetchOrders();
                            setTimeout(() => { setSelectedQrOrder(null); setPaymentSuccess(false); }, 3000);
                        }
                    }
                } catch {}
            }, 3000);
        }
        return () => { if (pollTimer) clearInterval(pollTimer); };
    }, [selectedQrOrder, paymentSuccess]);

    const handleCloseModal = () => { setSelectedQrOrder(null); setPaymentSuccess(false); };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        if (sessionStatus === "authenticated") {
            fetchOrders();
            const interval = setInterval(fetchOrders, 30000);
            return () => clearInterval(interval);
        } else if (sessionStatus === "unauthenticated") { setLoading(false); }
    }, [sessionStatus]);

    const isExpired = (createdAt: string) => {
        return (new Date().getTime() - new Date(createdAt).getTime()) > (15 * 60 * 1000);
    };

    const fetchOrders = async () => {
        try {
            const res = await fetch("/api/user/orders");
            const data = await res.json();
            if (res.ok) setOrders(data);
        } catch (error) { console.error("Failed to fetch orders:", error); }
        finally { setLoading(false); }
    };

    const filteredOrders = orders.filter(order =>
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.productName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case "success": case "completed": case "paid": return <CheckCircle2 className="w-4 h-4" />;
            case "pending": return <Clock className="w-4 h-4" />;
            case "failed": case "cancelled": return <XCircle className="w-4 h-4" />;
            default: return <Package className="w-4 h-4" />;
        }
    };

    if (sessionStatus === "loading" || loading) return <HistorySkeleton />;

    if (sessionStatus === "unauthenticated") return (
        <div style={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 24px 24px", textAlign: "center" }}>
            <div style={{ background: "var(--accent-muted)", border: "1px solid var(--accent-border)", borderRadius: "50%", width: "80px", height: "80px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px" }}>
                <Receipt style={{ width: "36px", height: "36px", color: "var(--accent-primary)" }} />
            </div>
            <h1 style={{ fontSize: "28px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: "12px" }}>Akses Terbatas</h1>
            <p style={{ color: "var(--text-secondary)", maxWidth: "400px", marginBottom: "32px", fontSize: "14px", lineHeight: 1.65 }}>Halaman Riwayat Pesanan hanya dapat diakses oleh member yang sudah login.</p>
            <Link href="/login" className="btn btn-primary">Masuk Sekarang</Link>
        </div>
    );

    return (
        <div style={{ minHeight: "calc(100vh - var(--header-height, 60px))", background: "var(--bg-base)", padding: "24px 16px 40px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: "100%", maxWidth: "900px" }}>
                <div className="card animate-fade-in" style={{ padding: "20px" }}>

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div className="page-header mb-0">
                            <div className="page-header-icon"><Receipt className="w-5 h-5" /></div>
                            <div>
                                <h1 style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>Riwayat Pesanan</h1>
                                <p style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 500, marginTop: "2px" }}>Pantau semua transaksi top-up game Anda.</p>
                            </div>
                        </div>
                        <div style={{ position: "relative", width: "100%", maxWidth: "300px" }}>
                            <Search style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", width: "15px", height: "15px", color: "var(--text-muted)", pointerEvents: "none" }} />
                            <input type="text" placeholder="Cari ID Pesanan atau Game..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="form-input form-input-icon" />
                        </div>
                    </div>

                    {/* Orders */}
                    <div className="space-y-3">
                        {filteredOrders.length > 0 ? filteredOrders.map((order) => {
                            const currentStatus = order.status === "PENDING" && isExpired(order.createdAt) ? "CANCELLED" : order.status;
                            const badgeClass = ["SUCCESS","COMPLETED","PAID"].includes(currentStatus.toUpperCase()) ? "badge-success" : currentStatus.toUpperCase() === "PENDING" ? "badge-warning" : "badge-danger";

                            return (
                                <div key={order.id} style={{ background: "var(--bg-elevated)", border: "var(--border-default)", borderRadius: "var(--radius-lg)", padding: "16px", transition: "border-color 150ms ease" }} className="hover:border-[var(--accent-border)]">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                        <div className="flex gap-3 flex-1 min-w-0">
                                            <div style={{ width: "44px", height: "44px", borderRadius: "var(--radius-md)", background: "var(--accent-muted)", border: "1px solid var(--accent-border)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-primary)" }}>
                                                <ShoppingBag style={{ width: "20px", height: "20px" }} />
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <h3 style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "14px", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{order.productName}</h3>
                                                <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>{order.productCategory}</span>
                                                <div style={{ marginTop: "6px" }}>
                                                    <button
                                                        onClick={() => copyToClipboard(order.id)}
                                                        style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--text-muted)", fontSize: "10px", fontFamily: "monospace", background: "var(--bg-surface)", border: "var(--border-default)", padding: "2px 8px", borderRadius: "var(--radius-sm)", cursor: "pointer", transition: "border-color 150ms ease" }}
                                                        className="hover:border-[var(--accent-border)]"
                                                        title="Salin Order ID"
                                                    >
                                                        {order.id.length > 20 ? `${order.id.slice(0, 8)}...${order.id.slice(-6)}` : order.id}
                                                        {copiedId === order.id ? <Check style={{ width: "10px", height: "10px", color: "var(--success)" }} /> : <Copy style={{ width: "10px", height: "10px" }} />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px" }}>
                                            <div>
                                                <span className="label-text" style={{ display: "block", marginBottom: "2px" }}>Data Tujuan</span>
                                                <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }} title={order.target}>{order.target.length > 10 ? order.target.slice(0, 10) + "…" : order.target}</span>
                                            </div>
                                            <div style={{ minWidth: "80px" }}>
                                                <span className="label-text" style={{ display: "block", marginBottom: "2px" }}>Total</span>
                                                <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>Rp {order.price.toLocaleString('id-ID')}</span>
                                            </div>
                                            <div style={{ minWidth: "90px" }}>
                                                <span className="label-text" style={{ display: "block", marginBottom: "2px" }}>Waktu</span>
                                                <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                                                    {new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-end sm:ml-auto">
                                            <span className={`badge ${badgeClass} inline-flex justify-center min-w-[100px]`}>
                                                {getStatusIcon(currentStatus)}
                                                {currentStatus === "CANCELLED" ? "BATAL" : ["COMPLETED","PAID","SUCCESS"].includes(currentStatus.toUpperCase()) ? "SUKSES" : currentStatus.toUpperCase()}
                                            </span>
                                            {currentStatus === "PENDING" && order.paymentData && (
                                                <button onClick={() => setSelectedQrOrder(order)} className="btn btn-primary btn-sm">Bayar</button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="empty-state">
                                <div className="empty-icon"><ShoppingBag className="w-6 h-6" /></div>
                                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>Belum ada pesanan</h3>
                                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>Mulai top-up game favoritmu sekarang!</p>
                                <Link href="/" style={{ color: "var(--accent-primary)", fontWeight: 600, fontSize: "13px", textDecoration: "none" }}>Lihat Katalog Game →</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* QR Modal */}
            {selectedQrOrder && (
                <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-overlay)", backdropFilter: "blur(6px)", padding: "16px" }}>
                    <div style={{ background: "var(--bg-surface)", border: "var(--border-default)", borderRadius: "var(--radius-xl)", width: "100%", maxWidth: "380px", overflow: "hidden", boxShadow: "var(--shadow-lg)", position: "relative" }} className="animate-scale-in">
                        <div style={{ background: "var(--bg-elevated)", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "var(--border-default)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{ width: "34px", height: "34px", background: "var(--accent-muted)", border: "1px solid var(--accent-border)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Receipt style={{ width: "16px", height: "16px", color: "var(--accent-primary)" }} />
                                </div>
                                <div>
                                    <h3 style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "15px" }}>Lanjutkan Pembayaran</h3>
                                    <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>Order ID: {selectedQrOrder.id}</p>
                                </div>
                            </div>
                            <button onClick={handleCloseModal} className="btn btn-ghost btn-sm" style={{ padding: "6px" }}>
                                <XCircle style={{ width: "18px", height: "18px" }} />
                            </button>
                        </div>

                        {!paymentSuccess && (
                            <div style={{ padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontWeight: 700, fontSize: "12px", letterSpacing: "0.06em", background: timeLeft > 60 ? "var(--warning-muted)" : "var(--error-muted)", color: timeLeft > 60 ? "var(--warning)" : "var(--error)", borderBottom: "var(--border-default)" }}>
                                <Clock style={{ width: "13px", height: "13px", flexShrink: 0 }} />
                                {timeLeft > 0 ? `Sisa Waktu: ${formatTime(timeLeft)}` : "Waktu Pembayaran Habis"}
                            </div>
                        )}

                        {paymentSuccess ? (
                            <div style={{ padding: "32px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                                <div style={{ width: "72px", height: "72px", background: "var(--success-muted)", border: "1px solid rgba(52,211,153,0.4)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
                                    <CheckCircle2 style={{ width: "36px", height: "36px", color: "var(--success)" }} />
                                </div>
                                <h3 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>Pembayaran Berhasil!</h3>
                                <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Pesanan Anda sedang diproses. Menutup otomatis...</p>
                            </div>
                        ) : (
                            <div style={{ padding: "20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                                    <p className="label-text" style={{ marginBottom: "4px" }}>Total Pembayaran</p>
                                    <div style={{ fontWeight: 800, fontSize: "24px", color: "var(--text-primary)", opacity: timeLeft === 0 ? 0.4 : 1, letterSpacing: "-0.02em" }}>
                                        Rp {selectedQrOrder.price.toLocaleString("id-ID")}
                                    </div>
                                </div>
                                <div style={{ background: "var(--bg-elevated)", padding: "12px", borderRadius: "var(--radius-lg)", border: `2px dashed ${timeLeft === 0 ? "var(--bg-border)" : "var(--accent-border)"}`, marginBottom: "20px", opacity: timeLeft === 0 ? 0.4 : 1, position: "relative" }}>
                                    <div style={{ width: "176px", height: "176px", position: "relative" }}>
                                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(selectedQrOrder.paymentData || "")}`} alt="QRIS Code" style={{ width: "100%", height: "100%", objectFit: "contain", filter: timeLeft === 0 ? "grayscale(1)" : "none" }} />
                                        {timeLeft === 0 && (
                                            <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                <div style={{ background: "var(--error)", color: "#fff", fontWeight: 700, fontSize: "11px", padding: "4px 12px", borderRadius: "9999px", textTransform: "uppercase", letterSpacing: "0.08em", transform: "rotate(-10deg)" }}>Expired</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div style={{ width: "100%", background: "var(--bg-elevated)", borderRadius: "var(--radius-md)", padding: "12px 14px", border: "var(--border-default)" }}>
                                    <p style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500, textAlign: "center", lineHeight: 1.6 }}>
                                        Scan kode QR ini menggunakan e-wallet atau mobile banking Anda.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}