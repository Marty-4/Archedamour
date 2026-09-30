/**
 * Arche d'Amour - Rate Limiting Utilities
 * 
 * Uses Upstash Redis for distributed rate limiting
 * Fallback to in-memory store for development
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Configuration
const RATE_LIMIT_WINDOW = '10 m'; // 10 minutes
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per window

// Alternative: Simple in-memory rate limiter for development without Redis
const simpleRateLimiter = {
  store: new Map<string, { count: number; resetAt: number }>(),
  
  async limit(ip: string): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
    const now = Date.now();
    const windowMs = 10 * 60 * 1000; // 10 minutes in ms
    
    const key = `ratelimit:${ip}`;
    const record = this.store.get(key);
    
    if (!record || now > record.resetAt) {
      this.store.set(key, { count: 1, resetAt: now + windowMs });
      return { success: true, limit: RATE_LIMIT_MAX_REQUESTS, remaining: RATE_LIMIT_MAX_REQUESTS - 1, reset: Math.floor((now + windowMs) / 1000) };
    }
    
    if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
      return { success: false, limit: RATE_LIMIT_MAX_REQUESTS, remaining: 0, reset: Math.floor(record.resetAt / 1000) };
    }
    
    record.count++;
    return { success: true, limit: RATE_LIMIT_MAX_REQUESTS, remaining: RATE_LIMIT_MAX_REQUESTS - record.count, reset: Math.floor(record.resetAt / 1000) };
  },
};

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Create rate limiter
// In production: uses Upstash Redis
// In development: falls back to in-memory (less accurate but works)
export const rateLimiter = process.env.NODE_ENV === 'production' && 
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW),
    })
  : simpleRateLimiter;

// Use the appropriate limiter based on environment
export const limiter = process.env.NODE_ENV === 'production' 
  ? rateLimiter
  : simpleRateLimiter;

// Export simpleRateLimiter for use in rateLimiter
export { simpleRateLimiter };
