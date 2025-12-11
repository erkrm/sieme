'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Loader2, Save, Edit2, ClipboardList, User, MapPin, Phone, Calendar, Clock } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'

const statusColors: Record<string, string> = { REQUESTED: 'bg-yellow-100 text-yellow-800', SCHEDULED: 'bg-blue-100 text-blue-800', IN_PROGRESS: 'bg-purple-100 text-purple-800', PENDING: 'bg-orange-100 text-orange-800', COMPLETED: 'bg-green-100 text-green-800', CANCELLED: 'bg-red-100 text-red-800' }
const statusLabels: Record<string, string> = { REQUESTED: 'Solicitada', SCHEDULED: 'Programada', IN_PROGRESS: 'En Progreso', PENDING: 'Pendiente', COMPLETED: 'Completada', CANCELLED: 'Cancelada' }

export default function WorkOrderDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [technicians, setTechnicians] = useState<any[]>([])
  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'ADMIN' && params.orderId) {
      fetchOrder()
      fetchTechnicians()
    }
  }, [status, session, params.orderId])

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/admin/work-orders/${params.orderId}`)
      if (response.ok) {
        const data = await response.json()
        setOrder(data)
        setFormData({
          title: data.title,
          description: data.description,
          category: data.category,
          priority: data.priority,
          status: data.status,
          serviceAddress: data.serviceAddress,
          contactPerson: data.contactPerson,
          contactPhone: data.contactPhone,
          scheduledDate: data.scheduledDate ? new Date(data.scheduledDate).toISOString().slice(0, 16) : '',
          technicianId: data.technicianId || '',
          notes: data.notes || ''
        })
      } else throw new Error('Order not found')
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo cargar la orden', variant: 'destructive' })
      router.push('/admin/work-orders')
    } finally {
      setLoading(false)
    }
  }

  const fetchTechnicians = async () => {
    const res = await fetch('/api/admin/hr/technicians')
    if (res.ok) setTechnicians(await res.json())
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/work-orders/${params.orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        toast({ title: 'Éxito', description: 'Orden actualizada' })
        setIsEditing(false)
        fetchOrder()
      } else throw new Error('Error updating')
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo actualizar', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="min-h-screen bg-gray-50 p-8"><Skeleton className="h-[500px] max-w-4xl mx-auto" /></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/admin/work-orders" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-4">
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
            <Button variant={isEditing ? 'outline' : 'default'} onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? 'Cancelar' : <><Edit2 className="h-4 w-4 mr-2" />Editar</>}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="info">
          <TabsList><TabsTrigger value="info">Información</TabsTrigger><TabsTrigger value="history">Historial ({order?.logs?.length || 0})</TabsTrigger></TabsList>
          
          <TabsContent value="info">
            <div className="grid gap-6">
              <Card>
                <CardHeader><CardTitle>Detalles del Servicio</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Título</Label><Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} /></div>
                        <div className="space-y-2"><Label>Categoría</Label><Input value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} /></div>
                        <div className="space-y-2"><Label>Prioridad</Label>
                          <Select value={formData.priority} onValueChange={(v) => setFormData({...formData, priority: v})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="NORMAL">Normal</SelectItem><SelectItem value="URGENT">Urgente</SelectItem><SelectItem value="EMERGENCY">Emergencia</SelectItem></SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2"><Label>Estado</Label>
                          <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="REQUESTED">Solicitada</SelectItem><SelectItem value="SCHEDULED">Programada</SelectItem><SelectItem value="IN_PROGRESS">En Progreso</SelectItem><SelectItem value="PENDING">Pendiente</SelectItem><SelectItem value="COMPLETED">Completada</SelectItem><SelectItem value="CANCELLED">Cancelada</SelectItem></SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2"><Label>Descripción</Label><Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} /></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Técnico</Label>
                          <Select value={formData.technicianId} onValueChange={(v) => setFormData({...formData, technicianId: v})}>
                            <SelectTrigger><SelectValue placeholder="Asignar técnico" /></SelectTrigger>
                            <SelectContent>{technicians.map((t) => <SelectItem key={t.id} value={t.userId}>{t.user?.name}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2"><Label>Fecha Programada</Label><Input type="datetime-local" value={formData.scheduledDate} onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})} /></div>
                      </div>
                      <div className="space-y-2"><Label>Notas internas</Label><Textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} rows={2} /></div>
                      <div className="flex justify-end gap-3 pt-4"><Button variant="outline" onClick={() => setIsEditing(false)}>Cancelar</Button><Button onClick={handleSave} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}Guardar</Button></div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-gray-700">{order?.description}</p>
                      <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="flex items-center gap-2"><User className="h-4 w-4 text-gray-400" /><span className="text-sm"><strong>Cliente:</strong> {order?.client?.name}</span></div>
                        <div className="flex items-center gap-2"><User className="h-4 w-4 text-gray-400" /><span className="text-sm"><strong>Técnico:</strong> {order?.technician?.name || 'Sin asignar'}</span></div>
                        <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gray-400" /><span className="text-sm">{order?.serviceAddress}</span></div>
                        <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-gray-400" /><span className="text-sm">{order?.contactPerson} - {order?.contactPhone}</span></div>
                        <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-gray-400" /><span className="text-sm"><strong>Creada:</strong> {new Date(order?.createdAt).toLocaleDateString('es-ES')}</span></div>
                        {order?.scheduledDate && <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-gray-400" /><span className="text-sm"><strong>Programada:</strong> {new Date(order?.scheduledDate).toLocaleString('es-ES')}</span></div>}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="history">
            <Card>
              <CardContent className="pt-6">
                {order?.logs?.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Sin historial de cambios</p>
                ) : (
                  <div className="space-y-4">
                    {order?.logs?.map((log: any) => (
                      <div key={log.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                        <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-medium">{log.previousStatus} → {log.newStatus}</p>
                          <p className="text-sm text-gray-500">{log.notes}</p>
                          <p className="text-xs text-gray-400 mt-1">{new Date(log.createdAt).toLocaleString('es-ES')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
