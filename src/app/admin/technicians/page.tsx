'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Users,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  RefreshCw
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'

interface Technician {
  id: string
  userId: string
  employeeId: string | null
  hireDate: string | null
  isAvailable: boolean
  user: {
    id: string
    name: string
    email: string
    phone: string | null
    isActive: boolean
  }
  specialties: Array<{ id: string; name: string; level: string }>
  certifications: Array<{ id: string; name: string }>
  _count?: {
    assignedOrders?: number
  }
}

export default function TechniciansPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTechnicians()
    }
  }, [status])

  const fetchTechnicians = async () => {
    try {
      const response = await fetch('/api/admin/hr/technicians')
      if (response.ok) {
        const data = await response.json()
        setTechnicians(data)
      } else {
        throw new Error('Error fetching technicians')
      }
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los técnicos',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchTechnicians()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este técnico?')) return

    try {
      const response = await fetch(`/api/admin/hr/technicians/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: 'Éxito',
          description: 'Técnico eliminado correctamente'
        })
        fetchTechnicians()
      } else {
        throw new Error('Error deleting technician')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el técnico',
        variant: 'destructive'
      })
    }
  }

  const filteredTechnicians = technicians.filter(tech => 
    tech.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tech.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tech.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-10 w-48 mb-8" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/dashboard" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Dashboard
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Técnicos</h1>
              <p className="text-gray-500 mt-1">Administra los técnicos del sistema</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
              <Link href="/admin/technicians/new">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Técnico
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Técnicos</p>
                  <p className="text-2xl font-bold">{technicians.length}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Disponibles</p>
                  <p className="text-2xl font-bold text-green-600">
                    {technicians.filter(t => t.isAvailable && t.user.isActive).length}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Ocupados</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {technicians.filter(t => !t.isAvailable).length}
                  </p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Inactivos</p>
                  <p className="text-2xl font-bold text-red-600">
                    {technicians.filter(t => !t.user.isActive).length}
                  </p>
                </div>
                <div className="bg-red-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre, email o código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Técnicos ({filteredTechnicians.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Técnico</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Especialidades</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Órdenes Activas</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTechnicians.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No se encontraron técnicos
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTechnicians.map((tech) => (
                    <TableRow key={tech.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">
                              {tech.user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{tech.user.name}</p>
                            <p className="text-sm text-gray-500">{tech.user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">
                          {tech.employeeId || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {tech.user.phone && (
                            <span className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3" /> {tech.user.phone}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {tech.specialties.slice(0, 2).map((spec) => (
                            <Badge key={spec.id} variant="secondary" className="text-xs">
                              {spec.name}
                            </Badge>
                          ))}
                          {tech.specialties.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{tech.specialties.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {!tech.user.isActive ? (
                          <Badge variant="destructive">Inactivo</Badge>
                        ) : tech.isAvailable ? (
                          <Badge className="bg-green-100 text-green-800">Disponible</Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800">Ocupado</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">
                          {tech._count?.assignedOrders || 0}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/technicians/${tech.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Detalles
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/technicians/${tech.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDelete(tech.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
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
