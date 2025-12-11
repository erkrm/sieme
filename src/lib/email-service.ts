/**
 * Email Service for SIEME
 * Abstraction layer for sending transactional emails
 * 
 * Supports multiple providers:
 * - Resend - for cloud email service (recommended)
 * - Console (development) - logs emails instead of sending
 * 
 * Note: To use SMTP/Nodemailer, install: npm install nodemailer @types/nodemailer
 */

// Email configuration types
interface EmailConfig {
  provider: 'resend' | 'console'
  from: string
  resendApiKey?: string
}

interface EmailOptions {
  to: string | string[]
  subject: string
  text?: string
  html?: string
  replyTo?: string
}

interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

// Default configuration - uses console in development
const defaultConfig: EmailConfig = {
  provider: process.env.RESEND_API_KEY ? 'resend' : 'console',
  from: process.env.EMAIL_FROM || 'SIEME <noreply@sieme.com>',
  resendApiKey: process.env.RESEND_API_KEY,
}

/**
 * Send email using configured provider
 */
export async function sendEmail(
  options: EmailOptions,
  config: EmailConfig = defaultConfig
): Promise<EmailResult> {
  try {
    switch (config.provider) {
      case 'console':
        // Development: log email to console
        console.log('📧 [Email - Development Mode]')
        console.log('To:', options.to)
        console.log('Subject:', options.subject)
        console.log('Preview:', options.text?.substring(0, 100) || options.html?.substring(0, 100))
        return { success: true, messageId: `dev-${Date.now()}` }

      case 'resend':
        if (!config.resendApiKey) {
          console.warn('Resend API key not configured, falling back to console')
          return sendEmail(options, { ...config, provider: 'console' })
        }
        
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: config.from,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
            reply_to: options.replyTo,
          }),
        })

        if (!resendResponse.ok) {
          const error = await resendResponse.json()
          throw new Error(error.message || 'Resend API error')
        }

        const resendData = await resendResponse.json()
        return { success: true, messageId: resendData.id }

      default:
        throw new Error(`Unknown email provider: ${config.provider}`)
    }
  } catch (error) {
    console.error('Email send error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// ============ Email Templates ============

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(
  email: string,
  name: string,
  role: string
): Promise<EmailResult> {
  const roleText: Record<string, string> = {
    CLIENT: 'cliente',
    TECHNICIAN: 'técnico',
    MANAGER: 'gerente',
    ADMIN: 'administrador',
  }

  return sendEmail({
    to: email,
    subject: '¡Bienvenido a SIEME!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">¡Bienvenido a SIEME!</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p style="font-size: 16px;">Hola <strong>${name}</strong>,</p>
          <p>Tu cuenta de ${roleText[role] || 'usuario'} ha sido creada exitosamente.</p>
          <p>Ahora puedes acceder a la plataforma y comenzar a gestionar tus servicios técnicos.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${APP_URL}/auth/signin" 
               style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px;">
              Iniciar Sesión
            </a>
          </div>
        </div>
        <div style="background: #1f2937; padding: 20px; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">© 2025 SIEME</p>
        </div>
      </div>
    `,
    text: `¡Bienvenido a SIEME!\n\nHola ${name}, tu cuenta ha sido creada.\n\nAccede en: ${APP_URL}/auth/signin`,
  })
}

/**
 * Send work order notification
 */
export async function sendWorkOrderNotification(
  email: string,
  name: string,
  orderNumber: string,
  status: string,
  action: 'created' | 'assigned' | 'updated' | 'completed'
): Promise<EmailResult> {
  const subjects: Record<string, string> = {
    created: `Nueva orden de trabajo #${orderNumber}`,
    assigned: `Orden #${orderNumber} asignada`,
    updated: `Actualización en orden #${orderNumber}`,
    completed: `Orden #${orderNumber} completada`,
  }

  return sendEmail({
    to: email,
    subject: subjects[action],
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #3b82f6; padding: 20px; text-align: center;">
          <h2 style="color: white; margin: 0;">Orden #${orderNumber}</h2>
        </div>
        <div style="padding: 20px; background: #f9fafb;">
          <p>Hola ${name},</p>
          <p>${subjects[action]}</p>
          <p><strong>Estado:</strong> ${status}</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${APP_URL}/client/work-orders" 
               style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
              Ver Detalles
            </a>
          </div>
        </div>
      </div>
    `,
  })
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetToken: string
): Promise<EmailResult> {
  const resetUrl = `${APP_URL}/auth/reset-password?token=${resetToken}`

  return sendEmail({
    to: email,
    subject: 'Restablecer contraseña - SIEME',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #3b82f6; padding: 20px; text-align: center;">
          <h2 style="color: white; margin: 0;">Restablecer Contraseña</h2>
        </div>
        <div style="padding: 20px; background: #f9fafb;">
          <p>Hola ${name},</p>
          <p>Recibimos una solicitud para restablecer tu contraseña.</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${resetUrl}" 
               style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              Restablecer Contraseña
            </a>
          </div>
          <p style="color: #666; font-size: 12px;">El enlace expira en 1 hora.</p>
        </div>
      </div>
    `,
  })
}

/**
 * Send contact form notification to admin
 */
export async function sendContactNotification(
  contactData: {
    firstName: string
    lastName: string
    email: string
    phone?: string
    message: string
    company?: string
  }
): Promise<EmailResult> {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@sieme.com'

  return sendEmail({
    to: adminEmail,
    subject: `Nuevo contacto: ${contactData.firstName} ${contactData.lastName}`,
    replyTo: contactData.email,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #10b981; padding: 20px; text-align: center;">
          <h2 style="color: white; margin: 0;">Nuevo Mensaje de Contacto</h2>
        </div>
        <div style="padding: 20px; background: #f9fafb;">
          <p><strong>Nombre:</strong> ${contactData.firstName} ${contactData.lastName}</p>
          <p><strong>Email:</strong> <a href="mailto:${contactData.email}">${contactData.email}</a></p>
          ${contactData.phone ? `<p><strong>Teléfono:</strong> ${contactData.phone}</p>` : ''}
          ${contactData.company ? `<p><strong>Empresa:</strong> ${contactData.company}</p>` : ''}
          <div style="margin-top: 20px; padding: 15px; background: white; border-left: 4px solid #10b981;">
            <p style="margin: 0; white-space: pre-wrap;">${contactData.message}</p>
          </div>
        </div>
      </div>
    `,
  })
}
