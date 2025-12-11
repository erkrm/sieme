import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || session.user.role !== 'TECHNICIAN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { name, quantity, unitPrice } = await request.json()
    const { orderId } = params

    // Verify the work order is assigned to this technician
    const workOrder = await db.workOrder.findFirst({
      where: { 
        id: orderId,
        technicianId: session.user.id
      }
    })

    if (!workOrder) {
      return NextResponse.json({ error: 'Orden de trabajo no encontrada' }, { status: 404 })
    }

    // Find or create product (simplified for now)
    let product = await db.product.findFirst({
      where: { name }
    })

    if (!product) {
      // Create a temporary product if it doesn't exist
      // In a real system, we might want to restrict this or use a catalog
      product = await db.product.create({
        data: {
          sku: `TEMP-${Date.now()}`,
          name,
          sellingPrice: unitPrice
        }
      })
    }

    // Add material to work order
    const material = await db.orderMaterial.create({
      data: {
        workOrderId: orderId,
        productId: product.id,
        quantity
      },
      include: {
        product: true
      }
    })

    return NextResponse.json({ success: true, material })
  } catch (error) {
    console.error('Error adding material:', error)
    return NextResponse.json(
      { error: 'Error al añadir material' },
      { status: 500 }
    )
  }
}