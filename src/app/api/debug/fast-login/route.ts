import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

// Endpoint de login ultra-optimizado para pruebas
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y password requeridos' },
        { status: 400 }
      )
    }

    // Consulta ultra-optimizada sin includes
    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        isActive: true
      }
    })

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'Usuario no encontrado o inactivo' },
        { status: 401 }
      )
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    // Obtener perfiles por separado si es necesario
    let clientProfile: { companyName: string } | null = null
    let technicianProfile: { employeeId: string | null; specialties: any[] } | null = null
    let managerProfile: { employeeId: string | null; department: string | null } | null = null

    if (user.role === 'CLIENT') {
      clientProfile = await db.clientProfile.findUnique({
        where: { userId: user.id },
        select: { companyName: true }
      })
    } else if (user.role === 'TECHNICIAN') {
      technicianProfile = await db.technicianProfile.findUnique({
        where: { userId: user.id },
        select: { employeeId: true, specialties: true }
      })
    } else if (user.role === 'MANAGER') {
      managerProfile = await db.managerProfile.findUnique({
        where: { userId: user.id },
        select: { employeeId: true, department: true }
      })
    }

    return NextResponse.json({
      message: 'Login exitoso',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        clientProfile,
        technicianProfile,
        managerProfile
      }
    })

  } catch (error) {
    console.error('Fast login error:', error)
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    )
  }
}