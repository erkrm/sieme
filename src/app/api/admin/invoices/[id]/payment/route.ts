import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { invoiceService } from '@/lib/invoice-service'

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session || !['ADMIN', 'MANAGER', 'FINANCE'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { amount, method, reference } = await req.json()

    if (!amount || !method) {
      return NextResponse.json({ error: 'Amount and method are required' }, { status: 400 })
    }

    await invoiceService.recordPayment(params.id, parseFloat(amount), method, reference)

    return NextResponse.json({ 
      success: true,
      message: 'Payment recorded successfully'
    })
  } catch (error: any) {
    console.error('Error recording payment:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to record payment' 
    }, { status: 400 })
  }
}
