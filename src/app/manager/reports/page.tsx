'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BarChart3, TrendingUp, Users, ClipboardList, Download, Calendar, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'

interface DashboardStats {
  totalOrders: number
  pendingOrders: number
  inProgressOrders: number
  completedOrders: number
  totalTechnicians: number
  availableTechnicians: number
  totalClients: number
  ordersThisWeek: number
}

interface WorkOrder {
  id: string
  orderNumber: string
  title: string
  status: string
  priority: string
  createdAt: string
  completedAt?: string
  technician?: { name: string }
  client?: { name: string }
}

interface TechnicianStats {
  id: string
  name: string
  completed: number
  pending: number
  inProgress: number
  rating: number
}

export default function ManagerReportsPage() {
  const { data: session, status } = useSession()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [orders, setOrders] = useState<WorkOrder[]>([])
  const [technicianStats, setTechnicianStats] = useState<TechnicianStats[]>([])
  const [period, setPeriod] = useState('month')

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData()
    }
  }, [status, period])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [statsRes, ordersRes, techsRes] = await Promise.all([
        fetch('/api/manager/stats'),
        fetch('/api/manager/work-orders'),
        fetch('/api/admin/hr/technicians')
      ])

      if (statsRes.ok) setStats(await statsRes.json())
      
      if (ordersRes.ok) {
        const data = await ordersRes.json()
        const allOrders = Array.isArray(data) ? data : data.orders || []
        
        // Filter by period
        const now = new Date()
        let startDate = new Date()
        if (period === 'week') startDate.setDate(now.getDate() - 7)
        else if (period === 'month') startDate.setMonth(now.getMonth() - 1)
        else if (period === 'quarter') startDate.setMonth(now.getMonth() - 3)
        else startDate.setFullYear(now.getFullYear() - 1)

        const filteredOrders = allOrders.filter((o: WorkOrder) => new Date(o.createdAt) >= startDate)
        setOrders(filteredOrders)
      }

      if (techsRes.ok) {
        const techs = await techsRes.json()
        // Calculate stats per technician
        const ordersRes2 = await fetch('/api/manager/work-orders')
        if (ordersRes2.ok) {
          const ordersData = await ordersRes2.json()
          const allOrders = Array.isArray(ordersData) ? ordersData : ordersData.orders || []
          
          const techStats = techs.map((t: any) => {
            const techOrders = allOrders.filter((o: any) => o.technicianId === t.userId)
            return {
              id: t.id,
              name: t.user?.name || 'N/A',
              completed: techOrders.filter((o: WorkOrder) => o.status === 'COMPLETED').length,
              pending: techOrders.filter((o: WorkOrder) => ['REQUESTED', 'SCHEDULED', 'PENDING'].includes(o.status)).length,
              inProgress: techOrders.filter((o: WorkOrder) => o.status === 'IN_PROGRESS').length,
              rating: 4.5 // Placeholder
            }
          })
          setTechnicianStats(techStats.sort((a: TechnicianStats, b: TechnicianStats) => b.completed - a.completed))
        }
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = () => {
    // Create CSV
    const headers = ['Orden', 'Título', 'Cliente', 'Técnico', 'Estado', 'Fecha']
    const rows = orders.map(o => [
      o.orderNumber,
      o.title,
      o.client?.name || 'N/A',
      o.technician?.name || 'Sin asignar',
      o.status,
      new Date(o.createdAt).toLocaleDateString('es-ES')
    ])
    
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reporte_ordenes_${period}.csv`
    a.click()
    
    toast({ title: 'Éxito', description: 'Reporte exportado correctamente' })
  }

  // Calculate metrics
  const completedOrders = orders.filter(o => o.status === 'COMPLETED')
  const completionRate = orders.length > 0 ? ((completedOrders.length / orders.length) * 100).toFixed(1) : 0

  if (loading) {
    return <Skeleton className="h-[600px]" />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Reportes</h1>
          <p className="text-gray-500">Análisis de operaciones y rendimiento</p>
        </div>
        <div className="flex gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Última Semana</SelectItem>
              <SelectItem value="month">Último Mes</SelectItem>
              <SelectItem value="quarter">Último Trimestre</SelectItem>
              <SelectItem value="year">Último Año</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />Exportar
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Órdenes del Período</p>
                <p className="text-3xl font-bold">{orders.length}</p>
              </div>
              <ClipboardList className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completadas</p>
                <p className="text-3xl font-bold text-green-600">{completedOrders.length}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tasa de Completitud</p>
                <p className="text-3xl font-bold text-purple-600">{completionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Técnicos Activos</p>
                <p className="text-3xl font-bold">{stats?.availableTechnicians || 0}</p>
              </div>
              <Users className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="operations">
        <TabsList>
          <TabsTrigger value="operations">Operaciones</TabsTrigger>
          <TabsTrigger value="technicians">Técnicos</TabsTrigger>
          <TabsTrigger value="status">Por Estado</TabsTrigger>
        </TabsList>

        <TabsContent value="operations">
          <div className="grid grid-cols-2 gap-6">
            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Estado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: 'Pendientes', count: orders.filter(o => ['REQUESTED', 'PENDING'].includes(o.status)).length, color: 'bg-yellow-500' },
                    { label: 'Programadas', count: orders.filter(o => o.status === 'SCHEDULED').length, color: 'bg-blue-500' },
                    { label: 'En Progreso', count: orders.filter(o => o.status === 'IN_PROGRESS').length, color: 'bg-purple-500' },
                    { label: 'Completadas', count: completedOrders.length, color: 'bg-green-500' },
                    { label: 'Canceladas', count: orders.filter(o => o.status === 'CANCELLED').length, color: 'bg-red-500' }
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                      <span className="flex-1">{item.label}</span>
                      <span className="font-semibold">{item.count}</span>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`${item.color} h-2 rounded-full`} 
                          style={{ width: `${orders.length > 0 ? (item.count / orders.length * 100) : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Priority Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Prioridad</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: 'Normal', count: orders.filter(o => o.priority === 'NORMAL').length, color: 'bg-gray-500' },
                    { label: 'Urgente', count: orders.filter(o => o.priority === 'URGENT').length, color: 'bg-orange-500' },
                    { label: 'Emergencia', count: orders.filter(o => o.priority === 'EMERGENCY').length, color: 'bg-red-500' }
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                      <span className="flex-1">{item.label}</span>
                      <span className="font-semibold">{item.count}</span>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`${item.color} h-2 rounded-full`} 
                          style={{ width: `${orders.length > 0 ? (item.count / orders.length * 100) : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="technicians">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Rendimiento de Técnicos</CardTitle>
              <CardDescription>Órdenes completadas, en progreso y pendientes por técnico</CardDescription>
            </CardHeader>
            <CardContent>
              {technicianStats.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay datos de técnicos</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Técnico</TableHead>
                      <TableHead className="text-center">Completadas</TableHead>
                      <TableHead className="text-center">En Progreso</TableHead>
                      <TableHead className="text-center">Pendientes</TableHead>
                      <TableHead className="text-center">Total</TableHead>
                      <TableHead>Rendimiento</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {technicianStats.map(tech => {
                      const total = tech.completed + tech.inProgress + tech.pending
                      const performance = total > 0 ? (tech.completed / total * 100).toFixed(0) : 0
                      return (
                        <TableRow key={tech.id}>
                          <TableCell className="font-medium">{tech.name}</TableCell>
                          <TableCell className="text-center">
                            <Badge className="bg-green-100 text-green-800">{tech.completed}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className="bg-purple-100 text-purple-800">{tech.inProgress}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className="bg-yellow-100 text-yellow-800">{tech.pending}</Badge>
                          </TableCell>
                          <TableCell className="text-center font-semibold">{total}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${performance}%` }}></div>
                              </div>
                              <span className="text-sm">{performance}%</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>Órdenes del Período</CardTitle>
              <CardDescription>Listado completo de órdenes en el período seleccionado</CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay órdenes en este período</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Orden</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Técnico</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Prioridad</TableHead>
                      <TableHead>Fecha</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.slice(0, 20).map(order => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <p className="font-mono">{order.orderNumber}</p>
                          <p className="text-sm text-gray-500">{order.title}</p>
                        </TableCell>
                        <TableCell>{order.client?.name || 'N/A'}</TableCell>
                        <TableCell>{order.technician?.name || 'Sin asignar'}</TableCell>
                        <TableCell>
                          <Badge className={
                            order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            order.status === 'IN_PROGRESS' ? 'bg-purple-100 text-purple-800' :
                            order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }>{order.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            order.priority === 'EMERGENCY' ? 'bg-red-100 text-red-800' :
                            order.priority === 'URGENT' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }>{order.priority}</Badge>
                        </TableCell>
                        <TableCell>{new Date(order.createdAt).toLocaleDateString('es-ES')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
