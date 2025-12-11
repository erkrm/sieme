'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, 
  Loader2, 
  Save, 
  User, 
  Phone, 
  Mail, 
  Calendar,
  Award,
  Wrench,
  Clock,
  Edit2,
  CheckCircle
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'

interface Technician {
  id: string
  userId: string
  employeeId: string | null
  hireDate: string | null
  baseSalary: number | null
  hourlyCost: number | null
  isAvailable: boolean
  user: {
    id: string
    name: string
    email: string
    phone: string | null
    isActive: boolean
  }
  specialties: Array<{ id: string; name: string; level: string }>
  certifications: Array<{ id: string; name: string; issueDate: string; expiryDate: string | null }>
}

export default function TechnicianDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  
  const [technician, setTechnician] = useState<Technician | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    employeeId: '',
    baseSalary: '',
    hourlyCost: '',
    isAvailable: true,
    isActive: true
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
        setTechnician(data)
        setFormData({
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone || '',
          employeeId: data.employeeId || '',
          baseSalary: data.baseSalary?.toString() || '',
          hourlyCost: data.hourlyCost?.toString() || '',
          isAvailable: data.isAvailable,
          isActive: data.user.isActive
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

  const handleSave = async () => {
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
          isActive: formData.isActive
        })
      })

      if (response.ok) {
        toast({
          title: 'Éxito',
          description: 'Técnico actualizado correctamente'
        })
        setIsEditing(false)
        fetchTechnician()
      } else {
        throw new Error('Error updating technician')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el técnico',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-48 mb-8" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    )
  }

  if (!technician) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/technicians" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Técnicos
          </Link>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">
                  {technician.user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{technician.user.name}</h1>
                <p className="text-gray-500">{technician.employeeId || 'Sin código'}</p>
                <div className="flex gap-2 mt-2">
                  {technician.user.isActive ? (
                    <Badge className="bg-green-100 text-green-800">Activo</Badge>
                  ) : (
                    <Badge variant="destructive">Inactivo</Badge>
                  )}
                  {technician.isAvailable ? (
                    <Badge className="bg-blue-100 text-blue-800">Disponible</Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-800">Ocupado</Badge>
                  )}
                </div>
              </div>
            </div>
            <Link href={`/admin/technicians/${technician.id}/edit`}>
              <Button>
                <Edit2 className="h-4 w-4 mr-2" />
                Editar Técnico
              </Button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue="info" className="space-y-6">
          <TabsList>
            <TabsTrigger value="info">Información</TabsTrigger>
            <TabsTrigger value="specialties">Especialidades</TabsTrigger>
            <TabsTrigger value="certifications">Certificaciones</TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <Card>
              <CardHeader>
                <CardTitle>Información Personal y Laboral</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {isEditing ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nombre Completo</Label>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Teléfono</Label>
                        <Input
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Código de Empleado</Label>
                        <Input
                          value={formData.employeeId}
                          onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Salario Base</Label>
                        <Input
                          type="number"
                          value={formData.baseSalary}
                          onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Costo por Hora</Label>
                        <Input
                          type="number"
                          value={formData.hourlyCost}
                          onChange={(e) => setFormData({ ...formData, hourlyCost: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex gap-6 pt-4 border-t">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={formData.isAvailable}
                          onCheckedChange={(checked) => setFormData({ ...formData, isAvailable: checked })}
                        />
                        <Label>Disponible para asignaciones</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={formData.isActive}
                          onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                        />
                        <Label>Cuenta activa</Label>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleSave} disabled={saving}>
                        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                        Guardar Cambios
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{technician.user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Teléfono</p>
                        <p className="font-medium">{technician.user.phone || 'No especificado'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Fecha de Contratación</p>
                        <p className="font-medium">
                          {technician.hireDate 
                            ? new Date(technician.hireDate).toLocaleDateString('es-ES') 
                            : 'No especificada'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Código de Empleado</p>
                        <p className="font-medium">{technician.employeeId || 'No asignado'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="specialties">
            <Card>
              <CardHeader>
                <CardTitle>Especialidades</CardTitle>
                <CardDescription>Áreas de especialización del técnico</CardDescription>
              </CardHeader>
              <CardContent>
                {technician.specialties.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No hay especialidades registradas</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {technician.specialties.map((spec) => (
                      <div key={spec.id} className="flex items-center gap-3 p-4 border rounded-lg">
                        <Wrench className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">{spec.name}</p>
                          <p className="text-sm text-gray-500">Nivel: {spec.level}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certifications">
            <Card>
              <CardHeader>
                <CardTitle>Certificaciones</CardTitle>
                <CardDescription>Certificaciones y acreditaciones</CardDescription>
              </CardHeader>
              <CardContent>
                {technician.certifications.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No hay certificaciones registradas</p>
                ) : (
                  <div className="space-y-4">
                    {technician.certifications.map((cert) => (
                      <div key={cert.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Award className="h-5 w-5 text-yellow-600" />
                          <div>
                            <p className="font-medium">{cert.name}</p>
                            <p className="text-sm text-gray-500">
                              Emitida: {new Date(cert.issueDate).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                        </div>
                        {cert.expiryDate && (
                          <Badge variant={new Date(cert.expiryDate) > new Date() ? 'default' : 'destructive'}>
                            {new Date(cert.expiryDate) > new Date() ? 'Vigente' : 'Expirada'}
                          </Badge>
                        )}
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
