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
    const available = searchParams.get('available')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      user: {
        isActive: true
      }
    }

    if (search) {
      where.user = {
        ...where.user,
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      }
    }

    if (available === 'true') {
      where.isAvailable = true
    } else if (available === 'false') {
      where.isAvailable = false
    }

    // Get technicians with pagination
    const [technicians, total] = await Promise.all([
      db.technicianProfile.findMany({
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
          specialties: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }),
      db.technicianProfile.count({ where })
    ])

    // Get work order counts for each technician
    const technicianIds = technicians.map(t => t.userId)
    const workOrderCounts = await db.workOrder.groupBy({
      by: ['technicianId'],
      where: {
        technicianId: { in: technicianIds }
      },
      _count: { id: true }
    })

    const countMap = new Map(workOrderCounts.map(w => [w.technicianId, w._count.id]))

    // Add order count to each technician
    const techniciansWithStats = technicians.map(tech => ({
      ...tech,
      orderCount: countMap.get(tech.userId) || 0
    }))

    return NextResponse.json({
      technicians: techniciansWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching technicians:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
