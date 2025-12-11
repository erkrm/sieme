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
import { ArrowLeft, Building2, Mail, Phone, MapPin, FileText, ClipboardList } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'

export default function ManagerClientDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  
  const [client, setClient] = useState<any>(null)
  const [workOrders, setWorkOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'MANAGER' && params.id) {
      fetchClient()
      fetchWorkOrders()
    }
  }, [status, session, params.id])

  const fetchClient = async () => {
    try {
      const response = await fetch(`/api/admin/clients/${params.id}`)
      if (response.ok) {
        setClient(await response.json())
      } else throw new Error('Client not found')
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo cargar el cliente', variant: 'destructive' })
      router.push('/manager/clients')
    } finally {
      setLoading(false)
    }
  }

  const fetchWorkOrders = async () => {
    try {
      const response = await fetch('/api/manager/work-orders')
      if (response.ok) {
        const data = await response.json()
        const orders = Array.isArray(data) ? data : data.orders || []
        setWorkOrders(orders.filter((o: any) => o.clientId === params.id))
      }
    } catch (error) {
      console.error('Error fetching work orders:', error)
    }
  }

  const statusColors: Record<string, string> = { REQUESTED: 'bg-yellow-100 text-yellow-800', SCHEDULED: 'bg-blue-100 text-blue-800', IN_PROGRESS: 'bg-purple-100 text-purple-800', COMPLETED: 'bg-green-100 text-green-800', CANCELLED: 'bg-red-100 text-red-800' }

  if (loading) return <div className="min-h-screen bg-gray-50 p-8"><Skeleton className="h-[500px] max-w-4xl mx-auto" /></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/manager/clients" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />Volver a Clientes
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Building2 className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{client?.companyName}</h1>
              <p className="text-gray-500">{client?.industry || 'Sin clasificar'}</p>
            </div>
            <Badge className={client?.user?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
              {client?.user?.isActive ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="info">
          <TabsList>
            <TabsTrigger value="info">Información</TabsTrigger>
            <TabsTrigger value="locations">Sucursales ({client?.locations?.length || 0})</TabsTrigger>
            <TabsTrigger value="orders">Órdenes ({workOrders.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info">
            <Card>
              <CardHeader><CardTitle>Datos del Cliente</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{client?.user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Teléfono</p>
                      <p className="font-medium">{client?.user?.phone || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">RUC</p>
                      <p className="font-medium font-mono">{client?.ruc || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Tipo de Negocio</p>
                      <p className="font-medium">{client?.businessType || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 col-span-2">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Dirección</p>
                      <p className="font-medium">{client?.address || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="locations">
            <Card>
              <CardHeader><CardTitle>Sucursales</CardTitle></CardHeader>
              <CardContent>
                {client?.locations?.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Este cliente no tiene sucursales registradas</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Dirección</TableHead>
                        <TableHead>Contacto</TableHead>
                        <TableHead>Teléfono</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {client?.locations?.map((loc: any) => (
                        <TableRow key={loc.id}>
                          <TableCell className="font-medium">{loc.name}</TableCell>
                          <TableCell>{loc.address}</TableCell>
                          <TableCell>{loc.contactName || 'N/A'}</TableCell>
                          <TableCell>{loc.contactPhone || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="orders">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Órdenes de Trabajo</CardTitle>
                <Link href="/manager/work-orders/new">
                  <Button size="sm">Nueva Orden</Button>
                </Link>
              </CardHeader>
              <CardContent>
                {workOrders.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Este cliente no tiene órdenes registradas</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Orden</TableHead>
                        <TableHead>Título</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {workOrders.map((order: any) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono">{order.orderNumber}</TableCell>
                          <TableCell>{order.title}</TableCell>
                          <TableCell><Badge className={statusColors[order.status]}>{order.status}</Badge></TableCell>
                          <TableCell>{new Date(order.createdAt).toLocaleDateString('es-ES')}</TableCell>
                          <TableCell>
                            <Link href={`/manager/work-orders/${order.id}`}>
                              <Button variant="ghost" size="sm"><ClipboardList className="h-4 w-4" /></Button>
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
    </div>
  )
}
