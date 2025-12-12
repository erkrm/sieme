'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { 
  LayoutDashboard, 
  ClipboardList, 
  Building2, 
  FileText, 
  BarChart3,
  Receipt,
  FileCheck,
  Wrench,
  UserCog,
  History,
  Settings
} from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/work-orders', label: 'Órdenes de Trabajo', icon: ClipboardList },
  { href: '/admin/technicians', label: 'Técnicos', icon: Wrench },
  { href: '/admin/managers', label: 'Managers', icon: UserCog },
  { href: '/admin/clients', label: 'Clientes', icon: Building2 },
  { href: '/admin/contracts', label: 'Contratos', icon: FileCheck },
  { href: '/admin/quotations', label: 'Cotizaciones', icon: FileText },
  { href: '/admin/invoices', label: 'Facturas', icon: Receipt },
  { href: '/admin/services', label: 'Servicios', icon: Settings },
  { href: '/admin/reports', label: 'Reportes', icon: BarChart3 },
  { href: '/admin/audit', label: 'Auditoría', icon: History },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await fetch('/api/admin/work-orders?status=REQUESTED')
        if (res.ok) {
          const data = await res.json()
          setPendingCount(Array.isArray(data) ? data.length : 0)
        }
      } catch (e) {
        console.error('Error:', e)
      }
    }
    if (status === 'authenticated') fetchPending()
  }, [status])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Add badge to work-orders nav item
  const navItemsWithBadge = navItems.map(item => ({
    ...item,
    badge: item.href === '/admin/work-orders' ? pendingCount : undefined
  }))

  return (
    <DashboardLayout
      config={{
        title: 'SIEME Admin',
        role: 'Administrador',
        color: 'blue',
        navItems: navItemsWithBadge,
        pendingCount,
      }}
    >
      {children}
    </DashboardLayout>
  )
}
