import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react'

interface Log {
  id: string
  newStatus: string
  createdAt: string | Date
  previousStatus: string | null
}

interface WorkOrderTimelineProps {
  logs: Log[]
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'COMPLETED': return <CheckCircle2 className="h-5 w-5 text-green-500" />
    case 'IN_PROGRESS': return <Clock className="h-5 w-5 text-blue-500" />
    case 'CANCELLED': return <AlertCircle className="h-5 w-5 text-red-500" />
    default: return <Circle className="h-5 w-5 text-gray-400" />
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'PENDING': return 'Solicitud Creada'
    case 'ASSIGNED': return 'Técnico Asignado'
    case 'IN_PROGRESS': return 'Trabajo Iniciado'
    case 'WAITING_PARTS': return 'Esperando Repuestos'
    case 'COMPLETED': return 'Trabajo Completado'
    case 'CLIENT_APPROVED': return 'Aprobado por Cliente'
    case 'CANCELLED': return 'Cancelado'
    default: return status
  }
}

export function WorkOrderTimeline({ logs }: WorkOrderTimelineProps) {
  const sortedLogs = [...logs].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {sortedLogs.map((log, logIdx) => (
          <li key={log.id}>
            <div className="relative pb-8">
              {logIdx !== sortedLogs.length - 1 ? (
                <span
                  className="absolute top-4 left-2.5 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span className="h-5 w-5 rounded-full bg-white flex items-center justify-center ring-8 ring-white">
                    {getStatusIcon(log.newStatus)}
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-0.5">
                  <div>
                    <p className="text-sm text-gray-500">
                      {getStatusText(log.newStatus)}
                    </p>
                  </div>
                  <div className="whitespace-nowrap text-right text-sm text-gray-500">
                    <time dateTime={new Date(log.createdAt).toISOString()}>
                      {format(new Date(log.createdAt), 'd MMM yyyy HH:mm', { locale: es })}
                    </time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
