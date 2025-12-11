import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const services = await db.service.findMany({
      include: {
        category: true
      },
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(services)
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json({ error: 'Error fetching services' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, categoryId, basePrice, estimatedHours } = body

    if (!name || !basePrice || !categoryId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const service = await db.service.create({
      data: {
        name,
        description,
        categoryId,
        basePrice: parseFloat(basePrice),
        estimatedHours: estimatedHours ? parseFloat(estimatedHours) : null
      }
    })

    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json({ error: 'Error creating service' }, { status: 500 })
  }
}
