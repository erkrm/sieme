'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Plus, Loader2, Trash2 } from 'lucide-react'

interface Material {
  id: string
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface MaterialsManagerProps {
  workOrderId: string
  initialMaterials?: Material[]
}

export default function MaterialsManager({ workOrderId, initialMaterials = [] }: MaterialsManagerProps) {
  const [materials, setMaterials] = useState<Material[]>(initialMaterials)
  const [newMaterial, setNewMaterial] = useState({ name: '', quantity: 1, unitPrice: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMaterial.name || newMaterial.quantity <= 0) return

    setLoading(true)
    try {
      const response = await fetch(`/api/technician/work-orders/${workOrderId}/materials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMaterial)
      })

      if (response.ok) {
        const data = await response.json()
        // In a real app, we'd get the full material object back. 
        // For now, we'll simulate adding it to the list based on the response or local data
        const addedMaterial: Material = {
          id: data.material.id,
          name: newMaterial.name,
          quantity: newMaterial.quantity,
          unitPrice: newMaterial.unitPrice,
          totalPrice: newMaterial.quantity * newMaterial.unitPrice
        }
        
        setMaterials([...materials, addedMaterial])
        setNewMaterial({ name: '', quantity: 1, unitPrice: 0 })
        setSuccess('Material añadido exitosamente')
        setError(null)
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError('Error al añadir material')
      }
    } catch (error) {
      console.error('Error adding material:', error)
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <div className="flex items-center">
            <Package className="h-4 w-4 mr-2" />
            Materiales
          </div>
          <span className="text-xs text-muted-foreground">
            Total: ${materials.reduce((acc, m) => acc + m.totalPrice, 0).toFixed(2)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* List of materials */}
        <div className="space-y-2">
          {materials.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-2">No hay materiales registrados</p>
          ) : (
            materials.map((material) => (
              <div key={material.id} className="flex justify-between items-center text-sm bg-slate-50 p-2 rounded">
                <div>
                  <div className="font-medium">{material.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {material.quantity} x ${material.unitPrice.toFixed(2)}
                  </div>
                </div>
                <div className="font-semibold">
                  ${material.totalPrice.toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add new material form */}
        <form onSubmit={handleAddMaterial} className="space-y-3 pt-4 border-t">
          <div className="space-y-2">
            <Label htmlFor="materialName" className="text-xs">Nombre del Material</Label>
            <Input 
              id="materialName" 
              value={newMaterial.name}
              onChange={(e) => setNewMaterial({...newMaterial, name: e.target.value})}
              placeholder="Ej. Cable UTP"
              className="h-8"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-xs">Cantidad</Label>
              <Input 
                id="quantity" 
                type="number"
                min="1"
                value={newMaterial.quantity}
                onChange={(e) => setNewMaterial({...newMaterial, quantity: parseInt(e.target.value)})}
                className="h-8"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price" className="text-xs">Precio Unit.</Label>
              <Input 
                id="price" 
                type="number"
                min="0"
                step="0.01"
                value={newMaterial.unitPrice}
                onChange={(e) => setNewMaterial({...newMaterial, unitPrice: parseFloat(e.target.value)})}
                className="h-8"
              />
            </div>
          </div>
          <Button type="submit" size="sm" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3 mr-1" />}
            Añadir Material
          </Button>
          
          {error && (
            <p className="text-xs text-red-600 text-center">{error}</p>
          )}
          
          {success && (
            <p className="text-xs text-green-600 text-center">{success}</p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
