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
    const body = await request.json()
    const { reason } = body

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
        { error: 'No autorizado para rechazar esta cotización' },
        { status: 403 }
      )
    }

    // Update quotation status
    const updatedQuotation = await db.quotation.update({
      where: { id },
      data: {
        status: 'REJECTED'
      }
    })

    // Update work order status back to pending
    await db.workOrder.update({
      where: { id: quotation.workOrderId },
      data: {
        status: 'PENDING',
        notes: reason ? `Cotización rechazada: ${reason}` : 'Cotización rechazada por el cliente'
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
          title: 'Cotización Rechazada',
          message: `El cliente ${quotation.workOrder.client.name} ha rechazado la cotización para la orden #${quotation.workOrder.orderNumber}${reason ? `. Motivo: ${reason}` : ''}`,
          type: 'ORDER_UPDATE',
          relatedId: quotation.id
        }
      })
    }

    return NextResponse.json({
      message: 'Cotización rechazada',
      quotation: updatedQuotation
    })
  } catch (error) {
    console.error('Error rejecting quotation:', error)
    return NextResponse.json(
      { error: 'Error al rechazar la cotización' },
      { status: 500 }
    )
  }
}
