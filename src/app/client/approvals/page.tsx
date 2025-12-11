'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { 
  Loader2, FileText, Clock, CheckCircle, XCircle, 
  AlertTriangle, DollarSign, Calendar, User,
  MessageSquare, Download, RefreshCw, ChevronRight
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface QuotationItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface Quotation {
  id: string
  workOrderId: string
  status: string
  totalAmount: number
  validUntil?: string
  createdAt: string
  notes?: string
  items?: QuotationItem[]
  workOrder: {
    orderNumber: string
    title: string
    description: string
    category: string
    priority: string
  }
}

export default function ApprovalsPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [selectedQuotation, setSelectedQuotation] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [comment, setComment] = useState('')
  const [showCommentError, setShowCommentError] = useState(false)

  useEffect(() => {
    fetchPendingQuotations()
  }, [])

  const fetchPendingQuotations = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      const response = await fetch('/api/quotations')
      if (response.ok) {
        const data = await response.json()
        const filtered = data.filter((q: Quotation) => 
          q.status === 'SENT' || q.status === 'DRAFT' || q.status === 'APPROVED' || q.status === 'REJECTED'
        )
        setQuotations(filtered)
        
        if (isRefresh) {
          toast({
            title: "Datos actualizados",
            description: "Las cotizaciones se han actualizado.",
          })
        }
      }
    } catch (error) {
      console.error('Error fetching quotations:', error)
      toast({
        title: "Error al cargar cotizaciones",
        description: "No se pudieron cargar las cotizaciones.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [toast])

  const handleApprove = useCallback(async () => {
    if (!selectedQuotation) return

    setProcessing(true)
    try {
      const response = await fetch(`/api/quotations/${selectedQuotation}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: comment.trim() || undefined })
      })

      if (response.ok) {
        toast({
          title: "Cotización aprobada",
          description: "La cotización ha sido aprobada exitosamente.",
        })
        setComment('')
        setSelectedQuotation(null)
        fetchPendingQuotations()
      } else {
        throw new Error('Error al aprobar cotización')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo aprobar la cotización.",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }, [selectedQuotation, comment, toast, fetchPendingQuotations])

  const handleReject = useCallback(async () => {
    if (!selectedQuotation) return
    
    if (!comment.trim()) {
      setShowCommentError(true)
      toast({
        title: "Comentario requerido",
        description: "Debes proporcionar una razón para rechazar la cotización.",
        variant: "destructive",
      })
      return
    }

    setProcessing(true)
    try {
      const response = await fetch(`/api/quotations/${selectedQuotation}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: comment.trim() })
      })

      if (response.ok) {
        toast({
          title: "Cotización rechazada",
          description: "La cotización ha sido rechazada.",
        })
        setComment('')
        setShowCommentError(false)
        setSelectedQuotation(null)
        fetchPendingQuotations()
      } else {
        throw new Error('Error al rechazar cotización')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo rechazar la cotización.",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }, [selectedQuotation, comment, toast, fetchPendingQuotations])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SENT':
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Clock className="h-3 w-3 mr-1" />
            Pendiente
          </Badge>
        )
      case 'APPROVED':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Aprobada
          </Badge>
        )
      case 'REJECTED':
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Rechazada
          </Badge>
        )
      case 'DRAFT':
        return (
          <Badge className="bg-gray-100 text-gray-800">
            <FileText className="h-3 w-3 mr-1" />
            Borrador
          </Badge>
        )
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    const colors = {
      LOW: 'bg-gray-100 text-gray-800',
      MEDIUM: 'bg-blue-100 text-blue-800',
      HIGH: 'bg-orange-100 text-orange-800',
      URGENT: 'bg-red-100 text-red-800'
    }
    const labels = {
      LOW: 'Baja',
      MEDIUM: 'Media',
      HIGH: 'Alta',
      URGENT: 'Urgente'
    }
    return <Badge className={colors[priority as keyof typeof colors]}>{labels[priority as keyof typeof labels]}</Badge>
  }

  const selectedQuotationData = useMemo(() => 
    quotations.find(q => q.id === selectedQuotation),
    [quotations, selectedQuotation]
  )

  const pendingCount = useMemo(() => 
    quotations.filter(q => q.status === 'SENT').length,
    [quotations]
  )

  const approvedCount = useMemo(() => 
    quotations.filter(q => q.status === 'APPROVED').length,
    [quotations]
  )

  const rejectedCount = useMemo(() => 
    quotations.filter(q => q.status === 'REJECTED').length,
    [quotations]
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="lg:col-span-2 h-96" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Aprobaciones</h1>
          <p className="text-muted-foreground mt-1">
            {pendingCount > 0 
              ? `Tienes ${pendingCount} cotización${pendingCount > 1 ? 'es' : ''} pendiente${pendingCount > 1 ? 's' : ''} de revisión`
              : 'No tienes cotizaciones pendientes'}
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => fetchPendingQuotations(true)}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-blue-600">{pendingCount}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aprobadas</p>
                <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rechazadas</p>
                <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quotations List */}
        <div className="lg:col-span-1 space-y-3">
          {quotations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12 text-gray-500">
                <FileText className="h-16 w-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">No hay cotizaciones</p>
                <p className="text-sm text-center">Las cotizaciones pendientes aparecerán aquí</p>
              </CardContent>
            </Card>
          ) : (
            quotations.map((quotation) => (
              <Card
                key={quotation.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedQuotation === quotation.id ? 'border-blue-600 border-2 shadow-lg' : ''
                }`}
                onClick={() => setSelectedQuotation(quotation.id)}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">Orden #{quotation.workOrder.orderNumber}</h4>
                        <p className="text-sm text-gray-600 line-clamp-1">{quotation.workOrder.title}</p>
                      </div>
                      {getStatusBadge(quotation.status)}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Monto Total</p>
                        <p className="text-lg font-bold text-blue-600">
                          ${quotation.totalAmount.toFixed(2)}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{format(new Date(quotation.createdAt), 'dd MMM yyyy', { locale: es })}</span>
                      {quotation.validUntil && (
                        <span className="text-orange-600">
                          Válida hasta {format(new Date(quotation.validUntil), 'dd MMM', { locale: es })}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Quotation Detail */}
        <div className="lg:col-span-2">
          {selectedQuotationData ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">
                      Cotización - Orden #{selectedQuotationData.workOrder.orderNumber}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {selectedQuotationData.workOrder.title}
                    </CardDescription>
                  </div>
                  {getStatusBadge(selectedQuotationData.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Work Order Details */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Detalles de la Orden
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Categoría</p>
                        <p className="font-medium">{selectedQuotationData.workOrder.category}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Prioridad</p>
                        {getPriorityBadge(selectedQuotationData.workOrder.priority)}
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Descripción</p>
                      <p className="text-sm">{selectedQuotationData.workOrder.description}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Quotation Items */}
                {selectedQuotationData.items && selectedQuotationData.items.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Desglose de Costos
                    </h3>
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
                          {selectedQuotationData.items.map((item, index) => (
                            <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="p-3 text-sm">{item.description}</td>
                              <td className="p-3 text-sm text-center">{item.quantity}</td>
                              <td className="p-3 text-sm text-right">${item.unitPrice.toFixed(2)}</td>
                              <td className="p-3 text-sm text-right font-medium">${item.total.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-blue-50">
                          <tr>
                            <td colSpan={3} className="p-3 text-right font-semibold">Total:</td>
                            <td className="p-3 text-right font-bold text-lg text-blue-600">
                              ${selectedQuotationData.totalAmount.toFixed(2)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedQuotationData.notes && (
                  <div>
                    <h3 className="font-semibold mb-2">Notas</h3>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm">{selectedQuotationData.notes}</p>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Approval Section */}
                {selectedQuotationData.status === 'SENT' && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Comentarios (Opcional)
                    </h3>
                    <Textarea
                      placeholder="Agrega comentarios sobre esta cotización..."
                      value={comment}
                      onChange={(e) => {
                        setComment(e.target.value)
                        setShowCommentError(false)
                      }}
                      rows={4}
                      className={showCommentError ? 'border-red-500' : ''}
                    />
                    {showCommentError && (
                      <p className="text-sm text-red-500 mt-1">
                        Debes proporcionar una razón para rechazar la cotización
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Los comentarios son opcionales para aprobar, pero requeridos para rechazar
                    </p>

                    <div className="flex gap-3 mt-4">
                      <Button
                        onClick={handleReject}
                        variant="outline"
                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                        disabled={processing}
                      >
                        {processing ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-2" />
                        )}
                        Rechazar
                      </Button>
                      <Button
                        onClick={handleApprove}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        disabled={processing}
                      >
                        {processing ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Aprobar
                      </Button>
                    </div>
                  </div>
                )}

                {/* Status Message for Approved/Rejected */}
                {(selectedQuotationData.status === 'APPROVED' || selectedQuotationData.status === 'REJECTED') && (
                  <Alert className={selectedQuotationData.status === 'APPROVED' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
                    <AlertDescription className="flex items-center gap-2">
                      {selectedQuotationData.status === 'APPROVED' ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-green-900">Esta cotización ya ha sido aprobada.</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span className="text-red-900">Esta cotización ha sido rechazada.</span>
                        </>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 pt-4 border-t">
                  <div>
                    <p className="text-xs mb-1">Fecha de Creación</p>
                    <p className="font-medium text-gray-900">
                      {format(new Date(selectedQuotationData.createdAt), 'dd MMMM yyyy, HH:mm', { locale: es })}
                    </p>
                  </div>
                  {selectedQuotationData.validUntil && (
                    <div>
                      <p className="text-xs mb-1">Válida Hasta</p>
                      <p className="font-medium text-gray-900">
                        {format(new Date(selectedQuotationData.validUntil), 'dd MMMM yyyy', { locale: es })}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12 text-gray-500">
                <FileText className="h-16 w-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">Selecciona una cotización</p>
                <p className="text-sm">Haz clic en una cotización para ver los detalles</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
