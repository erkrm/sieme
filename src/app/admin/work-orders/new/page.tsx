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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Loader2, Save, ClipboardList } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function NewWorkOrderPage() {
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

  const categories = [
    'Electricidad',
    'Plomería',
    'HVAC',
    'Refrigeración',
    'Electrónica',
    'Mecánica',
    'Mantenimiento General'
  ]

  useEffect(() => {
    if (status === 'authenticated') {
      fetchClients()
      fetchTechnicians()
    }
  }, [status])

  const fetchClients = async () => {
    const response = await fetch('/api/admin/clients')
    if (response.ok) {
      const data = await response.json()
      setClients(data)
    }
  }

  const fetchTechnicians = async () => {
    const response = await fetch('/api/admin/hr/technicians')
    if (response.ok) {
      const data = await response.json()
      setTechnicians(data.filter((t: any) => t.isAvailable && t.user.isActive))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/admin/work-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error creating work order')
      }

      toast({ title: 'Éxito', description: 'Orden de trabajo creada correctamente' })
      router.push('/admin/work-orders')
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo crear la orden',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
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
              <h1 className="text-2xl font-bold text-gray-900">Nueva Orden de Trabajo</h1>
              <p className="text-gray-500">Complete los datos para crear una nueva orden</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Cliente y Servicio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Cliente *</Label>
                <Select 
                  value={formData.clientId} 
                  onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.userId}>
                        {client.companyName} - {client.user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Título *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ej: Reparación de aire acondicionado"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Categoría *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Descripción *</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describa el problema o servicio requerido..."
                  rows={4}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Prioridad</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
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
            <CardHeader>
              <CardTitle>Ubicación y Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Dirección del Servicio *</Label>
                <Input
                  value={formData.serviceAddress}
                  onChange={(e) => setFormData({ ...formData, serviceAddress: e.target.value })}
                  placeholder="Dirección completa"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Persona de Contacto *</Label>
                  <Input
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="Nombre del contacto"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Teléfono de Contacto *</Label>
                  <Input
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="+1 234 567 8900"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Programación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fecha Programada</Label>
                  <Input
                    type="datetime-local"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Asignar Técnico</Label>
                  <Select 
                    value={formData.technicianId} 
                    onValueChange={(value) => setFormData({ ...formData, technicianId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar técnico (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {technicians.map((tech) => (
                        <SelectItem key={tech.id} value={tech.userId}>
                          {tech.user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Link href="/admin/work-orders">
              <Button type="button" variant="outline">Cancelar</Button>
            </Link>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {loading ? 'Creando...' : 'Crear Orden'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
