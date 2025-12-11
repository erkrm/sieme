'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import {
  FileText, Download, DollarSign, Calendar, AlertCircle,
  CheckCircle, Clock, XCircle, Search, Filter, RefreshCw,
  Eye, CreditCard, TrendingUp
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface InvoiceLineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface Invoice {
  id: string
  invoiceNumber: string
  workOrderId: string
  workOrder: {
    orderNumber: string
    title: string
  }
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED'
  issuedDate: string
  dueDate: string
  paidDate?: string
  subtotal: number
  tax: number
  total: number
  lineItems?: InvoiceLineItem[]
  notes?: string
}

interface InvoiceStats {
  totalInvoices: number
  totalPaid: number
  totalPending: number
  totalOverdue: number
  paymentsByMonth: { month: string; amount: number }[]
}

export default function InvoicesPage() {
  const { data: session } = useSession()
  const { toast } = useToast()

  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [stats, setStats] = useState<InvoiceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    fetchInvoices()
  }, [statusFilter, dateFrom, dateTo])

  const fetchInvoices = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (dateFrom) params.append('dateFrom', dateFrom)
      if (dateTo) params.append('dateTo', dateTo)

      const response = await fetch(`/api/client/invoices?${params}`)
      if (response.ok) {
        const data = await response.json()
        setInvoices(data)
        calculateStats(data)

        if (isRefresh) {
          toast({
            title: "Facturas actualizadas",
            description: "Los datos se han actualizado correctamente.",
          })
        }
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las facturas.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const calculateStats = (invoicesList: Invoice[]) => {
    const totalInvoices = invoicesList.length
    const totalPaid = invoicesList
      .filter(i => i.status === 'PAID')
      .reduce((sum, i) => sum + i.total, 0)
    const totalPending = invoicesList
      .filter(i => i.status === 'SENT')
      .reduce((sum, i) => sum + i.total, 0)
    const totalOverdue = invoicesList
      .filter(i => i.status === 'OVERDUE')
      .reduce((sum, i) => sum + i.total, 0)

    // Monthly payments
    const monthlyData: Record<string, number> = {}
    invoicesList
      .filter(i => i.status === 'PAID' && i.paidDate)
      .forEach(i => {
        const month = format(new Date(i.paidDate!), 'MMM yyyy', { locale: es })
        monthlyData[month] = (monthlyData[month] || 0) + i.total
      })

    const paymentsByMonth = Object.entries(monthlyData).map(([month, amount]) => ({
      month,
      amount
    }))

    setStats({
      totalInvoices,
      totalPaid,
      totalPending,
      totalOverdue,
      paymentsByMonth
    })
  }

  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      const matchesSearch = searchTerm === '' ||
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.workOrder.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.workOrder.title.toLowerCase().includes(searchTerm.toLowerCase())
      
      return matchesSearch
    })
  }, [invoices, searchTerm])

  const getStatusBadge = (status: string) => {
    const config = {
      PAID: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Pagada' },
      SENT: { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'Pendiente' },
      OVERDUE: { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Vencida' },
      DRAFT: { color: 'bg-gray-100 text-gray-800', icon: FileText, label: 'Borrador' },
      CANCELLED: { color: 'bg-gray-100 text-gray-800', icon: XCircle, label: 'Cancelada' }
    }
    const { color, icon: Icon, label } = config[status as keyof typeof config]
    return (
      <Badge className={color}>
        <Icon className="h-3 w-3 mr-1" />
        {label}
      </Badge>
    )
  }

  const viewInvoiceDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setDetailsOpen(true)
  }

  const downloadInvoicePDF = (invoice: Invoice) => {
    toast({
      title: "Descargando factura",
      description: `Generando PDF de factura ${invoice.invoiceNumber}...`,
    })
    // TODO: Implement PDF generation
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Facturas</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona y revisa todas tus facturas
          </p>
        </div>
        <Button variant="outline" onClick={() => fetchInvoices(true)} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Facturas</p>
                  <p className="text-2xl font-bold">{stats.totalInvoices}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pagado</p>
                  <p className="text-2xl font-bold text-green-600">${stats.totalPaid.toFixed(2)}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pendiente</p>
                  <p className="text-2xl font-bold text-blue-600">${stats.totalPending.toFixed(2)}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Vencido</p>
                  <p className="text-2xl font-bold text-red-600">${stats.totalOverdue.toFixed(2)}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payment History Chart */}
      {stats && stats.paymentsByMonth.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Historial de Pagos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.paymentsByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value}`} />
                <Bar dataKey="amount" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Número de factura..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="PAID">Pagadas</SelectItem>
                  <SelectItem value="SENT">Pendientes</SelectItem>
                  <SelectItem value="OVERDUE">Vencidas</SelectItem>
                  <SelectItem value="DRAFT">Borradores</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Desde</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Hasta</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Facturas ({filteredInvoices.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No hay facturas</p>
              <p className="text-sm">No se encontraron facturas con los filtros aplicados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Factura</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Orden</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Estado</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Fecha Emisión</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Vencimiento</th>
                    <th className="text-right p-3 text-sm font-medium text-gray-600">Total</th>
                    <th className="text-center p-3 text-sm font-medium text-gray-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice, index) => (
                    <tr key={invoice.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-3">
                        <p className="font-medium">{invoice.invoiceNumber}</p>
                        <p className="text-sm text-gray-600">{invoice.workOrder.title}</p>
                      </td>
                      <td className="p-3 text-sm">{invoice.workOrder.orderNumber}</td>
                      <td className="p-3">{getStatusBadge(invoice.status)}</td>
                      <td className="p-3 text-sm">
                        {format(new Date(invoice.issuedDate), 'dd MMM yyyy', { locale: es })}
                      </td>
                      <td className="p-3 text-sm">
                        {format(new Date(invoice.dueDate), 'dd MMM yyyy', { locale: es })}
                      </td>
                      <td className="p-3 text-right font-bold text-blue-600">
                        ${invoice.total.toFixed(2)}
                      </td>
                      <td className="p-3">
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewInvoiceDetails(invoice)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadInvoicePDF(invoice)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedInvoice && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>Factura {selectedInvoice.invoiceNumber}</span>
                  {getStatusBadge(selectedInvoice.status)}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Invoice Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Orden de Trabajo</p>
                    <p className="font-medium">{selectedInvoice.workOrder.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Título</p>
                    <p className="font-medium">{selectedInvoice.workOrder.title}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Fecha de Emisión</p>
                    <p className="font-medium">
                      {format(new Date(selectedInvoice.issuedDate), 'dd MMMM yyyy', { locale: es })}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Fecha de Vencimiento</p>
                    <p className="font-medium">
                      {format(new Date(selectedInvoice.dueDate), 'dd MMMM yyyy', { locale: es })}
                    </p>
                  </div>
                  {selectedInvoice.paidDate && (
                    <div>
                      <p className="text-gray-600">Fecha de Pago</p>
                      <p className="font-medium text-green-600">
                        {format(new Date(selectedInvoice.paidDate), 'dd MMMM yyyy', { locale: es })}
                      </p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Line Items */}
                {selectedInvoice.lineItems && selectedInvoice.lineItems.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Desglose de Costos</h4>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left p-3 text-sm font-medium text-gray-600">Descripción</th>
                            <th className="text-center p-3 text-sm font-medium text-gray-600">Cant.</th>
                            <th className="text-right p-3 text-sm font-medium text-gray-600">P. Unit.</th>
                            <th className="text-right p-3 text-sm font-medium text-gray-600">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedInvoice.lineItems.map((item, index) => (
                            <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="p-3 text-sm">{item.description}</td>
                              <td className="p-3 text-sm text-center">{item.quantity}</td>
                              <td className="p-3 text-sm text-right">${item.unitPrice.toFixed(2)}</td>
                              <td className="p-3 text-sm text-right font-medium">${item.total.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">${selectedInvoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Impuestos:</span>
                    <span className="font-medium">${selectedInvoice.tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-blue-600">${selectedInvoice.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Notes */}
                {selectedInvoice.notes && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">Notas</h4>
                      <p className="text-sm text-gray-600">{selectedInvoice.notes}</p>
                    </div>
                  </>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => downloadInvoicePDF(selectedInvoice)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar PDF
                  </Button>
                  {selectedInvoice.status === 'SENT' && (
                    <Button className="flex-1">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pagar Ahora
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
