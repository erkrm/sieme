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

    // Get work orders for statistics
    const workOrders = await db.workOrder.findMany({
      select: {
        status: true,
        priority: true,
        category: true,
        createdAt: true,
        completedAt: true
      }
    })

    const totalOrders = workOrders.length
    const completedOrders = workOrders.filter(o => o.status === 'COMPLETED' || o.status === 'INVOICED' || o.status === 'CLOSED').length
    const pendingOrders = workOrders.filter(o => o.status === 'REQUESTED' || o.status === 'SCHEDULED' || o.status === 'PENDING').length
    const cancelledOrders = workOrders.filter(o => o.status === 'CANCELLED').length
    const inProgressOrders = workOrders.filter(o => o.status === 'IN_PROGRESS').length

    // Calculate average resolution time (in hours)
    const completedWithDates = workOrders.filter(o => o.completedAt && o.createdAt)
    const avgResolutionTime = completedWithDates.length > 0
      ? completedWithDates.reduce((acc, o) => {
          const diff = new Date(o.completedAt!).getTime() - new Date(o.createdAt).getTime()
          return acc + (diff / (1000 * 60 * 60)) // Convert to hours
        }, 0) / completedWithDates.length
      : 0

    // Orders by category
    const categoryMap: Record<string, number> = {}
    workOrders.forEach(o => {
      const cat = o.category || 'Sin categoría'
      categoryMap[cat] = (categoryMap[cat] || 0) + 1
    })
    const ordersByCategory = Object.entries(categoryMap).map(([category, count]) => ({
      category,
      count
    }))

    // Orders by priority
    const priorityMap: Record<string, number> = {}
    workOrders.forEach(o => {
      const pri = o.priority || 'NORMAL'
      priorityMap[pri] = (priorityMap[pri] || 0) + 1
    })
    const ordersByPriority = Object.entries(priorityMap).map(([priority, count]) => ({
      priority,
      count
    }))

    return NextResponse.json({
      totalOrders,
      completedOrders,
      pendingOrders,
      cancelledOrders,
      inProgressOrders,
      avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
      ordersByCategory,
      ordersByPriority
    })
  } catch (error) {
    console.error('Error fetching operations report:', error)
    return NextResponse.json(
      { error: 'Error al obtener el reporte de operaciones' },
      { status: 500 }
    )
  }
}
