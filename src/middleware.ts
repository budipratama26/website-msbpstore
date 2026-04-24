import { NextResponse } from "next/server";
import { auth } from "@/auth";
import redis from "@/lib/redis";
// 🔐 SECURITY CONFIG
// ══════════════════════════════════════════════════════════════════════════════
const BAN_DURATION = 5 * 60;           // 5 minutes ban
const RATE_LIMIT_WINDOW = 60;          // 60 seconds

// Limits per minute (per IP)
const LIMITS = {
    AUTH: 150,       // /api/auth — relaxed for humans (auth makes many calls)
    CHECKOUT: 100,   // /api/checkout — moderate
    GLOBAL: 500      // All other routes — increased for multi-tab/refresh usage
};

// Tier 2: Burst Detection (Instant Block)
const BURST_LIMIT = 400;               // Max 400 requests...
const BURST_WINDOW = 10;               // ...in 10 seconds → instant ban

/** Detection for automated tools/bots/scanners */
function isBot(userAgent: string | null): boolean {
    if (!userAgent) return false; // Allow if no agent (system/health checks)

    const botPattern = new RegExp([
        // ── Path Enumeration / Directory Brute Force ─────────────────────
        'dirb', 'dirbuster', 'gobuster', 'feroxbuster', 'rustbuster',
        'ffuf', 'wfuzz', 'fuzz faster', 'patator',

        // ── Vulnerability Scanners ───────────────────────────────────────
        'sqlmap', 'nikto', 'nessus', 'openvas', 'acunetix', 'netsparker',
        'qualys', 'w3af', 'arachni', 'skipfish', 'vega', 'whatweb',
        'wpscan', 'joomscan', 'droopescan', 'nuclei', 'jaeles',
        'xsstrike', 'dalfox', 'commix',

        // ── Network Scanners ─────────────────────────────────────────────
        'nmap', 'masscan', 'zmap', 'zgrab', 'rustscan', 'shodan',
        'censys', 'internetmeasurement', 'netcraft',

        // ── Exploitation Frameworks ──────────────────────────────────────
        'metasploit', 'cobalt.?strike', 'empire', 'beef',

        // ── Proxy / Interception Tools ───────────────────────────────────
        'burp.?suite', 'owasp.?zap', 'zap\\/|zaproxy', 'mitmproxy',
        'fiddler', 'charles',

        // ── Brute Force Tools ────────────────────────────────────────────
        'hydra', 'medusa', 'hashcat', 'john',

        // ── HTTP Libraries / Bots ────────────────────────────────────────
        'python-requests', 'python-urllib', 'python-httpx',
        'node-fetch', 'axios', 'undici',
        'curl\\/', 'wget\\/', 'libwww-perl', 'lwp-',
        'java\\/', 'apache-httpclient', 'okhttp',
        'go-http-client', 'fasthttp',
        'ruby', 'perl', 'php\\/',
        'aiohttp', 'httpx', 'httpie',
        'scrapy', 'mechanize', 'httpclient',
        'winhttp', 'rest-client', 'http-kit',

        // ── Headless Browsers / Automation ───────────────────────────────
        'phantomjs', 'headlesschrome', 'selenium', 'puppeteer',
        'playwright', 'nightmarejs', 'casperjs',

        // ── Stress Testing / DDoS ────────────────────────────────────────
        'gatling', 'jmeter', 'locust', 'artillery', 'k6', 'wrk',
        'siege', 'ab\\/|apachebench', 'bombardier', 'hey\\/',
        'loader\\.io', 'loadimpact',

        // ── Other Recon Tools ────────────────────────────────────────────
        'postman', 'insomnia', 'thunder.?client',
        'fierce', 'subfinder', 'amass', 'httpx-toolkit',
    ].join('|'), 'i');

    return botPattern.test(userAgent);
}


