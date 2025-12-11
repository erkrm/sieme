'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Calendar, MapPin, Phone, Mail, User, Wrench, Clock, DollarSign, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import ClientMessaging from '@/components/client-messaging'
import { WorkOrderTimeline } from '@/components/work-order-timeline'

interface WorkOrder {
  id: string
  orderNumber: string
  title: string
  description: string
  category: string
  priority: string
  status: string
  requestedAt: string
  assignedAt?: string
  completedAt?: string
  serviceAddress: string
  contactPerson: string
  contactPhone: string
  technician?: {
    name: string
    email: string
    phone: string
  }
  totalCost?: number
  logs?: any[]
}

export default function OrderDetailsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user && params.id) {
      fetchOrderDetails()
    }
  }, [session, params.id])

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/client/work-orders/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setWorkOrder(data)
      } else {
        router.push('/client/dashboard')
      }
    } catch (error) {
      console.error('Error fetching order details:', error)
      router.push('/client/dashboard')
    } finally {
      setLoading(false)
    }
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
      case 'NORMAL': return 'bg-gray-100 text-gray-800'
      case 'URGENT': return 'bg-orange-100 text-orange-800'
      case 'EMERGENCY': return 'bg-red-100 text-red-800'
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando detalles de la orden...</p>
        </div>
      </div>
    )
  }

  if (!workOrder) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Orden no encontrada</p>
          <Button onClick={() => router.push('/client/dashboard')} className="mt-4">
            Volver al Panel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.push('/client/dashboard')}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Panel
            </Button>
            <h1 className="text-xl font-semibold">Detalles de la Orden</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* General Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{workOrder.title}</span>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(workOrder.status)}>
                      {getStatusText(workOrder.status)}
                    </Badge>
                    <Badge className={getPriorityColor(workOrder.priority)}>
                      {getPriorityText(workOrder.priority)}
                    </Badge>
                  </div>
                </CardTitle>
                <CardDescription>Orden #{workOrder.orderNumber}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Descripción</h4>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded">
                    {workOrder.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2 flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Información de Servicio
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Categoría:</span> {workOrder.category}
                      </div>
                      <div>
                        <span className="font-medium">Solicitado:</span> {format(new Date(workOrder.requestedAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                      </div>
                      {workOrder.assignedAt && (
                        <div>
                          <span className="font-medium">Asignado:</span> {format(new Date(workOrder.assignedAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                        </div>
                      )}
                      {workOrder.completedAt && (
                        <div>
                          <span className="font-medium">Completado:</span> {format(new Date(workOrder.completedAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2 flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      Ubicación de Servicio
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Dirección:</span> {workOrder.serviceAddress}
                      </div>
                      <div>
                        <span className="font-medium">Contacto:</span> {workOrder.contactPerson}
                      </div>
                      <div>
                        <span className="font-medium">Teléfono:</span> {workOrder.contactPhone}
                      </div>
                    </div>
                  </div>
                </div>

                {workOrder.totalCost && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2 flex items-center">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Costo del Servicio
                    </h4>
                    <div className="text-2xl font-bold text-green-600">
                      ${workOrder.totalCost.toFixed(2)}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Historial de la Orden
                </CardTitle>
              </CardHeader>
              <CardContent>
                {workOrder.logs && workOrder.logs.length > 0 ? (
                  <WorkOrderTimeline logs={workOrder.logs} />
                ) : (
                  <p className="text-gray-500 text-center py-4">No hay historial disponible</p>
                )}
              </CardContent>
            </Card>

            {/* Messaging System */}
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wrench className="h-5 w-5 mr-2" />
                  Chat con el Técnico
                </CardTitle>
                <CardDescription>
                  Comunícate directamente con el técnico asignado
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ClientMessaging
                  workOrderId={workOrder.id}
                  currentUserId={session?.user?.id || ''}
                  currentUserRole={session?.user?.role || ''}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Technician Information */}
            {workOrder.technician && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Técnico Asignado
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-medium">{workOrder.technician.name}</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      {workOrder.technician.email}
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      {workOrder.technician.phone}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Contactar Técnico
                </Button>
                <Button className="w-full" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Ver Factura
                </Button>
                <Button className="w-full" variant="outline">
                  <Clock className="h-4 w-4 mr-2" />
                  Solicitar Seguimiento
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
