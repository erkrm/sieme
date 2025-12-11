import { db } from '@/lib/db'

interface InvoiceCalculation {
  laborSubtotal: number
  materialsSubtotal: number
  otherCosts: number
  discountAmount: number
  taxAmount: number
  totalAmount: number
  items: {
    description: string
    quantity: number
    unitPrice: number
    total: number
  }[]
}

export class InvoiceService {
  private readonly TAX_RATE = 0.18 // 18% IGV Peru

  /**
   * Generate invoice for a completed work order
   */
  async generateInvoiceForWorkOrder(workOrderId: string): Promise<string> {
    // Get work order with all related data
    const workOrder = await db.workOrder.findUnique({
      where: { id: workOrderId },
      include: {
        client: {
          include: {
            clientProfile: true
          }
        },
        contract: {
          include: {
            rates: {
              include: {
                serviceCategory: true
              }
            }
          }
        },
        materials: {
          include: {
            product: true
          }
        },
        timeEntries: true
      }
    })

    if (!workOrder) {
      throw new Error('Work order not found')
    }

    if (workOrder.status !== 'COMPLETED') {
      throw new Error('Work order must be completed before invoicing')
    }

    // Check if invoice already exists
    const existingInvoice = await db.invoice.findFirst({
      where: {
        items: {
          some: {
            workOrderId: workOrderId
          }
        }
      }
    })

    if (existingInvoice) {
      throw new Error('Invoice already exists for this work order')
    }

    // Calculate invoice amounts
    const calculation = this.calculateInvoiceAmounts(workOrder)

    // Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber()

    // Create invoice
    const invoice = await db.invoice.create({
      data: {
        invoiceNumber,
        companyId: workOrder.client.clientProfile?.id,
        contractId: workOrder.contractId,
        status: 'DRAFT',
        issueDate: new Date(),
        dueDate: this.calculateDueDate(workOrder.contract?.paymentTerms || 30),
        subtotal: calculation.laborSubtotal + calculation.materialsSubtotal + calculation.otherCosts,
        taxAmount: calculation.taxAmount,
        discountAmount: calculation.discountAmount,
        totalAmount: calculation.totalAmount,
        items: {
          create: calculation.items.map(item => ({
            workOrderId: workOrder.id,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total
          }))
        }
      },
      include: {
        items: true
      }
    })

    // Update work order status to INVOICED
    await db.workOrder.update({
      where: { id: workOrderId },
      data: {
        status: 'INVOICED',
        totalCost: calculation.totalAmount
      }
    })

    return invoice.id
  }

  /**
   * Calculate invoice amounts from work order data
   */
  private calculateInvoiceAmounts(workOrder: any): InvoiceCalculation {
    const items: InvoiceCalculation['items'] = []
    let laborSubtotal = 0
    let materialsSubtotal = 0
    let otherCosts = 0

    // 1. Calculate labor costs from time entries
    if (workOrder.timeEntries && workOrder.timeEntries.length > 0) {
      const totalHours = workOrder.timeEntries.reduce((sum: number, entry: any) => {
        return sum + (entry.hours || 0)
      }, 0)

      // Get hourly rate from contract or use default
      let hourlyRate = 50 // Default rate
      if (workOrder.contract?.rates && workOrder.contract.rates.length > 0) {
        // Use the first rate as default (could be improved to match category)
        hourlyRate = workOrder.contract.rates[0].hourlyRate
      }

      laborSubtotal = totalHours * hourlyRate

      items.push({
        description: `Mano de obra - ${totalHours.toFixed(2)} horas`,
        quantity: totalHours,
        unitPrice: hourlyRate,
        total: laborSubtotal
      })
    }

    // 2. Calculate materials costs
    if (workOrder.materials && workOrder.materials.length > 0) {
      workOrder.materials.forEach((material: any) => {
        const unitPrice = material.unitPrice || material.product.sellingPrice || 0
        const total = material.quantity * unitPrice
        materialsSubtotal += total

        items.push({
          description: `Material: ${material.product.name}`,
          quantity: material.quantity,
          unitPrice: unitPrice,
          total: total
        })
      })
    }

    // 3. Add other costs if specified in work order
    if (workOrder.budget && workOrder.budget > 0) {
      // If there's a budget but no time entries, use budget as labor cost
      if (laborSubtotal === 0) {
        laborSubtotal = workOrder.budget
        items.push({
          description: 'Servicio técnico',
          quantity: 1,
          unitPrice: workOrder.budget,
          total: workOrder.budget
        })
      }
    }

    // Calculate subtotal
    const subtotal = laborSubtotal + materialsSubtotal + otherCosts

    // Apply discount from contract
    const discountPercent = workOrder.contract?.discountPercent || 0
    const discountAmount = subtotal * (discountPercent / 100)

    // Calculate tax (after discount)
    const taxableAmount = subtotal - discountAmount
    const taxAmount = taxableAmount * this.TAX_RATE

    // Calculate total
    const totalAmount = taxableAmount + taxAmount

    return {
      laborSubtotal,
      materialsSubtotal,
      otherCosts,
      discountAmount,
      taxAmount,
      totalAmount,
      items
    }
  }

  /**
   * Generate unique invoice number
   */
  private async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear()
    const month = String(new Date().getMonth() + 1).padStart(2, '0')
    
    // Count invoices this month
    const startOfMonth = new Date(year, new Date().getMonth(), 1)
    const endOfMonth = new Date(year, new Date().getMonth() + 1, 0)
    
    const count = await db.invoice.count({
      where: {
        issueDate: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    })

    const sequence = String(count + 1).padStart(4, '0')
    return `INV-${year}${month}-${sequence}`
  }

  /**
   * Calculate due date based on payment terms
   */
  private calculateDueDate(paymentTermsDays: number): Date {
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + paymentTermsDays)
    return dueDate
  }

  /**
   * Mark invoice as sent
   */
  async markInvoiceAsSent(invoiceId: string): Promise<void> {
    await db.invoice.update({
      where: { id: invoiceId },
      data: { status: 'SENT' }
    })
  }

  /**
   * Record payment for invoice
   */
  async recordPayment(
    invoiceId: string,
    amount: number,
    method: string,
    reference?: string
  ): Promise<void> {
    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        payments: true
      }
    })

    if (!invoice) {
      throw new Error('Invoice not found')
    }

    // Create payment record
    await db.payment.create({
      data: {
        invoiceId,
        amount,
        method: method as any,
        reference,
        paymentDate: new Date()
      }
    })

    // Calculate total paid
    const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0) + amount

    // Update invoice status
    let newStatus = invoice.status
    if (totalPaid >= invoice.totalAmount) {
      newStatus = 'PAID'
    } else if (totalPaid > 0) {
      newStatus = 'PARTIALLY_PAID'
    }

    await db.invoice.update({
      where: { id: invoiceId },
      data: { status: newStatus }
    })
  }
}

export const invoiceService = new InvoiceService()
