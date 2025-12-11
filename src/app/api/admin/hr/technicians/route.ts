import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || !['ADMIN', 'MANAGER', 'HR'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const technicians = await db.technicianProfile.findMany({
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
      },
      orderBy: {
        user: {
          name: 'asc'
        }
      }
    })

    return NextResponse.json(technicians)
  } catch (error) {
    console.error('Error fetching technicians:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !['ADMIN', 'HR'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const {
      name,
      email,
      password,
      phone,
      employeeCode,
      hireDate,
      contractType,
      baseSalary,
      hourlyCost,
      coverageZones,
      availableForEmergency,
      isAvailable,
      specialties
    } = await req.json()

    // Validation
    if (!name || !email || !password || !employeeCode || !hireDate) {
      return NextResponse.json(
        { error: 'Required fields missing: Name, Email, Password, Employee Code, Hire Date' },
        { status: 400 }
      )
    }

    // Check existing
    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 })
    }

    const existingProfile = await db.technicianProfile.findFirst({ where: { employeeId: employeeCode } })
    if (existingProfile) {
      return NextResponse.json({ error: 'Employee code already in use' }, { status: 400 })
    }

    // Atomic Creation
    const result = await db.$transaction(async (tx) => {
      // 1. Create User
      const hashedPassword = await bcrypt.hash(password, 10)
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'TECHNICIAN',
          phone,
          isActive: true
        }
      })

      // 2. Create Profile
      const profile = await tx.technicianProfile.create({
        data: {
          userId: user.id,
          employeeId: employeeCode,
          hireDate: new Date(hireDate),
          isAvailable: isAvailable !== undefined ? isAvailable : true,
          baseSalary: typeof baseSalary === 'string' ? parseFloat(baseSalary) : (baseSalary || null),
          hourlyCost: typeof hourlyCost === 'string' ? parseFloat(hourlyCost) : (hourlyCost || null)
        }
      })

      // 3. Add specialties if provided
      if (specialties && Array.isArray(specialties) && specialties.length > 0) {
        await tx.technicianSpecialty.createMany({
          data: specialties.map((spec: string) => ({
            technicianProfileId: profile.id,
            name: spec,
            level: 'Junior' // Default level
          }))
        })
      }

      return { user, profile }
    })

    const { password: _, ...userWithoutPassword } = result.user
    return NextResponse.json({ ...userWithoutPassword, profile: result.profile })

  } catch (error: any) {
    console.error('Error creating technician:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create technician' },
      { status: 500 }
    )
  }
}
