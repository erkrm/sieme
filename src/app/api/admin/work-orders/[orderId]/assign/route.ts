import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { technicianId } = await request.json()
    const { orderId } = params

    console.log('Assigning order:', { orderId, technicianId })

    if (!technicianId) {
      return NextResponse.json({ error: 'ID de técnico requerido' }, { status: 400 })
    }

    // Use transaction for data integrity
    const result = await db.$transaction(async (tx) => {
      // 1. Fetch current order to get previous status
      const currentOrder = await tx.workOrder.findUnique({
        where: { id: orderId }
      })

      if (!currentOrder) {
        throw new Error('Orden no encontrada')
      }

      // 2. Update Order
      const updatedOrder = await tx.workOrder.update({
        where: { id: orderId },
        data: {
          technicianId,
          status: 'SCHEDULED',
          assignedAt: new Date(),
          updatedAt: new Date()
        },
        include: {
          technician: true
        }
      })

      // 3. Create Notification
      await tx.notification.create({
        data: {
          userId: technicianId,
          title: 'Nueva Orden Asignada',
          message: `Se te ha asignado la orden #${updatedOrder.orderNumber}: ${updatedOrder.title}`,
          type: 'NEW_ORDER',
          relatedId: updatedOrder.id
        }
      })
      
      // 4. Create Log
      await tx.workOrderLog.create({
        data: {
          workOrderId: orderId,
          previousStatus: currentOrder.status,
          newStatus: 'SCHEDULED'
        }
      })

      return updatedOrder
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error assigning work order:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al asignar la orden' },
      { status: 500 }
    )
  }
}
