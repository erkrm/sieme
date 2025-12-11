import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const client = await db.clientProfile.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            isActive: true
          }
        },
        locations: true,
        contracts: {
          include: {
            _count: { select: { workOrders: true } }
          }
        }
      }
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    return NextResponse.json(client)
  } catch (error) {
    console.error('Error fetching client:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { name, email, phone, companyName, ruc, businessType, address, industry, isActive } = await req.json()

    const client = await db.clientProfile.findUnique({
      where: { id: params.id },
      include: { user: true }
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const result = await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: client.userId },
        data: { name, email, phone, isActive }
      })

      const updatedProfile = await tx.clientProfile.update({
        where: { id: params.id },
        data: { companyName, ruc, businessType, address, industry },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              isActive: true
            }
          },
          locations: true
        }
      })

      return updatedProfile
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error updating client:', error)
    return NextResponse.json({ error: error.message || 'Failed to update client' }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const client = await db.clientProfile.findUnique({
      where: { id: params.id },
      include: { user: true }
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Check for active work orders
    const activeOrders = await db.workOrder.count({
      where: {
        clientId: client.userId,
        status: { in: ['REQUESTED', 'SCHEDULED', 'IN_PROGRESS', 'PENDING'] }
      }
    })

    if (activeOrders > 0) {
      return NextResponse.json(
        { error: 'Cannot delete client with active work orders' },
        { status: 400 }
      )
    }

    await db.$transaction(async (tx) => {
      await tx.companyLocation.deleteMany({ where: { clientProfileId: params.id } })
      await tx.clientProfile.delete({ where: { id: params.id } })
      await tx.user.update({
        where: { id: client.userId },
        data: { isActive: false }
      })
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting client:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete client' }, { status: 500 })
  }
}
