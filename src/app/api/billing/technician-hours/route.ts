import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/billing/technician-hours - Get hours by technician
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const technicianId = searchParams.get('technicianId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const whereClause: any = {
      endTime: {
        not: null
      }
    }

    if (technicianId) {
      whereClause.technicianId = technicianId
    }

    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    const timeEntries = await db.timeTracking.findMany({
      where: whereClause,
      include: {
        technician: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        workOrder: {
          select: {
            id: true,
            orderNumber: true,
            title: true,
            client: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        startTime: 'desc'
      }
    })

    // Group by technician
    const groupedByTechnician = timeEntries.reduce((acc, entry) => {
      const techId = entry.technicianId
      if (!acc[techId]) {
        acc[techId] = {
          technician: entry.technician,
          totalHours: 0,
          entries: []
        }
      }
      acc[techId].totalHours += entry.hours || 0
      acc[techId].entries.push({
        id: entry.id,
        workOrder: entry.workOrder,
        hours: entry.hours,
        startTime: entry.startTime,
        endTime: entry.endTime,
        description: entry.description
      })
      return acc
    }, {} as Record<string, any>)

    return NextResponse.json(Object.values(groupedByTechnician))
  } catch (error) {
    console.error('Error fetching technician hours:', error)
    return NextResponse.json(
      { error: 'Error al obtener las horas de técnicos' },
      { status: 500 }
    )
  }
}
