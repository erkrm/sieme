'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  DollarSign, 
  FileText,
  Download,
  Calendar,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

interface OperationsReport {
  totalOrders: number
  completedOrders: number
  pendingOrders: number
  cancelledOrders: number
  avgResolutionTime: number
  ordersByCategory: { category: string; count: number }[]
  ordersByPriority: { priority: string; count: number }[]
}

interface TechniciansReport {
  totalTechnicians: number
  activeTechnicians: number
  technicianPerformance: {
    name: string
    ordersCompleted: number
    avgRating: number
    avgResolutionTime: number
  }[]
}

interface ProfitabilityReport {
  totalRevenue: number
  totalCosts: number
  profit: number
  profitMargin: number
  revenueByMonth: { month: string; revenue: number }[]
}

export default function ReportsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [operationsReport, setOperationsReport] = useState<OperationsReport | null>(null)
  const [techniciansReport, setTechniciansReport] = useState<TechniciansReport | null>(null)
  const [profitabilityReport, setProfitabilityReport] = useState<ProfitabilityReport | null>(null)
  const [dateRange, setDateRange] = useState({ start: '', end: '' })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated' && !['ADMIN', 'MANAGER'].includes(session?.user?.role || '')) {
      router.push('/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchReports()
    }
  }, [status])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const [opsRes, techRes, profitRes] = await Promise.all([
        fetch('/api/admin/reports/operations'),
        fetch('/api/admin/reports/technicians'),
        fetch('/api/admin/reports/profitability')
      ])

      if (opsRes.ok) setOperationsReport(await opsRes.json())
      if (techRes.ok) setTechniciansReport(await techRes.json())
      if (profitRes.ok) setProfitabilityReport(await profitRes.json())
    } catch (error) {
      console.error('Error fetching reports:', error)
      toast({ title: 'Error', description: 'No se pudieron cargar los reportes', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const exportOperationsPDF = () => {
    if (!operationsReport) return
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text('Reporte de Operaciones', 14, 22)
    doc.setFontSize(12)
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, 14, 32)
    
    const tableData = [
      ['Total Órdenes', operationsReport.totalOrders.toString()],
      ['Completadas', operationsReport.completedOrders.toString()],
      ['Pendientes', operationsReport.pendingOrders.toString()],
      ['Canceladas', operationsReport.cancelledOrders.toString()],
      ['Tiempo Promedio Resolución', `${operationsReport.avgResolutionTime.toFixed(1)}h`]
    ]
    
    ;(doc as any).autoTable({
      startY: 40,
      head: [['Métrica', 'Valor']],
      body: tableData
    })
    
    doc.save('reporte-operaciones.pdf')
    toast({ title: 'PDF Exportado', description: 'Reporte de operaciones descargado' })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Reportes y Análisis</h1>
            <p className="text-gray-500 text-sm hidden sm:block">Visualiza métricas y estadísticas del sistema</p>
          </div>
        </div>
        <Button size="sm" onClick={exportOperationsPDF}>
          <Download className="h-4 w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Exportar PDF</span>
          <span className="sm:hidden">PDF</span>
        </Button>
      </div>

      <Tabs defaultValue="operations">
        <TabsList className="overflow-x-auto flex-wrap">
          <TabsTrigger value="operations"><BarChart3 className="h-4 w-4 mr-1 sm:mr-2" /><span className="hidden sm:inline">Operaciones</span><span className="sm:hidden">Ops</span></TabsTrigger>
          <TabsTrigger value="technicians"><Users className="h-4 w-4 mr-1 sm:mr-2" /><span className="hidden sm:inline">Técnicos</span><span className="sm:hidden">Téc</span></TabsTrigger>
          <TabsTrigger value="profitability"><DollarSign className="h-4 w-4 mr-1 sm:mr-2" /><span className="hidden sm:inline">Rentabilidad</span><span className="sm:hidden">$</span></TabsTrigger>
        </TabsList>

        <TabsContent value="operations" className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <Card>
              <CardHeader className="pb-1 md:pb-2 p-3 md:p-6">
                <CardTitle className="text-xs md:text-sm text-gray-500">Total Órdenes</CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-6 pt-0">
                <p className="text-xl md:text-3xl font-bold">{operationsReport?.totalOrders || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-1 md:pb-2 p-3 md:p-6">
                <CardTitle className="text-xs md:text-sm text-gray-500">Completadas</CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-6 pt-0">
                <p className="text-xl md:text-3xl font-bold text-green-600">{operationsReport?.completedOrders || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-1 md:pb-2 p-3 md:p-6">
                <CardTitle className="text-xs md:text-sm text-gray-500">Pendientes</CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-6 pt-0">
                <p className="text-xl md:text-3xl font-bold text-yellow-600">{operationsReport?.pendingOrders || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-1 md:pb-2 p-3 md:p-6">
                <CardTitle className="text-xs md:text-sm text-gray-500">Tiempo Prom.</CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-6 pt-0">
                <p className="text-xl md:text-3xl font-bold text-blue-600">{operationsReport?.avgResolutionTime?.toFixed(1) || 0}h</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Órdenes por Categoría</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {operationsReport?.ordersByCategory?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span>{item.category}</span>
                      <span className="font-bold">{item.count}</span>
                    </div>
                  )) || <p className="text-gray-500">Sin datos</p>}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Órdenes por Prioridad</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {operationsReport?.ordersByPriority?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span>{item.priority}</span>
                      <span className="font-bold">{item.count}</span>
                    </div>
                  )) || <p className="text-gray-500">Sin datos</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="technicians" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500">Total Técnicos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{techniciansReport?.totalTechnicians || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500">Técnicos Activos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">{techniciansReport?.activeTechnicians || 0}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Rendimiento de Técnicos</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Técnico</th>
                    <th className="text-left p-2">Órdenes</th>
                    <th className="text-left p-2">Calificación</th>
                    <th className="text-left p-2">Tiempo Prom.</th>
                  </tr>
                </thead>
                <tbody>
                  {techniciansReport?.technicianPerformance?.map((tech, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="p-2">{tech.name}</td>
                      <td className="p-2">{tech.ordersCompleted}</td>
                      <td className="p-2">⭐ {tech.avgRating.toFixed(1)}</td>
                      <td className="p-2">{tech.avgResolutionTime.toFixed(1)}h</td>
                    </tr>
                  )) || <tr><td colSpan={4} className="text-center p-4 text-gray-500">Sin datos</td></tr>}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profitability" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500">Ingresos Totales</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(profitabilityReport?.totalRevenue || 0)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500">Costos Totales</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(profitabilityReport?.totalCosts || 0)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500">Utilidad</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(profitabilityReport?.profit || 0)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500">Margen</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-blue-600">{(profitabilityReport?.profitMargin || 0).toFixed(1)}%</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Ingresos por Mes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {profitabilityReport?.revenueByMonth?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span>{item.month}</span>
                    <span className="font-bold">{formatCurrency(item.revenue)}</span>
                  </div>
                )) || <p className="text-center text-gray-500">Sin datos de ingresos</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
