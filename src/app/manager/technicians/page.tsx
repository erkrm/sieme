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
import { ArrowLeft, Search, Users, Phone, RefreshCw, ChevronLeft, ChevronRight, ClipboardList } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Technician {
  id: string
  userId: string
  employeeId: string | null
  isAvailable: boolean
  orderCount: number
  user: {
    id: string
    name: string
    email: string
    phone: string | null
    isActive: boolean
  }
  specialties: { id: string; name: string }[]
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function ManagerTechniciansPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [availabilityFilter, setAvailabilityFilter] = useState('all')

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'MANAGER') {
      fetchTechnicians()
    }
  }, [status, session, pagination.page, availabilityFilter])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (status === 'authenticated') {
        fetchTechnicians()
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const fetchTechnicians = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      })
      if (searchTerm) params.append('search', searchTerm)
      if (availabilityFilter !== 'all') params.append('available', availabilityFilter)

      const response = await fetch(`/api/manager/technicians?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setTechnicians(data.technicians || [])
        setPagination(prev => ({ ...prev, ...data.pagination }))
      }
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudieron cargar los técnicos', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  // Stats
  const availableCount = technicians.filter(t => t.isAvailable).length
  const busyCount = technicians.filter(t => !t.isAvailable).length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/manager/dashboard" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />Volver al Dashboard
          </Link>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Técnicos</h1>
            <Button variant="outline" onClick={fetchTechnicians}><RefreshCw className="h-4 w-4 mr-2" />Actualizar</Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-2xl font-bold">{pagination.total}</p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-500">Disponibles</p>
              <p className="text-2xl font-bold text-green-600">{availableCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-500">Ocupados</p>
              <p className="text-2xl font-bold text-yellow-600">{busyCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-500">Órdenes Asignadas</p>
              <p className="text-2xl font-bold text-blue-600">{technicians.reduce((acc, t) => acc + t.orderCount, 0)}</p>
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
                  placeholder="Buscar por nombre o email..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="pl-10" 
                />
              </div>
              <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                <SelectTrigger className="w-48"><SelectValue placeholder="Disponibilidad" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="true">Disponibles</SelectItem>
                  <SelectItem value="false">Ocupados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Técnicos ({pagination.total})</CardTitle>
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
                      <TableHead>Técnico</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead>Especialidades</TableHead>
                      <TableHead className="text-center">Órdenes</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {technicians.map((tech) => (
                      <TableRow key={tech.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                              <span className="text-purple-600 font-semibold">{tech.user?.name?.charAt(0)}</span>
                            </div>
                            <div>
                              <p className="font-medium">{tech.user?.name}</p>
                              <p className="text-sm text-gray-500">{tech.employeeId || 'Sin código'}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{tech.user?.email}</p>
                          {tech.user?.phone && <p className="text-sm text-gray-500 flex items-center gap-1"><Phone className="h-3 w-3" />{tech.user.phone}</p>}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {tech.specialties?.slice(0, 2).map((s) => <Badge key={s.id} variant="secondary">{s.name}</Badge>)}
                            {(tech.specialties?.length || 0) > 2 && <Badge variant="outline">+{tech.specialties.length - 2}</Badge>}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <ClipboardList className="h-4 w-4 text-gray-400" />
                            <span className="font-semibold">{tech.orderCount}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {tech.isAvailable 
                            ? <Badge className="bg-green-100 text-green-800">Disponible</Badge> 
                            : <Badge className="bg-yellow-100 text-yellow-800">Ocupado</Badge>
                          }
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/manager/technicians/${tech.userId}`}>
                            <Button variant="ghost" size="sm">Ver Detalle</Button>
                          </Link>
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
