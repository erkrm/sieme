import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, message } = body

    // Validation
    if (!firstName || !lastName || !email || !message) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    // Message length validation
    if (message.length < 10) {
      return NextResponse.json(
        { error: 'El mensaje debe tener al menos 10 caracteres' },
        { status: 400 }
      )
    }

    // Save to database
    const submission = await db.contactSubmission.create({
      data: {
        firstName,
        lastName,
        email,
        message,
        status: 'PENDING',
        source: 'LANDING_PAGE'
      }
    })

    // Log for debugging
    console.log('Contact form saved:', {
      id: submission.id,
      email: submission.email,
      timestamp: submission.createdAt
    })

    // TODO: Send email notification to admin
    // You can integrate with Resend, SendGrid, or Nodemailer here

    return NextResponse.json({
      success: true,
      message: 'Mensaje enviado exitosamente. Te contactaremos pronto.',
      submissionId: submission.id
    })
  } catch (error) {
    console.error('Error processing contact form:', error)
    return NextResponse.json(
      { error: 'Error al procesar el formulario. Por favor intenta de nuevo.' },
      { status: 500 }
    )
  }
}

// GET endpoint for admin to view submissions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')

    const whereClause: any = {}
    if (status && status !== 'all') {
      whereClause.status = status
    }

    const submissions = await db.contactSubmission.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    return NextResponse.json(submissions)
  } catch (error) {
    console.error('Error fetching contact submissions:', error)
    return NextResponse.json(
      { error: 'Error al obtener las solicitudes' },
      { status: 500 }
    )
  }
}

// PATCH endpoint to update status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, notes } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID requerido' },
        { status: 400 }
      )
    }

    const submission = await db.contactSubmission.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes })
      }
    })

    return NextResponse.json({
      success: true,
      submission
    })
  } catch (error) {
    console.error('Error updating contact submission:', error)
    return NextResponse.json(
      { error: 'Error al actualizar la solicitud' },
      { status: 500 }
    )
  }
}
