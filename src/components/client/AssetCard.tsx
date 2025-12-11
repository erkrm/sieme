import { 
  QrCode, 
  MapPin, 
  Calendar, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  CheckCircle,
  AlertTriangle,
  XCircle,
  History
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { Asset } from '@/types/client'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface AssetCardProps {
  asset: Asset
  onViewDetails?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onShowQR?: (id: string) => void
}

export default function AssetCard({ 
  asset, 
  onViewDetails,
  onEdit,
  onDelete,
  onShowQR,
  children
}: AssetCardProps & { children?: React.ReactNode }) {

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'activo':
      case 'operational':
      case 'operativo':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'maintenance':
      case 'mantenimiento':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'inactive':
      case 'inactivo':
      case 'retired':
      case 'retirado':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'broken':
      case 'averiado':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'activo':
      case 'operational':
      case 'operativo':
        return <CheckCircle className="h-4 w-4" />
      case 'maintenance':
      case 'mantenimiento':
        return <History className="h-4 w-4" />
      case 'broken':
      case 'averiado':
        return <AlertTriangle className="h-4 w-4" />
      case 'inactive':
      case 'inactivo':
        return <XCircle className="h-4 w-4" />
      default:
        return <CheckCircle className="h-4 w-4" />
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow group overflow-hidden">
      <div className="h-2 w-full bg-gradient-to-r from-blue-500 to-cyan-500" />
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <Badge variant="outline" className="font-mono text-xs">
            {asset.serialNumber || 'N/A'}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetails?.(asset.id)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver Detalles
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onShowQR?.(asset.id)}>
                <QrCode className="mr-2 h-4 w-4" />
                Ver Código QR
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit?.(asset.id)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete?.(asset.id)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <h3 className="font-semibold text-lg mt-1 group-hover:text-blue-600 transition-colors truncate">
          {asset.name}
        </h3>
        <p className="text-sm text-muted-foreground truncate">
          {asset.brand ? `${asset.brand} - ` : ''}{asset.model || ''}
        </p>
      </CardHeader>
      
      <CardContent className="p-4 pt-2 space-y-3">
        {asset.location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">
              {typeof asset.location === 'string' ? asset.location : asset.location.name}
            </span>
          </div>
        )}
        
        {asset.nextMaintenance && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 shrink-0 text-orange-500" />
            <span className="text-muted-foreground">Mantenimiento: </span>
            <span className="font-medium text-orange-700">
              {format(new Date(asset.nextMaintenance), "d MMM yyyy", { locale: es })}
            </span>
          </div>
        )}
        {children}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <Badge className={`${getStatusColor(asset.status)} border-0`}>
          <span className="flex items-center gap-1">
            {getStatusIcon(asset.status)}
            {asset.status}
          </span>
        </Badge>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2"
          onClick={() => onShowQR?.(asset.id)}
        >
          <QrCode className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only">QR</span>
        </Button>
      </CardFooter>
    </Card>
  )
}

export function AssetCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="h-2 w-full bg-slate-100" />
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <Skeleton className="h-6 w-3/4 mt-2" />
        <Skeleton className="h-4 w-1/2 mt-1" />
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-3">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-8 w-16" />
      </CardFooter>
    </Card>
  )
}
