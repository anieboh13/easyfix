import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// 20 requests per 5 minutes per IP — generous enough for a real customer
// browsing and clicking "Order" on a few different products, but blocks
// a spam script from flooding the OrderIntent table.
export const orderIntentRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '5 m'),
  analytics: true,
  prefix: 'ratelimit:order-intent',
})

// The App Router's NextRequest doesn't expose a plain .ip property —
// Vercel sets the real client IP in this header instead.
export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  return req.headers.get('x-real-ip') ?? '127.0.0.1'
}