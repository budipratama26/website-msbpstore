"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    ShoppingCart,
    Layers,
    Package,
    User,
    Settings,
    LogOut,
    Menu,
    X,
    Ticket,
    TicketPercent,
    Image as ImageIcon,
    Activity,
    ChevronRight,
} from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import BlackHoleLogo from "@/components/BlackHoleLogo";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

const NAV_ITEMS = [
    { name: "Dashboard",    href: "/admin/dashboard",   icon: LayoutDashboard },
    { name: "Orders",       href: "/admin/orders",      icon: ShoppingCart },
    { name: "Categories",   href: "/admin/categories",  icon: Layers },
    { name: "Products",     href: "/admin/products",    icon: Package },
    { name: "Redeem Codes", href: "/admin/redeem-codes",icon: Ticket },
    { name: "Vouchers",     href: "/admin/vouchers",    icon: TicketPercent },
    { name: "Banners",      href: "/admin/banners",     icon: ImageIcon },
    { name: "Monitoring",   href: "/admin/monitoring",  icon: Activity },
    { name: "Users",        href: "/admin/users",       icon: User },
    { name: "Settings",     href: "/admin/settings",    icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => { setSidebarOpen(false); }, [pathname]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const isMobile = window.innerWidth < 1024;
        document.body.style.overflow = isMobile && sidebarOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [sidebarOpen]);

    const activeLabel = NAV_ITEMS.find(item => pathname.startsWith(item.href))?.name || "Dashboard";

    return (
        <div
            style={{
                height: "100vh",
                background: "var(--bg-base)",
                color: "var(--text-primary)",
                display: "flex",
                overflow: "hidden",
            }}
        >
            {/* Mobile Overlay — smooth fade */}
            <div
                style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(6,8,15,0.6)",
                    backdropFilter: "blur(3px)",
                    zIndex: 45,
                    opacity: sidebarOpen ? 1 : 0,
                    pointerEvents: sidebarOpen ? "auto" : "none",
                    transition: "opacity 280ms ease",
                }}
                className="lg:hidden"
                onClick={() => setSidebarOpen(false)}
            />

            {/* ── Sidebar ── */}
            <aside
                style={{
                    position: "fixed",
                    top: 0,
                    bottom: 0,
                    left: 0,
                    zIndex: 50,
                    background: "var(--bg-surface)",
                    borderRight: "1px solid var(--bg-border)",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 300ms cubic-bezier(0.4,0,0.2,1), box-shadow 300ms ease",
                    width: "240px",
                    transform: sidebarOpen ? "translateX(0)" : "translateX(-240px)",
                    boxShadow: sidebarOpen ? "var(--shadow-lg)" : "none",
                    overflow: "hidden",
                }}
                className="admin-sidebar"
            >
                {/* Logo */}
                <Link
                    href="/"
                    style={{
                        height: "56px",
                        display: "flex",
                        alignItems: "center",
                        padding: "0 16px",
                        gap: "10px",
                        flexShrink: 0,
                        borderBottom: "1px solid var(--bg-border)",
                        textDecoration: "none",
                    }}
                    className="group"
                >
                    <BlackHoleLogo size="sm" />
                    <span
                        style={{
                            fontWeight: 800,
                            fontSize: "15px",
                            letterSpacing: "-0.02em",
                            color: "var(--text-primary)",
                            whiteSpace: "nowrap",
                        }}
                        className="group-hover:text-[var(--accent-primary)] transition-colors"
                    >
                        MSBPSTORE
                    </span>
                </Link>

                {/* Nav */}
                <nav style={{ flex: 1, padding: "12px", overflowY: "auto" }} className="hide-scrollbar space-y-0.5">
                    {NAV_ITEMS.map((item) => {
                        const active = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                title={item.name}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    padding: "9px 12px",
                                    borderRadius: "var(--radius-md)",
                                    fontSize: "13px",
                                    fontWeight: active ? 600 : 500,
                                    color: active ? "var(--accent-primary)" : "var(--text-secondary)",
                                    background: active ? "var(--accent-subtle)" : "transparent",
                                    borderLeft: active ? "2px solid var(--accent-primary)" : "2px solid transparent",
                                    transition: "background 180ms ease, color 180ms ease, border-color 180ms ease",
                                    textDecoration: "none",
                                    whiteSpace: "nowrap",
                                }}
                                className={!active ? "hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]" : ""}
                            >
                                <item.icon
                                    style={{
                                        width: "18px",
                                        height: "18px",
                                        flexShrink: 0,
                                        color: active ? "var(--accent-primary)" : "var(--text-muted)",
                                        transition: "color 150ms ease",
                                    }}
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div style={{ padding: "12px", borderTop: "1px solid var(--bg-border)" }}>
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        title="Keluar"
                        style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "10px 12px",
                            borderRadius: "var(--radius-md)",
                            color: "var(--error)",
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            fontWeight: 500,
                            fontSize: "14px",
                            transition: "background 150ms ease",
                            fontFamily: "inherit",
                            textAlign: "left",
                            whiteSpace: "nowrap",
                        }}
                        className="hover:bg-[var(--error-muted)]"
                    >
                        <LogOut style={{ width: "18px", height: "18px", flexShrink: 0 }} />
                        Keluar
                    </button>
                </div>
            </aside>

            {/* ── Main ── */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, height: "100vh", overflowY: "auto" }}>

                {/* Header */}
                <header
                    style={{
                        height: "56px",
                        borderBottom: "1px solid var(--bg-border)",
                        background: "rgba(6,8,15,0.88)",
                        backdropFilter: "blur(16px)",
                        WebkitBackdropFilter: "blur(16px)",
                        position: "sticky",
                        top: 0,
                        zIndex: 40,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0 16px",
                        flexShrink: 0,
                    }}
                    className="lg:px-6"
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            style={{
                                width: "36px",
                                height: "36px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "transparent",
                                border: "none",
                                borderRadius: "var(--radius-md)",
                                color: "var(--text-secondary)",
                                cursor: "pointer",
                                transition: "background 150ms ease, color 150ms ease",
                            }}
                            className="hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                            aria-label="Toggle sidebar"
                        >
                            {sidebarOpen ? <X style={{ width: "18px", height: "18px" }} /> : <Menu style={{ width: "18px", height: "18px" }} />}
                        </button>
                        {/* Breadcrumb */}
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 500 }}>Admin</span>
                            <ChevronRight style={{ width: "13px", height: "13px", color: "var(--text-muted)" }} />
                            <h1 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
                                {activeLabel}
                            </h1>
                        </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <NotificationBell />
                        <div style={{ width: "1px", height: "20px", background: "var(--bg-border)" }} className="hidden sm:block" />
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div className="hidden sm:block" style={{ textAlign: "right" }}>
                                <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.2 }}>
                                    {session?.user?.name || "Admin"}
                                </p>
                                <p style={{ fontSize: "11px", color: "var(--accent-primary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", lineHeight: 1.2 }}>
                                    {(session?.user as any)?.role || "admin"}
                                </p>
                            </div>
                            <div
                                style={{
                                    width: "34px",
                                    height: "34px",
                                    borderRadius: "50%",
                                    background: "var(--bg-elevated)",
                                    border: "1px solid var(--bg-border)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: 600,
                                    color: "var(--text-secondary)",
                                    fontSize: "13px",
                                    overflow: "hidden",
                                    flexShrink: 0,
                                }}
                            >
                                {session?.user?.image ? (
                                    <img src={session.user.image} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <span>{session?.user?.name?.[0]?.toUpperCase() || "A"}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main style={{ flex: 1, padding: "16px", overflowX: "hidden" }} className="lg:p-6">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
