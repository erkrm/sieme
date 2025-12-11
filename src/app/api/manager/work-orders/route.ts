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
    const limit = parseInt(searchParams.get('limit') || '50')

    const orders = await db.workOrder.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { id: true, name: true } },
        technician: { select: { id: true, name: true } }
      }
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching work orders:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { clientId, title, description, category, priority, serviceAddress, contactPerson, contactPhone, scheduledDate, technicianId } = await req.json()

    const orderNumber = `WO-${Date.now().toString().slice(-8)}`

    const order = await db.workOrder.create({
      data: {
        orderNumber,
        clientId,
        title,
        description,
        category,
        priority: priority || 'NORMAL',
        serviceAddress,
        contactPerson,
        contactPhone,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        technicianId: technicianId || null,
        status: technicianId ? 'SCHEDULED' : 'REQUESTED'
      }
    })

    return NextResponse.json(order)
  } catch (error: any) {
    console.error('Error creating work order:', error)
    return NextResponse.json({ error: error.message || 'Failed to create work order' }, { status: 500 })
  }
}
