'use client'

import { useState, useEffect, createContext, useContext } from 'react'
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
    textDark: 'text-blue-700',
    active: 'bg-blue-100 text-blue-700',
  },
  green: {
    bg: 'bg-green-600',
    bgLight: 'bg-green-100',
    text: 'text-green-600',
    textDark: 'text-green-700',
    active: 'bg-green-100 text-green-700',
  },
  purple: {
    bg: 'bg-purple-600',
    bgLight: 'bg-purple-100',
    text: 'text-purple-600',
    textDark: 'text-purple-700',
    active: 'bg-purple-100 text-purple-700',
  },
  orange: {
    bg: 'bg-orange-600',
    bgLight: 'bg-orange-100',
    text: 'text-orange-600',
    textDark: 'text-orange-700',
    active: 'bg-orange-100 text-orange-700',
  },
}

// Context for sidebar state
const SidebarContext = createContext<{
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  isMobile: boolean
}>({
  isOpen: false,
  setIsOpen: () => {},
  isMobile: false,
})

export function useSidebar() {
  return useContext(SidebarContext)
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
  const [isMobile, setIsMobile] = useState(true)
  const pathname = usePathname()
  const { data: session } = useSession()
  const colors = colorConfig[config.color]

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (!mobile) {
        setSidebarOpen(true)
      } else {
        setSidebarOpen(false)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close sidebar on navigation on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }, [pathname, isMobile])

  const handleSignOut = () => signOut({ callbackUrl: '/auth/signin' })

  return (
    <SidebarContext.Provider value={{ isOpen: sidebarOpen, setIsOpen: setSidebarOpen, isMobile }}>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b z-40 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSidebarOpen(true)}
              className="shrink-0"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className={`${colors.bg} p-1.5 rounded-lg`}>
                <Settings className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg">{config.title}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {config.pendingCount && config.pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {config.pendingCount}
                </span>
              )}
            </Button>
          </div>
        </header>

        {/* Mobile Overlay */}
        <AnimatePresence>
          {sidebarOpen && isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[60] lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <aside 
          className={`
            fixed top-0 left-0 h-full bg-white border-r shadow-lg z-[70]
            transition-transform duration-300 ease-in-out
            w-72 lg:w-64
            ${isMobile 
              ? sidebarOpen ? 'translate-x-0' : '-translate-x-full'
              : 'translate-x-0'
            }
          `}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <div className="flex items-center gap-2">
              <div className={`${colors.bg} p-2 rounded-lg`}>
                <Settings className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg">{config.title}</span>
                <p className={`text-xs ${colors.text}`}>{config.role}</p>
              </div>
            </div>
            {isMobile && (
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-200px)]">
            {config.navItems.map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <Link key={item.href} href={item.href}>
                  <div 
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                      ${isActive ? colors.active : 'text-gray-600 hover:bg-gray-100'}
                    `}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span className="flex-1 text-sm font-medium">{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <Badge className="bg-orange-500">{item.badge}</Badge>
                    )}
                    {isActive && <ChevronRight className="h-4 w-4 shrink-0" />}
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* User Section */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 ${colors.bgLight} rounded-full flex items-center justify-center shrink-0`}>
                <span className={`${colors.text} font-semibold`}>
                  {session?.user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{session?.user?.name}</p>
                <p className="text-xs text-gray-500">{config.role}</p>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className={`
          transition-all duration-300
          pt-16 lg:pt-0
          lg:ml-64
        `}>
          {/* Desktop Header */}
          <header className="hidden lg:flex h-16 bg-white border-b items-center justify-between px-6 sticky top-0 z-30">
            <h1 className="font-semibold text-gray-800">
              {config.navItems.find(i => pathname.startsWith(i.href))?.label || config.title}
            </h1>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {config.pendingCount && config.pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {config.pendingCount}
                  </span>
                )}
              </Button>
            </div>
          </header>

          {/* Page Content */}
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarContext.Provider>
  )
}
