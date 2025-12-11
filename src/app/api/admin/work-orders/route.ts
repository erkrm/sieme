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

    const workOrders = await db.workOrder.findMany({
      include: {
        client: {
          select: {
            id: true,
            name: true
          }
        },
        technician: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(workOrders)
  } catch (error) {
    console.error('Error fetching work orders:', error)
    return NextResponse.json(
      { error: 'Error al obtener las órdenes de trabajo' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { clientId, title, description, category, priority, serviceAddress, contactPerson, contactPhone, scheduledDate, technicianId } = await req.json()

    if (!clientId || !title || !description || !category || !serviceAddress || !contactPerson || !contactPhone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

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
      },
      include: {
        client: { select: { id: true, name: true } },
        technician: { select: { id: true, name: true } }
      }
    })

    return NextResponse.json(order)
  } catch (error: any) {
    console.error('Error creating work order:', error)
    return NextResponse.json({ error: error.message || 'Failed to create work order' }, { status: 500 })
  }
}