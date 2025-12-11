'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Plus, FileText, Calendar, AlertCircle, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'

interface Contract {
  id: string
  clientProfile: {
    companyName: string
    ruc: string | null
  }
  type: string
  status: string
  startDate: string
  endDate: string | null
  autoRenewal: boolean
}

export default function ContractsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchContracts()
  }, [])

  const fetchContracts = async () => {
    try {
      const response = await fetch('/api/admin/contracts')
      if (response.ok) {
        const data = await response.json()
        setContracts(data)
      }
    } catch (error) {
      console.error('Error fetching contracts:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-500">Activo</Badge>
      case 'EXPIRED':
        return <Badge variant="destructive">Vencido</Badge>
      case 'DRAFT':
        return <Badge variant="secondary">Borrador</Badge>
      case 'TERMINATED':
        return <Badge variant="outline" className="text-red-500 border-red-500">Terminado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestión de Contratos</h1>
          <p className="text-slate-500">Administra los contratos marco y acuerdos de servicio.</p>
        </div>
        <Link href="/admin/contracts/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Contrato
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contratos Activos</CardTitle>
          <CardDescription>Lista de todos los contratos registrados en el sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          {contracts.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No hay contratos registrados.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Vigencia</TableHead>
                  <TableHead>Renovación</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell className="font-medium">
                      <div>{contract.clientProfile.companyName}</div>
                      <div className="text-xs text-slate-500">{contract.clientProfile.ruc}</div>
                    </TableCell>
                    <TableCell>{getTypeLabel(contract.type)}</TableCell>
                    <TableCell>{getStatusBadge(contract.status)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col text-sm">
                        <span className="text-green-600">Inicio: {format(new Date(contract.startDate), 'dd MMM yyyy', { locale: es })}</span>
                        {contract.endDate && (
                          <span className="text-red-500">Fin: {format(new Date(contract.endDate), 'dd MMM yyyy', { locale: es })}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {contract.autoRenewal ? (
                        <Badge variant="outline" className="text-blue-600 border-blue-600">Automática</Badge>
                      ) : (
                        <span className="text-slate-500 text-sm">Manual</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/contracts/${contract.id}`}>Ver Detalle</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
