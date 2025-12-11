'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Loader2, Save, ClipboardList } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'

const categories = ['Electricidad', 'Plomería', 'HVAC', 'Refrigeración', 'Electrónica', 'Mecánica', 'Mantenimiento General']
const statuses = [
  { value: 'REQUESTED', label: 'Solicitada' },
  { value: 'SCHEDULED', label: 'Programada' },
  { value: 'IN_PROGRESS', label: 'En Progreso' },
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'COMPLETED', label: 'Completada' },
  { value: 'CANCELLED', label: 'Cancelada' }
]

export default function ManagerWorkOrderEditPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [technicians, setTechnicians] = useState<any[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'NORMAL',
    status: '',
    serviceAddress: '',
    contactPerson: '',
    contactPhone: '',
    scheduledDate: '',
    technicianId: ''
  })

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'MANAGER' && params.id) {
      fetchOrder()
      fetchTechnicians()
    }
  }, [status, session, params.id])

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/admin/work-orders/${params.id}`)
      if (res.ok) {
        const order = await res.json()
        setFormData({
          title: order.title || '',
          description: order.description || '',
          category: order.category || '',
          priority: order.priority || 'NORMAL',
          status: order.status || '',
          serviceAddress: order.serviceAddress || '',
          contactPerson: order.contactPerson || '',
          contactPhone: order.contactPhone || '',
          scheduledDate: order.scheduledDate ? new Date(order.scheduledDate).toISOString().slice(0, 16) : '',
          technicianId: order.technicianId || ''
        })
      } else {
        throw new Error('Order not found')
      }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch(`/api/admin/work-orders/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          scheduledDate: formData.scheduledDate ? new Date(formData.scheduledDate).toISOString() : null,
          technicianId: formData.technicianId || null
        })
      })

      if (!res.ok) throw new Error((await res.json()).error || 'Error')
      
      toast({ title: 'Éxito', description: 'Orden actualizada correctamente' })
      router.push(`/manager/work-orders/${params.id}`)
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <Skeleton className="h-[600px]" />
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href={`/manager/work-orders/${params.id}`} className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />Volver al Detalle
        </Link>
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-3 rounded-lg"><ClipboardList className="h-6 w-6 text-blue-600" /></div>
          <div>
            <h1 className="text-2xl font-bold">Editar Orden de Trabajo</h1>
            <p className="text-gray-500">Modifique los datos de la orden</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader><CardTitle>Información General</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Título *</Label>
                <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label>Categoría *</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descripción *</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={4} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prioridad</Label>
                <Select value={formData.priority} onValueChange={(v) => setFormData({...formData, priority: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NORMAL">Normal</SelectItem>
                    <SelectItem value="URGENT">Urgente</SelectItem>
                    <SelectItem value="EMERGENCY">Emergencia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{statuses.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader><CardTitle>Ubicación y Contacto</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Dirección del Servicio *</Label>
              <Input value={formData.serviceAddress} onChange={(e) => setFormData({...formData, serviceAddress: e.target.value})} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contacto *</Label>
                <Input value={formData.contactPerson} onChange={(e) => setFormData({...formData, contactPerson: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label>Teléfono *</Label>
                <Input value={formData.contactPhone} onChange={(e) => setFormData({...formData, contactPhone: e.target.value})} required />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader><CardTitle>Asignación</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha Programada</Label>
                <Input type="datetime-local" value={formData.scheduledDate} onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Técnico</Label>
                <Select value={formData.technicianId} onValueChange={(v) => setFormData({...formData, technicianId: v})}>
                  <SelectTrigger><SelectValue placeholder="Sin asignar" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin asignar</SelectItem>
                    {technicians.filter(t => t.user?.isActive).map(t => (
                      <SelectItem key={t.id} value={t.userId}>{t.user?.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href={`/manager/work-orders/${params.id}`}><Button type="button" variant="outline">Cancelar</Button></Link>
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </form>
    </div>
  )
}
