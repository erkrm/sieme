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
import { ArrowLeft, Search, Building2, RefreshCw, Eye, MoreHorizontal, ChevronLeft, ChevronRight, MapPin, ClipboardList, FileText } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Client {
  id: string
  userId: string
  companyName: string | null
  rfc: string | null
  orderCount: number
  locationCount: number
  user: {
    id: string
    name: string
    email: string
    phone: string | null
    isActive: boolean
  }
  contracts: { id: string; contractNumber: string; type: string }[]
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function ManagerClientsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  
  const [clients, setClients] = useState<Client[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'MANAGER') {
      fetchClients()
    }
  }, [status, session, pagination.page, activeFilter])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (status === 'authenticated') {
        fetchClients()
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const fetchClients = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      })
      if (searchTerm) params.append('search', searchTerm)
      if (activeFilter !== 'all') params.append('active', activeFilter)

      const response = await fetch(`/api/manager/clients?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setClients(data.clients || [])
        setPagination(prev => ({ ...prev, ...data.pagination }))
      }
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudieron cargar los clientes', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  // Stats
  const activeCount = clients.filter(c => c.user?.isActive).length
  const withContractsCount = clients.filter(c => c.contracts?.length > 0).length
  const totalOrders = clients.reduce((acc, c) => acc + c.orderCount, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/manager/dashboard" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />Volver al Dashboard
          </Link>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
            <Button variant="outline" onClick={fetchClients}><RefreshCw className="h-4 w-4 mr-2" />Actualizar</Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Clientes</p>
                  <p className="text-2xl font-bold">{pagination.total}</p>
                </div>
                <Building2 className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Con Contrato Activo</p>
                  <p className="text-2xl font-bold text-green-600">{withContractsCount}</p>
                </div>
                <FileText className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Ubicaciones</p>
                  <p className="text-2xl font-bold text-blue-600">{clients.reduce((acc, c) => acc + c.locationCount, 0)}</p>
                </div>
                <MapPin className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Órdenes Totales</p>
                  <p className="text-2xl font-bold text-orange-600">{totalOrders}</p>
                </div>
                <ClipboardList className="h-8 w-8 text-orange-500" />
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
                <Input 
                  placeholder="Buscar por empresa, nombre o email..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="pl-10" 
                />
              </div>
              <Select value={activeFilter} onValueChange={setActiveFilter}>
                <SelectTrigger className="w-48"><SelectValue placeholder="Estado" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="true">Activos</SelectItem>
                  <SelectItem value="false">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Clientes ({pagination.total})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente / Empresa</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead>Contratos</TableHead>
                      <TableHead className="text-center">Ubicaciones</TableHead>
                      <TableHead className="text-center">Órdenes</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">{client.companyName || client.user?.name}</p>
                              {client.companyName && <p className="text-sm text-gray-500">{client.user?.name}</p>}
                              {client.rfc && <p className="text-xs text-gray-400">RFC: {client.rfc}</p>}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{client.user?.email}</p>
                          {client.user?.phone && <p className="text-sm text-gray-500">{client.user.phone}</p>}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {client.contracts?.slice(0, 2).map((c) => (
                              <Badge key={c.id} variant="secondary" className="text-xs">{c.type}</Badge>
                            ))}
                            {!client.contracts?.length && <span className="text-gray-400 text-sm">Sin contrato</span>}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="font-semibold">{client.locationCount}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <ClipboardList className="h-4 w-4 text-gray-400" />
                            <span className="font-semibold">{client.orderCount}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {client.user?.isActive 
                            ? <Badge className="bg-green-100 text-green-800">Activo</Badge> 
                            : <Badge className="bg-red-100 text-red-800">Inactivo</Badge>
                          }
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/manager/clients/${client.userId}`}><Eye className="h-4 w-4 mr-2" />Ver Detalle</Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <p className="text-sm text-gray-500">
                      Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        disabled={pagination.page === 1}
                        onClick={() => handlePageChange(pagination.page - 1)}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm px-3">
                        Página {pagination.page} de {pagination.totalPages}
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        disabled={pagination.page === pagination.totalPages}
                        onClick={() => handlePageChange(pagination.page + 1)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
