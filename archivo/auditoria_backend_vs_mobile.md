# Auditoría Backend vs App Móvil - Michicondrias

**Fecha:** 2026-06-13  
**Objetivo:** Identificar endpoints que el frontend móvil llama pero que no existen en el backend.

---

## Resumen Ejecutivo

| Categoría | Cantidad |
|-----------|----------|
| Endpoints móviles con backend OK | ~95 |
| **Endpoints móviles SIN backend** | **22** |
| Servicios backend SIN integración móvil | 8 |
| Servicios móviles con datos MOCK (sin API real) | 5 |

---

## 1. ENDPOINTS FALTANTES EN EL BACKEND

### 1.1 Servicio CORE (`/core/api/v1`)

| Método | Endpoint Móvil | Servicio Móvil | Estado |
|--------|---------------|----------------|--------|
| PATCH | `/users/{userId}` | adminUsers.ts:72 | **FALTA** - No existe endpoint PATCH para actualizar usuarios |
| GET | `/admin/system/settings` | system.ts:14 | **FALTA** - No existe módulo de system admin |
| PATCH | `/admin/system/settings` | system.ts:18 | **FALTA** - No existe módulo de system admin |
| POST | `/admin/system/database/sync` | system.ts:25 | **FALTA** - No existe endpoint de sync |
| POST | `/admin/system/cache/clear` | system.ts:31 | **FALTA** - No existe endpoint de cache |

**Nota sobre citas.ts:** El archivo `citas.ts` envía llamadas al servicio "core" (`/core/api/v1/appointments/`), pero las citas están definidas en el servicio "directorio". Esto es un **error de routing** - el frontend debería llamar a `directorio` en vez de `core`:

| Método | Endpoint Móvil (core) | Endpoint Real (directorio) | Servicio Móvil |
|--------|----------------------|---------------------------|----------------|
| POST | `/core/api/v1/appointments/` | `/directorio/api/v1/appointments/` | citas.ts:34 |
| GET | `/core/api/v1/appointments/me` | `/directorio/api/v1/appointments/me` | citas.ts:41 |
| PUT | `/core/api/v1/appointments/{id}` | `/directorio/api/v1/appointments/{id}` | citas.ts:45 |
| POST | `/core/api/v1/appointments/{id}/cancel` | `/directorio/api/v1/appointments/{id}/cancel` | citas.ts:52 |
| GET | `/core/api/v1/appointments/{id}` | (no existe GET by id) | citas.ts:58 |

---

### 1.2 Servicio PERDIDAS (`/perdidas/api/v1`)

| Método | Endpoint Móvil | Servicio Móvil | Estado |
|--------|---------------|----------------|--------|
| GET | `/reports/presigned-url` | perdidas.ts:56 | **FALTA** - No existe endpoint de presigned URL para reportes |
| POST | `/reports/{id}/resolve` | perdidas.ts:67 | **FALTA** - No existe endpoint para marcar reporte como resuelto |
| GET | `/places/presigned-url` | petfriendly.ts:36 | **FALTA** - No existe endpoint de presigned URL para lugares |

---

### 1.3 Servicio DIRECTORIO (`/directorio/api/v1`)

| Método | Endpoint Móvil | Servicio Móvil | Estado |
|--------|---------------|----------------|--------|
| GET | `/clinics/{id}/alerts/emergency` | alerts.ts:27 | **FALTA** - Solo existe `/clinics/{id}/alerts` genérico |
| GET | `/clinics/{id}/alerts/inventory` | alerts.ts:31 | **FALTA** - Solo existe `/clinics/{id}/alerts` genérico |
| GET | `/clinics/{id}/alerts/laboratory` | alerts.ts:35 | **FALTA** - Solo existe `/clinics/{id}/alerts` genérico |
| GET | `/clinics/{id}/metrics/revenue` | metrics.ts:40 | **FALTA** - Solo existen `/metrics/daily` y `/metrics/weekly` |
| GET | `/clinics/{id}/metrics/occupancy` | metrics.ts:44 | **FALTA** - No existe endpoint dedicado (viene en /metrics/daily) |
| GET | `/appointments/{id}` | citas.ts:58 | **FALTA** - No existe GET de cita individual |

---

### 1.4 Servicio ECOMMERCE (`/ecommerce/api/v1`)

| Método | Endpoint Móvil | Servicio Móvil | Estado |
|--------|---------------|----------------|--------|
| GET | `/products/seller/me` | ecommerce.ts:75 | **FALTA** - No existe endpoint de productos del vendedor |
| PUT | `/products/{id}` | ecommerce.ts:90 | **FALTA** - No existe PUT para actualizar productos |
| DELETE | `/products/{id}` | ecommerce.ts:97 | **FALTA** - Solo existe DELETE admin (reject) |
| GET | `/orders/seller/me` | ecommerce.ts:120 | **FALTA** - No existe endpoint de órdenes del vendedor |
| PATCH | `/orders/{id}/status` | ecommerce.ts:124 | **FALTA** - Solo existe `/orders/admin/{id}/status` (requiere admin) |

---

## 2. SERVICIOS BACKEND SIN INTEGRACIÓN MÓVIL

Estos microservicios tienen backend implementado pero **ningún archivo de servicio en la app móvil**:

