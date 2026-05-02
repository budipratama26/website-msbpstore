"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, User, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import NotificationBell from "./NotificationBell";
import BlackHoleLogo from "./BlackHoleLogo";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const pathname = usePathname();
    const { data: session } = useSession();

    const navLinks = [
        { name: "Game", href: "/" },
        { name: "Cek Status", href: "/status" },
        ...(session ? [{ name: "Riwayat", href: "/history" }] : []),
    ];

    const isActive = (href: string) => pathname === href;

    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);



    if (pathname?.startsWith("/admin")) return null;

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[90] lg:hidden"
                    style={{ background: "rgba(6,8,15,0.5)", backdropFilter: "blur(2px)" }}
                    onClick={() => setIsOpen(false)}
                />
            )}
        <header
            style={{
                background: "rgba(6,8,15,0.88)",
                borderBottom: "1px solid var(--bg-border)",
                height: "60px",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                position: "sticky",
                top: 0,
                zIndex: 100,

            }}
            className="w-full shrink-0"
        >
            <div className="max-w-5xl mx-auto h-full flex items-center justify-between gap-4 px-4 relative">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
                    <BlackHoleLogo size="sm" />
                    <span
                        style={{
                            fontWeight: 800,
                            fontSize: "15px",
                            letterSpacing: "-0.02em",
                            background: "linear-gradient(135deg, var(--text-primary) 0%, var(--accent-primary) 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                            transition: "opacity 150ms ease",
                        }}
                        className="group-hover:opacity-80"
                    >
                        MSBPSTORE
                    </span>
                </Link>

                {/* Desktop Nav — centered */}
                <nav className="hidden lg:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            style={{
                                fontSize: "13px",
                                fontWeight: 600,
                                color: isActive(link.href) ? "var(--accent-primary)" : "var(--text-secondary)",
                                position: "relative",
                                paddingBottom: "4px",
                                transition: "color 180ms ease",
                                textDecoration: "none",
                                letterSpacing: "0.02em",
                            }}
                            className="hover:text-[var(--text-primary)]"
                        >
                            {link.name}
                            {/* Active indicator — pill style */}
                            <span
                                style={{
                                    position: "absolute",
                                    bottom: 0,
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    height: "2px",
                                    borderRadius: "9999px",
                                    background: "var(--accent-primary)",
                                    transition: "width 200ms ease, opacity 200ms ease",
                                    width: isActive(link.href) ? "100%" : "0%",
                                    opacity: isActive(link.href) ? 1 : 0,
                                }}
                            />
                        </Link>
                    ))}
                </nav>

                {/* Right Section */}
                <div className="flex items-center gap-2">

                    {/* Desktop Auth */}
                    <div className="hidden lg:flex items-center gap-3">
                        {session ? (
                            <>
                                {(session.user as any)?.role === "admin" && (
                                    <Link
                                        href="/admin/dashboard"
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "6px",
                                            fontSize: "12px",
                                            fontWeight: 700,
                                            color: "var(--accent-primary)",
                                            textDecoration: "none",
                                            transition: "opacity 150ms ease",
                                            letterSpacing: "0.02em",
                                        }}
                                        className="hover:opacity-75"
                                    >
                                        <LayoutDashboard className="w-3.5 h-3.5" />
                                        Dashboard
                                    </Link>
                                )}

                                <div style={{ width: "1px", height: "16px", background: "var(--bg-border)" }} />
                                <NotificationBell />

                            {/* User Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                        onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px",
                                            background: dropdownOpen ? "var(--bg-elevated)" : "transparent",
                                            border: dropdownOpen ? "1px solid var(--accent-border)" : "1px solid transparent",
                                            borderRadius: "var(--radius-md)",
                                            padding: "6px 10px",
                                            cursor: "pointer",
                                            transition: "border-color 180ms ease, background 180ms ease",
                                        }}
                                        className="hover:bg-[var(--bg-elevated)] hover:border-[var(--bg-border)]"
                                    >
                                        {/* Avatar */}
                                        <div
                                            style={{
                                                width: "22px",
                                                height: "22px",
                                                borderRadius: "50%",
                                                background: "linear-gradient(135deg, var(--accent-primary), var(--accent-hover))",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                color: "#fff",
                                                fontWeight: 800,
                                                fontSize: "10px",
                                                flexShrink: 0,
                                            }}
                                        >
                                            {session.user?.name?.[0]?.toUpperCase() || "U"}
                                        </div>
                                        <span style={{
                                            fontSize: "12px",
                                            fontWeight: 700,
                                            color: "var(--text-primary)",
                                            maxWidth: "80px",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}>
                                            {session.user?.name?.split(" ")[0]}
                                        </span>
                                        <ChevronDown
                                            style={{
                                                width: "12px",
                                                height: "12px",
                                                color: "var(--text-muted)",
                                                transform: dropdownOpen ? "rotate(180deg)" : "none",
                                                transition: "transform 180ms ease",
                                            }}
                                        />
                                    </button>

                                    {dropdownOpen && (
                                        <div
                                            style={{
                                                position: "absolute",
                                                top: "calc(100% + 8px)",
                                                right: 0,
                                                background: "var(--bg-surface)",
                                                border: "1px solid var(--bg-border)",
                                                borderRadius: "var(--radius-xl)",
                                                boxShadow: "var(--shadow-lg)",
                                                padding: "6px",
                                                minWidth: "172px",
                                                zIndex: 110,
                                            }}
                                            className="animate-scale-in"
                                        >
                                            <Link
                                                href="/profile"
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "10px",
                                                    padding: "9px 12px",
                                                    fontSize: "13px",
                                                    fontWeight: 500,
                                                    color: "var(--text-secondary)",
                                                    borderRadius: "var(--radius-md)",
                                                    transition: "background 150ms ease, color 150ms ease",
                                                    textDecoration: "none",
                                                }}
                                                className="hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                                            >
                                                <User className="w-4 h-4" />
                                                Profil Saya
                                            </Link>
                                            <div style={{ height: "1px", background: "var(--bg-border)", margin: "4px 0" }} />
                                            <button
                                                onClick={() => signOut({ callbackUrl: "/" })}
                                                style={{
                                                    width: "100%",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "10px",
                                                    padding: "9px 12px",
                                                    fontSize: "13px",
                                                    fontWeight: 500,
                                                    color: "var(--error)",
                                                    borderRadius: "var(--radius-md)",
                                                    transition: "background 150ms ease",
                                                    background: "transparent",
                                                    border: "none",
                                                    cursor: "pointer",
                                                    textAlign: "left",
                                                }}
                                                className="hover:bg-[var(--error-muted)]"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                Keluar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
                                        fontSize: "13px",
                                        fontWeight: 600,
                                        color: "var(--text-secondary)",
                                        padding: "8px 12px",
                                        textDecoration: "none",
                                        transition: "color 150ms ease",
                                        letterSpacing: "0.02em",
                                    }}
                                    className="hover:text-[var(--text-primary)]"
                                >
                                    <User className="w-3.5 h-3.5" />
                                    Masuk
                                </Link>
                                <Link href="/register" className="btn btn-primary btn-sm">
                                    Daftar
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile: Notif + Hamburger */}
                    <div className="flex items-center gap-1.5 lg:hidden">
                        {session && <NotificationBell />}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            style={{
                                width: "36px",
                                height: "36px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "var(--text-secondary)",
                                background: "transparent",
                                border: "none",
                                borderRadius: "var(--radius-md)",
                                cursor: "pointer",
                                transition: "background 150ms ease, color 150ms ease",
                            }}
                            className="hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                            aria-label="Toggle Menu"
                        >
                            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu — smooth slide */}
            <div
                style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: "100%",
                    background: "rgba(6,8,15,0.98)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    borderBottom: "1px solid var(--bg-border)",
                    boxShadow: "var(--shadow-lg)",
                    zIndex: 99,
                    overflow: "hidden",
                    transformOrigin: "top center",
                    transform: isOpen ? "scaleY(1)" : "scaleY(0)",
                    transition: "transform 250ms cubic-bezier(0.4, 0, 0.2, 1), opacity 200ms ease, visibility 250ms",
                    opacity: isOpen ? 1 : 0,
                    visibility: isOpen ? "visible" : "hidden",
                    pointerEvents: isOpen ? "auto" : "none",
                }}
                className="lg:hidden"
            >
                    <div style={{ padding: "10px" }} className="space-y-0.5">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "11px 12px",
                                    borderRadius: "var(--radius-md)",
                                    fontSize: "14px",
                                    fontWeight: 600,
                                    color: isActive(link.href) ? "var(--accent-primary)" : "var(--text-secondary)",
                                    background: isActive(link.href) ? "var(--accent-subtle)" : "transparent",
                                    transition: "background 150ms ease, color 150ms ease",
                                    textDecoration: "none",
                                    letterSpacing: "0.01em",
                                }}
                                className={!isActive(link.href) ? "hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]" : ""}
                            >
                                {isActive(link.href) && (
                                    <span
                                        style={{
                                            marginRight: "10px",
                                            width: "3px",
                                            height: "14px",
                                            background: "var(--accent-primary)",
                                            borderRadius: "9999px",
                                            flexShrink: 0,
                                        }}
                                    />
                                )}
                                {link.name}
                            </Link>
                        ))}

                        <div style={{ height: "1px", background: "var(--bg-border)", margin: "8px 0" }} />

                        {session ? (
                            <>
                                <Link
                                    href="/profile"
                                    onClick={() => setIsOpen(false)}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "12px",
                                        padding: "11px 12px",
                                        borderRadius: "var(--radius-md)",
                                        transition: "background 150ms ease",
                                        textDecoration: "none",
                                    }}
                                    className="hover:bg-[var(--bg-elevated)]"
                                >
                                    <div
                                        style={{
                                            width: "32px",
                                            height: "32px",
                                            borderRadius: "50%",
                                            background: "linear-gradient(135deg, var(--accent-primary), var(--accent-hover))",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "#fff",
                                            fontWeight: 700,
                                            fontSize: "13px",
                                            flexShrink: 0,
                                        }}
                                    >
                                        {session.user?.name?.[0]?.toUpperCase() || "U"}
                                    </div>
                                    <div>
                                        <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2 }}>
                                            {session.user?.name}
                                        </p>
                                        <p style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 500, marginTop: "2px" }}>
                                            Lihat Profil
                                        </p>
                                    </div>
                                </Link>

                                {(session.user as any)?.role === "admin" && (
                                    <Link
                                        href="/admin/dashboard"
                                        onClick={() => setIsOpen(false)}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "10px",
                                            padding: "11px 12px",
                                            borderRadius: "var(--radius-md)",
                                            fontSize: "14px",
                                            fontWeight: 600,
                                            color: "var(--accent-primary)",
                                            background: "var(--accent-subtle)",
                                            transition: "background 150ms ease",
                                            textDecoration: "none",
                                        }}
                                    >
                                        <LayoutDashboard className="w-4 h-4" />
                                        Dashboard Admin
                                    </Link>
                                )}

                                <button
                                    onClick={() => signOut({ callbackUrl: "/" })}
                                    style={{
                                        width: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px",
                                        padding: "11px 12px",
                                        borderRadius: "var(--radius-md)",
                                        fontSize: "14px",
                                        fontWeight: 600,
                                        color: "var(--error)",
                                        background: "transparent",
                                        border: "none",
                                        cursor: "pointer",
                                        transition: "background 150ms ease",
                                        textAlign: "left",
                                    }}
                                    className="hover:bg-[var(--error-muted)]"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Keluar
                                </button>
                            </>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingTop: "4px", paddingBottom: "4px" }}>
                                <Link
                                    href="/login"
                                    onClick={() => setIsOpen(false)}
                                    className="btn btn-secondary btn-full"
                                    style={{ justifyContent: "center" }}
                                >
                                    <User className="w-4 h-4" />
                                    Masuk Akun
                                </Link>
                                <Link
                                    href="/register"
                                    onClick={() => setIsOpen(false)}
                                    className="btn btn-primary btn-full"
                                    style={{ justifyContent: "center" }}
                                >
                                    Daftar Sekarang
                                </Link>
                            </div>
                        )}
                    </div>
            </div>
        </header>
        </>
    );
}