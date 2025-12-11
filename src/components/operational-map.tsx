'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, MapPin } from 'lucide-react'

// Fix for default marker icons in Next.js/Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom icons for different statuses
const createIcon = (color: string) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const greenIcon = createIcon('green')
const redIcon = createIcon('red')
const blueIcon = createIcon('blue')

interface TechnicianLocation {
  id: string
  name: string
  lat: number
  lng: number
  status: string
  currentOrder?: string
  phone?: string
}

interface WorkOrderLocation {
  id: string
  orderNumber: string
  title: string
  lat: number
  lng: number
  priority: string
}

export default function OperationalMap() {
  const [technicians, setTechnicians] = useState<TechnicianLocation[]>([])
  const [orders, setOrders] = useState<WorkOrderLocation[]>([])
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  
  const fetchLocations = async () => {
    setLoading(true)
    try {
      // Fetch technicians with their locations
      const techRes = await fetch('/api/admin/technicians/locations')
      if (techRes.ok) {
        const data = await techRes.json()
        setTechnicians(data)
      } else {
        // Demo data if API fails
        setTechnicians([
          { id: '1', name: 'Juan Pérez', lat: -12.0464, lng: -77.0428, status: 'AVAILABLE', phone: '999-888-777' },
          { id: '2', name: 'María García', lat: -12.0520, lng: -77.0300, status: 'BUSY', currentOrder: 'ORD-001' },
          { id: '3', name: 'Carlos López', lat: -12.0600, lng: -77.0450, status: 'BUSY', currentOrder: 'ORD-002' },
          { id: '4', name: 'Ana Rodríguez', lat: -12.0380, lng: -77.0550, status: 'AVAILABLE' },
        ])
      }
      
      // Demo work orders
      setOrders([
        { id: 'o1', orderNumber: 'ORD-001', title: 'Mantenimiento AC', lat: -12.0510, lng: -77.0310, priority: 'URGENT' },
        { id: 'o2', orderNumber: 'ORD-002', title: 'Reparación Sistema', lat: -12.0590, lng: -77.0440, priority: 'NORMAL' },
      ])
      
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching locations:', error)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchLocations()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchLocations, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return greenIcon
      case 'BUSY': return redIcon
      default: return blueIcon
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'Disponible'
      case 'BUSY': return 'Ocupado'
      default: return status
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm">Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm">Ocupado</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-500" />
            <span className="text-sm">Orden de trabajo</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-gray-500">
              Actualizado: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={fetchLocations} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>
      
      <div className="h-[600px] w-full rounded-lg overflow-hidden border">
        <MapContainer 
          center={[-12.0464, -77.0428]} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Technician Markers */}
          {technicians.map((tech) => (
            <Marker key={tech.id} position={[tech.lat, tech.lng]} icon={getStatusIcon(tech.status)}>
              <Popup>
                <div className="min-w-[150px]">
                  <div className="font-semibold text-lg">{tech.name}</div>
                  <Badge className={tech.status === 'AVAILABLE' ? 'bg-green-500' : 'bg-red-500'}>
                    {getStatusText(tech.status)}
                  </Badge>
                  {tech.phone && <div className="text-sm mt-1">📞 {tech.phone}</div>}
                  {tech.currentOrder && (
                    <div className="text-sm text-blue-600 mt-1">
                      Trabajando en: {tech.currentOrder}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
          
          {/* Work Order Markers with circles */}
          {orders.map((order) => (
            <Circle
              key={order.id}
              center={[order.lat, order.lng]}
              radius={100}
              pathOptions={{
                color: order.priority === 'URGENT' ? 'red' : 'blue',
                fillColor: order.priority === 'URGENT' ? 'red' : 'blue',
                fillOpacity: 0.2
              }}
            >
              <Popup>
                <div className="min-w-[150px]">
                  <div className="font-mono text-sm text-gray-500">{order.orderNumber}</div>
                  <div className="font-semibold">{order.title}</div>
                  <Badge className={order.priority === 'URGENT' ? 'bg-red-500' : 'bg-blue-500'}>
                    {order.priority}
                  </Badge>
                </div>
              </Popup>
            </Circle>
          ))}
        </MapContainer>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">
            {technicians.filter(t => t.status === 'AVAILABLE').length}
          </div>
          <div className="text-sm text-green-700">Disponibles</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-red-600">
            {technicians.filter(t => t.status === 'BUSY').length}
          </div>
          <div className="text-sm text-red-700">Ocupados</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">
            {technicians.length}
          </div>
          <div className="text-sm text-blue-700">Total Técnicos</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">
            {orders.length}
          </div>
          <div className="text-sm text-purple-700">Órdenes Activas</div>
        </div>
      </div>
    </div>
  )
}