/** Check if IP is whitelisted (Admin/Developer) */
function isWhitelisted(ip: string): boolean {
    const trusted = process.env.TRUSTED_IPS?.split(",") || (process.env.NODE_ENV !== "production" ? ["127.0.0.1", "::1"] : []);
    return trusted.includes(ip);
}

/** CSRF Origin validation for state-changing requests */
function isValidOrigin(req: any): boolean {
    const method = req.method?.toUpperCase();
    // Only enforce for state-changing methods
    if (!method || ["GET", "HEAD", "OPTIONS"].includes(method)) return true;

    const origin = req.headers.get("origin");
    const referer = req.headers.get("referer");
    const host = req.headers.get("host");

    // Allow if no origin (same-origin requests from some browsers)
    if (!origin && !referer) return true;

    const allowedOrigins = [
        `https://${host}`,
        `http://${host}`,
        "https://msbpstore.my.id",
        "http://msbpstore.my.id",
        "https://www.msbpstore.my.id",
        // Allow localhost in development
        ...(process.env.NODE_ENV !== "production" ? ["http://localhost:3000", "http://127.0.0.1:3000"] : [])
    ];

    if (origin && allowedOrigins.some(allowed => origin.startsWith(allowed))) return true;
    if (referer && allowedOrigins.some(allowed => referer.startsWith(allowed))) return true;

    return false;
}

/** Check for path traversal attempts */
function hasPathTraversal(path: string): boolean {
    const decoded = decodeURIComponent(path);
    return decoded.includes("..") || 
           path.includes("..%2f") || 
           path.includes("..%5c") || 
           path.includes("%2e%2e") ||
           path.includes("..\\");
}

// ══════════════════════════════════════════════════════════════════════════════
// 🛡️ SECURITY HEADERS — applied to ALL dynamic responses (429, 403, normal)
// Must stay in sync with next.config.ts headers for static responses
// ══════════════════════════════════════════════════════════════════════════════

const generateNonce = () => {
    return Buffer.from(crypto.randomUUID()).toString('base64');
};

const getCspPolicy = (nonce: string) => [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://*.google.com https://*.googleapis.com https://accounts.google.com`,
    // style-src still needs 'unsafe-inline' for Tailwind/Next.js styles unless we use hashes/nonces there too
    // but the main concern for security scanners is usually script-src
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self' https://accounts.google.com",
    "object-src 'none'",
    "worker-src 'self' blob:",
    "frame-src 'self' https://accounts.google.com",
    "upgrade-insecure-requests",
].join("; ");

const SECURITY_HEADERS: Record<string, string> = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    // X-XSS-Protection set to 0 (modern approach)
    "X-XSS-Protection": "0",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()",
    // Strict-Transport-Security: Handled by Cloudflare
    // "Content-Security-Policy": Added dynamically with nonce
    // Cross-Origin Isolation headers removed due to conflicts with NextAuth and external CDNs
};

/** Inject security headers into any Response/NextResponse */
function withSecurityHeaders(res: Response | NextResponse, nonce: string): Response | NextResponse {
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
        res.headers.set(key, value);
    }
    res.headers.set("Content-Security-Policy", getCspPolicy(nonce));
    res.headers.set("x-nonce", nonce);
    return res;
}

