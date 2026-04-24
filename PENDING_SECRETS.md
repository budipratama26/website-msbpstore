# 🔐 Catatan Pending Secrets (Wajib Diganti Nanti)

Dokumen ini adalah pengingat untuk Anda. Terdapat 2 *secret key* penting yang harus Anda ganti di sistem *production* nanti setelah semuanya stabil dan KYC disetujui.

## 1. Webhook Payment Gateway
- **Kondisi Saat Ini:** Menunggu persetujuan KYC dari pihak Payment Gateway.
- **Lokasi File:** `.env`
- **Variabel:** `WEBHOOK_SECRET`
- **Nilai Saat Ini:** `msbp_webhook_secure_key_2026`
- **NILAI TARGET (Ubah ke ini nanti):** `SatriaGanteng_26@`
- **Tindakan Lanjutan:** 
  1. Ubah di file `.env` server Anda menjadi target.
  2. Masukkan `SatriaGanteng_26@` di pengaturan Webhook Dashboard Payment Gateway Anda (PayDisini/Tripay/Midtrans).

## 2. NextAuth Secret
- **Kondisi Saat Ini:** Sistem Auth sedang disempurnakan.
- **Lokasi File:** `.env`
- **Variabel:** `NEXTAUTH_SECRET`
- **Nilai Saat Ini:** `msbp_nextauth_secret_secure_2026`
- **NILAI TARGET (Ubah ke ini nanti):** `MsbpGanteng_26@`
- **Tindakan Lanjutan:** 
  1. Ubah di file `.env` server Anda menjadi target.
  2. Lakukan *restart* server (misal: `pm2 restart msbpstore`).
  *(Catatan: Setelah restart, semua pengguna yang sedang login akan otomatis ter-logout dan harus masuk kembali).*
