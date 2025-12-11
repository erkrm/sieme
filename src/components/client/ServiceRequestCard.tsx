import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Calendar,
  Wrench,
  MoreVertical,
  Eye,
  ArrowRight,
  User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { WorkOrder } from '@/types/client'
import { Skeleton } from '@/components/ui/skeleton'

interface ServiceRequestCardProps {
  request: WorkOrder
  onViewDetails?: (id: string) => void
  compact?: boolean
}

export default function ServiceRequestCard({ 
  request, 
  onViewDetails,
  compact = false 
}: ServiceRequestCardProps) {
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'completada':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'in_progress':
      case 'en_progreso':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'pending':
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelled':
      case 'cancelada':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
      case 'alta':
        return 'bg-red-50 text-red-700 border-red-100'
      case 'medium':
      case 'media':
        return 'bg-orange-50 text-orange-700 border-orange-100'
      case 'low':
      case 'baja':
        return 'bg-green-50 text-green-700 border-green-100'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'completada':
        return <CheckCircle className="h-4 w-4" />
      case 'in_progress':
      case 'en_progreso':
        return <Clock className="h-4 w-4" />
      case 'pending':
      case 'pendiente':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  if (compact) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-2 rounded-full ${getStatusColor(request.status)} bg-opacity-20`}>
              {getStatusIcon(request.status)}
            </div>
            <div>
              <h4 className="font-medium text-sm">{request.title}</h4>
              <p className="text-xs text-muted-foreground">{request.orderNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getStatusColor(request.status)}>
              {request.status}
            </Badge>
            <Button variant="ghost" size="icon" onClick={() => onViewDetails?.(request.id)}>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-md transition-shadow group">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs">
              {request.orderNumber}
            </Badge>
            <Badge variant="outline" className={getPriorityColor(request.priority)}>
              {request.priority}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetails?.(request.id)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver Detalles
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <h3 className="font-semibold text-lg mt-2 group-hover:text-blue-600 transition-colors">
          {request.title}
        </h3>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            <span>{request.service?.name || 'Servicio General'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              {format(new Date(request.requestedAt), "d 'de' MMMM, yyyy", { locale: es })}
            </span>
          </div>
          {request.technician && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{request.technician.name}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <Badge className={`${getStatusColor(request.status)} border-0`}>
          <span className="flex items-center gap-1">
            {getStatusIcon(request.status)}
            {request.status}
          </span>
        </Badge>
        <Button variant="ghost" size="sm" className="gap-1" onClick={() => onViewDetails?.(request.id)}>
          Ver Detalles
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}

export function ServiceRequestCardSkeleton() {
  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <Skeleton className="h-6 w-3/4 mt-2" />
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-8 w-28" />
      </CardFooter>
    </Card>
  )
}
