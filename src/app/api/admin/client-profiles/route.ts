import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db as prisma } from '@/lib/db'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const clientProfiles = await prisma.clientProfile.findMany({
      select: {
        id: true,
        companyName: true,
        ruc: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        companyName: 'asc'
      }
    })

    return NextResponse.json(clientProfiles)
  } catch (error) {
    console.error('Error fetching client profiles:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
