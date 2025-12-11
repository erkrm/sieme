'use client'

import Link from 'next/link'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { NotificationList } from '@/components/notification-list'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { 
  Users, 
  Wrench, 
  Building, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Filter,
  Search,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Settings,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Map,
  Bell,
  RefreshCw,
  LogOut,
  Download,
  FileDown,
  X
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { DispatchBoard } from '@/components/dispatch-board'
import dynamic from 'next/dynamic'

const OperationalMap = dynamic(() => import('@/components/operational-map'), {
  ssr: false,
  loading: () => <div className="h-[600px] w-full bg-gray-100 animate-pulse rounded-lg" />
})

interface User {
  id: string
  name: string
  email: string
  role: string
  phone?: string
  isActive: boolean
  createdAt: string
  avatar?: string
  isAvailable?: boolean
}

interface WorkOrder {
  id: string
  orderNumber: string
  title: string
  status: string
  priority: string
  clientName: string
  technicianId?: string
  technicianName?: string
  createdAt: string
  completedAt?: string
}

interface SystemStats {
  totalUsers: number
  totalClients: number
  totalTechnicians: number
  totalWorkOrders: number
  activeWorkOrders: number
  completedWorkOrders: number
  totalRevenue: number
  thisMonthRevenue: number
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  
  // Pagination States
  const [usersPage, setUsersPage] = useState(1)
  const [ordersPage, setOrdersPage] = useState(1)
  const itemsPerPage = 10
  
  // Bulk Actions State
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  
  // System Settings State
  const [systemSettings, setSystemSettings] = useState({
    siteName: 'SIEME',
    siteEmail: 'contacto@sieme.com',
    maintenanceMode: 'disabled'
  })
  const [savingSettings, setSavingSettings] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/')
    } else if (status === 'authenticated') {
      fetchData()
    }
  }, [status, session, router])

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      await Promise.all([
        fetchUsers(),
        fetchWorkOrders(),
        fetchStats()
      ])
      setLastUpdated(new Date())
      
      if (isRefresh) {
        toast({
          title: "Datos actualizados",
          description: "La información del sistema se ha actualizado correctamente.",
        })
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: "Error al cargar datos",
        description: "Hubo un problema al cargar la información. Por favor intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const fetchUsers = async () => {
    const response = await fetch('/api/admin/users')
    if (response.ok) {
      const data = await response.json()
      setUsers(data)
    } else {
      throw new Error('Failed to fetch users')
    }
  }

  const fetchWorkOrders = async () => {
    const response = await fetch('/api/admin/work-orders')
    if (response.ok) {
      const data = await response.json()
      // Map API response to interface format
      const mappedOrders = data.map((order: any) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        title: order.title,
        status: order.status,
        priority: order.priority,
        clientName: order.client?.name || 'Sin cliente',
        technicianId: order.technician?.id || order.technicianId || null,
        technicianName: order.technician?.name || null,
        createdAt: order.createdAt,
        completedAt: order.completedAt
      }))
      setWorkOrders(mappedOrders)
    } else {
      throw new Error('Failed to fetch work orders')
    }
  }

  const fetchStats = async () => {
    const response = await fetch('/api/admin/stats')
    if (response.ok) {
      const data = await response.json()
      setStats(data)
    } else {
      throw new Error('Failed to fetch stats')
    }
  }

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      })

      if (response.ok) {
        fetchUsers()
        toast({
          title: isActive ? "Usuario desactivado" : "Usuario activado",
          description: `El usuario ha sido ${isActive ? 'desactivado' : 'activado'} correctamente.`,
        })
      } else {
        throw new Error('Failed to update status')
      }
    } catch (error) {
      console.error('Error updating user status:', error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del usuario.",
        variant: "destructive",
      })
    }
  }

  const handleAssignOrder = async (orderId: string, technicianId: string) => {
    try {
      const response = await fetch(`/api/admin/work-orders/${orderId}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ technicianId })
      })

      if (response.ok) {
        fetchWorkOrders()
        toast({
          title: "Orden asignada",
          description: "El técnico ha sido asignado correctamente.",
        })
      } else {
        throw new Error('Failed to assign order')
      }
    } catch (error) {
      console.error('Error assigning order:', error)
      toast({
        title: "Error",
        description: "No se pudo asignar la orden.",
        variant: "destructive",
      })
    }
  }

  const handleUnassignOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/admin/work-orders/${orderId}/unassign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        fetchWorkOrders()
        toast({
          title: "Orden desasignada",
          description: "El técnico ha sido removido de la orden.",
        })
      } else {
        throw new Error('Failed to unassign order')
      }
    } catch (error) {
      console.error('Error unassigning order:', error)
      toast({
        title: "Error",
        description: "No se pudo desasignar la orden.",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'ASSIGNED': return 'bg-blue-100 text-blue-800'
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pendiente'
      case 'ASSIGNED': return 'Asignado'
      case 'IN_PROGRESS': return 'En Progreso'
      case 'COMPLETED': return 'Completado'
      case 'CANCELLED': return 'Cancelado'
      default: return status
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'bg-green-100 text-green-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'HIGH': return 'bg-orange-100 text-orange-800'
      case 'URGENT': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'Baja'
      case 'MEDIUM': return 'Media'
      case 'HIGH': return 'Alta'
      case 'URGENT': return 'Urgente'
      default: return priority
    }
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case 'CLIENT': return 'Cliente'
      case 'TECHNICIAN': return 'Técnico'
      case 'MANAGER': return 'Manager'
      case 'ADMIN': return 'Administrador'
      default: return role
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const filteredWorkOrders = workOrders.filter(order => {
    const matchesSearch = order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Pagination Logic
  const paginatedUsers = filteredUsers.slice(
    (usersPage - 1) * itemsPerPage,
    usersPage * itemsPerPage
  )
  const totalUserPages = Math.ceil(filteredUsers.length / itemsPerPage)

  const paginatedOrders = filteredWorkOrders.slice(
    (ordersPage - 1) * itemsPerPage,
    ordersPage * itemsPerPage
  )
  const totalOrderPages = Math.ceil(filteredWorkOrders.length / itemsPerPage)

  // Bulk Actions Logic
  const toggleSelectAllUsers = () => {
    if (selectedUsers.length === paginatedUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(paginatedUsers.map(u => u.id))
    }
  }

  const toggleSelectUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId))
    } else {
      setSelectedUsers([...selectedUsers, userId])
    }
  }

  const toggleSelectAllOrders = () => {
    if (selectedOrders.length === paginatedOrders.length) {
      setSelectedOrders([])
    } else {
      setSelectedOrders(paginatedOrders.map(o => o.id))
    }
  }

  const toggleSelectOrder = (orderId: string) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId))
    } else {
      setSelectedOrders([...selectedOrders, orderId])
    }
  }

  // Bulk Delete Handlers
  const handleBulkDeleteUsers = async () => {
    if (selectedUsers.length === 0) return
    if (!confirm(`¿Eliminar ${selectedUsers.length} usuarios seleccionados?`)) return
    
    try {
      for (const userId of selectedUsers) {
        await fetch(`/api/admin/users/${userId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: false })
        })
      }
      toast({ title: "Usuarios desactivados", description: `${selectedUsers.length} usuarios han sido desactivados.` })
      setSelectedUsers([])
      fetchData(true)
    } catch (error) {
      toast({ title: "Error", description: "No se pudieron desactivar los usuarios.", variant: "destructive" })
    }
  }

  const handleBulkDeleteOrders = async () => {
    if (selectedOrders.length === 0) return
    if (!confirm(`¿Eliminar ${selectedOrders.length} órdenes seleccionadas?`)) return
    
    try {
      for (const orderId of selectedOrders) {
        await fetch(`/api/admin/work-orders/${orderId}`, { method: 'DELETE' })
      }
      toast({ title: "Órdenes eliminadas", description: `${selectedOrders.length} órdenes han sido eliminadas.` })
      setSelectedOrders([])
      fetchData(true)
    } catch (error) {
      toast({ title: "Error", description: "No se pudieron eliminar las órdenes.", variant: "destructive" })
    }
  }

  // Global Search
  const [globalSearch, setGlobalSearch] = useState('')
  const globalSearchResults = globalSearch.length > 2 ? [
    ...users.filter(u => u.name.toLowerCase().includes(globalSearch.toLowerCase()) || u.email.toLowerCase().includes(globalSearch.toLowerCase())).slice(0, 3).map(u => ({ type: 'user', id: u.id, title: u.name, subtitle: u.email })),
    ...workOrders.filter(o => o.title.toLowerCase().includes(globalSearch.toLowerCase()) || o.orderNumber.toLowerCase().includes(globalSearch.toLowerCase())).slice(0, 3).map(o => ({ type: 'order', id: o.id, title: o.orderNumber, subtitle: o.title }))
  ] : []

  const handleExportUsersPDF = () => {
    const doc = new jsPDF()
    const usersToExport = users.filter(u => selectedUsers.includes(u.id))
    if (usersToExport.length === 0) return

    doc.setFontSize(18)
    doc.text('Reporte de Usuarios - SIEME', 14, 22)
    doc.setFontSize(11)
    doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 30)

    const tableData = usersToExport.map(user => [
      user.name,
      user.email,
      getRoleText(user.role),
      user.isActive ? 'Activo' : 'Inactivo',
      new Date(user.createdAt).toLocaleDateString()
    ])

    // @ts-ignore
    doc.autoTable({
      head: [['Nombre', 'Email', 'Rol', 'Estado', 'Fecha Registro']],
      body: tableData,
      startY: 40,
    })

    doc.save('reporte-usuarios.pdf')
    toast({ title: "PDF Generado", description: "Reporte de usuarios descargado." })
  }

  const handleExportOrdersPDF = () => {
    const doc = new jsPDF()
    const ordersToExport = workOrders.filter(o => selectedOrders.includes(o.id))
    if (ordersToExport.length === 0) return

    doc.setFontSize(18)
    doc.text('Reporte de Órdenes - SIEME', 14, 22)
    doc.setFontSize(11)
    doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 30)

    const tableData = ordersToExport.map(order => [
      order.orderNumber,
      order.title,
      order.clientName,
      getStatusText(order.status),
      getPriorityText(order.priority),
      new Date(order.createdAt).toLocaleDateString()
    ])

    // @ts-ignore
    doc.autoTable({
      head: [['Orden', 'Título', 'Cliente', 'Estado', 'Prioridad', 'Fecha']],
      body: tableData,
      startY: 40,
    })

    doc.save('reporte-ordenes.pdf')
    toast({ title: "PDF Generado", description: "Reporte de órdenes descargado." })
  }

  const handleSaveSettings = async () => {
    setSavingSettings(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(systemSettings)
      })
      if (response.ok) {
        toast({ title: "Configuración guardada", description: "Los ajustes se han guardado correctamente." })
      } else {
        throw new Error('Error saving settings')
      }
    } catch (error) {
      toast({ title: "Error", description: "No se pudo guardar la configuración.", variant: "destructive" })
    } finally {
      setSavingSettings(false)
    }
  }

  // Removed full screen loading to use skeletons instead
  // if (loading) { ... }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loading ? (
            // Skeleton Loading for Stats
            [1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="ml-4 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : stats ? (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Usuarios Totales</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                      <div className="text-xs text-gray-500">
                        {stats.totalClients} clientes, {stats.totalTechnicians} técnicos
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-purple-100 rounded-full">
                      <Wrench className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Órdenes de Trabajo</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalWorkOrders}</p>
                      <div className="text-xs text-gray-500">
                        {stats.activeWorkOrders} activas, {stats.completedWorkOrders} completadas
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-green-100 rounded-full">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                      <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
                      <div className="text-xs text-gray-500">
                        Este mes: ${stats.thisMonthRevenue.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-orange-100 rounded-full">
                      <TrendingUp className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Tasa de Completación</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.totalWorkOrders > 0 
                          ? Math.round((stats.completedWorkOrders / stats.totalWorkOrders) * 100)
                          : 0}%
                      </p>
                      <div className="text-xs text-gray-500">
                        Órdenes completadas
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>

        {/* Quick Access Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link href="/admin/technicians" className="block">
            <Card className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-purple-500 hover:border-l-purple-600">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Wrench className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="font-semibold">Técnicos</p>
                    <p className="text-xs text-gray-500">Gestionar técnicos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/managers" className="block">
            <Card className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-blue-500 hover:border-l-blue-600">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="font-semibold">Managers</p>
                    <p className="text-xs text-gray-500">Gestionar managers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/clients" className="block">
            <Card className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-green-500 hover:border-l-green-600">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Building className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="font-semibold">Clientes</p>
                    <p className="text-xs text-gray-500">Gestionar clientes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/work-orders" className="block">
            <Card className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-orange-500 hover:border-l-orange-600">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="font-semibold">Órdenes</p>
                    <p className="text-xs text-gray-500">Gestionar órdenes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Last Updated Timestamp */}
        {lastUpdated && (
          <div className="text-xs text-muted-foreground mb-4 text-right">
            Última actualización: {format(lastUpdated, "HH:mm:ss", { locale: es })}
          </div>
        )}

        {/* Bulk Actions Toolbar */}
        {(selectedUsers.length > 0 || selectedOrders.length > 0) && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-lg z-50 flex items-center gap-4 animate-in slide-in-from-bottom-10">
            <span className="text-sm font-medium">
              {selectedUsers.length > 0 ? `${selectedUsers.length} usuarios` : `${selectedOrders.length} órdenes`} seleccionados
            </span>
            <div className="h-4 w-px bg-slate-700" />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={selectedUsers.length > 0 ? handleExportUsersPDF : handleExportOrdersPDF} 
              className="text-white hover:text-white hover:bg-slate-800"
            >
              <FileDown className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setSelectedUsers([])
                setSelectedOrders([])
              }} 
              className="text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="dispatch" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dispatch">Despacho</TabsTrigger>
            <TabsTrigger value="map">Mapa</TabsTrigger>
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="work-orders">Órdenes</TabsTrigger>
            <TabsTrigger value="system">Sistema</TabsTrigger>
          </TabsList>

          {/* Dispatch Tab */}
          <TabsContent value="dispatch" className="space-y-6">
            <Card className="border-none shadow-none bg-transparent">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Tablero de Despacho</h2>
                  <p className="text-muted-foreground">Arrastra las órdenes para asignar técnicos</p>
                </div>
              </div>
              
              <DispatchBoard 
                initialOrders={workOrders.filter(o => ['REQUESTED', 'PENDING', 'SCHEDULED'].includes(o.status))} 
                technicians={users
                  .filter(u => u.role === 'TECHNICIAN' && u.isActive)
                  .map(t => ({
                    id: t.id,
                    name: t.name,
                    email: t.email,
                    avatar: t.avatar,
                    isAvailable: true // In a real app, this would come from TechnicianProfile
                  }))}
                onAssign={handleAssignOrder}
                onUnassign={handleUnassignOrder}
              />
            </Card>
          </TabsContent>

          {/* Map Tab */}
          <TabsContent value="map" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mapa Operativo</CardTitle>
                <CardDescription>Ubicación en tiempo real de técnicos y servicios</CardDescription>
              </CardHeader>
              <CardContent>
                <OperationalMap />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Gestión de Usuarios</span>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Buscar usuarios..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filtrar por rol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los roles</SelectItem>
                        <SelectItem value="CLIENT">Clientes</SelectItem>
                        <SelectItem value="TECHNICIAN">Técnicos</SelectItem>
                        <SelectItem value="MANAGER">Managers</SelectItem>
                        <SelectItem value="ADMIN">Administradores</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardTitle>
                <CardDescription>
                  Administra todos los usuarios del sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="bg-gray-100 p-4 rounded-full inline-block mb-4">
                        <Users className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron usuarios</h3>
                      <p className="text-muted-foreground mb-4">
                        {searchTerm || roleFilter !== 'all' 
                          ? "Intenta ajustar los filtros o la búsqueda." 
                          : "No hay usuarios registrados en el sistema."}
                      </p>
                      {(searchTerm || roleFilter !== 'all') && (
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setSearchTerm('')
                            setRoleFilter('all')
                          }}
                        >
                          Limpiar Filtros
                        </Button>
                      )}
                    </div>
                  ) : (
                    <>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="p-2 w-10">
                              <Checkbox 
                                checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                                onCheckedChange={toggleSelectAllUsers}
                              />
                            </th>
                            <th className="text-left p-2">Usuario</th>
                            <th className="text-left p-2">Email</th>
                            <th className="text-left p-2">Rol</th>
                            <th className="text-left p-2">Estado</th>
                            <th className="text-left p-2">Registrado</th>
                            <th className="text-left p-2">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedUsers.map((user) => (
                            <tr key={user.id} className={`border-b hover:bg-gray-50 ${selectedUsers.includes(user.id) ? 'bg-blue-50' : ''}`}>
                              <td className="p-2">
                                <Checkbox 
                                  checked={selectedUsers.includes(user.id)}
                                  onCheckedChange={() => toggleSelectUser(user.id)}
                                />
                              </td>
                              <td className="p-2">
                                <div>
                                  <div className="font-medium">{user.name}</div>
                                  {user.phone && (
                                    <div className="text-xs text-gray-500">{user.phone}</div>
                                  )}
                                </div>
                              </td>
                              <td className="p-2">{user.email}</td>
                              <td className="p-2">
                                <Badge variant="outline">
                                  {getRoleText(user.role)}
                                </Badge>
                              </td>
                              <td className="p-2">
                                <Badge className={user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                  {user.isActive ? 'Activo' : 'Inactivo'}
                                </Badge>
                              </td>
                              <td className="p-2">
                                {format(new Date(user.createdAt), 'dd/MM/yyyy', { locale: es })}
                              </td>
                              <td className="p-2">
                                <div className="flex items-center space-x-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      if (user.role === 'TECHNICIAN') router.push(`/admin/technicians/${user.id}`)
                                      else if (user.role === 'CLIENT') router.push(`/admin/clients/${user.id}`)
                                      else if (user.role === 'MANAGER') router.push(`/admin/managers/${user.id}`)
                                    }}
                                  >
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      if (user.role === 'TECHNICIAN') router.push(`/admin/technicians/${user.id}/edit`)
                                      else if (user.role === 'CLIENT') router.push(`/admin/clients/${user.id}/edit`)
                                      else if (user.role === 'MANAGER') router.push(`/admin/managers/${user.id}/edit`)
                                    }}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => toggleUserStatus(user.id, user.isActive)}
                                    className={user.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                                  >
                                    {user.isActive ? <AlertCircle className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      
                      {/* Pagination Controls */}
                      {totalUserPages > 1 && (
                        <div className="flex items-center justify-between mt-4 px-2">
                          <div className="text-sm text-gray-500">
                            Mostrando {(usersPage - 1) * itemsPerPage + 1} a {Math.min(usersPage * itemsPerPage, filteredUsers.length)} de {filteredUsers.length} usuarios
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setUsersPage(p => Math.max(1, p - 1))}
                              disabled={usersPage === 1}
                            >
                              Anterior
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setUsersPage(p => Math.min(totalUserPages, p + 1))}
                              disabled={usersPage === totalUserPages}
                            >
                              Siguiente
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Work Orders Tab */}
          <TabsContent value="work-orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Órdenes de Trabajo</span>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Buscar órdenes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filtrar por estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los estados</SelectItem>
                        <SelectItem value="REQUESTED">Solicitados</SelectItem>
                        <SelectItem value="SCHEDULED">Programados</SelectItem>
                        <SelectItem value="PENDING">Pendientes</SelectItem>
                        <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                        <SelectItem value="COMPLETED">Completados</SelectItem>
                        <SelectItem value="CANCELLED">Cancelados</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardTitle>
                <CardDescription>
                  Visualiza y gestiona todas las órdenes de trabajo del sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  {filteredWorkOrders.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="bg-gray-100 p-4 rounded-full inline-block mb-4">
                        <FileText className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron órdenes</h3>
                      <p className="text-muted-foreground mb-4">
                        {searchTerm || statusFilter !== 'all' 
                          ? "Intenta ajustar los filtros o la búsqueda." 
                          : "No hay órdenes de trabajo registradas."}
                      </p>
                      {(searchTerm || statusFilter !== 'all') && (
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setSearchTerm('')
                            setStatusFilter('all')
                          }}
                        >
                          Limpiar Filtros
                        </Button>
                      )}
                    </div>
                  ) : (
                    <>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="p-2 w-10">
                              <Checkbox 
                                checked={selectedOrders.length === paginatedOrders.length && paginatedOrders.length > 0}
                                onCheckedChange={toggleSelectAllOrders}
                              />
                            </th>
                            <th className="text-left p-2">Orden</th>
                            <th className="text-left p-2">Título</th>
                            <th className="text-left p-2">Cliente</th>
                            <th className="text-left p-2">Técnico</th>
                            <th className="text-left p-2">Estado</th>
                            <th className="text-left p-2">Prioridad</th>
                            <th className="text-left p-2">Fecha</th>
                            <th className="text-left p-2">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedOrders.map((order) => (
                            <tr key={order.id} className={`border-b hover:bg-gray-50 ${selectedOrders.includes(order.id) ? 'bg-blue-50' : ''}`}>
                              <td className="p-2">
                                <Checkbox 
                                  checked={selectedOrders.includes(order.id)}
                                  onCheckedChange={() => toggleSelectOrder(order.id)}
                                />
                              </td>
                              <td className="p-2 font-mono text-xs">{order.orderNumber}</td>
                              <td className="p-2">
                                <div className="max-w-xs truncate" title={order.title}>
                                  {order.title}
                                </div>
                              </td>
                              <td className="p-2">{order.clientName}</td>
                              <td className="p-2">{order.technicianName || 'No asignado'}</td>
                              <td className="p-2">
                                <Badge className={getStatusColor(order.status)}>
                                  {getStatusText(order.status)}
                                </Badge>
                              </td>
                              <td className="p-2">
                                <Badge className={getPriorityColor(order.priority)}>
                                  {getPriorityText(order.priority)}
                                </Badge>
                              </td>
                              <td className="p-2">
                                {format(new Date(order.createdAt), 'dd/MM/yyyy', { locale: es })}
                              </td>
                              <td className="p-2">
                                <div className="flex items-center space-x-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => router.push(`/admin/work-orders/${order.id}`)}
                                  >
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => router.push(`/admin/work-orders/${order.id}/edit`)}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Pagination Controls */}
                      {totalOrderPages > 1 && (
                        <div className="flex items-center justify-between mt-4 px-2">
                          <div className="text-sm text-gray-500">
                            Mostrando {(ordersPage - 1) * itemsPerPage + 1} a {Math.min(ordersPage * itemsPerPage, filteredWorkOrders.length)} de {filteredWorkOrders.length} órdenes
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setOrdersPage(p => Math.max(1, p - 1))}
                              disabled={ordersPage === 1}
                            >
                              Anterior
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setOrdersPage(p => Math.min(totalOrderPages, p + 1))}
                              disabled={ordersPage === totalOrderPages}
                            >
                              Siguiente
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-6">
            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/admin/reports')}>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Reportes</h3>
                    <p className="text-sm text-gray-500">Ver estadísticas</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/admin/audit')}>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Auditoría</h3>
                    <p className="text-sm text-gray-500">Historial de actividad</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/admin/services')}>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Settings className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Servicios</h3>
                    <p className="text-sm text-gray-500">Gestionar catálogo</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración del Sistema</CardTitle>
                  <CardDescription>
                    Ajustes generales de la plataforma
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Nombre del Sitio</Label>
                    <Input 
                      id="siteName" 
                      value={systemSettings.siteName}
                      onChange={(e) => setSystemSettings({...systemSettings, siteName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siteEmail">Email de Contacto</Label>
                    <Input 
                      id="siteEmail" 
                      value={systemSettings.siteEmail}
                      onChange={(e) => setSystemSettings({...systemSettings, siteEmail: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maintenanceMode">Modo Mantenimiento</Label>
                    <Select 
                      value={systemSettings.maintenanceMode}
                      onValueChange={(v) => setSystemSettings({...systemSettings, maintenanceMode: v})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="enabled">Habilitado</SelectItem>
                        <SelectItem value="disabled">Deshabilitado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleSaveSettings} disabled={savingSettings}>
                    {savingSettings ? 'Guardando...' : 'Guardar Configuración'}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resumen del Sistema</CardTitle>
                  <CardDescription>
                    Información general del estado del sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm font-medium">Versión del Sistema</span>
                    <span className="text-sm">v1.0.0</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm font-medium">Base de Datos</span>
                    <span className="text-sm text-green-600">Conectada</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm font-medium">Último Backup</span>
                    <span className="text-sm">Hoy, 02:00 AM</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm font-medium">Espacio en Disco</span>
                    <span className="text-sm">2.4 GB / 10 GB</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
