"use client";

import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import { usePathname } from "next/navigation";

export default function ScrollToTop() {
    const [show, setShow] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setShow(window.scrollY > 400);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    if (pathname?.startsWith("/admin")) return null;

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <button
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className={`fixed bottom-8 sm:bottom-6 left-6 z-[110] w-11 h-11 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl shadow-lg flex items-center justify-center transition-all ${
                show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
            }`}
        >
            <ChevronUp className="w-5 h-5" />
        </button>
    );
}
