import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/billing/monthly-summary - Get monthly billing data
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') // Format: YYYY-MM
    const clientId = searchParams.get('clientId')

    if (!month) {
      return NextResponse.json(
        { error: 'El parámetro month es requerido (formato: YYYY-MM)' },
        { status: 400 }
      )
    }

    // Parse month
    const [year, monthNum] = month.split('-').map(Number)
    const startDate = new Date(year, monthNum - 1, 1)
    const endDate = new Date(year, monthNum, 0, 23, 59, 59)

    // Build where clause
    const whereClause: any = {
      createdAt: {
        gte: startDate,
        lte: endDate
      },
      endTime: {
        not: null // Only completed time entries
      }
    }

    // If client is specified, filter by their work orders
    if (clientId) {
      whereClause.workOrder = {
        clientId
      }
    }

    // Get all time tracking entries for the month
    const timeEntries = await db.timeTracking.findMany({
      where: whereClause,
      include: {
        technician: {
          select: {
            id: true,
            name: true,
            email: true,
            technicianProfile: {
              select: {
                specialties: true
              }
            }
          }
        },
        workOrder: {
          select: {
            id: true,
            orderNumber: true,
            title: true,
            clientId: true,
            client: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        startTime: 'desc'
      }
    })

    // Calculate totals by technician
    const technicianSummary = timeEntries.reduce((acc, entry) => {
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
        workOrderNumber: entry.workOrder.orderNumber,
        workOrderTitle: entry.workOrder.title,
        hours: entry.hours,
        startTime: entry.startTime,
        endTime: entry.endTime,
        description: entry.description
      })
      return acc
    }, {} as Record<string, any>)

    // Calculate totals by client
    const clientSummary = timeEntries.reduce((acc, entry) => {
      const clientId = entry.workOrder.clientId
      if (!acc[clientId]) {
        acc[clientId] = {
          client: entry.workOrder.client,
          totalHours: 0,
          totalAmount: 0, // Will be calculated based on hourly rate
          workOrders: []
        }
      }
      acc[clientId].totalHours += entry.hours || 0
      
      // Add work order if not already added
      if (!acc[clientId].workOrders.find((wo: any) => wo.id === entry.workOrder.id)) {
        acc[clientId].workOrders.push({
          id: entry.workOrder.id,
          orderNumber: entry.workOrder.orderNumber,
          title: entry.workOrder.title,
          hours: entry.hours || 0
        })
      } else {
        // Update hours for existing work order
        const wo = acc[clientId].workOrders.find((wo: any) => wo.id === entry.workOrder.id)
        wo.hours += entry.hours || 0
      }
      
      return acc
    }, {} as Record<string, any>)

    // Calculate total hours and amount
    const totalHours = timeEntries.reduce((sum, entry) => sum + (entry.hours || 0), 0)
    const hourlyRate = 50 // Default hourly rate - should be configurable per technician/service
    const totalAmount = totalHours * hourlyRate

    // Update client summaries with amounts
    Object.values(clientSummary).forEach((summary: any) => {
      summary.totalAmount = summary.totalHours * hourlyRate
    })

    return NextResponse.json({
      month,
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      },
      summary: {
        totalHours,
        totalAmount,
        hourlyRate,
        entriesCount: timeEntries.length
      },
      byTechnician: Object.values(technicianSummary),
      byClient: Object.values(clientSummary)
    })
  } catch (error) {
    console.error('Error fetching monthly billing summary:', error)
    return NextResponse.json(
      { error: 'Error al obtener el resumen de facturación' },
      { status: 500 }
    )
  }
}
