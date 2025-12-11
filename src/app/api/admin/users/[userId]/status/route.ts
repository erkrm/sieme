import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { isActive } = await request.json()
    const { userId } = params

    // Prevent admin from deactivating themselves
    if (userId === session.user.id) {
      return NextResponse.json({ error: 'No puedes desactivar tu propia cuenta' }, { status: 400 })
    }

    // Update user status
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { isActive }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating user status:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el estado del usuario' },
      { status: 500 }
    )
  }
}