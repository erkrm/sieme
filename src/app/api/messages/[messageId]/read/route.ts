import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { messageId } = params

    // Mark message as read
    const updatedMessage = await db.message.update({
      where: { 
        id: messageId,
        // Only allow user to mark their own messages as read or messages sent to them
        OR: [
          { senderId: session.user.id },
          {
            workOrder: {
              OR: [
                { clientId: session.user.id },
                { technicianId: session.user.id }
              ]
            }
          }
        ]
      },
      data: { read: true }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking message as read:', error)
    return NextResponse.json(
      { error: 'Error al marcar mensaje como leído' },
      { status: 500 }
    )
  }
}