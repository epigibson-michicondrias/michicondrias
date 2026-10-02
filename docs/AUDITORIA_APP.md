# Auditoría de la app móvil (155 pantallas)

Fecha: 2026-10-01. Método: análisis estático de `mobile/` cruzado contra los OpenAPI reales de los 17 servicios
desplegados en `https://michicondrias.duckdns.org`. **No** se ejecutó la app en un dispositivo ni se probaron roles.

## Resumen

| Revisión | Resultado |
|---|---|
| Llamadas `apiFetch` | 289 en total: **270 con endpoint válido**, **18 con ruta o verbo equivocado** |
| Campos que la app espera vs. los que devuelve el backend | 184 respuestas comparadas, **27 con campos faltantes** |
| Enlaces de navegación (`router.push`, `href`) | 179 revisados, **5 apuntan a pantallas que no existen** |
| Botones sin `onPress` | **30** candidatos (revisar uno por uno) |
| Pantallas con textos «en desarrollo» | 4 |
| Mocks en el backend | **7** |

Conclusión: la app **está mucho más conectada de lo que parece**. Casi todo lo que se ve «roto» son errores de ruta
o de contrato que se corrigen rápido; los mocks de verdad están en el backend.

> Falsos positivos descartados: `MOCK_SERVICES` (`src/services/directorio.ts`) está definido pero **no lo usa nadie**;
> `/(tabs)` es una ruta válida de expo-router.

---

## P0 — Bugs reales, solo en la app

### 1. Rutas equivocadas (existen en el backend con otra ruta o verbo)

| Archivo | La app llama | Debe llamar |
|---|---|---|
| `services/alerts.ts:17,21,25,29` | `GET /clinics/{id}/alerts[/emergency\|inventory\|laboratory]` | `GET /clinics/clinics/{id}/alerts...` |
| `services/alerts.ts:33` | `PUT /alerts/{id}/read` | `PUT /clinics/alerts/{id}/read` |
| `services/directorio.ts:418,422` | `/clinics/{id}/metrics/weekly`, `/alerts/unread` | `/clinics/clinics/{id}/...` |
| `services/metrics.ts:20,24,28` | `/clinics/{id}/metrics/{daily,revenue,occupancy}` | `/clinics/clinics/{id}/metrics/...` |
| `services/patients.ts:17,21,26` | `/clinics/{id}/patients/critical` | `/clinics/clinics/{id}/patients/critical` |
| `services/citas.ts:45` | `PUT /appointments/{id}` | no existe; usar `confirm`, `complete` o `reschedule` según el caso |
| `services/citas.ts:52` | `POST /appointments/{id}/cancel` | `PUT /appointments/{id}/cancel` |
| `services/ecommerce.ts:209,216,223` | `/subcategories[/{id}]` | `/categories/subcategories[/{id}]` |

Pantallas afectadas: todo el panel `mi-clinica` (métricas, alertas, pacientes críticos), citas del directorio
(cancelar/editar) y la administración de subcategorías de la tienda.

### 2. Un 403 cierra la sesión
`src/lib/api.ts`: ante 401 **o 403** borra el token y lanza «No autorizado». Un 403 es «sin permiso para esta acción»,
no «sesión caducada»: un usuario sin rol suficiente es expulsado de la app. Debe cerrar sesión solo con 401.

### 3. Enlaces a pantallas inexistentes

| Destino roto | Origen |
|---|---|
| `/directorio/nuevo-lugar` | `src/hooks/directorio/useMyClinic.ts:99` |
| `/mi-clinica/configuracion` | `src/hooks/directorio/useMyClinic.ts:98` |
| `/perfil/pro` | `app/servicios-pro/index.tsx:68` |
| `/servicios-pro/{x}/{x}` | `app/servicios-pro/index.tsx:18` |
| `/tienda/vendedor/config` | `app/tienda/vendedor/index.tsx:40` |

