import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Use raw SQL to disable FK checks temporarily and clear all data
  try {
    // Delete in reverse dependency order - most dependent first
    console.log('Clearing existing data...')
    
    // WorkOrder related
    await prisma.workOrderLog.deleteMany().catch(() => {})
    await prisma.orderMaterial.deleteMany().catch(() => {})
    await prisma.quotation.deleteMany().catch(() => {})
    await prisma.rating.deleteMany().catch(() => {})
    await prisma.timeTracking.deleteMany().catch(() => {})
    await prisma.warranty.deleteMany().catch(() => {})
    await prisma.message.deleteMany().catch(() => {})
    await prisma.notification.deleteMany().catch(() => {})
    await prisma.invoiceItem.deleteMany().catch(() => {})
    await prisma.invoice.deleteMany().catch(() => {})
    await prisma.workOrder.deleteMany().catch(() => {})
    
    // Contract related
    await prisma.contractSLA.deleteMany().catch(() => {})
    await prisma.contractRate.deleteMany().catch(() => {})
    await prisma.contract.deleteMany().catch(() => {})
    
    // Location and assets
    await prisma.asset.deleteMany().catch(() => {})
    await prisma.companyLocation.deleteMany().catch(() => {})
    
    // Technician related
    await prisma.technicianSpecialty.deleteMany().catch(() => {})
    await prisma.technicianCertification.deleteMany().catch(() => {})
    
    // Profiles
    await prisma.clientProfile.deleteMany().catch(() => {})
    await prisma.technicianProfile.deleteMany().catch(() => {})
    await prisma.managerProfile.deleteMany().catch(() => {})
    
    // Users last
    await prisma.user.deleteMany().catch(() => {})
    
    console.log('✅ Cleared existing data')
  } catch (e) {
    console.log('Warning: Some tables could not be cleared:', e)
  }

  const hashedPassword = await bcrypt.hash('password123', 10)

  // ========== ADMIN USER ==========
  const admin = await prisma.user.create({
    data: {
      name: 'Administrador SIEME',
      email: 'admin@sieme.com',
      password: hashedPassword,
      role: 'ADMIN',
      phone: '+1 555 000 0001',
      isActive: true
    }
  })
  console.log('✅ Admin created:', admin.email)

  // ========== MANAGERS ==========
  const manager1 = await prisma.user.create({
    data: {
      name: 'María García López',
      email: 'maria.garcia@sieme.com',
      password: hashedPassword,
      role: 'MANAGER',
      phone: '+1 555 100 0001',
      isActive: true,
      managerProfile: {
        create: {
          employeeId: 'MGR-001',
          department: 'Operaciones'
        }
      }
    }
  })

  const manager2 = await prisma.user.create({
    data: {
      name: 'Carlos Rodriguez Pérez',
      email: 'carlos.rodriguez@sieme.com',
      password: hashedPassword,
      role: 'MANAGER',
      phone: '+1 555 100 0002',
      isActive: true,
      managerProfile: {
        create: {
          employeeId: 'MGR-002',
          department: 'Recursos Humanos'
        }
      }
    }
  })

  const manager3 = await prisma.user.create({
    data: {
      name: 'Ana Martínez Silva',
      email: 'ana.martinez@sieme.com',
      password: hashedPassword,
      role: 'MANAGER',
      phone: '+1 555 100 0003',
      isActive: true,
      managerProfile: {
        create: {
          employeeId: 'MGR-003',
          department: 'Soporte Técnico'
        }
      }
    }
  })
  console.log('✅ 3 Managers created')

  // ========== TECHNICIANS ==========
  const tech1 = await prisma.user.create({
    data: {
      name: 'Juan Pérez Sánchez',
      email: 'juan.perez@sieme.com',
      password: hashedPassword,
      role: 'TECHNICIAN',
      phone: '+1 555 200 0001',
      isActive: true,
      technicianProfile: {
        create: {
          employeeId: 'TEC-001',
          hireDate: new Date('2023-01-15'),
          baseSalary: 2500,
          hourlyCost: 35,
          isAvailable: true,
          specialties: {
            create: [
              { name: 'Electricidad', level: 'Senior' },
              { name: 'HVAC', level: 'Junior' }
            ]
          },
          certifications: {
            create: [
              { name: 'Electricista Certificado', issueDate: new Date('2022-06-01'), expiryDate: new Date('2025-06-01') }
            ]
          }
        }
      }
    }
  })

  const tech2 = await prisma.user.create({
    data: {
      name: 'Pedro González Ruiz',
      email: 'pedro.gonzalez@sieme.com',
      password: hashedPassword,
      role: 'TECHNICIAN',
      phone: '+1 555 200 0002',
      isActive: true,
      technicianProfile: {
        create: {
          employeeId: 'TEC-002',
          hireDate: new Date('2023-03-20'),
          baseSalary: 2200,
          hourlyCost: 30,
          isAvailable: true,
          specialties: {
            create: [
              { name: 'Plomería', level: 'Senior' },
              { name: 'Refrigeración', level: 'Senior' }
            ]
          }
        }
      }
    }
  })

  const tech3 = await prisma.user.create({
    data: {
      name: 'Luis Hernández Torres',
      email: 'luis.hernandez@sieme.com',
      password: hashedPassword,
      role: 'TECHNICIAN',
      phone: '+1 555 200 0003',
      isActive: true,
      technicianProfile: {
        create: {
          employeeId: 'TEC-003',
          hireDate: new Date('2023-06-10'),
          baseSalary: 2000,
          hourlyCost: 28,
          isAvailable: false,
          specialties: {
            create: [
              { name: 'Electrónica', level: 'Junior' }
            ]
          }
        }
      }
    }
  })

  const tech4 = await prisma.user.create({
    data: {
      name: 'Roberto Díaz Morales',
      email: 'roberto.diaz@sieme.com',
      password: hashedPassword,
      role: 'TECHNICIAN',
      phone: '+1 555 200 0004',
      isActive: true,
      technicianProfile: {
        create: {
          employeeId: 'TEC-004',
          hireDate: new Date('2024-01-05'),
          baseSalary: 2300,
          hourlyCost: 32,
          isAvailable: true,
          specialties: {
            create: [
              { name: 'HVAC', level: 'Senior' },
              { name: 'Electricidad', level: 'Junior' }
            ]
          },
          certifications: {
            create: [
              { name: 'Técnico HVAC Certificado', issueDate: new Date('2023-08-15'), expiryDate: new Date('2026-08-15') }
            ]
          }
        }
      }
    }
  })

  const tech5 = await prisma.user.create({
    data: {
      name: 'Miguel Ángel Vargas',
      email: 'miguel.vargas@sieme.com',
      password: hashedPassword,
      role: 'TECHNICIAN',
      phone: '+1 555 200 0005',
      isActive: false,
      technicianProfile: {
        create: {
          employeeId: 'TEC-005',
          hireDate: new Date('2022-11-20'),
          baseSalary: 2400,
          hourlyCost: 34,
          isAvailable: false,
          specialties: {
            create: [
              { name: 'Mantenimiento General', level: 'Senior' }
            ]
          }
        }
      }
    }
  })
  console.log('✅ 5 Technicians created')

  // ========== CLIENTS ==========
  const client1 = await prisma.user.create({
    data: {
      name: 'Fernando López (Industrias ABC)',
      email: 'fernando@industriasabc.com',
      password: hashedPassword,
      role: 'CLIENT',
      phone: '+1 555 300 0001',
      isActive: true,
      clientProfile: {
        create: {
          companyName: 'Industrias ABC S.A.',
          ruc: '20123456789',
          businessType: 'Manufactura',
          address: 'Av. Industrial 1234, Zona Industrial',
          industry: 'Manufactura',
          locations: {
            create: [
              { name: 'Planta Principal', address: 'Av. Industrial 1234', contactName: 'Fernando López', contactPhone: '+1 555 300 0001' },
              { name: 'Almacén Norte', address: 'Calle Almacén 567', contactName: 'José Mendez', contactPhone: '+1 555 300 0002' }
            ]
          }
        }
      }
    }
  })

  const client2 = await prisma.user.create({
    data: {
      name: 'Patricia Ramírez (Hotel Estrella)',
      email: 'patricia@hotelestrella.com',
      password: hashedPassword,
      role: 'CLIENT',
      phone: '+1 555 300 0003',
      isActive: true,
      clientProfile: {
        create: {
          companyName: 'Hotel Estrella de Oro',
          ruc: '20987654321',
          businessType: 'Hotelería',
          address: 'Av. Turismo 890, Centro',
          industry: 'Servicios',
          locations: {
            create: [
              { name: 'Hotel Principal', address: 'Av. Turismo 890', contactName: 'Patricia Ramírez', contactPhone: '+1 555 300 0003' }
            ]
          }
        }
      }
    }
  })

  const client3 = await prisma.user.create({
    data: {
      name: 'Ricardo Torres (Supermercados RT)',
      email: 'ricardo@supermercadosrt.com',
      password: hashedPassword,
      role: 'CLIENT',
      phone: '+1 555 300 0004',
      isActive: true,
      clientProfile: {
        create: {
          companyName: 'Supermercados RT S.A.C.',
          ruc: '20456789123',
          businessType: 'Retail',
          address: 'Jr. Comercio 456',
          industry: 'Retail',
          locations: {
            create: [
              { name: 'Sucursal Centro', address: 'Jr. Comercio 456', contactName: 'Ana Silva', contactPhone: '+1 555 300 0005' },
              { name: 'Sucursal Norte', address: 'Av. Norte 789', contactName: 'Mario Quispe', contactPhone: '+1 555 300 0006' },
              { name: 'Sucursal Sur', address: 'Av. Sur 321', contactName: 'Carmen Díaz', contactPhone: '+1 555 300 0007' }
            ]
          }
        }
      }
    }
  })

  const client4 = await prisma.user.create({
    data: {
      name: 'Claudia Mendoza (Clínica Salud)',
      email: 'claudia@clinicasalud.com',
      password: hashedPassword,
      role: 'CLIENT',
      phone: '+1 555 300 0008',
      isActive: true,
      clientProfile: {
        create: {
          companyName: 'Clínica Salud Total',
          ruc: '20789123456',
          businessType: 'Salud',
          address: 'Av. Salud 123',
          industry: 'Salud'
        }
      }
    }
  })
  console.log('✅ 4 Clients created')

  // ========== WORK ORDERS ==========
  const wo1 = await prisma.workOrder.create({
    data: {
      orderNumber: 'WO-20241201-001',
      clientId: client1.id,
      technicianId: tech1.id,
      title: 'Reparación sistema eléctrico planta',
      description: 'Falla en el sistema eléctrico principal de la planta. Se reportan cortes intermitentes.',
      category: 'Electricidad',
      priority: 'URGENT',
      status: 'IN_PROGRESS',
      serviceAddress: 'Av. Industrial 1234, Zona Industrial',
      contactPerson: 'Fernando López',
      contactPhone: '+1 555 300 0001',
      scheduledDate: new Date('2024-12-05'),
      notes: 'Cliente prioritario - contrato activo'
    }
  })

  const wo2 = await prisma.workOrder.create({
    data: {
      orderNumber: 'WO-20241201-002',
      clientId: client2.id,
      title: 'Mantenimiento aire acondicionado',
      description: 'Revisión y mantenimiento preventivo del sistema HVAC del hotel.',
      category: 'HVAC',
      priority: 'NORMAL',
      status: 'REQUESTED',
      serviceAddress: 'Av. Turismo 890, Centro',
      contactPerson: 'Patricia Ramírez',
      contactPhone: '+1 555 300 0003'
    }
  })

  const wo3 = await prisma.workOrder.create({
    data: {
      orderNumber: 'WO-20241130-001',
      clientId: client3.id,
      technicianId: tech2.id,
      title: 'Reparación sistema refrigeración',
      description: 'Cámara fría de sucursal centro no enfría correctamente.',
      category: 'Refrigeración',
      priority: 'EMERGENCY',
      status: 'SCHEDULED',
      serviceAddress: 'Jr. Comercio 456',
      contactPerson: 'Ana Silva',
      contactPhone: '+1 555 300 0005',
      scheduledDate: new Date('2024-12-04')
    }
  })

  const wo4 = await prisma.workOrder.create({
    data: {
      orderNumber: 'WO-20241128-001',
      clientId: client1.id,
      technicianId: tech1.id,
      title: 'Instalación tomacorrientes industriales',
      description: 'Instalación de 10 tomacorrientes industriales 220V en área de producción.',
      category: 'Electricidad',
      priority: 'NORMAL',
      status: 'COMPLETED',
      serviceAddress: 'Av. Industrial 1234, Zona Industrial',
      contactPerson: 'Fernando López',
      contactPhone: '+1 555 300 0001',
      scheduledDate: new Date('2024-11-28'),
      completedAt: new Date('2024-11-28'),
      notes: 'Trabajo completado satisfactoriamente'
    }
  })

  const wo5 = await prisma.workOrder.create({
    data: {
      orderNumber: 'WO-20241125-001',
      clientId: client4.id,
      technicianId: tech4.id,
      title: 'Mantenimiento equipo HVAC quirófano',
      description: 'Mantenimiento preventivo del sistema de climatización del quirófano.',
      category: 'HVAC',
      priority: 'URGENT',
      status: 'COMPLETED',
      serviceAddress: 'Av. Salud 123',
      contactPerson: 'Claudia Mendoza',
      contactPhone: '+1 555 300 0008',
      scheduledDate: new Date('2024-11-25'),
      completedAt: new Date('2024-11-25')
    }
  })

  const wo6 = await prisma.workOrder.create({
    data: {
      orderNumber: 'WO-20241120-001',
      clientId: client2.id,
      title: 'Revisión sistema duchas',
      description: 'Baja presión en duchas del piso 3.',
      category: 'Plomería',
      priority: 'NORMAL',
      status: 'CANCELLED',
      serviceAddress: 'Av. Turismo 890, Centro',
      contactPerson: 'Patricia Ramírez',
      contactPhone: '+1 555 300 0003',
      notes: 'Cancelado por el cliente - resolvieron internamente'
    }
  })
  console.log('✅ 6 Work Orders created')

  // Add logs to some work orders
  await prisma.workOrderLog.createMany({
    data: [
      { workOrderId: wo1.id, previousStatus: 'REQUESTED', newStatus: 'SCHEDULED', notes: 'Orden programada para el 5 de diciembre' },
      { workOrderId: wo1.id, previousStatus: 'SCHEDULED', newStatus: 'IN_PROGRESS', notes: 'Técnico en sitio' },
      { workOrderId: wo4.id, previousStatus: 'IN_PROGRESS', newStatus: 'COMPLETED', notes: 'Trabajo finalizado correctamente' }
    ]
  })
  console.log('✅ Work Order logs created')

  // ========== QUOTATIONS ==========
  const quote1 = await prisma.quotation.create({
    data: {
      quotationNumber: 'QT-20241205-001',
      workOrderId: wo1.id,
      status: 'PENDING',
      laborSubtotal: 450.00,
      materialsSubtotal: 320.50,
      otherCosts: 50.00,
      discountAmount: 0,
      taxAmount: 147.69,
      totalAmount: 968.19,
      validUntil: new Date('2024-12-20'),
      notes: 'Cotización por reparación sistema eléctrico - trabajo urgente',
      items: {
        create: [
          { description: 'Mano de obra técnico electricista (5 horas)', quantity: 5, unitPrice: 90, total: 450 },
          { description: 'Cable eléctrico THW 12 AWG (50m)', quantity: 50, unitPrice: 3.5, total: 175 },
          { description: 'Interruptores termomagnéticos 20A', quantity: 3, unitPrice: 48.50, total: 145.50 },
          { description: 'Movilización y transporte', quantity: 1, unitPrice: 50, total: 50 }
        ]
      }
    }
  })

  const quote2 = await prisma.quotation.create({
    data: {
      quotationNumber: 'QT-20241204-001',
      workOrderId: wo3.id,
      status: 'PENDING',
      laborSubtotal: 600.00,
      materialsSubtotal: 850.00,
      otherCosts: 100.00,
      discountAmount: 50.00,
      taxAmount: 270.00,
      totalAmount: 1770.00,
      validUntil: new Date('2024-12-18'),
      notes: 'Reparación urgente sistema de refrigeración - cámara fría',
      items: {
        create: [
          { description: 'Mano de obra técnico refrigeración (8 horas)', quantity: 8, unitPrice: 75, total: 600 },
          { description: 'Compresor 1.5HP para cámara fría', quantity: 1, unitPrice: 650, total: 650 },
          { description: 'Gas refrigerante R-404A (5kg)', quantity: 5, unitPrice: 40, total: 200 },
          { description: 'Transporte equipos pesados', quantity: 1, unitPrice: 100, total: 100 }
        ]
      }
    }
  })

  const quote3 = await prisma.quotation.create({
    data: {
      quotationNumber: 'QT-20241128-001',
      workOrderId: wo4.id,
      status: 'APPROVED',
      laborSubtotal: 300.00,
      materialsSubtotal: 450.00,
      otherCosts: 0,
      discountAmount: 0,
      taxAmount: 135.00,
      totalAmount: 885.00,
      validUntil: new Date('2024-12-15'),
      notes: 'Instalación tomacorrientes industriales - aprobado por cliente',
      approvedById: client1.id,
      items: {
        create: [
          { description: 'Mano de obra instalación (4 horas)', quantity: 4, unitPrice: 75, total: 300 },
          { description: 'Tomacorrientes industriales 220V 30A', quantity: 10, unitPrice: 35, total: 350 },
          { description: 'Canaletas y accesorios', quantity: 1, unitPrice: 100, total: 100 }
        ]
      }
    }
  })

  const quote4 = await prisma.quotation.create({
    data: {
      quotationNumber: 'QT-20241125-001',
      workOrderId: wo5.id,
      status: 'APPROVED',
      laborSubtotal: 400.00,
      materialsSubtotal: 180.00,
      otherCosts: 50.00,
      discountAmount: 0,
      taxAmount: 113.40,
      totalAmount: 743.40,
      validUntil: new Date('2024-12-10'),
      notes: 'Mantenimiento preventivo HVAC quirófano - completado',
      approvedById: client4.id,
      items: {
        create: [
          { description: 'Mantenimiento preventivo completo HVAC (5 horas)', quantity: 5, unitPrice: 80, total: 400 },
          { description: 'Filtros HEPA quirófano', quantity: 4, unitPrice: 45, total: 180 },
          { description: 'Materiales de limpieza especializados', quantity: 1, unitPrice: 50, total: 50 }
        ]
      }
    }
  })

  const quote5 = await prisma.quotation.create({
    data: {
      quotationNumber: 'QT-20241202-001',
      workOrderId: wo2.id,
      status: 'DRAFT',
      laborSubtotal: 350.00,
      materialsSubtotal: 120.00,
      otherCosts: 30.00,
      discountAmount: 0,
      taxAmount: 90.00,
      totalAmount: 590.00,
      validUntil: new Date('2024-12-22'),
      notes: 'Borrador - pendiente revisión técnica',
      items: {
        create: [
          { description: 'Mantenimiento preventivo AC (4 horas)', quantity: 4, unitPrice: 70, total: 280 },
          { description: 'Limpieza profunda evaporador', quantity: 2, unitPrice: 35, total: 70 },
          { description: 'Gas refrigerante R-410A (2kg)', quantity: 2, unitPrice: 60, total: 120 }
        ]
      }
    }
  })
  console.log('✅ 5 Quotations created')

  console.log('\n🎉 Seed completed successfully!')
  console.log('\n📋 Test accounts (password: password123):')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('ADMIN:      admin@sieme.com')
  console.log('MANAGER:    maria.garcia@sieme.com')
  console.log('TECHNICIAN: juan.perez@sieme.com')
  console.log('CLIENT:     fernando@industriasabc.com')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
