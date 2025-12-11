# TECHOPS 4.0
## Sistema de Gestión de Servicios Técnicos Profesionales
### Documentación Técnica y Funcional - Versión Corregida

---

# PARTE I: VISIÓN Y MODELO DE NEGOCIO

## 1. Resumen Ejecutivo

### 1.1 Propósito del Documento
Este documento define la arquitectura funcional completa de **TechOps 4.0**, una plataforma de gestión integral para empresas que prestan servicios técnicos especializados en electrónica, mecánica y electricidad a clientes empresariales e industriales.

### 1.2 Definición del Modelo de Negocio

> **IMPORTANTE:** TechOps 4.0 es una plataforma para **empresas de servicios técnicos con plantilla propia de técnicos**, NO un marketplace de freelancers.

| Característica | Descripción |
|----------------|-------------|
| **Tipo de empresa** | Empresa de servicios técnicos B2B |
| **Técnicos** | Empleados en nómina de la empresa |
| **Clientes** | Empresas e industrias que contratan servicios |
| **Modelo de ingreso** | Facturación por horas trabajadas + materiales |
| **Relación laboral** | Técnicos son empleados, no contratistas independientes |

### 1.3 Alcance del Sistema

TechOps 4.0 gestiona:

- Relación comercial con clientes empresariales (contratos, cotizaciones, facturación)
- Gestión operativa de órdenes de trabajo
- Administración de la plantilla de técnicos
- Control de costos y rentabilidad
- Comunicación en tiempo real
- Reportes y analítica de negocio

### 1.4 Usuarios del Sistema

| Rol | Descripción | Acceso |
|-----|-------------|--------|
| **Cliente Empresarial** | Empresas que contratan servicios técnicos | Portal de cliente |
| **Técnico** | Empleado de la empresa que ejecuta servicios | App móvil |
| **Supervisor/Manager** | Coordina equipos de técnicos y operaciones | Consola de gestión |
| **Administrador** | Gestión completa del negocio y plataforma | Backoffice completo |
| **RRHH** | Gestión de nómina y personal técnico | Módulo RRHH |
| **Finanzas** | Facturación, cobros y análisis financiero | Módulo financiero |

---

## 2. Modelo de Negocio Detallado

### 2.1 Propuesta de Valor

**Para Clientes Empresariales:**
- Acceso a técnicos certificados y supervisados
- Transparencia total del proceso de servicio
- Contratos marco con tarifas pre-acordadas
- SLAs garantizados con penalizaciones
- Facturación consolidada y flexible
- Historial completo de servicios y activos

**Para la Empresa (Operador de TechOps):**
- Gestión eficiente de la plantilla técnica
- Control de costos y rentabilidad por orden
- Optimización de asignaciones y rutas
- Reducción de carga administrativa
- Escalabilidad operativa
- Datos para toma de decisiones

**Para los Técnicos (Empleados):**
- Herramientas móviles eficientes
- Menos papeleo y burocracia
- Información completa de cada trabajo
- Comunicación directa con supervisores
- Registro automático de horas trabajadas

### 2.2 Fuentes de Ingreso

```
INGRESOS = (Horas Trabajadas × Tarifa Horaria) + Materiales + Recargos - Descuentos

Donde:
├── Tarifa Horaria: Definida por contrato/tipo de servicio
├── Materiales: Precio de venta (costo + margen)
├── Recargos: Emergencia, nocturno, festivo, desplazamiento
└── Descuentos: Por volumen, contrato, promociones
```

**Estructura de Tarifas:**

| Concepto | Descripción | Ejemplo |
|----------|-------------|---------|
| Tarifa hora normal | Horario laboral estándar | $50/hora |
| Tarifa hora nocturna | 22:00 - 06:00 (+50%) | $75/hora |
| Tarifa fin de semana | Sábados y domingos (+30%) | $65/hora |
| Tarifa festivo | Días feriados (+50%) | $75/hora |
| Recargo emergencia | Respuesta <2 horas (+100%) | $100/hora |
| Desplazamiento | Por zona geográfica | $20-$80 |
| Materiales | Costo + margen (30-50%) | Variable |

### 2.3 Estructura de Costos

```
COSTO POR ORDEN = Costo Técnico + Costo Materiales + Overhead

Donde:
├── Costo Técnico: (Salario + Cargas Sociales) / Horas productivas × Horas orden
├── Costo Materiales: Precio de compra de materiales utilizados
└── Overhead: % asignado por costos operativos (vehículos, herramientas, admin)
```

**Fórmula de Rentabilidad:**
```
MARGEN BRUTO = ((Facturado - Costo Total) / Facturado) × 100

Objetivo: Margen bruto > 40%
Alerta: Margen bruto < 25%
```

---

## 3. Gestión de Contratos (NUEVO)

### 3.1 Tipos de Contrato

| Tipo | Descripción | Facturación |
|------|-------------|-------------|
| **Por demanda** | Sin compromiso, servicios puntuales | Por cada servicio |
| **Contrato marco** | Tarifas pre-acordadas, volumen estimado | Mensual consolidado |
| **Mantenimiento preventivo** | Servicios programados recurrentes | Mensual fijo + variable |
| **Dedicación exclusiva** | Técnico(s) asignados permanentemente | Mensual fijo |

### 3.2 Elementos del Contrato Marco

Un contrato marco entre la empresa y un cliente debe incluir:

```
CONTRATO MARCO
│
├── INFORMACIÓN GENERAL
│   ├── Datos del cliente (razón social, RUC, dirección)
│   ├── Fecha de inicio y vigencia
│   ├── Condiciones de renovación
│   └── Causales de terminación
│
├── TARIFAS ACORDADAS
│   ├── Tarifa hora por tipo de servicio
│   ├── Tarifa hora por especialidad (electrónica, mecánica, electricidad)
│   ├── Recargos aplicables (nocturno, festivo, emergencia)
│   ├── Descuento por volumen (si aplica)
│   └── Tarifa de desplazamiento por zona
│
├── CONDICIONES DE PAGO
│   ├── Plazo de pago (30/60/90 días)
│   ├── Método de facturación (por servicio / consolidado mensual)
│   ├── Datos de facturación
│   └── Penalizaciones por mora
│
├── SLAs (Acuerdos de Nivel de Servicio)
│   ├── Tiempo de primera respuesta por prioridad
│   ├── Tiempo de llegada a sitio por prioridad
│   ├── Tiempo de resolución por prioridad
│   ├── Penalizaciones por incumplimiento
│   └── Excepciones y exclusiones
│
├── AUTORIZACIONES AUTOMÁTICAS
│   ├── Límite de aprobación automática ($)
│   ├── Límite para emergencias sin cotización ($)
│   ├── Contactos autorizados para aprobaciones
│   └── Horarios de autorización
│
├── GARANTÍAS
│   ├── Período de garantía por tipo de servicio
│   ├── Condiciones de validez
│   └── Proceso de reclamo
│
└── TÉCNICOS PREFERENTES (opcional)
    ├── Técnicos asignados al cliente
    └── Técnicos vetados (blacklist)
```

### 3.3 Flujo de Gestión de Contratos

```
1. PROSPECCIÓN
   └── Comercial registra oportunidad

2. NEGOCIACIÓN
   ├── Se definen tarifas
   ├── Se negocian SLAs
   └── Se establecen condiciones de pago

3. FORMALIZACIÓN
   ├── Se genera contrato en sistema
   ├── Cliente firma digitalmente
   └── Contrato activo

4. VIGENCIA
   ├── Sistema aplica tarifas automáticamente
   ├── Monitoreo de cumplimiento de SLAs
   └── Alertas de renovación (30 días antes)

5. RENOVACIÓN/TERMINACIÓN
   ├── Renovación automática (si aplica)
   ├── Renegociación de términos
   └── Cierre y liquidación final
```

---

# PARTE II: MÓDULOS FUNCIONALES

## 4. Módulo de Usuarios y Autenticación

### 4.1 Roles y Permisos (RBAC)

**Matriz de Permisos:**

| Permiso | Cliente | Técnico | Supervisor | Admin | RRHH | Finanzas |
|---------|:-------:|:-------:|:----------:|:-----:|:----:|:--------:|
| Ver sus órdenes | ✓ | ✓ | ✓ | ✓ | - | ✓ |
| Crear solicitud | ✓ | - | ✓ | ✓ | - | - |
| Aprobar cotización | ✓ | - | - | ✓ | - | - |
| Ver todas las órdenes | - | - | ✓ | ✓ | - | ✓ |
| Asignar técnicos | - | - | ✓ | ✓ | - | - |
| Ejecutar órdenes | - | ✓ | ✓ | - | - | - |
| Aprobar materiales extra | ✓ | - | ✓ | ✓ | - | - |
| Ver costos internos | - | - | ✓ | ✓ | - | ✓ |
| Gestionar técnicos | - | - | ✓ | ✓ | ✓ | - |
| Gestionar contratos | - | - | - | ✓ | - | ✓ |
| Facturar | - | - | - | ✓ | - | ✓ |
| Ver reportes financieros | - | - | - | ✓ | - | ✓ |
| Configurar sistema | - | - | - | ✓ | - | - |
| Gestionar nómina | - | - | - | ✓ | ✓ | - |

### 4.2 Perfil de Cliente Empresarial

```
PERFIL CLIENTE
│
├── DATOS CORPORATIVOS
│   ├── Razón social
│   ├── Nombre comercial
│   ├── RUC / NIF / Tax ID
│   ├── Dirección fiscal
│   ├── Logo
│   └── Industria/Sector
│
├── CONTACTOS (múltiples)
│   ├── Nombre completo
│   ├── Cargo
│   ├── Email
│   ├── Teléfono
│   ├── Rol (Solicitante / Aprobador / Facturación)
│   └── Límite de aprobación ($)
│
├── UBICACIONES/SUCURSALES
│   ├── Nombre de ubicación
│   ├── Dirección completa
│   ├── Coordenadas GPS
│   ├── Instrucciones de acceso
│   ├── Horario de operación
│   └── Contacto en sitio
│
├── ACTIVOS (opcional)
│   ├── Inventario de equipos
│   ├── QR/código de identificación
│   ├── Historial de servicios por activo
│   └── Manuales y documentación
│
├── CONFIGURACIÓN
│   ├── Contrato activo
│   ├── Condiciones de pago
│   ├── Preferencias de notificación
│   └── Técnicos preferentes/vetados
│
└── HISTORIAL
    ├── Órdenes completadas
    ├── Facturas emitidas
    ├── Pagos realizados
    └── Calificaciones otorgadas
```

