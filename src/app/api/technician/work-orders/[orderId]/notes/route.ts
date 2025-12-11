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

    const { notes } = await request.json()
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

    // Update technician notes
    const updatedOrder = await db.workOrder.update({
      where: { id: orderId },
      data: { 
        notes,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating technician notes:', error)
    return NextResponse.json(
      { error: 'Error al actualizar las notas del técnico' },
      { status: 500 }
    )
  }
}