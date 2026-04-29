"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, X, TrendingUp, Gamepad2, RotateCw, ChevronRight } from "lucide-react";
import CategoryImage from "./CategoryImage";
import BannerCarousel from "@/components/BannerCarousel";
import FlashSale from "@/components/FlashSale";
import TrustBadges from "@/components/TrustBadges";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface Banner {
    id: string;
    imageUrl: string;
    linkUrl?: string | null;
    title?: string | null;
}

interface Category {
    id: string;
    name: string;
    slug: string;
    image: string | null;
    active: boolean;
}

export default function HomeClientWrapper({
    categories,
    banners = [],
}: {
    categories: Category[];
    banners?: Banner[];
}) {
    const { data: session, status } = useSession();
    const [searchQuery, setSearchQuery] = useState("");
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);

    useEffect(() => {
        if (status === "authenticated") {
            setLoadingOrders(true);
            fetch("/api/user/orders")
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        const successOrders = data.filter(o => ["SUCCESS", "COMPLETED", "PAID"].includes(o.status?.toUpperCase() || ""));
                        const uniqueOrders: any[] = [];
                        const seen = new Set();
                        for (const o of successOrders) {
                            if (!o.categorySlug || !o.productId) continue;
                            const key = `${o.productId}-${o.target}`;
                            if (!seen.has(key)) {
                                seen.add(key);
                                uniqueOrders.push(o);
                                if (uniqueOrders.length >= 5) break;
                            }
                        }
                        setRecentOrders(uniqueOrders);
                    }
                })
                .catch(e => console.error(e))
                .finally(() => setLoadingOrders(false));
        }
    }, [status]);

    const filteredCategories = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return categories;
        return categories.filter((cat) => {
            const name = cat.name.toLowerCase();
            return name.includes(query) || name.replace(/[\s_]/g, "").includes(query.replace(/[\s_]/g, ""));
        });
    }, [searchQuery, categories]);

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg-base)", color: "var(--text-primary)", display: "flex", flexDirection: "column" }}>

            {/* Hero / Banner Section */}
            <section
                style={{
                    background: "var(--bg-surface)",
                    borderBottom: "1px solid var(--bg-border)",
                    padding: "0 16px 24px",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Decorative indigo glow — subtle, di pojok kiri */}
                <div
                    style={{
                        position: "absolute",
                        top: "-60px",
                        left: "-60px",
                        width: "280px",
                        height: "280px",
                        background: "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)",
                        pointerEvents: "none",
                        zIndex: 0,
                    }}
                />
                {/* Decorative glow kanan */}
                <div
                    style={{
                        position: "absolute",
                        bottom: "-40px",
                        right: "-40px",
                        width: "200px",
                        height: "200px",
                        background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
                        pointerEvents: "none",
                        zIndex: 0,
                    }}
                />

                <div className="max-w-5xl mx-auto space-y-4 relative" style={{ zIndex: 1, paddingTop: "4px" }}>

                    {banners.length > 0 && (
                        <div className="overflow-hidden py-4 -mx-4 px-4 sm:mx-0 sm:px-0">
                            <BannerCarousel banners={banners} />
                        </div>
                    )}

                    <div style={{ textAlign: "center", paddingTop: banners.length === 0 ? "16px" : "0" }}>
                        <h1
                            style={{
                                fontSize: "clamp(22px, 4vw, 34px)",
                                fontWeight: 800,
                                letterSpacing: "-0.03em",
                                marginBottom: "10px",
                                lineHeight: 1.15,
                            }}
                        >
                            Top Up{" "}
                            <span
                                style={{
                                    background: "linear-gradient(135deg, var(--accent-primary) 0%, #a5b4fc 100%)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text",
                                }}
                            >
                                Game
                            </span>
                        </h1>
                        <p
                            style={{
                                color: "var(--text-secondary)",
                                fontSize: "13px",
                                maxWidth: "380px",
                                margin: "0 auto",
                                lineHeight: 1.65,
                                fontWeight: 400,
                            }}
                        >
                            Top up game favoritmu di{" "}
                            <span style={{ fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                                MSBP Store
                            </span>
                            .{" "}Proses instan 24 jam, harga termurah &amp; terpercaya.
                        </p>
                    </div>
                </div>
            </section>

            {/* Sticky Search Bar */}
            <div
                style={{
                    position: "sticky",
                    zIndex: 90,
                    background: "rgba(6,8,15,0.94)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    borderBottom: "1px solid var(--bg-border)",
                    boxShadow: "0 2px 16px rgba(0,0,0,0.4)",
                    padding: "10px 16px",
                    top: "60px",
                }}
            >
                <div className="max-w-lg mx-auto relative">
                    <Search
                        style={{
                            position: "absolute",
                            left: "13px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: "14px",
                            height: "14px",
                            color: "var(--text-muted)",
                            pointerEvents: "none",
                        }}
                    />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari game pilihanmu..."
                        style={{
                            width: "100%",
                            background: "var(--bg-elevated)",
                            border: "1px solid var(--bg-border)",
                            borderRadius: "var(--radius-md)",
                            padding: "9px 36px 9px 38px",
                            fontSize: "13px",
                            color: "var(--text-primary)",
                            outline: "none",
                            transition: "border-color 180ms ease, box-shadow 180ms ease",
                            fontFamily: "inherit",
                        }}
                        onFocus={(e) => {
                            e.currentTarget.style.borderColor = "var(--accent-border)";
                            e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-glow)";
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.borderColor = "var(--bg-border)";
                            e.currentTarget.style.boxShadow = "none";
                        }}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            style={{
                                position: "absolute",
                                right: "11px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                color: "var(--text-muted)",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                padding: 0,
                                transition: "color 150ms ease",
                            }}
                            className="hover:text-[var(--text-primary)]"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <section style={{ padding: "24px 16px", flex: 1 }}>
                <div className="max-w-5xl mx-auto space-y-8">

                    {/* Beli Lagi */}
                    {!searchQuery && status === "authenticated" && !loadingOrders && recentOrders.length > 0 && (
                        <div className="animate-fade-in">
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <RotateCw style={{ width: "14px", height: "14px", color: "var(--accent-primary)" }} />
                                    <h2 style={{ fontWeight: 700, fontSize: "13px", color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
                                        Beli Lagi
                                    </h2>
                                </div>
                                <Link
                                    href="/history"
                                    style={{
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        color: "var(--accent-primary)",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "2px",
                                        textDecoration: "none",
                                        transition: "opacity 150ms ease",
                                        letterSpacing: "0.01em",
                                    }}
                                    className="hover:opacity-70"
                                >
                                    Riwayat <ChevronRight style={{ width: "12px", height: "12px" }} />
                                </Link>
                            </div>

                            <div className="flex overflow-x-auto gap-3 pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x hide-scrollbar">
                                {recentOrders.map((order, idx) => {
                                    const params = new URLSearchParams();
                                    params.set("productId", order.productId);
                                    if (order.customFields) {
                                        Object.entries(order.customFields).forEach(([k, v]) => params.set(k, String(v)));
                                    }
                                    const checkoutUrl = `/category/${order.categorySlug}?${params.toString()}`;
                                    const targetStr = order.target || "";
                                    const maskedTarget = targetStr.length > 5
                                        ? targetStr.substring(0, 3) + "***" + targetStr.substring(targetStr.length - 2)
                                        : targetStr;

                                    return (
                                        <Link
                                            key={`${order.id}-${idx}`}
                                            href={checkoutUrl}
                                            style={{
                                                minWidth: "200px",
                                                maxWidth: "240px",
                                                flexShrink: 0,
                                                background: "var(--bg-surface)",
                                                border: "1px solid var(--bg-border)",
                                                borderRadius: "var(--radius-lg)",
                                                padding: "12px",
                                                display: "flex",
                                                gap: "12px",
                                                transition: "border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease",
                                                textDecoration: "none",
                                                scrollSnapAlign: "start",
                                            }}
                                            className="hover:border-[var(--accent-border)] hover:-translate-y-0.5 hover:shadow-[0_4px_20px_var(--accent-glow)]"
                                        >
                                            <div
                                                style={{
                                                    width: "40px",
                                                    height: "40px",
                                                    background: "var(--bg-elevated)",
                                                    borderRadius: "var(--radius-md)",
                                                    border: "1px solid var(--bg-border)",
                                                    overflow: "hidden",
                                                    flexShrink: 0,
                                                    position: "relative",
                                                }}
                                            >
                                                {order.categoryImage ? (
                                                    <img src={order.categoryImage} alt={order.productCategory} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Gamepad2 style={{ width: "16px", height: "16px", color: "var(--text-muted)", position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
                                                )}
                                            </div>
                                            <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1, justifyContent: "space-between" }}>
                                                <h3 style={{
                                                    fontWeight: 700,
                                                    fontSize: "12px",
                                                    color: "var(--text-primary)",
                                                    letterSpacing: "-0.01em",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                    lineHeight: 1.3,
                                                }}>
                                                    {order.productName}
                                                </h3>
                                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px" }}>
                                                    <span style={{
                                                        fontSize: "10px",
                                                        fontWeight: 500,
                                                        color: "var(--text-muted)",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        whiteSpace: "nowrap",
                                                        marginRight: "8px",
                                                    }}>
                                                        {maskedTarget}
                                                    </span>
                                                    <span style={{
                                                        fontSize: "11px",
                                                        fontWeight: 700,
                                                        color: "var(--accent-primary)",
                                                        flexShrink: 0,
                                                        letterSpacing: "0.02em",
                                                    }}>
                                                        Beli
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Game Categories */}
                    <div className="animate-fade-in">
                        {!searchQuery && (
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                                <TrendingUp style={{ width: "14px", height: "14px", color: "var(--accent-primary)" }} />
                                <h2 style={{ fontWeight: 700, fontSize: "13px", color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
                                    Semua Game
                                </h2>
                                <span
                                    style={{
                                        fontSize: "11px",
                                        fontWeight: 600,
                                        color: "var(--text-muted)",
                                        background: "var(--bg-elevated)",
                                        border: "1px solid var(--bg-border)",
                                        padding: "2px 8px",
                                        borderRadius: "var(--radius-full)",
                                    }}
                                >
                                    {categories.length}
                                </span>
                            </div>
                        )}

                        {searchQuery && (
                            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px", fontWeight: 500 }}>
                                {filteredCategories.length > 0
                                    ? `${filteredCategories.length} game ditemukan`
                                    : `Tidak ada game untuk "${searchQuery}"`}
                            </p>
                        )}

                        {filteredCategories.length > 0 ? (
                            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 sm:gap-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
                                {filteredCategories.map((category) => (
                                    <Link
                                        key={category.id}
                                        href={`/category/${category.slug}`}
                                        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "7px", textDecoration: "none", outline: "none" }}
                                        className="group"
                                    >
                                        <div
                                            style={{
                                                position: "relative",
                                                width: "100%",
                                                aspectRatio: "1 / 1",
                                                borderRadius: "var(--radius-lg)",
                                                overflow: "hidden",
                                                border: "1px solid var(--bg-border)",
                                                background: "var(--bg-surface)",
                                                boxShadow: "var(--shadow-sm)",
                                                transition: "border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease",
                                            }}
                                            className="group-hover:border-[var(--accent-border)] group-hover:shadow-[0_4px_20px_var(--accent-glow)] group-hover:-translate-y-1"
                                        >
                                            <CategoryImage
                                                src={category.image}
                                                alt={category.name}
                                                sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 15vw"
                                                className="absolute inset-0 w-full h-full object-cover"
                                            />
                                            {/* Indigo overlay on hover */}
                                            <div
                                                style={{
                                                    position: "absolute",
                                                    inset: 0,
                                                    background: "var(--accent-subtle)",
                                                    opacity: 0,
                                                    transition: "opacity 180ms ease",
                                                }}
                                                className="group-hover:opacity-100"
                                            />
                                        </div>
                                        <h3
                                            style={{
                                                fontSize: "10px",
                                                fontWeight: 600,
                                                color: "var(--text-muted)",
                                                textAlign: "center",
                                                overflow: "hidden",
                                                display: "-webkit-box",
                                                WebkitLineClamp: 1,
                                                WebkitBoxOrient: "vertical" as any,
                                                textTransform: "uppercase",
                                                letterSpacing: "0.06em",
                                                padding: "0 2px",
                                                transition: "color 180ms ease",
                                            }}
                                            className="group-hover:text-[var(--accent-primary)] sm:text-[10px]"
                                        >
                                            {category.name}
                                        </h3>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-icon">
                                    <Search className="w-5 h-5" />
                                </div>
                                <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                                    Game tidak ditemukan
                                </p>
                                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                                    Coba gunakan kata kunci lain
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Trust Badges */}
            <section style={{ padding: "0 16px 28px" }}>
                <div className="max-w-5xl mx-auto">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                        <Gamepad2 style={{ width: "14px", height: "14px", color: "var(--accent-primary)" }} />
                        <h2 style={{ fontWeight: 700, fontSize: "13px", color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
                            Kenapa MSBP Store?
                        </h2>
                    </div>
                    <TrustBadges />
                </div>
            </section>

            <Footer />
        </div>
    );
}