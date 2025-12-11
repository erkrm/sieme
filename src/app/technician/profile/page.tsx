'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Phone, Award, Wrench, Calendar } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface TechnicianProfile {
  employeeId: string
  hireDate: string
  isAvailable: boolean
  specialties: { name: string; level: string }[]
  certifications: { name: string; expiryDate: string }[]
  user: { name: string; email: string; phone: string }
}

export default function TechnicianProfilePage() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<TechnicianProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/technician/profile')
        if (res.ok) {
          setProfile(await res.json())
        }
      } catch (e) {
        console.error('Error:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  if (loading) return <Skeleton className="h-[500px]" />

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Mi Perfil</h1>
        <p className="text-gray-500">Información personal y profesional</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />Información Personal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-3xl text-orange-600 font-bold">{profile?.user?.name?.charAt(0) || session?.user?.name?.charAt(0)}</span>
            </div>
            <div>
              <h3 className="text-xl font-bold">{profile?.user?.name || session?.user?.name}</h3>
              <p className="text-gray-500">Técnico - {profile?.employeeId || 'N/A'}</p>
              <Badge className={profile?.isAvailable ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                {profile?.isAvailable ? 'Disponible' : 'Ocupado'}
              </Badge>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p>{profile?.user?.email || session?.user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Teléfono</p>
                <p>{profile?.user?.phone || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Fecha de Ingreso</p>
                <p>{profile?.hireDate ? new Date(profile.hireDate).toLocaleDateString('es-ES') : 'N/A'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Wrench className="h-5 w-5" />Especialidades</CardTitle>
        </CardHeader>
        <CardContent>
          {profile?.specialties && profile.specialties.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.specialties.map((s, i) => (
                <Badge key={i} variant="secondary" className="text-sm">
                  {s.name} - {s.level}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No hay especialidades registradas</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Award className="h-5 w-5" />Certificaciones</CardTitle>
        </CardHeader>
        <CardContent>
          {profile?.certifications && profile.certifications.length > 0 ? (
            <div className="space-y-3">
              {profile.certifications.map((c, i) => {
                const isExpired = c.expiryDate && new Date(c.expiryDate) < new Date()
                return (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>{c.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        Vence: {c.expiryDate ? new Date(c.expiryDate).toLocaleDateString('es-ES') : 'N/A'}
                      </span>
                      <Badge className={isExpired ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                        {isExpired ? 'Vencida' : 'Vigente'}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-500">No hay certificaciones registradas</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
