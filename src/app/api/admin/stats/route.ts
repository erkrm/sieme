import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Get user counts by role
    const totalUsers = await db.user.count()
    const totalClients = await db.user.count({ where: { role: 'CLIENT' } })
    const totalTechnicians = await db.user.count({ where: { role: 'TECHNICIAN' } })

    // Get work order counts
    const totalWorkOrders = await db.workOrder.count()
    const activeWorkOrders = await db.workOrder.count({
      where: {
        status: {
          in: ['SCHEDULED', 'IN_PROGRESS', 'PENDING']
        }
      }
    })
    const completedWorkOrders = await db.workOrder.count({
      where: { status: 'COMPLETED' }
    })

    // Calculate revenue from completed orders
    const completedOrdersWithCost = await db.workOrder.findMany({
      where: { 
        status: 'COMPLETED',
        totalCost: { not: null }
      },
      select: { totalCost: true }
    })

    const totalRevenue = completedOrdersWithCost.reduce((sum, order) => sum + (order.totalCost || 0), 0)

    // Calculate this month's revenue
    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)

    const thisMonthOrders = await db.workOrder.findMany({
      where: {
        status: 'COMPLETED',
        totalCost: { not: null },
        completedAt: {
          gte: currentMonth
        }
      },
      select: { totalCost: true }
    })

    const thisMonthRevenue = thisMonthOrders.reduce((sum, order) => sum + (order.totalCost || 0), 0)

    const stats = {
      totalUsers,
      totalClients,
      totalTechnicians,
      totalWorkOrders,
      activeWorkOrders,
      completedWorkOrders,
      totalRevenue,
      thisMonthRevenue
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Error al obtener las estadísticas' },
      { status: 500 }
    )
  }
}