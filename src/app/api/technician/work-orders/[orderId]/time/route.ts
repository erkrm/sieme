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

    const { description } = await request.json()
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

    // Check for active timer
    const activeTimer = await db.timeTracking.findFirst({
      where: {
        workOrderId: orderId,
        technicianId: session.user.id,
        endTime: null
      }
    })

    if (activeTimer) {
      // Stop timer
      const endTime = new Date()
      const durationMs = endTime.getTime() - activeTimer.startTime.getTime()
      const hours = durationMs / (1000 * 60 * 60)

      await db.timeTracking.update({
        where: { id: activeTimer.id },
        data: {
          endTime,
          hours,
          description: description || activeTimer.description
        }
      })

      return NextResponse.json({ success: true, status: 'stopped', id: activeTimer.id })
    } else {
      // Start timer
      const newTimer = await db.timeTracking.create({
        data: {
          workOrderId: orderId,
          technicianId: session.user.id,
          startTime: new Date(),
          description
        }
      })

      return NextResponse.json({ success: true, status: 'started', id: newTimer.id })
    }
  } catch (error) {
    console.error('Error managing time tracking:', error)
    return NextResponse.json(
      { error: 'Error al gestionar el tiempo' },
      { status: 500 }
    )
  }
}