import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Zap, CheckCircle, Clock, Users, Wrench } from 'lucide-react'

export default function ElectronicsServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Wrench className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-primary">TecniPro</span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
              Inicio
            </Link>
            <Link href="#servicios" className="text-primary font-medium">
              Servicios
            </Link>
            <Link href="/#nosotros" className="text-muted-foreground hover:text-primary transition-colors">
              Nosotros
            </Link>
            <Link href="/#contacto" className="text-muted-foreground hover:text-primary transition-colors">
              Contacto
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/auth/signin">
              <Button variant="outline">Iniciar Sesión</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Registrarse</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">Inicio</Link>
          <span>/</span>
          <Link href="/#servicios" className="hover:text-primary">Servicios</Link>
          <span>/</span>
          <span className="text-primary">Electrónica Industrial</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-100 rounded-full">
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <Badge className="mb-2 bg-blue-100 text-blue-800">Servicio Especializado</Badge>
              <h1 className="text-4xl md:text-5xl font-bold">Electrónica Industrial</h1>
            </div>
          </div>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl">
            Diagnóstico, reparación y mantenimiento de sistemas electrónicos industriales. 
            Técnicos certificados con experiencia en circuitos de control, automatización e instrumentación.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/auth/signup?role=client">
              <Button size="lg" className="text-lg px-8">
                Solicitar Servicio Electrónico
                <Zap className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/#contacto">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Consultar Disponibilidad
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Details */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Nuestros Servicios de Electrónica</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Zap className="h-5 w-5 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">Circuitos de Control</CardTitle>
                </div>
                <CardDescription>
                  Diagnóstico y reparación de circuitos electrónicos de control industrial
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Circuitos impresos (PCB)</li>
                  <li>• Componentes electrónicos</li>
                  <li>• Sistemas de potencia</li>
                  <li>• Electrónica de potencia</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Zap className="h-5 w-5 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">Automatización Industrial</CardTitle>
                </div>
                <CardDescription>
                  Mantenimiento de sistemas de automatización y control industrial
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Sistemas SCADA</li>
                  <li>• Controladores lógicos (PLC)</li>
                  <li>• Sistemas HMI</li>
                  <li>• Redes industriales</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Zap className="h-5 w-5 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">Instrumentación</CardTitle>
                </div>
                <CardDescription>
                  Calibración y mantenimiento de instrumentos de medición industrial
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Sensores y transductores</li>
                  <li>• Instrumentos de medición</li>
                  <li>• Sistemas de adquisición</li>
                  <li>• Calibración de equipos</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Zap className="h-5 w-5 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">Electrónica de Potencia</CardTitle>
                </div>
                <CardDescription>
                  Reparación de sistemas de electrónica de potencia y convertidores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Variadores de frecuencia</li>
                  <li>• Fuentes conmutadas</li>
                  <li>• UPS y sistemas de respaldo</li>
                  <li>• Inversores y convertidores</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Zap className="h-5 w-5 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">Sistemas de Comunicación</CardTitle>
                </div>
                <CardDescription>
                  Mantenimiento de sistemas de comunicación industrial
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Redes industriales</li>
                  <li>• Sistemas de radio</li>
                  <li>• Comunicación por fibra óptica</li>
                  <li>• Protocolos industriales</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Zap className="h-5 w-5 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">Mantenimiento Preventivo</CardTitle>
                </div>
                <CardDescription>
                  Programas de mantenimiento preventivo para sistemas electrónicos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Inspección periódica</li>
                  <li>• Limpieza de equipos</li>
                  <li>• Pruebas funcionales</li>
                  <li>• Reemplazo preventivo</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Nuestro Proceso de Trabajo</h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <span className="text-blue-600 font-bold text-xl">1</span>
              </div>
              <h3 className="font-semibold mb-2">Diagnóstico Inicial</h3>
              <p className="text-sm text-muted-foreground">
                Evaluación completa del problema y identificación de causas raíz
              </p>
            </div>

            <div className="text-center">
              <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <span className="text-blue-600 font-bold text-xl">2</span>
              </div>
              <h3 className="font-semibold mb-2">Plan de Acción</h3>
              <p className="text-sm text-muted-foreground">
                Propuesta de solución con tiempos y costos estimados
              </p>
            </div>

            <div className="text-center">
              <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <span className="text-blue-600 font-bold text-xl">3</span>
              </div>
              <h3 className="font-semibold mb-2">Ejecución</h3>
              <p className="text-sm text-muted-foreground">
                Reparación con técnicos especializados y equipos certificados
              </p>
            </div>

            <div className="text-center">
              <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <span className="text-blue-600 font-bold text-xl">4</span>
              </div>
              <h3 className="font-semibold mb-2">Verificación</h3>
              <p className="text-sm text-muted-foreground">
                Pruebas finales y entrega con garantía de funcionamiento
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">¿Por qué elegir nuestros servicios electrónicos?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Técnicos Certificados</h3>
              <p className="text-muted-foreground">
                Personal con certificaciones en electrónica industrial y actualización constante
              </p>
            </div>

            <div className="text-center">
              <Clock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Respuesta Rápida</h3>
              <p className="text-muted-foreground">
                Tiempo de respuesta garantizado y atención 24/7 para emergencias
              </p>
            </div>

            <div className="text-center">
              <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Soporte Continuo</h3>
              <p className="text-muted-foreground">
                Acompañamiento post-servicio y garantía en todas nuestras reparaciones
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-blue-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            ¿Necesitas servicios de electrónica industrial?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Contáctanos hoy mismo y recibe una diagnóstico sin compromiso
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup?role=client">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Solicitar Servicio Ahora
                <Zap className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/#contacto">
              <Button size="lg" variant="outline" className="text-lg px-8 border-white text-white hover:bg-white hover:text-blue-600">
                Contactar Asesor
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Wrench className="h-6 w-6" />
                <span className="text-xl font-bold">TecniPro</span>
              </div>
              <p className="text-slate-400 text-sm">
                Tu plataforma de confianza para servicios técnicos especializados.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Servicios</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>Electrónica Industrial</li>
                <li>Mecánica Industrial</li>
                <li>Electricidad Industrial</li>
                <li>Mantenimiento Preventivo</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>Sobre Nosotros</li>
                <li>Casos de Éxito</li>
                <li>Blog Técnico</li>
                <li>Contacto</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contacto</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>info@tecnipro.com</li>
                <li>+1 (555) 123-4567</li>
                <li>Soporte 24/7</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400 text-sm">
            © 2024 TecniPro. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}