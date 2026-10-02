# Auditoría de la app móvil (155 pantallas)

Fecha: 2026-10-01. Método: análisis estático de `mobile/` cruzado contra los OpenAPI reales de los 17 servicios
desplegados en `https://michicondrias.duckdns.org`. **No** se ejecutó la app en un dispositivo ni se probaron roles.

## Estado

- **P0: corregido** (commits `76b1565` backend y `fbb8786` app). Verificado: 287/288 llamadas con endpoint válido, 0 enlaces rotos, `tsc` sin errores.
  Pendiente de desplegar el backend (`git push`) para que las respuestas incluyan `created_at`, `updated_at` e `is_approved`.
- **P1: corregido** (ver «P1» abajo). Verificado con `tsc` sin errores; pendiente de probar en dispositivo.
- **P2, P3: pendientes.**

Hallazgos extra al corregir el P0: la duración de las cirugías no se guardaba ni se mostraba (`estimated_duration_minutes`
vs. `estimated_duration`), y se podía reseñar varias veces el mismo paseo/cuidado (`request_id` vs. `walk_request_id`).
El 403 de credenciales vencidas sigue cerrando sesión (el backend lo usa para tokens inválidos); solo los 403 de permisos
dejaron de hacerlo.

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

## P1 — Botones muertos y funciones a medias (corregido)

**Pantallas que eran datos inventados, ahora conectadas al servidor**
- `entrenadores/metas/[id]`: las metas eran una lista fija y «Nueva meta» se creaba con `placeholder-pet-id`.
  Ahora lee las metas de la inscripción (endpoint nuevo `GET /training/enrollments/{id}/goals`) y crea con la mascota y programa reales.
  Solo el entrenador puede agregar metas o revisar videos. Las tarjetas de `mis-inscripciones` ahora abren las metas.
- `mi-clinica/horarios`: el horario semanal arrancaba siempre con valores fijos y los feriados eran 3 datos de 2024 solo en memoria.
  Ahora carga el horario guardado y los feriados salen de las excepciones del servidor; agregar y eliminar llaman a la API
  (endpoint nuevo `DELETE /schedule/clinics/{id}/schedule/exceptions/{id}`). Se quitó «Agregar pausa»: el backend guarda un solo tramo por día.

**Botones con acción nueva:** compartir (adopciones, cuidadores, paseadores, perdidas, petfriendly), «Agendar cita» de la clínica,
resultados de búsqueda, tarjeta de mascotas en admin, campañas de patrocinadores (abre su enlace), banner y filtro de la tienda,
«marcar todas como leídas» en notificaciones, Centro de Ayuda (preguntas desplegables, buscador, email; teléfono, WhatsApp y
términos solo si se configuran en `.env`).

**Quitados por no tener función real:** corazón de «seguir reporte», botón de mensaje en adopciones (el anuncio no trae contacto),
cámara de logo y de foto de perfil (no hay endpoint de subida), selector de dificultad del programa (el backend no lo guarda),
tarjeta «Metas» de gestión de entrenadores, «Gestionar» y «⋮» de admin, filtros de admin sin lógica, «⋮» de servicios,
segundo paso «en desarrollo» de las solicitudes de paseadores y cuidadores. Las flechas decorativas dentro de tarjetas tocables
dejaron de ser botones (se comían el toque).

**Cosas que descubrí y quedan anotadas:**
- `perfil/index` usa `id_front_url` (la foto del documento de identidad del KYC) como avatar del perfil.
- `PATCH /training/goals/{id}` y `review-video` no comprueban que el entrenador sea dueño del programa.
- `usePatientHistory` depende de una caché que otra pantalla debería haber llenado (no tiene `queryFn`).
- La tarjeta de paciente crítico no tiene pantalla de detalle (su `id` es el del registro extendido, no el de la mascota).

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
