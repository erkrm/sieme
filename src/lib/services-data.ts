// Service data for dynamic landing pages
export interface ServiceData {
  slug: string
  title: string
  subtitle: string
  description: string
  heroImage: string
  color: string // Tailwind color class
  icon: string // Lucide icon name
  features: {
    title: string
    description: string
    icon: string
  }[]
  benefits: string[]
  useCases: {
    title: string
    description: string
    result: string
  }[]
  faq: {
    question: string
    answer: string
  }[]
  cta: {
    title: string
    description: string
  }
}

export const servicesData: Record<string, ServiceData> = {
  electricidad: {
    slug: 'electricidad',
    title: 'Electricidad Industrial',
    subtitle: 'Servicios eléctricos profesionales para tu industria',
    description: 'Expertos en instalaciones eléctricas industriales, tableros de control, calidad de energía y sistemas UPS. Técnicos certificados disponibles 24/7.',
    heroImage: '/services/electricidad-hero.jpg',
    color: 'yellow',
    icon: 'Zap',
    features: [
      {
        title: 'Instalaciones Eléctricas',
        description: 'Diseño e instalación de sistemas eléctricos industriales completos',
        icon: 'Cable'
      },
      {
        title: 'Tableros de Control',
        description: 'Fabricación, montaje y mantenimiento de tableros eléctricos',
        icon: 'LayoutDashboard'
      },
      {
        title: 'Calidad de Energía',
        description: 'Análisis y corrección de factor de potencia, armónicos',
        icon: 'Activity'
      },
      {
        title: 'Sistemas UPS',
        description: 'Instalación y mantenimiento de sistemas de respaldo',
        icon: 'Battery'
      }
    ],
    benefits: [
      'Técnicos certificados con +10 años de experiencia',
      'Respuesta en menos de 2 horas para emergencias',
      'Cumplimiento normativo NEC/NOM garantizado',
      'Garantía de 12 meses en mano de obra',
      'Reportes digitales con fotos y mediciones'
    ],
    useCases: [
      {
        title: 'Planta Manufacturera',
        description: 'Actualización de sistema eléctrico en planta de 50,000 m²',
        result: '40% reducción en consumo energético'
      },
      {
        title: 'Centro de Datos',
        description: 'Instalación de sistema UPS redundante',
        result: '99.99% uptime garantizado'
      }
    ],
    faq: [
      {
        question: '¿Cuál es el tiempo de respuesta para emergencias?',
        answer: 'Garantizamos presencia de un técnico en sitio en menos de 2 horas para emergencias en zona metropolitana.'
      },
      {
        question: '¿Los técnicos están certificados?',
        answer: 'Sí, todos nuestros técnicos cuentan con certificación CONOCER y están capacitados en normativas NOM-001-SEDE.'
      },
      {
        question: '¿Ofrecen mantenimiento preventivo?',
        answer: 'Sí, ofrecemos planes de mantenimiento preventivo mensuales, trimestrales y anuales adaptados a sus necesidades.'
      }
    ],
    cta: {
      title: 'Solicita tu diagnóstico eléctrico gratuito',
      description: 'Un experto analizará tus instalaciones y te dará recomendaciones sin compromiso'
    }
  },
  mecanica: {
    slug: 'mecanica',
    title: 'Mecánica Industrial',
    subtitle: 'Mantenimiento y reparación de maquinaria industrial',
    description: 'Especialistas en sistemas hidráulicos, neumáticos, soldadura industrial y mantenimiento mecánico. Minimiza el tiempo de inactividad de tu maquinaria.',
    heroImage: '/services/mecanica-hero.jpg',
    color: 'blue',
    icon: 'Wrench',
    features: [
      {
        title: 'Sistemas Hidráulicos',
        description: 'Reparación y mantenimiento de sistemas hidráulicos industriales',
        icon: 'Droplets'
      },
      {
        title: 'Neumática Industrial',
        description: 'Instalación y servicio de sistemas neumáticos',
        icon: 'Wind'
      },
      {
        title: 'Soldadura Industrial',
        description: 'Soldadura TIG, MIG, MAG y electrodo para estructuras',
        icon: 'Flame'
      },
      {
        title: 'Mantenimiento de Maquinaria',
        description: 'TPM y mantenimiento predictivo para maximizar OEE',
        icon: 'Settings'
      }
    ],
    benefits: [
      'Reducción de paros no programados en 60%',
      'Técnicos especializados por tipo de maquinaria',
      'Inventario de repuestos para respuesta rápida',
      'Análisis de vibraciones y termografía',
      'Reportes de condición de equipo'
    ],
    useCases: [
      {
        title: 'Línea de Producción',
        description: 'Implementación de mantenimiento predictivo en 20 máquinas',
        result: '35% menos paros no programados'
      },
      {
        title: 'Sistema Hidráulico',
        description: 'Reemplazo de sistema hidráulico obsoleto',
        result: '50% mejora en eficiencia'
      }
    ],
    faq: [
      {
        question: '¿Pueden dar servicio a maquinaria especializada?',
        answer: 'Sí, contamos con técnicos especializados en marcas como Fanuc, Siemens, ABB, Haas, DMG Mori, entre otras.'
      },
      {
        question: '¿Ofrecen contratos de mantenimiento?',
        answer: 'Sí, ofrecemos contratos de mantenimiento por horas, por equipo o de planta completa con SLAs garantizados.'
      }
    ],
    cta: {
      title: 'Agenda una inspección de tu maquinaria',
      description: 'Identificamos oportunidades de mejora antes de que ocurran fallas'
    }
  },
  electronica: {
    slug: 'electronica',
    title: 'Electrónica Industrial',
    subtitle: 'Automatización y control para tu planta',
    description: 'Expertos en PLCs, variadores de frecuencia, instrumentación y sistemas SCADA. Llevamos tu producción al siguiente nivel con tecnología de punta.',
    heroImage: '/services/electronica-hero.jpg',
    color: 'purple',
    icon: 'Cpu',
    features: [
      {
        title: 'Programación de PLCs',
        description: 'Desarrollo y modificación de programas para Allen-Bradley, Siemens, Schneider',
        icon: 'Code'
      },
      {
        title: 'Variadores de Frecuencia',
        description: 'Instalación, parametrización y reparación de VFDs',
        icon: 'Gauge'
      },
      {
        title: 'Instrumentación',
        description: 'Calibración y mantenimiento de sensores y transmisores',
        icon: 'Thermometer'
      },
      {
        title: 'Sistemas SCADA',
        description: 'Desarrollo e integración de sistemas de supervisión',
        icon: 'Monitor'
      }
    ],
    benefits: [
      'Ingenieros con certificación de fabricantes',
      'Soporte remoto 24/7 para diagnóstico rápido',
      'Integración con sistemas existentes',
      'Documentación completa de proyectos',
      'Capacitación para su personal'
    ],
    useCases: [
      {
        title: 'Automatización de Línea',
        description: 'Migración de sistema relay a PLC moderno',
        result: '25% aumento en productividad'
      },
      {
        title: 'Sistema SCADA',
        description: 'Implementación de monitoreo centralizado',
        result: 'Visibilidad 100% de planta'
      }
    ],
    faq: [
      {
        question: '¿Trabajan con todas las marcas de PLC?',
        answer: 'Sí, nuestros ingenieros están certificados en Allen-Bradley, Siemens, Schneider Electric, Mitsubishi, Omron y más.'
      },
      {
        question: '¿Pueden hacer modificaciones a programas existentes?',
        answer: 'Sí, realizamos análisis de programas existentes, documentación y modificaciones según sus necesidades.'
      }
    ],
    cta: {
      title: 'Consulta gratuita de automatización',
      description: 'Te ayudamos a identificar oportunidades de automatización en tu planta'
    }
  },
  'mantenimiento-preventivo': {
    slug: 'mantenimiento-preventivo',
    title: 'Mantenimiento Preventivo',
    subtitle: 'Previene fallas antes de que ocurran',
    description: 'Programas de mantenimiento preventivo personalizados que maximizan la vida útil de tus equipos y reducen costos de reparación.',
    heroImage: '/services/preventivo-hero.jpg',
    color: 'green',
    icon: 'Shield',
    features: [
      {
        title: 'Planes Personalizados',
        description: 'Cronogramas adaptados a tu operación y criticidad de equipos',
        icon: 'Calendar'
      },
      {
        title: 'Análisis Predictivo',
        description: 'Termografía, vibraciones y análisis de aceite',
        icon: 'TrendingUp'
      },
      {
        title: 'Gestión de Repuestos',
        description: 'Inventario optimizado de partes críticas',
        icon: 'Package'
      },
      {
        title: 'Reportes de Condición',
        description: 'Informes detallados del estado de tus equipos',
        icon: 'FileText'
      }
    ],
    benefits: [
      'Reducción de 40-60% en paros no programados',
      'Extensión de vida útil de equipos',
      'Costos de mantenimiento predecibles',
      'Cumplimiento de garantías de fabricante',
      'Mejora del OEE (Overall Equipment Effectiveness)'
    ],
    useCases: [
      {
        title: 'Planta de Alimentos',
        description: 'Implementación de programa TPM completo',
        result: 'OEE de 65% a 85%'
      }
    ],
    faq: [
      {
        question: '¿Con qué frecuencia se realizan las visitas?',
        answer: 'La frecuencia depende del tipo de equipo y criticidad, desde semanales hasta trimestrales.'
      }
    ],
    cta: {
      title: 'Evalúa el estado de tus equipos',
      description: 'Diagnóstico completo sin costo para nuevos clientes'
    }
  },
  emergencias: {
    slug: 'emergencias',
    title: 'Servicio de Emergencias 24/7',
    subtitle: 'Respuesta inmediata cuando más lo necesitas',
    description: 'Equipo de técnicos de guardia disponible las 24 horas, los 7 días de la semana para resolver fallas críticas y minimizar tu tiempo de inactividad.',
    heroImage: '/services/emergencias-hero.jpg',
    color: 'red',
    icon: 'AlertTriangle',
    features: [
      {
        title: 'Respuesta en 2 Horas',
        description: 'Técnico en sitio en menos de 2 horas en zona metropolitana',
        icon: 'Clock'
      },
      {
        title: 'Diagnóstico Remoto',
        description: 'Pre-diagnóstico por videollamada para llegar preparados',
        icon: 'Video'
      },
      {
        title: 'Unidades Equipadas',
        description: 'Vehículos con herramientas y repuestos comunes',
        icon: 'Truck'
      },
      {
        title: 'Escalamiento 24/7',
        description: 'Línea directa con ingenieros especialistas',
        icon: 'PhoneCall'
      }
    ],
    benefits: [
      'Línea de emergencia dedicada',
      'Técnicos de guardia en ubicaciones estratégicas',
      'Stock de repuestos críticos',
      'Comunicación en tiempo real del progreso',
      'Facturación transparente por hora'
    ],
    useCases: [
      {
        title: 'Falla en Fin de Semana',
        description: 'Reparación de variador crítico en línea de producción',
        result: 'Resuelto en 3 horas, evitó pérdida de $50,000'
      }
    ],
    faq: [
      {
        question: '¿Hay costo adicional por servicio nocturno o en fin de semana?',
        answer: 'Sí, los servicios fuera de horario regular tienen un cargo adicional del 50%. Los días festivos tienen cargo del 100%.'
      }
    ],
    cta: {
      title: '¿Tienes una emergencia ahora?',
      description: 'Llámanos inmediatamente al +1 (555) 911-TECH'
    }
  }
}

export function getServiceBySlug(slug: string): ServiceData | undefined {
  return servicesData[slug]
}

export function getAllServiceSlugs(): string[] {
  return Object.keys(servicesData)
}
