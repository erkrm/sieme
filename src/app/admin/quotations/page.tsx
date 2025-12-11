'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { FileText, Plus, ArrowLeft, Check, X, RefreshCw, Search, ChevronLeft, ChevronRight, FileDown, Filter } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from "@/hooks/use-toast"
import jsPDF from 'jspdf'
import 'jspdf-autotable'

interface Quotation {
  id: string
  workOrderId: string
  workOrder: {
    orderNumber: string
    title: string
    client: {
      name: string
    }
  }
  totalAmount: number
  status: string
  createdAt: string
}

export default function QuotationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedQuotations, setSelectedQuotations] = useState<string[]>([])
  const itemsPerPage = 10
  
  const [formData, setFormData] = useState({
    workOrderId: '',
    totalAmount: '',
    validUntil: '',
    items: '' // JSON string manually entered for simplicity in MVP
  })

  useEffect(() => {
    if (status === 'authenticated') {
      if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'MANAGER') {
        router.push('/')
      } else {
        fetchQuotations()
      }
    } else if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, session, router])

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      const response = await fetch('/api/quotations?all=true')
      if (response.ok) {
        const data = await response.json()
        setQuotations(data)
        setLastUpdated(new Date())
        
        if (isRefresh) {
          toast({
            title: "Datos actualizados",
            description: "Las cotizaciones se han actualizado correctamente.",
          })
        }
      } else {
        throw new Error('Failed to fetch quotations')
      }
    } catch (error) {
      console.error('Error fetching quotations:', error)
      toast({
        title: "Error al cargar datos",
        description: "Hubo un problema al cargar las cotizaciones.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const fetchQuotations = () => fetchData(false)

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...formData,
            items: JSON.parse(formData.items || '[]')
        })
      })

      if (response.ok) {
        setIsDialogOpen(false)
        setFormData({ workOrderId: '', totalAmount: '', validUntil: '', items: '' })
        fetchQuotations()
        toast({ title: "Cotización creada exitosamente" })
      } else {
        toast({ title: "Error al crear cotización", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error al crear cotización", variant: "destructive" })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800'
      case 'SENT': return 'bg-blue-100 text-blue-800'
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Filter and pagination logic
  const filteredQuotations = quotations.filter(quote => {
    const matchesSearch = 
      quote.workOrder?.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.workOrder?.client?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredQuotations.length / itemsPerPage)
  const paginatedQuotations = filteredQuotations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Bulk actions
  const toggleSelectAll = () => {
    if (selectedQuotations.length === paginatedQuotations.length) {
      setSelectedQuotations([])
    } else {
      setSelectedQuotations(paginatedQuotations.map(q => q.id))
    }
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()
    const selectedData = quotations.filter(q => selectedQuotations.includes(q.id))

    doc.setFontSize(18)
    doc.text('SIEME - Reporte de Cotizaciones', 14, 20)
    doc.setFontSize(10)
    doc.text(`Generado: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`, 14, 28)

    const tableData = selectedData.map(q => [
      q.workOrder?.orderNumber || 'N/A',
      q.workOrder?.client?.name || 'Unknown',
      `$${q.totalAmount.toFixed(2)}`,
      q.status,
      format(new Date(q.createdAt), 'dd/MM/yyyy', { locale: es })
    ])

    ;(doc as any).autoTable({
      startY: 35,
      head: [['Orden', 'Cliente', 'Monto', 'Estado', 'Fecha']],
      body: tableData,
    })

    doc.save(`cotizaciones_${format(new Date(), 'yyyyMMdd')}.pdf`)
    toast({
      title: "PDF generado",
      description: `Se exportaron ${selectedData.length} cotizaciones.`,
    })
  }
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.push('/admin/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <h1 className="text-2xl font-bold">Gestión de Cotizaciones</h1>
            </div>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push('/admin/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Gestión de Cotizaciones</h1>
              <p className="text-sm text-muted-foreground">Administra los presupuestos del sistema</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por orden o cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="DRAFT">Borrador</SelectItem>
                  <SelectItem value="SENT">Enviada</SelectItem>
                  <SelectItem value="APPROVED">Aprobada</SelectItem>
                  <SelectItem value="REJECTED">Rechazada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {selectedQuotations.length > 0 && (
                <Button variant="outline" onClick={handleExportPDF}>
                  <FileDown className="h-4 w-4 mr-2" />
                  Exportar ({selectedQuotations.length})
                </Button>
              )}
              <Button variant="outline" onClick={() => fetchData(true)} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Cotización
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Nueva Cotización</DialogTitle>
                    <DialogDescription>Genera un presupuesto para una orden existente</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="orderId">ID de Orden</Label>
                        <Input 
                            id="orderId" 
                            value={formData.workOrderId}
                            onChange={(e) => setFormData({...formData, workOrderId: e.target.value})}
                            placeholder="ID de la orden"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="amount">Monto Total</Label>
                        <Input 
                            id="amount" 
                            type="number"
                            value={formData.totalAmount}
                            onChange={(e) => setFormData({...formData, totalAmount: e.target.value})}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="date">Válida Hasta</Label>
                        <Input 
                            id="date" 
                            type="date"
                            value={formData.validUntil}
                            onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="items">Items (JSON)</Label>
                        <Input 
                            id="items" 
                            value={formData.items}
                            onChange={(e) => setFormData({...formData, items: e.target.value})}
                            placeholder='[{"desc": "Item 1", "price": 100}]'
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit}>Guardar</Button>
                </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>

        <Card>
          <CardHeader>
            <CardTitle>Cotizaciones Recientes</CardTitle>
            <CardDescription>Historial de presupuestos emitidos</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox 
                      checked={selectedQuotations.length === paginatedQuotations.length && paginatedQuotations.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Orden</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedQuotations.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedQuotations.includes(quote.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedQuotations([...selectedQuotations, quote.id])
                          } else {
                            setSelectedQuotations(selectedQuotations.filter(id => id !== quote.id))
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>{quote.workOrder?.orderNumber || 'N/A'}</div>
                      <div className="text-xs text-muted-foreground">{quote.workOrder?.title}</div>
                    </TableCell>
                    <TableCell>{quote.workOrder?.client?.name || 'Unknown'}</TableCell>
                    <TableCell>${quote.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(quote.status)} variant="outline">
                        {quote.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(quote.createdAt), 'dd/MM/yyyy', { locale: es })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedQuotations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No se encontraron cotizaciones
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredQuotations.length)} de {filteredQuotations.length} resultados
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm font-medium">
                Página {currentPage} de {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
