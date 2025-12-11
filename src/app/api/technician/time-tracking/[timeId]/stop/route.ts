import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { timeId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || session.user.role !== 'TECHNICIAN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { timeId } = params

    // Get technician profile
    const technicianProfile = await db.technicianProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!technicianProfile) {
      return NextResponse.json({ error: 'Perfil de técnico no encontrado' }, { status: 404 })
    }

    // Find the time tracking entry
    const timeTracking = await db.timeTracking.findFirst({
      where: { 
        id: timeId,
        technicianId: technicianProfile.id
      }
    })

    if (!timeTracking) {
      return NextResponse.json({ error: 'Registro de tiempo no encontrado' }, { status: 404 })
    }

    if (timeTracking.endTime) {
      return NextResponse.json({ error: 'El tiempo ya ha sido detenido' }, { status: 400 })
    }

    // Calculate hours
    const endTime = new Date()
    const startTime = new Date(timeTracking.startTime)
    const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)

    // Update time tracking
    const updatedTimeTracking = await db.timeTracking.update({
      where: { id: timeId },
      data: {
        endTime,
        hours: Math.round(hours * 100) / 100 // Round to 2 decimal places
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error stopping time tracking:', error)
    return NextResponse.json(
      { error: 'Error al detener el seguimiento de tiempo' },
      { status: 500 }
    )
  }
}