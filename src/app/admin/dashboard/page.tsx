export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import {
    TrendingUp,
    ShoppingCart,
    Package,
    Layers,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    Plus,
    Lightbulb,
} from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [paidOrders, totalOrders, totalProducts, totalCategories, recentOrders, thisMonthOrders, lastMonthOrders] = await Promise.all([
        prisma.order.findMany({ where: { status: "PAID" }, include: { product: true } }),
        prisma.order.count(),
        prisma.product.count(),
        prisma.category.count(),
        prisma.order.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { product: true } }),
        prisma.order.count({ where: { status: "PAID", createdAt: { gte: firstDayThisMonth } } }),
        prisma.order.count({ where: { status: "PAID", createdAt: { gte: firstDayLastMonth, lt: firstDayThisMonth } } }),
    ]);

    const totalRevenue = paidOrders.reduce((sum, order) => sum + (order.product?.price || 0), 0);
    const orderTrend = lastMonthOrders > 0
        ? (((thisMonthOrders - lastMonthOrders) / lastMonthOrders) * 100).toFixed(1)
        : thisMonthOrders > 0 ? "+100" : "0";

    const stats = [
        { name: "Pendapatan",     value: `Rp ${totalRevenue.toLocaleString("id-ID")}`, icon: TrendingUp,  trend: `${Number(orderTrend) >= 0 ? "+" : ""}${orderTrend}%`, isUp: Number(orderTrend) >= 0 },
        { name: "Total Pesanan",  value: totalOrders.toString(),    icon: ShoppingCart, trend: `${thisMonthOrders} bln ini`, isUp: true },
        { name: "Total Produk",   value: totalProducts.toString(),  icon: Package,      trend: "Live",   isUp: true },
        { name: "Total Kategori", value: totalCategories.toString(),icon: Layers,       trend: "Aktif",  isUp: true },
    ];

    const statusStyle: Record<string, string> = {
        PAID:      "badge-success",
        COMPLETED: "badge-success",
        PENDING:   "badge-warning",
        CANCELLED: "badge-danger",
    };

    return (
        <div className="space-y-5 pb-8">

            {/* Header */}
            <div>
                <h2 style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>Dashboard Overview</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "2px", fontWeight: 400 }}>
                    Selamat datang kembali di pusat kendali MSBP Store.
                </p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {stats.map((stat) => (
                    <div
                        key={stat.name}
                        style={{
                            background: "var(--bg-surface)",
                            border: "var(--border-default)",
                            borderRadius: "var(--radius-lg)",
                            padding: "16px 20px",
                            boxShadow: "var(--shadow-sm)",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
                            <div
                                style={{
                                    width: "38px",
                                    height: "38px",
                                    background: "var(--accent-muted)",
                                    borderRadius: "var(--radius-md)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                }}
                            >
                                <stat.icon style={{ width: "18px", height: "18px", color: "var(--accent-primary)" }} />
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "3px",
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    padding: "3px 7px",
                                    borderRadius: "var(--radius-sm)",
                                    background: stat.isUp ? "var(--success-muted)" : "var(--error-muted)",
                                    color: stat.isUp ? "var(--success)" : "var(--error)",
                                }}
                            >
                                {stat.trend}
                                {stat.isUp
                                    ? <ArrowUpRight style={{ width: "11px", height: "11px" }} />
                                    : <ArrowDownRight style={{ width: "11px", height: "11px" }} />
                                }
                            </div>
                        </div>
                        <p className="label-text" style={{ marginBottom: "4px" }}>{stat.name}</p>
                        <h3 style={{ fontSize: "clamp(18px, 3vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                            {stat.value}
                        </h3>
                    </div>
                ))}
            </div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">

                {/* Orders Table */}
                <div
                    style={{
                        background: "var(--bg-surface)",
                        border: "var(--border-default)",
                        borderRadius: "var(--radius-lg)",
                        overflow: "hidden",
                        boxShadow: "var(--shadow-sm)",
                    }}
                    className="lg:col-span-2"
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "14px 20px",
                            borderBottom: "var(--border-default)",
                        }}
                    >
                        <h3
                            style={{
                                fontWeight: 700,
                                color: "var(--text-primary)",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                fontSize: "14px",
                            }}
                        >
                            <Clock style={{ width: "16px", height: "16px", color: "var(--accent-primary)" }} />
                            Pesanan Terakhir
                        </h3>
                        <Link href="/admin/orders" className="btn btn-secondary btn-sm">
                            Lihat Semua
                        </Link>
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden sm:block overflow-x-auto">
                        <table className="tbl">
                            <thead>
                                <tr>
                                    {["ID Pesanan", "Produk", "Status", "Waktu"].map(h => (
                                        <th key={h}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map((order) => (
                                    <tr key={order.id.toString()}>
                                        <td>
                                            <Link
                                                href={`/admin/orders/${order.orderId}`}
                                                style={{ color: "var(--accent-primary)", fontFamily: "monospace", fontSize: "13px", fontWeight: 700, textDecoration: "none" }}
                                                className="hover:underline"
                                            >
                                                {order.orderId}
                                            </Link>
                                        </td>
                                        <td style={{ maxWidth: "180px" }}>
                                            <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "13px" }}>
                                                {order.product?.name || "Produk dihapus"}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${statusStyle[order.status] || "badge-neutral"}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td style={{ color: "var(--text-muted)", fontSize: "12px", whiteSpace: "nowrap" }}>
                                            {new Date(order.createdAt).toLocaleDateString("id-ID")}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="sm:hidden">
                        {recentOrders.map((order) => (
                            <div
                                key={order.id.toString()}
                                style={{ padding: "14px 16px", borderBottom: "var(--border-default)" }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", marginBottom: "8px" }}>
                                    <Link
                                        href={`/admin/orders/${order.orderId}`}
                                        style={{ color: "var(--accent-primary)", fontFamily: "monospace", fontSize: "13px", fontWeight: 700, textDecoration: "none" }}
                                    >
                                        {order.orderId}
                                    </Link>
                                    <span className={`badge ${statusStyle[order.status] || "badge-neutral"}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.3 }}>
                                    {order.product?.name || "Produk dihapus"}
                                </p>
                                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                                    {new Date(order.createdAt).toLocaleDateString("id-ID")}
                                </p>
                            </div>
                        ))}
                    </div>

                    {recentOrders.length === 0 && (
                        <div className="empty-state" style={{ borderRadius: 0, border: "none" }}>
                            <div className="empty-icon">
                                <Package className="w-6 h-6" />
                            </div>
                            <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>Belum ada pesanan masuk</p>
                            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>Pesanan terbaru akan muncul di sini.</p>
                        </div>
                    )}
                </div>

                {/* Right Column */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                    {/* CTA Card */}
                    <div
                        style={{
                            background: "var(--accent-muted)",
                            border: "1px solid var(--accent-border)",
                            borderRadius: "var(--radius-lg)",
                            padding: "20px 24px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            minHeight: "180px",
                            position: "relative",
                            overflow: "hidden",
                        }}
                    >
                        {/* Decorative circles */}
                        <div style={{ position: "absolute", top: "-32px", right: "-32px", width: "100px", height: "100px", borderRadius: "50%", background: "rgba(124,133,240,0.08)", pointerEvents: "none" }} />
                        <div style={{ position: "absolute", bottom: "-24px", left: "-24px", width: "80px", height: "80px", borderRadius: "50%", background: "rgba(124,133,240,0.04)", pointerEvents: "none" }} />
                        <div style={{ position: "relative", zIndex: 1 }}>
                            <div
                                style={{
                                    width: "36px",
                                    height: "36px",
                                    background: "var(--accent-muted)",
                                    borderRadius: "var(--radius-md)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginBottom: "14px",
                                    border: "1px solid var(--accent-border)",
                                }}
                            >
                                <Package style={{ width: "17px", height: "17px", color: "var(--accent-primary)" }} />
                            </div>
                            <h3 style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "16px", lineHeight: 1.3, marginBottom: "6px" }}>Tambah Produk Baru?</h3>
                            <p style={{ color: "var(--text-secondary)", fontSize: "13px", lineHeight: 1.5 }}>Perluas katalog game hits bulan ini.</p>
                        </div>
                        <Link
                            href="/admin/products/create"
                            className="btn btn-primary"
                            style={{ marginTop: "16px", position: "relative", zIndex: 1 }}
                        >
                            <Plus style={{ width: "15px", height: "15px" }} />
                            Tambah Sekarang
                        </Link>
                    </div>

                    {/* Tip Card */}
                    <div
                        style={{
                            background: "var(--bg-surface)",
                            border: "var(--border-default)",
                            borderRadius: "var(--radius-lg)",
                            flex: 1,
                            padding: "20px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            textAlign: "center",
                            gap: "12px",
                        }}
                    >
                        <div
                            style={{
                                width: "42px",
                                height: "42px",
                                background: "var(--warning-muted)",
                                borderRadius: "var(--radius-md)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Lightbulb style={{ width: "19px", height: "19px", color: "var(--warning)" }} />
                        </div>
                        <div>
                            <h4 style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "14px", marginBottom: "6px" }}>Tip Pintar</h4>
                            <p style={{ color: "var(--text-secondary)", fontSize: "13px", lineHeight: 1.6 }}>
                                Cek kategori paling laris minggu ini di halaman Laporan untuk optimasi stok.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}