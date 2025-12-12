'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { 
  LayoutDashboard, 
  ClipboardList, 
  PlusCircle, 
  History, 
  BarChart3,
  Receipt,
  Box,
  CheckCircle
} from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'

const navItems = [
  { href: '/client/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/client/solicitar-servicio', label: 'Solicitar Servicio', icon: PlusCircle },
  { href: '/client/work-orders', label: 'Mis Órdenes', icon: ClipboardList },
  { href: '/client/approvals', label: 'Aprobaciones', icon: CheckCircle },
  { href: '/client/history', label: 'Historial', icon: History },
  { href: '/client/invoices', label: 'Facturas', icon: Receipt },
  { href: '/client/assets', label: 'Mis Activos', icon: Box },
  { href: '/client/reports', label: 'Reportes', icon: BarChart3 },
]

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [pendingApprovals, setPendingApprovals] = useState(0)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated' && session?.user?.role !== 'CLIENT') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await fetch('/api/quotations?status=PENDING')
        if (res.ok) {
          const data = await res.json()
          setPendingApprovals(Array.isArray(data) ? data.length : 0)
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  const navItemsWithBadge = navItems.map(item => ({
    ...item,
    badge: item.href === '/client/approvals' ? pendingApprovals : undefined
  }))

  return (
    <DashboardLayout
      config={{
        title: 'SIEME',
        role: 'Cliente',
        color: 'green',
        navItems: navItemsWithBadge,
        pendingCount: pendingApprovals,
      }}
    >
      {children}
    </DashboardLayout>
  )
}
