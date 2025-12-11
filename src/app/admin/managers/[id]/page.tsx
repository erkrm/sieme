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
import { ArrowLeft, Loader2, Save, UserCog, Edit2, Mail, Phone, Building } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'

export default function ManagerDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  
  const [manager, setManager] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', employeeId: '', department: '', isActive: true
  })

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'ADMIN' && params.id) {
      fetchManager()
    }
  }, [status, session, params.id])

  const fetchManager = async () => {
    try {
      const response = await fetch(`/api/admin/managers/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setManager(data)
        setFormData({
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone || '',
          employeeId: data.employeeId || '',
          department: data.department || '',
          isActive: data.user.isActive
        })
      } else {
        throw new Error('Manager not found')
      }
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo cargar el manager', variant: 'destructive' })
      router.push('/admin/managers')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/managers/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (response.ok) {
        toast({ title: 'Éxito', description: 'Manager actualizado' })
        setIsEditing(false)
        fetchManager()
      } else {
        throw new Error('Error updating')
      }
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo actualizar', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-50 p-8"><Skeleton className="h-[400px] max-w-4xl mx-auto" /></div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/admin/managers" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />Volver
          </Link>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-purple-600">{manager?.user?.name?.charAt(0)}</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">{manager?.user?.name}</h1>
                <p className="text-gray-500">{manager?.department || 'Sin departamento'}</p>
                <Badge className={manager?.user?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {manager?.user?.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </div>
            <Button variant={isEditing ? 'outline' : 'default'} onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? 'Cancelar' : <><Edit2 className="h-4 w-4 mr-2" />Editar</>}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader><CardTitle>Información</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            {isEditing ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre</Label>
                    <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Teléfono</Label>
                    <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Código</Label>
                    <Input value={formData.employeeId} onChange={(e) => setFormData({...formData, employeeId: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Departamento</Label>
                    <Input value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Switch checked={formData.isActive} onCheckedChange={(c) => setFormData({...formData, isActive: c})} />
                    <Label>Activo</Label>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>Cancelar</Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}Guardar
                  </Button>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center gap-3"><Mail className="h-5 w-5 text-gray-400" /><div><p className="text-sm text-gray-500">Email</p><p className="font-medium">{manager?.user?.email}</p></div></div>
                <div className="flex items-center gap-3"><Phone className="h-5 w-5 text-gray-400" /><div><p className="text-sm text-gray-500">Teléfono</p><p className="font-medium">{manager?.user?.phone || 'N/A'}</p></div></div>
                <div className="flex items-center gap-3"><UserCog className="h-5 w-5 text-gray-400" /><div><p className="text-sm text-gray-500">Código</p><p className="font-medium">{manager?.employeeId || 'N/A'}</p></div></div>
                <div className="flex items-center gap-3"><Building className="h-5 w-5 text-gray-400" /><div><p className="text-sm text-gray-500">Departamento</p><p className="font-medium">{manager?.department || 'Sin asignar'}</p></div></div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
