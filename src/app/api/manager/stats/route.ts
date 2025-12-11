import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'MANAGER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const [
      totalOrders,
      pendingOrders,
      inProgressOrders,
      completedOrders,
      totalTechnicians,
      availableTechnicians,
      totalClients,
      ordersThisWeek
    ] = await Promise.all([
      db.workOrder.count(),
      db.workOrder.count({ where: { status: { in: ['REQUESTED', 'PENDING'] } } }),
      db.workOrder.count({ where: { status: 'IN_PROGRESS' } }),
      db.workOrder.count({ where: { status: 'COMPLETED' } }),
      db.technicianProfile.count(),
      db.technicianProfile.count({ where: { isAvailable: true, user: { isActive: true } } }),
      db.clientProfile.count(),
      db.workOrder.count({ where: { createdAt: { gte: startOfWeek } } })
    ])

    return NextResponse.json({
      totalOrders,
      pendingOrders,
      inProgressOrders,
      completedOrders,
      totalTechnicians,
      availableTechnicians,
      totalClients,
      ordersThisWeek
    })
  } catch (error) {
    console.error('Error fetching manager stats:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
