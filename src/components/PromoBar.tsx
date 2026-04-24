"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { usePathname } from "next/navigation";

export default function PromoBar() {
    // Start VISIBLE by default → layout is correct on first paint
    // Then hide if previously dismissed (tiny flash, but no blank-page bug)
    const [dismissed, setDismissed] = useState(false);
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setMounted(true);
        const wasDismissed = sessionStorage.getItem("promo-bar-dismissed");
        if (wasDismissed) setDismissed(true);
    }, []);

    // On admin pages — never show
    if (pathname?.startsWith("/admin")) return null;

    // Before mount: render a placeholder with the same height so layout is stable
    if (!mounted) {
        return (
            <div
                suppressHydrationWarning
                style={{ width: "100%", height: "33px", background: "var(--accent-primary)", flexShrink: 0 }}
            />
        );
    }

    if (dismissed) return null;

    const handleDismiss = () => {
        setDismissed(true);
        sessionStorage.setItem("promo-bar-dismissed", "true");
    };

    return (
        <div style={{ width: "100%", position: "relative", background: "var(--accent-primary)", color: "#fff", flexShrink: 0 }}>
            <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center relative">
                <p style={{ fontSize: "11px", fontWeight: 600, textAlign: "center", paddingRight: "32px" }}>
                    🎮 Selamat datang di <strong>MSBP Store</strong> — Top Up Game Favorit dengan Harga Terbaik! ⚡
                </p>
                <button
                    onClick={handleDismiss}
                    style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", padding: "4px", borderRadius: "var(--radius-sm)", background: "transparent", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.8)", transition: "background 150ms ease" }}
                    className="hover:bg-[rgba(255,255,255,0.1)]"
                    aria-label="Tutup promo"
                >
                    <X style={{ width: "13px", height: "13px" }} />
                </button>
            </div>
        </div>
    );
}
