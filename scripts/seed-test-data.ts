import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de datos de prueba...\n')

  // Contraseña común para todas las cuentas de prueba
  const password = 'test123'
  const hashedPassword = await bcrypt.hash(password, 12)

  // 1. CREAR USUARIOS
  console.log('👤 Creando usuarios...')
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sieme.com' },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
    },
    create: {
      email: 'admin@sieme.com',
      name: 'Admin SIEME',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
    },
  })
  console.log('✅ Admin creado:', admin.email)

  const manager = await prisma.user.upsert({
    where: { email: 'manager@sieme.com' },
    update: {
      password: hashedPassword,
      role: 'MANAGER',
      isActive: true,
    },
    create: {
      email: 'manager@sieme.com',
      name: 'Carlos Rodríguez',
      password: hashedPassword,
      role: 'MANAGER',
      isActive: true,
    },
  })
  console.log('✅ Manager creado:', manager.email)

  const technician = await prisma.user.upsert({
    where: { email: 'tech@sieme.com' },
    update: {
      password: hashedPassword,
      role: 'TECHNICIAN',
      isActive: true,
    },
    create: {
      email: 'tech@sieme.com',
      name: 'Juan Pérez',
      password: hashedPassword,
      role: 'TECHNICIAN',
      isActive: true,
      phone: '+34 600 123 456',
    },
  })
  console.log('✅ Técnico creado:', technician.email)

  const client = await prisma.user.upsert({
    where: { email: 'client@sieme.com' },
    update: {
      password: hashedPassword,
      role: 'CLIENT',
      isActive: true,
    },
    create: {
      email: 'client@sieme.com',
      name: 'María García',
      password: hashedPassword,
      role: 'CLIENT',
      isActive: true,
      phone: '+34 600 987 654',
    },
  })
  console.log('✅ Cliente creado:', client.email)

  // 2. CREAR CATEGORÍAS DE SERVICIOS
  console.log('\n📦 Creando categorías de servicios...')
  
  const electricCategory = await prisma.serviceCategory.upsert({
    where: { id: 'cat-electric' },
    update: {},
    create: {
      id: 'cat-electric',
      name: 'Electricidad',
      description: 'Servicios eléctricos',
    },
  })

  const plumbingCategory = await prisma.serviceCategory.upsert({
    where: { id: 'cat-plumbing' },
    update: {},
    create: {
      id: 'cat-plumbing',
      name: 'Fontanería',
      description: 'Servicios de fontanería',
    },
  })

  const hvacCategory = await prisma.serviceCategory.upsert({
    where: { id: 'cat-hvac' },
    update: {},
    create: {
      id: 'cat-hvac',
      name: 'Climatización',
      description: 'Servicios de climatización',
    },
  })

  console.log('✅ Categorías creadas')

  // 3. CREAR SERVICIOS
  console.log('\n🔧 Creando servicios...')
  
  const service1 = await prisma.service.upsert({
    where: { id: 'svc-1' },
    update: {},
    create: {
      id: 'svc-1',
      name: 'Instalación Eléctrica',
      description: 'Instalación completa de sistema eléctrico',
      basePrice: 250.00,
      estimatedHours: 4,
      categoryId: electricCategory.id,
    },
  })

  const service2 = await prisma.service.upsert({
    where: { id: 'svc-2' },
    update: {},
    create: {
      id: 'svc-2',
      name: 'Reparación de Fuga',
      description: 'Reparación de fugas de agua',
      basePrice: 150.00,
      estimatedHours: 2,
      categoryId: plumbingCategory.id,
    },
  })

  const service3 = await prisma.service.upsert({
    where: { id: 'svc-3' },
    update: {},
    create: {
      id: 'svc-3',
      name: 'Mantenimiento de Aire Acondicionado',
      description: 'Mantenimiento preventivo de AC',
      basePrice: 180.00,
      estimatedHours: 3,
      categoryId: hvacCategory.id,
    },
  })

  console.log('✅ Servicios creados')

  // 4. CREAR ÓRDENES DE TRABAJO PARA EL CLIENTE
  console.log('\n📋 Creando órdenes de trabajo...')
  
  const workOrder1 = await prisma.workOrder.upsert({
    where: { id: 'wo-1' },
    update: {},
    create: {
      id: 'wo-1',
      orderNumber: 'WO-2024-001',
      title: 'Instalación eléctrica en oficina',
      description: 'Instalación completa de sistema eléctrico en nueva oficina',
      category: 'Electricidad',
      status: 'IN_PROGRESS',
      priority: 'URGENT',
      serviceAddress: 'Calle Mayor 123, Madrid',
      contactPerson: 'María García',
      contactPhone: '+34 600 987 654',
      clientId: client.id,
      technicianId: technician.id,
      scheduledDate: new Date('2024-12-15'),
    },
  })

  const workOrder2 = await prisma.workOrder.upsert({
    where: { id: 'wo-2' },
    update: {},
    create: {
      id: 'wo-2',
      orderNumber: 'WO-2024-002',
      title: 'Reparación urgente de fuga',
      description: 'Fuga de agua en baño principal',
      category: 'Fontanería',
      status: 'SCHEDULED',
      priority: 'EMERGENCY',
      serviceAddress: 'Calle Mayor 123, Madrid',
      contactPerson: 'María García',
      contactPhone: '+34 600 987 654',
      clientId: client.id,
      technicianId: technician.id,
      scheduledDate: new Date('2024-12-10'),
    },
  })

  const workOrder3 = await prisma.workOrder.upsert({
    where: { id: 'wo-3' },
    update: {},
    create: {
      id: 'wo-3',
      orderNumber: 'WO-2024-003',
      title: 'Mantenimiento AC',
      description: 'Mantenimiento preventivo de aire acondicionado',
      category: 'Climatización',
      status: 'COMPLETED',
      priority: 'NORMAL',
      serviceAddress: 'Calle Mayor 123, Madrid',
      contactPerson: 'María García',
      contactPhone: '+34 600 987 654',
      clientId: client.id,
      technicianId: technician.id,
      scheduledDate: new Date('2024-11-20'),
      completedAt: new Date('2024-11-20'),
    },
  })

  const workOrder4 = await prisma.workOrder.upsert({
    where: { id: 'wo-4' },
    update: {},
    create: {
      id: 'wo-4',
      orderNumber: 'WO-2024-004',
      title: 'Revisión sistema eléctrico',
      description: 'Revisión general del sistema eléctrico',
      category: 'Electricidad',
      status: 'PENDING',
      priority: 'NORMAL',
      serviceAddress: 'Calle Mayor 123, Madrid',
      contactPerson: 'María García',
      contactPhone: '+34 600 987 654',
      clientId: client.id,
      scheduledDate: new Date('2024-12-20'),
    },
  })

  console.log('✅ Órdenes de trabajo creadas')

  // 5. COTIZACIONES OMITIDAS (modelo no existe en schema actual)
  console.log('\n💰 Cotizaciones omitidas (modelo no disponible)')

  // 6. CREAR NOTIFICACIONES
  console.log('\n🔔 Creando notificaciones...')
  
  await prisma.notification.create({
    data: {
      userId: client.id,
      type: 'ORDER_UPDATE',
      title: 'Orden en progreso',
      message: 'Tu orden WO-2024-001 está en progreso',
      read: false,
    },
  })

  await prisma.notification.create({
    data: {
      userId: client.id,
      type: 'NEW_ORDER',
      title: 'Nueva orden asignada',
      message: 'Se ha asignado un técnico a tu orden WO-2024-002',
      read: false,
    },
  })

  console.log('✅ Notificaciones creadas')

  console.log('\n✨ Seed completado exitosamente!\n')
  console.log('📝 Cuentas de prueba creadas:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('👨‍💼 ADMIN:      admin@sieme.com / test123')
  console.log('👔 MANAGER:    manager@sieme.com / test123')
  console.log('🔧 TÉCNICO:    tech@sieme.com / test123')
  console.log('👤 CLIENTE:    client@sieme.com / test123')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error durante el seed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
