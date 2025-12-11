'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Plus, Trash2, Loader2, Save } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'

interface ClientProfile {
  id: string
  companyName: string
  ruc: string | null
  user: {
    name: string
    email: string
  }
}

interface ServiceCategory {
  id: string
  name: string
  description: string | null
}

interface Rate {
  serviceCategoryId: string
  hourlyRate: string
  nightMultiplier: string
  weekendMultiplier: string
  holidayMultiplier: string
  emergencyMultiplier: string
}

interface SLA {
  priority: string
  firstResponseMinutes: string
  onSiteMinutes: string
  resolutionMinutes: string
  penaltyPercent: string
}

export default function NewContractPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  // Form state
  const [clientProfiles, setClientProfiles] = useState<ClientProfile[]>([])
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // Contract basic info
  const [clientProfileId, setClientProfileId] = useState('')
  const [type, setType] = useState('FRAMEWORK')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [autoRenewal, setAutoRenewal] = useState(false)
  const [paymentTerms, setPaymentTerms] = useState('30')
  const [emergencyLimit, setEmergencyLimit] = useState('')
  const [autoApproveLimit, setAutoApproveLimit] = useState('')
  const [discountPercent, setDiscountPercent] = useState('0')
  
  // Rates
  const [rates, setRates] = useState<Rate[]>([{
    serviceCategoryId: '',
    hourlyRate: '',
    nightMultiplier: '1.5',
    weekendMultiplier: '1.3',
    holidayMultiplier: '1.5',
    emergencyMultiplier: '2.0'
  }])
  
  // SLAs
  const [slas, setSlas] = useState<SLA[]>([
    {
      priority: 'NORMAL',
      firstResponseMinutes: '240',
      onSiteMinutes: '2880',
      resolutionMinutes: '7200',
      penaltyPercent: '0'
    },
    {
      priority: 'URGENT',
      firstResponseMinutes: '60',
      onSiteMinutes: '480',
      resolutionMinutes: '1440',
      penaltyPercent: '0'
    },
    {
      priority: 'EMERGENCY',
      firstResponseMinutes: '30',
      onSiteMinutes: '120',
      resolutionMinutes: '480',
      penaltyPercent: '0'
    }
  ])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [profilesRes, categoriesRes] = await Promise.all([
        fetch('/api/admin/client-profiles'),
        fetch('/api/admin/service-categories')
      ])
      
      if (profilesRes.ok && categoriesRes.ok) {
        const profilesData = await profilesRes.json()
        const categoriesData = await categoriesRes.json()
        setClientProfiles(profilesData)
        setServiceCategories(categoriesData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos necesarios",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const addRate = () => {
    setRates([...rates, {
      serviceCategoryId: '',
      hourlyRate: '',
      nightMultiplier: '1.5',
      weekendMultiplier: '1.3',
      holidayMultiplier: '1.5',
      emergencyMultiplier: '2.0'
    }])
  }

  const removeRate = (index: number) => {
    setRates(rates.filter((_, i) => i !== index))
  }

  const updateRate = (index: number, field: keyof Rate, value: string) => {
    const newRates = [...rates]
    newRates[index][field] = value
    setRates(newRates)
  }

  const updateSLA = (index: number, field: keyof SLA, value: string) => {
    const newSlas = [...slas]
    newSlas[index][field] = value
    setSlas(newSlas)
  }

  const handleSubmit = async () => {
    // Validation
    if (!clientProfileId || !startDate) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa el cliente y la fecha de inicio",
        variant: "destructive"
      })
      return
    }

    if (rates.some(r => !r.serviceCategoryId || !r.hourlyRate)) {
      toast({
        title: "Tarifas incompletas",
        description: "Por favor completa todas las tarifas",
        variant: "destructive"
      })
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/admin/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientProfileId,
          type,
          startDate,
          endDate: endDate || null,
          autoRenewal,
          paymentTerms,
          emergencyLimit: emergencyLimit || null,
          autoApproveLimit: autoApproveLimit || null,
          discountPercent,
          rates: rates.map(r => ({
            serviceCategoryId: r.serviceCategoryId,
            hourlyRate: r.hourlyRate,
            nightMultiplier: r.nightMultiplier,
            weekendMultiplier: r.weekendMultiplier,
            holidayMultiplier: r.holidayMultiplier,
            emergencyMultiplier: r.emergencyMultiplier
          })),
          slas: slas.map(s => ({
            priority: s.priority,
            firstResponseMinutes: s.firstResponseMinutes,
            onSiteMinutes: s.onSiteMinutes,
            resolutionMinutes: s.resolutionMinutes,
            penaltyPercent: s.penaltyPercent
          }))
        })
      })

      if (response.ok) {
        const contract = await response.json()
        toast({
          title: "Contrato creado",
          description: "El contrato ha sido creado exitosamente"
        })
        router.push(`/admin/contracts/${contract.id}`)
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "No se pudo crear el contrato",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error creating contract:', error)
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
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
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/admin/contracts')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nuevo Contrato</h1>
          <p className="text-slate-500 text-sm">Crea un nuevo contrato marco para un cliente</p>
        </div>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Información Básica</TabsTrigger>
          <TabsTrigger value="rates">Tarifas</TabsTrigger>
          <TabsTrigger value="slas">SLAs</TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Información del Contrato</CardTitle>
              <CardDescription>Datos generales y términos comerciales</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client">Cliente *</Label>
                  <Select value={clientProfileId} onValueChange={setClientProfileId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientProfiles.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.companyName} ({profile.ruc})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Contrato</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FRAMEWORK">Marco</SelectItem>
                      <SelectItem value="ON_DEMAND">Por Demanda</SelectItem>
                      <SelectItem value="PREVENTIVE">Preventivo</SelectItem>
                      <SelectItem value="DEDICATED">Dedicado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">Fecha de Inicio *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">Fecha de Fin</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">Términos de Pago (días)</Label>
                  <Input
                    id="paymentTerms"
                    type="number"
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discountPercent">Descuento (%)</Label>
                  <Input
                    id="discountPercent"
                    type="number"
                    step="0.1"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="autoApproveLimit">Límite de Aprobación Automática (S/)</Label>
                  <Input
                    id="autoApproveLimit"
                    type="number"
                    step="0.01"
                    value={autoApproveLimit}
                    onChange={(e) => setAutoApproveLimit(e.target.value)}
                    placeholder="Opcional"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyLimit">Límite de Emergencia (S/)</Label>
                  <Input
                    id="emergencyLimit"
                    type="number"
                    step="0.01"
                    value={emergencyLimit}
                    onChange={(e) => setEmergencyLimit(e.target.value)}
                    placeholder="Opcional"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="autoRenewal"
                  checked={autoRenewal}
                  onCheckedChange={(checked) => setAutoRenewal(checked as boolean)}
                />
                <Label htmlFor="autoRenewal" className="cursor-pointer">
                  Renovación automática
                </Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rates Tab */}
        <TabsContent value="rates">
          <Card>
            <CardHeader>
              <CardTitle>Tarifas por Categoría</CardTitle>
              <CardDescription>Define los costos horarios y multiplicadores</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {rates.map((rate, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Tarifa #{index + 1}</h4>
                    {rates.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRate(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-3 space-y-2">
                      <Label>Categoría de Servicio *</Label>
                      <Select
                        value={rate.serviceCategoryId}
                        onValueChange={(value) => updateRate(index, 'serviceCategoryId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {serviceCategories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Tarifa Base / Hora (S/) *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={rate.hourlyRate}
                        onChange={(e) => updateRate(index, 'hourlyRate', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Multiplicador Nocturno</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={rate.nightMultiplier}
                        onChange={(e) => updateRate(index, 'nightMultiplier', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Multiplicador Fin de Semana</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={rate.weekendMultiplier}
                        onChange={(e) => updateRate(index, 'weekendMultiplier', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Multiplicador Feriado</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={rate.holidayMultiplier}
                        onChange={(e) => updateRate(index, 'holidayMultiplier', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Multiplicador Emergencia</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={rate.emergencyMultiplier}
                        onChange={(e) => updateRate(index, 'emergencyMultiplier', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button onClick={addRate} variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Tarifa
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SLAs Tab */}
        <TabsContent value="slas">
          <Card>
            <CardHeader>
              <CardTitle>Niveles de Servicio (SLA)</CardTitle>
              <CardDescription>Define los tiempos de respuesta comprometidos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {slas.map((sla, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <h4 className="font-medium">
                    Prioridad: {sla.priority === 'NORMAL' ? 'Normal' : sla.priority === 'URGENT' ? 'Urgente' : 'Emergencia'}
                  </h4>

                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>1ra Respuesta (min)</Label>
                      <Input
                        type="number"
                        value={sla.firstResponseMinutes}
                        onChange={(e) => updateSLA(index, 'firstResponseMinutes', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>En Sitio (min)</Label>
                      <Input
                        type="number"
                        value={sla.onSiteMinutes}
                        onChange={(e) => updateSLA(index, 'onSiteMinutes', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Resolución (min)</Label>
                      <Input
                        type="number"
                        value={sla.resolutionMinutes}
                        onChange={(e) => updateSLA(index, 'resolutionMinutes', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Penalidad (%)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={sla.penaltyPercent}
                        onChange={(e) => updateSLA(index, 'penaltyPercent', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => router.push('/admin/contracts')}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Crear Contrato
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
