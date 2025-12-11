"use client"

import { useMemo } from "react"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  Cell, 
  Legend, 
  Pie, 
  PieChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from "recharts"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface WorkOrder {
  id: string
  status: string
  priority: string
  requestedAt: string
}

interface Invoice {
  id: string
  totalAmount: number
  status: string
  issuedAt: string
}

interface ClientAnalyticsProps {
  workOrders: WorkOrder[]
  invoices: Invoice[]
}

const COLORS = {
  primary: "#2563eb", // blue-600
  success: "#16a34a", // green-600
  warning: "#ca8a04", // yellow-600
  danger: "#dc2626", // red-600
  info: "#9333ea",   // purple-600
  neutral: "#4b5563" // gray-600
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: COLORS.warning,
  ASSIGNED: COLORS.info,
  IN_PROGRESS: COLORS.primary,
  COMPLETED: COLORS.success,
  CLIENT_APPROVED: COLORS.success,
  INVOICED: COLORS.neutral,
  PAID: COLORS.success
}

const PRIORITY_COLORS: Record<string, string> = {
  LOW: COLORS.neutral,
  MEDIUM: COLORS.success,
  HIGH: COLORS.warning,
  URGENT: COLORS.danger
}

export default function ClientAnalytics({ workOrders, invoices }: ClientAnalyticsProps) {
  
  // 1. Status Distribution
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {}
    workOrders.forEach(order => {
      counts[order.status] = (counts[order.status] || 0) + 1
    })
    
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      fill: STATUS_COLORS[name] || COLORS.neutral
    })).sort((a, b) => b.value - a.value)
  }, [workOrders])

  // 2. Priority Distribution
  const priorityData = useMemo(() => {
    const counts: Record<string, number> = {}
    workOrders.forEach(order => {
      counts[order.priority] = (counts[order.priority] || 0) + 1
    })

    const priorityOrder = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
    
    return priorityOrder.map(priority => ({
      name: priority,
      value: counts[priority] || 0,
      fill: PRIORITY_COLORS[priority]
    })).filter(item => item.value > 0)
  }, [workOrders])

  // 3. Monthly Spending (Last 6 months)
  const spendingData = useMemo(() => {
    const last6Months: Record<string, number> = {}
    const today = new Date()
    
    // Initialize last 6 months with 0
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const key = format(d, 'MMM yyyy', { locale: es })
      last6Months[key] = 0
    }

    invoices.forEach(invoice => {
      if (invoice.status !== 'CANCELLED') {
        const date = new Date(invoice.issuedAt)
        const key = format(date, 'MMM yyyy', { locale: es })
        if (last6Months[key] !== undefined) {
          last6Months[key] += invoice.totalAmount
        }
      }
    })

    return Object.entries(last6Months).map(([name, total]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize
      total
    }))
  }, [invoices])

  if (workOrders.length === 0 && invoices.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No hay suficientes datos para generar análisis.
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
      {/* Status Chart */}
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Estado de Solicitudes</CardTitle>
          <CardDescription>Distribución de tus órdenes de trabajo por estado</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value} órdenes`, 'Cantidad']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Priority Chart */}
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Prioridad</CardTitle>
          <CardDescription>Solicitudes por nivel de urgencia</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tickFormatter={(value) => {
                    const map: Record<string, string> = { 'LOW': 'Baja', 'MEDIUM': 'Media', 'HIGH': 'Alta', 'URGENT': 'Urgente' }
                    return map[value] || value
                  }}
                  fontSize={12}
                />
                <YAxis allowDecimals={false} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  formatter={(value: number) => [`${value} órdenes`, 'Cantidad']}
                  labelFormatter={(label) => {
                    const map: Record<string, string> = { 'LOW': 'Prioridad Baja', 'MEDIUM': 'Prioridad Media', 'HIGH': 'Prioridad Alta', 'URGENT': 'Prioridad Urgente' }
                    return map[label] || label
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Spending Chart */}
      <Card className="col-span-7">
        <CardHeader>
          <CardTitle>Gasto Mensual</CardTitle>
          <CardDescription>Historial de facturación de los últimos 6 meses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spendingData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis 
                  tickFormatter={(value) => `$${value}`}
                  fontSize={12}
                />
                <Tooltip 
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Total Facturado']}
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                />
                <Bar dataKey="total" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
