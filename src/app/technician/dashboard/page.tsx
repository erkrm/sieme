'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  AlertCircle, 
  Wrench, 
  User, 
  MessageSquare, 
  FileText, 
  TrendingUp,
  Settings,
  RefreshCw,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import MessagingSystem from '@/components/messaging-system'
import TimeTracking from '@/components/time-tracking'
import MaterialsManager from '@/components/materials-manager'

const TechnicianMap = dynamic(() => import('@/components/technician-map'), {
  ssr: false,
  loading: () => (
    <Card>
      <CardHeader>
        <CardTitle>Mapa de Órdenes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full bg-gray-100 animate-pulse rounded-lg" />
      </CardContent>
    </Card>
  )
})

interface WorkOrder {
  id: string
  orderNumber: string
  title: string
  description: string
  clientName: string
  clientEmail: string
  clientPhone: string
  address: string
  serviceType: string
  urgency: string
  budget: number
  status: string
  createdAt: string
  updatedAt: string
  assignedAt?: string
  completedAt?: string
  technicianNotes?: string
  finalPrice?: number
  timeTracking?: TimeTracking[]
  materialsUsed?: MaterialUsed[]
  messages?: Message[]
}

interface TimeTracking {
  id: string
  startTime: string
  endTime?: string
  description: string
  hours: number
}

