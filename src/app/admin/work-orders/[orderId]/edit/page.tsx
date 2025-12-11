'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Loader2, Save, ClipboardList } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'

export default function EditWorkOrderPage() {
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
    status: 'REQUESTED',
    serviceAddress: '',
    contactPerson: '',
    contactPhone: '',
    scheduledDate: '',
    technicianId: '',
    notes: ''
  })

  const categories = ['Electricidad', 'Plomería', 'HVAC', 'Refrigeración', 'Electrónica', 'Mecánica', 'Mantenimiento General']

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated' && !['ADMIN', 'MANAGER'].includes(session?.user?.role || '')) {
      router.push('/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    if (status === 'authenticated' && params.orderId) {
      fetchOrder()
      fetchTechnicians()
    }
  }, [status, params.orderId])

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/admin/work-orders/${params.orderId}`)
      if (response.ok) {
        const data = await response.json()
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
      } else {
        throw new Error('Order not found')
      }
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo cargar la orden', variant: 'destructive' })
      router.push('/admin/work-orders')
    } finally {
      setLoading(false)
    }
  }

  const fetchTechnicians = async () => {
    const res = await fetch('/api/admin/hr/technicians')
    if (res.ok) {
      const data = await res.json()
      setTechnicians(data.filter((t: any) => t.user?.isActive))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/admin/work-orders/${params.orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast({ title: 'Éxito', description: 'Orden actualizada correctamente' })
        router.push('/admin/work-orders')
      } else {
        throw new Error('Error updating order')
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'No se pudo actualizar', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-48 mb-8" />
          <Skeleton className="h-[600px] w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/admin/work-orders" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Órdenes
          </Link>
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <ClipboardList className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Editar Orden de Trabajo</h1>
              <p className="text-gray-500">Actualizar información de la orden</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Detalles del Servicio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Categoría</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Prioridad</Label>
                  <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
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
                  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="REQUESTED">Solicitada</SelectItem>
                      <SelectItem value="SCHEDULED">Programada</SelectItem>
                      <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                      <SelectItem value="PENDING">Pendiente</SelectItem>
                      <SelectItem value="COMPLETED">Completada</SelectItem>
                      <SelectItem value="CANCELLED">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} required />
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Ubicación y Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Dirección del Servicio</Label>
                <Input value={formData.serviceAddress} onChange={(e) => setFormData({ ...formData, serviceAddress: e.target.value })} required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Persona de Contacto</Label>
                  <Input value={formData.contactPerson} onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Teléfono de Contacto</Label>
                  <Input value={formData.contactPhone} onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })} required />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Asignación y Programación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Técnico Asignado</Label>
                  <Select value={formData.technicianId} onValueChange={(v) => setFormData({ ...formData, technicianId: v })}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar técnico" /></SelectTrigger>
                    <SelectContent>
                      {technicians.map((t) => <SelectItem key={t.id} value={t.userId}>{t.user?.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Fecha Programada</Label>
                  <Input type="datetime-local" value={formData.scheduledDate} onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notas Internas</Label>
                <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Link href="/admin/work-orders">
              <Button type="button" variant="outline">Cancelar</Button>
            </Link>
            <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
              {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Guardando...</> : <><Save className="h-4 w-4 mr-2" />Guardar Cambios</>}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
