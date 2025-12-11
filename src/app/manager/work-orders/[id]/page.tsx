'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Loader2, User, MapPin, Phone, Calendar, Clock, UserCheck, Edit, UserMinus, History } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'

const statusColors: Record<string, string> = { REQUESTED: 'bg-yellow-100 text-yellow-800', SCHEDULED: 'bg-blue-100 text-blue-800', IN_PROGRESS: 'bg-purple-100 text-purple-800', PENDING: 'bg-orange-100 text-orange-800', COMPLETED: 'bg-green-100 text-green-800', CANCELLED: 'bg-red-100 text-red-800' }
const statusLabels: Record<string, string> = { REQUESTED: 'Solicitada', SCHEDULED: 'Programada', IN_PROGRESS: 'En Progreso', PENDING: 'Pendiente', COMPLETED: 'Completada', CANCELLED: 'Cancelada' }

interface LogEntry {
  id: string
  action: string
  details: string
  createdAt: string
  user?: { name: string }
}

export default function ManagerWorkOrderDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const defaultTab = searchParams.get('tab') || 'info'
  
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [technicians, setTechnicians] = useState<any[]>([])
  const [selectedTechnician, setSelectedTechnician] = useState('')
  const [logs, setLogs] = useState<LogEntry[]>([])

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'MANAGER' && params.id) {
      fetchOrder()
      fetchTechnicians()
      fetchLogs()
    }
  }, [status, session, params.id])

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/admin/work-orders/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setOrder(data)
        setSelectedTechnician(data.technicianId || '')
      } else throw new Error('Order not found')
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo cargar la orden', variant: 'destructive' })
      router.push('/manager/work-orders')
    } finally {
      setLoading(false)
    }
  }

  const fetchTechnicians = async () => {
    const res = await fetch('/api/admin/hr/technicians')
    if (res.ok) setTechnicians(await res.json())
  }

  const fetchLogs = async () => {
    // Simulate logs from order updates - in a real system this would be from an audit log table
    try {
      const res = await fetch(`/api/admin/work-orders/${params.id}`)
      if (res.ok) {
        const order = await res.json()
        // Create simulated logs based on order data
        const simulatedLogs: LogEntry[] = [
          { id: '1', action: 'Creación', details: `Orden ${order.orderNumber} creada`, createdAt: order.createdAt, user: { name: 'Sistema' } }
        ]
        if (order.technicianId) {
          simulatedLogs.push({ id: '2', action: 'Asignación', details: `Técnico ${order.technician?.name || 'asignado'}`, createdAt: order.updatedAt, user: { name: 'Manager' } })
        }
        setLogs(simulatedLogs)
      }
    } catch (e) { console.error(e) }
  }

  const handleAssign = async () => {
    if (!selectedTechnician) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/work-orders/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...order, technicianId: selectedTechnician, status: order.status === 'REQUESTED' ? 'SCHEDULED' : order.status })
      })
      if (res.ok) {
        toast({ title: 'Éxito', description: 'Técnico asignado correctamente' })
        fetchOrder()
        fetchLogs()
      } else throw new Error('Error assigning')
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo asignar', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleUnassign = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/work-orders/${params.id}/unassign`, { method: 'POST' })
      if (res.ok) {
        toast({ title: 'Éxito', description: 'Técnico desasignado' })
        setSelectedTechnician('')
        fetchOrder()
      } else throw new Error('Error')
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo desasignar', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Skeleton className="h-[500px]" />

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/manager/work-orders" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />Volver
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{order?.orderNumber}</h1>
              <Badge className={statusColors[order?.status]}>{statusLabels[order?.status]}</Badge>
              <Badge className={order?.priority === 'EMERGENCY' ? 'bg-red-100 text-red-800' : order?.priority === 'URGENT' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'}>{order?.priority}</Badge>
            </div>
            <p className="text-gray-500 mt-1">{order?.title}</p>
          </div>
          <Link href={`/manager/work-orders/${params.id}/edit`}>
            <Button variant="outline"><Edit className="h-4 w-4 mr-2" />Editar</Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList>
          <TabsTrigger value="info">Información</TabsTrigger>
          <TabsTrigger value="assign">Asignar Técnico</TabsTrigger>
          <TabsTrigger value="logs">Historial</TabsTrigger>
        </TabsList>
        
        <TabsContent value="info">
          <Card>
            <CardHeader><CardTitle>Detalles del Servicio</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">{order?.description}</p>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="flex items-center gap-2"><User className="h-4 w-4 text-gray-400" /><span className="text-sm"><strong>Cliente:</strong> {order?.client?.name}</span></div>
                <div className="flex items-center gap-2"><User className="h-4 w-4 text-gray-400" /><span className="text-sm"><strong>Técnico:</strong> {order?.technician?.name || 'Sin asignar'}</span></div>
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gray-400" /><span className="text-sm">{order?.serviceAddress}</span></div>
                <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-gray-400" /><span className="text-sm">{order?.contactPerson} - {order?.contactPhone}</span></div>
                <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-gray-400" /><span className="text-sm"><strong>Creada:</strong> {new Date(order?.createdAt).toLocaleDateString('es-ES')}</span></div>
                {order?.scheduledDate && <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-gray-400" /><span className="text-sm"><strong>Programada:</strong> {new Date(order?.scheduledDate).toLocaleString('es-ES')}</span></div>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="assign">
          <Card>
            <CardHeader><CardTitle>Asignar Técnico</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-500">Selecciona un técnico para asignar a esta orden de trabajo.</p>
              <div className="flex gap-4">
                <Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Seleccionar técnico" /></SelectTrigger>
                  <SelectContent>
                    {technicians.filter(t => t.user?.isActive).map((t) => (
                      <SelectItem key={t.id} value={t.userId}>
                        <div className="flex items-center gap-2">
                          {t.user?.name}
                          {t.isAvailable && <Badge variant="outline" className="text-xs">Disponible</Badge>}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleAssign} disabled={!selectedTechnician || saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserCheck className="h-4 w-4 mr-2" />}
                  Asignar
                </Button>
              </div>
              {order?.technician && (
                <div className="p-4 bg-blue-50 rounded-lg flex items-center justify-between">
                  <p className="text-sm text-blue-800"><strong>Actualmente asignado:</strong> {order.technician.name}</p>
                  <Button variant="outline" size="sm" onClick={handleUnassign} disabled={saving}>
                    <UserMinus className="h-4 w-4 mr-2" />Desasignar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><History className="h-5 w-5" />Historial de Cambios</CardTitle></CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay registro de cambios</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Acción</TableHead>
                      <TableHead>Detalles</TableHead>
                      <TableHead>Usuario</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map(log => (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm">{new Date(log.createdAt).toLocaleString('es-ES')}</TableCell>
                        <TableCell><Badge variant="outline">{log.action}</Badge></TableCell>
                        <TableCell className="text-sm text-gray-600">{log.details}</TableCell>
                        <TableCell className="text-sm">{log.user?.name}</TableCell>
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
