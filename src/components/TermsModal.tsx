"use client";

import { ShieldCheck, Lock, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface TermsModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: "terms" | "privacy" | null;
}

export function TermsModal({ isOpen, onClose, type }: TermsModalProps) {
    const [mounted, setMounted] = useState(false);

    // Prevent scrolling on background when modal is open
    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    if (!isOpen || !type || !mounted) return null;

    return createPortal(
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
            {/* Backdrop */}
            <div 
                style={{ position: "absolute", inset: 0, background: "var(--bg-overlay)", backdropFilter: "blur(4px)", cursor: "pointer" }} 
                onClick={onClose}
            />
            
            {/* Modal Content */}
            <div 
                style={{ 
                    position: "relative", 
                    width: "100%", 
                    maxWidth: "600px", 
                    maxHeight: "85vh",
                    background: "var(--bg-surface)", 
                    border: "var(--border-default)", 
                    borderRadius: "var(--radius-xl)", 
                    boxShadow: "var(--shadow-xl)", 
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    animation: "fade-in 200ms ease" 
                }}
            >
                {/* Header */}
                <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--bg-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "40px", height: "40px", background: type === "terms" ? "var(--success-muted)" : "var(--info-muted)", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {type === "terms" ? <ShieldCheck style={{ width: "20px", height: "20px", color: "var(--success)" }} /> : <Lock style={{ width: "20px", height: "20px", color: "var(--info)" }} />}
                        </div>
                        <div>
                            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em", margin: 0 }}>
                                {type === "terms" ? "Syarat dan Ketentuan" : "Kebijakan Privasi"}
                            </h2>
                            <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "2px 0 0" }}>Terakhir diperbarui: {new Date().toLocaleDateString("id-ID")}</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-md)", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-secondary)", transition: "color 150ms" }}
                        className="hover:text-[var(--text-primary)]"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div style={{ flex: 1, minHeight: 0, padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "24px" }}>
                    {type === "terms" ? (
                        <>
                            <div>
                                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>1. Pendahuluan</h3>
                                <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>Selamat datang di MSBP Store. Dengan mendaftar dan menggunakan layanan kami, Anda dianggap telah membaca, memahami, dan menyetujui seluruh Syarat dan Ketentuan ini. Jika Anda tidak menyetujui, Anda tidak diperkenankan menggunakan layanan kami.</p>
                            </div>
                            <div>
                                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>2. Akun Pengguna</h3>
                                <ul style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, paddingLeft: "16px", margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
                                    <li>Pengguna wajib memberikan informasi yang akurat dan lengkap saat mendaftar.</li>
                                    <li>Keamanan password dan akun adalah tanggung jawab penuh pengguna.</li>
                                    <li>Kami berhak menangguhkan atau menghapus akun yang terindikasi melakukan penipuan.</li>
                                </ul>
                            </div>
                            <div>
                                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>3. Transaksi dan Pembayaran</h3>
                                <ul style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, paddingLeft: "16px", margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
                                    <li>Harga yang tertera dapat berubah sewaktu-waktu tanpa pemberitahuan.</li>
                                    <li>Pesanan diproses secara otomatis setelah pembayaran terkonfirmasi.</li>
                                    <li>Kesalahan pengisian data pembelian di luar kendali dan tanggung jawab kami.</li>
                                </ul>
                            </div>
                            <div>
                                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>4. Kebijakan Pengembalian (Refund)</h3>
                                <ul style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, paddingLeft: "16px", margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
                                    <li>Semua pembelian bersifat Final dan tidak dapat dikembalikan (No Refund).</li>
                                    <li>Refund hanya berlaku apabila transaksi gagal dari pihak server kami namun saldo telah terpotong.</li>
                                </ul>
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>1. Informasi yang Kami Kumpulkan</h3>
                                <ul style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, paddingLeft: "16px", margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
                                    <li><strong>Data Pendaftaran:</strong> Email, Password, dan ID Google OAuth.</li>
                                    <li><strong>Data Pembelian:</strong> Informasi ID Game, riwayat pembelanjaan, dll.</li>
                                    <li><strong>Informasi Log:</strong> Alamat IP, jenis browser, untuk keamanan sistem.</li>
                                </ul>
                            </div>
                            <div>
                                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>2. Penggunaan Data</h3>
                                <ul style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, paddingLeft: "16px", margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
                                    <li>Memproses transaksi top-up atau pembelian produk.</li>
                                    <li>Melakukan verifikasi akun untuk mencegah penipuan.</li>
                                    <li>Keperluan keamanan sistem seperti Anti-DDoS dan audit log.</li>
                                </ul>
                            </div>
                            <div>
                                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>3. Keamanan Data</h3>
                                <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>Kami menganggap privasi Anda sangat serius. Seluruh lalu lintas data dilindungi menggunakan standar enkripsi (Bcrypt) dan koneksi aman HTTPS. MSBP Store <strong>tidak pernah membagikan atau menjual</strong> data pribadi Anda kepada pihak ketiga.</p>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: "16px 24px", borderTop: "1px solid var(--bg-border)", display: "flex", justifyContent: "flex-end", background: "var(--bg-elevated)", borderBottomLeftRadius: "var(--radius-xl)", borderBottomRightRadius: "var(--radius-xl)" }}>
                    <button onClick={onClose} className="btn btn-primary" style={{ padding: "10px 24px", fontSize: "13px" }}>
                        Tutup & Mengerti
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