### 4.3 Perfil de Técnico (Empleado)

```
PERFIL TÉCNICO
│
├── DATOS PERSONALES
│   ├── Nombre completo
│   ├── Documento de identidad
│   ├── Fecha de nacimiento
│   ├── Dirección
│   ├── Teléfono personal
│   ├── Email corporativo
│   └── Foto
│
├── DATOS LABORALES
│   ├── Código de empleado
│   ├── Fecha de ingreso
│   ├── Tipo de contrato (fijo/temporal)
│   ├── Salario base
│   ├── Supervisor asignado
│   └── Estado (activo/vacaciones/baja)
│
├── COMPETENCIAS
│   ├── Especialidades (electrónica, mecánica, electricidad)
│   ├── Nivel (junior/semi-senior/senior)
│   ├── Certificaciones (con fecha de vencimiento)
│   ├── Capacitaciones completadas
│   └── Equipos/marcas que domina
│
├── DISPONIBILIDAD
│   ├── Horario laboral estándar
│   ├── Disponibilidad para horas extra
│   ├── Disponibilidad para emergencias
│   ├── Zona de cobertura geográfica
│   └── Calendario de vacaciones/permisos
│
├── RECURSOS ASIGNADOS
│   ├── Vehículo (si aplica)
│   ├── Herramientas
│   ├── Equipos de medición
│   ├── Teléfono/tablet corporativo
│   └── Inventario móvil (materiales en vehículo)
│
├── COSTOS (solo visible para admin/finanzas)
│   ├── Costo hora (calculado)
│   ├── Costo de recursos asignados
│   └── Overhead asignado
│
└── DESEMPEÑO
    ├── Órdenes completadas (mes/año)
    ├── Horas trabajadas vs disponibles
    ├── Calificación promedio
    ├── Tasa de re-trabajo
    ├── Cumplimiento de SLA
    └── Ingresos generados
```

### 4.4 Autenticación y Seguridad

**Requisitos de Autenticación:**

| Rol | 2FA | SSO | Sesión máxima | Intentos fallidos |
|-----|:---:|:---:|:-------------:|:-----------------:|
| Cliente | Opcional | Sí | 8 horas | 5 → bloqueo 30 min |
| Técnico | Requerido | No | 12 horas | 5 → bloqueo 30 min |
| Supervisor | Requerido | Sí | 4 horas | 3 → bloqueo 1 hora |
| Admin | Requerido | Sí | 2 horas | 3 → bloqueo 1 hora |

**Políticas de Contraseña:**
- Mínimo 12 caracteres
- Al menos: 1 mayúscula, 1 minúscula, 1 número, 1 símbolo
- No puede contener nombre de usuario
- Cambio obligatorio cada 90 días
- No repetir últimas 5 contraseñas

---

## 5. Módulo de Gestión de Órdenes de Trabajo

### 5.1 Estados de Orden (Simplificado)

Se reducen de 16 a **8 estados principales** con sub-estados internos:

```
┌─────────────────────────────────────────────────────────────────┐
│                    CICLO DE VIDA DE ORDEN                       │
└─────────────────────────────────────────────────────────────────┘

1. SOLICITADA ──────► Cliente crea la solicitud
       │
       ▼
2. PROGRAMADA ─────► Fecha y técnico asignados
       │              Sub-estados: cotizada, aprobada, asignada
       ▼
3. EN PROCESO ─────► Técnico trabajando
       │              Sub-estados: en_camino, en_sitio, ejecutando
       │
       ├──► 4. PENDIENTE ──► Esperando algo externo
       │         │            Sub-estados: esperando_aprobacion,
       │         │            esperando_repuesto, esperando_cliente
       │         │
       │         └──────────► Vuelve a EN PROCESO cuando se resuelve
       │
       ▼
5. COMPLETADA ─────► Trabajo terminado, pendiente validación
       │
       ▼
6. FACTURADA ──────► Factura emitida
       │
       ▼
7. CERRADA ────────► Pagada y calificada (FIN)

8. CANCELADA ──────► No se ejecutó (FIN alternativo)
```

**Reglas de Transición:**

| De | A | Condición | Quién |
|----|---|-----------|-------|
| SOLICITADA | PROGRAMADA | Técnico y fecha asignados | Supervisor |
| SOLICITADA | CANCELADA | Cliente cancela | Cliente/Admin |
| PROGRAMADA | EN PROCESO | Técnico inicia viaje | Técnico |
| PROGRAMADA | CANCELADA | Cancelación antes de inicio | Cliente/Admin |
| EN PROCESO | PENDIENTE | Requiere aprobación/repuesto | Técnico |
| EN PROCESO | COMPLETADA | Trabajo finalizado | Técnico |
| PENDIENTE | EN PROCESO | Se resuelve la espera | Automático |
| PENDIENTE | CANCELADA | Timeout o rechazo | Sistema/Admin |
| COMPLETADA | FACTURADA | Cliente aprueba trabajo | Sistema |
| FACTURADA | CERRADA | Pago recibido + calificación | Sistema |

### 5.2 Prioridades y SLAs

**Definición de Prioridades:**

| Prioridad | Descripción | Criterio |
|-----------|-------------|----------|
| **NORMAL** | Servicio planificado, sin urgencia | No afecta operación |
| **URGENTE** | Afecta parcialmente la operación | Degradación de servicio |
| **EMERGENCIA** | Operación detenida o riesgo | Línea parada, riesgo seguridad |

**SLAs por Prioridad:**

| Métrica | Normal | Urgente | Emergencia |
|---------|:------:|:-------:|:----------:|
| Primera respuesta | 4 horas | 1 hora | 15 minutos |
| Técnico en sitio | 48 horas | 8 horas | 2 horas |
| Resolución | 5 días | 24 horas | 4 horas |
| Recargo aplicable | 0% | +30% | +100% |

**Cálculo de SLA:**
```
Tiempo Primera Respuesta = Timestamp(primera_accion) - Timestamp(creacion)
Tiempo En Sitio = Timestamp(check_in) - Timestamp(creacion)
Tiempo Resolución = Timestamp(completada) - Timestamp(creacion)

NOTA: Solo cuenta tiempo dentro de horario de atención definido en contrato
```

### 5.3 Flujo Completo: Servicio Estándar

