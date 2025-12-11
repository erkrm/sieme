import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || session.user.role !== 'TECHNICIAN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const technicianProfile = await db.technicianProfile.findUnique({
      where: { userId: session.user.id },
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
        specialties: {
          select: {
            id: true,
            name: true,
            level: true
          }
        },
        certifications: {
          select: {
            id: true,
            name: true,
            issueDate: true,
            expiryDate: true,
            documentUrl: true
          }
        }
      }
    })

    if (!technicianProfile) {
      // Return basic info from session if no profile exists
      return NextResponse.json({
        employeeId: null,
        hireDate: null,
        isAvailable: true,
        specialties: [],
        certifications: [],
        user: {
          name: session.user.name,
          email: session.user.email,
          phone: null
        }
      })
    }

    return NextResponse.json({
      id: technicianProfile.id,
      employeeId: technicianProfile.employeeId,
      hireDate: technicianProfile.hireDate?.toISOString(),
      isAvailable: technicianProfile.isAvailable,
      baseSalary: technicianProfile.baseSalary,
      hourlyCost: technicianProfile.hourlyCost,
      specialties: technicianProfile.specialties.map(s => ({
        id: s.id,
        name: s.name,
        level: s.level
      })),
      certifications: technicianProfile.certifications.map(c => ({
        id: c.id,
        name: c.name,
        issueDate: c.issueDate?.toISOString(),
        expiryDate: c.expiryDate?.toISOString()
      })),
      user: {
        name: technicianProfile.user.name,
        email: technicianProfile.user.email,
        phone: technicianProfile.user.phone
      }
    })
  } catch (error) {
    console.error('Error fetching technician profile:', error)
    return NextResponse.json(
      { error: 'Error al obtener el perfil del técnico' },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || session.user.role !== 'TECHNICIAN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { isAvailable } = await req.json()

    const updatedProfile = await db.technicianProfile.update({
      where: { userId: session.user.id },
      data: {
        isAvailable: isAvailable
      }
    })

    return NextResponse.json({
      success: true,
      isAvailable: updatedProfile.isAvailable
    })
  } catch (error) {
    console.error('Error updating technician profile:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el perfil' },
      { status: 500 }
    )
  }
}
