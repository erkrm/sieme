import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session || !['ADMIN', 'MANAGER', 'HR'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Try to find by profile ID first, then by userId
    let technician = await db.technicianProfile.findUnique({
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
        specialties: true,
        certifications: true
      }
    })

    // If not found by profile ID, try userId
    if (!technician) {
      technician = await db.technicianProfile.findUnique({
        where: { userId: params.id },
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
          specialties: true,
          certifications: true
        }
      })
    }

    if (!technician) {
      return NextResponse.json({ error: 'Technician not found' }, { status: 404 })
    }

    return NextResponse.json(technician)
  } catch (error) {
    console.error('Error fetching technician:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session || !['ADMIN', 'HR'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const {
      name,
      email,
      phone,
      employeeId,
      baseSalary,
      hourlyCost,
      isAvailable,
      isActive
    } = await req.json()

    // Get the technician profile
    const technician = await db.technicianProfile.findUnique({
      where: { id: params.id },
      include: { user: true }
    })

    if (!technician) {
      return NextResponse.json({ error: 'Technician not found' }, { status: 404 })
    }

    // Update user and profile in a transaction
    const result = await db.$transaction(async (tx) => {
      // Update user
      await tx.user.update({
        where: { id: technician.userId },
        data: {
          name,
          email,
          phone,
          isActive
        }
      })

      // Update technician profile
      const updatedProfile = await tx.technicianProfile.update({
        where: { id: params.id },
        data: {
          employeeId,
          baseSalary,
          hourlyCost,
          isAvailable
        },
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
          specialties: true,
          certifications: true
        }
      })

      return updatedProfile
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error updating technician:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update technician' },
      { status: 500 }
    )
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
    const technician = await db.technicianProfile.findUnique({
      where: { id: params.id },
      include: { user: true }
    })

    if (!technician) {
      return NextResponse.json({ error: 'Technician not found' }, { status: 404 })
    }

    // Check if technician has active orders
    const activeOrders = await db.workOrder.count({
      where: {
        technicianId: technician.userId,
        status: {
          in: ['SCHEDULED', 'IN_PROGRESS', 'PENDING']
        }
      }
    })

    if (activeOrders > 0) {
      return NextResponse.json(
        { error: 'Cannot delete technician with active orders. Please reassign or complete them first.' },
        { status: 400 }
      )
    }

    // Delete in transaction
    await db.$transaction(async (tx) => {
      // Delete specialties
      await tx.technicianSpecialty.deleteMany({
        where: { technicianProfileId: params.id }
      })

      // Delete certifications
      await tx.technicianCertification.deleteMany({
        where: { technicianProfileId: params.id }
      })

      // Delete profile
      await tx.technicianProfile.delete({
        where: { id: params.id }
      })

      // Deactivate user (don't delete for audit trail)
      await tx.user.update({
        where: { id: technician.userId },
        data: { isActive: false }
      })
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting technician:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete technician' },
      { status: 500 }
    )
  }
}
