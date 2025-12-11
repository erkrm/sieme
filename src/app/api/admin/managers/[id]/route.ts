import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const manager = await db.managerProfile.findUnique({
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
        }
      }
    })

    if (!manager) {
      return NextResponse.json({ error: 'Manager not found' }, { status: 404 })
    }

    return NextResponse.json(manager)
  } catch (error) {
    console.error('Error fetching manager:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { name, email, phone, employeeId, department, isActive } = await req.json()

    const manager = await db.managerProfile.findUnique({
      where: { id: params.id },
      include: { user: true }
    })

    if (!manager) {
      return NextResponse.json({ error: 'Manager not found' }, { status: 404 })
    }

    const result = await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: manager.userId },
        data: { name, email, phone, isActive }
      })

      const updatedProfile = await tx.managerProfile.update({
        where: { id: params.id },
        data: { employeeId, department },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              isActive: true
            }
          }
        }
      })

      return updatedProfile
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error updating manager:', error)
    return NextResponse.json({ error: error.message || 'Failed to update manager' }, { status: 500 })
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
    const manager = await db.managerProfile.findUnique({
      where: { id: params.id },
      include: { user: true }
    })

    if (!manager) {
      return NextResponse.json({ error: 'Manager not found' }, { status: 404 })
    }

    await db.$transaction(async (tx) => {
      await tx.managerProfile.delete({ where: { id: params.id } })
      await tx.user.update({
        where: { id: manager.userId },
        data: { isActive: false }
      })
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting manager:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete manager' }, { status: 500 })
  }
}