```
┌─────────────────────────────────────────────────────────────────┐
│ FASE 1: SOLICITUD                                               │
└─────────────────────────────────────────────────────────────────┘

[CLIENTE] Crea solicitud de servicio
    │
    │   Información requerida:
    │   ├── Tipo de servicio (categoría)
    │   ├── Descripción del problema
    │   ├── Ubicación del servicio
    │   ├── Activo afectado (si aplica)
    │   ├── Prioridad sugerida
    │   ├── Fotos/videos (opcional pero incentivado)
    │   └── Contacto en sitio
    │
    ▼
[SISTEMA] Valida y crea orden #ORD-XXXXX
    │
    │   Acciones automáticas:
    │   ├── Asigna número único
    │   ├── Aplica SLA según contrato y prioridad
    │   ├── Notifica a supervisores
    │   └── Inicia cronómetro de SLA
    │
    ▼
[SISTEMA] ¿Requiere cotización?
    │
    ├── NO (monto estimado < límite auto-aprobación del cliente)
    │   └── Continúa a FASE 2
    │
    └── SÍ (monto > límite o cliente lo solicita)
        │
        ▼
    [SUPERVISOR] Genera cotización
        │   ├── Horas estimadas × tarifa
        │   ├── Materiales estimados
        │   ├── Desplazamiento
        │   └── Total + impuestos
        │
        ▼
    [SISTEMA] Envía cotización al cliente
        │
        ▼
    [CLIENTE] Revisa cotización
        │
        ├── APRUEBA → Continúa a FASE 2
        │
        ├── RECHAZA → Orden CANCELADA (fin)
        │
        └── SOLICITA CAMBIOS → Vuelve a generar cotización


┌─────────────────────────────────────────────────────────────────┐
│ FASE 2: ASIGNACIÓN                                              │
└─────────────────────────────────────────────────────────────────┘

[SUPERVISOR/SISTEMA] Asigna técnico
    │
    │   Criterios de asignación:
    │   ├── Especialización requerida
    │   ├── Certificaciones necesarias
    │   ├── Disponibilidad
    │   ├── Ubicación geográfica (menor distancia)
    │   ├── Carga de trabajo actual
    │   ├── Historial con el cliente (conoce los equipos)
    │   ├── Calificación del técnico
    │   └── Preferencias del cliente (si tiene técnico favorito)
    │
    ▼
[SISTEMA] Notifica al técnico
    │
    ▼
[TÉCNICO] Revisa y acepta/rechaza
    │
    ├── ACEPTA → Estado = PROGRAMADA, continúa
    │
    └── RECHAZA (con motivo)
        └── [SISTEMA] Busca siguiente técnico óptimo


┌─────────────────────────────────────────────────────────────────┐
│ FASE 3: EJECUCIÓN                                               │
└─────────────────────────────────────────────────────────────────┘

[TÉCNICO] Inicia viaje
    │   Estado = EN PROCESO (sub: en_camino)
    │   └── [SISTEMA] Notifica cliente: "Técnico en camino, ETA: X min"
    │
    ▼
[TÉCNICO] Llega y hace CHECK-IN
    │   Estado = EN PROCESO (sub: en_sitio)
    │   ├── Geolocalización validada
    │   ├── Foto de llegada (opcional)
    │   └── [SISTEMA] Notifica cliente + registra hora llegada
    │
    ▼
[TÉCNICO] Diagnóstico inicial
    │   ├── Verifica el problema reportado
    │   ├── Identifica causa raíz
    │   ├── Documenta hallazgos con fotos
    │   │
    │   └── ¿Trabajo dentro de lo cotizado?
    │       │
    │       ├── SÍ → Continúa ejecución
    │       │
    │       └── NO → Ver FLUJO DE TRABAJO ADICIONAL (5.4)
    │
    ▼
[TÉCNICO] Ejecuta trabajo
    │   Estado = EN PROCESO (sub: ejecutando)
    │   │
    │   │   Durante la ejecución:
    │   │   ├── Actualiza progreso periódicamente
    │   │   ├── Toma fotos del antes/durante/después
    │   │   ├── Registra materiales utilizados
    │   │   ├── Chat con cliente si necesario
    │   │   └── Solicita apoyo si lo requiere
    │   │
    │   └── ¿Puede completar el trabajo?
    │       │
    │       ├── SÍ → Continúa a finalización
    │       │
    │       └── NO → Estado = PENDIENTE
    │           │   ├── esperando_repuesto
    │           │   ├── esperando_aprobacion
    │           │   └── esperando_cliente
    │           │
    │           └── Ver FLUJO DE PAUSAS (5.5)
    │
    ▼
[TÉCNICO] Finaliza trabajo
    │   ├── Toma fotos finales
    │   ├── Verifica funcionamiento
    │   ├── Limpia área de trabajo
    │   └── Hace CHECK-OUT (geolocalización + hora)
    │
    ▼
[TÉCNICO] Completa reporte de servicio
    │   ├── Diagnóstico realizado
    │   ├── Acciones ejecutadas
    │   ├── Materiales utilizados (de lista predefinida)
    │   ├── Horas trabajadas (automático + ajuste manual)
    │   ├── Observaciones y recomendaciones
    │   ├── Fotos adjuntas
    │   └── Firma digital del cliente (opcional)
    │
    ▼
[SISTEMA] Estado = COMPLETADA
    └── Notifica a cliente para revisión


┌─────────────────────────────────────────────────────────────────┐
│ FASE 4: CIERRE                                                  │
└─────────────────────────────────────────────────────────────────┘

[CLIENTE] Revisa trabajo completado
    │
    ├── APRUEBA
    │   │
    │   ▼
    │   [SISTEMA] Genera factura automática
    │       │   ├── Horas reales × tarifa del contrato
    │       │   ├── Materiales utilizados × precio de venta
    │       │   ├── Recargos aplicables
    │       │   ├── Descuentos del contrato
    │       │   └── Impuestos
    │       │
    │       ▼
    │   [SISTEMA] Estado = FACTURADA
    │       │   └── Envía factura por email
    │       │
    │       ▼
    │   [CLIENTE] Realiza pago
    │       │   ├── Tarjeta de crédito/débito
    │       │   ├── Transferencia bancaria
    │       │   └── Cargo a cuenta corriente (si tiene crédito)
    │       │
    │       ▼
    │   [SISTEMA] Confirma pago
    │       │
    │       ▼
    │   [SISTEMA] Solicita calificación al cliente
    │       │   ├── Puntuación general (1-5 estrellas)
    │       │   ├── Puntualidad (1-5)
    │       │   ├── Calidad del trabajo (1-5)
    │       │   ├── Profesionalismo (1-5)
    │       │   └── Comentario (opcional)
    │       │
    │       ▼
    │   [SISTEMA] Estado = CERRADA
    │       └── Actualiza métricas del técnico
    │
    │
    └── REPORTA PROBLEMA
        │
        ▼
        [SUPERVISOR] Evalúa reclamo
            │
            ├── Re-trabajo necesario → Nueva orden vinculada
            │
            └── Disputa → Proceso de resolución
```

### 5.4 Flujo: Trabajo Adicional No Cotizado

```
[TÉCNICO] Detecta trabajo adicional necesario
    │
    │   El trabajo adicional excede el presupuesto en más del 20%
    │   O requiere materiales no contemplados
    │
    ▼
[TÉCNICO] Documenta hallazgo
    ├── Descripción del trabajo adicional
    ├── Fotos de evidencia
    ├── Estimación de horas adicionales
    └── Materiales requeridos
    │
    ▼
[SISTEMA] Verifica límite de auto-aprobación del cliente
    │
    ├── Monto adicional ≤ Límite auto-aprobación
    │   │
    │   └── [SISTEMA] Aprueba automáticamente
    │       └── [TÉCNICO] Continúa trabajo
    │
    └── Monto adicional > Límite auto-aprobación
        │
        ▼
        [SISTEMA] Estado = PENDIENTE (esperando_aprobacion)
            │
            ▼
        [SISTEMA] Notifica al cliente (email + push + SMS)
            │   ├── Detalle del trabajo adicional
            │   ├── Monto adicional estimado
            │   └── Opciones: Aprobar / Rechazar / Llamar
            │
            ▼
        [CLIENTE] Decide
            │
            ├── APRUEBA
            │   ├── [SISTEMA] Estado = EN PROCESO
            │   └── [TÉCNICO] Continúa trabajo
            │
            ├── RECHAZA
            │   ├── [TÉCNICO] Completa solo trabajo original
            │   └── [SISTEMA] Programa nuevo servicio (opcional)
            │
            └── NO RESPONDE en tiempo límite
                │
                ├── Si URGENTE: 30 minutos
                ├── Si NORMAL: 4 horas
                │
                └── [TÉCNICO] Decide según política:
                    ├── Completar trabajo original y retirarse
                    └── Esperar (horas de espera se facturan al 50%)
```

### 5.5 Flujo: Pausas y Esperas

```
[TÉCNICO] No puede continuar el trabajo
    │
    ▼
[TÉCNICO] Selecciona motivo de pausa:
    │
    ├── ESPERANDO REPUESTO
    │   │
    │   ├── [TÉCNICO] Especifica material necesario
    │   ├── [SISTEMA] Verifica stock en almacén/otros vehículos
    │   │
    │   ├── Si hay stock disponible:
    │   │   ├── Se coordina entrega
    │   │   └── ETA de disponibilidad
    │   │
    │   └── Si no hay stock:
    │       ├── [SISTEMA] Genera orden de compra
    │       ├── ETA del proveedor
    │       └── Se reprograma visita
    │
    ├── ESPERANDO APROBACIÓN
    │   └── Ver flujo 5.4
    │
    ├── ESPERANDO CLIENTE
    │   │   (cliente no está, área no disponible, etc.)
    │   │
    │   ├── [TÉCNICO] Registra motivo y evidencia
    │   ├── [SISTEMA] Notifica al cliente
    │   │
    │   ├── Si se resuelve en < 30 min:
    │   │   └── Continúa trabajo (tiempo de espera se factura)
    │   │
    │   └── Si no se resuelve:
    │       ├── [TÉCNICO] Se retira
    │       ├── Visita fallida se factura según contrato
    │       └── Se reprograma
    │
    └── EMERGENCIA PERSONAL
        ├── [TÉCNICO] Reporta situación
        ├── [SUPERVISOR] Reasigna a otro técnico
        └── Coordinación de continuidad

REGLAS DE PAUSA:
├── Pausa > 24 horas requiere justificación del supervisor
├── Pausa > 48 horas requiere aprobación del administrador
└── Alertas automáticas a supervisores por pausas prolongadas
```

### 5.6 Flujo: Emergencias Sin Cotización Previa

```
[CLIENTE] Crea solicitud con prioridad EMERGENCIA
    │
    ▼
[SISTEMA] Validaciones:
    ├── Cliente tiene contrato activo con cláusula de emergencias
    └── Límite de emergencia definido en contrato
    │
    ▼
[SISTEMA] Acciones automáticas:
    ├── Alerta URGENTE a TODOS los supervisores (push + SMS)
    ├── Alerta al administrador
    └── Busca técnico más cercano y disponible
    │
    ▼
[SISTEMA] Asignación automática
    │   Criterios priorizados:
    │   1. Disponibilidad inmediata
    │   2. Distancia al sitio
    │   3. Especialización
    │   4. Último en atender emergencia (balance de carga)
    │
    ▼
[TÉCNICO] Recibe alerta de emergencia
    │   └── Debe responder en < 5 minutos
    │       ├── ACEPTA → Inicia inmediatamente
    │       └── NO RESPONDE → Se asigna al siguiente
    │
    ▼
[TÉCNICO] Ejecuta servicio de emergencia
    │
    │   Autorización automática:
    │   ├── Hasta el límite definido en contrato del cliente
    │   ├── Se aplica tarifa de emergencia (+100%)
    │   └── Materiales se autorizan hasta límite
    │
    ▼
[SISTEMA] Facturación post-servicio
    │   ├── Horas reales × tarifa emergencia
    │   ├── Materiales utilizados
    │   └── Cliente aprueba dentro de 48 horas
    │       └── Si no aprueba, se escala a disputa

LÍMITES DE EMERGENCIA (ejemplo):
├── Cliente Premium: Hasta $2,000 sin aprobación previa
├── Cliente Estándar: Hasta $500 sin aprobación previa
└── Cliente Sin Contrato: Requiere pago anticipado o garantía
```

---

## 6. Módulo de Cotizaciones y Facturación

### 6.1 Generación de Cotizaciones

**Estructura de Cotización:**

```
COTIZACIÓN #COT-XXXXX
│
├── INFORMACIÓN GENERAL
│   ├── Fecha de emisión
│   ├── Validez (15 días por defecto)
│   ├── Cliente
│   ├── Ubicación del servicio
│   └── Referencia a solicitud #ORD-XXXXX
│
├── DESCRIPCIÓN DEL TRABAJO
│   ├── Diagnóstico/problema identificado
│   ├── Solución propuesta
│   └── Alcance del trabajo
│
├── DESGLOSE DE COSTOS
│   │
│   ├── MANO DE OBRA
│   │   ├── Horas estimadas: X
│   │   ├── Tarifa horaria: $XX (según contrato)
│   │   ├── Recargos aplicables: +XX%
│   │   └── Subtotal mano de obra: $XXX
│   │
│   ├── MATERIALES
│   │   ├── Material 1: cantidad × precio = $XX
│   │   ├── Material 2: cantidad × precio = $XX
│   │   └── Subtotal materiales: $XXX
│   │
│   ├── OTROS COSTOS
│   │   ├── Desplazamiento: $XX
│   │   └── Otros (especificar): $XX
│   │
│   ├── SUBTOTAL: $XXXX
│   ├── Descuento (si aplica): -$XX
│   ├── SUBTOTAL CON DESCUENTO: $XXXX
│   ├── IVA (XX%): $XXX
│   └── TOTAL: $XXXX
│
├── TÉRMINOS Y CONDICIONES
│   ├── Forma de pago
│   ├── Garantía del trabajo
│   └── Exclusiones
│
└── ACCIONES
    ├── [Aprobar cotización]
    ├── [Solicitar modificación]
    └── [Rechazar]
```

