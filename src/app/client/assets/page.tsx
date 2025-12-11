'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { 
  Search, Plus, Wrench, AlertTriangle, CheckCircle, 
  Clock, QrCode, MoreVertical, Loader2, Package,
  ChevronLeft, ChevronRight, Calendar, MapPin,
  FileText, Download, X, RefreshCw, Filter
} from 'lucide-react'
import Link from 'next/link'
import QRCode from 'qrcode'
import AssetCard, { AssetCardSkeleton } from '@/components/client/AssetCard'

interface Asset {
  id: string
  qrCode: string
  name: string
  brand?: string
  model?: string
  serialNumber?: string
  status: string
  location?: {
    name: string
  }
  lastMaintenance?: string
  nextMaintenance?: string
  installationDate?: string
  workOrders?: Array<{
    id: string
    title: string
    status: string
    createdAt: string
  }>
}

export default function MyAssetsDashboard() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [showQRModal, setShowQRModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9

  useEffect(() => {
    fetchAssets()
  }, [])

  const fetchAssets = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      const response = await fetch('/api/client/assets')
      if (response.ok) {
        const data = await response.json()
        setAssets(Array.isArray(data) ? data : [])
        
        if (isRefresh) {
          toast({
            title: "✅ Datos actualizados",
            description: "La información de activos se ha actualizado.",
          })
        }
      } else if (response.status === 404) {
        setAssets([])
      }
    } catch (error) {
      console.error('Error fetching assets:', error)
      toast({
        title: "❌ Error al cargar activos",
        description: "No se pudieron cargar los activos. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [toast])

  const filteredAssets = useMemo(() => {
    let filtered = [...assets]

    if (searchTerm) {
      filtered = filtered.filter(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(a => a.status === statusFilter)
    }

    return filtered
  }, [assets, searchTerm, statusFilter])

  const paginatedAssets = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredAssets.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredAssets, currentPage])

  const totalPages = useMemo(() => {
    return Math.ceil(filteredAssets.length / itemsPerPage)
  }, [filteredAssets.length])

  const statusCounts = useMemo(() => ({
    all: assets.length,
    OPERATIONAL: assets.filter(a => a.status === 'OPERATIONAL').length,
    MAINTENANCE_NEEDED: assets.filter(a => a.status === 'MAINTENANCE_NEEDED').length,
    FAILED: assets.filter(a => a.status === 'FAILED').length
  }), [assets])

  const generateQRCode = useCallback(async (asset: Asset) => {
    try {
      const qrData = JSON.stringify({
        id: asset.id,
        name: asset.name,
        serialNumber: asset.serialNumber,
        qrCode: asset.qrCode
      })
      
      const url = await QRCode.toDataURL(qrData, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      
      setQrCodeUrl(url)
      setSelectedAsset(asset)
      setShowQRModal(true)
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "No se pudo generar el código QR.",
        variant: "destructive",
      })
    }
  }, [toast])

  const downloadQRCode = useCallback(() => {
    if (!qrCodeUrl || !selectedAsset) return
    
    const link = document.createElement('a')
    link.download = `QR_${selectedAsset.name.replace(/\s+/g, '_')}.png`
    link.href = qrCodeUrl
    link.click()
    
    toast({
      title: "✅ QR descargado",
      description: "El código QR se ha descargado correctamente.",
    })
  }, [qrCodeUrl, selectedAsset, toast])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPERATIONAL':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'MAINTENANCE_NEEDED':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'FAILED':
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPERATIONAL':
        return <Badge className="bg-green-100 text-green-800">Operativo</Badge>
      case 'MAINTENANCE_NEEDED':
        return <Badge className="bg-yellow-100 text-yellow-800">Requiere Mantenimiento</Badge>
      case 'FAILED':
        return <Badge className="bg-red-100 text-red-800">Averiado</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <AssetCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Mis Activos</h1>
          <p className="text-muted-foreground mt-1">Gestiona y monitorea tus equipos</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => fetchAssets(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Link href="/client/assets/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Activo
            </Button>
          </Link>
        </div>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card 
          className={`cursor-pointer hover:shadow-md transition-all ${statusFilter === 'all' ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => {
            setStatusFilter('all')
            setCurrentPage(1)
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Activos</p>
                <p className="text-2xl font-bold">{statusCounts.all}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer hover:shadow-md transition-all ${statusFilter === 'OPERATIONAL' ? 'ring-2 ring-green-500' : ''}`}
          onClick={() => {
            setStatusFilter('OPERATIONAL')
            setCurrentPage(1)
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Operativos</p>
                <p className="text-2xl font-bold text-green-600">{statusCounts.OPERATIONAL}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer hover:shadow-md transition-all ${statusFilter === 'MAINTENANCE_NEEDED' ? 'ring-2 ring-yellow-500' : ''}`}
          onClick={() => {
            setStatusFilter('MAINTENANCE_NEEDED')
            setCurrentPage(1)
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Mantenimiento</p>
                <p className="text-2xl font-bold text-yellow-600">{statusCounts.MAINTENANCE_NEEDED}</p>
              </div>
              <Wrench className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer hover:shadow-md transition-all ${statusFilter === 'FAILED' ? 'ring-2 ring-red-500' : ''}`}
          onClick={() => {
            setStatusFilter('FAILED')
            setCurrentPage(1)
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Averiados</p>
                <p className="text-2xl font-bold text-red-600">{statusCounts.FAILED}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nombre, marca, modelo o serial..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="pl-10"
          />
        </div>
        {statusFilter !== 'all' && (
          <Button 
            variant="outline" 
            onClick={() => {
              setStatusFilter('all')
              setCurrentPage(1)
            }}
          >
            <X className="h-4 w-4 mr-2" />
            Limpiar Filtro
          </Button>
        )}
      </div>

      {/* Assets Grid */}
      {filteredAssets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-gray-500">
            <Package className="h-16 w-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">No se encontraron activos</p>
            <p className="text-sm mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Intenta ajustar los filtros de búsqueda' 
                : 'Agrega tu primer activo para comenzar'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Link href="/client/assets/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Activo
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {paginatedAssets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                onViewDetails={() => setSelectedAsset(asset)}
                onShowQR={() => generateQRCode(asset)}
              >
                <Link href={`/client/work-orders/new?assetId=${asset.id}`} className="block mt-2">
                  <Button size="sm" className="w-full">
                    <Wrench className="h-3 w-3 mr-1" />
                    Solicitar Servicio
                  </Button>
                </Link>
              </AssetCard>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredAssets.length)} de {filteredAssets.length} activos
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm font-medium">
                  Página {currentPage} de {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Asset Detail Modal */}
      <Dialog open={!!selectedAsset && !showQRModal} onOpenChange={() => setSelectedAsset(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedAsset?.name}</DialogTitle>
            <DialogDescription>
              {selectedAsset?.brand && selectedAsset?.model && (
                <span>{selectedAsset.brand} - {selectedAsset.model}</span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedAsset && (
            <div className="space-y-6">
              {/* Status */}
              <div>
                <h3 className="font-semibold mb-2">Estado</h3>
                {getStatusBadge(selectedAsset.status)}
              </div>

              {/* Basic Information */}
              <div>
                <h3 className="font-semibold mb-3">Información Básica</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {selectedAsset.serialNumber && (
                    <div>
                      <p className="text-gray-600">Número de Serie</p>
                      <p className="font-medium">{selectedAsset.serialNumber}</p>
                    </div>
                  )}
                  {selectedAsset.qrCode && (
                    <div>
                      <p className="text-gray-600">Código QR</p>
                      <p className="font-medium">{selectedAsset.qrCode}</p>
                    </div>
                  )}
                  {selectedAsset.location && (
                    <div>
                      <p className="text-gray-600">Ubicación</p>
                      <p className="font-medium">{selectedAsset.location.name}</p>
                    </div>
                  )}
                  {selectedAsset.installationDate && (
                    <div>
                      <p className="text-gray-600">Fecha de Instalación</p>
                      <p className="font-medium">{formatDate(selectedAsset.installationDate)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Maintenance Information */}
              <div>
                <h3 className="font-semibold mb-3">Mantenimiento</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Último Mantenimiento</p>
                    <p className="font-medium">{formatDate(selectedAsset.lastMaintenance)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Próximo Mantenimiento</p>
                    <p className="font-medium">{formatDate(selectedAsset.nextMaintenance)}</p>
                  </div>
                </div>
              </div>

              {/* Work Orders History */}
              {selectedAsset.workOrders && selectedAsset.workOrders.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Historial de Servicios</h3>
                  <div className="space-y-2">
                    {selectedAsset.workOrders.slice(0, 5).map((wo) => (
                      <div key={wo.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{wo.title}</p>
                          <p className="text-xs text-gray-600">{formatDate(wo.createdAt)}</p>
                        </div>
                        <Badge variant="outline">{wo.status}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Link href={`/client/work-orders/new?assetId=${selectedAsset.id}`} className="flex-1">
                  <Button className="w-full">
                    <Wrench className="h-4 w-4 mr-2" />
                    Solicitar Servicio
                  </Button>
                </Link>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSelectedAsset(selectedAsset)
                    generateQRCode(selectedAsset)
                  }}
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  Ver QR
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* QR Code Modal */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Código QR - {selectedAsset?.name}</DialogTitle>
            <DialogDescription>
              Escanea este código para acceder rápidamente a la información del activo
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center space-y-4 py-4">
            {qrCodeUrl && (
              <img 
                src={qrCodeUrl} 
                alt="QR Code" 
                className="w-64 h-64 border-4 border-gray-200 rounded-lg"
              />
            )}
            <div className="text-center text-sm text-gray-600">
              <p className="font-medium">{selectedAsset?.name}</p>
              {selectedAsset?.serialNumber && (
                <p>Serial: {selectedAsset.serialNumber}</p>
              )}
            </div>
            <Button onClick={downloadQRCode} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Descargar QR
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