| Servicio Backend | Prefijo | Funcionalidad |
|-----------------|---------|---------------|
| michicondrias_aseguradoras | `/aseguradoras/api/v1/insurance` | Seguros de mascotas |
| michicondrias_entrenadores | `/entrenadores/api/v1/training` | Entrenamiento de mascotas |
| michicondrias_establecimientos | `/establecimientos/api/v1/venues` | Establecimientos/ venues |
| michicondrias_estilistas | `/estilistas/api/v1/grooming` | Estética/ grooming |
| michicondrias_funeraria | `/funeraria/api/v1/funerary` | Servicios funerarios |
| michicondrias_laboratorio | `/laboratorio/api/v1/labs` | Laboratorios |
| michicondrias_patrocinadores | `/patrocinadores/api/v1/sponsors` | Patrocinadores |
| michicondrias_transportistas | `/transportistas/api/v1/rides` | Transporte de mascotas |

---

## 3. SERVICIOS MÓVILES CON DATOS MOCK (sin API real)

Estos servicios devuelven datos hardcoded en lugar de llamar al backend:

| Servicio Móvil | Función Mock | Línea |
|---------------|-------------|-------|
| alerts.ts | `getClinicAlerts()` | alerts.ts:23 |
| inventory.ts | `getClinicInventory()` | inventory.ts:37 |
| inventory.ts | `getCriticalInventory()` | inventory.ts:41 |
| laboratory.ts | `getClinicLabTests()` | laboratory.ts:30 |
| patients.ts | `getCriticalPatients()` | patients.ts:24 |
| patients.ts | `getActivePatients()` | patients.ts:28 |
| patients.ts | `getEmergencyPatients()` | patients.ts:32 |
| metrics.ts | `getClinicMetrics()` | metrics.ts:36 |
| prescriptions.ts | `getClinicPrescriptions()` | prescriptions.ts:36 |

---

## 4. PRIORIDADES DE IMPLEMENTACIÓN

### Alta Prioridad (funcionalidad rota)
1. **citas.ts routing fix** - Cambiar `core` → `directorio` en todas las llamadas de citas
2. **PATCH /users/{userId}** - Needed for admin user editing
3. **GET /appointments/{id}** - Needed for appointment detail view
4. **PUT /products/{id}** - Needed for product editing
5. **GET /products/seller/me** - Needed for seller dashboard
6. **GET /orders/seller/me** - Needed for seller order management

### Media Prioridad (funcionalidad incompleta)
7. **POST /reports/{id}/resolve** - Needed for lost pet report resolution
8. **GET /reports/presigned-url** - Needed for report image uploads
9. **GET /places/presigned-url** - Needed for place image uploads
10. **GET /clinics/{id}/metrics/revenue** - Needed for clinic financial dashboard
11. **GET /clinics/{id}/metrics/occupancy** - Needed for clinic occupancy display
12. **Endpoint de alertas por tipo** (emergency/inventory/laboratory)
13. **PATCH /orders/{id}/status** (sin restricción admin para vendedores)

### Baja Prioridad (admin/system)
14. **GET/PATCH /admin/system/settings** - System settings management
15. **POST /admin/system/database/sync** - Database sync
16. **POST /admin/system/cache/clear** - Cache management

### Backlog (servicios sin móvil)
17. Integrar servicios de: aseguradoras, entrenadores, establecimientos, estilistas, funeraria, laboratorio, patrocinadores, transportistas

---

## 5. ARCHIVOS AFECTADOS

### Móvil (archivos a corregir/actualizar)
- `mobile/src/services/citas.ts` - Cambiar routing de `core` a `directorio`
- `mobile/src/services/adminUsers.ts` - Agregar updateUser cuando backend lo soporte
- `mobile/src/services/ecommerce.ts` - Agregar endpoints faltantes de vendedor
- `mobile/src/services/perdidas.ts` - Agregar presigned-url y resolve
- `mobile/src/services/petfriendly.ts` - Agregar presigned-url
- `mobile/src/services/alerts.ts` - Quitar mocks, usar endpoint genérico
- `mobile/src/services/inventory.ts` - Quitar mocks
- `mobile/src/services/laboratory.ts` - Quitar mocks
- `mobile/src/services/patients.ts` - Quitar mocks
- `mobile/src/services/metrics.ts` - Quitar mocks, usar /metrics/daily
- `mobile/src/services/prescriptions.ts` - Quitar mocks
- `mobile/src/services/system.ts` - Crear endpoint en backend o deshabilitar

### Backend (archivos a crear/modificar)
- `backend/michicondrias_core/app/api/routes/users.py` - Agregar PATCH
- `backend/michicondrias_perdidas/app/api/routes/lost_pets.py` - Agregar presigned-url y resolve
- `backend/michicondrias_perdidas/app/api/routes/places.py` - Agregar presigned-url
- `backend/michicondrias_directorio/app/api/routes/alerts_routes.py` - Agregar filtros por tipo
- `backend/michicondrias_directorio/app/api/routes/metrics_routes.py` - Agregar /revenue y /occupancy
- `backend/michicondrias_ecommerce/app/api/routes/products.py` - Agregar PUT, DELETE, seller/me
- `backend/michicondrias_ecommerce/app/api/routes/orders.py` - Agregar seller/me, PATCH sin admin