### 6.2 Estructura de Factura

```
FACTURA #FAC-XXXXX
│
├── DATOS DEL EMISOR
│   ├── Razón social
│   ├── RUC/NIF
│   ├── Dirección
│   └── Datos de contacto
│
├── DATOS DEL CLIENTE
│   ├── Razón social
│   ├── RUC/NIF
│   └── Dirección fiscal
│
├── DETALLES DE FACTURACIÓN
│   ├── Número de factura
│   ├── Fecha de emisión
│   ├── Fecha de vencimiento
│   ├── Condiciones de pago
│   └── Referencia(s) de orden(es)
│
├── DETALLE DE SERVICIOS
│   │
│   │   Para cada orden incluida:
│   │
│   ├── ORDEN #ORD-XXXXX
│   │   ├── Fecha del servicio
│   │   ├── Ubicación
│   │   ├── Técnico: Nombre
│   │   │
│   │   ├── Mano de obra:
│   │   │   ├── Horas normales: X × $XX = $XXX
│   │   │   ├── Horas extra: X × $XX = $XXX
│   │   │   └── Recargos: $XX
│   │   │
│   │   ├── Materiales:
│   │   │   ├── Item 1: X × $XX = $XXX
│   │   │   └── Item 2: X × $XX = $XXX
│   │   │
│   │   └── Subtotal orden: $XXXX
│   │
│   └── ORDEN #ORD-XXXXX (si factura consolidada)
│       └── ...
│
├── RESUMEN
│   ├── Subtotal servicios: $XXXX
│   ├── Descuentos: -$XX
│   ├── Subtotal: $XXXX
│   ├── IVA (XX%): $XXX
│   └── TOTAL A PAGAR: $XXXX
│
└── INFORMACIÓN DE PAGO
    ├── Métodos disponibles
    ├── Datos bancarios
    └── Link de pago en línea
```

### 6.3 Control de Rentabilidad por Orden

**Cálculo de Costos Internos (no visible para cliente):**

```
ANÁLISIS DE RENTABILIDAD - ORDEN #ORD-XXXXX
│
├── INGRESOS (Facturado)
│   ├── Mano de obra facturada: $XXX
│   ├── Materiales facturados: $XXX
│   ├── Otros conceptos: $XX
│   └── TOTAL FACTURADO: $XXXX
│
├── COSTOS DIRECTOS
│   │
│   ├── Costo del técnico:
│   │   ├── Horas trabajadas: X
│   │   ├── Costo hora técnico: $XX
│   │   │   (Salario mensual + cargas sociales) / horas productivas mes
│   │   └── Subtotal: $XXX
│   │
│   ├── Costo de materiales:
│   │   ├── Material 1: costo compra × cantidad = $XX
│   │   └── Material 2: costo compra × cantidad = $XX
│   │   └── Subtotal: $XXX
│   │
│   ├── Costo de desplazamiento:
│   │   ├── Km recorridos: XX
│   │   ├── Costo por km: $X.XX
│   │   └── Subtotal: $XX
│   │
│   └── TOTAL COSTOS DIRECTOS: $XXX
│
├── COSTOS INDIRECTOS (Overhead)
│   ├── % de overhead asignado: XX%
│   └── Overhead de la orden: $XX
│
├── COSTO TOTAL: $XXX
│
├── MARGEN BRUTO: $XXX
│   └── % Margen: XX%
│
└── INDICADORES
    ├── ✅ Margen > 40%: Rentable
    ├── ⚠️ Margen 25-40%: Revisar
    └── ❌ Margen < 25%: No rentable - investigar
```

---

## 7. Módulo de Gestión de Técnicos (RRHH)

### 7.1 Gestión de Plantilla

**Funcionalidades:**

```
GESTIÓN DE TÉCNICOS
│
├── ADMINISTRACIÓN DE PERSONAL
│   ├── Alta/baja de técnicos
│   ├── Gestión de contratos laborales
│   ├── Actualización de datos personales
│   ├── Gestión de documentación
│   └── Historial del empleado
│
├── COMPETENCIAS Y CAPACITACIÓN
│   ├── Registro de especialidades
│   ├── Gestión de certificaciones
│   │   ├── Certificación activa
│   │   ├── Fecha de vencimiento
│   │   └── Alertas de renovación
│   ├── Plan de capacitación
│   ├── Registro de cursos completados
│   └── Evaluación de competencias
│
├── DISPONIBILIDAD Y HORARIOS
│   ├── Horario laboral estándar
│   ├── Gestión de turnos
│   ├── Calendario de vacaciones
│   ├── Registro de permisos
│   ├── Control de ausencias
│   └── Disponibilidad para guardias/emergencias
│
├── RECURSOS ASIGNADOS
│   ├── Vehículo asignado
│   │   ├── Placa
│   │   ├── Kilometraje
│   │   └── Mantenimientos programados
│   ├── Herramientas
│   ├── Equipos de medición
│   ├── Inventario móvil
│   └── Dispositivos (teléfono, tablet)
│
└── NÓMINA Y COMPENSACIÓN
    ├── Salario base
    ├── Cálculo de horas extra
    ├── Bonificaciones por desempeño
    ├── Viáticos y reembolsos
    └── Integración con sistema de nómina
```

### 7.2 Control de Horas Trabajadas

```
REGISTRO DE HORAS - TÉCNICO: [Nombre]
│
├── RESUMEN DEL PERÍODO (Mes)
│   ├── Horas contratadas: 176
│   ├── Horas trabajadas: 182
│   │   ├── Horas normales: 168
│   │   ├── Horas extra diurnas: 8
│   │   └── Horas extra nocturnas: 6
│   ├── Horas productivas (en órdenes): 145
│   ├── Horas no productivas: 37
│   │   ├── Capacitación: 8
│   │   ├── Desplazamiento: 20
│   │   ├── Administrativo: 5
│   │   └── Esperas: 4
│   └── Tasa de utilización: 79.7%
│
├── DETALLE POR DÍA
│   │
│   ├── Lunes 01/XX
│   │   ├── Entrada: 08:00
│   │   ├── Salida: 17:30
│   │   ├── Total: 9.5 horas
│   │   ├── Órdenes atendidas: 3
│   │   └── Horas facturables: 7.5
│   │
│   └── ...
│
├── DETALLE POR ORDEN
│   │
│   ├── ORD-12345
│   │   ├── Check-in: 09:15
│   │   ├── Check-out: 11:45
│   │   ├── Tiempo total: 2.5 horas
│   │   └── Tiempo facturable: 2.5 horas
│   │
│   └── ...
│
└── VALIDACIÓN
    ├── Técnico confirma horas
    ├── Supervisor aprueba
    └── Listo para nómina
```

### 7.3 Evaluación de Desempeño

**KPIs del Técnico:**

| KPI | Cálculo | Objetivo | Peso |
|-----|---------|----------|------|
| Órdenes completadas | Total órdenes/mes | ≥20 | 15% |
| Tasa de utilización | Horas productivas/disponibles | ≥75% | 20% |
| Cumplimiento de SLA | Órdenes en tiempo/total | ≥95% | 20% |
| Calificación promedio | Promedio de ratings | ≥4.5/5 | 20% |
| Tasa de re-trabajo | Órdenes reabiertas/total | ≤3% | 15% |
| First Time Fix Rate | Resueltas en 1ra visita/total | ≥85% | 10% |

**Score de Desempeño:**
```
Score = Σ (Resultado_KPI × Peso_KPI)

Clasificación:
├── ≥90%: Excelente - Candidato a bonificación
├── 75-89%: Bueno - Cumple expectativas
├── 60-74%: Regular - Plan de mejora
└── <60%: Bajo - Acción correctiva requerida
```

---

## 8. Módulo de Garantías (NUEVO)

### 8.1 Política de Garantías

```
GARANTÍAS POR TIPO DE SERVICIO
│
├── REPARACIÓN
│   ├── Período: 30 días
│   ├── Cobertura: Misma falla reparada
│   └── Exclusiones: Mal uso, daño físico
│
├── MANTENIMIENTO PREVENTIVO
│   ├── Período: 15 días
│   ├── Cobertura: Trabajos realizados
│   └── Exclusiones: Fallas no relacionadas
│
├── INSTALACIÓN
│   ├── Período: 90 días
│   ├── Cobertura: Instalación y configuración
│   └── Exclusiones: Equipos defectuosos de fábrica
│
└── DIAGNÓSTICO
    ├── Período: 7 días
    ├── Cobertura: Diagnóstico erróneo
    └── Exclusiones: Información incompleta del cliente
```

### 8.2 Proceso de Reclamo de Garantía

```
1. CLIENTE reporta problema recurrente
   ├── Indica orden original
   ├── Describe problema actual
   └── Adjunta evidencia

2. SISTEMA verifica elegibilidad
   ├── Orden dentro de período de garantía
   ├── Problema relacionado con trabajo original
   └── Sin exclusiones aplicables

3. Si ELEGIBLE:
   ├── Se crea orden vinculada de garantía
   ├── Se asigna preferentemente al técnico original
   ├── Trabajo sin costo para cliente
   └── Se registra en historial del técnico

4. Si NO ELEGIBLE:
   ├── Se notifica al cliente con motivo
   ├── Se ofrece crear orden regular
   └── Cliente puede disputar decisión

5. POST-SERVICIO de garantía:
   ├── Se registra causa del re-trabajo
   ├── Se actualiza tasa de re-trabajo del técnico
   └── Se analiza para mejora de procesos
```

