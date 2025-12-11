'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { Alert, AlertDescription } from '@/components/ui/alert'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Calendar,
  Wrench,
  User,
  Bell,
  LogOut,
  MessageSquare,
  DollarSign,
  TrendingUp,
  Settings,
  RefreshCw,
  Search,
  Filter,
  X,
  Menu,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Inbox,
  FileDown,
  Printer,
  WifiOff,
  AlertTriangle
} from 'lucide-react'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import ClientMessaging from '@/components/client-messaging'
import NotificationSystem from '@/components/notification-system'
import ClientAnalytics from '@/components/client-analytics'
import ServiceRequestCard from '@/components/client/ServiceRequestCard'

interface WorkOrder {
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

interface Invoice {
  id: string
  invoiceNumber: string
  totalAmount: number
  status: string
  issuedAt: string
  dueDate?: string
}

export default function ClientDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'status'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const itemsPerPage = 10
  const MAX_RETRIES = 3

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      fetchData()
    }
  }, [session])

  const fetchData = useCallback(async (isRefresh = false, retry = 0) => {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError(null)

    try {
      // Fetch work orders with timeout
      const ordersController = new AbortController()
      const ordersTimeout = setTimeout(() => ordersController.abort(), 10000)
      
      const ordersResponse = await fetch('/api/client/work-orders', {
        signal: ordersController.signal,
        headers: {
          'Cache-Control': 'no-cache',
        },
      })
      clearTimeout(ordersTimeout)

      if (!ordersResponse.ok) {
        if (ordersResponse.status === 404) {
          // No orders yet, set empty array
          setWorkOrders([])
        } else if (ordersResponse.status >= 500) {
          throw new Error('El servidor está experimentando problemas. Por favor intenta más tarde.')
        } else if (ordersResponse.status === 401) {
          throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.')
        } else {
          throw new Error('Error al cargar órdenes de trabajo')
        }
      } else {
        const ordersData = await ordersResponse.json()
        setWorkOrders(Array.isArray(ordersData) ? ordersData : [])
      }

      // Fetch invoices with timeout
      const invoicesController = new AbortController()
      const invoicesTimeout = setTimeout(() => invoicesController.abort(), 10000)
      
      const invoicesResponse = await fetch('/api/client/invoices', {
        signal: invoicesController.signal,
        headers: {
          'Cache-Control': 'no-cache',
        },
      })
      clearTimeout(invoicesTimeout)

      if (!invoicesResponse.ok) {
        if (invoicesResponse.status === 404) {
          setInvoices([])
        } else if (invoicesResponse.status >= 500) {
          throw new Error('Error al cargar facturas del servidor')
        } else {
          throw new Error('Error al cargar facturas')
        }
      } else {
        const invoicesData = await invoicesResponse.json()
        setInvoices(Array.isArray(invoicesData) ? invoicesData : [])
      }

      setLastUpdated(new Date())
      setRetryCount(0)
      setError(null)
      
      if (isRefresh) {
        toast({
          title: "✅ Datos actualizados",
          description: "La información se ha actualizado correctamente.",
        })
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      
      // Handle abort errors
      if (error instanceof Error && error.name === 'AbortError') {
        const errorMsg = 'La solicitud tardó demasiado. Verifica tu conexión.'
        setError(errorMsg)
        
        // Retry logic
        if (retry < MAX_RETRIES) {
          setRetryCount(retry + 1)
          toast({
            title: "⏱️ Reintentando...",
            description: `Intento ${retry + 1} de ${MAX_RETRIES}`,
          })
          setTimeout(() => fetchData(isRefresh, retry + 1), 2000 * (retry + 1))
          return
        }
        
        toast({
          title: "❌ Error de conexión",
          description: errorMsg,
          variant: "destructive",
        })
      } else {
        const errorMsg = error instanceof Error ? error.message : "Error desconocido al cargar datos"
        setError(errorMsg)
        
        // Retry for server errors
        if (retry < MAX_RETRIES && errorMsg.includes('servidor')) {
          setRetryCount(retry + 1)
          toast({
            title: "⏱️ Reintentando...",
            description: `Intento ${retry + 1} de ${MAX_RETRIES}`,
          })
          setTimeout(() => fetchData(isRefresh, retry + 1), 2000 * (retry + 1))
          return
        }
        
        toast({
          title: "❌ Error al cargar datos",
          description: errorMsg,
          variant: "destructive",
          action: retry < MAX_RETRIES ? (
            <Button variant="outline" size="sm" onClick={() => fetchData(isRefresh, retry + 1)}>
              Reintentar
            </Button>
          ) : undefined,
        })
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [toast, MAX_RETRIES])

  const handleRefresh = () => {
    fetchData(true)
  }

  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setStatusFilter('all')
    setPriorityFilter('all')
    setSortBy('date')
    setSortOrder('desc')
    setCurrentPage(1)
  }, [])

  const toggleSort = useCallback((field: 'date' | 'priority' | 'status') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }, [sortBy, sortOrder])

  const getPriorityValue = (priority: string) => {
    const values: Record<string, number> = {
      'URGENT': 4,
      'HIGH': 3,
      'MEDIUM': 2,
      'LOW': 1
    }
    return values[priority] || 0
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'REQUESTED': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'SCHEDULED': return 'bg-indigo-50 text-indigo-700 border-indigo-200'
      case 'IN_PROGRESS': return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'PENDING': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'COMPLETED': return 'bg-green-50 text-green-700 border-green-200'
      case 'INVOICED': return 'bg-orange-50 text-orange-700 border-orange-200'
      case 'CLOSED': return 'bg-slate-100 text-slate-700 border-slate-200'
      case 'CANCELLED': return 'bg-red-50 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'REQUESTED': return 'Solicitado'
      case 'SCHEDULED': return 'Programado'
      case 'IN_PROGRESS': return 'En Progreso'
      case 'PENDING': return 'En Espera'
      case 'COMPLETED': return 'Completado'
      case 'INVOICED': return 'Facturado'
      case 'CLOSED': return 'Cerrado'
      case 'CANCELLED': return 'Cancelado'
      default: return status
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'bg-gray-100 text-gray-800'
      case 'MEDIUM': return 'bg-blue-100 text-blue-800'
      case 'HIGH': return 'bg-orange-100 text-orange-800'
      case 'URGENT': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'NORMAL': return 'Normal'
      case 'URGENT': return 'Urgente'
      case 'EMERGENCY': return 'Emergencia'
      default: return priority
    }
  }

  // Optimized filtered and sorted data with useMemo
  const filteredAndSortedOrders = useMemo(() => {
    let filtered = workOrders.filter(order => {
      const matchesSearch = 
        order.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.category?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter
      const matchesPriority = priorityFilter === 'all' || order.priority === priorityFilter
      
      return matchesSearch && matchesStatus && matchesPriority
    })

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0
      
      if (sortBy === 'date') {
        comparison = new Date(a.requestedAt || 0).getTime() - new Date(b.requestedAt || 0).getTime()
      } else if (sortBy === 'priority') {
        comparison = getPriorityValue(a.priority) - getPriorityValue(b.priority)
      } else if (sortBy === 'status') {
        comparison = a.status.localeCompare(b.status)
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [workOrders, searchQuery, statusFilter, priorityFilter, sortBy, sortOrder])

  // Paginated data
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredAndSortedOrders.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredAndSortedOrders, currentPage, itemsPerPage])

  const totalPages = useMemo(() => {
    return Math.ceil(filteredAndSortedOrders.length / itemsPerPage)
  }, [filteredAndSortedOrders.length, itemsPerPage])

  // Statistics with useMemo
  const stats = useMemo(() => {
    const pending = workOrders.filter(o => o.status === 'PENDING').length
    const inProgress = workOrders.filter(o => o.status === 'IN_PROGRESS').length
    const completed = workOrders.filter(o => o.status === 'COMPLETED').length
    const total = workOrders.length
    
    return { pending, inProgress, completed, total }
  }, [workOrders])

  // Computed order lists for stats cards
  const activeOrders = useMemo(() => 
    workOrders.filter(o => ['REQUESTED', 'SCHEDULED', 'IN_PROGRESS', 'PENDING'].includes(o.status))
  , [workOrders])

  const completedOrders = useMemo(() => 
    workOrders.filter(o => ['COMPLETED', 'INVOICED', 'CLOSED'].includes(o.status))
  , [workOrders])

  const pendingInvoices = useMemo(() => 
    invoices.filter(i => ['DRAFT', 'SENT', 'OVERDUE'].includes(i.status))
  , [invoices])

  // Paginated active orders
  const paginatedActiveOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return activeOrders.slice(startIndex, startIndex + itemsPerPage)
  }, [activeOrders, currentPage, itemsPerPage])

  // Bulk Actions Logic
  const toggleSelectAll = useCallback(() => {
    if (selectedOrders.length === paginatedOrders.length) {
      setSelectedOrders([])
    } else {
      setSelectedOrders(paginatedOrders.map(o => o.id))
    }
  }, [selectedOrders.length, paginatedOrders])

  const toggleSelectOrder = useCallback((orderId: string) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId))
    } else {
      setSelectedOrders([...selectedOrders, orderId])
    }
  }, [selectedOrders])

  const handleExportPDF = () => {
    const doc = new jsPDF()
    
    const ordersToExport = workOrders.filter(o => selectedOrders.includes(o.id))
    if (ordersToExport.length === 0) return

    doc.setFontSize(18)
    doc.text('Reporte de Servicios - SIEME', 14, 22)
    doc.setFontSize(11)
    doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 30)

    const tableData = ordersToExport.map(order => [
      order.orderNumber,
      order.title,
      getStatusText(order.status),
      getPriorityText(order.priority),
      new Date(order.requestedAt).toLocaleDateString()
    ])

    // @ts-ignore
    doc.autoTable({
      head: [['No. Orden', 'Título', 'Estado', 'Prioridad', 'Fecha']],
      body: tableData,
      startY: 40,
    })

    doc.save('reporte-servicios.pdf')
    toast({
      title: "PDF Generado",
      description: "El reporte se ha descargado correctamente.",
    })
  }

  const handleExportCSV = () => {
    const ordersToExport = workOrders.filter(o => selectedOrders.includes(o.id))
    if (ordersToExport.length === 0) return

    const headers = ['No. Orden', 'Título', 'Estado', 'Prioridad', 'Fecha', 'Categoría', 'Técnico']
    const csvContent = [
      headers.join(','),
      ...ordersToExport.map(order => [
        order.orderNumber,
        `"${order.title}"`,
        getStatusText(order.status),
        getPriorityText(order.priority),
        new Date(order.requestedAt).toLocaleDateString(),
        order.category,
        order.technician?.name || 'N/A'
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'reporte-servicios.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast({
      title: "CSV Generado",
      description: "El archivo CSV se ha descargado correctamente.",
    })
  }

  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'all' || priorityFilter !== 'all'

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  // Error Boundary UI
  if (error && !loading) {
    return (
      <div className="flex items-center justify-center p-4 h-full">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-red-900">Error al cargar datos</CardTitle>
                <CardDescription className="text-red-700">
                  {error}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <WifiOff className="h-4 w-4" />
              <AlertDescription>
                {retryCount > 0 && (
                  <p className="mb-2">Intentos realizados: {retryCount}/{MAX_RETRIES}</p>
                )}
                <p>Verifica tu conexión a internet e intenta nuevamente.</p>
              </AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Button 
                onClick={() => fetchData(false, 0)} 
                className="flex-1"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Reintentar
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push('/')}
                className="flex-1"
              >
                Volver al inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Bienvenido, {session.user.name}
          </h1>
          <p className="text-muted-foreground">
            Gestiona tus solicitudes de servicio y seguimiento de trabajos
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          {loading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-4 rounded" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-12 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Servicios Activos</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeOrders.length}</div>
                  <p className="text-xs text-muted-foreground">En proceso actualmente</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completados</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completedOrders.length}</div>
                  <p className="text-xs text-muted-foreground">Servicios finalizados</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Facturas Pendientes</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingInvoices.length}</div>
                  <p className="text-xs text-muted-foreground">Por pagar</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Solicitudes</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{workOrders.length}</div>
                  <p className="text-xs text-muted-foreground">Histórico completo</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Last Updated */}
        {lastUpdated && (
          <div className="text-xs text-muted-foreground mb-4 text-right">
            Última actualización: {format(lastUpdated, "HH:mm:ss", { locale: es })}
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-8">
          <Link href="/client/work-orders/new" className="flex-1 sm:flex-initial">
            <Button className="w-full sm:w-auto flex items-center justify-center gap-2">
              <Plus className="h-4 w-4" />
              Nueva Solicitud
            </Button>
          </Link>
          <Link href="/client/assets" className="flex-1 sm:flex-initial">
            <Button variant="outline" className="w-full sm:w-auto flex items-center justify-center gap-2">
              <FileText className="h-4 w-4" />
              Mis Activos
            </Button>
          </Link>
          <Link href="/client/approvals" className="flex-1 sm:flex-initial">
            <Button variant="outline" className="w-full sm:w-auto flex items-center justify-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Aprobaciones
            </Button>
          </Link>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título o número de orden..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">Todos los estados</option>
                <option value="PENDING">Pendiente</option>
                <option value="ASSIGNED">Asignado</option>
                <option value="IN_PROGRESS">En Progreso</option>
                <option value="COMPLETED">Completado</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">Todas las prioridades</option>
                <option value="LOW">Baja</option>
                <option value="MEDIUM">Media</option>
                <option value="HIGH">Alta</option>
                <option value="URGENT">Urgente</option>
              </select>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters} className="flex items-center gap-2">
                  <X className="h-4 w-4" />
                  Limpiar
                </Button>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="text-sm text-muted-foreground flex items-center mr-2">Ordenar por:</span>
              <Button 
                variant={sortBy === 'date' ? 'secondary' : 'ghost'} 
                size="sm" 
                onClick={() => toggleSort('date')}
                className="text-xs"
              >
                Fecha {sortBy === 'date' && (sortOrder === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />)}
              </Button>
              <Button 
                variant={sortBy === 'priority' ? 'secondary' : 'ghost'} 
                size="sm" 
                onClick={() => toggleSort('priority')}
                className="text-xs"
              >
                Prioridad {sortBy === 'priority' && (sortOrder === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />)}
              </Button>
              <Button 
                variant={sortBy === 'status' ? 'secondary' : 'ghost'} 
                size="sm" 
                onClick={() => toggleSort('status')}
                className="text-xs"
              >
                Estado {sortBy === 'status' && (sortOrder === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />)}
              </Button>
            </div>
          </CardContent>
        </Card>



        {/* Bulk Actions Toolbar */}
        {selectedOrders.length > 0 && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-lg z-50 flex items-center gap-4 animate-in slide-in-from-bottom-10">
            <span className="text-sm font-medium">{selectedOrders.length} seleccionados</span>
            <div className="h-4 w-px bg-slate-700" />
            <Button variant="ghost" size="sm" onClick={handleExportPDF} className="text-white hover:text-white hover:bg-slate-800">
              <FileDown className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button variant="ghost" size="sm" onClick={handleExportCSV} className="text-white hover:text-white hover:bg-slate-800">
              <Download className="h-4 w-4 mr-2" />
              CSV
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelectedOrders([])} className="text-slate-400 hover:text-white hover:bg-slate-800">
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Tabs Content */}
        <Tabs defaultValue="activos" className="space-y-6">
          <TabsList>
            <TabsTrigger value="activos">Servicios Activos</TabsTrigger>
            <TabsTrigger value="historial">Historial</TabsTrigger>
            <TabsTrigger value="facturas">Facturas</TabsTrigger>
            <TabsTrigger value="reportes">Reportes</TabsTrigger>
          </TabsList>

          <TabsContent value="activos">
            <Card>
              <CardHeader>
                <CardTitle>Servicios Activos</CardTitle>
                <CardDescription>
                  Seguimiento de tus solicitudes en proceso
                </CardDescription>
              </CardHeader>
              <CardContent>
                {paginatedActiveOrders.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed">
                    <div className="bg-white p-4 rounded-full inline-block mb-4 shadow-sm">
                      <Inbox className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No hay servicios activos</h3>
                    <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                      {hasActiveFilters 
                        ? "No se encontraron resultados con los filtros actuales. Intenta limpiar los filtros."
                        : "No tienes solicitudes de servicio en proceso actualmente. ¡Crea una nueva solicitud para comenzar!"}
                    </p>
                    {hasActiveFilters ? (
                      <Button onClick={clearFilters} variant="outline">
                        Limpiar Filtros
                      </Button>
                    ) : (
                      <Link href="/client/work-orders/new">
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Crear Nueva Solicitud
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-md border">
                      <Checkbox 
                        checked={selectedOrders.length === paginatedActiveOrders.length && paginatedActiveOrders.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                      <span className="text-sm text-muted-foreground">Seleccionar todo en esta página</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {paginatedActiveOrders.map((order) => (
                        <div key={order.id} className="relative">
                          <div className="absolute top-4 left-4 z-10">
                            <Checkbox 
                              checked={selectedOrders.includes(order.id)}
                              onCheckedChange={() => toggleSelectOrder(order.id)}
                            />
                          </div>
                          <div className="pl-8">
                            <ServiceRequestCard 
                              request={order} 
                              onViewDetails={(id) => router.push(`/client/work-orders/${id}`)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-6">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                        >
                          Anterior
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          Página {currentPage} de {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                        >
                          Siguiente
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historial">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Servicios</CardTitle>
                <CardDescription>
                  Todas tus solicitudes de servicio
                </CardDescription>
              </CardHeader>
              <CardContent>
                {completedOrders.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed">
                    <div className="bg-white p-4 rounded-full inline-block mb-4 shadow-sm">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No hay historial</h3>
                    <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
                      Aún no has completado ningún servicio. Los servicios finalizados aparecerán aquí.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {completedOrders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-medium">{order.title}</h3>
                            <Badge className={getStatusColor(order.status)}>
                              {getStatusText(order.status)}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            #{order.orderNumber}
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Categoría:</span> {order.category}
                          </div>
                          <div>
                            <span className="font-medium">Técnico:</span> {order.technician?.name || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Completado:</span> {new Date(order.requestedAt).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                          <Link href={`/client/orden/${order.id}`}>
                            <Button variant="outline" size="sm">
                              Ver Detalles
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="facturas">
            <Card>
              <CardHeader>
                <CardTitle>Mis Facturas</CardTitle>
                <CardDescription>
                  Gestiona tus facturas y pagos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {invoices.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed">
                    <div className="bg-white p-4 rounded-full inline-block mb-4 shadow-sm">
                      <DollarSign className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No hay facturas</h3>
                    <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
                      Aún no tienes facturas generadas. Las facturas de tus servicios aparecerán aquí.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {invoices.map((invoice) => (
                      <div key={invoice.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-medium">{invoice.invoiceNumber}</h3>
                            <Badge className={
                              invoice.status === 'PAID' ? 'bg-green-100 text-green-800' : 
                              invoice.status === 'OVERDUE' ? 'bg-red-100 text-red-800' : 
                              'bg-blue-100 text-blue-800'
                            }>
                              {invoice.status === 'PAID' ? 'Pagada' : 
                               invoice.status === 'OVERDUE' ? 'Vencida' : 
                               'Pendiente'}
                            </Badge>
                          </div>
                          <div className="text-lg font-bold">
                            ${invoice.totalAmount.toFixed(2)}
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Emisión:</span> {new Date(invoice.issuedAt).toLocaleDateString()}
                          </div>
                          {invoice.dueDate && (
                            <div>
                              <span className="font-medium">Vencimiento:</span> {new Date(invoice.dueDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 mt-4">
                          <Link href={`/client/factura/${invoice.id}`}>
                            <Button variant="outline" size="sm">
                              Ver Factura
                            </Button>
                          </Link>
                          {invoice.status === 'SENT' && (
                            <Button size="sm">
                              Pagar Ahora
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reportes">
            <ClientAnalytics workOrders={workOrders} invoices={invoices} />
          </TabsContent>
        </Tabs>
    </div>
  )
}