/** Create a Too Many Requests response with premium UI */
function tooManyRequests(ip: string, retryAfter: string, nonce: string): Response | NextResponse {
    const html = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sabar Dulu - MSBP Store</title>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap" rel="stylesheet">
        <style>
            :root { --primary: #10b981; --bg: #0a0a0a; }
            body { 
                margin: 0; padding: 0; 
                background: var(--bg); 
                color: white; 
                font-family: 'Plus Jakarta Sans', sans-serif;
                display: flex; align-items: center; justify-content: center;
                height: 100vh; overflow: hidden;
            }
            .container {
                text-align: center;
                padding: 3rem;
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.05);
                border-radius: 24px;
                backdrop-filter: blur(12px);
                max-width: 450px;
                animation: fadeIn 0.8s ease-out;
            }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            h1 { font-size: 2.5rem; margin-bottom: 0.5rem; color: #facc15; }
            p { color: #94a3b8; line-height: 1.6; margin-bottom: 2rem; }
            .timer {
                font-size: 3rem;
                font-weight: 800;
                color: var(--primary);
                margin-bottom: 1rem;
            }
            .info {
                background: rgba(255, 255, 255, 0.05);
                color: #94a3b8;
                padding: 1rem;
                border-radius: 12px;
                font-size: 0.85rem;
                margin-bottom: 2rem;
            }
            .footer { font-size: 0.8rem; color: #475569; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Sabar Dulu...</h1>
            <p>Kamu terlalu cepat merefresh halaman. Silakan bernapas dulu sejenak dan coba lagi dalam:</p>
            <div class="timer" id="timer">${retryAfter}s</div>
            <div class="info">
                <strong>IP Kamu:</strong> ${ip}<br>
                Limit request global terlampaui.
            </div>
            <div class="footer">MSBP Store Protection System</div>
        </div>
        <script nonce="${nonce}">
            let count = ${retryAfter};
            const timer = document.getElementById('timer');
            const interval = setInterval(() => {
                count--;
                if (count <= 0) {
                    clearInterval(interval);
                    window.location.reload();
                } else {
                    timer.innerText = count + 's';
                }
            }, 1000);
        </script>
    </body>
    </html>
    `;

    return withSecurityHeaders(
        new NextResponse(html, { 
            status: 429,
            headers: { 'Content-Type': 'text/html', 'Retry-After': retryAfter }
        }),
        nonce
    );
}

/** Create a blocked response with security headers and premium UI */
function forbidden(ip: string, reason: string, nonce: string): Response | NextResponse {
    const html = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Akses Terbatas - MSBP Store</title>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap" rel="stylesheet">
        <style>
            :root { --primary: #10b981; --bg: #0a0a0a; }
            body { 
                margin: 0; padding: 0; 
                background: var(--bg); 
                color: white; 
                font-family: 'Plus Jakarta Sans', sans-serif;
                display: flex; align-items: center; justify-content: center;
                height: 100vh; overflow: hidden;
            }
            .container {
                text-align: center;
                padding: 3rem;
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.05);
                border-radius: 24px;
                backdrop-filter: blur(12px);
                max-width: 450px;
                animation: fadeIn 0.8s ease-out;
            }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            h1 { font-size: 2.5rem; margin-bottom: 0.5rem; color: #ef4444; }
            p { color: #94a3b8; line-height: 1.6; margin-bottom: 2rem; }
            .info {
                background: rgba(239, 68, 68, 0.1);
                color: #f87171;
                padding: 1rem;
                border-radius: 12px;
                font-size: 0.9rem;
                margin-bottom: 2rem;
            }
            .footer { font-size: 0.8rem; color: #475569; }
            .btn {
                background: var(--primary);
                color: white;
                text-decoration: none;
                padding: 0.75rem 1.5rem;
                border-radius: 12px;
                font-weight: 600;
                display: inline-block;
                transition: transform 0.2s;
            }
            .btn:hover { transform: scale(1.05); }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Akses Dibatasi</h1>
            <p>Sistem kami mendeteksi aktivitas yang tidak biasa dari koneksi Anda. Ini biasanya terjadi karena terlalu banyak permintaan dalam waktu singkat.</p>
            <div class="info">
                <strong>Alasan:</strong> ${reason}<br>
                <strong>IP Anda:</strong> ${ip}
            </div>
            <a href="https://msbpstore.my.id" class="btn">Kembali ke Beranda</a>
            <div style="margin-top: 2rem;" class="footer">Jika Anda merasa ini adalah kesalahan, silakan hubungi Customer Service kami.</div>
        </div>
    </body>
    </html>
    `;

    return withSecurityHeaders(
        new NextResponse(html, { 
            status: 403,
            headers: { 'Content-Type': 'text/html' }
        }),
        nonce
    );
}

// ══════════════════════════════════════════════════════════════════════════════

export default auth(async (req: any) => {
    const nonce = generateNonce();
    const isLoggedIn = !!req.auth;
    const { nextUrl } = req;
    const path = nextUrl.pathname.toLowerCase();

    // ──────────────────────────────────────────────────────────────────────
    // 0. STATIC ASSET BYPASS — skip all logic for static files
    // ──────────────────────────────────────────────────────────────────────
    const isAsset = /\.(png|jpg|jpeg|gif|webp|svg|ico|css|js|woff2?|avif|mp4|webm)$/i.test(path) || 
                    ['/icon', '/apple-icon', '/favicon.ico', '/status'].includes(path);
    if (isAsset) return withSecurityHeaders(NextResponse.next(), nonce);

    // Enhanced IP Detection (Fix IP Spoofing)
    // Always use req.ip if available (Vercel/Next.js sets this securely).
    // Fallback headers must be sanitized by reverse proxies (Nginx/Cloudflare) to prevent spoofing.
    const ip = req.ip || 
               req.headers.get("cf-connecting-ip") || 
               req.headers.get("x-real-ip") || 
               (req.headers.get("x-forwarded-for")?.split(',')[0].trim()) || 
               "127.0.0.1";

    // ──────────────────────────────────────────────────────────────────────
    // 1. PATH TRAVERSAL PROTECTION — instant block, no Redis needed
    // ──────────────────────────────────────────────────────────────────────
    if (hasPathTraversal(path)) {
        console.warn(`[PATH TRAVERSAL] IP ${ip} tried: ${path}`);
        return forbidden(ip, "Akses tidak valid.", nonce);
    }

    // ──────────────────────────────────────────────────────────────────────
    // 1.5. DIRECTORY ENUMERATION SHIELD — ultra-lightweight instant drop
    //      This runs BEFORE Redis calls to prevent resource exhaustion
    //      during directory scanning attacks (the exact attack that crashed VPS)
    //      Returns bare 404: no HTML, no headers, no Redis = ZERO overhead
    // ──────────────────────────────────────────────────────────────────────
    const dirEnumPattern = /^\/~|^\/\.\w|^\/[.]{2}/;
    if (dirEnumPattern.test(path)) {
        // Minimal log — don't even use console.warn to save CPU during flood
        if (Math.random() < 0.01) { // Log only 1% of attempts to avoid log flood
            console.warn(`[DIR ENUM] IP ${ip} blocked (sampling): ${path}`);
        }
        return new NextResponse(null, { status: 404 });
    }

    // ──────────────────────────────────────────────────────────────────────
    // 2. HACKER SCANNERS BLOCK — moved BEFORE rate limiting 
    //    (don't waste Redis quota on known malicious paths)
    // ──────────────────────────────────────────────────────────────────────
    const hackerPaths = [
        '.php', '.asp', '.aspx', '.jsp', '/wp-admin', '/wp-login', '/phpmyadmin',
        '/.env', '/.git', '/.well-known/security.txt', '/cgi-bin', '/config',
        '/backup', '/.vscode', '/node_modules', '/package.json', '/package-lock.json',
        '/next.config', '/tsconfig.json', '/composer.json', '/.htaccess', '/.ssh',
        '/xmlrpc', '/wp-content', '/wp-includes', '/.svn', '/.hg', '/debug',
        '/console', '/shell', '/cmd', '/exec', '/eval', '/admin.php',
        '/.aws', '/.docker', '/Dockerfile', '/docker-compose'
    ];

    if (hackerPaths.some(hPath => path.includes(hPath))) {
        // Lightweight response — don't waste CPU generating HTML for scanners
        if (Math.random() < 0.05) { // Log 5% to track without flooding
            console.warn(`[HACKER SCAN] IP ${ip} tried to access: ${path}`);
        }
        return new NextResponse(null, { status: 404 });
    }

    // ──────────────────────────────────────────────────────────────────────
    // 3. OPEN REDIRECT PROTECTION
    // ──────────────────────────────────────────────────────────────────────
    const callbackUrl = nextUrl.searchParams.get("callbackUrl");
    if (callbackUrl) {
        try {
            const isRelative = callbackUrl.startsWith("/");
            const isAllowedDomain = callbackUrl.startsWith("https://msbpstore.my.id") || 
                                    callbackUrl.startsWith("http://msbpstore.my.id");
            
            if (!isRelative && !isAllowedDomain) {
                console.warn(`[OPEN REDIRECT] IP ${ip} tried redirect to: ${callbackUrl}`);
                return withSecurityHeaders(NextResponse.redirect(new URL("/", nextUrl)), nonce);
            }
        } catch (e) {
            return withSecurityHeaders(NextResponse.redirect(new URL("/", nextUrl)), nonce);
        }
    }

    // ──────────────────────────────────────────────────────────────────────
    // 4. CSRF ORIGIN VALIDATION — for state-changing API requests
    // ──────────────────────────────────────────────────────────────────────
    if (path.startsWith("/api") && !isValidOrigin(req)) {
        console.warn(`[CSRF BLOCKED] IP ${ip} | Method: ${req.method} | Path: ${path} | Origin: ${req.headers.get("origin")} | Referer: ${req.headers.get("referer")}`);
        return withSecurityHeaders(
            new NextResponse(JSON.stringify({ error: "Forbidden: Invalid origin" }), {
                status: 403,
                headers: { "Content-Type": "application/json" }
            }),
            nonce
        );
    }

    // ──────────────────────────────────────────────────────────────────────
    // 5. ROUTING LOGIC (Primary priority)
    // ──────────────────────────────────────────────────────────────────────
    const isAdminRoute = nextUrl.pathname.startsWith('/admin');
    const isAuthRoute = ['/login', '/register', '/forgot-password', '/reset-password'].includes(nextUrl.pathname);

    if (isAdminRoute) {
        if (!isLoggedIn) return withSecurityHeaders(NextResponse.redirect(new URL("/login", nextUrl)), nonce);
        if ((req.auth?.user as any)?.role !== "admin") return withSecurityHeaders(NextResponse.redirect(new URL("/", nextUrl)), nonce);
    }

    if (isAuthRoute && isLoggedIn) {
        const role = (req.auth?.user as any)?.role;
        return withSecurityHeaders(NextResponse.redirect(new URL(role === "admin" ? "/admin/dashboard" : "/", nextUrl)), nonce);
    }

    // ──────────────────────────────────────────────────────────────────────
    // 6. BOT HUNTER — Instant Block Automated Tools
    // ──────────────────────────────────────────────────────────────────────
    if (isBot(req.headers.get("user-agent")) && !isWhitelisted(ip)) {
        console.warn(`[BOT BLOCKED] IP ${ip}: Automated Tool detected | UA: ${req.headers.get("user-agent")}`);
        return forbidden(ip, "Deteksi alat otomatis (Bot Protection).", nonce);
    }

    // ──────────────────────────────────────────────────────────────────────
    // 7. GLOBAL RATE LIMITING — Applied to ALL routes
    // ──────────────────────────────────────────────────────────────────────
    try {
        // Skip security logic for Whitelisted IPs
        if (isWhitelisted(ip)) return withSecurityHeaders(NextResponse.next(), nonce);

        // We establish a primary key for rate-limiting. For logged-in users, ALWAYS use their userId.
        // This prevents them from bypassing limits by cycling IPs (IP spoofing mitigation).
        const identifier = isLoggedIn && (req.auth?.user as any)?.id 
            ? `user:${(req.auth?.user as any).id}` 
            : `ip:${ip}`;

        // ── TIER 1: BAN CHECK ──
        const banKey = `ban:${identifier}`;
        if (await redis.exists(banKey)) {
            return forbidden(ip, "Akses Anda diblokir sementara karena aktivitas berlebih.", nonce);
        }

        // ── TIER 2: BURST DETECTION (DDoS) ──
        const burstKey = `burst:${identifier}`;
        const burstCount = await redis.incr(burstKey);
        if (burstCount === 1) await redis.expire(burstKey, BURST_WINDOW);

        if (burstCount > BURST_LIMIT) {
            await redis.set(banKey, '1', 'EX', BAN_DURATION);
            console.warn(`[DDoS BAN] Identity ${identifier} banned: ${burstCount} req in ${BURST_WINDOW}s | Path: ${path}`);
            return forbidden(ip, "Aktivitas mencurigakan (DDoS Protection).", nonce);
        }

        // ── TIER 3: DYNAMIC RATE LIMITS ──
        let limit = LIMITS.GLOBAL;
        let rlKey = `rl:global:${identifier}`;

        if (path.startsWith("/api/auth")) {
            limit = LIMITS.AUTH;
            rlKey = `rl:auth:${identifier}`;
        } else if (path.startsWith("/api/checkout")) {
            limit = LIMITS.CHECKOUT;
            rlKey = `rl:checkout:${identifier}`;
        }

        const current = await redis.incr(rlKey);
        if (current === 1) await redis.expire(rlKey, RATE_LIMIT_WINDOW);

        if (current > limit) {
            const ttl = await redis.ttl(rlKey);
            const retryAfter = (ttl > 0 ? ttl : 60).toString();

            console.warn(`[RATE LIMIT] Identity ${identifier} reached limit (${current}/${limit}) on ${path}`);

            // 🎨 PROFESSIONAL ERROR HANDLING
            // If it's a page navigation, show the premium 429 page
            if (req.headers.get("accept")?.includes("text/html")) {
                return tooManyRequests(ip, retryAfter, nonce);
            }

            // If it's an API call or other, return clean JSON
            return withSecurityHeaders(
                new NextResponse(JSON.stringify({ error: 'Too Many Requests', retryAfter }), { 
                    status: 429,
                    headers: { 'Retry-After': retryAfter, 'Content-Type': 'application/json' }
                }),
                nonce
            );
        }
    } catch (e) {
        console.error("Redis Security Error:", e);
    }

    // ──────────────────────────────────────────────────────────────────────
    // 8. STRICT API PROTECTION
    // ──────────────────────────────────────────────────────────────────────
    const isApiRoute = path.startsWith("/api");
    if (path.startsWith("/api/internal")) {
        console.warn(`[INTERNAL ACCESS] IP ${ip} tried to access /api/internal`);
        return forbidden(ip, "Akses terbatas.", nonce);
    }

    const isPublicApiRoute =
        path.includes("/api/auth") ||
        path.startsWith("/api/checkout") ||
        path.startsWith("/api/register") ||
        path.startsWith("/api/forgot-password") ||
        path.startsWith("/api/reset-password") ||
        path.startsWith("/api/resend-otp") ||
        path.startsWith("/api/verify-otp") ||
        path.startsWith("/api/categories") || 
        path.startsWith("/api/products") ||
        path.startsWith("/api/orders/status");

    if (isApiRoute && !isPublicApiRoute && !isLoggedIn) {
        return withSecurityHeaders(
            new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { "Content-Type": "application/json" }
            }),
            nonce
        );
    }

    // ──────────────────────────────────────────────────────────────────────
    // 9. NORMAL RESPONSE
    // ──────────────────────────────────────────────────────────────────────

    return NextResponse.next();
});

export const config = {
    runtime: 'nodejs',
    matcher: ["/((?!_next/static|_next/image|favicon.ico|api/webhooks).*)"],
};
