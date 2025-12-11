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
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Loader2, Save, UserPlus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function NewTechnicianPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    // User data
    name: '',
    email: '',
    phone: '',
    password: '',
    // Technician profile data
    employeeId: '',
    hireDate: new Date().toISOString().split('T')[0],
    baseSalary: '',
    hourlyCost: '',
    isAvailable: true,
    // Specialties
    specialties: [] as string[]
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Create user and profile in one go
      const response = await fetch('/api/admin/hr/technicians', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // User data
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          // Profile data
          employeeCode: formData.employeeId,
          hireDate: formData.hireDate,
          baseSalary: formData.baseSalary,
          hourlyCost: formData.hourlyCost,
          isAvailable: formData.isAvailable,
          specialties: formData.specialties
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error creating technician')
      }

      toast({
        title: 'Éxito',
        description: 'Técnico creado correctamente'
      })

      router.push('/admin/technicians')
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo crear el técnico',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/technicians" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Técnicos
          </Link>
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <UserPlus className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Nuevo Técnico</h1>
              <p className="text-gray-500">Complete los datos para crear un nuevo técnico</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* User Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>Datos de la cuenta de usuario</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Juan Pérez"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="juan@empresa.com"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 234 567 8900"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Mínimo 6 caracteres"
                    required
                    minLength={6}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Employment Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Información Laboral</CardTitle>
              <CardDescription>Datos de contratación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employeeId">Código de Empleado *</Label>
                  <Input
                    id="employeeId"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    placeholder="TEC-001"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hireDate">Fecha de Contratación *</Label>
                  <Input
                    id="hireDate"
                    type="date"
                    value={formData.hireDate}
                    onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="baseSalary">Salario Base</Label>
                  <Input
                    id="baseSalary"
                    type="number"
                    value={formData.baseSalary}
                    onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hourlyCost">Costo por Hora</Label>
                  <Input
                    id="hourlyCost"
                    type="number"
                    value={formData.hourlyCost}
                    onChange={(e) => setFormData({ ...formData, hourlyCost: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-4">
                <Switch
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onCheckedChange={(checked) => setFormData({ ...formData, isAvailable: checked })}
                />
                <Label htmlFor="isAvailable">Disponible para asignaciones</Label>
              </div>
            </CardContent>
          </Card>

          {/* Specialties */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Especialidades</CardTitle>
              <CardDescription>Seleccione las áreas de especialización</CardDescription>
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

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Link href="/admin/technicians">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Crear Técnico
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
