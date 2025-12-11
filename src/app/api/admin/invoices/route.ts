import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db as prisma } from '@/lib/db'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !['ADMIN', 'MANAGER', 'FINANCE'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const where: any = {}
    if (status && status !== 'all') {
      where.status = status
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        contract: {
          select: {
            type: true,
            clientProfile: {
              select: {
                companyName: true,
                ruc: true
              }
            }
          }
        },
        items: {
          include: {
            workOrder: {
              select: {
                orderNumber: true,
                title: true
              }
            }
          }
        },
        payments: true,
        _count: {
          select: {
            items: true,
            payments: true
          }
        }
      },
      orderBy: {
        issueDate: 'desc'
      }
    })

    return NextResponse.json(invoices)
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
