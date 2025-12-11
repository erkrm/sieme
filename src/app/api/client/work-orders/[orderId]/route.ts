import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'CLIENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const order = await db.workOrder.findFirst({
      where: {
        id: params.orderId,
        clientId: session.user.id
      },
      include: {
        technician: { select: { id: true, name: true, phone: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 10 },
        quotations: true
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'CLIENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { action } = await req.json()

    // Check if order belongs to this client
    const order = await db.workOrder.findFirst({
      where: {
        id: params.orderId,
        clientId: session.user.id
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (action === 'cancel') {
      // Only allow cancellation of pending orders
      if (!['REQUESTED', 'PENDING'].includes(order.status)) {
        return NextResponse.json(
          { error: 'Cannot cancel order in current status' },
          { status: 400 }
        )
      }

      const updatedOrder = await db.workOrder.update({
        where: { id: params.orderId },
        data: {
          status: 'CANCELLED',
          notes: order.notes 
            ? `${order.notes}\n[Cancelado por cliente: ${new Date().toISOString()}]`
            : `[Cancelado por cliente: ${new Date().toISOString()}]`
        }
      })

      // Create log entry
      await db.workOrderLog.create({
        data: {
          workOrderId: params.orderId,
          previousStatus: order.status,
          newStatus: 'CANCELLED',
          notes: 'Cancelado por el cliente'
        }
      })

      return NextResponse.json(updatedOrder)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: error.message || 'Failed to update order' }, { status: 500 })
  }
}
