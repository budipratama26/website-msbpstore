import redis from "@/lib/redis";
import prisma from "@/lib/prisma";

// ══════════════════════════════════════════════════════════════════════════════
// 🔍 MSBP Store — User Activity Tracking
// ══════════════════════════════════════════════════════════════════════════════
// Redis: Real-time online status (auto-expire 5 menit)
// PostgreSQL: Activity log untuk audit trail (auto-cleanup 30 hari)
// ══════════════════════════════════════════════════════════════════════════════

const ONLINE_TTL = 300; // 5 menit — setelah ini dianggap offline
const ONLINE_PREFIX = "monitor:online:";
const GUEST_PREFIX = "monitor:guest:";
const STATS_PREFIX = "monitor:stats:";

interface OnlineUser {
    userId?: string;
    name?: string;
    email?: string;
    role?: string;
    path: string;
    ip: string;
    userAgent?: string;
    lastSeen: number; // Unix timestamp ms
    isGuest: boolean;
}

/**
 * Track user/guest page view — simpan ke Redis (real-time, auto-expire)
 */
export async function trackPageView(
    userId: string | null,
    name: string | null,
    email: string | null,
    role: string | null,
    path: string,
    ip: string,
    userAgent?: string
): Promise<void> {
    try {
        const data: OnlineUser = {
            userId: userId || undefined,
            name: name || undefined,
            email: email || undefined,
            role: role || undefined,
            path,
            ip,
            userAgent: userAgent?.substring(0, 200), // Truncate UA
            lastSeen: Date.now(),
            isGuest: !userId,
        };

        if (userId) {
            // Logged-in user — track by userId
            await redis.setex(`${ONLINE_PREFIX}${userId}`, ONLINE_TTL, JSON.stringify(data));
        } else {
            // Guest — track by IP (hash for privacy)
            const guestKey = ip.replace(/[.:]/g, "_");
            await redis.setex(`${GUEST_PREFIX}${guestKey}`, ONLINE_TTL, JSON.stringify(data));
        }

        // Increment daily visitor counter
        const today = new Date().toISOString().split("T")[0]; // "2026-04-15"
        const dailyKey = `${STATS_PREFIX}visitors:${today}`;
        const uniqueKey = userId || ip;
        await redis.sadd(dailyKey, uniqueKey);
        await redis.expire(dailyKey, 86400 * 2); // Keep 2 days

        // Track page popularity
        const pageKey = `${STATS_PREFIX}pages:${today}`;
        await redis.zincrby(pageKey, 1, path);
        await redis.expire(pageKey, 86400 * 2);
    } catch (e) {
        // Silent fail — monitoring should never slow down the app
        console.error("[Activity] Track error:", e);
    }
}

/**
 * Get all currently online users + guests from Redis
 */
export async function getOnlineUsers(): Promise<OnlineUser[]> {
    try {
        const users: OnlineUser[] = [];

        // Scan for logged-in users
        let cursor = "0";
        do {
            const [nextCursor, keys] = await redis.scan(cursor, "MATCH", `${ONLINE_PREFIX}*`, "COUNT", 100);
            cursor = nextCursor;
            if (keys.length > 0) {
                const values = await redis.mget(...keys);
                for (const val of values) {
                    if (val) {
                        try { users.push(JSON.parse(val)); } catch {}
                    }
                }
            }
        } while (cursor !== "0");

        // Scan for guests
        cursor = "0";
        do {
            const [nextCursor, keys] = await redis.scan(cursor, "MATCH", `${GUEST_PREFIX}*`, "COUNT", 100);
            cursor = nextCursor;
            if (keys.length > 0) {
                const values = await redis.mget(...keys);
                for (const val of values) {
                    if (val) {
                        try { users.push(JSON.parse(val)); } catch {}
                    }
                }
            }
        } while (cursor !== "0");

        // Sort: most recent first
        users.sort((a, b) => b.lastSeen - a.lastSeen);

        return users;
    } catch (e) {
        console.error("[Activity] getOnlineUsers error:", e);
        return [];
    }
}

/**
 * Get today's stats from Redis
 */
export async function getDailyStats(): Promise<{
    onlineNow: number;
    visitorsToday: number;
    topPages: { path: string; count: number }[];
}> {
    try {
        const users = await getOnlineUsers();
        const today = new Date().toISOString().split("T")[0];

        const visitorsToday = await redis.scard(`${STATS_PREFIX}visitors:${today}`);
        const topPagesRaw = await redis.zrevrange(`${STATS_PREFIX}pages:${today}`, 0, 9, "WITHSCORES");

        const topPages: { path: string; count: number }[] = [];
        for (let i = 0; i < topPagesRaw.length; i += 2) {
            topPages.push({ path: topPagesRaw[i], count: parseInt(topPagesRaw[i + 1]) });
        }

        return {
            onlineNow: users.length,
            visitorsToday: visitorsToday || 0,
            topPages,
        };
    } catch (e) {
        console.error("[Activity] getDailyStats error:", e);
        return { onlineNow: 0, visitorsToday: 0, topPages: [] };
    }
}

/**
 * Log important activity to database (audit trail)
 */
export async function logActivity(
    action: string,
    detail: string | null,
    userId?: string | null,
    ip?: string | null,
    userAgent?: string | null,
    path?: string | null
): Promise<void> {
    try {
        await prisma.activityLog.create({
            data: {
                userId: userId ? BigInt(userId) : null,
                action,
                detail,
                ip: ip || null,
                userAgent: userAgent?.substring(0, 500) || null,
                path: path || null,
            },
        });
    } catch (e) {
        console.error("[Activity] logActivity DB error:", e);
    }
}

/**
 * Get activity logs from database (paginated)
 */
export async function getActivityLogs(options: {
    page?: number;
    limit?: number;
    action?: string;
    userId?: string;
} = {}): Promise<{
    logs: any[];
    total: number;
    page: number;
    totalPages: number;
}> {
    const page = options.page || 1;
    const limit = options.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (options.action && options.action !== "ALL") where.action = options.action;
    if (options.userId) where.userId = BigInt(options.userId);

    const [logs, total] = await Promise.all([
        prisma.activityLog.findMany({
            where,
            orderBy: { createdAt: "desc" },
            take: limit,
            skip,
            include: {
                user: {
                    select: { id: true, name: true, email: true, avatar: true, role: true },
                },
            },
        }),
        prisma.activityLog.count({ where }),
    ]);

    return {
        logs: logs.map((log) => ({
            id: log.id.toString(),
            userId: log.userId?.toString() || null,
            action: log.action,
            detail: log.detail,
            ip: log.ip,
            userAgent: log.userAgent,
            path: log.path,
            createdAt: log.createdAt.toISOString(),
            user: log.user ? {
                id: log.user.id.toString(),
                name: log.user.name,
                email: log.user.email,
                avatar: log.user.avatar,
                role: log.user.role,
            } : null,
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit),
    };
}

/**
 * Cleanup old logs — auto-delete older than 30 days
 */
export async function cleanupOldLogs(): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await prisma.activityLog.deleteMany({
        where: { createdAt: { lt: thirtyDaysAgo } },
    });

    return result.count;
}
