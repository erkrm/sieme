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

    const { orderId } = params

    const result = await db.$transaction(async (tx) => {
      const currentOrder = await tx.workOrder.findUnique({
        where: { id: orderId }
      })

      if (!currentOrder) {
        throw new Error('Orden no encontrada')
      }

      // Update Order - remove technician assignment
      const updatedOrder = await tx.workOrder.update({
        where: { id: orderId },
        data: {
          technicianId: null,
          status: 'REQUESTED',
          assignedAt: null,
          updatedAt: new Date()
        },
        include: {
          client: { select: { id: true, name: true } }
        }
      })

      // Create Log
      await tx.workOrderLog.create({
        data: {
          workOrderId: orderId,
          previousStatus: currentOrder.status,
          newStatus: 'REQUESTED',
          notes: `Técnico desasignado por ${session.user.name}`
        }
      })

      return updatedOrder
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error unassigning work order:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al desasignar la orden' },
      { status: 500 }
    )
  }
}
