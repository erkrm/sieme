'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Loader2, Save, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface ServiceCategory {
  id: string
  name: string
}

interface Rate {
  id?: string
  serviceCategoryId: string
  hourlyRate: string
  nightMultiplier: string
  weekendMultiplier: string
  holidayMultiplier: string
  emergencyMultiplier: string
}

interface SLA {
  id?: string
  priority: string
  firstResponseMinutes: string
  onSiteMinutes: string
  resolutionMinutes: string
  penaltyPercent: string
}

export default function EditContractPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  
  const [formData, setFormData] = useState({
    type: 'FRAMEWORK',
    status: 'ACTIVE',
    startDate: '',
    endDate: '',
    autoRenewal: true,
    paymentTerms: '30',
    emergencyLimit: '',
    autoApproveLimit: '',
    discountPercent: '0'
  })
  
  const [rates, setRates] = useState<Rate[]>([])
  const [slas, setSlas] = useState<SLA[]>([])

  useEffect(() => {
    fetchData()
  }, [params.id])

  const fetchData = async () => {
    try {
      const [contractRes, categoriesRes] = await Promise.all([
        fetch(`/api/admin/contracts/${params.id}`),
        fetch('/api/admin/service-categories')
      ])
      
      if (contractRes.ok) {
        const contract = await contractRes.json()
        setFormData({
          type: contract.type,
          status: contract.status,
          startDate: contract.startDate.split('T')[0],
          endDate: contract.endDate ? contract.endDate.split('T')[0] : '',
          autoRenewal: contract.autoRenewal,
          paymentTerms: String(contract.paymentTerms),
          emergencyLimit: contract.emergencyLimit ? String(contract.emergencyLimit) : '',
          autoApproveLimit: contract.autoApproveLimit ? String(contract.autoApproveLimit) : '',
          discountPercent: String(contract.discountPercent)
        })
        setRates(contract.rates.map((r: any) => ({
          id: r.id,
          serviceCategoryId: r.serviceCategory?.id || r.serviceCategoryId,
          hourlyRate: String(r.hourlyRate),
          nightMultiplier: String(r.nightMultiplier),
          weekendMultiplier: String(r.weekendMultiplier),
          holidayMultiplier: String(r.holidayMultiplier),
          emergencyMultiplier: String(r.emergencyMultiplier)
        })))
        setSlas(contract.slas.map((s: any) => ({
          id: s.id,
          priority: s.priority,
          firstResponseMinutes: String(s.firstResponseMinutes),
          onSiteMinutes: String(s.onSiteMinutes),
          resolutionMinutes: String(s.resolutionMinutes),
          penaltyPercent: String(s.penaltyPercent)
        })))
      }
      
      if (categoriesRes.ok) {
        setCategories(await categoriesRes.json())
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({ title: 'Error', description: 'No se pudo cargar el contrato', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const addRate = () => {
    setRates([...rates, {
      serviceCategoryId: '',
      hourlyRate: '50',
      nightMultiplier: '1.5',
      weekendMultiplier: '1.5',
      holidayMultiplier: '2',
      emergencyMultiplier: '2'
    }])
  }

  const removeRate = (index: number) => setRates(rates.filter((_, i) => i !== index))

  const updateRate = (index: number, field: keyof Rate, value: string) => {
    const newRates = [...rates]
    newRates[index] = { ...newRates[index], [field]: value }
    setRates(newRates)
  }

  const updateSLA = (index: number, field: keyof SLA, value: string) => {
    const newSLAs = [...slas]
    newSLAs[index] = { ...newSLAs[index], [field]: value }
    setSlas(newSLAs)
  }

  const handleSubmit = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/contracts/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          paymentTerms: parseInt(formData.paymentTerms),
          emergencyLimit: formData.emergencyLimit ? parseFloat(formData.emergencyLimit) : null,
          autoApproveLimit: formData.autoApproveLimit ? parseFloat(formData.autoApproveLimit) : null,
          discountPercent: parseFloat(formData.discountPercent),
          rates: rates.map(r => ({
            ...r,
            hourlyRate: parseFloat(r.hourlyRate),
            nightMultiplier: parseFloat(r.nightMultiplier),
            weekendMultiplier: parseFloat(r.weekendMultiplier),
            holidayMultiplier: parseFloat(r.holidayMultiplier),
            emergencyMultiplier: parseFloat(r.emergencyMultiplier)
          })),
          slas: slas.map(s => ({
            ...s,
            firstResponseMinutes: parseInt(s.firstResponseMinutes),
            onSiteMinutes: parseInt(s.onSiteMinutes),
            resolutionMinutes: parseInt(s.resolutionMinutes),
            penaltyPercent: parseFloat(s.penaltyPercent)
          }))
        })
      })

      if (response.ok) {
        toast({ title: 'Éxito', description: 'Contrato actualizado correctamente' })
        router.push(`/admin/contracts/${params.id}`)
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Error al actualizar')
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/admin/contracts/${params.id}`}>
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Editar Contrato</h1>
          <p className="text-gray-500">Actualiza la información del contrato</p>
        </div>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="rates">Tarifas ({rates.length})</TabsTrigger>
          <TabsTrigger value="sla">SLA ({slas.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Contrato</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FRAMEWORK">Marco</SelectItem>
                      <SelectItem value="ON_DEMAND">Por Demanda</SelectItem>
                      <SelectItem value="PREVENTIVE">Preventivo</SelectItem>
                      <SelectItem value="DEDICATED">Dedicado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Borrador</SelectItem>
                      <SelectItem value="ACTIVE">Activo</SelectItem>
                      <SelectItem value="EXPIRED">Vencido</SelectItem>
                      <SelectItem value="TERMINATED">Terminado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Fecha de Inicio</Label>
                  <Input type="date" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Fecha de Fin</Label>
                  <Input type="date" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Términos de Pago (días)</Label>
                  <Input type="number" value={formData.paymentTerms} onChange={(e) => setFormData({...formData, paymentTerms: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Descuento (%)</Label>
                  <Input type="number" value={formData.discountPercent} onChange={(e) => setFormData({...formData, discountPercent: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Límite Aprobación Automática</Label>
                  <Input type="number" value={formData.autoApproveLimit} onChange={(e) => setFormData({...formData, autoApproveLimit: e.target.value})} placeholder="Sin límite" />
                </div>
                <div className="space-y-2">
                  <Label>Límite Emergencias</Label>
                  <Input type="number" value={formData.emergencyLimit} onChange={(e) => setFormData({...formData, emergencyLimit: e.target.value})} placeholder="Sin límite" />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-4">
                <Switch checked={formData.autoRenewal} onCheckedChange={(c) => setFormData({...formData, autoRenewal: c})} />
                <Label>Renovación Automática</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rates">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Tarifas por Categoría</CardTitle>
              <Button onClick={addRate} size="sm"><Plus className="h-4 w-4 mr-2" />Agregar</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {rates.map((rate, idx) => (
                <div key={idx} className="grid grid-cols-7 gap-2 items-end p-4 bg-gray-50 rounded-lg">
                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs">Categoría</Label>
                    <Select value={rate.serviceCategoryId} onValueChange={(v) => updateRate(idx, 'serviceCategoryId', v)}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>
                        {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">$/Hora</Label>
                    <Input type="number" value={rate.hourlyRate} onChange={(e) => updateRate(idx, 'hourlyRate', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Noct. x</Label>
                    <Input type="number" step="0.1" value={rate.nightMultiplier} onChange={(e) => updateRate(idx, 'nightMultiplier', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">F.Sem. x</Label>
                    <Input type="number" step="0.1" value={rate.weekendMultiplier} onChange={(e) => updateRate(idx, 'weekendMultiplier', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Feriado x</Label>
                    <Input type="number" step="0.1" value={rate.holidayMultiplier} onChange={(e) => updateRate(idx, 'holidayMultiplier', e.target.value)} />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeRate(idx)} className="text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {rates.length === 0 && <p className="text-center text-gray-500 py-4">Sin tarifas configuradas</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sla">
          <Card>
            <CardHeader>
              <CardTitle>Niveles de Servicio (SLA)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {slas.map((sla, idx) => (
                <div key={idx} className="grid grid-cols-6 gap-2 items-end p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-xs">Prioridad</Label>
                    <Input value={sla.priority} disabled className="bg-gray-100" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">1ra Resp. (min)</Label>
                    <Input type="number" value={sla.firstResponseMinutes} onChange={(e) => updateSLA(idx, 'firstResponseMinutes', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">En Sitio (min)</Label>
                    <Input type="number" value={sla.onSiteMinutes} onChange={(e) => updateSLA(idx, 'onSiteMinutes', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Resolución (min)</Label>
                    <Input type="number" value={sla.resolutionMinutes} onChange={(e) => updateSLA(idx, 'resolutionMinutes', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Penalidad (%)</Label>
                    <Input type="number" step="0.1" value={sla.penaltyPercent} onChange={(e) => updateSLA(idx, 'penaltyPercent', e.target.value)} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4">
        <Link href={`/admin/contracts/${params.id}`}>
          <Button variant="outline">Cancelar</Button>
        </Link>
        <Button onClick={handleSubmit} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
          {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Guardando...</> : <><Save className="h-4 w-4 mr-2" />Guardar Cambios</>}
        </Button>
      </div>
    </div>
  )
}
