import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { startOfDay, endOfDay, subDays } from 'date-fns'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const days = parseInt(searchParams.get('days') || '30')
    
    const startDate = startOfDay(subDays(new Date(), days))
    const endDate = endOfDay(new Date())

    // Get all completed orders with SLA data
    const orders = await db.workOrder.findMany({
      where: {
        status: {
          in: ['COMPLETED', 'CLOSED']
        },
        completedAt: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        id: true,
        priority: true,
        createdAt: true,
        assignedAt: true,
        checkInAt: true,
        completedAt: true,
        slaFirstResponse: true,
        slaOnSite: true,
        slaResolution: true
      }
    })

    // Calculate SLA compliance
    const slaAnalysis = {
      total: orders.length,
      firstResponse: { met: 0, missed: 0, percentage: 0 },
      onSite: { met: 0, missed: 0, percentage: 0 },
      resolution: { met: 0, missed: 0, percentage: 0 },
      byPriority: {
        NORMAL: { total: 0, met: 0, percentage: 0 },
        URGENT: { total: 0, met: 0, percentage: 0 },
        EMERGENCY: { total: 0, met: 0, percentage: 0 }
      }
    }

    orders.forEach(order => {
      // First Response SLA
      if (order.slaFirstResponse && order.assignedAt) {
        const responseTime = order.assignedAt.getTime() - order.createdAt.getTime()
        const slaTime = order.slaFirstResponse.getTime() - order.createdAt.getTime()
        if (responseTime <= slaTime) {
          slaAnalysis.firstResponse.met++
        } else {
          slaAnalysis.firstResponse.missed++
        }
      }

      // On-Site SLA
      if (order.slaOnSite && order.checkInAt) {
        const onSiteTime = order.checkInAt.getTime() - order.createdAt.getTime()
        const slaTime = order.slaOnSite.getTime() - order.createdAt.getTime()
        if (onSiteTime <= slaTime) {
          slaAnalysis.onSite.met++
        } else {
          slaAnalysis.onSite.missed++
        }
      }

      // Resolution SLA
      if (order.slaResolution && order.completedAt) {
        const resolutionTime = order.completedAt.getTime() - order.createdAt.getTime()
        const slaTime = order.slaResolution.getTime() - order.createdAt.getTime()
        
        const met = resolutionTime <= slaTime
        if (met) {
          slaAnalysis.resolution.met++
        } else {
          slaAnalysis.resolution.missed++
        }

        // By priority
        const priority = order.priority as 'NORMAL' | 'URGENT' | 'EMERGENCY'
        slaAnalysis.byPriority[priority].total++
        if (met) {
          slaAnalysis.byPriority[priority].met++
        }
      }
    })

    // Calculate percentages
    slaAnalysis.firstResponse.percentage = slaAnalysis.firstResponse.met + slaAnalysis.firstResponse.missed > 0
      ? Math.round((slaAnalysis.firstResponse.met / (slaAnalysis.firstResponse.met + slaAnalysis.firstResponse.missed)) * 100)
      : 0

    slaAnalysis.onSite.percentage = slaAnalysis.onSite.met + slaAnalysis.onSite.missed > 0
      ? Math.round((slaAnalysis.onSite.met / (slaAnalysis.onSite.met + slaAnalysis.onSite.missed)) * 100)
      : 0

    slaAnalysis.resolution.percentage = slaAnalysis.resolution.met + slaAnalysis.resolution.missed > 0
      ? Math.round((slaAnalysis.resolution.met / (slaAnalysis.resolution.met + slaAnalysis.resolution.missed)) * 100)
      : 0

    Object.keys(slaAnalysis.byPriority).forEach(priority => {
      const p = slaAnalysis.byPriority[priority as keyof typeof slaAnalysis.byPriority]
      p.percentage = p.total > 0 ? Math.round((p.met / p.total) * 100) : 0
    })

    // Get orders at risk (currently active with SLA approaching)
    const now = new Date()
    const atRiskOrders = await db.workOrder.findMany({
      where: {
        status: {
          in: ['SCHEDULED', 'IN_PROGRESS']
        },
        slaResolution: {
          lte: new Date(now.getTime() + 2 * 60 * 60 * 1000) // Within 2 hours
        }
      },
      select: {
        id: true,
        orderNumber: true,
        priority: true,
        slaResolution: true,
        client: {
          select: {
            name: true
          }
        }
      },
      take: 10
    })

    return NextResponse.json({
      summary: slaAnalysis,
      atRisk: atRiskOrders.map(order => ({
        ...order,
        minutesRemaining: Math.floor((order.slaResolution!.getTime() - now.getTime()) / (1000 * 60))
      }))
    })
  } catch (error) {
    console.error('Error fetching SLA report:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
