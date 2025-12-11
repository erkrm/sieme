'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SLAData {
  deadline: string
  remainingMs: number
  remainingMinutes: number
  isOverdue: boolean
  status: 'OK' | 'CRITICAL' | 'OVERDUE'
}

interface SLATimerProps {
  sla: SLAData | null
  label: string
  compact?: boolean
}

export function SLATimer({ sla, label, compact = false }: SLATimerProps) {
  const [remaining, setRemaining] = useState(sla?.remainingMs || 0)
  const [status, setStatus] = useState(sla?.status || 'OK')

  useEffect(() => {
    if (!sla) return

    // Update every second
    const interval = setInterval(() => {
      const now = new Date().getTime()
      const deadline = new Date(sla.deadline).getTime()
      const diff = deadline - now

      setRemaining(diff)
      
      if (diff < 0) {
        setStatus('OVERDUE')
      } else if (diff < 1800000) { // 30 minutes
        setStatus('CRITICAL')
      } else {
        setStatus('OK')
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [sla])

  if (!sla) {
    return null
  }

  const formatTime = (ms: number) => {
    const absMs = Math.abs(ms)
    const hours = Math.floor(absMs / 3600000)
    const minutes = Math.floor((absMs % 3600000) / 60000)
    const seconds = Math.floor((absMs % 60000) / 1000)

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    } else {
      return `${seconds}s`
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'OVERDUE':
        return 'bg-red-500 text-white'
      case 'CRITICAL':
        return 'bg-orange-500 text-white'
      default:
        return 'bg-green-500 text-white'
    }
  }

  const getIcon = () => {
    switch (status) {
      case 'OVERDUE':
        return <AlertTriangle className="h-4 w-4" />
      case 'CRITICAL':
        return <Clock className="h-4 w-4" />
      default:
        return <CheckCircle2 className="h-4 w-4" />
    }
  }

  if (compact) {
    return (
      <Badge className={cn('flex items-center gap-1', getStatusColor())}>
        {getIcon()}
        <span className="font-mono text-xs">
          {remaining < 0 && '-'}
          {formatTime(remaining)}
        </span>
      </Badge>
    )
  }

  return (
    <div className={cn(
      'rounded-lg p-3 border-2',
      status === 'OVERDUE' && 'border-red-500 bg-red-50',
      status === 'CRITICAL' && 'border-orange-500 bg-orange-50',
      status === 'OK' && 'border-green-500 bg-green-50'
    )}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        {getIcon()}
      </div>
      <div className={cn(
        'text-2xl font-mono font-bold',
        status === 'OVERDUE' && 'text-red-700',
        status === 'CRITICAL' && 'text-orange-700',
        status === 'OK' && 'text-green-700'
      )}>
        {remaining < 0 && '-'}
        {formatTime(remaining)}
      </div>
      {status === 'OVERDUE' && (
        <p className="text-xs text-red-600 mt-1">¡Tiempo excedido!</p>
      )}
      {status === 'CRITICAL' && (
        <p className="text-xs text-orange-600 mt-1">¡Tiempo crítico!</p>
      )}
    </div>
  )
}

interface SLAPanelProps {
  sla: {
    firstResponse: SLAData | null
    onSite: SLAData | null
    resolution: SLAData | null
  } | null
}

export function SLAPanel({ sla }: SLAPanelProps) {
  if (!sla) {
    return (
      <div className="bg-slate-50 rounded-lg p-4 text-center text-slate-500">
        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Sin SLA definido para esta orden</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {sla.firstResponse && (
        <SLATimer sla={sla.firstResponse} label="1ra Respuesta" />
      )}
      {sla.onSite && (
        <SLATimer sla={sla.onSite} label="En Sitio" />
      )}
      {sla.resolution && (
        <SLATimer sla={sla.resolution} label="Resolución" />
      )}
    </div>
  )
}
