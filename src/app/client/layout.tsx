'use client'

import { useSession, signOut } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  ClipboardList, 
  PlusCircle, 
  History, 
  FileText, 
  BarChart3,
  LogOut,
  ChevronRight,
  Bell,
  Menu,
  X,
  Receipt,
  Box,
  CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'

interface ClientLayoutProps {
  children: React.ReactNode
}

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

export default function ClientLayout({ children }: ClientLayoutProps) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
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

  const handleSignOut = () => signOut({ callbackUrl: '/auth/signin' })

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white border-r shadow-sm transition-all duration-300 fixed h-full z-40`}>
        <div className="flex items-center justify-between h-16 px-4 border-b">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="bg-green-600 p-2 rounded-lg">
                <ClipboardList className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg">SIEME</span>
            </div>
          )}
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
        
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'
                }`}>
                  <item.icon className="h-5 w-5" />
                  {sidebarOpen && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      {item.href === '/client/approvals' && pendingApprovals > 0 && (
                        <Badge className="bg-orange-500">{pendingApprovals}</Badge>
                      )}
                      {isActive && <ChevronRight className="h-4 w-4" />}
                    </>
                  )}
                </div>
              </Link>
            )
          })}
        </nav>

        {sidebarOpen && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold">{session?.user?.name?.charAt(0)}</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm truncate">{session?.user?.name}</p>
                <p className="text-xs text-gray-500">Cliente</p>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300`}>
        {/* Top Bar */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-6 sticky top-0 z-30">
          <div>
            <h1 className="font-semibold text-gray-800">
              {navItems.find(i => pathname.startsWith(i.href))?.label || 'Portal Cliente'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {pendingApprovals > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingApprovals}
                </span>
              )}
            </Button>
          </div>
        </header>
        
        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
