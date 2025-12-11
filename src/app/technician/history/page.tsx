'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { History, CheckCircle } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface CompletedOrder {
  id: string
  orderNumber: string
  title: string
  completedAt: string
  client?: { name: string }
  category: string
}

export default function TechnicianHistoryPage() {
  const { data: session } = useSession()
  const [history, setHistory] = useState<CompletedOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('/api/technician/orders?status=COMPLETED')
        if (res.ok) {
          const data = await res.json()
          setHistory(Array.isArray(data) ? data : data.orders || [])
        }
      } catch (e) {
        console.error('Error:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [])

  if (loading) return <Skeleton className="h-[500px]" />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Historial</h1>
        <p className="text-gray-500">Órdenes de trabajo completadas</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Trabajos Completados ({history.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No hay órdenes completadas</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Orden</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Completada</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map(order => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <p className="font-mono">{order.orderNumber}</p>
                      <p className="text-sm text-gray-500">{order.title}</p>
                    </TableCell>
                    <TableCell>{order.client?.name || 'N/A'}</TableCell>
                    <TableCell><Badge variant="secondary">{order.category}</Badge></TableCell>
                    <TableCell>{order.completedAt ? new Date(order.completedAt).toLocaleDateString('es-ES') : 'N/A'}</TableCell>
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
