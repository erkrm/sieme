'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DollarSign, TrendingUp, Calendar, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface EarningsData {
  totalEarnings: number
  thisMonthEarnings: number
  lastMonthEarnings: number
  thisWeekEarnings: number
  hoursWorked: number
  ordersCompleted: number
  averagePerOrder: number
  hourlyRate: number
  commissionRate: number
  monthlyTrend: { month: string; earnings: number }[]
  recentEarnings: {
    id: string
    orderNumber: string
    title: string
    completedAt: string
    orderValue: number
    earnings: number
    hours: number
  }[]
}

export default function TechnicianEarningsPage() {
  const { data: session } = useSession()
  const [earnings, setEarnings] = useState<EarningsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const res = await fetch('/api/technician/earnings')
        if (res.ok) {
          setEarnings(await res.json())
        }
      } catch (e) {
        console.error('Error:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchEarnings()
  }, [])

  if (loading) return <Skeleton className="h-[500px]" />

  const monthChange = earnings && earnings.lastMonthEarnings > 0 
    ? ((earnings.thisMonthEarnings - earnings.lastMonthEarnings) / earnings.lastMonthEarnings * 100).toFixed(1)
    : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mis Ganancias</h1>
        <p className="text-gray-500">Resumen de ingresos y horas trabajadas</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Ganado</p>
                <p className="text-2xl font-bold text-green-600">S/ {earnings?.totalEarnings.toFixed(2) || '0.00'}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Este Mes</p>
                <p className="text-2xl font-bold text-blue-600">S/ {earnings?.thisMonthEarnings.toFixed(2) || '0.00'}</p>
                {monthChange && (
                  <div className={`flex items-center gap-1 text-xs ${parseFloat(monthChange) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {parseFloat(monthChange) >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {Math.abs(parseFloat(monthChange))}% vs mes anterior
                  </div>
                )}
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Horas Trabajadas</p>
                <p className="text-2xl font-bold text-purple-600">{earnings?.hoursWorked || 0}h</p>
                <p className="text-xs text-gray-400">@ S/ {earnings?.hourlyRate || 0}/hora</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Órdenes Completadas</p>
                <p className="text-2xl font-bold text-orange-600">{earnings?.ordersCompleted || 0}</p>
                <p className="text-xs text-gray-400">Prom. S/ {earnings?.averagePerOrder.toFixed(2) || '0.00'}/orden</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend */}
      {earnings?.monthlyTrend && earnings.monthlyTrend.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tendencia Mensual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between h-40 gap-2">
              {earnings.monthlyTrend.map((item, idx) => {
                const maxEarnings = Math.max(...earnings.monthlyTrend.map(m => m.earnings))
                const heightPercent = maxEarnings > 0 ? (item.earnings / maxEarnings) * 100 : 0
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs text-gray-500">S/ {item.earnings.toFixed(0)}</span>
                    <div 
                      className="w-full bg-gradient-to-t from-orange-500 to-orange-300 rounded-t-lg transition-all"
                      style={{ height: `${Math.max(heightPercent, 5)}%` }}
                    />
                    <span className="text-xs text-gray-600 capitalize">{item.month}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Earnings */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Ganancias</CardTitle>
        </CardHeader>
        <CardContent>
          {!earnings?.recentEarnings?.length ? (
            <p className="text-gray-500 text-center py-8">
              No hay órdenes completadas todavía
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Orden</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Horas</TableHead>
                  <TableHead className="text-right">Valor Orden</TableHead>
                  <TableHead className="text-right">Ganancia</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {earnings.recentEarnings.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <p className="font-mono text-sm">{item.orderNumber}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[200px]">{item.title}</p>
                    </TableCell>
                    <TableCell>
                      {item.completedAt ? new Date(item.completedAt).toLocaleDateString('es-ES') : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">{item.hours}h</Badge>
                    </TableCell>
                    <TableCell className="text-right text-gray-600">
                      S/ {item.orderValue.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-green-600">
                      S/ {item.earnings.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-900">Cómo se calculan tus ganancias</h4>
              <p className="text-sm text-blue-700 mt-1">
                Tu ganancia incluye una tarifa por hora de S/ {earnings?.hourlyRate || 25} 
                más un {earnings?.commissionRate || 15}% de comisión sobre el valor total de cada orden completada.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
