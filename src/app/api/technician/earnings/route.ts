import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || session.user.role !== 'TECHNICIAN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const technicianId = session.user.id

    // Get date ranges
    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const thisWeekStart = new Date(now)
    thisWeekStart.setDate(now.getDate() - now.getDay())
    thisWeekStart.setHours(0, 0, 0, 0)

    // Get completed work orders with costs
    const completedOrders = await db.workOrder.findMany({
      where: {
        technicianId,
        status: { in: ['COMPLETED', 'INVOICED', 'CLOSED'] }
      },
      select: {
        id: true,
        orderNumber: true,
        title: true,
        totalCost: true,
        budget: true,
        completedAt: true,
        createdAt: true
      },
      orderBy: { completedAt: 'desc' }
    })

    // Calculate earnings based on technician hourly cost or percentage
    const techProfile = await db.technicianProfile.findUnique({
      where: { userId: technicianId },
      select: { hourlyCost: true, baseSalary: true }
    })

    const hourlyRate = techProfile?.hourlyCost || 25 // Default hourly rate
    const commissionRate = 0.15 // 15% commission on job value

    // Calculate total earnings
    let totalEarnings = 0
    let thisMonthEarnings = 0
    let lastMonthEarnings = 0
    let thisWeekEarnings = 0
    let totalHoursWorked = 0

    const earningsHistory = completedOrders.map(order => {
      // Estimate hours from budget or use average 4 hours
      const estimatedHours = order.budget ? Math.ceil(order.budget / hourlyRate) : 4
      const orderValue = order.totalCost || order.budget || 0
      const earnings = orderValue * commissionRate + (estimatedHours * hourlyRate * 0.5)
      
      totalEarnings += earnings
      totalHoursWorked += estimatedHours

      if (order.completedAt) {
        const completedDate = new Date(order.completedAt)
        if (completedDate >= thisMonthStart) {
          thisMonthEarnings += earnings
        }
        if (completedDate >= lastMonthStart && completedDate < thisMonthStart) {
          lastMonthEarnings += earnings
        }
        if (completedDate >= thisWeekStart) {
          thisWeekEarnings += earnings
        }
      }

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        title: order.title,
        completedAt: order.completedAt?.toISOString(),
        orderValue,
        earnings: Math.round(earnings * 100) / 100,
        hours: estimatedHours
      }
    })

    // Monthly trend (last 6 months)
    const monthlyTrend: { month: string; earnings: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      const monthName = monthStart.toLocaleDateString('es-ES', { month: 'short' })
      
      const monthEarnings = completedOrders
        .filter(o => o.completedAt && new Date(o.completedAt) >= monthStart && new Date(o.completedAt) <= monthEnd)
        .reduce((acc, o) => {
          const orderValue = o.totalCost || o.budget || 0
          const estimatedHours = o.budget ? Math.ceil(o.budget / hourlyRate) : 4
          return acc + (orderValue * commissionRate + estimatedHours * hourlyRate * 0.5)
        }, 0)
      
      monthlyTrend.push({
        month: monthName,
        earnings: Math.round(monthEarnings * 100) / 100
      })
    }

    return NextResponse.json({
      totalEarnings: Math.round(totalEarnings * 100) / 100,
      thisMonthEarnings: Math.round(thisMonthEarnings * 100) / 100,
      lastMonthEarnings: Math.round(lastMonthEarnings * 100) / 100,
      thisWeekEarnings: Math.round(thisWeekEarnings * 100) / 100,
      hoursWorked: totalHoursWorked,
      ordersCompleted: completedOrders.length,
      averagePerOrder: completedOrders.length > 0 
        ? Math.round((totalEarnings / completedOrders.length) * 100) / 100 
        : 0,
      hourlyRate,
      commissionRate: commissionRate * 100,
      monthlyTrend,
      recentEarnings: earningsHistory.slice(0, 10)
    })
  } catch (error) {
    console.error('Error fetching technician earnings:', error)
    return NextResponse.json(
      { error: 'Error al obtener las ganancias' },
      { status: 500 }
    )
  }
}
