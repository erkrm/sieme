'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Clock, FileText, Loader2, AlertCircle } from 'lucide-react'

interface QuotationItem {
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
  items: QuotationItem[]
  createdAt: string
  workOrder: {
    orderNumber: string
    title: string
    description: string
  }
}

interface QuotationApprovalProps {
  quotationId: string
  onApproved?: () => void
  onRejected?: () => void
}

export default function QuotationApproval({ quotationId, onApproved, onRejected }: QuotationApprovalProps) {
  const [quotation, setQuotation] = useState<Quotation | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchQuotation()
  }, [quotationId])

  const fetchQuotation = async () => {
    try {
      const response = await fetch(`/api/quotations/${quotationId}`)
      if (response.ok) {
        const data = await response.json()
        setQuotation(data)
      } else {
        setError('No se pudo cargar la cotización')
      }
    } catch (error) {
      console.error('Error fetching quotation:', error)
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const response = await fetch(`/api/quotations/${quotationId}/approve`, {
        method: 'PUT'
      })

      if (response.ok) {
        setQuotation({ ...quotation!, status: 'APPROVED' })
        onApproved?.()
      } else {
        const data = await response.json()
        setError(data.error || 'Error al aprobar la cotización')
      }
    } catch (error) {
      console.error('Error approving quotation:', error)
      setError('Error de conexión')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setError('Por favor indique el motivo del rechazo')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const response = await fetch(`/api/quotations/${quotationId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason })
      })

      if (response.ok) {
        setQuotation({ ...quotation!, status: 'REJECTED' })
        onRejected?.()
      } else {
        const data = await response.json()
        setError(data.error || 'Error al rechazar la cotización')
      }
    } catch (error) {
      console.error('Error rejecting quotation:', error)
      setError('Error de conexión')
    } finally {
      setSubmitting(false)
      setShowRejectForm(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  if (error && !quotation) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!quotation) return null

  const getStatusBadge = () => {
    switch (quotation.status) {
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Aprobada</Badge>
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Rechazada</Badge>
      case 'SENT':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />Pendiente</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800"><FileText className="h-3 w-3 mr-1" />Borrador</Badge>
    }
  }

  const isActionable = quotation.status === 'SENT' || quotation.status === 'DRAFT'

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Cotización - Orden #{quotation.workOrder.orderNumber}</CardTitle>
            <p className="text-sm text-gray-500 mt-1">{quotation.workOrder.title}</p>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Items Table */}
        <div>
          <h3 className="font-semibold mb-3">Desglose de Costos</h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3">Descripción</th>
                  <th className="text-right p-3">Cantidad</th>
                  <th className="text-right p-3">Precio Unit.</th>
                  <th className="text-right p-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {quotation.items.map((item, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-3">{item.description}</td>
                    <td className="text-right p-3">{item.quantity}</td>
                    <td className="text-right p-3">${item.unitPrice.toFixed(2)}</td>
                    <td className="text-right p-3 font-medium">${item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t-2">
                <tr>
                  <td colSpan={3} className="p-3 text-right font-semibold">Total:</td>
                  <td className="p-3 text-right font-bold text-lg">${quotation.totalAmount.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Validity */}
        {quotation.validUntil && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>Válida hasta: {new Date(quotation.validUntil).toLocaleDateString()}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        {isActionable && !showRejectForm && (
          <div className="flex gap-3">
            <Button
              className="flex-1"
              onClick={handleApprove}
              disabled={submitting}
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
              Aprobar Cotización
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowRejectForm(true)}
              disabled={submitting}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Rechazar
            </Button>
          </div>
        )}

        {/* Reject Form */}
        {showRejectForm && (
          <div className="space-y-3 p-4 bg-gray-50 rounded">
            <h4 className="font-medium">Motivo del Rechazo</h4>
            <Textarea
              placeholder="Por favor indique por qué rechaza esta cotización..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={submitting}
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Confirmar Rechazo
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectForm(false)
                  setRejectReason('')
                  setError(null)
                }}
                disabled={submitting}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Status Message */}
        {quotation.status === 'APPROVED' && (
          <div className="bg-green-50 border border-green-200 rounded p-4 text-center">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-green-800 font-medium">Cotización Aprobada</p>
            <p className="text-sm text-green-700 mt-1">El trabajo será asignado a un técnico pronto</p>
          </div>
        )}

        {quotation.status === 'REJECTED' && (
          <div className="bg-red-50 border border-red-200 rounded p-4 text-center">
            <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <p className="text-red-800 font-medium">Cotización Rechazada</p>
            <p className="text-sm text-red-700 mt-1">Se notificará al equipo para revisar su solicitud</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
