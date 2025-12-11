import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'CLIENT') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const category = searchParams.get('category')
    const status = searchParams.get('status')

    const whereClause: any = {
      clientId: session.user.id
    }

    if (dateFrom || dateTo) {
      whereClause.createdAt = {}
      if (dateFrom) {
        whereClause.createdAt.gte = new Date(dateFrom)
      }
      if (dateTo) {
        // Add one day to include the end date fully
        const endDate = new Date(dateTo)
        endDate.setDate(endDate.getDate() + 1)
        whereClause.createdAt.lt = endDate
      }
    }

    if (category && category !== 'all') {
      whereClause.category = category
    }

    if (status && status !== 'all') {
      whereClause.status = status
    }

    const workOrders = await db.workOrder.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        technician: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(workOrders)

  } catch (error) {
    console.error('Error fetching work orders:', error)
    return NextResponse.json(
      { error: 'Error al obtener las órdenes de trabajo' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'CLIENT') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const priority = formData.get('priority') as string
    const requiresQuote = formData.get('requiresQuote') === 'true'
    const serviceAddress = formData.get('serviceAddress') as string
    const contactPerson = formData.get('contactPerson') as string
    const contactPhone = formData.get('contactPhone') as string

    // Validate required fields
    if (!title || !description || !category || !serviceAddress || !contactPerson || !contactPhone) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Generate order number
    const orderNumber = `WO-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Handle file attachments (for now, just store file names)
    const attachments: string[] = []
    for (let i = 0; i < 10; i++) {
      const file = formData.get(`file_${i}`) as File
      if (file) {
        attachments.push(file.name)
      }
    }

    // Find Client Profile and Active Contract
    const clientProfile = await db.clientProfile.findUnique({
      where: { userId: session.user.id }
    })

    let contractId: string | null = null
    let slaFirstResponse: Date | null = null
    let slaOnSite: Date | null = null
    let slaResolution: Date | null = null

    if (clientProfile) {
      const activeContract = await db.contract.findFirst({
        where: {
          clientProfileId: clientProfile.id,
          status: 'ACTIVE',
          startDate: { lte: new Date() },
          OR: [
            { endDate: null },
            { endDate: { gte: new Date() } }
          ]
        },
        include: {
          slas: true
        }
      })

      if (activeContract) {
        contractId = activeContract.id
        
        // Calculate SLAs
        const slaConfig = activeContract.slas.find(s => s.priority === priority)
        if (slaConfig) {
          const now = new Date()
          slaFirstResponse = new Date(now.getTime() + slaConfig.firstResponseMinutes * 60000)
          slaOnSite = new Date(now.getTime() + slaConfig.onSiteMinutes * 60000)
          slaResolution = new Date(now.getTime() + slaConfig.resolutionMinutes * 60000)
        }
      }
    }

    // Create work order
    const workOrder = await db.workOrder.create({
      data: {
        orderNumber,
        title,
        description,
        category: category as any,
        priority: priority as any,
        requiresQuote,
        serviceAddress,
        contactPerson,
        contactPhone,
        clientId: session.user.id,
        contractId,
        status: 'REQUESTED', // New default status
        slaFirstResponse,
        slaOnSite,
        slaResolution,
        attachments: attachments.length > 0 ? JSON.stringify(attachments) : null
      },
      include: {
        client: {
          select: {
            name: true,
            email: true,
            clientProfile: {
              select: {
                companyName: true
              }
            }
          }
        }
      }
    })

    // Create notification for admins and managers
    const adminsAndManagers = await db.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'MANAGER']
        },
        isActive: true
      }
    })

    for (const user of adminsAndManagers) {
      await db.notification.create({
        data: {
          userId: user.id,
          title: 'Nueva Solicitud de Servicio',
          message: `El cliente ${workOrder.client.name} ha creado una nueva solicitud: ${title}`,
          type: 'NEW_ORDER',
          relatedId: workOrder.id
        }
      })
    }

    return NextResponse.json({
      message: 'Solicitud creada exitosamente',
      workOrder: {
        id: workOrder.id,
        orderNumber: workOrder.orderNumber,
        title: workOrder.title,
        status: workOrder.status
      }
    })

  } catch (error) {
    console.error('Error creating work order:', error)
    return NextResponse.json(
      { error: 'Error al crear la solicitud de servicio' },
      { status: 500 }
    )
  }
}