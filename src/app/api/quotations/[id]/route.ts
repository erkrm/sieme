import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = params

    const quotation = await db.quotation.findUnique({
      where: { id },
      include: {
        workOrder: {
          include: {
            client: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        items: true
      }
    })

    if (!quotation) {
      return NextResponse.json(
        { error: 'Cotización no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(quotation)
  } catch (error) {
    console.error('Error fetching quotation:', error)
    return NextResponse.json(
      { error: 'Error al obtener la cotización' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Only allow ADMIN, MANAGER to update quotations
    if (!['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const { id } = params
    const body = await request.json()
    const { status, notes, totalAmount, items, validUntil } = body

    const updateData: any = {}
    if (status) updateData.status = status
    if (notes !== undefined) updateData.notes = notes
    if (totalAmount !== undefined) updateData.totalAmount = parseFloat(totalAmount)
    if (items !== undefined) updateData.items = JSON.stringify(items)
    if (validUntil !== undefined) updateData.validUntil = validUntil ? new Date(validUntil) : null

    const quotation = await db.quotation.update({
      where: { id },
      data: updateData,
      include: {
        workOrder: {
          include: {
            client: {
              select: { name: true }
            }
          }
        }
      }
    })

    // Create notification for status changes
    if (status && ['APPROVED', 'REJECTED'].includes(status)) {
      const workOrder = await db.workOrder.findUnique({
        where: { id: quotation.workOrderId }
      })
      
      if (workOrder) {
        await db.notification.create({
          data: {
            userId: workOrder.clientId,
            title: status === 'APPROVED' ? 'Cotización Aprobada' : 'Cotización Rechazada',
            message: `La cotización para la orden #${workOrder.orderNumber} ha sido ${status === 'APPROVED' ? 'aprobada' : 'rechazada'}`,
            type: 'ORDER_UPDATE',
            relatedId: quotation.id
          }
        })
      }
    }

    return NextResponse.json(quotation)
  } catch (error) {
    console.error('Error updating quotation:', error)
    return NextResponse.json(
      { error: 'Error al actualizar la cotización' },
      { status: 500 }
    )
  }
}

