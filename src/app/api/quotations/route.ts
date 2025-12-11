import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { workOrderId, laborSubtotal, materialsSubtotal, otherCosts, discountAmount, taxAmount, totalAmount, validUntil, notes, items } = body

    if (!workOrderId || !totalAmount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Generate quotation number
    const quotationNumber = `QT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`

    const quotation = await db.quotation.create({
      data: {
        quotationNumber,
        workOrderId,
        laborSubtotal: laborSubtotal || 0,
        materialsSubtotal: materialsSubtotal || 0,
        otherCosts: otherCosts || 0,
        discountAmount: discountAmount || 0,
        taxAmount: taxAmount || 0,
        totalAmount: parseFloat(totalAmount),
        validUntil: validUntil ? new Date(validUntil) : null,
        notes: notes || null,
        status: 'DRAFT',
        items: items ? {
          create: items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity || 1,
            unitPrice: item.unitPrice || 0,
            total: item.total || (item.quantity || 1) * (item.unitPrice || 0)
          }))
        } : undefined
      },
      include: {
        items: true
      }
    })

    // Notify client
    const workOrder = await db.workOrder.findUnique({
        where: { id: workOrderId },
        include: { client: true }
    })

    if (workOrder) {
        await db.notification.create({
            data: {
                userId: workOrder.clientId,
                title: 'Nueva Cotización',
                message: `Se ha generado una cotización para la orden #${workOrder.orderNumber}`,
                type: 'ORDER_UPDATE',
                relatedId: quotation.id
            }
        })
    }

    return NextResponse.json(quotation, { status: 201 })
  } catch (error) {
    console.error('Error creating quotation:', error)
    return NextResponse.json({ error: 'Error creating quotation' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const workOrderId = searchParams.get('workOrderId')
        const status = searchParams.get('status')

        const whereClause: any = {}
        if (workOrderId) whereClause.workOrderId = workOrderId
        if (status) whereClause.status = status

        const quotations = await db.quotation.findMany({
            where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
            orderBy: { createdAt: 'desc' },
            include: {
                workOrder: {
                    include: {
                        client: {
                            select: { name: true }
                        }
                    }
                },
                items: true
            }
        })

        return NextResponse.json(quotations)
    } catch (error) {
        console.error('Error fetching quotations:', error)
        return NextResponse.json({ error: 'Error fetching quotations' }, { status: 500 })
    }
}
