'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'

export default function EditTechnicianPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    employeeId: '',
    baseSalary: '',
    hourlyCost: '',
    isAvailable: true,
    isActive: true,
    specialties: [] as string[]
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    if (status === 'authenticated' && params.id) {
      fetchTechnician()
    }
  }, [status, params.id])

  const fetchTechnician = async () => {
    try {
      const response = await fetch(`/api/admin/hr/technicians/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setFormData({
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone || '',
          employeeId: data.employeeId || '',
          baseSalary: data.baseSalary?.toString() || '',
          hourlyCost: data.hourlyCost?.toString() || '',
          isAvailable: data.isAvailable,
          isActive: data.user.isActive,
          specialties: data.specialties.map((s: any) => s.name)
        })
      } else {
        throw new Error('Technician not found')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo cargar el técnico',
        variant: 'destructive'
      })
      router.push('/admin/technicians')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/admin/hr/technicians/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          employeeId: formData.employeeId,
          baseSalary: parseFloat(formData.baseSalary) || 0,
          hourlyCost: parseFloat(formData.hourlyCost) || 0,
          isAvailable: formData.isAvailable,
          isActive: formData.isActive,
          specialties: formData.specialties
        })
      })

      if (response.ok) {
        toast({
          title: 'Éxito',
          description: 'Técnico actualizado correctamente'
        })
        router.push('/admin/technicians')
      } else {
        throw new Error('Error updating technician')
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo actualizar el técnico',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const specialtyOptions = [
    'Electricidad Industrial',
    'Electricidad Residencial',
    'Plomería',
    'HVAC',
    'Refrigeración',
    'Electrónica',
    'Mecánica',
    'Soldadura',
    'Automatización'
  ]

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
          <Link href="/admin/technicians" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Técnicos
          </Link>
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Save className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Editar Técnico</h1>
              <p className="text-gray-500">Actualizar información del técnico</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>Datos básicos del usuario</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employeeId">Código de Empleado</Label>
                  <Input
                    id="employeeId"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Información Laboral</CardTitle>
              <CardDescription>Configuración y disponibilidad</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="baseSalary">Salario Base</Label>
                  <Input
                    id="baseSalary"
                    type="number"
                    value={formData.baseSalary}
                    onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hourlyCost">Costo por Hora</Label>
                  <Input
                    id="hourlyCost"
                    type="number"
                    value={formData.hourlyCost}
                    onChange={(e) => setFormData({ ...formData, hourlyCost: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-6 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isAvailable"
                    checked={formData.isAvailable}
                    onCheckedChange={(checked) => setFormData({ ...formData, isAvailable: checked })}
                  />
                  <Label htmlFor="isAvailable">Disponible para asignaciones</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Cuenta Activa</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Especialidades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {specialtyOptions.map((specialty) => (
                  <label
                    key={specialty}
                    className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.specialties.includes(specialty)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.specialties.includes(specialty)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, specialties: [...formData.specialties, specialty] })
                        } else {
                          setFormData({ ...formData, specialties: formData.specialties.filter(s => s !== specialty) })
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{specialty}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Link href="/admin/technicians">
              <Button type="button" variant="outline">Cancelar</Button>
            </Link>
            <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
