/**
 * Centralized Error Handler for SIEME
 * Provides structured error logging and responses
 */

type ErrorLevel = 'critical' | 'error' | 'warning' | 'info'

interface ErrorContext {
  userId?: string
  endpoint?: string
  action?: string
  metadata?: Record<string, unknown>
}

interface StructuredError {
  message: string
  code?: string
  level: ErrorLevel
  timestamp: string
  context?: ErrorContext
  stack?: string
}

const isDevelopment = process.env.NODE_ENV === 'development'

/**
 * Log an error with structured format
 */
export function logError(
  error: Error | string,
  level: ErrorLevel = 'error',
  context?: ErrorContext
): StructuredError {
  const structuredError: StructuredError = {
    message: error instanceof Error ? error.message : error,
    level,
    timestamp: new Date().toISOString(),
    context,
    stack: error instanceof Error && isDevelopment ? error.stack : undefined
  }

  // In development, log to console
  if (isDevelopment) {
    const logMethod = level === 'critical' || level === 'error' 
      ? console.error 
      : level === 'warning' 
        ? console.warn 
        : console.info

    logMethod(`[${level.toUpperCase()}] ${structuredError.message}`, {
      timestamp: structuredError.timestamp,
      context: structuredError.context,
      ...(structuredError.stack && { stack: structuredError.stack })
    })
  } else {
    // In production, only log errors and critical
    if (level === 'critical' || level === 'error') {
      console.error(JSON.stringify(structuredError))
    }
  }

  // Here you could integrate with external services like Sentry, LogRocket, etc.
  // Example: if (level === 'critical') { Sentry.captureException(error) }

  return structuredError
}

/**
 * Create a standardized API error response
 */
export function createErrorResponse(
  message: string,
  status: number = 500,
  code?: string
): { error: string; code?: string } {
  return {
    error: message,
    ...(code && { code })
  }
}

/**
 * Handle API errors consistently
 */
export function handleApiError(
  error: unknown,
  context?: ErrorContext
): { response: { error: string; code?: string }; status: number } {
  if (error instanceof Error) {
    logError(error, 'error', context)
    
    // Check for specific error types
    if (error.message.includes('Unique constraint')) {
      return {
        response: createErrorResponse('El registro ya existe', 409, 'DUPLICATE_ENTRY'),
        status: 409
      }
    }
    
    if (error.message.includes('not found') || error.message.includes('No encontrado')) {
      return {
        response: createErrorResponse('Recurso no encontrado', 404, 'NOT_FOUND'),
        status: 404
      }
    }

    if (error.message.includes('unauthorized') || error.message.includes('No autorizado')) {
      return {
        response: createErrorResponse('No autorizado', 401, 'UNAUTHORIZED'),
        status: 401
      }
    }
  }

  // Generic error
  logError(
    error instanceof Error ? error : new Error('Unknown error'),
    'error',
    context
  )

  return {
    response: createErrorResponse(
      isDevelopment && error instanceof Error 
        ? error.message 
        : 'Error interno del servidor',
      500,
      'INTERNAL_ERROR'
    ),
    status: 500
  }
}

/**
 * Wrapper for async API handlers with automatic error handling
 */
export function withErrorHandler<T>(
  handler: () => Promise<T>,
  context?: ErrorContext
): Promise<T> {
  return handler().catch((error) => {
    const { response, status } = handleApiError(error, context)
    throw { ...response, status }
  })
}
