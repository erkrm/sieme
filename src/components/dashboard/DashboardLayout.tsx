'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, 
  X, 
  ChevronRight, 
  LogOut, 
  Bell,
  Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LucideIcon } from 'lucide-react'

// Types
interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  badge?: number
}

interface SidebarConfig {
  title: string
  role: string
  color: 'blue' | 'green' | 'purple' | 'orange'
  navItems: NavItem[]
  pendingCount?: number
}

// Color configurations
const colorConfig = {
  blue: {
    bg: 'bg-blue-600',
    bgLight: 'bg-blue-100',
    text: 'text-blue-600',
    active: 'bg-blue-100 text-blue-700',
  },
  green: {
    bg: 'bg-green-600',
    bgLight: 'bg-green-100',
    text: 'text-green-600',
    active: 'bg-green-100 text-green-700',
  },
  purple: {
    bg: 'bg-purple-600',
    bgLight: 'bg-purple-100',
    text: 'text-purple-600',
    active: 'bg-purple-100 text-purple-700',
  },
  orange: {
    bg: 'bg-orange-600',
    bgLight: 'bg-orange-100',
    text: 'text-orange-600',
    active: 'bg-orange-100 text-orange-700',
  },
}

// Main Dashboard Layout Component
export function DashboardLayout({ 
  children, 
  config 
}: { 
  children: React.ReactNode
  config: SidebarConfig 
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()
  const colors = colorConfig[config.color]

  // Close sidebar on navigation
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  const handleSignOut = () => signOut({ callbackUrl: '/auth/signin' })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - Collapsed (icons only) on mobile, full on desktop */}
      <aside 
        id="app-sidebar"
        className="fixed top-0 left-0 h-full bg-white border-r shadow-lg z-[100] w-16 lg:w-64 transition-all duration-300 ease-in-out"
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-center lg:justify-between h-14 lg:h-16 px-2 lg:px-4 border-b">
          <div className="flex items-center gap-2">
            <div className={`${colors.bg} p-2 rounded-lg`}>
              <Settings className="h-5 w-5 text-white" />
            </div>
            <div className="hidden lg:block">
              <span className="font-bold">{config.title}</span>
              <p className={`text-xs ${colors.text}`}>{config.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-2 lg:p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
          {config.navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href}>
                <div 
                  className={`
                    flex items-center justify-center lg:justify-start gap-3 p-3 lg:px-3 lg:py-2.5 rounded-lg transition-colors
                    ${isActive ? colors.active : 'text-gray-600 hover:bg-gray-100'}
                  `}
                  title={item.label}
                >
                  <item.icon className="h-6 w-6 lg:h-5 lg:w-5 shrink-0" />
                  <span className="hidden lg:block flex-1 text-sm font-medium">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <Badge className="bg-orange-500 text-xs hidden lg:flex">{item.badge}</Badge>
                  )}
                  {/* Mobile badge indicator */}
                  {item.badge && item.badge > 0 && (
                    <span className="lg:hidden absolute top-1 right-1 bg-orange-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="h-4 w-4 shrink-0 hidden lg:block" />}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-2 lg:p-4 border-t bg-white">
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-0 lg:mb-3">
            <div className={`w-10 h-10 ${colors.bgLight} rounded-full flex items-center justify-center shrink-0`}>
              <span className={`${colors.text} font-semibold`}>
                {session?.user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="hidden lg:block flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{session?.user?.name}</p>
              <p className="text-xs text-gray-500">{config.role}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full hidden lg:flex" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
          <Button variant="ghost" className="w-full lg:hidden p-2" size="icon" onClick={handleSignOut} title="Cerrar Sesión">
            <LogOut className="h-5 w-5 text-gray-500" />
          </Button>
        </div>
      </aside>

      {/* Main Content - margin for collapsed sidebar on mobile, full sidebar on desktop */}
      <main className="ml-16 lg:ml-64 min-h-screen">
        {/* Desktop Header - Only visible on desktop */}
        <header className="hidden lg:flex h-16 bg-white border-b items-center justify-between px-6 sticky top-0 z-30">
          <h1 className="font-semibold text-gray-800">
            {config.navItems.find(i => pathname.startsWith(i.href))?.label || config.title}
          </h1>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {config.pendingCount && config.pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {config.pendingCount}
              </span>
            )}
          </Button>
        </header>

        {/* Mobile Header */}
        <header className="lg:hidden h-14 bg-white border-b flex items-center justify-between px-4 sticky top-0 z-30">
          <h1 className="font-semibold text-gray-800 truncate">
            {config.navItems.find(i => pathname.startsWith(i.href))?.label || 'Dashboard'}
          </h1>
          <Button variant="ghost" size="icon" className="relative shrink-0">
            <Bell className="h-5 w-5" />
            {config.pendingCount && config.pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                {config.pendingCount}
              </span>
            )}
          </Button>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
