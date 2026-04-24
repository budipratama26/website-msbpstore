"use client";

import { CreditCard, ChevronLeft, Layout } from "lucide-react";
import Link from "next/link";

export default function SubscriptionsPage() {
    return (
        <div style={{ minHeight: "calc(100vh - var(--header-height, 56px))", background: "var(--bg-base)", padding: "24px 16px 40px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: "100%", maxWidth: "540px" }}>

                {/* Header with Back Button */}
                <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
                    <Link href="/profile" className="back-btn" title="Kembali">
                        <ChevronLeft style={{ width: "18px", height: "18px" }} />
                    </Link>
                    <h1 style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>Paket Langganan</h1>
                </div>

                {/* Empty State Card */}
                <div className="card empty-state" style={{ padding: "60px 32px" }}>
                    <div className="empty-icon">
                        <CreditCard style={{ width: "24px", height: "24px" }} />
                    </div>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em", marginBottom: "8px" }}>Belum Ada Langganan</h3>
                    <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.7, maxWidth: "280px", marginBottom: "24px" }}>
                        Anda belum memiliki paket langganan aktif. Telusuri layanan kami untuk mulai berlangganan.
                    </p>
                    <Link href="/" className="btn btn-primary">
                        <Layout style={{ width: "15px", height: "15px" }} />
                        Telusuri Toko
                    </Link>
                </div>
            </div>
        </div>
    );
}
