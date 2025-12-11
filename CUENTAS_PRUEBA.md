# 🔐 Cuentas de Prueba - SIEME

## 📝 Credenciales de Acceso

Todas las cuentas usan la misma contraseña: **`password123`**

### 👨‍💼 Administrador
| Email | Contraseña | Rol |
|-------|------------|-----|
| `admin@sieme.com` | password123 | ADMIN |

### 👔 Managers
| Email | Nombre | Departamento |
|-------|--------|--------------|
| `maria.garcia@sieme.com` | María García López | Operaciones |
| `carlos.rodriguez@sieme.com` | Carlos Rodríguez Pérez | Recursos Humanos |
| `ana.martinez@sieme.com` | Ana Martínez Silva | Soporte Técnico |

### 🔧 Técnicos
| Email | Nombre | Código | Especialidades | Estado |
|-------|--------|--------|----------------|--------|
| `juan.perez@sieme.com` | Juan Pérez Sánchez | TEC-001 | Electricidad, HVAC | ✅ Disponible |
| `pedro.gonzalez@sieme.com` | Pedro González Ruiz | TEC-002 | Plomería, Refrigeración | ✅ Disponible |
| `luis.hernandez@sieme.com` | Luis Hernández Torres | TEC-003 | Electrónica | ⚠️ Ocupado |
| `roberto.diaz@sieme.com` | Roberto Díaz Morales | TEC-004 | HVAC, Electricidad | ✅ Disponible |
| `miguel.vargas@sieme.com` | Miguel Ángel Vargas | TEC-005 | Mantenimiento General | ❌ Inactivo |

### 👤 Clientes
| Email | Empresa | RUC | Industria | Sucursales |
|-------|---------|-----|-----------|------------|
| `fernando@industriasabc.com` | Industrias ABC S.A. | 20123456789 | Manufactura | 2 |
| `patricia@hotelestrella.com` | Hotel Estrella de Oro | 20987654321 | Servicios | 1 |
| `ricardo@supermercadosrt.com` | Supermercados RT S.A.C. | 20456789123 | Retail | 3 |
| `claudia@clinicasalud.com` | Clínica Salud Total | 20789123456 | Salud | 0 |

## 📊 Órdenes de Trabajo de Prueba

| Orden | Cliente | Categoría | Estado | Técnico |
|-------|---------|-----------|--------|---------|
| WO-20241201-001 | Industrias ABC | Electricidad | 🔄 EN PROGRESO | Juan Pérez |
| WO-20241201-002 | Hotel Estrella | HVAC | ⏳ SOLICITADA | Sin asignar |
| WO-20241130-001 | Supermercados RT | Refrigeración | 📅 PROGRAMADA | Pedro González |
| WO-20241128-001 | Industrias ABC | Electricidad | ✅ COMPLETADA | Juan Pérez |
| WO-20241125-001 | Clínica Salud | HVAC | ✅ COMPLETADA | Roberto Díaz |
| WO-20241120-001 | Hotel Estrella | Plomería | ❌ CANCELADA | - |

## 🚀 Cómo Usar

1. Accede a http://localhost:3000
2. Haz clic en "Iniciar Sesión"
3. Usa cualquiera de las credenciales anteriores
4. Según el rol, serás redirigido a:
   - **ADMIN:** `/admin/dashboard`
   - **MANAGER:** `/manager/dashboard`
   - **TECHNICIAN:** `/technician/dashboard`
   - **CLIENT:** `/client/dashboard`

## 🔄 Regenerar Datos

```bash
npm run db:seed
```

## ⚠️ Importante

- Cuentas de **PRUEBA** únicamente
- No usar en producción
- Contraseña: **password123** para todas

---

**Última actualización:** 4 de diciembre de 2024
