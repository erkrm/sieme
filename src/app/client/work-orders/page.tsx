'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { 
  Plus, Search, MoreHorizontal, Eye, X, ArrowLeft, RefreshCw, 
  ClipboardList, Clock, CheckCircle2, AlertTriangle 
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const statusColors: Record<string, string> = {
  REQUESTED: 'bg-yellow-100 text-yellow-800',
  SCHEDULED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  PENDING: 'bg-orange-100 text-orange-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800'
}

const statusLabels: Record<string, string> = {
  REQUESTED: 'Solicitada',
  SCHEDULED: 'Programada',
  IN_PROGRESS: 'En Progreso',
  PENDING: 'Pendiente',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada'
}

export default function ClientWorkOrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'CLIENT') {
      fetchOrders()
    } else if (status === 'authenticated') {
      router.push('/dashboard')
    }
  }, [status, session])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/client/work-orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudieron cargar las órdenes', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (orderId: string) => {
    if (!confirm('¿Estás seguro de cancelar esta orden?')) return
    
    try {
      const response = await fetch(`/api/client/work-orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' })
      })

      if (response.ok) {
        toast({ title: 'Éxito', description: 'Orden cancelada correctamente' })
        fetchOrders()
      } else {
        throw new Error('No se pudo cancelar la orden')
      }
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo cancelar la orden', variant: 'destructive' })
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchSearch = order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.title?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = statusFilter === 'all' || order.status === statusFilter
    return matchSearch && matchStatus
  })

  const stats = {
    total: orders.length,
    pending: orders.filter(o => ['REQUESTED', 'PENDING', 'SCHEDULED'].includes(o.status)).length,
    inProgress: orders.filter(o => o.status === 'IN_PROGRESS').length,
    completed: orders.filter(o => o.status === 'COMPLETED').length
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/client/dashboard" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />Volver al Dashboard
          </Link>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Mis Órdenes de Trabajo</h1>
            <div className="flex gap-3">
              <Button variant="outline" onClick={fetchOrders}><RefreshCw className="h-4 w-4 mr-2" />Actualizar</Button>
              <Link href="/client/solicitar-servicio"><Button className="bg-blue-600 hover:bg-blue-700"><Plus className="h-4 w-4 mr-2" />Nueva Solicitud</Button></Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <ClipboardList className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">En Progreso</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.inProgress}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Completadas</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Buscar por número o título..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48"><SelectValue placeholder="Estado" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="REQUESTED">Solicitada</SelectItem>
                  <SelectItem value="SCHEDULED">Programada</SelectItem>
                  <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                  <SelectItem value="COMPLETED">Completada</SelectItem>
                  <SelectItem value="CANCELLED">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader><CardTitle>Órdenes ({filteredOrders.length})</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Orden</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Prioridad</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No tienes órdenes de trabajo. <Link href="/client/solicitar-servicio" className="text-blue-600 hover:underline">Crea tu primera solicitud</Link>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <p className="font-mono font-medium">{order.orderNumber}</p>
                        <p className="text-sm text-gray-500 truncate max-w-[200px]">{order.title}</p>
                      </TableCell>
                      <TableCell><Badge variant="secondary">{order.category}</Badge></TableCell>
                      <TableCell>
                        <Badge className={order.priority === 'EMERGENCY' ? 'bg-red-100 text-red-800' : order.priority === 'URGENT' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'}>
                          {order.priority}
                        </Badge>
                      </TableCell>
                      <TableCell><Badge className={statusColors[order.status]}>{statusLabels[order.status]}</Badge></TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString('es-ES')}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild><Link href={`/client/orden/${order.id}`}><Eye className="h-4 w-4 mr-2" />Ver Detalles</Link></DropdownMenuItem>
                            {['REQUESTED', 'PENDING'].includes(order.status) && (
                              <DropdownMenuItem className="text-red-600" onClick={() => handleCancel(order.id)}>
                                <X className="h-4 w-4 mr-2" />Cancelar
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
