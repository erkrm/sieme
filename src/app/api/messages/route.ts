import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const workOrderId = searchParams.get('workOrderId')

    if (!workOrderId) {
      return NextResponse.json({ error: 'workOrderId es requerido' }, { status: 400 })
    }

    // Get messages for the work order
    const messages = await db.message.findMany({
      where: { workOrderId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    // Format messages
    const formattedMessages = messages.map(message => ({
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      senderName: message.sender?.name || 'Sistema',
      senderRole: message.sender?.role,
      type: message.type,
      isRead: message.read,
      createdAt: message.createdAt.toISOString()
    }))

    return NextResponse.json(formattedMessages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Error al obtener los mensajes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { workOrderId, content, type = 'text' } = await request.json()

    if (!workOrderId || !content) {
      return NextResponse.json({ error: 'workOrderId y content son requeridos' }, { status: 400 })
    }

    // Verify user has access to this work order
    const workOrder = await db.workOrder.findFirst({
      where: {
        id: workOrderId,
        OR: [
          { clientId: session.user.id },
          { technicianId: session.user.id }
        ]
      }
    })

    if (!workOrder) {
      return NextResponse.json({ error: 'No tienes acceso a esta orden de trabajo' }, { status: 403 })
    }

    // Create message
    const message = await db.message.create({
      data: {
        workOrderId,
        senderId: session.user.id,
        content,
        type
      }
    })

    // Create notification for the other party
    const recipientId = session.user.id === workOrder.clientId ? workOrder.technicianId : workOrder.clientId
    if (recipientId) {
      await db.notification.create({
        data: {
          userId: recipientId,
          title: 'Nuevo Mensaje',
          message: `Tienes un nuevo mensaje en la orden ${workOrder.orderNumber}`,
          type: 'MESSAGE',
          read: false
        }
      })
    }

    return NextResponse.json({ success: true, message })
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json(
      { error: 'Error al crear el mensaje' },
      { status: 500 }
    )
  }
}