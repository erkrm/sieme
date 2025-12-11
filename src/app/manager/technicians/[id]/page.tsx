'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, User, Phone, Mail, MapPin, Award, ClipboardList, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'

const statusColors: Record<string, string> = { REQUESTED: 'bg-yellow-100 text-yellow-800', SCHEDULED: 'bg-blue-100 text-blue-800', IN_PROGRESS: 'bg-purple-100 text-purple-800', PENDING: 'bg-orange-100 text-orange-800', COMPLETED: 'bg-green-100 text-green-800', CANCELLED: 'bg-red-100 text-red-800' }

interface Technician {
  id: string
  userId: string
  employeeId: string
  isAvailable: boolean
  user: {
    name: string
    email: string
    phone: string
    isActive: boolean
  }
  specialties: { id: string; name: string }[]
  certifications: { id: string; name: string; issuer: string; expirationDate: string }[]
}

interface WorkOrder {
  id: string
  orderNumber: string
  title: string
  status: string
  priority: string
  createdAt: string
  client?: { name: string }
}

export default function ManagerTechnicianDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  
  const [technician, setTechnician] = useState<Technician | null>(null)
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [stats, setStats] = useState({ active: 0, completed: 0, pending: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'MANAGER' && params.id) {
      fetchTechnician()
      fetchWorkOrders()
    }
  }, [status, session, params.id])

  const fetchTechnician = async () => {
    try {
      const res = await fetch(`/api/admin/hr/technicians/${params.id}`)
      if (res.ok) {
        setTechnician(await res.json())
      } else throw new Error('Not found')
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo cargar el técnico', variant: 'destructive' })
      router.push('/manager/technicians')
    } finally {
      setLoading(false)
    }
  }

  const fetchWorkOrders = async () => {
    try {
      const res = await fetch('/api/manager/work-orders')
      if (res.ok) {
        const data = await res.json()
        const orders = Array.isArray(data) ? data : data.orders || []
        // Filter orders for this technician
        const techOrders = orders.filter((o: any) => o.technicianId === params.id)
        setWorkOrders(techOrders)
        // Calculate stats
        setStats({
          active: techOrders.filter((o: WorkOrder) => o.status === 'IN_PROGRESS').length,
          completed: techOrders.filter((o: WorkOrder) => o.status === 'COMPLETED').length,
          pending: techOrders.filter((o: WorkOrder) => ['REQUESTED', 'SCHEDULED', 'PENDING'].includes(o.status)).length
        })
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  if (loading) return <Skeleton className="h-[500px]" />

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <Link href="/manager/technicians" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />Volver a Técnicos
        </Link>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
            <span className="text-2xl text-purple-600 font-bold">{technician?.user?.name?.charAt(0)}</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold">{technician?.user?.name}</h1>
            <p className="text-gray-500">Técnico - {technician?.employeeId || 'Sin código'}</p>
          </div>
          <Badge className={technician?.isAvailable ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
            {technician?.isAvailable ? 'Disponible' : 'Ocupado'}
          </Badge>
          <Badge className={technician?.user?.isActive ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}>
            {technician?.user?.isActive ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">En Progreso</p>
                <p className="text-3xl font-bold text-purple-600">{stats.active}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <AlertCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pendientes</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completadas</p>
                <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Información</TabsTrigger>
          <TabsTrigger value="certifications">Certificaciones</TabsTrigger>
          <TabsTrigger value="orders">Órdenes Asignadas ({workOrders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardHeader><CardTitle>Datos del Técnico</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{technician?.user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Teléfono</p>
                    <p className="font-medium">{technician?.user?.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Especialidades</p>
                <div className="flex flex-wrap gap-2">
                  {technician?.specialties && technician.specialties.length > 0 ? (
                    technician.specialties.map(s => <Badge key={s.id} variant="secondary">{s.name}</Badge>)
                  ) : (
                    <span className="text-gray-400">Sin especialidades registradas</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certifications">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Award className="h-5 w-5" />Certificaciones</CardTitle></CardHeader>
            <CardContent>
              {technician?.certifications && technician.certifications.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Certificación</TableHead>
                      <TableHead>Emisor</TableHead>
                      <TableHead>Vencimiento</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {technician.certifications.map(cert => {
                      const isExpired = cert.expirationDate && new Date(cert.expirationDate) < new Date()
                      return (
                        <TableRow key={cert.id}>
                          <TableCell className="font-medium">{cert.name}</TableCell>
                          <TableCell>{cert.issuer}</TableCell>
                          <TableCell>{cert.expirationDate ? new Date(cert.expirationDate).toLocaleDateString('es-ES') : 'N/A'}</TableCell>
                          <TableCell>
                            <Badge className={isExpired ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                              {isExpired ? 'Vencida' : 'Vigente'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-gray-500 text-center py-8">No tiene certificaciones registradas</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5" />Órdenes Asignadas</CardTitle></CardHeader>
            <CardContent>
              {workOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No tiene órdenes asignadas</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Orden</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workOrders.map(order => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <p className="font-mono">{order.orderNumber}</p>
                          <p className="text-sm text-gray-500">{order.title}</p>
                        </TableCell>
                        <TableCell>{order.client?.name || 'N/A'}</TableCell>
                        <TableCell><Badge className={statusColors[order.status]}>{order.status}</Badge></TableCell>
                        <TableCell>{new Date(order.createdAt).toLocaleDateString('es-ES')}</TableCell>
                        <TableCell>
                          <Link href={`/manager/work-orders/${order.id}`}>
                            <Button variant="ghost" size="sm">Ver</Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
