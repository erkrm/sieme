# Plan de Desarrollo y Corrección (TechOps 4.0)

Este documento detalla los pasos necesarios para corregir el estado actual del proyecto y completar las funcionalidades faltantes, priorizando la estabilidad del sistema.

## FASE 1: REPARACIÓN CRÍTICA (Completado)
*Objetivo: Restaurar la funcionalidad de la base de datos y asegurar que el proyecto compile.*

- [x] **Restaurar `prisma/schema.prisma`**
    - [x] Crear el archivo con los modelos inferidos: `User`, `ClientProfile`, `TechnicianProfile`, `ManagerProfile`, `WorkOrder`, `Message`, `Notification`.
    - [x] Añadir modelos faltantes del Documento Maestro: `Asset`, `AssetLocation`, `Product`, `Warehouse`, `Stock`.
- [x] **Generar Cliente Prisma**
    - [x] Ejecutar `npx prisma generate` para actualizar los tipos de TypeScript.
- [x] **Sincronizar Base de Datos**
    - [x] Ejecutar `npx prisma db push` para actualizar la base de datos local SQLite.
    - [x] Verificar con `scripts/check-database-schema.ts`.

## FASE 2: NÚCLEO OPERATIVO (Backend & Modelos) (Completado)
*Objetivo: Completar la lógica de negocio esencial.*

- [x] **Gestión de Activos (Assets)**
    - [x] Crear API `POST /api/assets` (Crear activo).
    - [x] Crear API `GET /api/assets` (Listar activos).
    - [x] Implementar generación de código QR (backend o frontend).
- [x] **Gestión de Inventario**
    - [x] Crear API para Productos y Almacenes.
    - [x] Implementar lógica de descuento de stock al usar materiales en una Orden.

## FASE 3: INTERFAZ TÉCNICO (Frontend Mobile-First) (Completado)
*Objetivo: Dar herramientas a los operarios en campo.*

- [x] **Dashboard Técnico**
    - [x] Crear tarjeta de "Trabajo Actual" (Active Job).
    - [x] Mostrar lista de trabajos asignados ("Mis Trabajos").
- [x] **Detalle de Orden**
    - [x] Vista completa de la orden: Dirección, contacto, descripción.
    - [x] Botones de acción: "Iniciar Viaje", "Llegué", "Iniciar Trabajo", "Finalizar".
    - [x] Formulario de reporte: Notas finales y fotos.

## FASE 4: INTERFAZ ADMINISTRADOR (Dispatcher) (Completado)
*Objetivo: Control total de la operación.*

- [x] **Tablero de Despacho (Dispatch Board)**
    - [x] Integrar mapa (Mapbox/Google Maps).
    - [x] Mostrar marcadores de Técnicos y Órdenes pendientes.
    - [x] Lista lateral de órdenes sin asignar.
- [x] **Gestión de Usuarios**
    - [x] Tabla completa de usuarios con filtros.
    - [x] Modal para editar roles y perfiles.

## FASE 5: FUNCIONALIDADES AVANZADAS (Completado)
*Objetivo: Valor añadido y automatización.*

- [x] **PDFs Profesionales**
    - [x] Implementar generación de Reporte de Servicio (PDF) al finalizar orden.
    - [x] Implementar Factura preliminar.
- [x] **Geolocalización en Tiempo Real**
    - [x] Configurar WebSocket server (o servicio externo).
    - [x] Enviar coordenadas del técnico cada 30s.
    - [x] Actualizar mapa del Admin en vivo.
- [x] **Offline / PWA**
    - [x] Configurar `next-pwa`.
    - [x] Implementar Service Worker para cachear órdenes asignadas.

## FASE 6: REFINAMIENTO Y AUDITORÍA (Completado)
*Objetivo: Pulir la experiencia y el código.*

- [x] **Corrección Visual**
    - [x] Arreglar bug de superposición en menús desplegables (Dropdowns).
- [x] **Optimización Backend**
    - [x] Refactorizar APIs para evitar consultas N+1.
- [x] **Manejo de Errores**
    - [x] Implementar reversión de estado en fallos de asignación.

## FASE 7: MEJORAS BASADAS EN BRIEF (Nuevo)
*Objetivo: Alinear con la visión completa del negocio.*

- [ ] **Catálogo de Servicios**
    - [ ] Crear modelos `ServiceCategory` y `Service`.
    - [ ] Implementar API de gestión de servicios.
- [ ] **Sistema de Cotizaciones**
    - [ ] Crear modelo `Quotation`.
    - [ ] Implementar flujo de creación y aprobación.
- [ ] **Timeline Visual**
    - [ ] Crear componente de historial de orden en el detalle.
- [ ] **Centro de Notificaciones**
    - [ ] Crear interfaz de usuario para ver notificaciones.