---

## 9. Módulo de Materiales e Inventario (Simplificado)

### 9.1 Catálogo de Materiales

```
CATÁLOGO DE MATERIALES
│
├── Por cada material:
│   ├── Código/SKU
│   ├── Descripción
│   ├── Categoría
│   ├── Unidad de medida
│   ├── Precio de compra
│   ├── Precio de venta (markup automático)
│   ├── Proveedor(es)
│   └── Tiempo de reposición
│
├── CATEGORÍAS
│   ├── Repuestos eléctricos
│   ├── Repuestos mecánicos
│   ├── Repuestos electrónicos
│   ├── Consumibles
│   ├── Herramientas descartables
│   └── Otros
│
└── CONFIGURACIÓN
    ├── Markup por categoría (ej: 40%)
    ├── Política de redondeo
    └── Impuestos aplicables
```

### 9.2 Registro de Uso en Órdenes

```
USO DE MATERIALES EN ORDEN #ORD-XXXXX
│
├── TÉCNICO selecciona de catálogo:
│   │
│   ├── Material: Rodamiento SKF 6205
│   │   ├── Cantidad: 1
│   │   ├── Precio venta: $45.00
│   │   └── (Costo interno: $32.00)
│   │
│   └── Material: Grasa industrial
│       ├── Cantidad: 0.5 kg
│       ├── Precio venta: $12.50
│       └── (Costo interno: $8.00)
│
├── SUBTOTAL MATERIALES: $57.50
│   └── (Costo interno: $40.00, Margen: $17.50)
│
└── Materiales se suman automáticamente a factura
```

### 9.3 Control de Stock (Fase 2)

```
ALMACENES
│
├── ALMACÉN CENTRAL
│   ├── Ubicación física
│   ├── Stock de todos los materiales
│   └── Alertas de stock mínimo
│
└── INVENTARIOS MÓVILES (por técnico/vehículo)
    ├── Stock asignado al vehículo
    ├── Consumos se descuentan automáticamente
    ├── Solicitud de reposición
    └── Reconciliación periódica
```

---

## 10. Módulo de Comunicación y Notificaciones

### 10.1 Canales de Comunicación

| Canal | Uso | Configuración |
|-------|-----|---------------|
| **In-App** | Notificaciones generales | Siempre activo |
| **Email** | Comunicaciones formales, facturas | Configurable |
| **SMS** | Alertas urgentes, OTP | Solo críticos |
| **Push** | Actualizaciones en tiempo real | App móvil |
| **WhatsApp** | Comunicación preferencial (opcional) | Si está habilitado |

### 10.2 Matriz de Notificaciones

| Evento | Cliente | Técnico | Supervisor | Admin |
|--------|:-------:|:-------:|:----------:|:-----:|
| Nueva solicitud creada | ✓ | - | ✓ | - |
| Cotización generada | ✓ Email | - | ✓ | - |
| Cotización aprobada | ✓ | ✓ Push | ✓ | - |
| Técnico asignado | ✓ | ✓ Push+SMS | ✓ | - |
| Técnico en camino | ✓ Push | - | - | - |
| Técnico en sitio | ✓ Push | - | ✓ | - |
| Solicitud de aprobación adicional | ✓ Push+SMS+Email | - | ✓ | - |
| Orden completada | ✓ Email | - | ✓ | - |
| Factura generada | ✓ Email | - | - | ✓ |
| Pago recibido | ✓ | ✓ | ✓ | ✓ |
| SLA en riesgo | - | ✓ Push | ✓ Push+SMS | ✓ |
| Emergencia nueva | - | ✓ Push+SMS | ✓ Push+SMS | ✓ SMS |
| Calificación recibida | - | ✓ | ✓ | - |

### 10.3 Chat Contextual

```
CHAT DE ORDEN #ORD-XXXXX
│
├── Participantes:
│   ├── Cliente (contacto en sitio)
│   ├── Técnico asignado
│   └── Supervisor (puede intervenir)
│
├── Funcionalidades:
│   ├── Mensajes de texto
│   ├── Compartir fotos
│   ├── Compartir ubicación
│   ├── Notas de voz
│   └── Estados de mensaje (enviado/recibido/leído)
│
├── Reglas:
│   ├── Chat solo activo mientras orden está abierta
│   ├── Historial disponible 90 días después del cierre
│   └── Supervisor puede ver todos los chats de su equipo
│
└── Integración:
    └── Mensajes importantes se registran en timeline de la orden
```

---

## 11. Módulo de Reportes y Analítica

### 11.1 Dashboards por Rol

**Dashboard Ejecutivo (Admin):**

```
┌─────────────────────────────────────────────────────────────────┐
│  DASHBOARD EJECUTIVO - [Mes/Año]                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  INGRESOS                          OPERACIONES                  │
│  ────────────                      ────────────                 │
│  Facturado: $125,450 ↑12%          Órdenes: 243 ↑8%            │
│  Cobrado: $98,200                  Completadas: 228 (93.8%)    │
│  Por cobrar: $45,800               Pendientes: 15              │
│  Margen promedio: 42%              Canceladas: 0               │
│                                                                 │
│  CLIENTES                          TÉCNICOS                     │
│  ────────                          ────────                     │
│  Activos: 87 (+5 nuevos)           Plantilla: 24               │
│  Con órdenes este mes: 62          Activos hoy: 22             │
│  Satisfacción: 4.6/5 ↑0.1          Utilización: 78%            │
│  Churn: 2%                         Mejor: Juan P. (4.9★)       │
│                                                                 │
│  ALERTAS                                                        │
│  ────────                                                       │
│  ⚠️  3 facturas vencidas > 30 días ($12,450)                   │
│  ⚠️  2 técnicos con utilización < 60%                          │
│  ⚠️  1 contrato por renovar en 15 días                         │
│  ✅  SLA compliance: 97% (target >95%)                         │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  [Gráfico: Ingresos últimos 12 meses]                          │
│  [Gráfico: Órdenes por tipo de servicio]                       │
│  [Gráfico: Rentabilidad por cliente]                           │
└─────────────────────────────────────────────────────────────────┘
```

**Dashboard Operativo (Supervisor):**

```
┌─────────────────────────────────────────────────────────────────┐
│  PANEL DE CONTROL OPERATIVO - [Fecha]                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  HOY                               SEMANA                       │
│  ────                              ──────                       │
│  Órdenes programadas: 18           Total: 85                    │
│  En proceso: 6                     Completadas: 72              │
│  Completadas: 8                    Pendientes: 8                │
│  Pendientes: 4                     SLA cumplido: 96%            │
│                                                                 │
│  TÉCNICOS EN CAMPO                                              │
│  ─────────────────                                              │
│  [Mapa con ubicación en tiempo real de técnicos]               │
│                                                                 │
│  👤 Juan P. - En sitio (ORD-1234) - Cliente ABC                │
│  👤 María L. - En camino (ORD-1235) - ETA 15 min               │
│  👤 Carlos R. - Disponible - Zona Norte                        │
│  👤 Ana S. - Almuerzo hasta 14:00                              │
│                                                                 │
│  COLA DE ASIGNACIÓN                                             │
│  ─────────────────                                              │
│  🔴 ORD-1240 - EMERGENCIA - Sin asignar (5 min)                │
│  🟡 ORD-1238 - Urgente - Sin asignar (45 min)                  │
│  🟢 ORD-1236 - Normal - Programada para mañana                 │
│                                                                 │
│  ALERTAS SLA                                                    │
│  ──────────                                                     │
│  ⚠️ ORD-1232 - 80% del tiempo consumido                        │
│  ⚠️ ORD-1228 - Pendiente aprobación > 2 horas                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 11.2 KPIs del Negocio

**Métricas Operativas:**

| KPI | Descripción | Fórmula | Target |
|-----|-------------|---------|--------|
| Tiempo primera respuesta | Tiempo hasta primera acción | Promedio(1ra_acción - creación) | <30 min |
| Tiempo de asignación | Tiempo hasta asignar técnico | Promedio(asignación - creación) | <1 hora |
| Tiempo en sitio | Tiempo hasta llegada del técnico | Promedio(check_in - creación) | Según SLA |
| Tiempo de resolución | Tiempo total de resolución | Promedio(completada - creación) | Según SLA |
| SLA Compliance | % órdenes dentro de SLA | (Órdenes_en_SLA / Total) × 100 | >95% |
| First Time Fix Rate | % resueltas en primera visita | (Sin_revisita / Total) × 100 | >85% |
| Tasa de utilización | % tiempo productivo | (Horas_productivas / Disponibles) × 100 | >75% |

**Métricas de Calidad:**

| KPI | Descripción | Fórmula | Target |
|-----|-------------|---------|--------|
| CSAT | Satisfacción del cliente | Promedio de calificaciones | >4.5/5 |
| NPS | Net Promoter Score | %Promotores - %Detractores | >50 |
| Tasa de re-trabajo | % órdenes reabiertas | (Reabiertas / Total) × 100 | <3% |
| Tasa de reclamos | % con reclamo formal | (Reclamos / Total) × 100 | <1% |
| Tasa de garantías | % reclamos de garantía | (Garantías / Total) × 100 | <2% |

**Métricas Financieras:**

| KPI | Descripción | Fórmula | Target |
|-----|-------------|---------|--------|
| Ingresos mensuales | Total facturado | Suma(facturas_emitidas) | Crecimiento |
| Margen bruto | Rentabilidad | ((Ingresos - Costos) / Ingresos) × 100 | >40% |
| Valor promedio de orden | Ticket promedio | Ingresos / Número_órdenes | >$400 |
| DSO | Días para cobrar | (Cuentas_cobrar / Ventas_diarias) | <30 días |
| Tasa de cobro | % cobrado | (Cobrado / Facturado) × 100 | >95% |
| Ingreso por técnico | Productividad | Ingresos / Número_técnicos | >$5k/mes |

### 11.3 Reportes Disponibles

| Reporte | Frecuencia | Destinatarios |
|---------|------------|---------------|
| Resumen diario de operaciones | Diario 8 AM | Supervisores |
| Estado de órdenes pendientes | Diario 8 AM | Supervisores |
| Desempeño semanal de técnicos | Lunes 9 AM | Supervisores, Admin |
| Análisis de SLA semanal | Lunes 9 AM | Admin |
| Facturación del mes | Día 1 | Admin, Finanzas |
| Cuentas por cobrar | Semanal | Finanzas |
| Rentabilidad por cliente | Mensual | Admin |
| Rentabilidad por servicio | Mensual | Admin |
| Análisis de churn | Mensual | Admin, Comercial |
| Proyección de demanda | Mensual | Admin, Operaciones |

---

# PARTE III: ESPECIFICACIÓN TÉCNICA

## 12. Arquitectura del Sistema

### 12.1 Visión General

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTES                                 │
├──────────────────┬──────────────────┬───────────────────────────┤
│   Portal Web     │    App Móvil     │   API Integraciones       │
│   (React/Next)   │   (React Native) │   (REST/Webhooks)         │
└────────┬─────────┴────────┬─────────┴─────────────┬─────────────┘
         │                  │                       │
         └──────────────────┼───────────────────────┘
                            │
                   ┌────────▼────────┐
                   │   API Gateway   │
                   │   (Rate limit,  │
                   │    Auth, Log)   │
                   └────────┬────────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
┌────────▼────────┐ ┌───────▼───────┐ ┌───────▼───────┐
│ Auth Service    │ │ Order Service │ │ Notification  │
│ (JWT, 2FA)      │ │ (Core logic)  │ │ Service       │
└────────┬────────┘ └───────┬───────┘ └───────┬───────┘
         │                  │                  │
         │          ┌───────▼───────┐          │
         │          │ Billing       │          │
         │          │ Service       │          │
         │          └───────┬───────┘          │
         │                  │                  │
         └──────────────────┼──────────────────┘
                            │
                   ┌────────▼────────┐
                   │   PostgreSQL    │
                   │   (Principal)   │
                   └────────┬────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
       ┌──────▼──────┐ ┌────▼────┐ ┌──────▼──────┐
       │    Redis    │ │   S3    │ │ Elasticsearch│
       │   (Cache)   │ │ (Files) │ │  (Search)   │
       └─────────────┘ └─────────┘ └─────────────┘
```

