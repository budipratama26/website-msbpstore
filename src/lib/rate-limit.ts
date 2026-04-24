import redis from './redis';

/**
 * High-performance rate limiter using direct TCP Redis connection.
 * @param identifier Client IP address or User ID (format: `ip:1.1.1.1` or `user:123`)
 * @param type 'auth' (50/min), 'gen' (2000/min), or 'admin' (5000/min)
 * @returns { allowed: boolean, count: number }
 */
export async function checkRateLimit(identifier: string, type: 'auth' | 'gen' | 'admin' = 'gen') {
    // Ensure we only use the first item if a list was passed
    const cleanId = identifier.split(',')[0].trim();
    const key = `rl:${type}:${cleanId}`;
    
    let limit = 2000;
    if (type === 'auth') limit = 50;
    if (type === 'admin') limit = 5000;

    try {
        // Direct TCP atomic increment
        const current = await redis.incr(key);

        // Set TTL on first hit
        if (current === 1) {
            await redis.expire(key, 60);
        }

        if (current > limit) {
            console.warn(`[API RATE LIMIT] Identity ${cleanId} exceeded ${type} limit: ${current}/${limit}`);
        }

        return {
            allowed: current <= limit,
            count: current
        };
    } catch (error) {
        // Fallback: log error and allow request to prevent downtime
        console.error("[REDIS RATE LIMIT ERROR]:", error);
        return { allowed: true, count: 0 };
    }
}
