import type { NextConfig } from "next";
import path from "path";

// ══════════════════════════════════════════════════════════════════════════════
// 🔐 MSBP Store — Enterprise Security Headers Configuration
// ══════════════════════════════════════════════════════════════════════════════
// All security headers consolidated here. Middleware.ts syncs for dynamic responses.
// Last audit: 2026-04-23 — Added standalone output + lockfile fix
// ══════════════════════════════════════════════════════════════════════════════

const ContentSecurityPolicy = [
  // Baseline: block everything not explicitly allowed
  "default-src 'self'",

  // Scripts: self + inline (Next.js hydration requires inline scripts)
  // NO unsafe-eval — Next.js 15 does NOT need it in production
  "script-src 'self' 'unsafe-inline' https://*.google.com https://*.googleapis.com https://accounts.google.com",

  // Styles: self + inline (Tailwind CSS + dangerouslySetInnerHTML style tags)
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",

  // Fonts: Google Fonts CDN
  "font-src 'self' https://fonts.gstatic.com",

  // Images: allow all HTTPS sources (product images from various CDNs)
  "img-src 'self' data: blob: https:",

  // API/fetch: self + all HTTPS (Pakasir, Google Auth, etc.)
  "connect-src 'self' https:",

  // ⭐ Anti-clickjacking via CSP Level 2 (redundant with X-Frame-Options but stronger)
  "frame-ancestors 'none'",

  // ⭐ NEW: Prevent <base> tag injection (attacker can't redirect relative URLs)
  "base-uri 'self'",

  // ⭐ NEW: Restrict form submissions to same origin only
  "form-action 'self' https://accounts.google.com",

  // ⭐ NEW: Block Flash/Java/legacy plugins (XSS vector)
  "object-src 'none'",

  // ⭐ NEW: Restrict Web Workers to same origin
  "worker-src 'self' blob:",

  // ⭐ NEW: Restrict <iframe> sources (we don't embed anything)
  "frame-src 'self' https://accounts.google.com",

  // Force HTTPS on all sub-resources
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  // Standalone output removed to fix VPS build errors and module missing issues.
  // Standard Next.js build is much more stable with PM2.

  // Hide X-Powered-By header (information disclosure prevention)
  poweredByHeader: false,

  // Disable source maps in production (prevents code structure leakage)
  productionBrowserSourceMaps: false,

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // ── Anti-Clickjacking ──────────────────────────────────────────
          { key: "X-Frame-Options", value: "DENY" },

          // ── Prevent MIME type sniffing ─────────────────────────────────
          { key: "X-Content-Type-Options", value: "nosniff" },

          // ── DNS Prefetch for performance ───────────────────────────────
          { key: "X-DNS-Prefetch-Control", value: "on" },

          // ── Control referrer information leakage ───────────────────────
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

          // ── Restrict browser features / APIs ──────────────────────────
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()",
          },

          // ── HSTS and CSP handled by Cloudflare / Middleware ───────────

          // ── XSS Protection: DISABLED (modern approach) ────────────────
          // "1; mode=block" is DEPRECATED and can CAUSE XSS in older browsers
          // via timing side-channel. Set to 0, rely on CSP instead.
          { key: "X-XSS-Protection", value: "0" },
        ],
      },
    ];
  },
};

export default nextConfig;