import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Get all technicians with their work orders
    const technicians = await db.user.findMany({
      where: { 
        role: 'TECHNICIAN',
        isActive: true
      },
      select: {
        id: true,
        name: true,
        isActive: true,
        technicianProfile: {
          select: {
            isAvailable: true
          }
        }
      }
    })

    // Get work orders grouped by technician
    const workOrders = await db.workOrder.findMany({
      where: {
        technicianId: { not: null }
      },
      select: {
        id: true,
        technicianId: true,
        status: true,
        createdAt: true,
        completedAt: true
      }
    })

    // Calculate performance for each technician
    const technicianPerformance = technicians.map(tech => {
      const techOrders = workOrders.filter(o => o.technicianId === tech.id)
      const completed = techOrders.filter(o => 
        o.status === 'COMPLETED' || o.status === 'INVOICED' || o.status === 'CLOSED'
      )
      
      // Calculate average resolution time (in hours)
      const completedWithDates = completed.filter(o => o.completedAt && o.createdAt)
      const avgResolutionTime = completedWithDates.length > 0
        ? completedWithDates.reduce((acc, o) => {
            const diff = new Date(o.completedAt!).getTime() - new Date(o.createdAt).getTime()
            return acc + (diff / (1000 * 60 * 60))
          }, 0) / completedWithDates.length
        : 0

      // Default rating placeholder (could be calculated from a separate feedback table)
      const avgRating = completed.length > 0 ? 4.5 : 0

      return {
        name: tech.name,
        ordersCompleted: completed.length,
        ordersAssigned: techOrders.length,
        avgRating: avgRating,
        avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
        isAvailable: tech.technicianProfile?.isAvailable ?? true
      }
    })

    // Sort by orders completed
    technicianPerformance.sort((a, b) => b.ordersCompleted - a.ordersCompleted)

    const totalTechnicians = technicians.length
    const activeTechnicians = technicians.filter(t => t.technicianProfile?.isAvailable).length

    return NextResponse.json({
      totalTechnicians,
      activeTechnicians,
      technicianPerformance
    })
  } catch (error) {
    console.error('Error fetching technicians report:', error)
    return NextResponse.json(
      { error: 'Error al obtener el reporte de técnicos' },
      { status: 500 }
    )
  }
}

