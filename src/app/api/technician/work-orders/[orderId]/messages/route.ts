import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || session.user.role !== 'TECHNICIAN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { content } = await request.json()
    const { orderId } = params

    // Verify the work order is assigned to this technician
    const workOrder = await db.workOrder.findFirst({
      where: { 
        id: orderId,
        technicianId: session.user.id
      }
    })

    if (!workOrder) {
      return NextResponse.json({ error: 'Orden de trabajo no encontrada' }, { status: 404 })
    }

    // Create message
    const message = await db.message.create({
      data: {
        workOrderId: orderId,
        senderId: session.user.id,
        content,
        type: 'TEXT'
      }
    })

    return NextResponse.json({ success: true, message })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Error al enviar mensaje' },
      { status: 500 }
    )
  }
}