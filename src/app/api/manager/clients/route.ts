import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const active = searchParams.get('active')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } }
      ]
    }

    if (active === 'true') {
      where.user = { ...where.user, isActive: true }
    } else if (active === 'false') {
      where.user = { ...where.user, isActive: false }
    }

    // Get clients with pagination
    const [clients, total] = await Promise.all([
      db.clientProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { userId: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              isActive: true
            }
          },
          contracts: {
            where: { status: 'ACTIVE' },
            select: { id: true, type: true }
          },
          locations: {
            select: { id: true }
          }
        }
      }),
      db.clientProfile.count({ where })
    ])

    // Get work order counts for each client
    const userIds = clients.map(c => c.userId)
    const workOrderCounts = await db.workOrder.groupBy({
      by: ['clientId'],
      where: {
        clientId: { in: userIds }
      },
      _count: { id: true }
    })

    const countMap = new Map(workOrderCounts.map(w => [w.clientId, w._count.id]))

    // Add order count to each client
    const clientsWithStats = clients.map(client => ({
      ...client,
      orderCount: countMap.get(client.userId) || 0,
      locationCount: client.locations?.length || 0
    }))

    return NextResponse.json({
      clients: clientsWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
