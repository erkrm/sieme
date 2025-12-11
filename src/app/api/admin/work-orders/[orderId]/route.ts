import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const order = await db.workOrder.findUnique({
      where: { id: params.orderId },
      include: {
        client: { select: { id: true, name: true, email: true, phone: true } },
        technician: { select: { id: true, name: true, email: true, phone: true } },
        logs: { orderBy: { createdAt: 'desc' } },
        quotations: true,
        materials: true
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

export async function PUT(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    
    const order = await db.workOrder.findUnique({
      where: { id: params.orderId }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Create log entry if status changed
    if (body.status && body.status !== order.status) {
      await db.workOrderLog.create({
        data: {
          workOrderId: params.orderId,
          previousStatus: order.status,
          newStatus: body.status,
          notes: body.statusNote || `Status changed by ${session.user.name}`
        }
      })
    }

    const updatedOrder = await db.workOrder.update({
      where: { id: params.orderId },
      data: {
        title: body.title,
        description: body.description,
        category: body.category,
        priority: body.priority,
        status: body.status,
        serviceAddress: body.serviceAddress,
        contactPerson: body.contactPerson,
        contactPhone: body.contactPhone,
        scheduledDate: body.scheduledDate ? new Date(body.scheduledDate) : null,
        technicianId: body.technicianId || null,
        notes: body.notes
      },
      include: {
        client: { select: { id: true, name: true } },
        technician: { select: { id: true, name: true } }
      }
    })

    return NextResponse.json(updatedOrder)
  } catch (error: any) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: error.message || 'Failed to update order' }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await db.$transaction(async (tx) => {
      await tx.workOrderLog.deleteMany({ where: { workOrderId: params.orderId } })
      await tx.orderMaterial.deleteMany({ where: { workOrderId: params.orderId } })
      await tx.quotation.deleteMany({ where: { workOrderId: params.orderId } })
      await tx.workOrder.delete({ where: { id: params.orderId } })
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting order:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete order' }, { status: 500 })
  }
}
