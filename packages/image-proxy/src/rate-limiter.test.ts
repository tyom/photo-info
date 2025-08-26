import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import RateLimiter, { type Env } from './rate-limiter';
import { createKVMock } from './test-utils';

describe('RateLimiter - Basic Functionality', () => {
  it('should track and increment counters', async () => {
    const kv = createKVMock();
    const rateLimiter = new RateLimiter(kv);
    const app = new Hono<{ Bindings: Env }>();

    app.post('/test', rateLimiter.middleware.bind(rateLimiter), (c) => {
      return c.json({ success: true });
    });

    const env: Env = { RATE_LIMIT_KV: kv };

    // First request
    const response1 = await app.request(
      '/test',
      {
        method: 'POST',
        headers: { 'x-user-id': 'test-user' },
      },
      env,
    );

    expect(response1.status).toBe(200);
    expect(response1.headers.get('X-RateLimit-User-Limit')).toBe('20');
    expect(response1.headers.get('X-RateLimit-User-Remaining')).toBe('19');

    // Second request
    const response2 = await app.request(
      '/test',
      {
        method: 'POST',
        headers: { 'x-user-id': 'test-user' },
      },
      env,
    );

    expect(response2.status).toBe(200);
    expect(response2.headers.get('X-RateLimit-User-Remaining')).toBe('18');
  });

  it('should handle different users independently', async () => {
    const kv = createKVMock();
    const rateLimiter = new RateLimiter(kv);
    const app = new Hono<{ Bindings: Env }>();

    app.post('/test', rateLimiter.middleware.bind(rateLimiter), (c) => {
      return c.json({ success: true });
    });

    const env: Env = { RATE_LIMIT_KV: kv };

    // User 1
    const response1 = await app.request(
      '/test',
      {
        method: 'POST',
        headers: { 'x-user-id': 'user1' },
      },
      env,
    );

    expect(response1.headers.get('X-RateLimit-User-Remaining')).toBe('19');

    // User 2
    const response2 = await app.request(
      '/test',
      {
        method: 'POST',
        headers: { 'x-user-id': 'user2' },
      },
      env,
    );

    expect(response2.headers.get('X-RateLimit-User-Remaining')).toBe('19');

    // User 1 again
    const response3 = await app.request(
      '/test',
      {
        method: 'POST',
        headers: { 'x-user-id': 'user1' },
      },
      env,
    );

    expect(response3.headers.get('X-RateLimit-User-Remaining')).toBe('18');
  });

  it('should block after reaching limit sequentially', async () => {
    const kv = createKVMock();
    const rateLimiter = new RateLimiter(kv);
    const app = new Hono<{ Bindings: Env }>();

    app.post('/test', rateLimiter.middleware.bind(rateLimiter), (c) => {
      return c.json({ success: true });
    });

    const env: Env = { RATE_LIMIT_KV: kv };

    // Make 20 sequential requests
    for (let i = 0; i < 20; i++) {
      const response = await app.request(
        '/test',
        {
          method: 'POST',
          headers: { 'x-user-id': 'limited-user' },
        },
        env,
      );

      expect(response.status).toBe(200);
      expect(response.headers.get('X-RateLimit-User-Remaining')).toBe(
        String(19 - i),
      );
    }

    // 21st request should be blocked
    const blockedResponse = await app.request(
      '/test',
      {
        method: 'POST',
        headers: { 'x-user-id': 'limited-user' },
      },
      env,
    );

    expect(blockedResponse.status).toBe(429);
    const body = (await blockedResponse.json()) as {
      error: string;
      message: string;
      retryAfter: number;
    };
    expect(body.error).toBe('Too many requests');
    expect(body.message).toContain('User rate limit exceeded');
  });

  it('should use correct IP headers for Cloudflare', async () => {
    const kv = createKVMock();
    const rateLimiter = new RateLimiter(kv);
    const app = new Hono<{ Bindings: Env }>();

    app.post('/test', rateLimiter.middleware.bind(rateLimiter), (c) => {
      return c.json({ success: true });
    });

    const env: Env = { RATE_LIMIT_KV: kv };

    // Test cf-connecting-ip (Cloudflare's header)
    const response = await app.request(
      '/test',
      {
        method: 'POST',
        headers: { 'cf-connecting-ip': '192.168.1.1' },
      },
      env,
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('X-RateLimit-User-Remaining')).toBe('19');

    // Same IP should decrement
    const response2 = await app.request(
      '/test',
      {
        method: 'POST',
        headers: { 'cf-connecting-ip': '192.168.1.1' },
      },
      env,
    );

    expect(response2.headers.get('X-RateLimit-User-Remaining')).toBe('18');
  });
});
