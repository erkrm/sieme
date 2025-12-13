'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Search, Edit, Trash2, ArrowLeft } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw, FileDown, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Service {
  id: string
  name: string
  description: string
  basePrice: number
  estimatedHours: number
  category: {
    id: string
    name: string
  }
}

interface Category {
  id: string
  name: string
  children: Category[]
}

export default function ServicesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null)
  
  // Pagination & Selection
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const itemsPerPage = 10

  // Form state
  const [formData, setFormData] = useState({
    id: '', // Added for edit mode
    name: '',
    description: '',
    basePrice: '',
    estimatedHours: '',
    categoryId: ''
  })

  useEffect(() => {
    if (status === 'authenticated') {
      if (session?.user?.role !== 'ADMIN') {
        router.push('/')
      } else {
        fetchServices()
        fetchCategories()
      }
    } else if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, session, router])

  const fetchServices = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      const response = await fetch('/api/services')
      if (response.ok) {
        const data = await response.json()
        setServices(data)
        setLastUpdated(new Date())
        if (isRefresh) {
          toast({
            title: "Datos actualizados",
            description: "La lista de servicios se ha actualizado.",
          })
        }
      }
    } catch (error) {
      console.error('Error fetching services:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los servicios.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/services/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleSubmit = async () => {
    try {
      const method = formData.id ? 'PUT' : 'POST'
      const response = await fetch('/api/services', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setIsDialogOpen(false)
        setFormData({ id: '', name: '', description: '', basePrice: '', estimatedHours: '', categoryId: '' })
        fetchServices()
        toast({
          title: formData.id ? "Servicio actualizado" : "Servicio creado",
          description: `El servicio se ha ${formData.id ? 'actualizado' : 'creado'} correctamente.`,
        })
      } else {
        throw new Error('Failed to save service')
      }
    } catch (error) {
      console.error('Error saving service:', error)
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar el servicio.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (service: Service) => {
    setFormData({
      id: service.id,
      name: service.name,
      description: service.description,
      basePrice: service.basePrice.toString(),
      estimatedHours: service.estimatedHours.toString(),
      categoryId: service.category.id
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!serviceToDelete) return

    try {
      const response = await fetch(`/api/services?id=${serviceToDelete}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setServiceToDelete(null)
        fetchServices()
        toast({
          title: "Servicio eliminado",
          description: "El servicio ha sido eliminado correctamente.",
        })
      } else {
        throw new Error('Failed to delete service')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el servicio.",
        variant: "destructive",
      })
    }
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()
    const selectedData = services.filter(s => selectedServices.includes(s.id))

    doc.setFontSize(18)
    doc.text('SIEME - Catálogo de Servicios', 14, 20)
    doc.setFontSize(10)
    doc.text(`Generado: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`, 14, 28)

    const tableData = selectedData.map(s => [
      s.name,
      s.category.name,
      `$${s.basePrice.toFixed(2)}`,
      `${s.estimatedHours}h`,
      s.description
    ])

    ;(doc as any).autoTable({
      startY: 35,
      head: [['Nombre', 'Categoría', 'Precio', 'Horas', 'Descripción']],
      body: tableData,
    })

    doc.save(`servicios_${format(new Date(), 'yyyyMMdd')}.pdf`)
    toast({
      title: "PDF generado",
      description: `Se exportaron ${selectedData.length} servicios.`,
    })
  }

  // Flatten categories for select
  const flatCategories: { id: string, name: string }[] = []
  const traverseCategories = (cats: Category[], prefix = '') => {
    cats.forEach(cat => {
      flatCategories.push({ id: cat.id, name: prefix + cat.name })
      if (cat.children && cat.children.length > 0) {
        traverseCategories(cat.children, prefix + '-- ')
      }
    })
  }
  traverseCategories(categories)

  // Filter and pagination logic
  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.category.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || service.category.id === categoryFilter
    return matchesSearch && matchesCategory
  })

  const totalPages = Math.ceil(filteredServices.length / itemsPerPage)
  const paginatedServices = filteredServices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Bulk actions
  const toggleSelectAll = () => {
    if (selectedServices.length === paginatedServices.length) {
      setSelectedServices([])
    } else {
      setSelectedServices(paginatedServices.map(s => s.id))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.push('/admin/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <h1 className="text-2xl font-bold">Catálogo de Servicios</h1>
            </div>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.push('/admin/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg md:text-2xl font-bold">Servicios</h1>
        </div>

        <div className="flex flex-col gap-3 bg-white p-3 md:p-4 rounded-lg border shadow-sm">
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <Filter className="h-4 w-4 mr-1" />
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {flatCategories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {selectedServices.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleExportPDF}>
                <FileDown className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">({selectedServices.length})</span>
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => fetchServices(true)} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={() => setFormData({ id: '', name: '', description: '', basePrice: '', estimatedHours: '', categoryId: '' })}>
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1">Nuevo</span>
                </Button>
              </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{formData.id ? 'Editar Servicio' : 'Crear Nuevo Servicio'}</DialogTitle>
                    <DialogDescription>
                      {formData.id ? 'Modifica los detalles del servicio existente.' : 'Añade un nuevo servicio al catálogo disponible.'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Nombre del Servicio</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="category">Categoría</Label>
                      <Select 
                        value={formData.categoryId} 
                        onValueChange={(val) => setFormData({...formData, categoryId: val})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {flatCategories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="price">Precio Base ($)</Label>
                        <Input
                          id="price"
                          type="number"
                          value={formData.basePrice}
                          onChange={(e) => setFormData({...formData, basePrice: e.target.value})}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="hours">Horas Estimadas</Label>
                        <Input
                          id="hours"
                          type="number"
                          value={formData.estimatedHours}
                          onChange={(e) => setFormData({...formData, estimatedHours: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Descripción</Label>
                      <Input
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleSubmit}>{formData.id ? 'Actualizar' : 'Guardar'} Servicio</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Servicios Disponibles</CardTitle>
              <CardDescription>Gestiona el catálogo de servicios ofrecidos</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table className="min-w-[600px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox 
                        checked={selectedServices.length === paginatedServices.length && paginatedServices.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Precio Base</TableHead>
                    <TableHead>Tiempo Est.</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedServices.includes(service.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedServices([...selectedServices, service.id])
                            } else {
                              setSelectedServices(selectedServices.filter(id => id !== service.id))
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>{service.name}</div>
                        <div className="text-xs text-muted-foreground">{service.description}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{service.category.name}</Badge>
                      </TableCell>
                      <TableCell>${service.basePrice.toFixed(2)}</TableCell>
                      <TableCell>{service.estimatedHours}h</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(service)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => setServiceToDelete(service.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginatedServices.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No se encontraron servicios
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <div className="flex items-center justify-between px-4 py-4 border-t">
              <div className="text-sm text-muted-foreground">
                Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredServices.length)} de {filteredServices.length} resultados
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm font-medium">
                  Página {currentPage} de {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>

        <AlertDialog open={!!serviceToDelete} onOpenChange={() => setServiceToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Esto eliminará permanentemente el servicio del catálogo.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
