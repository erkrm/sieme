'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { 
  LayoutDashboard, 
  ClipboardList, 
  Users, 
  Building2, 
  FileText, 
  BarChart3
} from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'

const navItems = [
  { href: '/manager/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/manager/work-orders', label: 'Órdenes de Trabajo', icon: ClipboardList },
  { href: '/manager/technicians', label: 'Técnicos', icon: Users },
  { href: '/manager/clients', label: 'Clientes', icon: Building2 },
  { href: '/manager/quotations', label: 'Cotizaciones', icon: FileText },
  { href: '/manager/reports', label: 'Reportes', icon: BarChart3 },
]

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [pendingQuotations, setPendingQuotations] = useState(0)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated' && session?.user?.role !== 'MANAGER') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await fetch('/api/quotations?status=PENDING')
        if (res.ok) {
          const data = await res.json()
          setPendingQuotations(Array.isArray(data) ? data.length : 0)
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  const navItemsWithBadge = navItems.map(item => ({
    ...item,
    badge: item.href === '/manager/quotations' ? pendingQuotations : undefined
  }))

  return (
    <DashboardLayout
      config={{
        title: 'SIEME',
        role: 'Manager',
        color: 'purple',
        navItems: navItemsWithBadge,
        pendingCount: pendingQuotations,
      }}
    >
      {children}
    </DashboardLayout>
  )
}
