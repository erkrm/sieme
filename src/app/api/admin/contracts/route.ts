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
    const contracts = await prisma.contract.findMany({
      include: {
        clientProfile: {
          select: {
            companyName: true,
            ruc: true
          }
        },
        rates: {
          include: {
            serviceCategory: true
          }
        },
        slas: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(contracts)
  } catch (error) {
    console.error('Error fetching contracts:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { 
      clientProfileId, 
      type, 
      startDate, 
      endDate, 
      paymentTerms, 
      rates, 
      slas,
      autoRenewal,
      emergencyLimit,
      autoApproveLimit,
      discountPercent
    } = body

    if (!clientProfileId || !startDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const contract = await prisma.contract.create({
      data: {
        clientProfileId,
        type,
        status: 'ACTIVE', // Default to active for now
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        paymentTerms: parseInt(paymentTerms) || 30,
        autoRenewal: autoRenewal || false,
        emergencyLimit: emergencyLimit ? parseFloat(emergencyLimit) : null,
        autoApproveLimit: autoApproveLimit ? parseFloat(autoApproveLimit) : null,
        discountPercent: discountPercent ? parseFloat(discountPercent) : 0,
        rates: {
          create: rates?.map((rate: any) => ({
            serviceCategoryId: rate.serviceCategoryId,
            hourlyRate: parseFloat(rate.hourlyRate),
            nightMultiplier: rate.nightMultiplier ? parseFloat(rate.nightMultiplier) : 1.5,
            weekendMultiplier: rate.weekendMultiplier ? parseFloat(rate.weekendMultiplier) : 1.3,
            holidayMultiplier: rate.holidayMultiplier ? parseFloat(rate.holidayMultiplier) : 1.5,
            emergencyMultiplier: rate.emergencyMultiplier ? parseFloat(rate.emergencyMultiplier) : 2.0,
          })) || []
        },
        slas: {
          create: slas?.map((sla: any) => ({
            priority: sla.priority,
            firstResponseMinutes: parseInt(sla.firstResponseMinutes),
            onSiteMinutes: parseInt(sla.onSiteMinutes),
            resolutionMinutes: parseInt(sla.resolutionMinutes),
            penaltyPercent: sla.penaltyPercent ? parseFloat(sla.penaltyPercent) : 0,
          })) || []
        }
      },
      include: {
        rates: true,
        slas: true
      }
    })

    return NextResponse.json(contract)
  } catch (error) {
    console.error('Error creating contract:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
