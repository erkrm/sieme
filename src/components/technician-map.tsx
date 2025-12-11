'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { MapPin, Navigation, Phone, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)

interface WorkOrder {
  id: string
  orderNumber: string
  title: string
  clientName: string
  clientPhone: string
  address: string
  status: string
  urgency: string
  latitude?: number
  longitude?: number
}

interface TechnicianMapProps {
  workOrders: WorkOrder[]
  onOrderSelect?: (orderId: string) => void
}

export default function TechnicianMap({ workOrders, onOrderSelect }: TechnicianMapProps) {
  const [isClient, setIsClient] = useState(false)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)

  useEffect(() => {
    setIsClient(true)
    
    // Request user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude])
        },
        (error) => {
          console.error('Error getting location:', error)
          setLocationError('No se pudo obtener tu ubicación')
          // Default to a central location if geolocation fails
          setUserLocation([40.4168, -3.7038]) // Madrid, Spain
        }
      )
    } else {
      setLocationError('Geolocalización no disponible')
      setUserLocation([40.4168, -3.7038])
    }
  }, [])

  // Filter orders with valid coordinates
  const ordersWithLocation = workOrders.filter(
    order => order.latitude && order.longitude
  )

  const getMarkerColor = (status: string, urgency: string) => {
    if (urgency === 'CRITICAL' || urgency === 'HIGH') return 'red'
    if (status === 'IN_PROGRESS') return 'blue'
    if (status === 'ASSIGNED') return 'orange'
    return 'green'
  }

  const openInMaps = (lat: number, lng: number, address: string) => {
    // Open in Google Maps or Apple Maps depending on device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    if (isMobile) {
      window.open(`https://maps.google.com/?q=${lat},${lng}`, '_blank')
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank')
    }
  }

  if (!isClient || !userLocation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Mapa de Órdenes
          </CardTitle>
          <CardDescription>Cargando ubicaciones...</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Mapa de Órdenes
        </CardTitle>
        <CardDescription>
          {ordersWithLocation.length} órdenes con ubicación
          {locationError && <span className="text-yellow-600 ml-2">({locationError})</span>}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full rounded-lg overflow-hidden border">
          <MapContainer
            center={userLocation}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* User's current location marker */}
            {userLocation && (
              <Marker position={userLocation}>
                <Popup>
                  <div className="text-center">
                    <strong>Tu ubicación</strong>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Work order markers */}
            {ordersWithLocation.map((order) => (
              <Marker
                key={order.id}
                position={[order.latitude!, order.longitude!]}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <h3 className="font-semibold text-sm mb-1">{order.title}</h3>
                    <p className="text-xs text-gray-600 mb-2">#{order.orderNumber}</p>
                    
                    <div className="space-y-1 text-xs mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{order.address}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span>{order.clientPhone}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs"
                        onClick={() => openInMaps(order.latitude!, order.longitude!, order.address)}
                      >
                        <Navigation className="h-3 w-3 mr-1" />
                        Navegar
                      </Button>
                      {onOrderSelect && (
                        <Button
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => onOrderSelect(order.id)}
                        >
                          Ver
                        </Button>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {ordersWithLocation.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No hay órdenes con ubicación disponible</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
