import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db as prisma } from '@/lib/db'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const contract = await prisma.contract.findUnique({
      where: { id: params.id },
      include: {
        clientProfile: {
          select: {
            companyName: true,
            ruc: true,
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        rates: {
          include: {
            serviceCategory: true
          }
        },
        slas: true,
        _count: {
          select: {
            workOrders: true,
            invoices: true
          }
        }
      }
    })

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    return NextResponse.json(contract)
  } catch (error) {
    console.error('Error fetching contract:', error)
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
    const body = await req.json()
    const { 
      status, 
      endDate, 
      autoRenewal,
      emergencyLimit,
      autoApproveLimit,
      discountPercent
    } = body

    const contract = await prisma.contract.update({
      where: { id: params.id },
      data: {
        status,
        endDate: endDate ? new Date(endDate) : undefined,
        autoRenewal,
        emergencyLimit: emergencyLimit ? parseFloat(emergencyLimit) : undefined,
        autoApproveLimit: autoApproveLimit ? parseFloat(autoApproveLimit) : undefined,
        discountPercent: discountPercent ? parseFloat(discountPercent) : undefined,
      }
    })

    return NextResponse.json(contract)
  } catch (error) {
    console.error('Error updating contract:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
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
    // Check if contract has related data
    const contract = await prisma.contract.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            workOrders: true,
            invoices: true
          }
        }
      }
    })

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    if (contract._count.workOrders > 0 || contract._count.invoices > 0) {
      return NextResponse.json(
        { error: 'Cannot delete contract with existing work orders or invoices' }, 
        { status: 400 }
      )
    }

    // Delete related rates and SLAs first (if not cascading, but Prisma handles cascade usually)
    // However, explicit deletion is safer if cascade isn't set up perfectly in DB
    await prisma.contractRate.deleteMany({ where: { contractId: params.id } })
    await prisma.contractSLA.deleteMany({ where: { contractId: params.id } })
    
    await prisma.contract.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Contract deleted successfully' })
  } catch (error) {
    console.error('Error deleting contract:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
