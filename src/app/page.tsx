'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, ArrowRight, CheckCircle2, Cpu, Wrench, Zap, 
  Star, Mail, Phone, MapPin, Send, Loader2, CheckCircle, AlertCircle,
  BarChart3, Smartphone, MapPinned, Gauge, Sparkles, Factory, Truck, Building2,
  Shield, Clock, TrendingUp, Award, Zap as Lightning, Lock, Users, X as XIcon
} from 'lucide-react'
import { motion } from 'framer-motion'
import { FAQ } from '@/components/FAQ'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { LandingHeader } from '@/components/landing/LandingHeader'

export default function Home() {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', message: '' })
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [formMessage, setFormMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormStatus('loading')
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await response.json()
      if (response.ok) {
        setFormStatus('success')
        setFormMessage(data.message)
        setFormData({ firstName: '', lastName: '', email: '', message: '' })
      } else {
        setFormStatus('error')
        setFormMessage(data.error || 'Error al enviar')
      }
    } catch {
      setFormStatus('error')
      setFormMessage('Error de conexión')
    }
    setTimeout(() => { setFormStatus('idle'); setFormMessage('') }, 5000)
  }

  const features = [
    { icon: Gauge, title: 'Asignación Inteligente', desc: 'Algoritmo que selecciona el técnico óptimo por ubicación, especialidad y disponibilidad', gradient: 'from-blue-500 to-blue-600' },
    { icon: MapPinned, title: 'GPS en Tiempo Real', desc: 'Tracking de técnicos, cálculo de ETA y geofencing automático', gradient: 'from-green-500 to-green-600' },
    { icon: BarChart3, title: 'Analytics Avanzado', desc: 'Reportes de rentabilidad, SLA y desempeño en tiempo real', gradient: 'from-purple-500 to-purple-600' },
    { icon: Clock, title: 'SLA Automático', desc: 'Timers inteligentes y alertas de cumplimiento por prioridad', gradient: 'from-orange-500 to-orange-600' },
    { icon: Lightning, title: 'Facturación Instantánea', desc: 'Generación automática con cálculo de costos y márgenes', gradient: 'from-cyan-500 to-cyan-600' },
    { icon: Smartphone, title: 'App Móvil Nativa', desc: 'iOS y Android con modo offline y sincronización automática', gradient: 'from-pink-500 to-pink-600' }
  ]

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Shared Header Component */}
      <LandingHeader variant="dark" />

      {/* Hero */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-full h-full bg-[url('/grid.svg')] opacity-10"></div>
          <div className="absolute -top-[500px] -right-[500px] w-[1000px] h-[1000px] rounded-full bg-blue-500/20 blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-[300px] -left-[300px] w-[800px] h-[800px] rounded-full bg-cyan-500/20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm text-blue-300 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400"></span>
              </span>
              <span className="text-sm font-semibold tracking-wide">Plataforma SaaS de Gestión Técnica Industrial</span>
              <Sparkles className="h-4 w-4" />
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 tracking-tight text-white leading-[1.1]">
              Gestión Inteligente de<br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">Servicios Técnicos</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
              La plataforma definitiva que conecta empresas con técnicos certificados. <span className="text-blue-400 font-medium">Asignación inteligente, tracking GPS</span> y facturación automática.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link href="/auth/signup?role=client">
                <Button size="lg" className="h-14 px-8 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-2xl shadow-blue-600/30 hover:shadow-blue-600/50 transition-all hover:scale-105 group">
                  Comenzar Gratis<ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="#plataforma">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-slate-600 text-white hover:bg-white/10 bg-white/5 backdrop-blur-sm">Ver Demo</Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto border-t border-white/10 pt-12">
              {[
                { value: '99.9%', label: 'Uptime SLA' },
                { value: '< 2h', label: 'Tiempo Respuesta' },
                { value: '2500+', label: 'Órdenes/Mes' },
                { value: '4.9/5', label: 'Satisfacción' }
              ].map((stat, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }} className="group">
                  <div className="text-4xl font-bold text-white mb-2 group-hover:scale-110 transition-transform">{stat.value}</div>
                  <div className="text-sm text-slate-400 uppercase tracking-wider">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-700">Características</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Todo en una plataforma</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">Funcionalidades diseñadas para optimizar cada aspecto de tu operación</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-slate-100 group hover:-translate-y-1">
                <div className={`bg-gradient-to-br ${feature.gradient} p-4 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 bg-white border-b border-slate-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {[
              { icon: Shield, text: 'ISO 9001 Certificado', color: 'text-blue-600' },
              { icon: Lock, text: 'Datos Encriptados', color: 'text-green-600' },
              { icon: Award, text: '4.9/5 Satisfacción', color: 'text-yellow-600' },
              { icon: Users, text: '500+ Empresas', color: 'text-purple-600' }
            ].map((badge, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3"
              >
                <badge.icon className={`h-8 w-8 ${badge.color}`} />
                <span className="font-semibold text-slate-700">{badge.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform */}
      <section id="plataforma" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-4 bg-blue-100 text-blue-700">Plataforma SIEME</Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Control Total de tu Operación</h2>
              <p className="text-lg text-slate-600 mb-8">Desde la solicitud hasta la facturación, todo automatizado.</p>
              
              <div className="space-y-6 mb-8">
                {[
                  { num: '1', title: 'Solicitud Digital', desc: 'Portal cliente con fotos, prioridad y ubicación exacta' },
                  { num: '2', title: 'Asignación Automática', desc: 'Algoritmo inteligente por distancia, skills y disponibilidad' },
                  { num: '3', title: 'Ejecución y Tracking', desc: 'GPS en tiempo real, check-in/out y reportes digitales' },
                  { num: '4', title: 'Cierre Automático', desc: 'Factura, análisis de rentabilidad y garantía automática' }
                ].map((step, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 text-white font-bold shadow-lg shadow-blue-500/30">{step.num}</div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-lg mb-1">{step.title}</h4>
                      <p className="text-slate-600">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/auth/signup"><Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg">Probar Gratis 30 Días<ArrowRight className="ml-2 h-5 w-5" /></Button></Link>
            </div>
            
            <div className="relative rounded-2xl shadow-2xl border border-slate-200 overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 p-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-blue-600"></div>
                    <div className="h-4 w-24 bg-slate-700 rounded"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 w-8 rounded-lg bg-slate-700"></div>
                    <div className="h-8 w-8 rounded-lg bg-slate-700"></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  {[{ bg: 'bg-blue-500' }, { bg: 'bg-green-500' }, { bg: 'bg-purple-500' }].map((item, i) => (
                    <div key={i} className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                      <div className="h-3 w-16 bg-slate-600 rounded mb-2"></div>
                      <div className={`h-6 w-12 ${item.bg} rounded`}></div>
                    </div>
                  ))}
                </div>
                
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                  <div className="h-4 w-32 bg-slate-600 rounded mb-4"></div>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-slate-700 rounded-lg"></div>)}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <div className="h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg"></div>
                  </div>
                  <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <div className="h-24 bg-gradient-to-br from-green-500/20 to-cyan-500/20 rounded-lg"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Before/After Comparison */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-700">Impacto Real</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Transforma tu Operación
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Resultados medibles desde el primer mes
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Antes */}
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8">
              <div className="text-center mb-6">
                <div className="inline-block bg-red-500 text-white px-4 py-2 rounded-full font-bold mb-4">
                  Sin SIEME
                </div>
              </div>
              <ul className="space-y-4">
                {[
                  'Asignación manual de técnicos (2-3 horas)',
                  'Sin visibilidad del estado de órdenes',
                  'Facturación manual con errores',
                  'Incumplimiento de SLA frecuente',
                  'Reportes en papel difíciles de rastrear',
                  'Comunicación por WhatsApp desorganizada'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1 bg-red-500 p-1 rounded-full flex-shrink-0">
                      <XIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Después */}
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 relative">
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-full font-bold shadow-lg rotate-12">
                ¡Mejor!
              </div>
              <div className="text-center mb-6">
                <div className="inline-block bg-green-500 text-white px-4 py-2 rounded-full font-bold mb-4">
                  Con SIEME
                </div>
              </div>
              <ul className="space-y-4">
                {[
                  'Asignación automática en segundos',
                  'Dashboard en tiempo real 24/7',
                  'Facturación automática sin errores',
                  '95%+ cumplimiento de SLA',
                  'Reportes digitales con firmas',
                  'Chat integrado y notificaciones push'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1 bg-green-500 p-1 rounded-full flex-shrink-0">
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-slate-700 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Métricas de Impacto */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto mt-16">
            {[
              { value: '40%', label: 'Reducción de Tiempo', icon: Clock },
              { value: '95%', label: 'Cumplimiento SLA', icon: TrendingUp },
              { value: '60%', label: 'Menos Errores', icon: Shield },
              { value: '3x', label: 'ROI Primer Año', icon: Award }
            ].map((metric, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-100"
              >
                <metric.icon className="h-10 w-10 text-blue-600 mx-auto mb-3" />
                <div className="text-4xl font-bold text-blue-600 mb-2">{metric.value}</div>
                <div className="text-sm text-slate-600 font-medium">{metric.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="servicios" className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-700">Servicios Técnicos</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Especialistas Certificados</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Cpu, title: 'Electrónica Industrial', items: ['PLCs y VFDs', 'Instrumentación', 'Calibración'], gradient: 'from-orange-500 to-orange-600' },
              { icon: Wrench, title: 'Mecánica Industrial', items: ['Hidráulica', 'Neumática', 'Soldadura'], gradient: 'from-blue-500 to-blue-600' },
              { icon: Zap, title: 'Electricidad Industrial', items: ['Tableros', 'Calidad energía', 'UPS'], gradient: 'from-yellow-500 to-yellow-600' }
            ].map((service, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-slate-100 group">
                <div className={`bg-gradient-to-br ${service.gradient} p-4 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  <service.icon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{service.title}</h3>
                <ul className="space-y-3">
                  {service.items.map((item, j) => (
                    <li key={j} className="flex items-center gap-2 text-slate-700">
                      <CheckCircle2 className="h-5 w-5 text-blue-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries */}
      <section id="industrias" className="py-24 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-blue-400 text-blue-300 bg-blue-500/10">Sectores</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Soluciones por Industria</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Factory, title: 'Manufactura', desc: 'Mantenimiento TPM enfocado en OEE' },
              { icon: Truck, title: 'Logística', desc: 'Sistemas automatizados de almacenamiento' },
              { icon: Building2, title: 'Facility Management', desc: 'Gestión integral de edificios' }
            ].map((industry, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:border-blue-400/50 transition-all group hover:bg-white/10">
                <industry.icon className="h-14 w-14 text-blue-400 mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-bold mb-4">{industry.title}</h3>
                <p className="text-slate-300">{industry.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonios" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-700">Testimonios</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Lo que dicen nuestros clientes</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Juan Díaz', role: 'Gerente de Planta, MetalMec', text: 'SIEME transformó nuestra gestión. Redujimos inactividad en 40%.', initial: 'JD', color: 'from-blue-500 to-blue-600' },
              { name: 'María Rodríguez', role: 'Directora Operaciones, LogiTrans', text: 'Velocidad impresionante. Técnico en sitio en menos de 2 horas.', initial: 'MR', color: 'from-purple-500 to-purple-600' },
              { name: 'Carlos López', role: 'Jefe Mantenimiento, FoodCorp', text: 'Plataforma intuitiva. Ver estatus en tiempo real es invaluable.', initial: 'CL', color: 'from-green-500 to-green-600' }
            ].map((testimonial, i) => (
              <Card key={i} className="border-slate-200 hover:shadow-xl transition-all">
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">{[1, 2, 3, 4, 5].map((j) => <Star key={j} className="h-5 w-5 fill-yellow-400 text-yellow-400" />)}</div>
                  <p className="mb-6 italic text-slate-700">"{testimonial.text}"</p>
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${testimonial.color} flex items-center justify-center font-bold text-white shadow-lg`}>{testimonial.initial}</div>
                    <div>
                      <div className="font-bold text-slate-900">{testimonial.name}</div>
                      <div className="text-sm text-slate-500">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Pricing Model */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-700">Cómo Funciona</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Paga solo por lo que necesitas
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Sin suscripciones. Sin compromisos. Solo servicios técnicos de calidad cuando los necesites.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            {[
              {
                icon: CheckCircle2,
                title: 'Solicita el Servicio',
                description: 'Crea una orden de trabajo con los detalles de tu necesidad técnica',
                color: 'from-blue-500 to-blue-600'
              },
              {
                icon: Users,
                title: 'Técnico Asignado',
                description: 'Nuestro algoritmo selecciona al técnico certificado más cercano y calificado',
                color: 'from-green-500 to-green-600'
              },
              {
                icon: CheckCircle,
                title: 'Paga al Finalizar',
                description: 'Recibe factura automática solo por el servicio realizado',
                color: 'from-purple-500 to-purple-600'
              }
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-slate-100 text-center"
              >
                <div className={`bg-gradient-to-br ${step.color} p-4 rounded-xl w-fit mx-auto mb-6 shadow-lg`}>
                  <step.icon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-600 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Pricing Examples */}
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-xl border border-slate-200 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center">Ejemplos de Servicios</h3>
            <div className="space-y-6">
              {[
                {
                  service: 'Instalación Eléctrica Industrial',
                  description: 'Instalación completa de sistema eléctrico',
                  price: 'Desde $250',
                  time: '4-6 horas'
                },
                {
                  service: 'Reparación de Fuga Urgente',
                  description: 'Reparación de fugas de agua',
                  price: 'Desde $150',
                  time: '2-3 horas'
                },
                {
                  service: 'Mantenimiento Preventivo AC',
                  description: 'Mantenimiento de aire acondicionado',
                  price: 'Desde $180',
                  time: '3-4 horas'
                },
                {
                  service: 'Calibración de Instrumentos',
                  description: 'Calibración de equipos industriales',
                  price: 'Desde $200',
                  time: '2-4 horas'
                }
              ].map((item, i) => (
                <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <div className="flex-1 mb-4 md:mb-0">
                    <h4 className="font-bold text-slate-900 text-lg mb-1">{item.service}</h4>
                    <p className="text-slate-600 text-sm">{item.description}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-sm text-slate-500">Tiempo estimado</div>
                      <div className="font-semibold text-slate-700">{item.time}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-500">Precio base</div>
                      <div className="text-2xl font-bold text-blue-600">{item.price}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-blue-900 font-medium mb-1">Precios referenciales</p>
                  <p className="text-sm text-blue-700">
                    Los precios finales pueden variar según la complejidad del trabajo, materiales necesarios y ubicación. 
                    Recibirás una cotización detallada antes de confirmar el servicio.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">¿Listo para optimizar tu operación?</h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">Únete a cientos de empresas que confían en SIEME</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup"><Button size="lg" className="h-14 px-8 bg-white text-blue-700 hover:bg-blue-50 shadow-2xl hover:scale-105 transition-all">Comenzar Gratis<ArrowRight className="ml-2 h-5 w-5" /></Button></Link>
            <Link href="#contacto"><Button size="lg" className="h-14 px-8 bg-blue-800 text-white border-2 border-white hover:bg-blue-900 transition-all">Hablar con Ventas</Button></Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-700">FAQ</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Preguntas Frecuentes
            </h2>
            <p className="text-xl text-slate-600">
              Todo lo que necesitas saber sobre SIEME
            </p>
          </div>

          <FAQ
            items={[
              {
                question: '¿Cuál es el tiempo de respuesta garantizado?',
                answer: 'Para servicios de emergencia, garantizamos un técnico en sitio en menos de 2 horas en zonas metropolitanas. Para servicios urgentes, 4-8 horas, y para programados según su conveniencia.'
              },
              {
                question: '¿Los técnicos están certificados?',
                answer: 'Sí, absolutamente. Todos los técnicos en la plataforma SIEME pasan por un riguroso proceso de validación de antecedentes, certificaciones técnicas y pruebas prácticas antes de ser activados.'
              },
              {
                question: '¿Ofrecen garantía sobre los trabajos?',
                answer: 'Ofrecemos una garantía de 30 días sobre la mano de obra de todos los servicios realizados a través de la plataforma. Los repuestos tienen la garantía del fabricante.'
              },
              {
                question: '¿Cómo se maneja la facturación?',
                answer: 'La plataforma genera automáticamente una factura electrónica válida fiscalmente al cerrar la orden. Puede configurar pagos automáticos o términos de crédito a 30 días previa aprobación.'
              },
              {
                question: '¿Puedo integrar SIEME con mi ERP?',
                answer: 'Sí, SIEME ofrece una API completa que permite integración con sistemas ERP, CRM y otros software empresariales. Nuestro equipo técnico puede asistir en la integración.'
              },
              {
                question: '¿Qué pasa si necesito cancelar?',
                answer: 'Puedes cancelar tu suscripción en cualquier momento sin penalización. Tus datos permanecen disponibles por 90 días después de la cancelación.'
              }
            ]}
          />
        </div>
      </section>

      {/* Contact */}
      <section id="contacto" className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <Badge className="mb-4 bg-blue-100 text-blue-700">Contacto</Badge>
              <h2 className="text-4xl font-bold text-slate-900 mb-6">Hablemos de tu Proyecto</h2>
              <p className="text-lg text-slate-600 mb-8">Nuestro equipo está listo para ayudarte.</p>
              
              <div className="space-y-6">
                {[
                  { icon: Mail, label: 'Email', value: 'contacto@sieme.com' },
                  { icon: Phone, label: 'Teléfono', value: '+1 (555) 123-4567' },
                  { icon: MapPin, label: 'Oficina', value: 'Av. Innovación 100, Ciudad Tecnológica' }
                ].map((contact, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-xl"><contact.icon className="h-6 w-6 text-blue-600" /></div>
                    <div>
                      <div className="font-bold text-slate-900">{contact.label}</div>
                      <div className="text-slate-600">{contact.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Nombre', key: 'firstName' as const },
                    { label: 'Apellido', key: 'lastName' as const }
                  ].map((field) => (
                    <div key={field.key} className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">{field.label} *</label>
                      <input type="text" required value={formData[field.key]} onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Email *</label>
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Mensaje *</label>
                  <textarea required minLength={10} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all h-32 resize-none" />
                </div>
                
                {formStatus === 'success' && (
                  <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800">
                    <CheckCircle className="h-5 w-5" /><span className="text-sm font-medium">{formMessage}</span>
                  </div>
                )}
                {formStatus === 'error' && (
                  <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
                    <AlertCircle className="h-5 w-5" /><span className="text-sm font-medium">{formMessage}</span>
                  </div>
                )}

                <Button type="submit" disabled={formStatus === 'loading'} className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 h-14 text-lg shadow-lg">
                  {formStatus === 'loading' ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Enviando...</> : <>Enviar Mensaje<Send className="ml-2 h-5 w-5" /></>}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-blue-600 p-2 rounded-lg"><Settings className="h-5 w-5 text-white" /></div>
                <span className="text-xl font-bold">SIEME</span>
              </div>
              <p className="text-slate-400 text-sm mb-4">Plataforma SaaS para gestión inteligente de servicios técnicos industriales.</p>
              <div className="flex gap-3">
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="bg-slate-800 p-2 rounded-lg hover:bg-blue-600 transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="bg-slate-800 p-2 rounded-lg hover:bg-blue-400 transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">Producto</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="#plataforma" className="hover:text-white transition-colors">Plataforma</Link></li>
                <li><Link href="#servicios" className="hover:text-white transition-colors">Servicios</Link></li>
                <li><Link href="/servicios/electricidad" className="hover:text-white transition-colors">Electricidad Industrial</Link></li>
                <li><Link href="/servicios/mecanica" className="hover:text-white transition-colors">Mecánica Industrial</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="#testimonios" className="hover:text-white transition-colors">Testimonios</Link></li>
                <li><Link href="#industrias" className="hover:text-white transition-colors">Industrias</Link></li>
                <li><Link href="#contacto" className="hover:text-white transition-colors">Contacto</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/legal/privacidad" className="hover:text-white transition-colors">Política de Privacidad</Link></li>
                <li><Link href="/legal/terminos" className="hover:text-white transition-colors">Términos de Servicio</Link></li>
                <li><Link href="/legal/cookies" className="hover:text-white transition-colors">Política de Cookies</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-400">&copy; 2025 SIEME. Todos los derechos reservados.</p>
            <div className="flex gap-6 text-sm text-slate-400">
              <Link href="#contacto" className="hover:text-white transition-colors">Soporte</Link>
              <span>contacto@sieme.com</span>
            </div>
          </div>
        </div>
      </footer>

      {/* WhatsApp Button */}
      <WhatsAppButton />
    </div>
  )
}