interface MaterialUsed {
  id: string
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface Message {
  id: string
  content: string
  senderType: string
  senderName: string
  createdAt: string
}

interface TechnicianStats {
  activeOrders: number
  completedOrders: number
  totalEarnings: number
  averageRating: number
  thisMonthEarnings: number
}

export default function TechnicianDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [stats, setStats] = useState<TechnicianStats | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [notes, setNotes] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated' && session?.user?.role !== 'TECHNICIAN') {
      router.push('/')
    } else if (status === 'authenticated') {
      fetchData()
    }
  }, [status, session, router])

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      await Promise.all([
        fetchWorkOrders(),
        fetchStats()
      ])
      setLastUpdated(new Date())
      
      if (isRefresh) {
        toast({
          title: "Datos actualizados",
          description: "La información se ha actualizado correctamente.",
        })
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: "Error al cargar datos",
        description: "Hubo un problema al cargar la información. Por favor intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const fetchWorkOrders = async () => {
    const response = await fetch('/api/technician/work-orders')
    if (response.ok) {
      const data = await response.json()
      setWorkOrders(data)
    } else {
      throw new Error('Failed to fetch work orders')
    }
  }

  const fetchStats = async () => {
    const response = await fetch('/api/technician/stats')
    if (response.ok) {
      const data = await response.json()
      setStats(data)
    } else {
      throw new Error('Failed to fetch stats')
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/technician/work-orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        fetchData() // Refresh all data to keep stats in sync
        toast({
          title: "Estado actualizado",
          description: `La orden ha pasado a estado: ${getStatusText(newStatus)}`,
        })
      } else {
        throw new Error('Failed to update status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la orden.",
        variant: "destructive",
      })
    }
  }

  const addTechnicianNotes = async () => {
    if (!selectedOrder || !notes.trim()) return

    try {
      const response = await fetch(`/api/technician/work-orders/${selectedOrder.id}/notes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      })

      if (response.ok) {
        const updatedOrder = await response.json()
        setNotes('')
        fetchWorkOrders()
        if (updatedOrder && updatedOrder.workOrder) setSelectedOrder(updatedOrder.workOrder)
        toast({
          title: "Nota añadida",
          description: "La nota se ha guardado correctamente.",
        })
      } else {
        throw new Error('Failed to add note')
      }
    } catch (error) {
      console.error('Error adding notes:', error)
      toast({
        title: "Error",
        description: "No se pudo guardar la nota.",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'ASSIGNED': return 'bg-blue-100 text-blue-800'
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800'
      case 'WAITING_PARTS': return 'bg-orange-100 text-orange-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'CLIENT_APPROVED': return 'bg-emerald-100 text-emerald-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pendiente'
      case 'ASSIGNED': return 'Asignado'
      case 'IN_PROGRESS': return 'En Progreso'
      case 'WAITING_PARTS': return 'Esperando Repuestos'
      case 'COMPLETED': return 'Completado'
      case 'CLIENT_APPROVED': return 'Aprobado por Cliente'
      default: return status
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'LOW': return 'bg-green-100 text-green-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'HIGH': return 'bg-red-100 text-red-800'
      case 'CRITICAL': return 'bg-red-200 text-red-900'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'LOW': return 'Baja'
      case 'MEDIUM': return 'Media'
      case 'HIGH': return 'Alta'
      case 'CRITICAL': return 'Crítica'
      default: return urgency
    }
  }

  // Removed full screen loading to use skeletons instead
  // if (loading) { ... }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {loading ? (
            // Skeleton Loading for Stats
            [1, 2, 3, 4, 5].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="ml-4 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : stats ? (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Wrench className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Órdenes Activas</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.activeOrders}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Completadas</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.completedOrders}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-emerald-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Ganancias Totales</p>
                      <p className="text-2xl font-semibold text-gray-900">${stats.totalEarnings.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Este Mes</p>
                      <p className="text-2xl font-semibold text-gray-900">${stats.thisMonthEarnings.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <User className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Rating</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.averageRating.toFixed(1)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>

        {/* Last Updated Timestamp */}
        {lastUpdated && (
          <div className="text-xs text-muted-foreground mb-4 text-right">
            Última actualización: {format(lastUpdated, "HH:mm:ss", { locale: es })}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Work Orders List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Mis Órdenes de Trabajo</CardTitle>
                <CardDescription>Gestiona tus órdenes asignadas</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="active" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="active">Activas</TabsTrigger>
                    <TabsTrigger value="pending">Pendientes</TabsTrigger>
                    <TabsTrigger value="completed">Completadas</TabsTrigger>
                    <TabsTrigger value="map">Mapa</TabsTrigger>
                  </TabsList>

                  <TabsContent value="active" className="space-y-4">
                    {workOrders.filter(order => ['ASSIGNED', 'IN_PROGRESS', 'WAITING_PARTS'].includes(order.status)).length === 0 ? (
                      <div className="text-center py-12 bg-white rounded-lg border border-dashed">
                        <div className="bg-blue-50 p-4 rounded-full inline-block mb-4">
                          <Wrench className="h-8 w-8 text-blue-500" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes órdenes activas</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                          Cuando inicies un trabajo o te asignen una orden, aparecerá aquí.
                        </p>
                      </div>
                    ) : (
                      workOrders.filter(order => ['ASSIGNED', 'IN_PROGRESS', 'WAITING_PARTS'].includes(order.status)).map(order => (
                        <Card key={order.id} className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-blue-500" onClick={() => setSelectedOrder(order)}>
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="font-semibold text-lg">{order.title}</h3>
                                <p className="text-sm text-gray-600 font-mono">#{order.orderNumber}</p>
                              </div>
                              <div className="flex flex-col items-end space-y-2">
                                <Badge className={getStatusColor(order.status)}>
                                  {getStatusText(order.status)}
                                </Badge>
                                <Badge className={getUrgencyColor(order.urgency)}>
                                  {getUrgencyText(order.urgency)}
                                </Badge>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
                              <div className="flex items-center">
                                <User className="h-4 w-4 mr-2 text-gray-400" />
                                <span className="truncate">{order.clientName}</span>
                              </div>
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                                <span className="truncate">{order.address}</span>
                              </div>
                              <div className="flex items-center">
                                <Phone className="h-4 w-4 mr-2 text-gray-400" />
                                {order.clientPhone}
                              </div>
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                {format(new Date(order.createdAt), 'dd/MM/yyyy', { locale: es })}
                              </div>
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t">
                              <span className="text-sm font-medium text-gray-900">
                                {order.serviceType}
                              </span>
                              <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                Ver Detalles
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="pending" className="space-y-4">
                    {workOrders.filter(order => order.status === 'ASSIGNED').length === 0 ? (
                      <div className="text-center py-12 bg-white rounded-lg border border-dashed">
                        <div className="bg-yellow-50 p-4 rounded-full inline-block mb-4">
                          <Clock className="h-8 w-8 text-yellow-500" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay órdenes pendientes</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                          ¡Estás al día! Las nuevas asignaciones aparecerán aquí.
                        </p>
                      </div>
                    ) : (
                      workOrders.filter(order => order.status === 'ASSIGNED').map(order => (
                        <Card key={order.id} className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-yellow-500" onClick={() => setSelectedOrder(order)}>
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="font-semibold text-lg">{order.title}</h3>
                                <p className="text-sm text-gray-600 font-mono">#{order.orderNumber}</p>
                              </div>
                              <div className="flex flex-col items-end space-y-2">
                                <Badge className={getStatusColor(order.status)}>
                                  {getStatusText(order.status)}
                                </Badge>
                                <Badge className={getUrgencyColor(order.urgency)}>
                                  {getUrgencyText(order.urgency)}
                                </Badge>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
                              <div className="flex items-center">
                                <User className="h-4 w-4 mr-2 text-gray-400" />
                                <span className="truncate">{order.clientName}</span>
                              </div>
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                                <span className="truncate">{order.address}</span>
                              </div>
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t">
                              <span className="text-sm font-medium text-gray-900">
                                {order.serviceType}
                              </span>
                              <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                Ver Detalles
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="completed" className="space-y-4">
                    {workOrders.filter(order => ['COMPLETED', 'CLIENT_APPROVED'].includes(order.status)).length === 0 ? (
                      <div className="text-center py-12 bg-white rounded-lg border border-dashed">
                        <div className="bg-green-50 p-4 rounded-full inline-block mb-4">
                          <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay historial</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                          Las órdenes completadas aparecerán aquí.
                        </p>
                      </div>
                    ) : (
                      workOrders.filter(order => ['COMPLETED', 'CLIENT_APPROVED'].includes(order.status)).map(order => (
                        <Card key={order.id} className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-green-500" onClick={() => setSelectedOrder(order)}>
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="font-semibold text-lg">{order.title}</h3>
                                <p className="text-sm text-gray-600 font-mono">#{order.orderNumber}</p>
                              </div>
                              <div className="flex flex-col items-end space-y-2">
                                <Badge className={getStatusColor(order.status)}>
                                  {getStatusText(order.status)}
                                </Badge>
                                {order.finalPrice && (
                                  <span className="text-sm font-semibold text-green-600">
                                    ${order.finalPrice.toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
                              <div className="flex items-center">
                                <User className="h-4 w-4 mr-2 text-gray-400" />
                                <span className="truncate">{order.clientName}</span>
                              </div>
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                {format(new Date(order.completedAt || order.updatedAt), 'dd/MM/yyyy', { locale: es })}
                              </div>
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t">
                              <span className="text-sm font-medium text-gray-900">
                                {order.serviceType}
                              </span>
                              <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                Ver Detalles
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="map">
                    <TechnicianMap 
                      workOrders={workOrders}
                      onOrderSelect={(orderId) => {
                        const order = workOrders.find(o => o.id === orderId)
                        if (order) setSelectedOrder(order)
                      }}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Order Details Panel */}
          <div className="lg:col-span-1">
            {selectedOrder ? (
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Detalles de la Orden</span>
                    <Badge className={getStatusColor(selectedOrder.status)}>
                      {getStatusText(selectedOrder.status)}
                    </Badge>
                  </CardTitle>
                  <CardDescription>Orden #{selectedOrder.orderNumber}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Client Info */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Información del Cliente
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-600">
                        <User className="h-4 w-4 mr-2" />
                        {selectedOrder.clientName}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Mail className="h-4 w-4 mr-2" />
                        {selectedOrder.clientEmail}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        {selectedOrder.clientPhone}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        {selectedOrder.address}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h4 className="font-semibold mb-2">Descripción del Problema</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      {selectedOrder.description}
                    </p>
                  </div>

                  {/* Status Actions */}
                  <div>
                    <h4 className="font-semibold mb-3">Actualizar Estado</h4>
                    <div className="space-y-2">
                      {selectedOrder.status === 'ASSIGNED' && (
                        <Button 
                          className="w-full" 
                          onClick={() => updateOrderStatus(selectedOrder.id, 'IN_PROGRESS')}
                        >
                          <Wrench className="h-4 w-4 mr-2" />
                          Iniciar Trabajo
                        </Button>
                      )}
                      {selectedOrder.status === 'IN_PROGRESS' && (
                        <Button 
                          className="w-full" 
                          onClick={() => updateOrderStatus(selectedOrder.id, 'COMPLETED')}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Marcar como Completado
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => updateOrderStatus(selectedOrder.id, 'WAITING_PARTS')}
                      >
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Esperando Repuestos
                      </Button>
                    </div>
                  </div>

                  {/* Technician Notes */}
                  <div>
                    <h4 className="font-semibold mb-3">Notas del Técnico</h4>
                    <Textarea
                      placeholder="Añade notas sobre el trabajo..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="mb-2"
                    />
                    <Button size="sm" onClick={addTechnicianNotes}>
                      Añadir Notas
                    </Button>
                    {selectedOrder.technicianNotes && (
                      <div className="mt-3 p-3 bg-blue-50 rounded">
                        <p className="text-sm text-blue-800">{selectedOrder.technicianNotes}</p>
                      </div>
                    )}
                  </div>

                  {/* Time Tracking */}
                  <div>
                    <TimeTracking workOrderId={selectedOrder.id} />
                  </div>

                  {/* Materials */}
                  <div>
                    <MaterialsManager workOrderId={selectedOrder.id} />
                  </div>

                  {/* Messages */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Mensajes
                    </h4>
                    <MessagingSystem
                      workOrderId={selectedOrder.id}
                      currentUserId={session?.user?.id || ''}
                      currentUserRole={session?.user?.role || ''}
                    />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="sticky top-8">
                <CardContent className="p-6 text-center">
                  <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Selecciona una orden para ver los detalles</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}