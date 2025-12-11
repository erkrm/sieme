'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { 
  Loader2, Upload, X, FileText, Image as ImageIcon, 
  AlertCircle, CheckCircle2, Save, Trash2, RotateCcw 
} from 'lucide-react'

const DRAFT_STORAGE_KEY = 'service_request_draft'
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_FILES = 5
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']

interface FormData {
  title: string
  description: string
  category: string
  priority: string
  requiresQuote: boolean
  serviceAddress: string
  contactPerson: string
  contactPhone: string
  attachments: File[]
}

interface FormErrors {
  title?: string
  description?: string
  category?: string
  priority?: string
  serviceAddress?: string
  contactPerson?: string
  contactPhone?: string
  attachments?: string
}

export default function SolicitarServicioPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    priority: 'MEDIUM',
    requiresQuote: false,
    serviceAddress: '',
    contactPerson: '',
    contactPhone: '',
    attachments: []
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [success, setSuccess] = useState(false)
  const [hasDraft, setHasDraft] = useState(false)
  const [savingDraft, setSavingDraft] = useState(false)

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_STORAGE_KEY)
    if (draft) {
      try {
        const parsedDraft = JSON.parse(draft)
        setHasDraft(true)
        toast({
          title: "Borrador encontrado",
          description: "Tienes un borrador guardado. ¿Deseas restaurarlo?",
          action: (
            <Button variant="outline" size="sm" onClick={loadDraft}>
              Restaurar
            </Button>
          ),
        })
      } catch (e) {
        localStorage.removeItem(DRAFT_STORAGE_KEY)
      }
    }
  }, [])

  const loadDraft = useCallback(() => {
    const draft = localStorage.getItem(DRAFT_STORAGE_KEY)
    if (draft) {
      try {
        const parsedDraft = JSON.parse(draft)
        setFormData(prev => ({
          ...prev,
          ...parsedDraft,
          attachments: [] // Don't restore files
        }))
        toast({
          title: "Borrador restaurado",
          description: "Se ha cargado tu borrador anterior.",
        })
        setHasDraft(false)
      } catch (e) {
        toast({
          title: "Error",
          description: "No se pudo cargar el borrador.",
          variant: "destructive",
        })
      }
    }
  }, [toast])

  const saveDraft = useCallback(() => {
    setSavingDraft(true)
    try {
      const draftData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        requiresQuote: formData.requiresQuote,
        serviceAddress: formData.serviceAddress,
        contactPerson: formData.contactPerson,
        contactPhone: formData.contactPhone,
      }
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData))
      toast({
        title: "Borrador guardado",
        description: "Tu progreso ha sido guardado.",
      })
    } catch (e) {
      toast({
        title: "Error",
        description: "No se pudo guardar el borrador.",
        variant: "destructive",
      })
    } finally {
      setSavingDraft(false)
    }
  }, [formData, toast])

  const deleteDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_STORAGE_KEY)
    setHasDraft(false)
    toast({
      title: "Borrador eliminado",
      description: "El borrador ha sido eliminado.",
    })
  }, [toast])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido'
    } else if (formData.title.length < 5) {
      newErrors.title = 'El título debe tener al menos 5 caracteres'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida'
    } else if (formData.description.length < 20) {
      newErrors.description = 'La descripción debe tener al menos 20 caracteres'
    }

    if (!formData.category) {
      newErrors.category = 'Selecciona una categoría'
    }

    if (!formData.serviceAddress.trim()) {
      newErrors.serviceAddress = 'La dirección del servicio es requerida'
    }

    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = 'El nombre de contacto es requerido'
    }

    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = 'El teléfono es requerido'
    } else if (!/^\+?[\d\s-()]{8,}$/.test(formData.contactPhone)) {
      newErrors.contactPhone = 'Formato de teléfono inválido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return `${file.name}: Tipo de archivo no permitido. Solo se permiten imágenes y PDFs.`
    }
    if (file.size > MAX_FILE_SIZE) {
      return `${file.name}: El archivo excede el tamaño máximo de 10MB.`
    }
    return null
  }

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      const errors: string[] = []
      const validFiles: File[] = []

      files.forEach(file => {
        const error = validateFile(file)
        if (error) {
          errors.push(error)
        } else {
          validFiles.push(file)
        }
      })

      if (errors.length > 0) {
        toast({
          title: "Archivos no validos",
          description: errors.join('\n'),
          variant: "destructive",
        })
      }

      if (validFiles.length > 0) {
        setFormData(prev => ({ 
          ...prev, 
          attachments: [...prev.attachments, ...validFiles].slice(0, MAX_FILES)
        }))
        toast({
          title: "Archivos agregados",
          description: `${validFiles.length} archivo(s) agregado(s) correctamente.`,
        })
      }
    }
  }, [toast])

  const removeFile = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }))
  }, [])

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Errores de validacion",
        description: "Por favor corrige los errores en el formulario.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setUploadProgress(0)

    try {
      const submitData = new FormData()
      submitData.append('title', formData.title)
      submitData.append('description', formData.description)
      submitData.append('category', formData.category)
      submitData.append('priority', formData.priority)
      submitData.append('requiresQuote', formData.requiresQuote.toString())
      submitData.append('serviceAddress', formData.serviceAddress)
      submitData.append('contactPerson', formData.contactPerson)
      submitData.append('contactPhone', formData.contactPhone)

      formData.attachments.forEach((file, index) => {
        submitData.append(`file_${index}`, file)
      })

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch('/api/client/work-orders', {
        method: 'POST',
        body: submitData
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const data = await response.json()

      if (response.ok) {
        localStorage.removeItem(DRAFT_STORAGE_KEY)
        setSuccess(true)
        toast({
          title: "Solicitud creada",
          description: "Tu solicitud ha sido enviada exitosamente.",
        })
        
        // Redirect after 2 seconds
        setTimeout(() => {
          router.push('/client/dashboard')
        }, 2000)
      } else {
        throw new Error(data.error || 'Error al crear la solicitud')
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error de conexión. Por favor intenta nuevamente.'
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold">Solicitud Enviada</h2>
              <p className="text-gray-600">
                Tu solicitud de servicio ha sido enviada exitosamente. Serás redirigido al dashboard...
              </p>
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Solicitar Servicio</h1>
        <p className="text-muted-foreground mt-1">
          Completa el formulario para solicitar un nuevo servicio
        </p>
      </div>

      {hasDraft && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Tienes un borrador guardado</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadDraft}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Restaurar
              </Button>
              <Button variant="outline" size="sm" onClick={deleteDraft}>
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
              <CardDescription>Proporciona los detalles principales de tu solicitud</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título de la Solicitud *</Label>
                <Input
                  id="title"
                  placeholder="Ej: Reparación de aire acondicionado"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción Detallada *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe el problema o servicio que necesitas..."
                  rows={5}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description}</p>
                )}
                <p className="text-xs text-gray-500">
                  {formData.description.length} caracteres (mínimo 20)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MANTENIMIENTO">Mantenimiento</SelectItem>
                      <SelectItem value="REPARACION">Reparación</SelectItem>
                      <SelectItem value="INSTALACION">Instalación</SelectItem>
                      <SelectItem value="INSPECCION">Inspección</SelectItem>
                      <SelectItem value="EMERGENCIA">Emergencia</SelectItem>
                      <SelectItem value="OTRO">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-red-500">{errors.category}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridad</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Baja</SelectItem>
                      <SelectItem value="MEDIUM">Media</SelectItem>
                      <SelectItem value="HIGH">Alta</SelectItem>
                      <SelectItem value="URGENT">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="requiresQuote"
                  checked={formData.requiresQuote}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, requiresQuote: checked as boolean }))
                  }
                />
                <Label htmlFor="requiresQuote" className="cursor-pointer">
                  Requiere cotización previa
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Información de Contacto</CardTitle>
              <CardDescription>Datos para coordinar el servicio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="serviceAddress">Dirección del Servicio *</Label>
                <Input
                  id="serviceAddress"
                  placeholder="Dirección completa donde se realizará el servicio"
                  value={formData.serviceAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, serviceAddress: e.target.value }))}
                  className={errors.serviceAddress ? 'border-red-500' : ''}
                />
                {errors.serviceAddress && (
                  <p className="text-sm text-red-500">{errors.serviceAddress}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Persona de Contacto *</Label>
                  <Input
                    id="contactPerson"
                    placeholder="Nombre completo"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                    className={errors.contactPerson ? 'border-red-500' : ''}
                  />
                  {errors.contactPerson && (
                    <p className="text-sm text-red-500">{errors.contactPerson}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Teléfono de Contacto *</Label>
                  <Input
                    id="contactPhone"
                    placeholder="+34 123 456 789"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                    className={errors.contactPhone ? 'border-red-500' : ''}
                  />
                  {errors.contactPhone && (
                    <p className="text-sm text-red-500">{errors.contactPhone}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File Attachments */}
          <Card>
            <CardHeader>
              <CardTitle>Archivos Adjuntos</CardTitle>
              <CardDescription>
                Adjunta imágenes o documentos relacionados (Máximo {MAX_FILES} archivos, 10MB cada uno)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  disabled={formData.attachments.length >= MAX_FILES}
                />
                <label
                  htmlFor="file-upload"
                  className={`cursor-pointer ${formData.attachments.length >= MAX_FILES ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Haz clic para seleccionar archivos
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF, WEBP o PDF (máx. 10MB)
                  </p>
                </label>
              </div>

              {formData.attachments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Archivos seleccionados ({formData.attachments.length}/{MAX_FILES})
                  </p>
                  <div className="space-y-2">
                    {formData.attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {file.type.startsWith('image/') ? (
                            <ImageIcon className="h-5 w-5 text-blue-600" />
                          ) : (
                            <FileText className="h-5 w-5 text-red-600" />
                          )}
                          <div>
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upload Progress */}
          {loading && uploadProgress > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subiendo archivos...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={saveDraft}
              disabled={loading || savingDraft}
            >
              {savingDraft ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Guardar Borrador
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="min-w-[200px]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar Solicitud'
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}