'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ChevronLeft, ChevronRight, Check, Upload, Loader2, Package, Wrench } from 'lucide-react'

interface Asset {
  id: string
  name: string
  brand?: string
  model?: string
}

interface ServiceCategory {
  id: string
  name: string
  services: Service[]
}

interface Service {
  id: string
  name: string
  description?: string
  basePrice: number
  estimatedHours?: number
}

export default function ServiceRequestWizard() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <ServiceRequestWizardContent />
    </Suspense>
  )
}

function ServiceRequestWizardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedAssetId = searchParams.get('assetId')

  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [assets, setAssets] = useState<Asset[]>([])
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [selectedServices, setSelectedServices] = useState<Service[]>([])

  const [formData, setFormData] = useState({
    assetId: preselectedAssetId || '',
    categoryId: '',
    serviceIds: [] as string[],
    priority: 'NORMAL',
    title: '',
    description: '',
    serviceAddress: '',
    contactPerson: '',
    contactPhone: '',
    preferredDate: '',
    requiresQuote: false,
    attachments: [] as File[]
  })

  useEffect(() => {
    fetchAssets()
    fetchCategories()
  }, [])

  const fetchAssets = async () => {
    try {
      const response = await fetch('/api/assets')
      if (response.ok) {
        const data = await response.json()
        setAssets(data)
      }
    } catch (error) {
      console.error('Error fetching assets:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/services/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleServiceToggle = (service: Service) => {
    const isSelected = formData.serviceIds.includes(service.id)
    if (isSelected) {
      setFormData({
        ...formData,
        serviceIds: formData.serviceIds.filter(id => id !== service.id)
      })
      setSelectedServices(selectedServices.filter(s => s.id !== service.id))
    } else {
      setFormData({
        ...formData,
        serviceIds: [...formData.serviceIds, service.id]
      })
      setSelectedServices([...selectedServices, service])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({
        ...formData,
        attachments: Array.from(e.target.files)
      })
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const submitData = new FormData()
      submitData.append('title', formData.title)
      submitData.append('description', formData.description)
      submitData.append('category', formData.categoryId)
      submitData.append('priority', formData.priority)
      submitData.append('requiresQuote', formData.requiresQuote.toString())
      submitData.append('serviceAddress', formData.serviceAddress)
      submitData.append('contactPerson', formData.contactPerson)
      submitData.append('contactPhone', formData.contactPhone)

      const response = await fetch('/api/client/work-orders', {
        method: 'POST',
        body: submitData
      })

      if (response.ok) {
        router.push('/client/dashboard')
      }
    } catch (error) {
      console.error('Error creating work order:', error)
    } finally {
      setLoading(false)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.assetId !== ''
      case 2:
        return formData.categoryId !== '' && formData.serviceIds.length > 0
      case 3:
        return formData.priority !== ''
      case 4:
        return formData.title && formData.description && formData.serviceAddress && formData.contactPerson && formData.contactPhone
      default:
        return true
    }
  }

  const steps = [
    { number: 1, title: 'Seleccionar Activo', icon: Package },
    { number: 2, title: 'Tipo de Servicio', icon: Wrench },
    { number: 3, title: 'Prioridad', icon: Check },
    { number: 4, title: 'Detalles', icon: Upload },
    { number: 5, title: 'Confirmación', icon: Check }
  ]

  const progress = (currentStep / steps.length) * 100

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Nueva Solicitud de Servicio</CardTitle>
          <Progress value={progress} className="mt-4" />
          
          {/* Steps Indicator */}
          <div className="flex justify-between mt-6">
            {steps.map((step) => (
              <div key={step.number} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep >= step.number ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentStep > step.number ? <Check className="h-5 w-5" /> : step.number}
                </div>
                <p className="text-xs mt-2 text-center hidden md:block">{step.title}</p>
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent className="min-h-96">
          {/* Step 1: Select Asset */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">¿Para qué activo es el servicio?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assets.map((asset) => (
                  <Card
                    key={asset.id}
                    className={`cursor-pointer transition-all ${
                      formData.assetId === asset.id ? 'border-blue-600 border-2 bg-blue-50' : 'hover:shadow-md'
                    }`}
                    onClick={() => setFormData({ ...formData, assetId: asset.id })}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{asset.name}</h4>
                          {asset.brand && asset.model && (
                            <p className="text-sm text-gray-600">{asset.brand} - {asset.model}</p>
                          )}
                        </div>
                        {formData.assetId === asset.id && (
                          <Check className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Select Service Type */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">¿Qué tipo de servicio necesitas?</h3>
              
              <div>
                <Label>Categoría</Label>
                <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.categoryId && (
                <div className="space-y-2">
                  <Label>Servicios</Label>
                  {categories.find(c => c.id === formData.categoryId)?.services.map((service) => (
                    <Card
                      key={service.id}
                      className={`cursor-pointer transition-all ${
                        formData.serviceIds.includes(service.id) ? 'border-blue-600 border-2 bg-blue-50' : 'hover:shadow-md'
                      }`}
                      onClick={() => handleServiceToggle(service)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{service.name}</h4>
                            {service.description && (
                              <p className="text-sm text-gray-600">{service.description}</p>
                            )}
                            <div className="flex gap-4 mt-2 text-sm text-gray-500">
                              <span>Precio base: ${service.basePrice}</span>
                              {service.estimatedHours && <span>Estimado: {service.estimatedHours}h</span>}
                            </div>
                          </div>
                          {formData.serviceIds.includes(service.id) && (
                            <Check className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Priority */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">¿Qué prioridad tiene esta solicitud?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { value: 'NORMAL', label: 'Normal', desc: '24-48 horas', color: 'blue' },
                  { value: 'URGENT', label: 'Urgente', desc: '4-8 horas', color: 'yellow' },
                  { value: 'EMERGENCY', label: 'Emergencia', desc: '< 2 horas', color: 'red' }
                ].map((priority) => (
                  <Card
                    key={priority.value}
                    className={`cursor-pointer transition-all ${
                      formData.priority === priority.value ? `border-${priority.color}-600 border-2 bg-${priority.color}-50` : 'hover:shadow-md'
                    }`}
                    onClick={() => setFormData({ ...formData, priority: priority.value })}
                  >
                    <CardContent className="p-6 text-center">
                      <h4 className="font-semibold text-lg">{priority.label}</h4>
                      <p className="text-sm text-gray-600 mt-2">{priority.desc}</p>
                      {formData.priority === priority.value && (
                        <Check className="h-6 w-6 mx-auto mt-3 text-blue-600" />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Details */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Detalles del Servicio</h3>
              
              <div>
                <Label>Título</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej. Reparación de motor principal"
                />
              </div>

              <div>
                <Label>Descripción del Problema</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe detalladamente el problema..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Dirección del Servicio</Label>
                  <Input
                    value={formData.serviceAddress}
                    onChange={(e) => setFormData({ ...formData, serviceAddress: e.target.value })}
                    placeholder="Dirección completa"
                  />
                </div>
                <div>
                  <Label>Persona de Contacto</Label>
                  <Input
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="Nombre completo"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Teléfono de Contacto</Label>
                  <Input
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="+1 234 567 8900"
                  />
                </div>
                <div>
                  <Label>Fecha Preferida (Opcional)</Label>
                  <Input
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="requiresQuote"
                  checked={formData.requiresQuote}
                  onChange={(e) => setFormData({ ...formData, requiresQuote: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="requiresQuote" className="cursor-pointer">
                  Requiere cotización previa
                </Label>
              </div>
            </div>
          )}

          {/* Step 5: Confirmation */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Confirmar Solicitud</h3>
              
              <Card className="bg-gray-50">
                <CardContent className="p-4 space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Activo</p>
                    <p className="font-medium">{assets.find(a => a.id === formData.assetId)?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Servicios Seleccionados</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedServices.map(s => (
                        <Badge key={s.id}>{s.name}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Prioridad</p>
                    <Badge>{formData.priority}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Título</p>
                    <p className="font-medium">{formData.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Descripción</p>
                    <p>{formData.description}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Contacto</p>
                    <p>{formData.contactPerson} - {formData.contactPhone}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>

            {currentStep < 5 ? (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceed()}
              >
                Siguiente
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Enviar Solicitud
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
