"use client";

import { useState, useEffect } from "react";
import { X, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";

export default function PromoBar() {
    const [dismissed, setDismissed] = useState(false);
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setMounted(true);
        const wasDismissed = sessionStorage.getItem("promo-bar-dismissed");
        if (wasDismissed) setDismissed(true);
    }, []);

    if (pathname?.startsWith("/admin")) return null;

    if (!mounted) {
        return (
            <div
                suppressHydrationWarning
                style={{ width: "100%", height: "32px", position: "relative", zIndex: 100, background: "var(--bg-surface)", flexShrink: 0, borderBottom: "1px solid var(--bg-border)" }}
            />
        );
    }

    if (dismissed) return null;

    const handleDismiss = () => {
        setDismissed(true);
        sessionStorage.setItem("promo-bar-dismissed", "true");
    };

    return (
        <div style={{
            width: "100%",
            position: "relative",
            zIndex: 100,
            background: "var(--bg-surface)",
            borderBottom: "1px solid var(--bg-border)",
            flexShrink: 0,
        }}>
            <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-center relative">
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Sparkles style={{ width: "11px", height: "11px", color: "var(--accent-primary)", flexShrink: 0 }} />
                    <p style={{ fontSize: "11px", fontWeight: 500, color: "var(--text-secondary)", textAlign: "center", paddingRight: "24px", letterSpacing: "0.01em" }}>
                        Top Up Game Favorit — <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>Proses Instan 24 Jam · Harga Terbaik</span>
                    </p>
                </div>
                <button
                    onClick={handleDismiss}
                    style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", padding: "4px", borderRadius: "var(--radius-sm)", background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)", transition: "color 150ms ease" }}
                    className="hover:text-[var(--text-secondary)]"
                    aria-label="Tutup promo"
                >
                    <X style={{ width: "12px", height: "12px" }} />
                </button>
            </div>
        </div>
    );
}
