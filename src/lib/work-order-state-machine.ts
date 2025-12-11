/**
 * Work Order State Machine
 * Manages valid state transitions and business rules
 */

export type WorkOrderStatus = 
  | 'REQUESTED'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'PENDING'
  | 'COMPLETED'
  | 'INVOICED'
  | 'CLOSED'
  | 'CANCELLED'

export type WorkOrderSubStatus =
  | 'en_camino'
  | 'en_sitio'
  | 'ejecutando'
  | 'esperando_aprobacion'
  | 'esperando_repuesto'
  | 'esperando_cliente'
  | null

interface StateTransition {
  from: WorkOrderStatus
  to: WorkOrderStatus
  allowedRoles: string[]
  requiredConditions?: (data: any) => boolean
  onTransition?: (data: any) => Promise<void>
}

export class WorkOrderStateMachine {
  private static transitions: StateTransition[] = [
    // REQUESTED -> SCHEDULED
    {
      from: 'REQUESTED',
      to: 'SCHEDULED',
      allowedRoles: ['ADMIN', 'MANAGER'],
      requiredConditions: (data) => !!data.technicianId && !!data.scheduledDate
    },
    
    // REQUESTED -> CANCELLED
    {
      from: 'REQUESTED',
      to: 'CANCELLED',
      allowedRoles: ['ADMIN', 'MANAGER', 'CLIENT']
    },
    
    // SCHEDULED -> IN_PROGRESS
    {
      from: 'SCHEDULED',
      to: 'IN_PROGRESS',
      allowedRoles: ['TECHNICIAN'],
      requiredConditions: (data) => !!data.startedAt
    },
    
    // SCHEDULED -> CANCELLED
    {
      from: 'SCHEDULED',
      to: 'CANCELLED',
      allowedRoles: ['ADMIN', 'MANAGER', 'CLIENT']
    },
    
    // IN_PROGRESS -> PENDING
    {
      from: 'IN_PROGRESS',
      to: 'PENDING',
      allowedRoles: ['TECHNICIAN'],
      requiredConditions: (data) => !!data.pauseReason
    },
    
    // IN_PROGRESS -> COMPLETED
    {
      from: 'IN_PROGRESS',
      to: 'COMPLETED',
      allowedRoles: ['TECHNICIAN'],
      requiredConditions: (data) => !!data.checkOutAt && !!data.workReport
    },
    
    // PENDING -> IN_PROGRESS
    {
      from: 'PENDING',
      to: 'IN_PROGRESS',
      allowedRoles: ['TECHNICIAN', 'ADMIN', 'MANAGER']
    },
    
    // PENDING -> CANCELLED
    {
      from: 'PENDING',
      to: 'CANCELLED',
      allowedRoles: ['ADMIN', 'MANAGER', 'CLIENT']
    },
    
    // COMPLETED -> INVOICED
    {
      from: 'COMPLETED',
      to: 'INVOICED',
      allowedRoles: ['ADMIN', 'MANAGER', 'FINANCE'],
      requiredConditions: (data) => !!data.invoiceId
    },
    
    // INVOICED -> CLOSED
    {
      from: 'INVOICED',
      to: 'CLOSED',
      allowedRoles: ['ADMIN', 'MANAGER', 'FINANCE'],
      requiredConditions: (data) => data.isPaid === true
    }
  ]

  static canTransition(
    from: WorkOrderStatus,
    to: WorkOrderStatus,
    userRole: string,
    data?: any
  ): { allowed: boolean; reason?: string } {
    const transition = this.transitions.find(t => t.from === from && t.to === to)
    
    if (!transition) {
      return { allowed: false, reason: 'Transición no permitida' }
    }
    
    if (!transition.allowedRoles.includes(userRole)) {
      return { allowed: false, reason: 'Rol no autorizado para esta transición' }
    }
    
    if (transition.requiredConditions && !transition.requiredConditions(data)) {
      return { allowed: false, reason: 'No se cumplen las condiciones requeridas' }
    }
    
    return { allowed: true }
  }

  static getValidTransitions(from: WorkOrderStatus, userRole: string): WorkOrderStatus[] {
    return this.transitions
      .filter(t => t.from === from && t.allowedRoles.includes(userRole))
      .map(t => t.to)
  }

  static getSubStatusForStatus(status: WorkOrderStatus): WorkOrderSubStatus[] {
    switch (status) {
      case 'IN_PROGRESS':
        return ['en_camino', 'en_sitio', 'ejecutando']
      case 'PENDING':
        return ['esperando_aprobacion', 'esperando_repuesto', 'esperando_cliente']
      default:
        return [null]
    }
  }
}

/**
 * Calculate distance between two GPS coordinates (Haversine formula)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c // Distance in km
}

/**
 * Validate if technician is within geofence radius of work order location
 */
export function isWithinGeofence(
  technicianLat: number,
  technicianLon: number,
  siteLat: number,
  siteLon: number,
  radiusKm: number = 0.5 // 500 meters default
): boolean {
  const distance = calculateDistance(technicianLat, technicianLon, siteLat, siteLon)
  return distance <= radiusKm
}
