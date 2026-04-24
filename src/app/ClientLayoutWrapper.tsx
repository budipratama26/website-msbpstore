"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useLayoutEffect } from "react";
import Navbar from "@/components/Navbar";
import FloatingCS from "@/components/FloatingCS";
import ScrollToTop from "@/components/ScrollToTop";
import PromoBar from "@/components/PromoBar";

// Use useLayoutEffect on client, useEffect on server (SSR safety)
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdminPath = pathname?.startsWith("/admin");
    const headerRef = useRef<HTMLDivElement>(null);
    const prevPathname = useRef(pathname);

    // Robust scroll-to-top on navigation
    // Uses useLayoutEffect to run BEFORE browser paint, preventing flash of wrong scroll position
    useIsomorphicLayoutEffect(() => {
        // Only scroll on actual navigation (not initial mount with same path)
        if (prevPathname.current !== pathname) {
            prevPathname.current = pathname;

            // Phase 1: Instant scroll before paint
            window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });

            // Phase 2: After paint — catch any late-rendering content shifts
            requestAnimationFrame(() => {
                window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
            });

            // Phase 3: Delayed fallback — handles async data-driven content
            const timer = setTimeout(() => {
                window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [pathname]);

    useEffect(() => {
        const header = document.getElementById("main-header");
        if (!header) return;

        const updateHeight = () => {
            const height = header.offsetHeight;
            document.documentElement.style.setProperty("--header-height", `${height}px`);
            document.body.style.setProperty("--header-height", `${height}px`);
        };

        const observer = new ResizeObserver(updateHeight);
        observer.observe(header);
        updateHeight(); // Initial set

        return () => observer.disconnect();
    }, [isAdminPath, pathname]);

    return (
        <>
            {!isAdminPath && (
                <div id="main-header" ref={headerRef} className="fixed top-0 inset-x-0 z-[100] flex flex-col w-full">
                    <PromoBar />
                    <Navbar />
                </div>
            )}
            <div className="flex-1 w-full" style={!isAdminPath ? { paddingTop: 'var(--header-height, 64px)' } : {}}>
                {children}
            </div>
            <FloatingCS />
            <ScrollToTop />
        </>
    );
}
