const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 100,
  windowMs: 60000, // 1 minute
}

export function rateLimit(
  identifier: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): { success: boolean; resetTime?: number; remaining?: number } {
  const now = Date.now()
  const { maxRequests, windowMs } = config

  let record = rateLimitMap.get(identifier)

  if (!record || now > record.resetTime) {
    record = { count: 0, resetTime: now + windowMs }
    rateLimitMap.set(identifier, record)
  }

  if (record.count >= maxRequests) {
    return {
      success: false,
      resetTime: record.resetTime,
      remaining: 0,
    }
  }

  record.count++
  return {
    success: true,
    resetTime: record.resetTime,
    remaining: maxRequests - record.count,
  }
}

export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'

  const authHeader = request.headers.get('authorization')
  const userId = authHeader?.substring(7).slice(0, 32) || ''

  return `${ip}:${userId}`
}

export function createRateLimitResponse(resetTime: number) {
  return new Response(
    JSON.stringify({ error: 'Too many requests. Please try again later.' }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': new Date(resetTime).toISOString(),
      },
    }
  )
}

export function applyRateLimitHeaders(
  response: Response,
  remaining: number,
  resetTime: number
) {
  response.headers.set('X-RateLimit-Limit', '100')
  response.headers.set('X-RateLimit-Remaining', String(remaining))
  response.headers.set('X-RateLimit-Reset', new Date(resetTime).toISOString())
  return response
}

setInterval(() => {
  const now = Date.now()
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}, 60000)
