'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  ArrowLeft, 
  Calendar, 
  Building, 
  CreditCard, 
  Clock, 
  AlertTriangle,
  FileText,
  Edit,
  Trash2,
  Loader2
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useToast } from '@/hooks/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Contract {
  id: string
  clientProfile: {
    companyName: string
    ruc: string | null
    user: {
      name: string
      email: string
    }
  }
  type: string
  status: string
  startDate: string
  endDate: string | null
  autoRenewal: boolean
  paymentTerms: number
  emergencyLimit: number | null
  autoApproveLimit: number | null
  discountPercent: number
  rates: {
    id: string
    hourlyRate: number
    nightMultiplier: number
    weekendMultiplier: number
    holidayMultiplier: number
    emergencyMultiplier: number
    serviceCategory: {
      name: string
    }
  }[]
  slas: {
    id: string
    priority: string
    firstResponseMinutes: number
    onSiteMinutes: number
    resolutionMinutes: number
    penaltyPercent: number
  }[]
  _count: {
    workOrders: number
    invoices: number
  }
}

export default function ContractDetailPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [contract, setContract] = useState<Contract | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchContract()
    }
  }, [params.id])

  const fetchContract = async () => {
    try {
      const response = await fetch(`/api/admin/contracts/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setContract(data)
      } else {
        toast({
          title: "Error",
          description: "No se pudo cargar el contrato",
          variant: "destructive"
        })
        router.push('/admin/contracts')
      }
    } catch (error) {
      console.error('Error fetching contract:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const response = await fetch(`/api/admin/contracts/${params.id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        toast({
          title: "Contrato eliminado",
          description: "El contrato ha sido eliminado exitosamente."
        })
        router.push('/admin/contracts')
      } else {
        const error = await response.json()
        toast({
          title: "Error al eliminar",
          description: error.error || "No se pudo eliminar el contrato",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error deleting contract:', error)
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado",
        variant: "destructive"
      })
    } finally {
      setDeleting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <Badge className="bg-green-500">Activo</Badge>
      case 'EXPIRED': return <Badge variant="destructive">Vencido</Badge>
      case 'DRAFT': return <Badge variant="secondary">Borrador</Badge>
      case 'TERMINATED': return <Badge variant="outline" className="text-red-500 border-red-500">Terminado</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'FRAMEWORK': return 'Marco'
      case 'ON_DEMAND': return 'Por Demanda'
      case 'PREVENTIVE': return 'Preventivo'
      case 'DEDICATED': return 'Dedicado'
      default: return type
    }
  }

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '-'
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount)
  }

  const formatMinutes = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (mins === 0) return `${hours}h`
    return `${hours}h ${mins}m`
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!contract) return null

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/admin/contracts')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              Contrato: {contract.clientProfile.companyName}
              {getStatusBadge(contract.status)}
            </h1>
            <p className="text-slate-500 text-sm flex items-center gap-2 mt-1">
              <Building className="h-3 w-3" />
              {contract.clientProfile.ruc} • {getTypeLabel(contract.type)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/admin/contracts/${params.id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={contract._count.workOrders > 0}>
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Esto eliminará permanentemente el contrato y toda su configuración asociada.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                  {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Eliminar"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Vigencia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {format(new Date(contract.startDate), 'dd/MM/yyyy')}
            </div>
            <p className="text-xs text-slate-500">
              Hasta: {contract.endDate ? format(new Date(contract.endDate), 'dd/MM/yyyy') : 'Indefinido'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Términos de Pago</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contract.paymentTerms} días</div>
            <p className="text-xs text-slate-500">Crédito otorgado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Límite Automático</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(contract.autoApproveLimit)}</div>
            <p className="text-xs text-slate-500">Aprobación directa</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Actividad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contract._count.workOrders}</div>
            <p className="text-xs text-slate-500">Órdenes generadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Details Tabs */}
      <Tabs defaultValue="rates" className="w-full">
        <TabsList>
          <TabsTrigger value="rates">Tarifas</TabsTrigger>
          <TabsTrigger value="slas">Niveles de Servicio (SLA)</TabsTrigger>
          <TabsTrigger value="info">Información General</TabsTrigger>
        </TabsList>
        
        <TabsContent value="rates">
          <Card>
            <CardHeader>
              <CardTitle>Tarifas por Categoría</CardTitle>
              <CardDescription>Costos horarios y multiplicadores aplicables.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Tarifa Base / Hora</TableHead>
                    <TableHead>Nocturno (x)</TableHead>
                    <TableHead>Fin de Semana (x)</TableHead>
                    <TableHead>Feriado (x)</TableHead>
                    <TableHead>Emergencia (x)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contract.rates.map((rate) => (
                    <TableRow key={rate.id}>
                      <TableCell className="font-medium">{rate.serviceCategory.name}</TableCell>
                      <TableCell>{formatCurrency(rate.hourlyRate)}</TableCell>
                      <TableCell>{rate.nightMultiplier}x</TableCell>
                      <TableCell>{rate.weekendMultiplier}x</TableCell>
                      <TableCell>{rate.holidayMultiplier}x</TableCell>
                      <TableCell>{rate.emergencyMultiplier}x</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="slas">
          <Card>
            <CardHeader>
              <CardTitle>Acuerdos de Nivel de Servicio</CardTitle>
              <CardDescription>Tiempos de respuesta comprometidos según prioridad.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prioridad</TableHead>
                    <TableHead>1ra Respuesta</TableHead>
                    <TableHead>En Sitio</TableHead>
                    <TableHead>Resolución</TableHead>
                    <TableHead>Penalidad</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contract.slas.map((sla) => (
                    <TableRow key={sla.id}>
                      <TableCell>
                        <Badge variant={
                          sla.priority === 'EMERGENCY' ? 'destructive' : 
                          sla.priority === 'URGENT' ? 'default' : 'secondary'
                        }>
                          {sla.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatMinutes(sla.firstResponseMinutes)}</TableCell>
                      <TableCell>{formatMinutes(sla.onSiteMinutes)}</TableCell>
                      <TableCell>{formatMinutes(sla.resolutionMinutes)}</TableCell>
                      <TableCell className="text-red-500">{sla.penaltyPercent}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>Información del Contrato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-slate-500">Cliente</h4>
                  <p>{contract.clientProfile.companyName}</p>
                  <p className="text-sm text-slate-500">{contract.clientProfile.ruc}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-slate-500">Contacto Principal</h4>
                  <p>{contract.clientProfile.user.name}</p>
                  <p className="text-sm text-slate-500">{contract.clientProfile.user.email}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-slate-500">Descuento Global</h4>
                  <p>{contract.discountPercent}%</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-slate-500">Renovación</h4>
                  <p>{contract.autoRenewal ? 'Automática' : 'Manual'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-slate-500">Límite de Emergencia</h4>
                  <p>{formatCurrency(contract.emergencyLimit)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