### 4. Campos que la app espera y el backend no devuelve
- `AdoptionRequest.created_at` (todas las pantallas de solicitudes de adopción → fechas vacías o «Invalid Date»).
- Reseñas de paseadores y cuidadores: `request_id`, `user_id`, `created_at`.
- `Appointment.updated_at`, `Subcategory.image_url`.
- `Clinic.is_approved`: el panel de moderación y las clínicas de admin dependen de este campo.
- Opcionales: `User.role_id/document_type/created_at`, `SurgeryItem.estimated_duration_minutes/notes`,
  `ScheduleException.custom_start_time/custom_end_time`.

## P1 — Botones muertos y funciones a medias

Botones sin `onPress` (30). Revisar cada uno y decidir: implementar o quitar.

`(tabs)/index.tsx:289` (banner), `(tabs)/tienda-tab.tsx:73` (filtro), `admin/clinicas/index.tsx:30`,
`admin/mascotas/index.tsx:28,68`, `admin/productos/index.tsx:63`, `admin/servicios/index.tsx:47`,
`adopciones/[id].tsx:49,122` (contactar), `aseguradoras/index.tsx:39`, `ayuda.tsx:41,61,73` (FAQ y contacto),
`busqueda/index.tsx:68` (tarjeta de resultado), `cuidadores/[id].tsx:134` y `paseadores/[id].tsx:123` (compartir),
`directorio/clinica/[id].tsx:310` (agendar), `entrenadores/gestion.tsx:103`, `entrenadores/index.tsx:40`,
`entrenadores/mis-inscripciones.tsx:31`, `entrenadores/nuevo-programa.tsx:113`, `establecimientos/index.tsx:42`,
`mi-clinica/config/[id].tsx:52` (cámara), `mi-clinica/pacientes.tsx:83`, `notificaciones.tsx:69` (borrar),
`patrocinadores/index.tsx:20` (`onPress={() => {}}`), `perdidas/[id].tsx:197,200`, `perfil/index.tsx:77` (cámara),
`petfriendly/[id].tsx:51`.

Textos «en desarrollo»: `paseadores/solicitudes.tsx:46` y `cuidadores/solicitudes.tsx:54` (detalles de solicitud),
`admin/clinicas/index.tsx:56` (edición de clínica), `mi-clinica/horarios.tsx:94` (descansos múltiples).

## P2 — Mocks en el backend (decisión de producto)

| Servicio | Qué es falso | Riesgo |
|---|---|---|
| `mascotas` `/ai/symptom-check`, `/ai/diet-plan` | «Simulated Gemini»: triage por palabras clave | **Alto**: puede tranquilizar a un dueño con una mascota grave. Conectar a un modelo real o avisar claramente |
| `ecommerce` pagos | URL `billing-mock` cuando Stripe falla | Medio: el flujo de cobro puede «parecer» funcionar |
| `aseguradoras` | Validación de reclamos simulada; número de póliza con `random` | Medio (póliza duplicable) |
| `funeraria` | Certificado devuelve una URL inventada | Bajo |
| `patrocinadores` | Campañas «por geolocalización» devuelven todas | Bajo |
| `estilistas` | Filtro de citas «mock» | Bajo |
| `directorio` | «Citas de hoy» del dashboard simuladas | Medio |

## P3 — Limpieza
- Eliminar `MOCK_SERVICES` (código muerto).
- Actualizar o retirar `mobile/navigation_audit.md` (describe solo botones de regreso).

## No verificado
- Comportamiento real en dispositivo (layout, teclado, permisos de cámara/ubicación).
- Respuestas por rol (admin, veterinario, dueño…): un endpoint puede existir y devolver 403 para ese usuario.
- Pantallas sin llamadas a la API pero legítimas: `ayuda`, `perfil/paleta`, `tienda/carrito` (estado local),
  `tienda/pago-exitoso` y `pago-cancelado` (estáticas: conviene confirmar el estado real del pedido).
