"use client";

import { MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";

export default function FloatingCS() {
    const pathname = usePathname();
    const isAdminPath = pathname?.startsWith("/admin");

    // Don't show on admin dashboard
    if (isAdminPath) return null;

    return (
        <a
            href="https://wa.me/62895324802172"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-8 sm:bottom-6 right-6 z-[110] bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white p-3.5 rounded-2xl shadow-lg shadow-emerald-600/30 transition-all group flex items-center justify-center border border-emerald-500"
            aria-label="Hubungi Customer Service"
        >
            <MessageCircle className="w-6 h-6" />
        </a>
    );
}
