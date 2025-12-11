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
    
    if (!session?.user?.role || session.user.role !== 'TECHNICIAN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { status } = await request.json()
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

    // Use transaction
    await db.$transaction(async (tx) => {
        // Update the status
        await tx.workOrder.update({
            where: { id: orderId },
            data: { 
                status,
                updatedAt: new Date(),
                // Set completion timestamp if completed
                ...(status === 'COMPLETED' && { completedAt: new Date() })
            }
        })

        // Create log entry
        await tx.workOrderLog.create({
            data: {
                workOrderId: orderId,
                previousStatus: workOrder.status,
                newStatus: status
                // gpsLat, gpsLng would go here if we had them from the request
            }
        })
    })

    // Create notification for client (simplified - just log for now)
    console.log(`Notification: Order ${workOrder.orderNumber} status updated to ${status}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating work order status:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el estado de la orden' },
      { status: 500 }
    )
  }
}