### 12.2 Stack Tecnológico

| Capa | Tecnología | Justificación |
|------|------------|---------------|
| **Frontend Web** | React 18 + TypeScript + Vite | Rendimiento, tipado estricto |
| **UI Components** | Tailwind CSS + shadcn/ui | Profesional, personalizable |
| **Estado** | Zustand | Simple, eficiente |
| **App Móvil** | React Native + Expo | Código compartido, desarrollo rápido |
| **Backend** | Node.js + NestJS | Arquitectura modular, TypeScript |
| **Base de datos** | PostgreSQL 15 | Integridad, relaciones complejas |
| **Cache** | Redis 7 | Sesiones, colas, real-time |
| **Archivos** | AWS S3 / GCS | Escalable, económico |
| **Real-time** | Socket.io | WebSockets para ubicación y chat |
| **Mapas** | Mapbox GL / Google Maps | Tracking, rutas |
| **Pagos** | Stripe | Confiable, global |
| **Email** | SendGrid | Transaccional, templates |
| **SMS** | Twilio | Confiable, global |

### 12.3 Modelo de Datos Principal

```sql
-- USUARIOS Y AUTENTICACIÓN
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'supervisor', 'technician', 'client', 'hr', 'finance'),
    status ENUM('active', 'inactive', 'suspended'),
    two_factor_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- EMPRESAS CLIENTE
CREATE TABLE companies (
    id UUID PRIMARY KEY,
    legal_name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255),
    tax_id VARCHAR(50) UNIQUE NOT NULL,
    industry VARCHAR(100),
    logo_url VARCHAR(500),
    billing_address JSONB,
    status ENUM('prospect', 'active', 'inactive', 'suspended'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CONTACTOS DE EMPRESA
CREATE TABLE company_contacts (
    id UUID PRIMARY KEY,
    company_id UUID REFERENCES companies(id),
    user_id UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    position VARCHAR(100),
    phone VARCHAR(50),
    role ENUM('requester', 'approver', 'billing', 'admin'),
    approval_limit DECIMAL(10,2),
    is_primary BOOLEAN DEFAULT false
);

-- UBICACIONES DE CLIENTE
CREATE TABLE company_locations (
    id UUID PRIMARY KEY,
    company_id UUID REFERENCES companies(id),
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    coordinates POINT,
    access_instructions TEXT,
    operating_hours JSONB,
    site_contact_name VARCHAR(255),
    site_contact_phone VARCHAR(50)
);

-- CONTRATOS
CREATE TABLE contracts (
    id UUID PRIMARY KEY,
    company_id UUID REFERENCES companies(id),
    contract_type ENUM('on_demand', 'framework', 'preventive', 'dedicated'),
    start_date DATE NOT NULL,
    end_date DATE,
    payment_terms INTEGER DEFAULT 30, -- días
    auto_renewal BOOLEAN DEFAULT false,
    emergency_limit DECIMAL(10,2),
    auto_approve_limit DECIMAL(10,2),
    discount_percent DECIMAL(5,2) DEFAULT 0,
    status ENUM('draft', 'active', 'expired', 'terminated'),
    terms_document_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TARIFAS POR CONTRATO
CREATE TABLE contract_rates (
    id UUID PRIMARY KEY,
    contract_id UUID REFERENCES contracts(id),
    service_category_id UUID REFERENCES service_categories(id),
    hourly_rate DECIMAL(10,2) NOT NULL,
    night_multiplier DECIMAL(3,2) DEFAULT 1.50,
    weekend_multiplier DECIMAL(3,2) DEFAULT 1.30,
    holiday_multiplier DECIMAL(3,2) DEFAULT 1.50,
    emergency_multiplier DECIMAL(3,2) DEFAULT 2.00
);

-- SLAs POR CONTRATO
CREATE TABLE contract_slas (
    id UUID PRIMARY KEY,
    contract_id UUID REFERENCES contracts(id),
    priority ENUM('normal', 'urgent', 'emergency'),
    first_response_minutes INTEGER NOT NULL,
    on_site_minutes INTEGER NOT NULL,
    resolution_minutes INTEGER NOT NULL,
    penalty_percent DECIMAL(5,2) DEFAULT 0
);

-- TÉCNICOS
CREATE TABLE technicians (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    employee_code VARCHAR(50) UNIQUE,
    hire_date DATE NOT NULL,
    contract_type ENUM('permanent', 'temporary'),
    supervisor_id UUID REFERENCES technicians(id),
    status ENUM('active', 'vacation', 'sick_leave', 'terminated'),
    base_salary DECIMAL(10,2),
    hourly_cost DECIMAL(10,2), -- calculado
    coverage_zones JSONB,
    available_for_emergency BOOLEAN DEFAULT true
);

-- ESPECIALIDADES DE TÉCNICO
CREATE TABLE technician_specialties (
    id UUID PRIMARY KEY,
    technician_id UUID REFERENCES technicians(id),
    specialty ENUM('electronics', 'mechanics', 'electrical'),
    level ENUM('junior', 'semi_senior', 'senior'),
    certified BOOLEAN DEFAULT false
);

-- CERTIFICACIONES
CREATE TABLE technician_certifications (
    id UUID PRIMARY KEY,
    technician_id UUID REFERENCES technicians(id),
    certification_name VARCHAR(255) NOT NULL,
    issuing_authority VARCHAR(255),
    issue_date DATE,
    expiry_date DATE,
    document_url VARCHAR(500),
    status ENUM('active', 'expired', 'pending_renewal')
);

-- CATÁLOGO DE SERVICIOS
CREATE TABLE service_categories (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_id UUID REFERENCES service_categories(id),
    description TEXT,
    base_price DECIMAL(10,2),
    estimated_hours DECIMAL(4,2),
    warranty_days INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT true
);

-- ÓRDENES DE TRABAJO
CREATE TABLE work_orders (
    id UUID PRIMARY KEY,
    order_number VARCHAR(20) UNIQUE NOT NULL, -- ORD-XXXXX
    company_id UUID REFERENCES companies(id),
    location_id UUID REFERENCES company_locations(id),
    contract_id UUID REFERENCES contracts(id),
    service_category_id UUID REFERENCES service_categories(id),
    
    -- Descripción
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Prioridad y SLA
    priority ENUM('normal', 'urgent', 'emergency') DEFAULT 'normal',
    sla_first_response TIMESTAMP,
    sla_on_site TIMESTAMP,
    sla_resolution TIMESTAMP,
    
    -- Estados
    status ENUM('requested', 'scheduled', 'in_progress', 'pending', 'completed', 'invoiced', 'closed', 'cancelled'),
    sub_status VARCHAR(50), -- en_camino, en_sitio, esperando_aprobacion, etc.
    
    -- Asignación
    technician_id UUID REFERENCES technicians(id),
    assigned_at TIMESTAMP,
    accepted_at TIMESTAMP,
    
    -- Ejecución
    check_in_at TIMESTAMP,
    check_in_location POINT,
    check_out_at TIMESTAMP,
    check_out_location POINT,
    
    -- Financiero
    quoted_amount DECIMAL(10,2),
    final_amount DECIMAL(10,2),
    internal_cost DECIMAL(10,2),
    
    -- Contacto en sitio
    site_contact_name VARCHAR(255),
    site_contact_phone VARCHAR(50),
    
    -- Tracking
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    closed_at TIMESTAMP
);

-- COTIZACIONES
CREATE TABLE quotations (
    id UUID PRIMARY KEY,
    quotation_number VARCHAR(20) UNIQUE NOT NULL,
    work_order_id UUID REFERENCES work_orders(id),
    version INTEGER DEFAULT 1,
    
    labor_hours DECIMAL(4,2),
    labor_rate DECIMAL(10,2),
    labor_subtotal DECIMAL(10,2),
    
    materials_subtotal DECIMAL(10,2),
    other_costs DECIMAL(10,2),
    
    discount_percent DECIMAL(5,2),
    discount_amount DECIMAL(10,2),
    
    subtotal DECIMAL(10,2),
    tax_percent DECIMAL(5,2),
    tax_amount DECIMAL(10,2),
    total DECIMAL(10,2),
    
    valid_until DATE,
    notes TEXT,
    
    status ENUM('draft', 'sent', 'approved', 'rejected', 'expired'),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- MATERIALES EN COTIZACIÓN
CREATE TABLE quotation_materials (
    id UUID PRIMARY KEY,
    quotation_id UUID REFERENCES quotations(id),
    material_id UUID REFERENCES materials(id),
    description VARCHAR(255),
    quantity DECIMAL(10,2),
    unit_price DECIMAL(10,2),
    total DECIMAL(10,2)
);

-- HISTORIAL DE ORDEN (TIMELINE)
CREATE TABLE work_order_history (
    id UUID PRIMARY KEY,
    work_order_id UUID REFERENCES work_orders(id),
    action VARCHAR(100) NOT NULL,
    previous_status VARCHAR(50),
    new_status VARCHAR(50),
    notes TEXT,
    location POINT,
    performed_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- REPORTE DE TRABAJO
CREATE TABLE work_reports (
    id UUID PRIMARY KEY,
    work_order_id UUID REFERENCES work_orders(id),
    
    diagnosis TEXT,
    work_performed TEXT,
    recommendations TEXT,
    
    hours_normal DECIMAL(4,2),
    hours_overtime DECIMAL(4,2),
    hours_night DECIMAL(4,2),
    
    customer_signature_url VARCHAR(500),
    technician_signature_url VARCHAR(500),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- MATERIALES UTILIZADOS
CREATE TABLE work_order_materials (
    id UUID PRIMARY KEY,
    work_order_id UUID REFERENCES work_orders(id),
    material_id UUID REFERENCES materials(id),
    quantity DECIMAL(10,2),
    unit_cost DECIMAL(10,2), -- costo interno
    unit_price DECIMAL(10,2), -- precio de venta
    total_cost DECIMAL(10,2),
    total_price DECIMAL(10,2)
);

-- CATÁLOGO DE MATERIALES
CREATE TABLE materials (
    id UUID PRIMARY KEY,
    sku VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    unit VARCHAR(20),
    cost_price DECIMAL(10,2),
    sell_price DECIMAL(10,2),
    markup_percent DECIMAL(5,2),
    supplier VARCHAR(255),
    is_active BOOLEAN DEFAULT true
);

-- FACTURAS
CREATE TABLE invoices (
    id UUID PRIMARY KEY,
    invoice_number VARCHAR(20) UNIQUE NOT NULL,
    company_id UUID REFERENCES companies(id),
    contract_id UUID REFERENCES contracts(id),
    
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    
    subtotal DECIMAL(10,2),
    discount_amount DECIMAL(10,2),
    tax_amount DECIMAL(10,2),
    total DECIMAL(10,2),
    
    status ENUM('draft', 'sent', 'partially_paid', 'paid', 'overdue', 'cancelled'),
    
    pdf_url VARCHAR(500),
    xml_url VARCHAR(500),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP
);

-- ITEMS DE FACTURA
CREATE TABLE invoice_items (
    id UUID PRIMARY KEY,
    invoice_id UUID REFERENCES invoices(id),
    work_order_id UUID REFERENCES work_orders(id),
    description TEXT,
    quantity DECIMAL(10,2),
    unit_price DECIMAL(10,2),
    total DECIMAL(10,2)
);

-- PAGOS
CREATE TABLE payments (
    id UUID PRIMARY KEY,
    invoice_id UUID REFERENCES invoices(id),
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('credit_card', 'bank_transfer', 'cash', 'credit'),
    reference VARCHAR(255),
    payment_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CALIFICACIONES
CREATE TABLE ratings (
    id UUID PRIMARY KEY,
    work_order_id UUID REFERENCES work_orders(id),
    technician_id UUID REFERENCES technicians(id),
    rated_by UUID REFERENCES users(id),
    
    overall_score INTEGER CHECK (overall_score BETWEEN 1 AND 5),
    punctuality_score INTEGER CHECK (punctuality_score BETWEEN 1 AND 5),
    quality_score INTEGER CHECK (quality_score BETWEEN 1 AND 5),
    professionalism_score INTEGER CHECK (professionalism_score BETWEEN 1 AND 5),
    
    comment TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- GARANTÍAS
CREATE TABLE warranties (
    id UUID PRIMARY KEY,
    work_order_id UUID REFERENCES work_orders(id),
    warranty_days INTEGER NOT NULL,
    starts_at DATE NOT NULL,
    expires_at DATE NOT NULL,
    terms TEXT,
    status ENUM('active', 'expired', 'voided', 'claimed')
);

-- RECLAMOS DE GARANTÍA
CREATE TABLE warranty_claims (
    id UUID PRIMARY KEY,
    warranty_id UUID REFERENCES warranties(id),
    original_order_id UUID REFERENCES work_orders(id),
    new_order_id UUID REFERENCES work_orders(id),
    claim_date DATE NOT NULL,
    description TEXT,
    resolution TEXT,
    status ENUM('pending', 'approved', 'rejected', 'resolved'),
    resolved_at TIMESTAMP
);

-- MENSAJES DE CHAT
CREATE TABLE messages (
    id UUID PRIMARY KEY,
    work_order_id UUID REFERENCES work_orders(id),
    sender_id UUID REFERENCES users(id),
    message_type ENUM('text', 'image', 'location', 'voice'),
    content TEXT,
    media_url VARCHAR(500),
    location POINT,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- NOTIFICACIONES
CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    body TEXT,
    type VARCHAR(50),
    reference_type VARCHAR(50),
    reference_id UUID,
    channels JSONB, -- ['push', 'email', 'sms']
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ÍNDICES IMPORTANTES
CREATE INDEX idx_work_orders_status ON work_orders(status);
CREATE INDEX idx_work_orders_company ON work_orders(company_id);
CREATE INDEX idx_work_orders_technician ON work_orders(technician_id);
CREATE INDEX idx_work_orders_created ON work_orders(created_at);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_company ON invoices(company_id);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
```

