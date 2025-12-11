'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, MapPin, User, AlertTriangle, CheckCircle2, Phone } from 'lucide-react'
import { SLATimer } from '@/components/technician/SLATimer'
import { cn } from '@/lib/utils'

interface SLAData {
  deadline: string
  remainingMs: number
  remainingMinutes: number
  isOverdue: boolean
  status: 'OK' | 'CRITICAL' | 'OVERDUE'
}

interface WorkOrderCardProps {
  order: {
    id: string
    orderNumber: string
    title: string
    description: string
    clientName: string
    address: string
    contactPerson: string
    contactPhone: string
    urgency: string
    status: string
    subStatus?: string | null
    sla?: {
      firstResponse: SLAData | null
      onSite: SLAData | null
      resolution: SLAData | null
    } | null
    hasContract: boolean
    contractType?: string
  }
  onSelect: () => void
  isSelected: boolean
}

export function WorkOrderCard({ order, onSelect, isSelected }: WorkOrderCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'REQUESTED': return 'bg-blue-100 text-blue-800'
      case 'SCHEDULED': return 'bg-indigo-100 text-indigo-800'
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'EMERGENCY': return 'bg-red-500 text-white'
      case 'URGENT': return 'bg-orange-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  // Determine which SLA to show prominently based on status
  const getActiveSLA = () => {
    if (!order.sla) return null
    
    if (order.status === 'REQUESTED' && order.sla.firstResponse) {
      return { sla: order.sla.firstResponse, label: '1ra Respuesta' }
    } else if (order.status === 'SCHEDULED' && order.sla.onSite) {
      return { sla: order.sla.onSite, label: 'En Sitio' }
    } else if (order.status === 'IN_PROGRESS' && order.sla.resolution) {
      return { sla: order.sla.resolution, label: 'Resolución' }
    }
    
    return null
  }

  const activeSLA = getActiveSLA()
  const hasCriticalSLA = activeSLA && (activeSLA.sla.status === 'CRITICAL' || activeSLA.sla.status === 'OVERDUE')

  return (
    <Card 
      className={cn(
        'cursor-pointer transition-all hover:shadow-lg',
        isSelected && 'ring-2 ring-blue-500',
        hasCriticalSLA && 'border-2 border-orange-500'
      )}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg">{order.title}</CardTitle>
              {order.hasContract && (
                <Badge variant="outline" className="text-xs">
                  {order.contractType}
                </Badge>
              )}
            </div>
            <p className="text-sm text-slate-500">#{order.orderNumber}</p>
          </div>
          <div className="flex flex-col gap-1 items-end">
            <Badge className={getStatusColor(order.status)}>
              {order.status}
            </Badge>
            {order.urgency !== 'NORMAL' && (
              <Badge className={getPriorityColor(order.urgency)}>
                {order.urgency}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* SLA Timer - Prominent Display */}
        {activeSLA && (
          <div className={cn(
            'rounded-lg p-3 border-2',
            activeSLA.sla.status === 'OVERDUE' && 'border-red-500 bg-red-50 animate-pulse',
            activeSLA.sla.status === 'CRITICAL' && 'border-orange-500 bg-orange-50',
            activeSLA.sla.status === 'OK' && 'border-green-500 bg-green-50'
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {activeSLA.sla.status === 'OVERDUE' ? (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                ) : activeSLA.sla.status === 'CRITICAL' ? (
                  <Clock className="h-5 w-5 text-orange-600" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                )}
                <span className="text-sm font-medium">{activeSLA.label}</span>
              </div>
              <SLATimer sla={activeSLA.sla} label="" compact />
            </div>
          </div>
        )}

        {/* Client Info */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <User className="h-4 w-4" />
            <span>{order.clientName}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">{order.address}</span>
          </div>
          {order.contactPerson && (
            <div className="flex items-center gap-2 text-slate-600">
              <Phone className="h-4 w-4" />
              <span>{order.contactPerson} - {order.contactPhone}</span>
            </div>
          )}
        </div>

        {/* Sub-status if exists */}
        {order.subStatus && (
          <Badge variant="secondary" className="text-xs">
            {order.subStatus}
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}
