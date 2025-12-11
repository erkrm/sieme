'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import {
  Calendar, DollarSign, TrendingUp, Package, Download,
  FileText, Filter, Search, RefreshCw, CheckCircle,
  Clock, User, Wrench, BarChart3, PieChart
} from 'lucide-react'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { es } from 'date-fns/locale'
import { LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface ServiceHistory {
  id: string
  orderNumber: string
  title: string
  description: string
  category: string
  status: 'COMPLETED' | 'CANCELLED'
  priority: string
  createdAt: string
  completedAt?: string
  technician: {
    id: string
    name: string
  }
  asset?: {
    id: string
    name: string
  }
  cost: {
    labor: number
    materials: number
    total: number
  }
  duration?: number
}

interface HistoryStats {
  totalServices: number
  totalSpending: number
  averageCost: number
  servicesByCategory: Record<string, number>
  monthlyServices: { month: string; count: number }[]
  monthlySpending: { month: string; amount: number }[]
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function ServiceHistoryPage() {
  const { data: session } = useSession()
  const { toast } = useToast()

  const [services, setServices] = useState<ServiceHistory[]>([])
  const [stats, setStats] = useState<HistoryStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState(format(subMonths(new Date(), 6), 'yyyy-MM-dd'))
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'))

  useEffect(() => {
    fetchServiceHistory()
  }, [dateFrom, dateTo, categoryFilter])

  const fetchServiceHistory = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      // Fetch service history
      const params = new URLSearchParams({
        dateFrom,
        dateTo,
        ...(categoryFilter !== 'all' && { category: categoryFilter })
      })

      const response = await fetch(`/api/client/work-orders?${params}`)
      if (response.ok) {
        const data = await response.json()
        // Filter only completed or cancelled services
        const completedServices = data.filter((s: any) => 
          s.status === 'COMPLETED' || s.status === 'CANCELLED'
        )
        setServices(completedServices)
        
        // Calculate stats
        calculateStats(completedServices)

        if (isRefresh) {
          toast({
            title: "Historial actualizado",
            description: "Los datos se han actualizado correctamente.",
          })
        }
      }
    } catch (error) {
      console.error('Error fetching service history:', error)
      toast({
        title: "Error",
        description: "No se pudo cargar el historial de servicios.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const calculateStats = (servicesList: ServiceHistory[]) => {
    const totalServices = servicesList.length
    const totalSpending = servicesList.reduce((sum, s) => sum + (s.cost?.total || 0), 0)
    const averageCost = totalServices > 0 ? totalSpending / totalServices : 0

    // Services by category
    const servicesByCategory: Record<string, number> = {}
    servicesList.forEach(s => {
      servicesByCategory[s.category] = (servicesByCategory[s.category] || 0) + 1
    })

    // Monthly aggregations
    const monthlyData: Record<string, { count: number; spending: number }> = {}
    servicesList.forEach(s => {
      const month = format(new Date(s.createdAt), 'MMM yyyy', { locale: es })
      if (!monthlyData[month]) {
        monthlyData[month] = { count: 0, spending: 0 }
      }
      monthlyData[month].count++
      monthlyData[month].spending += s.cost?.total || 0
    })

    const monthlyServices = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      count: data.count
    }))

    const monthlySpending = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      amount: data.spending
    }))

    setStats({
      totalServices,
      totalSpending,
      averageCost,
      servicesByCategory,
      monthlyServices,
      monthlySpending
    })
  }

  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const matchesSearch = searchTerm === '' || 
        service.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase())
      
      return matchesSearch
    })
  }, [services, searchTerm])

  const categoryChartData = useMemo(() => {
    if (!stats) return []
    return Object.entries(stats.servicesByCategory).map(([name, value]) => ({
      name,
      value
    }))
  }, [stats])

  const exportToCSV = () => {
    const headers = ['Orden', 'Título', 'Categoría', 'Estado', 'Fecha', 'Técnico', 'Costo']
    const rows = filteredServices.map(s => [
      s.orderNumber,
      s.title,
      s.category,
      s.status,
      format(new Date(s.createdAt), 'dd/MM/yyyy'),
      s.technician.name,
      `$${s.cost?.total || 0}`
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `historial-servicios-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()

    toast({
      title: "Exportación exitosa",
      description: "El historial se ha exportado a CSV.",
    })
  }

  const getStatusBadge = (status: string) => {
    if (status === 'COMPLETED') {
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Completado</Badge>
    }
    return <Badge className="bg-gray-100 text-gray-800">Cancelado</Badge>
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
          <h1 className="text-3xl font-bold">Historial de Servicios</h1>
          <p className="text-muted-foreground mt-1">
            Revisa todos tus servicios completados y estadísticas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          <Button variant="outline" onClick={() => fetchServiceHistory(true)} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Servicios</p>
                  <p className="text-2xl font-bold">{stats.totalServices}</p>
                </div>
                <Wrench className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Gasto Total</p>
                  <p className="text-2xl font-bold">${stats.totalSpending.toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Costo Promedio</p>
                  <p className="text-2xl font-bold">${stats.averageCost.toFixed(2)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Categorías</p>
                  <p className="text-2xl font-bold">{Object.keys(stats.servicesByCategory).length}</p>
                </div>
                <Package className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      {stats && stats.monthlySpending.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Spending Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Gastos Mensuales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.monthlySpending}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value}`} />
                  <Bar dataKey="amount" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Services by Category Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Servicios por Categoría
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RePieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
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
                  placeholder="Orden, título..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="MANTENIMIENTO">Mantenimiento</SelectItem>
                  <SelectItem value="REPARACION">Reparación</SelectItem>
                  <SelectItem value="INSTALACION">Instalación</SelectItem>
                  <SelectItem value="INSPECCION">Inspección</SelectItem>
                  <SelectItem value="EMERGENCIA">Emergencia</SelectItem>
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

      {/* Service Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Timeline de Servicios ({filteredServices.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredServices.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No hay servicios en este período</p>
              <p className="text-sm">Ajusta los filtros para ver más resultados</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredServices.map((service, index) => (
                <div key={service.id}>
                  <div className="flex gap-4">
                    {/* Timeline indicator */}
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${service.status === 'COMPLETED' ? 'bg-green-500' : 'bg-gray-400'}`} />
                      {index < filteredServices.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-200 my-1" />
                      )}
                    </div>

                    {/* Service card */}
                    <Card className="flex-1 mb-4">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-lg">{service.title}</h4>
                              {getStatusBadge(service.status)}
                              {getPriorityBadge(service.priority)}
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500">Orden</p>
                                <p className="font-medium">{service.orderNumber}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Categoría</p>
                                <p className="font-medium">{service.category}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Técnico</p>
                                <p className="font-medium flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {service.technician.name}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500">Fecha</p>
                                <p className="font-medium flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {format(new Date(service.createdAt), 'dd MMM yyyy', { locale: es })}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end justify-between">
                            <div className="text-right">
                              <p className="text-sm text-gray-500">Costo Total</p>
                              <p className="text-2xl font-bold text-blue-600">
                                ${service.cost?.total?.toFixed(2) || '0.00'}
                              </p>
                            </div>
                            {service.duration && (
                              <p className="text-xs text-gray-500">
                                Duración: {service.duration}h
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
