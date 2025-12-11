'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Play, Square, Clock, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

interface TimeTrackingProps {
  workOrderId: string
}

export default function TimeTracking({ workOrderId }: TimeTrackingProps) {
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isTimerRunning && startTime) {
      interval = setInterval(() => {
        const now = new Date()
        setElapsedTime(Math.floor((now.getTime() - startTime.getTime()) / 1000))
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isTimerRunning, startTime])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleToggleTimer = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/technician/work-orders/${workOrderId}/time`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: isTimerRunning ? 'Trabajo en curso' : 'Inicio de trabajo'
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.status === 'started') {
          setIsTimerRunning(true)
          setStartTime(new Date())
          setError(null)
        } else {
          setIsTimerRunning(false)
          setStartTime(null)
          setElapsedTime(0)
          setError(null)
        }
      } else {
        setError('Error al gestionar el timer')
      }
    } catch (error) {
      console.error('Error toggling timer:', error)
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          Control de Tiempo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="text-3xl font-mono font-bold text-slate-900">
            {formatTime(elapsedTime)}
          </div>
          
          <Button
            variant={isTimerRunning ? "destructive" : "default"}
            className="w-full"
            onClick={handleToggleTimer}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isTimerRunning ? (
              <>
                <Square className="h-4 w-4 mr-2 fill-current" />
                Detener Timer
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2 fill-current" />
                Iniciar Timer
              </>
            )}
          </Button>

          {isTimerRunning && (
            <p className="text-xs text-muted-foreground animate-pulse">
              Grabando tiempo...
            </p>
          )}
          
          {error && (
            <p className="text-xs text-red-600">
              {error}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
