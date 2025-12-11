import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const entityType = searchParams.get('entityType')
    const action = searchParams.get('action')
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Fetch work order logs as primary audit source
    const workOrderLogs = await db.workOrderLog.findMany({
      take: Math.min(limit, 100),
      orderBy: { createdAt: 'desc' },
      include: {
        workOrder: {
          select: {
            orderNumber: true,
            title: true
          }
        }
      }
    })

    // Transform to audit log format
    const auditLogs = workOrderLogs.map(log => ({
      id: log.id,
      action: log.previousStatus 
        ? `STATUS_CHANGE: ${log.previousStatus} → ${log.newStatus}`
        : `CREATED: ${log.newStatus}`,
      entityType: 'WorkOrder',
      entityId: log.workOrderId,
      userId: 'system',
      userName: 'Sistema',
      details: log.notes || `Orden ${log.workOrder.orderNumber}: ${log.workOrder.title}`,
      createdAt: log.createdAt.toISOString(),
      ipAddress: null,
      gpsLat: log.gpsLat,
      gpsLng: log.gpsLng
    }))

    // Also get recent users created/updated
    const recentUsers = await db.user.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    })

    const userLogs = recentUsers.map(user => ({
      id: `user-${user.id}`,
      action: user.createdAt.getTime() === user.updatedAt.getTime() ? 'CREATE' : 'UPDATE',
      entityType: 'User',
      entityId: user.id,
      userId: user.id,
      userName: user.name,
      details: `Usuario ${user.name} (${user.email}) - Rol: ${user.role}`,
      createdAt: user.updatedAt.toISOString(),
      ipAddress: null
    }))

    // Combine and sort all logs
    let allLogs = [...auditLogs, ...userLogs]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)

    // Apply filters
    if (entityType && entityType !== 'all') {
      allLogs = allLogs.filter(log => log.entityType === entityType)
    }
    if (action && action !== 'all') {
      allLogs = allLogs.filter(log => log.action.includes(action))
    }

    return NextResponse.json(allLogs)
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return NextResponse.json(
      { error: 'Error al obtener los logs de auditoría' },
      { status: 500 }
    )
  }
}
