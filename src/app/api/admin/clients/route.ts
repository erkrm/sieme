import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const clients = await db.clientProfile.findMany({
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
        locations: {
          select: {
            id: true,
            name: true,
            address: true
          }
        },
        _count: {
          select: {
            contracts: true
          }
        }
      },
      orderBy: {
        companyName: 'asc'
      }
    })

    return NextResponse.json(clients)
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { name, email, phone, password, companyName, ruc, businessType, address, industry } = await req.json()

    if (!name || !email || !password || !companyName) {
      return NextResponse.json(
        { error: 'Name, email, password and company name are required' },
        { status: 400 }
      )
    }

    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          phone,
          password: hashedPassword,
          role: 'CLIENT',
          isActive: true
        }
      })

      const profile = await tx.clientProfile.create({
        data: {
          userId: user.id,
          companyName,
          ruc,
          businessType,
          address,
          industry
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
          }
        }
      })

      return profile
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error creating client:', error)
    return NextResponse.json({ error: error.message || 'Failed to create client' }, { status: 500 })
  }
}
