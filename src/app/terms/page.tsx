import { ShieldCheck } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "Syarat dan Ketentuan - MSBP Store",
    description: "Syarat dan Ketentuan penggunaan layanan MSBP Store.",
};

export default function TermsOfServicePage() {
    return (
        <div style={{ minHeight: "100vh", background: "var(--bg-base)", color: "var(--text-primary)", padding: "40px 16px 80px" }}>
            <div style={{ maxWidth: "760px", margin: "0 auto" }}>

                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px", paddingBottom: "24px", borderBottom: "1px solid var(--bg-border)" }}>
                    <div style={{ width: "48px", height: "48px", background: "var(--success-muted)", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <ShieldCheck style={{ width: "22px", height: "22px", color: "var(--success)" }} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text-primary)", marginBottom: "4px" }}>
                            Syarat dan Ketentuan
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
                            1. Pendahuluan
                        </h2>
                        <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.8 }}>
                            Selamat datang di MSBP Store. Dengan mendaftar dan menggunakan layanan kami, Anda dianggap telah membaca, memahami, dan menyetujui seluruh Syarat dan Ketentuan ini. Jika Anda tidak menyetujui syarat-syarat ini, Anda tidak diperkenankan menggunakan layanan kami.
                        </p>
                    </section>

                    <section style={{ background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-xl)", padding: "24px" }}>
                        <h2 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px", letterSpacing: "-0.01em" }}>
                            2. Akun Pengguna
                        </h2>
                        <ul style={{ display: "flex", flexDirection: "column", gap: "10px", paddingLeft: "16px", listStyleType: "disc" }}>
                            {[
                                "Pengguna wajib memberikan informasi yang akurat dan lengkap saat mendaftar.",
                                "Keamanan password dan akun adalah tanggung jawab penuh pengguna.",
                                "Kami berhak menangguhkan atau menghapus akun yang terindikasi melakukan penipuan, spam, atau pelanggaran hukum.",
                            ].map((item, i) => (
                                <li key={i} style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.7 }}>{item}</li>
                            ))}
                        </ul>
                    </section>

                    <section style={{ background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-xl)", padding: "24px" }}>
                        <h2 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px", letterSpacing: "-0.01em" }}>
                            3. Transaksi dan Pembayaran
                        </h2>
                        <ul style={{ display: "flex", flexDirection: "column", gap: "10px", paddingLeft: "16px", listStyleType: "disc" }}>
                            {[
                                "Harga yang tertera dapat berubah sewaktu-waktu tanpa pemberitahuan sebelumnya.",
                                "Segala pesanan akan diproses secara otomatis setelah pembayaran terkonfirmasi (contoh: via QRIS).",
                                "Kesalahan pengisian nominal transfer atau data pembelian (seperti ID Game) di luar kendali dan tanggung jawab kami.",
                            ].map((item, i) => (
                                <li key={i} style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.7 }}>{item}</li>
                            ))}
                        </ul>
                    </section>

                    <section style={{ background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-xl)", padding: "24px" }}>
                        <h2 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px", letterSpacing: "-0.01em" }}>
                            4. Kebijakan Pengembalian (Refund)
                        </h2>
                        <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: "12px" }}>
                            Mengingat produk yang kami jual mayoritas adalah produk digital (seperti Voucher/Redeem Code atau Top-up), maka:
                        </p>
                        <ul style={{ display: "flex", flexDirection: "column", gap: "10px", paddingLeft: "16px", listStyleType: "disc" }}>
                            {[
                                "Semua pembelian bersifat Final dan tidak dapat dikembalikan atau dibatalkan (No Refund).",
                                "Refund hanya berlaku apabila transaksi gagal dari pihak server kami namun saldo/uang telah terpotong.",
                            ].map((item, i) => (
                                <li key={i} style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.7 }}>{item}</li>
                            ))}
                        </ul>
                    </section>

                    <section style={{ background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-xl)", padding: "24px" }}>
                        <h2 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px", letterSpacing: "-0.01em" }}>
                            5. Perubahan Syarat Ketentuan
                        </h2>
                        <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.8 }}>
                            MSBP Store berhak untuk memodifikasi Syarat dan Ketentuan ini kapan saja tanpa pemberitahuan langsung. Pengguna disarankan untuk secara berkala memeriksa halaman ini.
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
