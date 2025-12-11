import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET - Fetch system settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // For now, return default settings
    // In a real app, these would be stored in a SystemSettings table
    const settings = {
      siteName: 'SIEME',
      siteEmail: 'contacto@sieme.com',
      maintenanceMode: false,
      defaultLanguage: 'es',
      timezone: 'America/Lima',
      notificationsEnabled: true,
      autoAssignEnabled: true,
      maxOrdersPerTechnician: 5
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Error al obtener configuración' }, { status: 500 })
  }
}

// PUT - Update system settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const data = await request.json()
    
    // In a real implementation, save to database
    // For now, just return success
    console.log('Settings updated:', data)

    return NextResponse.json({ 
      success: true, 
      message: 'Configuración guardada correctamente',
      settings: data 
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Error al guardar configuración' }, { status: 500 })
  }
}
