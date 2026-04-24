import { Lock } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "Kebijakan Privasi - MSBP Store",
    description: "Kebijakan Privasi MSBP Store mengenai pengumpulan dan penggunaan data pengguna.",
};

export default function PrivacyPolicyPage() {
    return (
        <div style={{ minHeight: "100vh", background: "var(--bg-base)", color: "var(--text-primary)", padding: "40px 16px 80px" }}>
            <div style={{ maxWidth: "760px", margin: "0 auto" }}>

                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px", paddingBottom: "24px", borderBottom: "1px solid var(--bg-border)" }}>
                    <div style={{ width: "48px", height: "48px", background: "var(--info-muted)", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Lock style={{ width: "22px", height: "22px", color: "var(--info)" }} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text-primary)", marginBottom: "4px" }}>
                            Kebijakan Privasi
                        </h1>
                        <p style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>
                            Terakhir diperbarui: {new Date().toLocaleDateString("id-ID")}
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

                    <section style={{ background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-xl)", padding: "24px" }}>
                        <h2 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px", letterSpacing: "-0.01em" }}>
                            1. Informasi yang Kami Kumpulkan
                        </h2>
                        <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: "12px" }}>
                            Saat Anda menggunakan layanan MSBP Store, kami mengumpulkan beberapa informasi pribadi untuk menjalankan layanan, antara lain:
                        </p>
                        <ul style={{ display: "flex", flexDirection: "column", gap: "10px", paddingLeft: "16px", listStyleType: "disc" }}>
                            {[
                                { label: "Data Pendaftaran:", desc: "Nama pengguna, alamat Email, Password (di-hash dengan aman), dan ID Google OAuth (jika mendaftar via Google)." },
                                { label: "Data Pembelian:", desc: "Informasi ID Game, nomor telepon, riwayat pembelanjaan, dan penggunaan kode voucher." },
                                { label: "Informasi Log (Monitoring):", desc: "Alamat IP (Internet Protocol), jenis dan versi peramban (browser), serta catatan waktu akses untuk kebutuhan keamanan sistem." },
                            ].map(({ label, desc }, i) => (
                                <li key={i} style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.7 }}>
                                    <strong style={{ color: "var(--text-primary)" }}>{label}</strong> {desc}
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section style={{ background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-xl)", padding: "24px" }}>
                        <h2 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px", letterSpacing: "-0.01em" }}>
                            2. Penggunaan Data
                        </h2>
                        <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: "12px" }}>
                            Kami menggunakan data yang terkumpul hanya untuk keperluan operasional internal, meliputi:
                        </p>
                        <ul style={{ display: "flex", flexDirection: "column", gap: "10px", paddingLeft: "16px", listStyleType: "disc" }}>
                            {[
                                "Memproses transaksi top-up atau pembelian produk digital Anda.",
                                "Melakukan verifikasi akun (OTP ke email) untuk mencegah penipuan.",
                                "Keperluan keamanan sistem seperti Anti-DDoS, audit log aktivitas anomali (Bot/Hacker Protection).",
                            ].map((item, i) => (
                                <li key={i} style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.7 }}>{item}</li>
                            ))}
                        </ul>
                    </section>

                    <section style={{ background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-xl)", padding: "24px" }}>
                        <h2 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px", letterSpacing: "-0.01em" }}>
                            3. Keamanan Data
                        </h2>
                        <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.8 }}>
                            Kami menganggap privasi Anda sangat serius. Seluruh lalu lintas data (termasuk password) dilindungi menggunakan standar enkripsi (Bcrypt) dan koneksi aman HTTPS. MSBP Store{" "}
                            <strong style={{ color: "var(--text-primary)" }}>tidak pernah membagikan atau menjual</strong>{" "}
                            data pribadi Anda (termasuk Email) kepada pihak ketiga untuk kepentingan komersial yang tidak relevan.
                        </p>
                    </section>

                    <section style={{ background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-xl)", padding: "24px" }}>
                        <h2 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px", letterSpacing: "-0.01em" }}>
                            4. Hak Pengguna
                        </h2>
                        <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.8 }}>
                            Anda memiliki hak untuk meminta kami menghapus seluruh data riwayat profil atau transaksi Anda. Syarat untuk hal ini dapat dikomunikasikan secara langsung ke pusat bantuan layanan pelanggan kami.
                        </p>
                    </section>
                </div>

                {/* Footer */}
                <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid var(--bg-border)", textAlign: "center" }}>
                    <Link href="/register" className="btn btn-primary">
                        Kembali ke Pendaftaran
                    </Link>
                </div>
            </div>
        </div>
    );
}
