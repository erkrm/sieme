'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  ClipboardList, 
  Users, 
  Building2, 
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Plus,
  ArrowRight,
  AlertCircle
} from 'lucide-react'

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
  scheduledDate: string | null
  client?: { name: string }
  technician?: { name: string }
}

const statusColors: Record<string, string> = {
  REQUESTED: 'bg-yellow-100 text-yellow-800',
  SCHEDULED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  PENDING: 'bg-orange-100 text-orange-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800'
}

const priorityColors: Record<string, string> = {
  NORMAL: 'bg-gray-100 text-gray-800',
  URGENT: 'bg-orange-100 text-orange-800',
  EMERGENCY: 'bg-red-100 text-red-800'
}

export default function ManagerDashboardPage() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentOrders, setRecentOrders] = useState<WorkOrder[]>([])
  const [urgentOrders, setUrgentOrders] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDashboardData()
    }
  }, [status])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, ordersRes] = await Promise.all([
        fetch('/api/manager/stats'),
        fetch('/api/manager/work-orders?limit=20')
      ])

      if (statsRes.ok) setStats(await statsRes.json())
      if (ordersRes.ok) {
        const data = await ordersRes.json()
        const orders = Array.isArray(data) ? data : data.orders || []
        setRecentOrders(orders.slice(0, 5))
        // Filter urgent/overdue orders
        setUrgentOrders(orders.filter((o: WorkOrder) => 
          o.priority === 'EMERGENCY' || o.priority === 'URGENT' || 
          (o.status !== 'COMPLETED' && o.status !== 'CANCELLED' && o.scheduledDate && new Date(o.scheduledDate) < new Date())
        ).slice(0, 5))
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    )
  }

  // Calculate percentages for chart
  const total = (stats?.pendingOrders || 0) + (stats?.inProgressOrders || 0) + (stats?.completedOrders || 0)
  const pendingPercent = total > 0 ? ((stats?.pendingOrders || 0) / total * 100).toFixed(0) : 0
  const inProgressPercent = total > 0 ? ((stats?.inProgressOrders || 0) / total * 100).toFixed(0) : 0
  const completedPercent = total > 0 ? ((stats?.completedOrders || 0) / total * 100).toFixed(0) : 0

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Bienvenido, {session?.user?.name}</h1>
          <p className="text-gray-500">Aquí está el resumen de hoy</p>
        </div>
        <Link href="/manager/work-orders/new">
          <Button><Plus className="h-4 w-4 mr-2" />Nueva Orden</Button>
        </Link>
      </div>

      {/* Alerts */}
      {urgentOrders.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Atención Requerida
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {urgentOrders.map(order => (
                <div key={order.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className={priorityColors[order.priority]}>{order.priority}</Badge>
                    <span className="font-mono text-sm">{order.orderNumber}</span>
                    <span className="text-gray-600">{order.title}</span>
                  </div>
                  <Link href={`/manager/work-orders/${order.id}`}>
                    <Button size="sm" variant="outline">Ver</Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/manager/work-orders">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Órdenes Totales</p>
                  <p className="text-3xl font-bold">{stats?.totalOrders || 0}</p>
                  <p className="text-xs text-blue-600 mt-1">+{stats?.ordersThisWeek || 0} esta semana</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <ClipboardList className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pendientes</p>
                <p className="text-3xl font-bold text-yellow-600">{stats?.pendingOrders || 0}</p>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                  <div className="bg-yellow-500 h-1.5 rounded-full" style={{width: `${pendingPercent}%`}}></div>
                </div>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">En Progreso</p>
                <p className="text-3xl font-bold text-purple-600">{stats?.inProgressOrders || 0}</p>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                  <div className="bg-purple-500 h-1.5 rounded-full" style={{width: `${inProgressPercent}%`}}></div>
                </div>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completadas</p>
                <p className="text-3xl font-bold text-green-600">{stats?.completedOrders || 0}</p>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{width: `${completedPercent}%`}}></div>
                </div>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/manager/technicians">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Técnicos</p>
                  <p className="text-2xl font-bold">{stats?.totalTechnicians || 0}</p>
                  <p className="text-sm text-green-600">{stats?.availableTechnicians || 0} disponibles</p>
                </div>
                <Users className="h-10 w-10 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/manager/clients">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Clientes</p>
                  <p className="text-2xl font-bold">{stats?.totalClients || 0}</p>
                </div>
                <Building2 className="h-10 w-10 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Esta Semana</p>
                <p className="text-2xl font-bold">{stats?.ordersThisWeek || 0}</p>
                <p className="text-sm text-blue-600">órdenes nuevas</p>
              </div>
              <Calendar className="h-10 w-10 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Órdenes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-8">
              {/* Simple Donut-like visualization */}
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="56" fill="none" stroke="#e5e7eb" strokeWidth="16" />
                  <circle cx="64" cy="64" r="56" fill="none" stroke="#22c55e" strokeWidth="16" 
                    strokeDasharray={`${Number(completedPercent) * 3.52} 352`} />
                  <circle cx="64" cy="64" r="56" fill="none" stroke="#a855f7" strokeWidth="16"
                    strokeDasharray={`${Number(inProgressPercent) * 3.52} 352`} 
                    strokeDashoffset={`${-Number(completedPercent) * 3.52}`} />
                  <circle cx="64" cy="64" r="56" fill="none" stroke="#eab308" strokeWidth="16"
                    strokeDasharray={`${Number(pendingPercent) * 3.52} 352`}
                    strokeDashoffset={`${-(Number(completedPercent) + Number(inProgressPercent)) * 3.52}`} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold">{total}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Pendientes: {stats?.pendingOrders || 0} ({pendingPercent}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span>En Progreso: {stats?.inProgressOrders || 0} ({inProgressPercent}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Completadas: {stats?.completedOrders || 0} ({completedPercent}%)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Órdenes Recientes</CardTitle>
            <Link href="/manager/work-orders">
              <Button variant="ghost" size="sm">Ver todas <ArrowRight className="h-4 w-4 ml-2" /></Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay órdenes recientes</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map(order => (
                  <Link key={order.id} href={`/manager/work-orders/${order.id}`}>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Badge className={statusColors[order.status]}>{order.status}</Badge>
                        <div>
                          <p className="font-mono text-sm">{order.orderNumber}</p>
                          <p className="text-xs text-gray-500">{order.client?.name || 'Cliente'}</p>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
