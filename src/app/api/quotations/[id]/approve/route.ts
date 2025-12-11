import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = params

    // Get quotation with work order
    const quotation = await db.quotation.findUnique({
      where: { id },
      include: {
        workOrder: {
          include: {
            client: true
          }
        }
      }
    })

    if (!quotation) {
      return NextResponse.json(
        { error: 'Cotización no encontrada' },
        { status: 404 }
      )
    }

    // Verify user is the client of this work order
    if (quotation.workOrder.clientId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado para aprobar esta cotización' },
        { status: 403 }
      )
    }

    // Update quotation status
    const updatedQuotation = await db.quotation.update({
      where: { id },
      data: {
        status: 'APPROVED'
      }
    })

    // Update work order status to approved
    await db.workOrder.update({
      where: { id: quotation.workOrderId },
      data: {
        status: 'SCHEDULED' // Ready to be assigned to technician
      }
    })

    // Notify manager/admin
    const managers = await db.user.findMany({
      where: {
        role: { in: ['ADMIN', 'MANAGER'] },
        isActive: true
      }
    })

    for (const manager of managers) {
      await db.notification.create({
        data: {
          userId: manager.id,
          title: 'Cotización Aprobada',
          message: `El cliente ${quotation.workOrder.client.name} ha aprobado la cotización para la orden #${quotation.workOrder.orderNumber}`,
          type: 'ORDER_UPDATE',
          relatedId: quotation.id
        }
      })
    }

    return NextResponse.json({
      message: 'Cotización aprobada exitosamente',
      quotation: updatedQuotation
    })
  } catch (error) {
    console.error('Error approving quotation:', error)
    return NextResponse.json(
      { error: 'Error al aprobar la cotización' },
      { status: 500 }
    )
  }
}
