'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Bell, Search, Filter, CheckCheck, Trash2, Loader2, AlertCircle, FileText, Package } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  createdAt: string
  relatedId?: string
}

export default function NotificationsPage() {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetchNotifications()
  }, [])

  useEffect(() => {
    filterNotifications()
  }, [notifications, searchTerm, filterType, filterStatus])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterNotifications = () => {
    let filtered = [...notifications]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(n => n.type === filterType)
    }

    // Status filter
    if (filterStatus === 'unread') {
      filtered = filtered.filter(n => !n.read)
    } else if (filterStatus === 'read') {
      filtered = filtered.filter(n => n.read)
    }

    setFilteredNotifications(filtered)
  }

  const markAsRead = async (notificationIds: string[]) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds })
      })

      if (response.ok) {
        setNotifications(notifications.map(n =>
          notificationIds.includes(n.id) ? { ...n, read: true } : n
        ))
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error)
    }
  }

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
    if (unreadIds.length > 0) {
      await markAsRead(unreadIds)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'NEW_ORDER':
      case 'ORDER_UPDATE':
        return <FileText className="h-5 w-5" />
      case 'MATERIAL_REQUEST':
        return <Package className="h-5 w-5" />
      case 'SYSTEM_ALERT':
        return <AlertCircle className="h-5 w-5" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'NEW_ORDER':
        return 'bg-blue-100 text-blue-600'
      case 'ORDER_UPDATE':
        return 'bg-green-100 text-green-600'
      case 'MATERIAL_REQUEST':
        return 'bg-purple-100 text-purple-600'
      case 'SYSTEM_ALERT':
        return 'bg-red-100 text-red-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'NEW_ORDER': 'Nueva Orden',
      'ORDER_UPDATE': 'Actualización',
      'MATERIAL_REQUEST': 'Material',
      'SYSTEM_ALERT': 'Alerta'
    }
    return labels[type] || type
  }

  const unreadCount = notifications.filter(n => !n.read).length

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Notificaciones</h1>
        <p className="text-gray-600">
          {unreadCount > 0 ? `Tienes ${unreadCount} notificaciones sin leer` : 'Todas las notificaciones leídas'}
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar notificaciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Type Filter */}
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="NEW_ORDER">Nueva Orden</SelectItem>
                <SelectItem value="ORDER_UPDATE">Actualización</SelectItem>
                <SelectItem value="MATERIAL_REQUEST">Material</SelectItem>
                <SelectItem value="SYSTEM_ALERT">Alerta</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="unread">No leídas</SelectItem>
                <SelectItem value="read">Leídas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          {unreadCount > 0 && (
            <div className="mt-4 flex justify-end">
              <Button size="sm" variant="outline" onClick={markAllAsRead}>
                <CheckCheck className="h-4 w-4 mr-2" />
                Marcar todas como leídas
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-12 text-gray-500">
              <Bell className="h-16 w-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">No hay notificaciones</p>
              <p className="text-sm">Cuando recibas notificaciones, aparecerán aquí</p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-all hover:shadow-md ${
                !notification.read ? 'border-l-4 border-l-blue-600 bg-blue-50/30' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className={`p-3 rounded-full ${getNotificationColor(notification.type)} flex-shrink-0`}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{notification.title}</h3>
                        {!notification.read && (
                          <Badge variant="default" className="text-xs">Nueva</Badge>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {getTypeLabel(notification.type)}
                      </Badge>
                    </div>

                    <p className="text-gray-700 mb-2">{notification.message}</p>

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                          locale: es
                        })}
                      </p>

                      {!notification.read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markAsRead([notification.id])}
                        >
                          <CheckCheck className="h-4 w-4 mr-1" />
                          Marcar como leída
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
