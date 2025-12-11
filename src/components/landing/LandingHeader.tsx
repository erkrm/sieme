'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Settings, ArrowRight, Menu, X as XIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface LandingHeaderProps {
  variant?: 'dark' | 'light' // dark = for dark hero backgrounds, light = for light backgrounds
}

export function LandingHeader({ variant = 'dark' }: LandingHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Determine styles based on scroll state and variant
  const isDark = !scrolled && variant === 'dark'
  
  return (
    <>
      <header className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-lg shadow-lg' 
          : variant === 'dark' 
            ? 'bg-slate-900/80 backdrop-blur-sm'
            : 'bg-white/95 backdrop-blur-lg shadow-sm'
      }`}>
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2.5 rounded-xl shadow-lg shadow-blue-600/30 group-hover:shadow-blue-600/50 transition-all group-hover:scale-105">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className={`text-2xl font-bold tracking-tight transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>SIEME</span>
              <div className={`text-[10px] font-semibold tracking-wider uppercase transition-colors ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Plataforma 4.0</div>
            </div>
          </Link>
          
          <nav className="hidden lg:flex items-center gap-8">
            {/* Servicios Dropdown */}
            <div className="relative group">
              <button className={`text-sm font-medium transition-colors flex items-center gap-1 ${isDark ? 'text-slate-200 hover:text-white' : 'text-slate-600 hover:text-blue-600'}`}>
                Servicios
                <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="bg-white rounded-xl shadow-2xl border border-slate-200 py-2 min-w-[220px]">
                  <Link href="/servicios/electricidad" className="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700">
                    ⚡ Electricidad Industrial
                  </Link>
                  <Link href="/servicios/mecanica" className="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700">
                    🔧 Mecánica Industrial
                  </Link>
                  <Link href="/servicios/electronica" className="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700">
                    🖥️ Electrónica Industrial
                  </Link>
                  <Link href="/servicios/mantenimiento-preventivo" className="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700">
                    🛡️ Mantenimiento Preventivo
                  </Link>
                  <Link href="/servicios/emergencias" className="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700">
                    🚨 Emergencias 24/7
                  </Link>
                  <div className="border-t my-2"></div>
                  <Link href="/#servicios" className="block px-4 py-2 text-sm text-blue-600 font-medium hover:bg-blue-50">
                    Ver todos los servicios →
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Other Nav Items */}
            {['Plataforma', 'Industrias', 'Testimonios'].map((item) => (
              <Link key={item} href={`/#${item.toLowerCase()}`} className={`text-sm font-medium transition-colors relative group ${isDark ? 'text-slate-200 hover:text-white' : 'text-slate-600 hover:text-blue-600'}`}>
                {item}
                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all ${isDark ? 'bg-white' : 'bg-blue-600'}`}></span>
              </Link>
            ))}
            <Link href="/#contacto" className={`text-sm font-medium transition-colors relative group ${isDark ? 'text-slate-200 hover:text-white' : 'text-slate-600 hover:text-blue-600'}`}>
              Contacto
              <span className={`absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all ${isDark ? 'bg-white' : 'bg-blue-600'}`}></span>
            </Link>
          </nav>
          
          <div className="hidden md:flex items-center gap-3">
            <Link href="/auth/signin">
              <Button variant="ghost" className={`font-medium transition-colors ${isDark ? 'text-white hover:bg-white/10' : 'text-slate-700 hover:bg-blue-50 hover:text-blue-700'}`}>
                Iniciar Sesión
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-600/30 text-white">
                Comenzar Ahora<ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <button 
            className={`lg:hidden p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-100 text-slate-900'}`} 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <XIcon className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-40" onClick={() => setMobileMenuOpen(false)} />
              <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.3 }} className="fixed top-0 right-0 h-full w-80 bg-white z-50 shadow-2xl p-6">
                <div className="flex justify-between items-center mb-8">
                  <span className="text-xl font-bold">Menú</span>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg"><XIcon className="h-6 w-6" /></button>
                </div>
                <nav className="flex flex-col gap-2">
                  <div className="py-2">
                    <p className="text-xs uppercase text-slate-400 font-semibold mb-2">Servicios</p>
                    <Link href="/servicios/electricidad" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 hover:text-blue-700">⚡ Electricidad Industrial</Link>
                    <Link href="/servicios/mecanica" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 hover:text-blue-700">🔧 Mecánica Industrial</Link>
                    <Link href="/servicios/electronica" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 hover:text-blue-700">🖥️ Electrónica Industrial</Link>
                    <Link href="/servicios/mantenimiento-preventivo" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 hover:text-blue-700">🛡️ Mantenimiento Preventivo</Link>
                    <Link href="/servicios/emergencias" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 hover:text-blue-700">🚨 Emergencias 24/7</Link>
                  </div>
                  <div className="border-t pt-2">
                    <Link href="/#plataforma" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-lg font-medium text-slate-700 hover:text-blue-700">Plataforma</Link>
                    <Link href="/#industrias" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-lg font-medium text-slate-700 hover:text-blue-700">Industrias</Link>
                    <Link href="/#testimonios" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-lg font-medium text-slate-700 hover:text-blue-700">Testimonios</Link>
                    <Link href="/#contacto" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-lg font-medium text-slate-700 hover:text-blue-700">Contacto</Link>
                  </div>
                  <div className="border-t pt-4 mt-4 space-y-3">
                    <Link href="/auth/signin" onClick={() => setMobileMenuOpen(false)}><Button variant="outline" className="w-full">Iniciar Sesión</Button></Link>
                    <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}><Button className="w-full bg-blue-600 hover:bg-blue-700">Comenzar Ahora</Button></Link>
                  </div>
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>
    </>
  )
}
