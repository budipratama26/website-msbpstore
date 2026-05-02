"use client";

import { MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";

export default function FloatingCS() {
    const pathname = usePathname();
    const isAdminPath = pathname?.startsWith("/admin");

    if (isAdminPath) return null;

    return (
        <a
            href="https://wa.me/62895324802172"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Hubungi Customer Service"
            style={{
                position: "fixed",
                bottom: "28px",
                right: "20px",
                zIndex: 110,
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "#22c55e",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                boxShadow: "0 4px 16px rgba(34,197,94,0.25), 0 1px 4px rgba(0,0,0,0.3)",
                transition: "transform 200ms ease, box-shadow 200ms ease",
                border: "1.5px solid rgba(255,255,255,0.15)",
                textDecoration: "none",
            }}
            className="hover:scale-[1.08] hover:shadow-[0_6px_24px_rgba(34,197,94,0.35)]"
        >
            <MessageCircle style={{ width: "22px", height: "22px", strokeWidth: 2 }} />
        </a>
    );
}
