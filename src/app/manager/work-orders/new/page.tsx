'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Loader2, Save, ClipboardList } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function ManagerNewWorkOrderPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<any[]>([])
  const [technicians, setTechnicians] = useState<any[]>([])
  const [formData, setFormData] = useState({
    clientId: '',
    title: '',
    description: '',
    category: '',
    priority: 'NORMAL',
    serviceAddress: '',
    contactPerson: '',
    contactPhone: '',
    scheduledDate: '',
    technicianId: ''
  })

  const categories = ['Electricidad', 'Plomería', 'HVAC', 'Refrigeración', 'Electrónica', 'Mecánica', 'Mantenimiento General']

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'MANAGER') {
      fetchClients()
      fetchTechnicians()
    }
  }, [status, session])

  const fetchClients = async () => {
    const response = await fetch('/api/admin/clients')
    if (response.ok) setClients(await response.json())
  }

  const fetchTechnicians = async () => {
    const response = await fetch('/api/admin/hr/technicians')
    if (response.ok) {
      const data = await response.json()
      setTechnicians(data.filter((t: any) => t.isAvailable && t.user?.isActive))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/manager/work-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error((await response.json()).error || 'Error')
      
      toast({ title: 'Éxito', description: 'Orden creada correctamente' })
      router.push('/manager/work-orders')
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/manager/work-orders" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />Volver a Órdenes
          </Link>
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-lg"><ClipboardList className="h-6 w-6 text-blue-600" /></div>
            <div>
              <h1 className="text-2xl font-bold">Nueva Orden de Trabajo</h1>
              <p className="text-gray-500">Complete los datos para crear una nueva orden</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader><CardTitle>Cliente y Servicio</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Cliente *</Label>
                <Select value={formData.clientId} onValueChange={(v) => setFormData({...formData, clientId: v})}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar cliente" /></SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => <SelectItem key={c.id} value={c.userId}>{c.companyName} - {c.user?.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Título *</Label>
                  <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>Categoría *</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Descripción *</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={4} required />
              </div>
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
                    <SelectTrigger><SelectValue placeholder="Asignar técnico (opcional)" /></SelectTrigger>
                    <SelectContent>{technicians.map((t) => <SelectItem key={t.id} value={t.userId}>{t.user?.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Link href="/manager/work-orders"><Button type="button" variant="outline">Cancelar</Button></Link>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {loading ? 'Creando...' : 'Crear Orden'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
