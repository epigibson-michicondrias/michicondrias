# Auditoría de la app móvil (155 pantallas)

Fecha: 2026-10-01. Método: análisis estático de `mobile/` cruzado contra los OpenAPI reales de los 17 servicios
desplegados en `https://michicondrias.duckdns.org`. **No** se ejecutó la app en un dispositivo ni se probaron roles.

## Estado

- **P0: corregido** (commits `76b1565` backend y `fbb8786` app). Verificado: 287/288 llamadas con endpoint válido, 0 enlaces rotos, `tsc` sin errores.
  Pendiente de desplegar el backend (`git push`) para que las respuestas incluyan `created_at`, `updated_at` e `is_approved`.
- **P1: corregido** (ver «P1» abajo). Verificado con `tsc` sin errores; pendiente de probar en dispositivo.
- **P2: corregido lo que se podía sin decisiones externas** (ver «P2» abajo; quedan pendientes marcados).
- **P3: pendiente.**

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

## P2 — Mocks en el backend (corregido, con pendientes)

| Servicio | Qué era falso | Qué se hizo | Pendiente |
|---|---|---|---|
| `mascotas` triage | Palabras clave **sin acentos** presentadas como «Gemini»: «convulsión» o «vómito constante» daban VERDE | Reglas de alarma que ignoran acentos (piso de urgencia) + modelo de Claude si hay `ANTHROPIC_API_KEY`; **nunca baja la urgencia**; límite de consultas por usuario/hora; sin clave, error o rechazo responde con reglas y lo indica | Configurar `ANTHROPIC_API_KEY` (sin ella el triage es solo reglas). La llamada real al API no se probó (sin clave) |
| `mascotas` nutrición | Etiquetada IA; recomendaba «pollo o salmón» aunque hubiera alergias; asumía 10 kg sin peso | Es un cálculo RER/MER y se dice así; usa peso objetivo, no nombra proteínas, exige peso registrado | — |
| `ecommerce` pagos | URL `billing-mock` si fallaba Stripe; el portal abría **el primer cliente de la cuenta de Stripe**; centavos con `int()` | Sin URLs falsas (503/502), el portal busca por `metadata.user_id`, `round()`, pedido vacío -> 400 | Configurar Stripe; las URLs de éxito/cancelación apuntan al sitio web, no a la app |
| `aseguradoras` | Número de póliza al azar (podía chocar); cualquiera aseguraba cualquier mascota; «verificado con IA» era solo «hay URL» | Número único, solo el dueño contrata, mensaje honesto | La validación contra registros de la clínica no existe |
| `funeraria` | Certificado apuntaba a un PDF inexistente en el bucket viejo | PDF real generado al momento | El endpoint sigue sin autenticación (se accede por el folio) |
| `directorio` dashboard | Devolvía ceros (importaba modelos inexistentes; el primer pedido del día probablemente daba 500; después se congelaba); «hoy» en UTC | Todas las métricas se calculan de datos reales y se recalculan; «hoy» en hora de México | — |
| `estilistas` | `GET /appointments/client` devolvía las citas de **todos** los usuarios | Solo las de las mascotas del cliente | Crear cita no verifica que la mascota sea del usuario |
| `patrocinadores` | «Geo-target» devuelve todas las campañas | Documentado | Las campañas no guardan ubicación: requiere migración de BD |

### Seguridad: accesos sin autorización cerrados
- `mascotas`: el PATCH de suscripción Pro era **público** (cualquiera se daba Pro gratis); `PUT /pets/{id}` lo podía hacer cualquiera sobre cualquier mascota; `GET /pets/admin/all` listaba todas las mascotas sin ser admin. Ahora: token interno, dueño y rol admin.
- `core`: `POST /notifications/broadcast` permitía enviar notificaciones a cualquier usuario. Ahora exige token interno.
- `ecommerce`: crear, editar y borrar categorías y subcategorías era público. Ahora exige admin.

**Requiere configuración:** `INTERNAL_SERVICE_TOKEN` (el mismo valor en `common.env`; sin él, esas llamadas entre servicios se rechazan).

### Revisión de autorización del backend (completa, con pendientes)
Se revisaron los 17 servicios (315 endpoints). Corregido, además de lo anterior:
- `core`: roles y ajustes globales solo admin (antes cualquiera podía renombrar «consumidor» a «admin»); el registro ignora el `role_id` del cliente; búsqueda y WebSocket de notificaciones exigen sesión; `upgrade-role` exige identidad verificada (KYC) y la pantalla Partner lo explica.
- `carnet`: solo el dueño o un veterinario escriben registros y vacunas. `laboratorio`: historial solo dueño o involucrados.
- `directorio`: cirugías solo del dueño de la clínica. `estilistas`: agendar solo dueño, fotos solo el estilista de la cita.
- `funeraria`: dar de baja y reservar exigen relación real con la mascota. `aseguradoras`: pólizas y reclamos solo del dueño o de la aseguradora.
- `ecommerce`: estados de pedido con lista blanca (ya no se puede poner «paid»), cantidad >= 1, categorías solo admin.
- `transportistas`: ubicación solo del conductor del viaje, tracking solo conductor/dueño/admin, pedir viaje solo con tu mascota.
- `paseadores`/`cuidadores`: transiciones de estado válidas (el cliente solo cancela) y solicitar solo con tu mascota. `entrenadores`: metas solo en programas propios; inscribir solo tu mascota.
- `perdidas`: ubicación del tracker solo dueño o hardware (token interno). `mascotas`: crear, listar y leer mascotas exigen sesión; suscripción solo interna.
- URLs firmadas de subida: sesión obligatoria y solo imágenes con MIME fijo. KYC en bucket **privado** (`michicondrias-private`) con URL temporal de lectura.
- Almacenamiento: boto3 con checksums `when_required` (Oracle rechazaba las subidas desde el servidor) y la app envía el MIME correcto (`jpg` -> `image/jpeg`; antes daba 403).

**Requiere configuración** (en `common.env`): `INTERNAL_SERVICE_TOKEN` y `S3_PRIVATE_BUCKET_NAME=michicondrias-private`.

### Sigue abierto
- Los roles se leen del JWT: un cambio de rol (o una baja) no se refleja hasta que vence el token (7 días).
- Sin límite de intentos en login y recuperación de contraseña (archivo con cambios sin commitear del trabajo de 2FA).
- `POST /sponsors/campaigns/{id}/click` es público (se pueden inflar clics y gasto de una campaña).
- Certificados de funeraria se descargan con el folio (sin sesión).
- «Difundir alerta» de mascota perdida solo notifica a quien reporta: la difusión a usuarios cercanos está simulada.
- Hay credenciales de Supabase en `directorio/app/core/config.py` y en el historial de git: rotarlas.

## P3 — Limpieza
- Eliminar `MOCK_SERVICES` (código muerto).
- Actualizar o retirar `mobile/navigation_audit.md` (describe solo botones de regreso).

## No verificado
- Comportamiento real en dispositivo (layout, teclado, permisos de cámara/ubicación).
- Respuestas por rol (admin, veterinario, dueño…): un endpoint puede existir y devolver 403 para ese usuario.
- Pantallas sin llamadas a la API pero legítimas: `ayuda`, `perfil/paleta`, `tienda/carrito` (estado local),
  `tienda/pago-exitoso` y `pago-cancelado` (estáticas: conviene confirmar el estado real del pedido).