---

## 13. API REST - Endpoints Principales

### 13.1 Autenticación

```
POST   /api/v1/auth/register          # Registro de usuario
POST   /api/v1/auth/login             # Inicio de sesión
POST   /api/v1/auth/logout            # Cierre de sesión
POST   /api/v1/auth/refresh           # Renovar token
POST   /api/v1/auth/forgot-password   # Solicitar reset
POST   /api/v1/auth/reset-password    # Cambiar contraseña
POST   /api/v1/auth/verify-2fa        # Verificar código 2FA
```

### 13.2 Órdenes de Trabajo

```
# CRUD básico
GET    /api/v1/orders                 # Listar órdenes (filtros, paginación)
POST   /api/v1/orders                 # Crear orden
GET    /api/v1/orders/:id             # Obtener orden
PUT    /api/v1/orders/:id             # Actualizar orden
DELETE /api/v1/orders/:id             # Cancelar orden

# Acciones de estado
POST   /api/v1/orders/:id/assign      # Asignar técnico
POST   /api/v1/orders/:id/accept      # Técnico acepta
POST   /api/v1/orders/:id/reject      # Técnico rechaza
POST   /api/v1/orders/:id/start       # Iniciar viaje
POST   /api/v1/orders/:id/check-in    # Llegada a sitio
POST   /api/v1/orders/:id/check-out   # Salida de sitio
POST   /api/v1/orders/:id/pause       # Pausar
POST   /api/v1/orders/:id/resume      # Reanudar
POST   /api/v1/orders/:id/complete    # Completar
POST   /api/v1/orders/:id/approve     # Cliente aprueba
POST   /api/v1/orders/:id/cancel      # Cancelar

# Relacionados
GET    /api/v1/orders/:id/history     # Timeline de la orden
GET    /api/v1/orders/:id/messages    # Chat de la orden
POST   /api/v1/orders/:id/messages    # Enviar mensaje
GET    /api/v1/orders/:id/attachments # Archivos adjuntos
POST   /api/v1/orders/:id/attachments # Subir archivo
```

### 13.3 Cotizaciones

```
GET    /api/v1/quotations             # Listar cotizaciones
POST   /api/v1/quotations             # Crear cotización
GET    /api/v1/quotations/:id         # Obtener cotización
PUT    /api/v1/quotations/:id         # Actualizar cotización
POST   /api/v1/quotations/:id/send    # Enviar al cliente
POST   /api/v1/quotations/:id/approve # Cliente aprueba
POST   /api/v1/quotations/:id/reject  # Cliente rechaza
GET    /api/v1/quotations/:id/pdf     # Descargar PDF
```

### 13.4 Facturación

```
GET    /api/v1/invoices               # Listar facturas
POST   /api/v1/invoices               # Generar factura
GET    /api/v1/invoices/:id           # Obtener factura
GET    /api/v1/invoices/:id/pdf       # Descargar PDF
POST   /api/v1/invoices/:id/send      # Enviar por email
POST   /api/v1/invoices/:id/cancel    # Anular factura

# Pagos
GET    /api/v1/payments               # Listar pagos
POST   /api/v1/payments               # Registrar pago
GET    /api/v1/payments/:id           # Obtener pago
POST   /api/v1/payments/webhook       # Webhook pasarela
```

### 13.5 Técnicos

```
GET    /api/v1/technicians            # Listar técnicos
GET    /api/v1/technicians/:id        # Obtener técnico
GET    /api/v1/technicians/:id/stats  # Estadísticas
GET    /api/v1/technicians/:id/orders # Órdenes del técnico
GET    /api/v1/technicians/available  # Técnicos disponibles
PUT    /api/v1/technicians/:id/location # Actualizar ubicación

# Solo admin/RRHH
POST   /api/v1/technicians            # Crear técnico
PUT    /api/v1/technicians/:id        # Actualizar técnico
DELETE /api/v1/technicians/:id        # Desactivar técnico
```

