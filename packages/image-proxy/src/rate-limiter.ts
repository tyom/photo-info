import { Context, Next } from 'hono';

export interface Env {
  RATE_LIMIT_KV: KVNamespace;
  ENVIRONMENT?: string;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class RateLimiter {
  private readonly USER_LIMIT = 20;
  private readonly GLOBAL_LIMIT = 120;
  private readonly WINDOW_MS = 60 * 1000; // 1 minute

  constructor(private kv: KVNamespace) {}

  private getUserId(c: Context): string {
    const forwarded = c.req.header('x-forwarded-for');
    const realIp = c.req.header('x-real-ip');
    const cfConnectingIp = c.req.header('cf-connecting-ip');
    const clientIp =
      cfConnectingIp || forwarded?.split(',')[0].trim() || realIp || 'unknown';

    const userId = c.req.header('x-user-id');

    return userId || clientIp;
  }

  private isWindowExpired(resetAt: number): boolean {
    return Date.now() >= resetAt;
  }

  async middleware(c: Context<{ Bindings: Env }>, next: Next) {
    const userId = this.getUserId(c);
    const now = Date.now();

    // Get global rate limit
    const globalKey = 'global:rate_limit';
    const globalData = await this.kv.get<RateLimitEntry>(globalKey, 'json');
    let globalEntry: RateLimitEntry = globalData || {
      count: 0,
      resetAt: now + this.WINDOW_MS,
    };

    // Reset global counter if window expired
    if (this.isWindowExpired(globalEntry.resetAt)) {
      globalEntry = { count: 0, resetAt: now + this.WINDOW_MS };
    }

    // Get user-specific rate limit
    const userKey = `user:${userId}`;
    const userData = await this.kv.get<RateLimitEntry>(userKey, 'json');
    let userEntry: RateLimitEntry = userData || {
      count: 0,
      resetAt: now + this.WINDOW_MS,
    };

    // Reset user counter if window expired
    if (this.isWindowExpired(userEntry.resetAt)) {
      userEntry = { count: 0, resetAt: now + this.WINDOW_MS };
    }

    // Check global limit
    if (globalEntry.count >= this.GLOBAL_LIMIT) {
      const globalResetIn = Math.max(
        0,
        Math.ceil((globalEntry.resetAt - now) / 1000),
      );

      c.header('X-RateLimit-Global-Limit', this.GLOBAL_LIMIT.toString());
      c.header('X-RateLimit-Global-Remaining', '0');
      c.header('X-RateLimit-Global-Reset', globalResetIn.toString());

      return c.json(
        {
          error: 'Too many requests',
          message: 'Global rate limit exceeded. Please try again later.',
          retryAfter: globalResetIn,
        },
        429,
      );
    }

    // Check user limit
    if (userEntry.count >= this.USER_LIMIT) {
      const userResetIn = Math.max(
        0,
        Math.ceil((userEntry.resetAt - now) / 1000),
      );

      c.header('X-RateLimit-User-Limit', this.USER_LIMIT.toString());
      c.header('X-RateLimit-User-Remaining', '0');
      c.header('X-RateLimit-User-Reset', userResetIn.toString());

      return c.json(
        {
          error: 'Too many requests',
          message: 'User rate limit exceeded. Please try again later.',
          retryAfter: userResetIn,
        },
        429,
      );
    }

    // Increment counters
    globalEntry.count++;
    userEntry.count++;

    // Save updated counters to KV with TTL (minimum 60 seconds for KV)
    const globalTTL = Math.max(
      60,
      Math.ceil((globalEntry.resetAt - now) / 1000),
    );
    const userTTL = Math.max(60, Math.ceil((userEntry.resetAt - now) / 1000));

    await Promise.all([
      this.kv.put(globalKey, JSON.stringify(globalEntry), {
        expirationTtl: globalTTL,
      }),
      this.kv.put(userKey, JSON.stringify(userEntry), {
        expirationTtl: userTTL,
      }),
    ]);

    // Set rate limit headers
    const globalRemaining = this.GLOBAL_LIMIT - globalEntry.count;
    const userRemaining = this.USER_LIMIT - userEntry.count;

    const globalResetIn = Math.max(
      0,
      Math.ceil((globalEntry.resetAt - now) / 1000),
    );
    const userResetIn = Math.max(
      0,
      Math.ceil((userEntry.resetAt - now) / 1000),
    );

    c.header('X-RateLimit-Global-Limit', this.GLOBAL_LIMIT.toString());
    c.header('X-RateLimit-Global-Remaining', globalRemaining.toString());
    c.header('X-RateLimit-Global-Reset', globalResetIn.toString());

    c.header('X-RateLimit-User-Limit', this.USER_LIMIT.toString());
    c.header('X-RateLimit-User-Remaining', userRemaining.toString());
    c.header('X-RateLimit-User-Reset', userResetIn.toString());

    await next();
  }
}

export default RateLimiter;
