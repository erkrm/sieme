'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FileText, DollarSign, Calendar, Loader2, Download, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useToast } from '@/hooks/use-toast'

interface Invoice {
  id: string
  invoiceNumber: string
  status: string
  issueDate: string
  dueDate: string
  subtotal: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  contract: {
    type: string
    clientProfile: {
      companyName: string
      ruc: string | null
    }
  } | null
  items: {
    id: string
    workOrder: {
      orderNumber: string
      title: string
    } | null
  }[]
  payments: {
    id: string
    amount: number
    paymentDate: string
  }[]
  _count: {
    items: number
    payments: number
  }
}

export default function InvoicesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchInvoices()
  }, [statusFilter])

  const fetchInvoices = async () => {
    try {
      const response = await fetch(`/api/admin/invoices?status=${statusFilter}`)
      if (response.ok) {
        const data = await response.json()
        setInvoices(data)
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las facturas",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge className="bg-green-500">Pagado</Badge>
      case 'PARTIALLY_PAID':
        return <Badge className="bg-blue-500">Pago Parcial</Badge>
      case 'SENT':
        return <Badge className="bg-indigo-500">Enviado</Badge>
      case 'OVERDUE':
        return <Badge variant="destructive">Vencido</Badge>
      case 'DRAFT':
        return <Badge variant="secondary">Borrador</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount)
  }

  const calculatePaidAmount = (invoice: Invoice) => {
    return invoice.payments.reduce((sum, payment) => sum + payment.amount, 0)
  }

  const calculateBalance = (invoice: Invoice) => {
    return invoice.totalAmount - calculatePaidAmount(invoice)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Gestión de Facturas</h1>
        <p className="text-slate-500 text-sm md:text-base">Administra las facturas generadas automáticamente.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Facturas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Pagadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {invoices.filter(i => i.status === 'PAID').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {invoices.filter(i => ['DRAFT', 'SENT'].includes(i.status)).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total a Cobrar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(
                invoices
                  .filter(i => i.status !== 'PAID')
                  .reduce((sum, i) => sum + calculateBalance(i), 0)
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <CardTitle className="text-lg">Facturas</CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="DRAFT">Borrador</SelectItem>
                <SelectItem value="SENT">Enviado</SelectItem>
                <SelectItem value="PARTIALLY_PAID">Pago Parcial</SelectItem>
                <SelectItem value="PAID">Pagado</SelectItem>
                <SelectItem value="OVERDUE">Vencido</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {invoices.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No hay facturas registradas.</p>
            </div>
          ) : (
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha Emisión</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Pagado</TableHead>
                  <TableHead>Saldo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>
                      <div>{invoice.contract?.clientProfile.companyName || 'N/A'}</div>
                      <div className="text-xs text-slate-500">{invoice.contract?.clientProfile.ruc}</div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(invoice.issueDate), 'dd MMM yyyy', { locale: es })}
                    </TableCell>
                    <TableCell>
                      {format(new Date(invoice.dueDate), 'dd MMM yyyy', { locale: es })}
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(invoice.totalAmount)}</TableCell>
                    <TableCell className="text-green-600">
                      {formatCurrency(calculatePaidAmount(invoice))}
                    </TableCell>
                    <TableCell className="text-orange-600 font-medium">
                      {formatCurrency(calculateBalance(invoice))}
                    </TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
