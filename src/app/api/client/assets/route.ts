import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    // Get client profile to find their locations
    const clientProfile = await db.clientProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        locations: {
          select: { id: true }
        }
      }
    })

    if (!clientProfile) {
      return NextResponse.json([])
    }

    // Build where clause - filter by client's company locations or company ID
    const whereClause: any = {
      OR: [
        // Assets linked to client's company (via companyId)
        { companyId: clientProfile.id },
        // Assets linked to client's work orders
        {
          workOrders: {
            some: {
              clientId: session.user.id
            }
          }
        }
      ]
    }

    // Add status filter
    if (status && status !== 'all') {
      whereClause.status = status
    }

    // Add search filter
    if (search) {
      whereClause.AND = [
        {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { brand: { contains: search, mode: 'insensitive' } },
            { model: { contains: search, mode: 'insensitive' } },
            { serialNumber: { contains: search, mode: 'insensitive' } },
            { qrCode: { contains: search, mode: 'insensitive' } }
          ]
        }
      ]
    }

    const assets = await db.asset.findMany({
      where: whereClause,
      include: {
        location: {
          select: {
            id: true,
            name: true
          }
        },
        workOrders: {
          where: {
            clientId: session.user.id
          },
          select: {
            id: true,
            orderNumber: true,
            title: true,
            status: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate additional stats for each asset
    const formattedAssets = assets.map(asset => {
      // Find last maintenance (completed work order)
      const completedOrders = asset.workOrders.filter(wo => wo.status === 'COMPLETED')
      const lastMaintenance = completedOrders.length > 0 
        ? completedOrders[0].createdAt.toISOString()
        : null

      return {
        id: asset.id,
        qrCode: asset.qrCode,
        name: asset.name,
        brand: asset.brand,
        model: asset.model,
        serialNumber: asset.serialNumber,
        status: 'OPERATIONAL', // Default status - could be calculated from last work order
        installationDate: asset.installationDate?.toISOString(),
        location: asset.location,
        lastMaintenance,
        nextMaintenance: null, // Could be calculated from maintenance schedule
        workOrders: asset.workOrders.map(wo => ({
          id: wo.id,
          orderNumber: wo.orderNumber,
          title: wo.title,
          status: wo.status,
          createdAt: wo.createdAt.toISOString()
        }))
      }
    })

    return NextResponse.json(formattedAssets)

  } catch (error) {
    console.error('Error fetching client assets:', error)
    return NextResponse.json(
      { error: 'Error al obtener los activos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { name, brand, model, serialNumber, locationId, installationDate } = body

    if (!name) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 })
    }

    // Get client profile
    const clientProfile = await db.clientProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!clientProfile) {
      return NextResponse.json({ error: 'Perfil de cliente no encontrado' }, { status: 404 })
    }

    // Create the asset linked to this client's company
    const asset = await db.asset.create({
      data: {
        name,
        brand,
        model,
        serialNumber,
        locationId,
        installationDate: installationDate ? new Date(installationDate) : null,
        companyId: clientProfile.id,
        qrCode: `ASSET-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`
      },
      include: {
        location: true
      }
    })

    return NextResponse.json({
      success: true,
      asset: {
        id: asset.id,
        name: asset.name,
        qrCode: asset.qrCode
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating asset:', error)
    return NextResponse.json(
      { error: 'Error al crear el activo' },
      { status: 500 }
    )
  }
}
