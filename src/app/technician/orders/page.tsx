'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ClipboardList, Play, CheckCircle, Clock, MapPin, Phone, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'

const statusColors: Record<string, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  PENDING: 'bg-orange-100 text-orange-800',
  COMPLETED: 'bg-green-100 text-green-800'
}

const statusLabels: Record<string, string> = {
  SCHEDULED: 'Programada',
  IN_PROGRESS: 'En Progreso',
  PENDING: 'Pendiente',
  COMPLETED: 'Completada'
}

interface WorkOrder {
  id: string
  orderNumber: string
  title: string
  status: string
  priority: string
  serviceAddress: string
  contactPhone: string
  scheduledDate: string
  client?: { name: string }
}

export default function TechnicianOrdersPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [orders, setOrders] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/technician/orders')
      if (res.ok) {
        const data = await res.json()
        setOrders(Array.isArray(data) ? data : data.orders || [])
      }
    } catch (e) {
      console.error('Error:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleStartOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/technician/orders/${orderId}/start`, { method: 'POST' })
      if (res.ok) {
        toast({ title: 'Orden iniciada', description: 'La orden está ahora en progreso' })
        fetchOrders()
      }
    } catch (e) {
      toast({ title: 'Error', description: 'No se pudo iniciar la orden', variant: 'destructive' })
    }
  }

  const filteredOrders = orders.filter(o => statusFilter === 'all' || o.status === statusFilter)

  if (loading) return <Skeleton className="h-[500px]" />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Mis Órdenes</h1>
          <p className="text-gray-500">Órdenes de trabajo asignadas a ti</p>
        </div>
        <Button variant="outline" onClick={fetchOrders}>
          <RefreshCw className="h-4 w-4 mr-2" />Actualizar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Programadas</p>
                <p className="text-2xl font-bold text-blue-600">{orders.filter(o => o.status === 'SCHEDULED').length}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">En Progreso</p>
                <p className="text-2xl font-bold text-purple-600">{orders.filter(o => o.status === 'IN_PROGRESS').length}</p>
              </div>
              <Play className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pendientes</p>
                <p className="text-2xl font-bold text-orange-600">{orders.filter(o => o.status === 'PENDING').length}</p>
              </div>
              <ClipboardList className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completadas</p>
                <p className="text-2xl font-bold text-green-600">{orders.filter(o => o.status === 'COMPLETED').length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="pt-6">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Filtrar por estado" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="SCHEDULED">Programadas</SelectItem>
              <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
              <SelectItem value="PENDING">Pendientes</SelectItem>
              <SelectItem value="COMPLETED">Completadas</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader><CardTitle>Órdenes ({filteredOrders.length})</CardTitle></CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No tienes órdenes asignadas</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Orden</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <p className="font-mono">{order.orderNumber}</p>
                      <p className="text-sm text-gray-500">{order.title}</p>
                    </TableCell>
                    <TableCell>{order.client?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3" />
                        {order.serviceAddress?.slice(0, 30)}...
                      </div>
                    </TableCell>
                    <TableCell><Badge className={statusColors[order.status]}>{statusLabels[order.status]}</Badge></TableCell>
                    <TableCell>{order.scheduledDate ? new Date(order.scheduledDate).toLocaleDateString('es-ES') : 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {order.status === 'SCHEDULED' && (
                          <Button size="sm" onClick={() => handleStartOrder(order.id)}>
                            <Play className="h-4 w-4 mr-1" />Iniciar
                          </Button>
                        )}
                        <Link href={`/technician/orders/${order.id}`}>
                          <Button variant="outline" size="sm">Ver</Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
