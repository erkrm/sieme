import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Get invoices for revenue calculations
    const invoices = await db.invoice.findMany({
      where: {
        status: { in: ['PAID', 'PARTIALLY_PAID'] }
      },
      include: {
        payments: {
          select: {
            amount: true,
            paymentDate: true
          }
        }
      }
    })

    // Get work orders for cost estimations using budget and internalCost
    const workOrders = await db.workOrder.findMany({
      where: {
        status: { in: ['COMPLETED', 'INVOICED', 'CLOSED'] }
      },
      select: {
        budget: true,
        internalCost: true,
        createdAt: true
      }
    })

    // Calculate total revenue from invoices
    const totalRevenue = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0)

    // Estimate costs using internalCost when available, otherwise 30% of budget
    const totalCosts = workOrders.reduce((acc, wo) => {
      if (wo.internalCost && wo.internalCost > 0) {
        return acc + wo.internalCost
      }
      return acc + ((wo.budget || 0) * 0.3)
    }, 0)

    // Profit calculations
    const profit = totalRevenue - totalCosts
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0

    // Revenue by month (last 6 months)
    const now = new Date()
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
    
    const monthlyRevenue: Record<string, number> = {}
    
    // Initialize months
    for (let i = 0; i < 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' })
      monthlyRevenue[monthKey] = 0
    }

    // Sum payments by month
    invoices.forEach(inv => {
      inv.payments.forEach(payment => {
        const paymentDate = new Date(payment.paymentDate)
        if (paymentDate >= sixMonthsAgo) {
          const monthKey = paymentDate.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' })
          if (monthlyRevenue[monthKey] !== undefined) {
            monthlyRevenue[monthKey] += payment.amount
          }
        }
      })
    })

    const revenueByMonth = Object.entries(monthlyRevenue)
      .map(([month, revenue]) => ({ month, revenue }))
      .reverse()

    return NextResponse.json({
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalCosts: Math.round(totalCosts * 100) / 100,
      profit: Math.round(profit * 100) / 100,
      profitMargin: Math.round(profitMargin * 10) / 10,
      revenueByMonth
    })
  } catch (error) {
    console.error('Error fetching profitability report:', error)
    return NextResponse.json(
      { error: 'Error al obtener el reporte de rentabilidad' },
      { status: 500 }
    )
  }
}
