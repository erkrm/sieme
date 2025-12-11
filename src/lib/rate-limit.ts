/**
 * Rate Limiter for SIEME
 * In-memory rate limiting with sliding window algorithm
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

interface RateLimitConfig {
  windowMs: number      // Time window in milliseconds
  maxRequests: number   // Max requests per window
}

// Default configurations for different endpoint types
export const RATE_LIMIT_CONFIGS = {
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 5 },      // 5 attempts per 15 minutes
  api: { windowMs: 60 * 1000, maxRequests: 100 },          // 100 requests per minute
  contact: { windowMs: 60 * 60 * 1000, maxRequests: 10 },  // 10 submissions per hour
  upload: { windowMs: 60 * 1000, maxRequests: 10 },        // 10 uploads per minute
} as const

// In-memory store - replace with Redis for production at scale
const rateLimitStore = new Map<string, RateLimitEntry>()

// Cleanup old entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000

let cleanupTimer: NodeJS.Timeout | null = null

function startCleanup() {
  if (!cleanupTimer) {
    cleanupTimer = setInterval(() => {
      const now = Date.now()
      for (const [key, entry] of rateLimitStore.entries()) {
        if (entry.resetAt <= now) {
          rateLimitStore.delete(key)
        }
      }
    }, CLEANUP_INTERVAL)
  }
}

/**
 * Get client identifier from request
 */
export function getClientId(request: Request): string {
  // Try to get real IP from various headers
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIp) {
    return realIp
  }
  
  // Fallback to a unique identifier from headers
  return request.headers.get('user-agent') || 'unknown'
}

/**
 * Check if a request should be rate limited
 */
export function checkRateLimit(
  identifier: string,
  endpoint: string,
  config: RateLimitConfig = RATE_LIMIT_CONFIGS.api
): { allowed: boolean; remaining: number; resetAt: number } {
  startCleanup()
  
  const key = `${endpoint}:${identifier}`
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  // If no entry or window expired, create new entry
  if (!entry || entry.resetAt <= now) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + config.windowMs
    }
    rateLimitStore.set(key, newEntry)
    
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: newEntry.resetAt
    }
  }

  // Increment count
  entry.count++
  
  const allowed = entry.count <= config.maxRequests
  const remaining = Math.max(0, config.maxRequests - entry.count)

  return {
    allowed,
    remaining,
    resetAt: entry.resetAt
  }
}

/**
 * Rate limit middleware helper
 * Returns headers to add to response
 */
export function getRateLimitHeaders(
  remaining: number,
  resetAt: number,
  limit: number
): Record<string, string> {
  return {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(resetAt / 1000).toString()
  }
}

/**
 * Create rate limited response
 */
export function createRateLimitResponse(resetAt: number): Response {
  const retryAfter = Math.ceil((resetAt - Date.now()) / 1000)
  
  return new Response(
    JSON.stringify({
      error: 'Demasiadas solicitudes. Por favor, intente de nuevo más tarde.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString()
      }
    }
  )
}

/**
 * Apply rate limiting to a request
 */
export function applyRateLimit(
  request: Request,
  endpoint: string,
  configType: keyof typeof RATE_LIMIT_CONFIGS = 'api'
): { allowed: boolean; response?: Response; headers: Record<string, string> } {
  const clientId = getClientId(request)
  const config = RATE_LIMIT_CONFIGS[configType]
  const { allowed, remaining, resetAt } = checkRateLimit(clientId, endpoint, config)
  const headers = getRateLimitHeaders(remaining, resetAt, config.maxRequests)

  if (!allowed) {
    return {
      allowed: false,
      response: createRateLimitResponse(resetAt),
      headers
    }
  }

  return { allowed: true, headers }
}
