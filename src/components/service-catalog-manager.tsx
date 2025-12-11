'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Edit, Trash2, Folder, FileText, Loader2 } from 'lucide-react'

interface ServiceCategory {
  id: string
  name: string
  description?: string
  parentId?: string
  children: ServiceCategory[]
  services: Service[]
}

interface Service {
  id: string
  name: string
  description?: string
  categoryId: string
  basePrice: number
  estimatedHours?: number
}

export default function ServiceCatalogManager() {
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [showServiceForm, setShowServiceForm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    parentId: ''
  })

  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    categoryId: '',
    basePrice: 0,
    estimatedHours: 0
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [categoriesRes, servicesRes] = await Promise.all([
        fetch('/api/services/categories'),
        fetch('/api/services')
      ])

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json()
        setCategories(categoriesData)
      }

      if (servicesRes.ok) {
        const servicesData = await servicesRes.json()
        setServices(servicesData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/services/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm)
      })

      if (response.ok) {
        fetchData()
        setShowCategoryForm(false)
        setCategoryForm({ name: '', description: '', parentId: '' })
      }
    } catch (error) {
      console.error('Error creating category:', error)
    }
  }

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceForm)
      })

      if (response.ok) {
        fetchData()
        setShowServiceForm(false)
        setServiceForm({ name: '', description: '', categoryId: '', basePrice: 0, estimatedHours: 0 })
      }
    } catch (error) {
      console.error('Error creating service:', error)
    }
  }

  const renderCategoryTree = (cats: ServiceCategory[], level = 0) => {
    return cats.map((category) => (
      <div key={category.id} style={{ marginLeft: `${level * 20}px` }} className="mb-2">
        <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
          <div className="flex items-center gap-2">
            <Folder className="h-4 w-4 text-blue-600" />
            <span className="font-medium">{category.name}</span>
            <span className="text-xs text-gray-500">({category.services.length} servicios)</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSelectedCategory(category.id)}
          >
            Ver Servicios
          </Button>
        </div>
        {category.children.length > 0 && renderCategoryTree(category.children, level + 1)}
      </div>
    ))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Catálogo de Servicios</h2>
        <div className="flex gap-2">
          <Button onClick={() => setShowCategoryForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Categoría
          </Button>
          <Button onClick={() => setShowServiceForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Servicio
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories Tree */}
        <Card>
          <CardHeader>
            <CardTitle>Categorías</CardTitle>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No hay categorías</p>
            ) : (
              renderCategoryTree(categories)
            )}
          </CardContent>
        </Card>

        {/* Services List */}
        <Card>
          <CardHeader>
            <CardTitle>Servicios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {services
                .filter(s => !selectedCategory || s.categoryId === selectedCategory)
                .map((service) => (
                  <div key={service.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">{service.name}</div>
                      <div className="text-sm text-gray-500">
                        ${service.basePrice.toFixed(2)} {service.estimatedHours && `• ${service.estimatedHours}h`}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Form Modal */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Nueva Categoría</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div>
                  <Label>Nombre</Label>
                  <Input
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Descripción</Label>
                  <Textarea
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Categoría Padre (opcional)</Label>
                  <Select
                    value={categoryForm.parentId}
                    onValueChange={(value) => setCategoryForm({ ...categoryForm, parentId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Ninguna (raíz)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Ninguna (raíz)</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">Crear</Button>
                  <Button type="button" variant="outline" onClick={() => setShowCategoryForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Service Form Modal */}
      {showServiceForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Nuevo Servicio</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateService} className="space-y-4">
                <div>
                  <Label>Nombre</Label>
                  <Input
                    value={serviceForm.name}
                    onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Descripción</Label>
                  <Textarea
                    value={serviceForm.description}
                    onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Categoría</Label>
                  <Select
                    value={serviceForm.categoryId}
                    onValueChange={(value) => setServiceForm({ ...serviceForm, categoryId: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Precio Base ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={serviceForm.basePrice}
                      onChange={(e) => setServiceForm({ ...serviceForm, basePrice: parseFloat(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Horas Estimadas</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={serviceForm.estimatedHours}
                      onChange={(e) => setServiceForm({ ...serviceForm, estimatedHours: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">Crear</Button>
                  <Button type="button" variant="outline" onClick={() => setShowServiceForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
