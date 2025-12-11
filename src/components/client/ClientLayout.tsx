'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { 
  LayoutDashboard, 
  PlusCircle, 
  Package, 
  FileCheck, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  User,
  Bell,
  HelpCircle,
  ChevronRight,
  Home,
  Clock,
  FileText,
  BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface ClientLayoutProps {
  children: React.ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/client/dashboard', icon: LayoutDashboard },
    { name: 'Nueva Solicitud', href: '/client/solicitar-servicio', icon: PlusCircle },
    { name: 'Mis Activos', href: '/client/assets', icon: Package },
    { name: 'Aprobaciones', href: '/client/approvals', icon: FileCheck },
    { name: 'Historial', href: '/client/history', icon: Clock },
    { name: 'Facturas', href: '/client/invoices', icon: FileText },
    { name: 'Reportes', href: '/client/reports', icon: BarChart3 },
  ]

  const isActive = (path: string) => pathname === path

  // Generate breadcrumbs based on path
  const getBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean)
    // Remove 'client' from paths as it's the root for this layout
    const clientPaths = paths.filter(p => p !== 'client')
    
    return clientPaths.map((path, index) => {
      const href = `/client/${clientPaths.slice(0, index + 1).join('/')}`
      const isLast = index === clientPaths.length - 1
      const title = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ')
      
      return { href, title, isLast }
    })
  }

  const breadcrumbs = getBreadcrumbs()

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      <div className="p-6">
        <Link href="/client/dashboard" className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold">SIEME</span>
        </Link>
      </div>

      <ScrollArea className="flex-1 px-4 py-4">
        <div className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
                onClick={() => setIsMobileOpen(false)}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </div>

        <Separator className="my-4 bg-slate-800" />

        <div className="px-4 py-2">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Soporte
          </h3>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800 px-0"
          >
            <HelpCircle className="mr-3 h-5 w-5" />
            Centro de Ayuda
          </Button>
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-4 py-3">
          <Avatar className="h-9 w-9 border border-slate-700">
            <AvatarImage src={session?.user?.image || ''} />
            <AvatarFallback className="bg-slate-800 text-slate-200">
              {session?.user?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-white">
              {session?.user?.name || 'Usuario'}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {session?.user?.email || ''}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 fixed inset-y-0 z-50">
        <SidebarContent />
      </aside>

      {/* Mobile Header & Content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <header className="bg-white border-b sticky top-0 z-40 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72 border-r-0 bg-slate-900">
                <SidebarContent />
              </SheetContent>
            </Sheet>

            {/* Breadcrumbs - Hidden on very small screens */}
            <div className="hidden sm:block">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/client/dashboard">
                      <Home className="h-4 w-4" />
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  {breadcrumbs.map((crumb, index) => (
                    <div key={crumb.href} className="flex items-center">
                      <BreadcrumbSeparator>
                        <ChevronRight className="h-4 w-4" />
                      </BreadcrumbSeparator>
                      <BreadcrumbItem>
                        {crumb.isLast ? (
                          <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink href={crumb.href}>{crumb.title}</BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </div>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5 text-slate-600" />
                  <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="p-4 text-center text-sm text-slate-500">
                  No tienes notificaciones nuevas
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
