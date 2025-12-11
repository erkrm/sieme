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
import { Plus, Search, MoreHorizontal, Eye, UserCheck, ArrowLeft, RefreshCw, ClipboardList } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const statusColors: Record<string, string> = {
  REQUESTED: 'bg-yellow-100 text-yellow-800',
  SCHEDULED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  PENDING: 'bg-orange-100 text-orange-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800'
}

export default function ManagerWorkOrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'MANAGER') {
      fetchOrders()
    } else if (status === 'authenticated') {
      router.push('/dashboard')
    }
  }, [status, session])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/manager/work-orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(Array.isArray(data) ? data : data.orders || [])
      }
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudieron cargar las órdenes', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchSearch = order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.title?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = statusFilter === 'all' || order.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/manager/dashboard" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Dashboard
          </Link>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Órdenes de Trabajo</h1>
            <div className="flex gap-3">
              <Button variant="outline" onClick={fetchOrders}><RefreshCw className="h-4 w-4 mr-2" />Actualizar</Button>
              <Link href="/manager/work-orders/new"><Button><Plus className="h-4 w-4 mr-2" />Nueva Orden</Button></Link>
            </div>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48"><SelectValue placeholder="Estado" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="REQUESTED">Solicitada</SelectItem>
                  <SelectItem value="SCHEDULED">Programada</SelectItem>
                  <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                  <SelectItem value="COMPLETED">Completada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Órdenes ({filteredOrders.length})</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Orden</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Técnico</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <p className="font-mono">{order.orderNumber}</p>
                      <p className="text-sm text-gray-500">{order.title}</p>
                    </TableCell>
                    <TableCell>{order.client?.name || 'N/A'}</TableCell>
                    <TableCell>{order.technician?.name || <span className="text-gray-400">Sin asignar</span>}</TableCell>
                    <TableCell><Badge className={statusColors[order.status]}>{order.status}</Badge></TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleDateString('es-ES')}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild><Link href={`/manager/work-orders/${order.id}`}><Eye className="h-4 w-4 mr-2" />Ver</Link></DropdownMenuItem>
                          {!order.technician && <DropdownMenuItem asChild><Link href={`/manager/work-orders/${order.id}?tab=assign`}><UserCheck className="h-4 w-4 mr-2" />Asignar</Link></DropdownMenuItem>}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
