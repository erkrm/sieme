import { db } from '@/lib/db'

type NotificationChannel = 'in_app' | 'email' | 'sms' | 'push'

interface NotificationPayload {
  userId: string
  title: string
  body: string
  type: string
  referenceType?: string
  referenceId?: string
  channels?: NotificationChannel[]
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  data?: Record<string, any>
}

export class NotificationService {
  /**
   * Send notification through specified channels
   */
  async send(payload: NotificationPayload): Promise<string> {
    const channels = payload.channels || ['in_app']
    
    // Create in-app notification (always created for tracking)
    const notification = await db.notification.create({
      data: {
        userId: payload.userId,
        title: payload.title,
        message: payload.body,
        type: 'SYSTEM_ALERT',
        relatedId: payload.referenceId,
        read: false
      }
    })

    // Send through other channels
    const promises: Promise<void>[] = []

    if (channels.includes('email')) {
      promises.push(this.sendEmail(payload))
    }

    if (channels.includes('sms')) {
      promises.push(this.sendSMS(payload))
    }

    if (channels.includes('push')) {
      promises.push(this.sendPush(payload))
    }

    // Execute all channel sends in parallel
    await Promise.allSettled(promises)

    return notification.id
  }

  /**
   * Send bulk notifications to multiple users
   */
  async sendBulk(userIds: string[], payload: Omit<NotificationPayload, 'userId'>): Promise<void> {
    const promises = userIds.map(userId => 
      this.send({ ...payload, userId })
    )
    await Promise.allSettled(promises)
  }

  /**
   * Send email notification
   */
  private async sendEmail(payload: NotificationPayload): Promise<void> {
    try {
      const user = await db.user.findUnique({
        where: { id: payload.userId },
        select: { email: true, name: true }
      })

      if (!user?.email) {
        console.warn(`User ${payload.userId} has no email`)
        return
      }

      // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
      console.log(`[EMAIL] To: ${user.email}`)
      console.log(`[EMAIL] Subject: ${payload.title}`)
      console.log(`[EMAIL] Body: ${payload.body}`)

      // Placeholder for actual email sending
      // await emailService.send({
      //   to: user.email,
      //   subject: payload.title,
      //   html: this.generateEmailTemplate(payload)
      // })
    } catch (error) {
      console.error('Error sending email:', error)
    }
  }

  /**
   * Send SMS notification
   */
  private async sendSMS(payload: NotificationPayload): Promise<void> {
    try {
      const user = await db.user.findUnique({
        where: { id: payload.userId },
        select: { phone: true }
      })

      if (!user?.phone) {
        console.warn(`User ${payload.userId} has no phone`)
        return
      }

      // TODO: Integrate with Twilio or similar
      console.log(`[SMS] To: ${user.phone}`)
      console.log(`[SMS] Message: ${payload.body}`)

      // Placeholder for actual SMS sending
      // await twilioClient.messages.create({
      //   to: user.phone,
      //   from: process.env.TWILIO_PHONE_NUMBER,
      //   body: payload.body
      // })
    } catch (error) {
      console.error('Error sending SMS:', error)
    }
  }

  /**
   * Send push notification
   */
  private async sendPush(payload: NotificationPayload): Promise<void> {
    try {
      // TODO: Integrate with Firebase Cloud Messaging
      console.log(`[PUSH] To: ${payload.userId}`)
      console.log(`[PUSH] Title: ${payload.title}`)
      console.log(`[PUSH] Body: ${payload.body}`)

      // Placeholder for actual push notification
      // await fcm.send({
      //   token: userDeviceToken,
      //   notification: {
      //     title: payload.title,
      //     body: payload.body
      //   },
      //   data: payload.data
      // })
    } catch (error) {
      console.error('Error sending push notification:', error)
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    await db.notification.update({
      where: { id: notificationId },
      data: { 
        read: true
      }
    })
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<void> {
    await db.notification.updateMany({
      where: { 
        userId,
        read: false
      },
      data: { 
        read: true
      }
    })
  }

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    return await db.notification.count({
      where: {
        userId,
        read: false
      }
    })
  }

  /**
   * Delete old notifications (cleanup job)
   */
  async deleteOldNotifications(daysOld: number = 90): Promise<number> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    const result = await db.notification.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        },
        read: true
      }
    })

    return result.count
  }

  /**
   * Generate email template
   */
  private generateEmailTemplate(payload: NotificationPayload): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
            .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>TechOps 4.0</h1>
            </div>
            <div class="content">
              <h2>${payload.title}</h2>
              <p>${payload.body}</p>
            </div>
            <div class="footer">
              <p>Este es un mensaje automático de TechOps 4.0</p>
            </div>
          </div>
        </body>
      </html>
    `
  }
}

export const notificationService = new NotificationService()
