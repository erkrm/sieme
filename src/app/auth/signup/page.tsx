'use client'

import React, { useState, Suspense, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Wrench, Eye, EyeOff, Loader2, Building, User, Users, Crown, Settings, CheckCircle } from 'lucide-react'
import PasswordStrength from '@/components/password-strength'

interface RoleConfig {
  title: string
  description: string
  icon: React.ReactNode
  fields: React.ReactNode
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <SignUpContent />
    </Suspense>
  )
}

function SignUpContent() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'CLIENT',
    phone: '',
    companyName: '',
    ruc: '',
    businessType: '',
    address: '',
    specialties: [] as string[],
    experience: '',
    employeeId: '',
    department: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [step, setStep] = useState(1)
  const [showSuccess, setShowSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialRole = searchParams.get('role') || 'CLIENT'
  const firstFieldRef = useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (initialRole && ['CLIENT', 'TECHNICIAN', 'MANAGER'].includes(initialRole)) {
      setFormData(prev => ({ ...prev, role: initialRole }))
    }
  }, [initialRole])

  // Auto-focus first field on mount and step change
  useEffect(() => {
    setTimeout(() => {
      firstFieldRef.current?.focus()
    }, 100)
  }, [step])

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateStep = () => {
    setFieldErrors({})
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        setError('Por favor completa todos los campos requeridos')
        return false
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Las contraseñas no coinciden')
        setFieldErrors({ confirmPassword: 'Las contraseñas no coinciden' })
        return false
      }
      if (formData.password.length < 8) {
        setError('La contraseña debe tener al menos 8 caracteres')
        setFieldErrors({ password: 'Muy corta' })
        return false
      }
      // Check password complexity
      if (!/[A-Z]/.test(formData.password) || !/[a-z]/.test(formData.password) || 
          !/[0-9]/.test(formData.password) || !/[^A-Za-z0-9]/.test(formData.password)) {
        setError('La contraseña debe cumplir todos los requisitos de seguridad')
        setFieldErrors({ password: 'No cumple requisitos' })
        return false
      }
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep()) return

    if (step === 1) {
      setStep(2)
      setError('')
      setFieldErrors({})
      return
    }

    setIsLoading(true)
    setError('')
    setFieldErrors({})

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setShowSuccess(true)
        setTimeout(() => {
          router.push('/auth/signin?message=Registro exitoso. Por favor inicia sesión.')
        }, 2000)
      } else {
        setError(data.error || 'Error al registrar usuario')
        if (data.field) {
          setFieldErrors({ [data.field]: data.error })
        }
      }
    } catch (error) {
      setError('Error de conexión. Por favor intenta nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'CLIENT':
        return <Building className="h-6 w-6" />
      case 'TECHNICIAN':
        return <User className="h-6 w-6" />
      case 'MANAGER':
        return <Users className="h-6 w-6" />
      default:
        return <Crown className="h-6 w-6" />
    }
  }

  const getRoleConfig = (): RoleConfig => {
    switch (formData.role) {
      case 'CLIENT':
        return {
          title: 'Cliente Empresarial',
          description: 'Accede a servicios técnicos especializados para tu empresa',
          icon: <Building className="h-8 w-8 text-blue-600" />,
          fields: (
            <>
              <div className="space-y-2">
                <Label htmlFor="companyName">Nombre de la Empresa *</Label>
                <Input
                  id="companyName"
                  placeholder="Mi Empresa S.A."
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ruc">RUC/ID Fiscal</Label>
                <Input
                  id="ruc"
                  placeholder="1234567890"
                  value={formData.ruc}
                  onChange={(e) => handleInputChange('ruc', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessType">Tipo de Negocio</Label>
                <Input
                  id="businessType"
                  placeholder="Manufactura, Servicios, etc."
                  value={formData.businessType}
                  onChange={(e) => handleInputChange('businessType', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  placeholder="Calle Principal #123"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
              </div>
            </>
          )
        }
      case 'TECHNICIAN':
        return {
          title: 'Técnico Especializado',
          description: 'Ofrece tus servicios técnicos en nuestra plataforma',
          icon: <User className="h-8 w-8 text-green-600" />,
          fields: (
            <>
              <div className="space-y-2">
                <Label>Especialidades *</Label>
                <div className="space-y-2">
                  {['ELECTRONICS', 'MECHANICS', 'ELECTRICITY'].map((specialty) => (
                    <div key={specialty} className="flex items-center space-x-2">
                      <Checkbox
                        id={specialty}
                        checked={formData.specialties.includes(specialty)}
                        onCheckedChange={(checked) => {
                          const newSpecialties = checked
                            ? [...formData.specialties, specialty]
                            : formData.specialties.filter(s => s !== specialty)
                          handleInputChange('specialties', newSpecialties)
                        }}
                      />
                      <Label htmlFor={specialty} className="text-sm">
                        {specialty === 'ELECTRONICS' ? 'Electrónica' : 
                         specialty === 'MECHANICS' ? 'Mecánica' : 'Electricidad'}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">Años de Experiencia</Label>
                <Input
                  id="experience"
                  placeholder="5"
                  type="number"
                  value={formData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employeeId">ID de Empleado</Label>
                <Input
                  id="employeeId"
                  placeholder="EMP001"
                  value={formData.employeeId}
                  onChange={(e) => handleInputChange('employeeId', e.target.value)}
                />
              </div>
            </>
          )
        }
      case 'MANAGER':
        return {
          title: 'Manager de Equipo',
          description: 'Gestiona equipos de técnicos y asigna trabajos',
          icon: <Users className="h-8 w-8 text-purple-600" />,
          fields: (
            <>
              <div className="space-y-2">
                <Label htmlFor="department">Departamento</Label>
                <Input
                  id="department"
                  placeholder="Operaciones, Mantenimiento, etc."
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employeeId">ID de Manager</Label>
                <Input
                  id="employeeId"
                  placeholder="MGR001"
                  value={formData.employeeId}
                  onChange={(e) => handleInputChange('employeeId', e.target.value)}
                />
              </div>
            </>
          )
        }
      default:
        return {
          title: 'Usuario',
          description: 'Selecciona un tipo de cuenta',
          icon: <Crown className="h-8 w-8 text-gray-600" />,
          fields: null
        }
    }
  }

  const roleConfig = getRoleConfig()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-8">
      {showSuccess ? (
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-center mb-2">¡Registro Exitoso!</h2>
            <p className="text-center text-muted-foreground">Redirigiendo al inicio de sesión...</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-blue-700 p-2 rounded-lg">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-slate-900">SIEME</span>
              </div>
            </div>
            <CardTitle className="text-2xl">
              {step === 1 ? 'Crear Cuenta' : 'Completar Perfil'}
            </CardTitle>
            <CardDescription>
              {step === 1 ? 'Únete a nuestra plataforma de servicios técnicos' : roleConfig.description}
            </CardDescription>
            {/* Progress Indicator */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {step > 1 ? <CheckCircle className="h-5 w-5" /> : '1'}
              </div>
              <div className={`h-1 w-12 ${
                step >= 2 ? 'bg-blue-600' : 'bg-gray-200'
              }`} />
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
            </div>
          </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="mb-6 p-4 bg-primary/5 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                {getRoleIcon(formData.role)}
                <div>
                  <h3 className="font-semibold">{roleConfig.title}</h3>
                  <p className="text-sm text-muted-foreground">{roleConfig.description}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {step === 1 ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="role">Tipo de Cuenta</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => handleInputChange('role', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CLIENT">Cliente Empresarial</SelectItem>
                      <SelectItem value="TECHNICIAN">Técnico</SelectItem>
                      <SelectItem value="MANAGER">Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo *</Label>
                  <Input
                    id="name"
                    placeholder="Juan Pérez"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    placeholder="+1 234 567 8900"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      required
                      className={fieldErrors.password ? 'border-red-500' : ''}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-xs text-red-500">{fieldErrors.password}</p>
                  )}
                  <PasswordStrength password={formData.password} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      required
                      className={fieldErrors.confirmPassword ? 'border-red-500' : ''}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p className="text-xs text-red-500">{fieldErrors.confirmPassword}</p>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-4">
                {roleConfig.fields}
              </div>
            )}

            <div className="flex gap-3">
              {step === 2 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Atrás
                </Button>
              )}
              <Button
                type="submit"
                disabled={isLoading}
                className={step === 1 ? 'w-full' : 'flex-1'}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {step === 1 ? 'Validando...' : 'Registrando...'}
                  </>
                ) : (
                  step === 1 ? 'Siguiente' : 'Crear Cuenta'
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              ¿Ya tienes una cuenta?{' '}
              <Link href="/auth/signin" className="text-primary hover:underline">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
      )}
    </div>
  )
}
