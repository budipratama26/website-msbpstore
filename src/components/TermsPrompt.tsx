"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { ShieldCheck, FileText } from "lucide-react";
import Link from "next/link";

export function TermsPrompt() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [isChecked, setIsChecked] = useState(false);

    useEffect(() => {
        // Jangan tampilkan modal di halaman Syarat & Kebijakan agar bisa dibaca
        if (pathname === "/terms" || pathname === "/privacy") {
            setIsOpen(false);
            return;
        }

        // Hanya tampilkan untuk pengguna Google
        if (session?.user && (session.user as any).isGoogle) {
            const userId = (session.user as any).id;
            const hasAccepted = localStorage.getItem(`terms_accepted_google_${userId}`);
            if (!hasAccepted) {
                setIsOpen(true);
            }
        }
    }, [session, pathname]);

    const handleAccept = () => {
        if (!isChecked) return;
        const userId = (session?.user as any)?.id;
        if (userId) {
            localStorage.setItem(`terms_accepted_google_${userId}`, "true");
        }
        setIsOpen(false);
    };

    if (!isOpen) return null;

    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
            <div style={{ position: "absolute", inset: 0, background: "var(--bg-overlay)", backdropFilter: "blur(4px)" }} />
            <div style={{ position: "relative", width: "100%", maxWidth: "420px", background: "var(--bg-surface)", border: "var(--border-default)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-lg)", overflow: "hidden", padding: "32px 28px" }} className="animate-fade-in">

                <>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "24px" }}>
                        <div style={{ width: "52px", height: "52px", background: "var(--accent-muted)", border: "1px solid var(--accent-border)", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                            <FileText style={{ width: "24px", height: "24px", color: "var(--accent-primary)" }} />
                        </div>
                        <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em", textAlign: "center", marginBottom: "8px" }}>Selamat Datang!</h2>
                        <p style={{ fontSize: "13px", color: "var(--text-secondary)", textAlign: "center", lineHeight: 1.65 }}>
                            Sebelum mulai menggunakan layanan MSBP Store, harap setujui Syarat Ketentuan dan Kebijakan Privasi kami.
                        </p>
                    </div>

                    <div style={{ background: "var(--bg-base)", border: "var(--border-default)", borderRadius: "var(--radius-md)", padding: "16px", marginBottom: "24px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
                        <input
                            type="checkbox"
                            id="terms-check"
                            checked={isChecked}
                            onChange={(e) => setIsChecked(e.target.checked)}
                            style={{ marginTop: "4px", width: "16px", height: "16px", accentColor: "var(--accent-primary)", cursor: "pointer" }}
                        />
                        <label htmlFor="terms-check" style={{ fontSize: "13px", color: "var(--text-primary)", lineHeight: 1.6, cursor: "pointer" }}>
                            Saya telah membaca dan menyetujui <Link href="/terms" style={{ color: "var(--accent-primary)", textDecoration: "none" }}>Syarat Ketentuan</Link> serta <Link href="/privacy" style={{ color: "var(--accent-primary)", textDecoration: "none" }}>Kebijakan Privasi</Link> MSBP Store.
                        </label>
                    </div>

                    <button 
                        onClick={handleAccept} 
                        disabled={!isChecked} 
                        className="btn btn-primary btn-full btn-lg" 
                        style={{ opacity: isChecked ? 1 : 0.6, cursor: isChecked ? "pointer" : "not-allowed" }}
                    >
                        Saya Setuju & Lanjutkan
                    </button>
                </>
            </div>
        </div>
    );
}
