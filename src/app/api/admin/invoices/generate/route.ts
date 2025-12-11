import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { invoiceService } from '@/lib/invoice-service'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { workOrderId } = await req.json()

    if (!workOrderId) {
      return NextResponse.json({ error: 'Work order ID is required' }, { status: 400 })
    }

    const invoiceId = await invoiceService.generateInvoiceForWorkOrder(workOrderId)

    return NextResponse.json({ 
      success: true,
      invoiceId,
      message: 'Invoice generated successfully'
    })
  } catch (error: any) {
    console.error('Error generating invoice:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to generate invoice' 
    }, { status: 400 })
  }
}
