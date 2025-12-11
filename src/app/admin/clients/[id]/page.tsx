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
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Loader2, Save, Building2, Edit2, Mail, Phone, MapPin, FileText } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'

export default function ClientDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  
  const [client, setClient] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', companyName: '', ruc: '', businessType: '', address: '', industry: '', isActive: true
  })

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'ADMIN' && params.id) {
      fetchClient()
    }
  }, [status, session, params.id])

  const fetchClient = async () => {
    try {
      const response = await fetch(`/api/admin/clients/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setClient(data)
        setFormData({
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone || '',
          companyName: data.companyName,
          ruc: data.ruc || '',
          businessType: data.businessType || '',
          address: data.address || '',
          industry: data.industry || '',
          isActive: data.user.isActive
        })
      } else {
        throw new Error('Client not found')
      }
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo cargar el cliente', variant: 'destructive' })
      router.push('/admin/clients')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/clients/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (response.ok) {
        toast({ title: 'Éxito', description: 'Cliente actualizado' })
        setIsEditing(false)
        fetchClient()
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
          <Link href="/admin/clients" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />Volver
          </Link>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Building2 className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{client?.companyName}</h1>
                <p className="text-gray-500">{client?.user?.name}</p>
                <div className="flex gap-2 mt-1">
                  <Badge className={client?.user?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {client?.user?.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                  {client?.industry && <Badge variant="secondary">{client.industry}</Badge>}
                </div>
              </div>
            </div>
            <Button variant={isEditing ? 'outline' : 'default'} onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? 'Cancelar' : <><Edit2 className="h-4 w-4 mr-2" />Editar</>}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="info">
          <TabsList><TabsTrigger value="info">Información</TabsTrigger><TabsTrigger value="locations">Sucursales ({client?.locations?.length || 0})</TabsTrigger><TabsTrigger value="contracts">Contratos ({client?.contracts?.length || 0})</TabsTrigger></TabsList>
          
          <TabsContent value="info">
            <Card>
              <CardHeader><CardTitle>Información del Cliente</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                {isEditing ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Empresa</Label><Input value={formData.companyName} onChange={(e) => setFormData({...formData, companyName: e.target.value})} /></div>
                      <div className="space-y-2"><Label>RUC</Label><Input value={formData.ruc} onChange={(e) => setFormData({...formData, ruc: e.target.value})} /></div>
                      <div className="space-y-2"><Label>Contacto</Label><Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
                      <div className="space-y-2"><Label>Email</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} /></div>
                      <div className="space-y-2"><Label>Teléfono</Label><Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} /></div>
                      <div className="space-y-2"><Label>Industria</Label><Input value={formData.industry} onChange={(e) => setFormData({...formData, industry: e.target.value})} /></div>
                    </div>
                    <div className="space-y-2"><Label>Dirección</Label><Input value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} /></div>
                    <div className="flex items-center space-x-2"><Switch checked={formData.isActive} onCheckedChange={(c) => setFormData({...formData, isActive: c})} /><Label>Activo</Label></div>
                    <div className="flex justify-end gap-3 pt-4">
                      <Button variant="outline" onClick={() => setIsEditing(false)}>Cancelar</Button>
                      <Button onClick={handleSave} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}Guardar</Button>
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex items-center gap-3"><Mail className="h-5 w-5 text-gray-400" /><div><p className="text-sm text-gray-500">Email</p><p className="font-medium">{client?.user?.email}</p></div></div>
                    <div className="flex items-center gap-3"><Phone className="h-5 w-5 text-gray-400" /><div><p className="text-sm text-gray-500">Teléfono</p><p className="font-medium">{client?.user?.phone || 'N/A'}</p></div></div>
                    <div className="flex items-center gap-3"><FileText className="h-5 w-5 text-gray-400" /><div><p className="text-sm text-gray-500">RUC</p><p className="font-medium">{client?.ruc || 'N/A'}</p></div></div>
                    <div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-gray-400" /><div><p className="text-sm text-gray-500">Dirección</p><p className="font-medium">{client?.address || 'N/A'}</p></div></div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="locations">
            <Card>
              <CardContent className="pt-6">
                {client?.locations?.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Sin sucursales registradas</p>
                ) : (
                  <div className="space-y-4">
                    {client?.locations?.map((loc: any) => (
                      <div key={loc.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <MapPin className="h-5 w-5 text-green-600" />
                        <div><p className="font-medium">{loc.name}</p><p className="text-sm text-gray-500">{loc.address}</p></div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="contracts">
            <Card>
              <CardContent className="pt-6">
                {client?.contracts?.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Sin contratos registrados</p>
                ) : (
                  <div className="space-y-4">
                    {client?.contracts?.map((contract: any) => (
                      <div key={contract.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div><p className="font-medium">{contract.type}</p><p className="text-sm text-gray-500">Órdenes: {contract._count?.workOrders || 0}</p></div>
                        <Badge>{contract.status}</Badge>
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
