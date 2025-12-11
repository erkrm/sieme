import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

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

    // In a real implementation, you would query the database using dateFrom and dateTo
    // For now, we return mock data consistent with the frontend expectations

    const reportData = {
      serviceCosts: {
        byCategory: [
          { name: 'Mantenimiento', value: 15000 },
          { name: 'Reparación', value: 25000 },
          { name: 'Instalación', value: 10000 },
          { name: 'Inspección', value: 5000 },
          { name: 'Emergencia', value: 8000 }
        ],
        byMonth: [
          { month: 'Ene', cost: 5000 },
          { month: 'Feb', cost: 7000 },
          { month: 'Mar', cost: 6500 },
          { month: 'Abr', cost: 8000 },
          { month: 'May', cost: 9500 },
          { month: 'Jun', cost: 11000 }
        ],
        trend: [
          { month: 'Ene', current: 5000, previous: 4500 },
          { month: 'Feb', current: 7000, previous: 6000 },
          { month: 'Mar', current: 6500, previous: 7500 },
          { month: 'Abr', current: 8000, previous: 7000 },
          { month: 'May', current: 9500, previous: 8500 },
          { month: 'Jun', current: 11000, previous: 9000 }
        ]
      },
      assetMaintenance: {
        byAsset: [
          { name: 'Compresor A1', cost: 5000, frequency: 4 },
          { name: 'Bomba B2', cost: 3500, frequency: 6 },
          { name: 'Motor C3', cost: 4200, frequency: 3 },
          { name: 'Generador D4', cost: 6800, frequency: 2 }
        ],
        upcoming: [
          { asset: 'Compresor A1', date: '2024-01-15', type: 'Preventivo' },
          { asset: 'Bomba B2', date: '2024-01-20', type: 'Inspección' },
          { asset: 'Motor C3', date: '2024-02-01', type: 'Preventivo' }
        ]
      },
      technicianPerformance: {
        byTechnician: [
          { name: 'Juan Pérez', completed: 45, avgTime: 3.5, rating: 4.8 },
          { name: 'María García', completed: 38, avgTime: 4.2, rating: 4.6 },
          { name: 'Carlos López', completed: 52, avgTime: 3.8, rating: 4.9 },
          { name: 'Ana Martínez', completed: 41, avgTime: 3.2, rating: 4.7 }
        ]
      }
    }

    return NextResponse.json(reportData)

  } catch (error) {
    console.error('Error fetching report data:', error)
    return NextResponse.json(
      { error: 'Error al obtener los datos del reporte' },
      { status: 500 }
    )
  }
}
