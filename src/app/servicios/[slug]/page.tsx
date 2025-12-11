'use client'

import { use } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FAQ } from '@/components/FAQ'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { getServiceBySlug } from '@/lib/services-data'
import {
  ArrowRight, CheckCircle2, Settings, Phone, Mail,
  Zap, Wrench, Cpu, Shield, AlertTriangle, Clock,
  Cable, LayoutDashboard, Activity, Battery, Droplets, Wind, Flame,
  Code, Gauge, Thermometer, Monitor, Calendar, TrendingUp, Package,
  FileText, Video, Truck, PhoneCall
} from 'lucide-react'

// Icon mapping
const iconMap: Record<string, any> = {
  Zap, Wrench, Cpu, Shield, AlertTriangle, Clock, Phone, Mail,
  Cable, LayoutDashboard, Activity, Battery, Droplets, Wind, Flame,
  Code, Gauge, Thermometer, Monitor, Calendar, TrendingUp, Package,
  FileText, Video, Truck, PhoneCall, Settings, CheckCircle2
}

const colorMap: Record<string, { gradient: string; bg: string; text: string; border: string }> = {
  yellow: { gradient: 'from-yellow-500 to-orange-500', bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-500' },
  blue: { gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-500' },
  purple: { gradient: 'from-purple-500 to-purple-600', bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-500' },
  green: { gradient: 'from-green-500 to-green-600', bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-500' },
  red: { gradient: 'from-red-500 to-red-600', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-500' },
}

export default function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const service = getServiceBySlug(slug)

  if (!service) {
    notFound()
  }

  const colors = colorMap[service.color] || colorMap.blue
  const ServiceIcon = iconMap[service.icon] || Wrench

  return (
    <div className="min-h-screen bg-white">
      {/* Shared Header */}
      <LandingHeader variant="light" />

      {/* Hero */}
      <section className={`relative pt-28 pb-16 bg-gradient-to-br ${colors.gradient}`}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 text-sm">
                ← Volver a inicio
              </Link>
              <Badge className="mb-4 bg-white/20 text-white border-white/30">{service.title}</Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                {service.subtitle}
              </h1>
              <p className="text-xl text-white/90 mb-8 max-w-2xl">
                {service.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/#contacto">
                  <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 shadow-xl">
                    Solicitar Cotización <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="tel:+15551234567">
                  <Button size="lg" className="bg-white/20 text-white border-2 border-white hover:bg-white/30">
                    <Phone className="mr-2 h-5 w-5" /> Llamar Ahora
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className={`mb-4 ${colors.bg} ${colors.text}`}>Nuestros Servicios</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              ¿Qué incluye nuestro servicio de {service.title}?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {service.features.map((feature, i) => {
              const FeatureIcon = iconMap[feature.icon] || CheckCircle2
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className={`bg-gradient-to-br ${colors.gradient} p-3 rounded-xl w-fit mb-4`}>
                        <FeatureIcon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-bold text-lg text-slate-900 mb-2">{feature.title}</h3>
                      <p className="text-slate-600 text-sm">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className={`mb-4 ${colors.bg} ${colors.text}`}>Beneficios</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                ¿Por qué elegir SIEME para {service.title}?
              </h2>
              <ul className="space-y-4">
                {service.benefits.map((benefit, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2 className={`h-6 w-6 flex-shrink-0 mt-0.5 ${colors.text}`} />
                    <span className="text-lg text-slate-700">{benefit}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
            <div className={`bg-gradient-to-br ${colors.gradient} p-8 rounded-2xl`}>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
                <ServiceIcon className="h-16 w-16 text-white mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">Expertos en {service.title}</h3>
                <p className="text-white/90 mb-6">
                  Nuestro equipo de técnicos certificados está listo para resolver cualquier desafío técnico que enfrentes.
                </p>
                <div className="grid grid-cols-2 gap-4 text-white">
                  <div>
                    <div className="text-3xl font-bold">+500</div>
                    <div className="text-sm text-white/80">Proyectos completados</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">4.9/5</div>
                    <div className="text-sm text-white/80">Satisfacción promedio</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      {service.useCases.length > 0 && (
        <section className="py-20 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge className={`mb-4 ${colors.bg} ${colors.text}`}>Casos de Éxito</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Resultados reales con clientes reales
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {service.useCases.map((useCase, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className={`border-l-4 ${colors.border}`}>
                    <CardContent className="p-6">
                      <h3 className="font-bold text-xl text-slate-900 mb-2">{useCase.title}</h3>
                      <p className="text-slate-600 mb-4">{useCase.description}</p>
                      <div className={`${colors.bg} ${colors.text} px-4 py-2 rounded-lg inline-block font-semibold`}>
                        Resultado: {useCase.result}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <Badge className={`mb-4 ${colors.bg} ${colors.text}`}>FAQ</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Preguntas frecuentes sobre {service.title}
            </h2>
          </div>
          <FAQ items={service.faq} />
        </div>
      </section>

      {/* CTA */}
      <section className={`py-20 bg-gradient-to-r ${colors.gradient}`}>
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {service.cta.title}
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              {service.cta.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 shadow-xl">
                  Solicitar Servicio <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/#contacto">
                <Button size="lg" className="bg-white/20 text-white border-2 border-white hover:bg-white/30">
                  <Mail className="mr-2 h-5 w-5" /> Contactar Ventas
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg"><Settings className="h-4 w-4 text-white" /></div>
              <span className="font-bold">SIEME</span>
            </div>
            <div className="flex gap-6 text-sm text-slate-400">
              <Link href="/" className="hover:text-white">Inicio</Link>
              <Link href="/#servicios" className="hover:text-white">Servicios</Link>
              <Link href="/#contacto" className="hover:text-white">Contacto</Link>
            </div>
            <p className="text-sm text-slate-400">&copy; 2025 SIEME</p>
          </div>
        </div>
      </footer>

      <WhatsAppButton />
    </div>
  )
}
