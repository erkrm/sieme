'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { FileText, Search, CheckCircle, XCircle, Clock, Eye, DollarSign, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  SENT: 'bg-blue-100 text-blue-800'
}

const statusLabels: Record<string, string> = {
  DRAFT: 'Borrador',
  PENDING: 'Pendiente',
  APPROVED: 'Aprobada',
  REJECTED: 'Rechazada',
  SENT: 'Enviada'
}

interface Quotation {
  id: string
  quotationNumber: string
  status: string
  totalAmount: number
  createdAt: string
  expirationDate?: string
  notes?: string
  workOrder?: {
    orderNumber: string
    title: string
    client?: { name: string }
  }
  items?: { description: string; quantity: number; unitPrice: number; total: number }[]
}

export default function ManagerQuotationsPage() {
  const { data: session, status } = useSession()
  const { toast } = useToast()
  
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [actionDialog, setActionDialog] = useState<{ open: boolean; action: 'approve' | 'reject' | null }>({ open: false, action: null })
  const [rejectReason, setRejectReason] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchQuotations()
    }
  }, [status])

  const fetchQuotations = async () => {
    try {
      const res = await fetch('/api/quotations')
      if (res.ok) {
        const data = await res.json()
        setQuotations(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async () => {
    if (!selectedQuotation || !actionDialog.action) return
    setProcessing(true)

    try {
      const res = await fetch(`/api/quotations/${selectedQuotation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: actionDialog.action === 'approve' ? 'APPROVED' : 'REJECTED',
          notes: actionDialog.action === 'reject' ? rejectReason : undefined
        })
      })

      if (res.ok) {
        toast({ 
          title: 'Éxito', 
          description: `Cotización ${actionDialog.action === 'approve' ? 'aprobada' : 'rechazada'} correctamente` 
        })
        fetchQuotations()
        setActionDialog({ open: false, action: null })
        setDetailOpen(false)
        setRejectReason('')
      } else {
        throw new Error('Error processing')
      }
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo procesar la acción', variant: 'destructive' })
    } finally {
      setProcessing(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount)
  }

  const filteredQuotations = quotations.filter(q => {
    const matchSearch = q.quotationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.workOrder?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.workOrder?.client?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = statusFilter === 'all' || q.status === statusFilter
    return matchSearch && matchStatus
  })

  const pendingCount = quotations.filter(q => q.status === 'PENDING').length
  const approvedCount = quotations.filter(q => q.status === 'APPROVED').length

  if (loading) {
    return <Skeleton className="h-[500px]" />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Cotizaciones</h1>
          <p className="text-gray-500">Gestión de cotizaciones de órdenes de trabajo</p>
        </div>
        <Button variant="outline" onClick={fetchQuotations}>
          <RefreshCw className="h-4 w-4 mr-2" />Actualizar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold">{quotations.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Aprobadas</p>
                <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Buscar cotización..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Estado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="PENDING">Pendientes</SelectItem>
                <SelectItem value="APPROVED">Aprobadas</SelectItem>
                <SelectItem value="REJECTED">Rechazadas</SelectItem>
                <SelectItem value="DRAFT">Borradores</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader><CardTitle>Cotizaciones ({filteredQuotations.length})</CardTitle></CardHeader>
        <CardContent>
          {filteredQuotations.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay cotizaciones</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cotización</TableHead>
                  <TableHead>Orden / Cliente</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotations.map(q => (
                  <TableRow key={q.id}>
                    <TableCell className="font-mono">{q.quotationNumber}</TableCell>
                    <TableCell>
                      <p className="font-medium">{q.workOrder?.orderNumber} - {q.workOrder?.title}</p>
                      <p className="text-sm text-gray-500">{q.workOrder?.client?.name}</p>
                    </TableCell>
                    <TableCell className="font-semibold">{formatCurrency(q.totalAmount)}</TableCell>
                    <TableCell><Badge className={statusColors[q.status]}>{statusLabels[q.status]}</Badge></TableCell>
                    <TableCell>{new Date(q.createdAt).toLocaleDateString('es-ES')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedQuotation(q); setDetailOpen(true); }}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {q.status === 'PENDING' && (
                          <>
                            <Button variant="ghost" size="sm" className="text-green-600" onClick={() => { setSelectedQuotation(q); setActionDialog({ open: true, action: 'approve' }); }}>
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600" onClick={() => { setSelectedQuotation(q); setActionDialog({ open: true, action: 'reject' }); }}>
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Cotización {selectedQuotation?.quotationNumber}
            </DialogTitle>
            <DialogDescription>
              {selectedQuotation?.workOrder?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Cliente</p>
                <p className="font-medium">{selectedQuotation?.workOrder?.client?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Estado</p>
                <Badge className={statusColors[selectedQuotation?.status || 'DRAFT']}>{statusLabels[selectedQuotation?.status || 'DRAFT']}</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Monto Total</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(selectedQuotation?.totalAmount || 0)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fecha Creación</p>
                <p>{selectedQuotation?.createdAt ? new Date(selectedQuotation.createdAt).toLocaleDateString('es-ES') : 'N/A'}</p>
              </div>
            </div>
            {selectedQuotation?.items && selectedQuotation.items.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Items</p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>P. Unitario</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedQuotation.items.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell>{formatCurrency(item.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {selectedQuotation?.notes && (
              <div>
                <p className="text-sm text-gray-500">Notas</p>
                <p className="text-sm">{selectedQuotation.notes}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            {selectedQuotation?.status === 'PENDING' && (
              <div className="flex gap-2">
                <Button variant="outline" className="text-red-600" onClick={() => setActionDialog({ open: true, action: 'reject' })}>
                  <XCircle className="h-4 w-4 mr-2" />Rechazar
                </Button>
                <Button className="bg-green-600 hover:bg-green-700" onClick={() => setActionDialog({ open: true, action: 'approve' })}>
                  <CheckCircle className="h-4 w-4 mr-2" />Aprobar
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Dialog */}
      <Dialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionDialog.action === 'approve' ? 'Aprobar' : 'Rechazar'} Cotización</DialogTitle>
            <DialogDescription>
              ¿Está seguro de {actionDialog.action === 'approve' ? 'aprobar' : 'rechazar'} la cotización {selectedQuotation?.quotationNumber}?
            </DialogDescription>
          </DialogHeader>
          {actionDialog.action === 'reject' && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Motivo del rechazo (opcional)</p>
              <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Ingrese el motivo..." />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog({ open: false, action: null })}>Cancelar</Button>
            <Button 
              className={actionDialog.action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              onClick={handleAction}
              disabled={processing}
            >
              {processing ? 'Procesando...' : actionDialog.action === 'approve' ? 'Aprobar' : 'Rechazar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