### 13.6 Clientes

```
GET    /api/v1/companies              # Listar empresas
POST   /api/v1/companies              # Crear empresa
GET    /api/v1/companies/:id          # Obtener empresa
PUT    /api/v1/companies/:id          # Actualizar empresa

# Ubicaciones
GET    /api/v1/companies/:id/locations
POST   /api/v1/companies/:id/locations
PUT    /api/v1/companies/:id/locations/:loc_id
DELETE /api/v1/companies/:id/locations/:loc_id

# Contratos
GET    /api/v1/companies/:id/contracts
POST   /api/v1/companies/:id/contracts
GET    /api/v1/contracts/:id
PUT    /api/v1/contracts/:id
```

### 13.7 Reportes

```
GET    /api/v1/reports/dashboard            # Dashboard según rol
GET    /api/v1/reports/orders               # Reporte de órdenes
GET    /api/v1/reports/financial            # Reporte financiero
GET    /api/v1/reports/technicians          # Desempeño técnicos
GET    /api/v1/reports/sla                  # Análisis de SLA
GET    /api/v1/reports/profitability        # Rentabilidad
GET    /api/v1/reports/customer-satisfaction # Satisfacción cliente
```

---

## 14. Seguridad

### 14.1 Autenticación y Autorización

```
SEGURIDAD DE AUTENTICACIÓN
│
├── JWT (JSON Web Tokens)
│   ├── Access token: 2 horas
│   ├── Refresh token: 7 días
│   ├── Rotación de refresh tokens
│   └── Blacklist de tokens revocados
│
├── Contraseñas
│   ├── Bcrypt con cost factor 12
│   ├── Mínimo 12 caracteres
│   ├── Política de complejidad
│   └── Historial de últimas 5
│
├── 2FA (Two-Factor Authentication)
│   ├── TOTP (Google Authenticator)
│   ├── SMS como backup
│   └── Códigos de recuperación
│
└── Control de Acceso (RBAC)
    ├── Roles predefinidos
    ├── Permisos granulares
    ├── Verificación en cada endpoint
    └── Logging de accesos
```

### 14.2 Protección de Datos

```
PROTECCIÓN DE DATOS
│
├── EN TRÁNSITO
│   ├── TLS 1.3 obligatorio
│   ├── HSTS habilitado
│   └── Certificate pinning (móvil)
│
├── EN REPOSO
│   ├── Encriptación de BD (AES-256)
│   ├── Encriptación de backups
│   └── Campos sensibles encriptados
│
├── PII (Datos Personales)
│   ├── Acceso restringido
│   ├── Auditoría de accesos
│   ├── Derecho al olvido
│   └── Exportación de datos
│
└── SECRETS
    ├── Variables de entorno
    ├── AWS Secrets Manager / Vault
    └── Rotación automática
```

### 14.3 Prevención de Ataques

```
MITIGACIONES DE SEGURIDAD
│
├── OWASP Top 10
│   ├── Injection: Prepared statements, ORM
│   ├── XSS: Sanitización, CSP headers
│   ├── CSRF: Tokens en formularios
│   ├── Auth: 2FA, bloqueo de cuentas
│   └── Rate limiting por IP/usuario
│
├── API Security
│   ├── Validación de inputs (Zod/Joi)
│   ├── Rate limiting (100 req/min)
│   ├── Request size limits
│   └── CORS configurado
│
└── Monitoreo
    ├── Logging de eventos de seguridad
    ├── Alertas de actividad anómala
    ├── Escaneo de vulnerabilidades
    └── Penetration testing anual
```

---

## 15. Plan de Implementación

### 15.1 Fase 1: MVP (Meses 1-3)

**Objetivo:** Sistema funcional con flujo completo básico

**Alcance:**
- Autenticación y usuarios (cliente, técnico, admin)
- Perfil de cliente con ubicaciones
- Perfil básico de técnico
- Catálogo de servicios simple
- Creación y gestión de órdenes (flujo simplificado)
- Asignación manual de técnicos
- Estados básicos de orden
- Facturación manual
- Dashboard simple
- Notificaciones por email

**Entregables:**
- Portal web para clientes
- App móvil para técnicos (básica)
- Panel de administración
- 10 clientes piloto
- 15 técnicos en el sistema

### 15.2 Fase 2: Optimización (Meses 4-6)

**Objetivo:** Automatizar procesos y mejorar experiencia

**Alcance:**
- Sistema de cotizaciones
- Asignación inteligente de técnicos
- Facturación automática
- Integración con pasarela de pagos
- Chat cliente-técnico
- Notificaciones push y SMS
- Tracking de ubicación en tiempo real
- Reportes operativos
- Sistema de calificaciones
- Contratos marco básicos

**Entregables:**
- 50 clientes activos
- 30 técnicos
- 500+ órdenes procesadas
- Integración Stripe

### 15.3 Fase 3: Escala (Meses 7-9)

**Objetivo:** Funcionalidades avanzadas y escalabilidad

**Alcance:**
- Gestión completa de contratos
- SLAs configurables con alertas
- Módulo de garantías
- Inventario básico de materiales
- Análisis de rentabilidad
- Gestión de técnicos (RRHH básico)
- Reportes avanzados
- API pública documentada
- Optimización de performance

**Entregables:**
- 150 clientes activos
- 60 técnicos
- 3,000+ órdenes procesadas
- API para integraciones

### 15.4 Fase 4: Enterprise (Meses 10-12)

**Objetivo:** Funcionalidades enterprise y consolidación

**Alcance:**
- SSO para clientes enterprise
- Webhooks para integraciones
- Control de costos y overhead
- Proyección de demanda
- App offline para técnicos
- Multi-zona horaria
- Auditoría completa
- Certificación de seguridad

**Entregables:**
- 300+ clientes
- 100+ técnicos
- 10,000+ órdenes procesadas
- Rentabilidad positiva

---

## 16. Reglas de Negocio Consolidadas

### 16.1 Reglas de Órdenes

| ID | Regla | Consecuencia |
|----|-------|--------------|
| RN-001 | Una orden no puede pasar a "EN_PROCESO" sin check-in geolocalizado | Sistema bloquea cambio de estado |
| RN-002 | Órdenes urgentes sin asignar en 30 min escalan a admin | Notificación automática |
| RN-003 | Órdenes de emergencia sin asignar en 10 min alertan a todos | SMS masivo a supervisores |
| RN-004 | Técnico no puede tener más de 3 órdenes "EN_PROCESO" simultáneas | Sistema no permite asignación |
| RN-005 | Orden en "PENDIENTE" más de 24h requiere justificación | Alerta a supervisor |
| RN-006 | Trabajo adicional >20% del presupuesto requiere aprobación | Pausa automática |
| RN-007 | No se puede facturar sin aprobación del cliente | Sistema bloquea |
| RN-008 | Emergencias nocturnas (22:00-06:00) tienen recargo 150% | Cálculo automático |

### 16.2 Reglas de Cotización y Facturación

| ID | Regla | Consecuencia |
|----|-------|--------------|
| RN-010 | Cotizaciones válidas por 15 días | Expiran automáticamente |
| RN-011 | Factura no puede modificarse una vez emitida | Solo anular y reemitir |
| RN-012 | Facturas vencen según contrato (default 30 días) | Alerta de vencimiento |
| RN-013 | Clientes con >3 facturas vencidas no pueden solicitar servicios | Bloqueo automático |
| RN-014 | Emergencias sin contrato requieren pago anticipado | Flujo de pago previo |
| RN-015 | Descuentos máximos según nivel de autorización | Validación en cotización |

### 16.3 Reglas de Técnicos

| ID | Regla | Consecuencia |
|----|-------|--------------|
| RN-020 | Técnico debe tener al menos una especialidad activa | No puede asignarse |
| RN-021 | Certificaciones vencidas inhabilitan especialidad | Alerta 30 días antes |
| RN-022 | Técnico en vacaciones no aparece en asignación | Filtro automático |
| RN-023 | Horas extra requieren autorización previa | Aprobación de supervisor |
| RN-024 | Tasa de re-trabajo >5% activa plan de mejora | Alerta a RRHH |

### 16.4 Reglas de Garantías

| ID | Regla | Consecuencia |
|----|-------|--------------|
| RN-030 | Garantía inicia al completar la orden | Cálculo automático |
| RN-031 | Reclamo de garantía crea orden vinculada sin costo | Factura $0 |
| RN-032 | Re-trabajo por garantía afecta métricas del técnico | Actualización automática |
| RN-033 | Garantía se anula si hay evidencia de mal uso | Requiere aprobación admin |

---

## 17. Glosario

| Término | Definición |
|---------|------------|
| **Orden de Trabajo** | Solicitud de servicio técnico con su ciclo de vida completo |
| **Check-in** | Registro de llegada del técnico al sitio con geolocalización |
| **Check-out** | Registro de salida del técnico del sitio |
| **SLA** | Service Level Agreement - Acuerdo de niveles de servicio |
| **First Time Fix Rate** | Porcentaje de órdenes resueltas en la primera visita |
| **Tasa de Utilización** | Porcentaje de horas productivas vs disponibles |
| **Contrato Marco** | Acuerdo con tarifas y condiciones pre-negociadas |
| **Re-trabajo** | Orden que debe atenderse nuevamente por la misma falla |
| **Overhead** | Costos indirectos asignados a cada orden |
| **Margen Bruto** | Diferencia entre facturado y costo total |
| **CSAT** | Customer Satisfaction Score - Calificación de satisfacción |
| **NPS** | Net Promoter Score - Índice de recomendación |
| **DSO** | Days Sales Outstanding - Días promedio de cobro |

---

## 18. Control de Versiones del Documento

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | Original | Documento inicial |
| 2.0 | Actual | Correcciones y mejoras: definición clara del modelo de negocio, módulo de contratos, simplificación de estados, flujos de emergencia, módulo de garantías, gestión de rentabilidad, módulo RRHH para técnicos |

---

*Documento generado como especificación técnica y funcional de TechOps 4.0*
*Versión corregida y mejorada*