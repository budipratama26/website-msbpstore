# 🚀 Deployment Guide — MSBP Store (Standalone Mode)

> **PENTING:** Guide ini sudah diupdate untuk standalone build mode.
> Cara lama (`npm run start`) **TIDAK** dipakai lagi karena boros RAM.

---

## 📂 Struktur Folder di VPS

```
/root/botmsbp_tele/                    ← Git repo root
├── ecosystem.config.cjs               ← PM2 config (manage semua app)
├── apeka.js                           ← Telegram Bot
├── payment.js                         ← Helper pembayaran
├── package.json                       ← Dependencies bot
├── docker-compose.yml                 ← PostgreSQL + Redis
├── prisma/                            ← Database schema
└── msbpstore-dashboard-next/          ← ✅ Next.js App
    ├── nginx/                         ← Config Nginx (reference)
    │   ├── http_top.conf              ← Copy ke /data/nginx/custom/
    │   └── npm_custom_config.conf     ← Paste ke NPM Advanced tab
    ├── .next/standalone/              ← Build output (setelah npm run build)
    └── src/                           ← Source code
```

---

## 📋 Pre-Deployment Checklist

- [ ] `.env` sudah terisi lengkap di VPS
- [ ] PostgreSQL & Redis Docker containers running (`docker compose up -d`)
- [ ] Nginx Proxy Manager configured

---

## 1. Persiapan Database

```bash
cd /root/botmsbp_tele/msbpstore-dashboard-next

# Sinkronisasi schema ke database
npx prisma db push

# Generate Prisma Client
npx prisma generate
```

## 2. Build Aplikasi (Standalone)

```bash
cd /root/botmsbp_tele/msbpstore-dashboard-next

# Build production — menghasilkan standalone bundle
npm run build
```

**⚠️ WAJIB: Copy static files ke standalone folder**

Next.js standalone mode TIDAK otomatis include folder `public` dan `.next/static`.
Kamu HARUS copy manual setiap kali build:

```bash
# Copy public assets (images, fonts, etc)
cp -r public .next/standalone/public

# Copy static build files (CSS, JS chunks)
cp -r .next/static .next/standalone/.next/static
```

## 3. Jalankan dengan PM2

```bash
# Kembali ke root repo
cd /root/botmsbp_tele

# Stop proses lama (jika ada)
pm2 stop all 2>/dev/null
pm2 delete all 2>/dev/null

# Start SEMUA app dengan ecosystem config
pm2 start ecosystem.config.cjs

# Simpan agar otomatis jalan saat VPS restart
pm2 save
```

## 4. Setup Nginx Rate Limiting

### Step 1: Copy `http_top.conf` ke VPS

```bash
# Copy file rate limiting ke NPM custom config directory
cp /root/botmsbp_tele/msbpstore-dashboard-next/nginx/http_top.conf \
   /data/nginx/custom/http_top.conf

# Restart Nginx Proxy Manager untuk load config baru
docker restart nginx-proxy-manager
```

### Step 2: Update NPM GUI

1. Buka **Nginx Proxy Manager** → `http://103.253.244.108:81`
2. Klik **Hosts** → Edit `msbpstore.my.id`
3. Klik tab **Advanced** (ikon ⚙️ gear)
4. **HAPUS** config lama, lalu **paste** isi file `nginx/npm_custom_config.conf`
5. Klik **Save**

### Step 3: Test konfigurasi

```bash
# Test Nginx config valid
docker exec nginx-proxy-manager nginx -t

# Jika "syntax is ok", restart:
docker restart nginx-proxy-manager
```

## 5. Verifikasi

```bash
# Cek PM2 status
pm2 status

# Monitor RAM real-time
pm2 monit

# Test path blocking (harus timeout/connection refused)
curl -v --max-time 5 https://msbpstore.my.id/~user5
curl -v --max-time 5 https://msbpstore.my.id/wp-login.php

# Test rate limiting (kirim 30 request cepat)
for i in {1..30}; do curl -s -o /dev/null -w "%{http_code}\n" https://msbpstore.my.id/; done
# Setelah 10-20 request, harus mulai return 429

# Cek log
pm2 logs --lines 20
```

---

## ⚡ Quick Redeploy (Setelah Update Kode)

```bash
cd /root/botmsbp_tele/msbpstore-dashboard-next

# Build ulang
npm run build

# Copy static files (WAJIB setiap build!)
cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static

# Restart web app saja
pm2 restart msbpstore-web
```

---

## 🛡️ Emergency: Under Attack

Jika VPS diserang lagi:

```bash
# 1. Aktifkan Cloudflare Under Attack Mode (via dashboard Cloudflare)

# 2. Block IP attacker langsung di UFW
sudo ufw deny from <IP_ATTACKER>

# 3. Atau block via fail2ban
sudo fail2ban-client set nginx-req-limit banip <IP_ATTACKER>

# 4. Lihat koneksi terbanyak (cari IP attacker)
ss -tun | awk '{print $5}' | cut -d: -f1 | sort | uniq -c | sort -rn | head -20

# 5. Restart app jika crash
pm2 restart msbpstore-web
```

---

## 📊 Memory Budget (2GB VPS)

| Service | RAM Limit | Catatan |
|---------|-----------|---------|
| OS + fail2ban | ~200MB | Minimal Ubuntu |
| PostgreSQL (Docker) | 512MB | docker-compose limit |
| Redis (Docker) | 128MB | docker-compose limit |
| NPM (Docker) | ~100MB | Nginx Proxy Manager |
| Next.js (PM2) | 450MB | max_memory_restart |
| Telegram Bot (PM2) | 150MB | max_memory_restart |
| **Total** | **~1.5GB** | Buffer ~500MB untuk spike |
