/**
 * Zod Validation Schemas for SIEME
 * Centralized input validation for all API endpoints
 */

import { z } from 'zod'

// ============ Common Schemas ============

export const emailSchema = z.string().email('Email inválido')

export const phoneSchema = z.string()
  .regex(/^[0-9+\-\s()]{8,20}$/, 'Número de teléfono inválido')
  .optional()

export const passwordSchema = z.string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
  .regex(/[a-z]/, 'Debe contener al menos una minúscula')
  .regex(/[0-9]/, 'Debe contener al menos un número')

export const idSchema = z.string().cuid('ID inválido')

// ============ Auth Schemas ============

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Contraseña requerida')
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  email: emailSchema,
  password: passwordSchema,
  phone: phoneSchema,
  role: z.enum(['CLIENT', 'TECHNICIAN']).default('CLIENT'),
  companyName: z.string().optional(),
  ruc: z.string().optional()
})

// ============ User Schemas ============

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: emailSchema.optional(),
  phone: phoneSchema,
  avatar: z.string().url().optional(),
  isActive: z.boolean().optional()
})

// ============ Work Order Schemas ============

export const createWorkOrderSchema = z.object({
  clientId: idSchema,
  title: z.string().min(5, 'Título debe tener al menos 5 caracteres'),
  description: z.string().min(10, 'Descripción debe tener al menos 10 caracteres'),
  category: z.string().min(1, 'Categoría requerida'),
  priority: z.enum(['NORMAL', 'URGENT', 'EMERGENCY']).default('NORMAL'),
  serviceAddress: z.string().min(5, 'Dirección requerida'),
  contactPerson: z.string().optional(),
  contactPhone: phoneSchema,
  scheduledDate: z.string().datetime().optional(),
  technicianId: idSchema.optional()
})

export const updateWorkOrderSchema = z.object({
  title: z.string().min(5).optional(),
  description: z.string().min(10).optional(),
  status: z.enum([
    'REQUESTED', 'SCHEDULED', 'IN_PROGRESS', 
    'PENDING', 'COMPLETED', 'INVOICED', 'CLOSED', 'CANCELLED'
  ]).optional(),
  priority: z.enum(['NORMAL', 'URGENT', 'EMERGENCY']).optional(),
  technicianId: idSchema.optional().nullable(),
  scheduledDate: z.string().datetime().optional(),
  notes: z.string().optional()
})

// ============ Contact Form Schema ============

export const contactFormSchema = z.object({
  firstName: z.string().min(2, 'Nombre requerido'),
  lastName: z.string().min(2, 'Apellido requerido'),
  email: emailSchema,
  phone: phoneSchema,
  company: z.string().optional(),
  message: z.string().min(10, 'Mensaje debe tener al menos 10 caracteres'),
  source: z.string().optional()
})

// ============ Quotation Schemas ============

export const createQuotationSchema = z.object({
  workOrderId: idSchema,
  description: z.string().min(10),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number().positive(),
    unitPrice: z.number().nonnegative(),
    type: z.enum(['LABOR', 'MATERIAL', 'OTHER'])
  })).min(1, 'Debe tener al menos un item'),
  validUntil: z.string().datetime(),
  notes: z.string().optional()
})

// ============ Contract Schemas ============

export const createContractSchema = z.object({
  clientProfileId: idSchema,
  type: z.enum(['ON_DEMAND', 'FRAMEWORK', 'PREVENTIVE', 'DEDICATED']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  monthlyFee: z.number().nonnegative().optional(),
  slaResponseHours: z.number().positive().optional(),
  terms: z.string().optional()
})

// ============ Invoice Schemas ============

export const createInvoiceSchema = z.object({
  workOrderId: idSchema.optional(),
  clientId: idSchema,
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number().positive(),
    unitPrice: z.number().nonnegative()
  })).min(1),
  dueDate: z.string().datetime(),
  notes: z.string().optional()
})

// ============ Validation Helper ============

export type ValidationResult<T> = 
  | { success: true; data: T }
  | { success: false; errors: z.ZodError }

/**
 * Validate data against a schema and return typed result
 */
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data)
  
  if (result.success) {
    return { success: true, data: result.data }
  }
  
  return { success: false, errors: result.error }
}

/**
 * Format Zod errors for API response
 */
export function formatZodErrors(error: z.ZodError): Record<string, string[]> {
  const errors: Record<string, string[]> = {}
  
  for (const issue of error.issues) {
    const path = issue.path.join('.')
    if (!errors[path]) {
      errors[path] = []
    }
    errors[path].push(issue.message)
  }
  
  return errors
}

/**
 * Create validation error response
 */
export function createValidationErrorResponse(error: z.ZodError): Response {
  return new Response(
    JSON.stringify({
      error: 'Datos de entrada inválidos',
      code: 'VALIDATION_ERROR',
      details: formatZodErrors(error)
    }),
    { status: 400, headers: { 'Content-Type': 'application/json' } }
  )
}
