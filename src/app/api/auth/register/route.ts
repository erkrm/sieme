import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      email,
      password,
      role,
      phone,
      companyName,
      ruc,
      businessType,
      address,
      specialties,
      experience,
      employeeId,
      department
    } = body

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos', field: 'general' },
        { status: 400 }
      )
    }

    // Sanitize inputs
    const sanitizedName = name.trim()
    const sanitizedEmail = email.trim().toLowerCase()

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(sanitizedEmail)) {
      return NextResponse.json(
        { error: 'Formato de email inválido', field: 'email' },
        { status: 400 }
      )
    }

    // Password strength validation
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres', field: 'password' },
        { status: 400 }
      )
    }
    if (!/[A-Z]/.test(password)) {
      return NextResponse.json(
        { error: 'La contraseña debe contener al menos una mayúscula', field: 'password' },
        { status: 400 }
      )
    }
    if (!/[a-z]/.test(password)) {
      return NextResponse.json(
        { error: 'La contraseña debe contener al menos una minúscula', field: 'password' },
        { status: 400 }
      )
    }
    if (!/[0-9]/.test(password)) {
      return NextResponse.json(
        { error: 'La contraseña debe contener al menos un número', field: 'password' },
        { status: 400 }
      )
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      return NextResponse.json(
        { error: 'La contraseña debe contener al menos un carácter especial', field: 'password' },
        { status: 400 }
      )
    }

    // Role-specific validation
    if (role === 'CLIENT' && !companyName) {
      return NextResponse.json(
        { error: 'El nombre de la empresa es requerido para clientes', field: 'companyName' },
        { status: 400 }
      )
    }
    if (role === 'TECHNICIAN' && (!specialties || specialties.length === 0)) {
      return NextResponse.json(
        { error: 'Debes seleccionar al menos una especialidad', field: 'specialties' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: sanitizedEmail }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email ya está registrado. ¿Quieres iniciar sesión?', field: 'email' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await db.user.create({
      data: {
        name: sanitizedName,
        email: sanitizedEmail,
        password: hashedPassword,
        role,
        phone: phone?.trim() || null,
        clientProfile: role === 'CLIENT' ? {
          create: {
            companyName: companyName || '',
            ruc: ruc || '',
            businessType: businessType || '',
            address: address || '',
            industry: businessType || ''
          }
        } : undefined,
        technicianProfile: role === 'TECHNICIAN' ? {
          create: {
            employeeId: employeeId || '',
            isAvailable: true
          }
        } : undefined,
        managerProfile: role === 'MANAGER' ? {
          create: {
            employeeId: employeeId || '',
            department: department || ''
          }
        } : undefined
      },
      include: {
        clientProfile: true,
        technicianProfile: true,
        managerProfile: true
      }
    })

    // Create welcome notification
    await db.notification.create({
      data: {
        userId: user.id,
        title: '¡Bienvenido a TecniPro!',
        message: `Tu cuenta como ${role === 'CLIENT' ? 'cliente' : role === 'TECHNICIAN' ? 'técnico' : 'manager'} ha sido creada exitosamente.`,
        type: 'SYSTEM_ALERT'
      }
    })

    return NextResponse.json({
      message: 'Usuario creado exitosamente',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Error al registrar usuario' },
      { status: 500 }
    )
  }
}