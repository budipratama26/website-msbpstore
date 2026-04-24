# CATATAN PENTING MSBP STORE

## Alur Deploy (Laptop → VPS)

```bash
# 1. Di Laptop (Terminal VS Code)
git add .
git commit -m "Tulis perubahan di sini"
git push origin main

# 2. Di VPS
cd ~/msbpstore-dashboard-next
git pull origin main
npm install        # (hanya jika ada package baru)
npm run build
pm2 restart msbpstore
```

---

## Robots.txt (Strategi Whitelist)

File: `public/robots.txt`

Website ini menggunakan strategi **WHITELIST** — semua halaman diblokir dari Google secara default. Hanya halaman yang ditulis `Allow` yang bisa muncul di Google.

### Halaman yang SUDAH diizinkan Google:
- `/` (Homepage)
- `/category/` (Halaman kategori game)
- `/privacy/` (Kebijakan privasi)
- `/terms/` (Syarat & ketentuan)
- Asset statis (js, css, gambar, font)

### ⚠️ PENGINGAT: Kalau Bikin Halaman Publik Baru

Jika kamu membuat halaman baru yang HARUS muncul di Google (contoh: `/promo/`, `/blog/`, `/about/`), **WAJIB** lakukan 2 hal ini:

**1. Tambahkan `Allow` di `public/robots.txt`:**
```
Allow: /nama-halaman-baru/
```
Letakkan di bawah baris `Allow` yang sudah ada, SEBELUM baris `Disallow: /`.

**2. Tambahkan URL di `src/app/sitemap.ts`:**
```typescript
{
    url: `${baseUrl}/nama-halaman-baru`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
},
```

Jika LUPA melakukan ini, halaman baru tersebut TIDAK AKAN muncul di Google selamanya.

---

## File Penting yang TIDAK Boleh Di-push ke GitHub

- `.env` / `.env.local` — Berisi API Key, password database, dll.
- File ini harus dibuat MANUAL di VPS menggunakan `nano .env`

---

## Perintah PM2 yang Sering Dipakai

| Perintah | Fungsi |
|---|---|
| `pm2 status` | Cek apakah website nyala |
| `pm2 logs msbpstore` | Lihat log/error website |
| `pm2 restart msbpstore` | Restart website |
| `pm2 stop msbpstore` | Matikan website sementara |
| `pm2 delete msbpstore` | Hapus proses dari PM2 |
| `pm2 save` | Simpan konfigurasi PM2 |

---

## Info Server

- Domain: `msbpstore.my.id`
- VPS User: `root@Satria`
- Folder VPS: `~/msbpstore-dashboard-next`
- Process Manager: PM2 (nama proses: `msbpstore`)
- Repository: `github.com/budipratama26/website-msbpstore` (PRIVATE)
