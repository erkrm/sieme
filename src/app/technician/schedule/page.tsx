'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, MapPin, User } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface ScheduleItem {
  id: string
  orderNumber: string
  title: string
  status: string
  scheduledDate: string
  serviceAddress: string
  client?: { name: string }
}

const statusColors: Record<string, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-800 border-blue-300',
  IN_PROGRESS: 'bg-purple-100 text-purple-800 border-purple-300',
  PENDING: 'bg-orange-100 text-orange-800 border-orange-300'
}

export default function TechnicianSchedulePage() {
  const { data: session } = useSession()
  const [schedule, setSchedule] = useState<ScheduleItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await fetch('/api/technician/orders')
        if (res.ok) {
          const data = await res.json()
          const orders = Array.isArray(data) ? data : data.orders || []
          // Filter only scheduled/in-progress with dates
          const scheduled = orders.filter((o: ScheduleItem) => 
            ['SCHEDULED', 'IN_PROGRESS', 'PENDING'].includes(o.status) && o.scheduledDate
          ).sort((a: ScheduleItem, b: ScheduleItem) => 
            new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
          )
          setSchedule(scheduled)
        }
      } catch (e) {
        console.error('Error:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchSchedule()
  }, [])

  const groupByDate = (items: ScheduleItem[]) => {
    const groups: Record<string, ScheduleItem[]> = {}
    items.forEach(item => {
      const date = new Date(item.scheduledDate).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
      if (!groups[date]) groups[date] = []
      groups[date].push(item)
    })
    return groups
  }

  if (loading) return <Skeleton className="h-[500px]" />

  const grouped = groupByDate(schedule)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mi Agenda</h1>
        <p className="text-gray-500">Próximas órdenes de trabajo programadas</p>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No tienes órdenes programadas</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <h3 className="text-lg font-semibold text-gray-700 mb-3 capitalize">{date}</h3>
              <div className="space-y-3">
                {items.map(item => (
                  <Card key={item.id} className={`border-l-4 ${statusColors[item.status] || 'border-gray-300'}`}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-mono text-sm text-gray-500">{item.orderNumber}</p>
                          <p className="font-semibold">{item.title}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {new Date(item.scheduledDate).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {item.client?.name || 'Cliente'}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {item.serviceAddress?.slice(0, 40)}...
                            </span>
                          </div>
                        </div>
                        <Badge className={statusColors[item.status]}>{item.status}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
