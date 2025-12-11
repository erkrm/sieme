'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import {
  BarChart3, PieChart, TrendingUp, Download, FileText,
  DollarSign, Wrench, User, Calendar, Package
} from 'lucide-react'
import { format, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  BarChart, Bar, LineChart, Line, PieChart as RePieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import * as XLSX from 'xlsx'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

interface ReportData {
  serviceCosts: {
    byCategory: { name: string; value: number }[]
    byMonth: { month: string; cost: number }[]
    trend: { month: string; current: number; previous: number }[]
  }
  assetMaintenance: {
    byAsset: { name: string; cost: number; frequency: number }[]
    upcoming: { asset: string; date: string; type: string }[]
  }
  technicianPerformance: {
    byTechnician: { name: string; completed: number; avgTime: number; rating: number }[]
  }
}

export default function ReportsPage() {
  const { data: session } = useSession()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [dateFrom, setDateFrom] = useState(format(subMonths(new Date(), 6), 'yyyy-MM-dd'))
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [selectedReport, setSelectedReport] = useState('service-costs')

  useEffect(() => {
    fetchReportData()
  }, [dateFrom, dateTo])

  const fetchReportData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (dateFrom) params.append('dateFrom', dateFrom)
      if (dateTo) params.append('dateTo', dateTo)

      const response = await fetch(`/api/client/reports?${params}`)
      
      if (response.ok) {
        const data = await response.json()
        setReportData(data)
      } else {
        throw new Error('Error al cargar datos')
      }
    } catch (error) {
      console.error('Error fetching report data:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del reporte.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const exportToExcel = () => {
    if (!reportData) return

    const wb = XLSX.utils.book_new()

    // Service Costs Sheet
    const serviceCostsWS = XLSX.utils.json_to_sheet(reportData.serviceCosts.byCategory)
    XLSX.utils.book_append_sheet(wb, serviceCostsWS, 'Costos por Categoría')

    // Monthly Costs Sheet
    const monthlyCostsWS = XLSX.utils.json_to_sheet(reportData.serviceCosts.byMonth)
    XLSX.utils.book_append_sheet(wb, monthlyCostsWS, 'Costos Mensuales')

    // Asset Maintenance Sheet
    const assetMaintenanceWS = XLSX.utils.json_to_sheet(reportData.assetMaintenance.byAsset)
    XLSX.utils.book_append_sheet(wb, assetMaintenanceWS, 'Mantenimiento de Activos')

    // Technician Performance Sheet
    const technicianWS = XLSX.utils.json_to_sheet(reportData.technicianPerformance.byTechnician)
    XLSX.utils.book_append_sheet(wb, technicianWS, 'Performance Técnicos')

    XLSX.writeFile(wb, `reporte-${format(new Date(), 'yyyy-MM-dd')}.xlsx`)

    toast({
      title: "Exportación exitosa",
      description: "El reporte se ha exportado a Excel.",
    })
  }

  const exportToPDF = () => {
    toast({
      title: "Generando PDF",
      description: "El reporte se está generando...",
    })
    // TODO: Implement PDF generation with jsPDF
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-96" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Reportes y Análisis</h1>
          <p className="text-muted-foreground mt-1">
            Análisis detallado de servicios, costos y rendimiento
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToExcel}>
            <Download className="h-4 w-4 mr-2" />
            Exportar Excel
          </Button>
          <Button variant="outline" onClick={exportToPDF}>
            <FileText className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
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
            <Button onClick={fetchReportData}>
              <Calendar className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Tabs */}
      <Tabs defaultValue="service-costs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="service-costs">
            <DollarSign className="h-4 w-4 mr-2" />
            Costos de Servicio
          </TabsTrigger>
          <TabsTrigger value="asset-maintenance">
            <Package className="h-4 w-4 mr-2" />
            Mantenimiento
          </TabsTrigger>
          <TabsTrigger value="technician-performance">
            <User className="h-4 w-4 mr-2" />
            Técnicos
          </TabsTrigger>
        </TabsList>

        {/* Service Costs Tab */}
        <TabsContent value="service-costs" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Costs by Category */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Costos por Categoría
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RePieChart>
                    <Pie
                      data={reportData?.serviceCosts.byCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: $${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {reportData?.serviceCosts.byCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value}`} />
                  </RePieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Monthly Costs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Costos Mensuales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData?.serviceCosts.byMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value}`} />
                    <Bar dataKey="cost" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Cost Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Tendencia de Costos (Actual vs Anterior)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={reportData?.serviceCosts.trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value}`} />
                  <Legend />
                  <Line type="monotone" dataKey="current" stroke="#3b82f6" name="Período Actual" strokeWidth={2} />
                  <Line type="monotone" dataKey="previous" stroke="#94a3b8" name="Período Anterior" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Summary Table */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen por Categoría</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium text-gray-600">Categoría</th>
                      <th className="text-right p-3 text-sm font-medium text-gray-600">Costo Total</th>
                      <th className="text-right p-3 text-sm font-medium text-gray-600">% del Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData?.serviceCosts.byCategory.map((item, index) => {
                      const total = reportData.serviceCosts.byCategory.reduce((sum, i) => sum + i.value, 0)
                      const percentage = (item.value / total * 100).toFixed(1)
                      return (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="p-3 font-medium">{item.name}</td>
                          <td className="p-3 text-right">${item.value.toLocaleString()}</td>
                          <td className="p-3 text-right">{percentage}%</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Asset Maintenance Tab */}
        <TabsContent value="asset-maintenance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Maintenance Costs by Asset */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Costos por Activo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData?.assetMaintenance.byAsset} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip formatter={(value) => `$${value}`} />
                    <Bar dataKey="cost" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Maintenance Frequency */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Frecuencia de Mantenimiento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData?.assetMaintenance.byAsset}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="frequency" fill="#f59e0b" name="Servicios" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Maintenance */}
          <Card>
            <CardHeader>
              <CardTitle>Mantenimientos Próximos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium text-gray-600">Activo</th>
                      <th className="text-left p-3 text-sm font-medium text-gray-600">Tipo</th>
                      <th className="text-left p-3 text-sm font-medium text-gray-600">Fecha Programada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData?.assetMaintenance.upcoming.map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="p-3 font-medium">{item.asset}</td>
                        <td className="p-3">{item.type}</td>
                        <td className="p-3">{format(new Date(item.date), 'dd MMMM yyyy', { locale: es })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Technician Performance Tab */}
        <TabsContent value="technician-performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Services Completed */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Servicios Completados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData?.technicianPerformance.byTechnician}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="completed" fill="#3b82f6" name="Completados" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Average Time */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Tiempo Promedio (horas)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData?.technicianPerformance.byTechnician}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avgTime" fill="#10b981" name="Horas" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium text-gray-600">Técnico</th>
                      <th className="text-center p-3 text-sm font-medium text-gray-600">Completados</th>
                      <th className="text-center p-3 text-sm font-medium text-gray-600">Tiempo Prom.</th>
                      <th className="text-center p-3 text-sm font-medium text-gray-600">Calificación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData?.technicianPerformance.byTechnician.map((tech, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="p-3 font-medium">{tech.name}</td>
                        <td className="p-3 text-center">{tech.completed}</td>
                        <td className="p-3 text-center">{tech.avgTime}h</td>
                        <td className="p-3 text-center">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            ⭐ {tech.rating}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
