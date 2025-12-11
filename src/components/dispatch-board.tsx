'use client'

import React, { useState, useEffect } from 'react'
import { DndContext, DragOverlay, useDraggable, useDroppable, DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'

interface WorkOrder {
  id: string
  orderNumber: string
  title: string
  priority: string
  technicianId?: string | null
}

interface Technician {
  id: string
  name: string
  email: string
  avatar?: string
  isAvailable: boolean
}

interface DispatchBoardProps {
  initialOrders: WorkOrder[]
  technicians: Technician[]
  onAssign: (orderId: string, technicianId: string) => Promise<void>
  onUnassign?: (orderId: string) => Promise<void>
}

function DraggableOrder({ order }: { order: WorkOrder }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: order.id,
    data: { order }
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="mb-2 cursor-grab active:cursor-grabbing">
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-3">
          <div className="flex justify-between items-start">
            <span className="font-mono text-xs text-gray-500">{order.orderNumber}</span>
            <Badge variant={order.priority === 'URGENT' ? 'destructive' : 'outline'} className="text-xs">
              {order.priority}
            </Badge>
          </div>
          <p className="font-medium text-sm mt-1 truncate">{order.title}</p>
        </CardContent>
      </Card>
    </div>
  )
}

function TechnicianColumn({ technician, orders }: { technician: Technician, orders: WorkOrder[] }) {
  const { setNodeRef } = useDroppable({
    id: technician.id,
  })

  return (
    <div ref={setNodeRef} className="bg-gray-50 rounded-lg p-4 min-h-[300px]">
      <div className="flex items-center gap-3 mb-4">
        <Avatar>
          <AvatarImage src={technician.avatar} />
          <AvatarFallback>{technician.name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h4 className="font-semibold text-sm">{technician.name}</h4>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${technician.isAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-xs text-gray-500">{technician.isAvailable ? 'Disponible' : 'Ocupado'}</span>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {orders.map(order => (
          <DraggableOrder key={order.id} order={order} />
        ))}
        {orders.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed rounded-lg">
            Arrastra órdenes aquí
          </div>
        )}
      </div>
    </div>
  )
}

function UnassignedColumn({ orders }: { orders: WorkOrder[] }) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'unassigned',
  })
  
  return (
    <Card ref={setNodeRef} className={`h-full transition-colors ${isOver ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Órdenes Sin Asignar</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          {orders.map(order => (
            <DraggableOrder key={order.id} order={order} />
          ))}
          {orders.length === 0 && (
            <div className="text-center text-gray-500 py-4 border-2 border-dashed rounded-lg">
              Arrastra aquí para desasignar
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export function DispatchBoard({ initialOrders, technicians, onAssign, onUnassign }: DispatchBoardProps) {
  const [orders, setOrders] = useState(initialOrders)
  const [activeDragId, setActiveDragId] = useState<string | null>(null)

  useEffect(() => {
    setOrders(initialOrders)
  }, [initialOrders])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveDragId(null)

    if (!over) return

    const orderId = active.id as string
    const targetId = over.id as string
    const previousOrders = [...orders]

    if (targetId === 'unassigned') {
      // Unassign: drag to unassigned column
      if (onUnassign) {
        setOrders(prev => prev.map(o => 
          o.id === orderId ? { ...o, technicianId: null } : o
        ))
        try {
          await onUnassign(orderId)
        } catch (error) {
          console.error("Failed to unassign order, reverting", error)
          setOrders(previousOrders)
        }
      }
    } else {
      // Assign to technician
      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, technicianId: targetId } : o
      ))
      try {
        await onAssign(orderId, targetId)
      } catch (error) {
        console.error("Failed to assign order, reverting", error)
        setOrders(previousOrders)
      }
    }
  }

  const unassignedOrders = orders.filter(o => !o.technicianId)

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[700px]">
        <div className="lg:col-span-1">
          <UnassignedColumn orders={unassignedOrders} />
        </div>
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {technicians.map(tech => (
              <TechnicianColumn 
                key={tech.id} 
                technician={tech} 
                orders={orders.filter(o => o.technicianId === tech.id)} 
              />
            ))}
          </div>
        </div>
      </div>
      
      <DragOverlay>
        {activeDragId ? (
          <Card className="w-64 shadow-xl cursor-grabbing">
            <CardContent className="p-3">
              <span className="font-medium">Moviendo orden...</span>
            </CardContent>
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
