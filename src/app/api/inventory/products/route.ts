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
    const { sku, name, description, buyingPrice, sellingPrice } = body

    if (!sku || !name) {
      return NextResponse.json({ error: 'SKU and Name are required' }, { status: 400 })
    }

    const existingProduct = await db.product.findUnique({
      where: { sku }
    })

    if (existingProduct) {
      return NextResponse.json({ error: 'Product with this SKU already exists' }, { status: 400 })
    }

    const product = await db.product.create({
      data: {
        sku,
        name,
        description,
        buyingPrice: buyingPrice ? parseFloat(buyingPrice) : null,
        sellingPrice: sellingPrice ? parseFloat(sellingPrice) : null
      }
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const products = await db.product.findMany({
      include: {
        stocks: {
          include: {
            warehouse: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
