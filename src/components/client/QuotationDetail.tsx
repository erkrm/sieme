import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { 
  FileText, 
  Download, 
  Check, 
  X, 
  MessageSquare, 
  Calendar,
  DollarSign,
  Printer
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Quotation } from '@/types/client'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useState } from 'react'

interface QuotationDetailProps {
  quotation: Quotation
  onApprove?: (id: string, comments?: string) => void
  onReject?: (id: string, reason: string) => void
  onDownload?: (id: string) => void
}

export default function QuotationDetail({ 
  quotation, 
  onApprove, 
  onReject,
  onDownload 
}: QuotationDetailProps) {
  const [comment, setComment] = useState('')
  const [isRejecting, setIsRejecting] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'aprobada':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pending':
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'rejected':
      case 'rechazada':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleApprove = () => {
    onApprove?.(quotation.id, comment)
  }

  const handleReject = () => {
    if (!comment) {
      // In a real app, show error
      return
    }
    onReject?.(quotation.id, comment)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            Cotización #{quotation.quotationNumber}
            <Badge className={getStatusColor(quotation.status)}>
              {quotation.status}
            </Badge>
          </h2>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <Calendar className="h-4 w-4" />
            Emitida el {format(new Date(quotation.createdAt), "d 'de' MMMM, yyyy", { locale: es })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onDownload?.(quotation.id)}>
            <Download className="mr-2 h-4 w-4" />
            Descargar PDF
          </Button>
          <Button variant="outline" size="icon">
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalles del Servicio</CardTitle>
              <CardDescription>Desglose de items y costos</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50%]">Descripción</TableHead>
                    <TableHead className="text-right">Cant.</TableHead>
                    <TableHead className="text-right">Precio Unit.</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotation.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.description}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${item.total.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex flex-col gap-2 p-6 bg-slate-50">
              <div className="flex justify-between w-full text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>${(quotation.totalAmount * 0.84).toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-full text-sm">
                <span className="text-muted-foreground">IVA (16%):</span>
                <span>${(quotation.totalAmount * 0.16).toFixed(2)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between w-full font-bold text-lg">
                <span>Total:</span>
                <span>${quotation.totalAmount.toFixed(2)}</span>
              </div>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Términos y Condiciones</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Esta cotización es válida hasta el {format(new Date(quotation.validUntil), "d 'de' MMMM, yyyy", { locale: es })}.</li>
                <li>El tiempo de entrega comenzará a contar a partir de la recepción del anticipo.</li>
                <li>Los precios están sujetos a cambios sin previo aviso si no se confirma dentro del periodo de validez.</li>
                <li>Se requiere un 50% de anticipo para iniciar los trabajos.</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
              <CardDescription>Gestionar esta cotización</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {quotation.status.toLowerCase() === 'pending' && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Comentarios (Opcional)</label>
                    <Textarea 
                      placeholder="Añadir notas o razones..." 
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700" 
                      onClick={handleApprove}
                      disabled={isRejecting}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Aprobar
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="w-full" 
                      onClick={() => setIsRejecting(true)}
                      disabled={isRejecting}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Rechazar
                    </Button>
                  </div>
                  {isRejecting && (
                    <div className="bg-red-50 p-3 rounded-md border border-red-100 animate-in fade-in slide-in-from-top-2">
                      <p className="text-sm text-red-800 mb-2">
                        ¿Estás seguro? Debes proporcionar una razón para el rechazo.
                      </p>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="w-full"
                        onClick={handleReject}
                      >
                        Confirmar Rechazo
                      </Button>
                    </div>
                  )}
                </>
              )}
              
              {quotation.status.toLowerCase() !== 'pending' && (
                <div className="bg-slate-50 p-4 rounded-lg text-center">
                  <p className="text-muted-foreground">
                    Esta cotización ya ha sido {quotation.status.toLowerCase()}.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>¿Necesitas ayuda?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Si tienes dudas sobre los items o costos de esta cotización, puedes contactar directamente con el asesor asignado.
              </p>
              <Button variant="outline" className="w-full">
                <MessageSquare className="mr-2 h-4 w-4" />
                Contactar Asesor
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
