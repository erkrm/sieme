import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'TECHNICIAN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const technicianId = session.user.id

    // Get work orders count by status
    const [
      totalOrders,
      inProgressOrders,
      completedOrders,
      pendingOrders,
      scheduledOrders
    ] = await Promise.all([
      db.workOrder.count({
        where: { technicianId }
      }),
      db.workOrder.count({
        where: { 
          technicianId,
          status: 'IN_PROGRESS'
        }
      }),
      db.workOrder.count({
        where: { 
          technicianId,
          status: 'COMPLETED'
        }
      }),
      db.workOrder.count({
        where: { 
          technicianId,
          status: 'PENDING'
        }
      }),
      db.workOrder.count({
        where: { 
          technicianId,
          status: 'SCHEDULED'
        }
      })
    ])

    // Get today's orders
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayOrders = await db.workOrder.count({
      where: {
        technicianId,
        scheduledDate: {
          gte: today,
          lt: tomorrow
        }
      }
    })

    // Get this week's completed orders
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())
    
    const weekCompletedOrders = await db.workOrder.count({
      where: {
        technicianId,
        status: 'COMPLETED',
        completedAt: {
          gte: weekStart
        }
      }
    })

    // Get this month's stats
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    
    const monthCompletedOrders = await db.workOrder.count({
      where: {
        technicianId,
        status: 'COMPLETED',
        completedAt: {
          gte: monthStart
        }
      }
    })

    // Get average rating (if you have a rating system)
    // For now, we'll return a placeholder
    const averageRating = 4.5

    // Calculate active orders (in_progress + scheduled + pending)
    const activeOrders = inProgressOrders + scheduledOrders + pendingOrders

    return NextResponse.json({
      // Dashboard expected format
      activeOrders,
      completedOrders,
      totalEarnings: 0, // TODO: Calculate from completed orders
      averageRating,
      thisMonthEarnings: 0, // TODO: Calculate from this month's completed orders
      // Additional stats
      total: totalOrders,
      inProgress: inProgressOrders,
      pending: pendingOrders,
      scheduled: scheduledOrders,
      today: todayOrders,
      thisWeek: weekCompletedOrders,
      thisMonth: monthCompletedOrders
    })
  } catch (error) {
    console.error('Error fetching technician stats:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}