import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || session.user.role !== 'TECHNICIAN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Optimized query with includes
    const workOrders = await db.workOrder.findMany({
      where: { 
        technicianId: session.user.id 
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        contract: {
          select: {
            id: true,
            type: true,
            slas: true
          }
        },
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        materials: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate SLA status for each order
    const now = new Date()
    
    const formattedOrders = workOrders.map(order => {
      // Calculate SLA remaining times
      let slaStatus: { firstResponse: any; onSite: any; resolution: any } | null = null
      if (order.slaFirstResponse || order.slaOnSite || order.slaResolution) {
        const calculateRemaining = (deadline: Date | null) => {
          if (!deadline) return null
          const diff = new Date(deadline).getTime() - now.getTime()
          return {
            deadline: deadline.toISOString(),
            remainingMs: diff,
            remainingMinutes: Math.floor(diff / 60000),
            isOverdue: diff < 0,
            status: diff < 0 ? 'OVERDUE' : diff < 1800000 ? 'CRITICAL' : 'OK' // 30 min threshold
          }
        }

        slaStatus = {
          firstResponse: calculateRemaining(order.slaFirstResponse),
          onSite: calculateRemaining(order.slaOnSite),
          resolution: calculateRemaining(order.slaResolution)
        }
      }

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        title: order.title,
        description: order.description,
        clientName: order.client?.name || 'Cliente',
        clientEmail: order.client?.email || '',
        clientPhone: order.client?.phone || '',
        address: order.serviceAddress,
        contactPerson: order.contactPerson,
        contactPhone: order.contactPhone,
        serviceType: order.category,
        urgency: order.priority,
        budget: order.budget || 0,
        status: order.status,
        subStatus: order.subStatus,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        assignedAt: order.assignedAt?.toISOString(),
        completedAt: order.completedAt?.toISOString(),
        scheduledDate: order.scheduledDate?.toISOString(),
        technicianNotes: order.notes,
        finalPrice: order.totalCost,
        sla: slaStatus,
        hasContract: !!order.contract,
        contractType: order.contract?.type,
        timeTracking: [],
        materialsUsed: order.materials.map(m => ({
          id: m.id,
          name: m.product.name,
          quantity: m.quantity,
          unitPrice: m.product.sellingPrice || 0,
          totalPrice: (m.product.sellingPrice || 0) * m.quantity
        })),
        messages: order.messages.map(message => ({
          id: message.id,
          content: message.content,
          senderType: message.senderId === session.user.id ? 'TECHNICIAN' : 'CLIENT',
          senderName: message.sender?.name || 'Sistema',
          createdAt: message.createdAt.toISOString()
        }))
      }
    })

    return NextResponse.json(formattedOrders)
  } catch (error) {
    console.error('Error fetching technician work orders:', error)
    return NextResponse.json(
      { error: 'Error al obtener las órdenes de trabajo' },
      { status: 500 }
    )
  }
}

