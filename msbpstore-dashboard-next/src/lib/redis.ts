import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';

const globalForRedis = global as unknown as { redis: Redis | undefined };

// Configure Redis with connection retries and error handling
const redisClient = globalForRedis.redis ?? new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    connectTimeout: 5000,
    lazyConnect: true, // Only connect when a command is issued
    retryStrategy(times) {
        return Math.min(times * 50, 2000);
    }
});

// Suppress unhandled error events (common during build/dev restarts)
redisClient.on('error', (err) => {
    // NEXT_PHASE is injected by Next.js during various phases
    if (process.env.NEXT_PHASE === 'phase-production-build') return;

    // Also ignore DNS lookup failures during build if phase isn't detected correctly
    if (err.message.includes('EAI_AGAIN')) return;

    console.error('[Redis Error]:', err.message);
});

export const redis = redisClient;

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

export default redis;
