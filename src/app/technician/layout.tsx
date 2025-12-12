'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { 
  LayoutDashboard, 
  ClipboardList, 
  Calendar, 
  History, 
  DollarSign, 
  User
} from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'

const navItems = [
  { href: '/technician/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/technician/orders', label: 'Mis Órdenes', icon: ClipboardList },
  { href: '/technician/schedule', label: 'Mi Agenda', icon: Calendar },
  { href: '/technician/history', label: 'Historial', icon: History },
  { href: '/technician/earnings', label: 'Ganancias', icon: DollarSign },
  { href: '/technician/profile', label: 'Mi Perfil', icon: User },
]

export default function TechnicianLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeOrders, setActiveOrders] = useState(0)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated' && session?.user?.role !== 'TECHNICIAN') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    const fetchActive = async () => {
      try {
        const res = await fetch('/api/technician/work-orders')
        if (res.ok) {
          const data = await res.json()
          setActiveOrders(Array.isArray(data) ? data.length : data.orders?.length || 0)
        }
      } catch (e) {
        console.error('Error:', e)
      }
    }
    if (status === 'authenticated') fetchActive()
  }, [status])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  const navItemsWithBadge = navItems.map(item => ({
    ...item,
    badge: item.href === '/technician/orders' ? activeOrders : undefined
  }))

  return (
    <DashboardLayout
      config={{
        title: 'SIEME',
        role: 'Técnico',
        color: 'orange',
        navItems: navItemsWithBadge,
        pendingCount: activeOrders,
      }}
    >
      {children}
    </DashboardLayout>
  )
}
