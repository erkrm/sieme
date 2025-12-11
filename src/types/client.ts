export interface WorkOrder {
  id: string
  orderNumber: string
  title: string
  status: string
  priority: string
  category: string
  requestedAt: string
  technician?: {
    name: string
  }
  service?: {
    name: string
  }
}

export interface Invoice {
  id: string
  invoiceNumber: string
  totalAmount: number
  status: string
  issuedAt: string
  dueDate?: string
}

export interface Asset {
  id: string
  name: string
  serialNumber?: string
  model?: string
  brand?: string
  status: string
  location?: {
    name: string
  } | string
  nextMaintenance?: string
  lastMaintenance?: string
  qrCode?: string
  installationDate?: string
}

export interface Quotation {
  id: string
  quotationNumber: string
  totalAmount: number
  status: string
  createdAt: string
  validUntil: string
  items: QuotationItem[]
}

export interface QuotationItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}
