# Auditoría — Web ↔ App (W1, 2026-10-08)

Por módulo: "pantalla de la app → página web" con estado **existe** / **falta** / **difiere** / **sobra**, lógica web
que vale rescatar y hallazgos. Al resolver un hallazgo se marca `[x]`. Rutas web relativas a `frontend/src/app/`
(hoy todo cuelga de `dashboard/`); app relativa a `mobile/`. Inventario de permisos del backend:
[`docs/PERMISOS_BACKEND.md`](docs/PERMISOS_BACKEND.md). Progreso: [`PROGRESO_WEB.md`](PROGRESO_WEB.md).

**Resumen.** La web cubre 6 de 14 módulos de servicios y menos de la mitad de las pantallas de cuenta. Las que existen
mezclan funciones de consumidor, vendedor, veterinario y admin en la misma página. Hay tres fallas de integridad:
- **donaciones sin cobro**;
- **notificaciones simuladas**;
- **tracker que escribe ubicaciones aleatorias en producción**.

Conclusión: **no se rescata ninguna página tal cual**. Se porta la app y se reaprovechan piezas sueltas (ver
"Rescatable").

---

## Hallazgos globales

- [x] `next build` fallaba (`Sidebar.tsx:141` y `useSearchParams` sin `<Suspense>`). Arreglado en W0.
- [ ] 🚨 **Tracker falso:** `perdidas/rastreo/[id]/page.tsx:60-74` mueve el marcador al azar cada 3 s y llama
  `updateTrackerLocation` con esas coordenadas. **Escribe ubicaciones falsas en producción.** La distancia también es
  aleatoria (l.47). → Hay que quitarlo de la web publicada lo antes posible (ver backlog V3).
- [ ] 🚨 **Donaciones sin cobro:** `donaciones/page.tsx:51` → `createDonation` (`lib/services/ecommerce.ts:145`)
  registra la donación sin pasar por Stripe. La app usa `createDonationCheckout` y confirma el estado al volver.
- [ ] **Notificaciones simuladas:** `lib/contexts/NotificationContext.tsx:38-60` vive en memoria con una bienvenida
  fija; no consulta el servidor.
- [ ] **Login sin 2FA ni recuperación:** `lib/auth.ts` (~l.39) ignora `require_2fa`/`temp_token`. Un usuario con 2FA
  no puede entrar por la web. No existen forgot-password ni reset-password.
- [ ] **URLs base incorrectas:** `lib/api.ts:5-6` usa `/adopciones/api/v1/adopciones` y
  `/directorio/api/v1/directorio`; la app usa `/api/v1`. Faltan 8 servicios del mapa (`mobile/src/lib/api.ts:17-24`).
- [ ] `lib/api.ts`: cualquier 401/403, o un 404 "User not found", cierra la sesión. → espejo de `mobile/src/lib/api.ts`.
- [ ] El rol se lee de tres formas: JWT sin verificar (`lib/auth.ts:21-36`), `user.role_name` y
  `localStorage.user_role`. `adopciones/mascota/[id]/page.tsx:28-29` trata a `veterinario` como admin. → solo
  `AuthContext` + `normalizeRole`.
- [ ] Ninguna página de admin (6) ni `mi-clinica` comprueba el rol: el layout solo valida la sesión
  (`dashboard/layout.tsx`) y el Sidebar solo oculta enlaces (`Sidebar.tsx:57-59`).
- [ ] Subidas: la foto de mascota y la de perdidas se piden como URL de texto (`mascotas/page.tsx:245`,
  `perdidas/page.tsx:415`). La de petfriendly va al presign de **mascotas** (`petfriendly/nuevo/page.tsx:59`).
  `adopciones/nueva/page.tsx:126` no revisa `res.ok`.
- [ ] Reseñas de producto sin comprobar compra (`tienda/producto/[id]/page.tsx:22-24`); la app usa
  `getReviewEligibility`.
- [ ] Datos *mock* en `directorio/mi-clinica/page.tsx:66,276` (`patient_id: "pet_mock_123"`).
- [ ] Servicios duplicados (`getPlaces` en `perdidas.ts` y `petfriendly.ts`; perdidas en `mascotas.ts` `/lost-pets` y
  en `perdidas.ts` `/reports`). → Los services se reemplazan por los espejos.
- [ ] Solo tema oscuro morado/rosa; íconos con SVG pegados y ~630 emojis. → W2.

## Para la otra sesión (app / backend) — no se corrige desde la web

| # | Dónde | Qué |
|---|---|---|
| X1 🚨 | backend, 10 servicios | `deps.py` no rechaza el token temporal de 2FA (`is_temp`), que ya lleva `role`: **se salta el 2FA** en aseguradoras, cuidadores, paseadores, entrenadores, establecimientos, estilistas, funeraria, laboratorio, patrocinadores y transportistas. Detalle en `docs/PERMISOS_BACKEND.md` §1. |
| X2 | backend | El admin no pasa varias guardas de rol y de dueño (aseguradora, entrenador, laboratorio, patrocinador, funeraria; todo directorio, productos, venues). El "superadmin" no puede actuar ahí. |
| X3 | backend | 8 servicios no tienen moderación de admin (`require_admin` definido sin usar). |
| X4 | backend | Falta comprobar el dueño en `POST /payments/create-subscription-session/{pet_id}` (`payments.py:89`) y en `GET /pets/adopted-from/{id}` (`mascotas pets.py:236`). |
| X5 | app | `roleTools.ts:178,180` restringe `/paseadores/solicitudes` y `/cuidadores/solicitudes` a proveedores, pero la lista manda ahí a cualquier cliente ("Mis solicitudes"). |
| X6 | app | Cancelar cita en mi-clínica: `services/directorio.ts:293-296` manda el motivo por query sin body; el backend exige el body `AppointmentCancel` → probable 422. |
| X7 | app | Admin: `admin/usuarios` pide 6 caracteres y el backend 8. `useAdminVets.ts:18` filtra por un UUID fijo en vez de `role_name`. Moderación sin pestaña de veterinarios (`moderacion/index.tsx:291-295`). Buscadores sin conectar en `admin/mascotas:86`, `productos:76`, `servicios:100`. "Suspender" clínica no hace nada (`useAdminClinicDetail.ts:115-123`). `admin/roles` muestra "undefined Usuarios" (l.38). `useAdminOrders` sin pantalla. |
| X8 | app | Código muerto que **no** se porta: `funeraria/nuevo.tsx`, `adopciones/formulario-compatibilidad.tsx`, `hooks/perdidas/useReportActions.ts`, `transportistas/nuevo.tsx`; `patrocinadores/nuevo` y `nueva-campana` duplicados. |

## Backend que necesita la consola de admin (W4-A, aditivo en core)

- [ ] **B1** `GET /users/` con `total` y filtros `role`, `q`, `is_active`, `verification_status`, `order_by`. Hoy solo
  acepta `skip`/`limit` y la app ve los primeros 100.
- [ ] **B2** `GET /users/{id}` (no existe) para el detalle de usuario.
- [ ] **B3** `GET /roles/` con `users_count`. `DELETE /roles/{id}` que rechace si el rol tiene usuarios y proteja los
  roles del sistema: hoy borra sin revisar (`crud_role.py:31-36`) y renombrar rompe accesos, porque todo va por nombre.
- [ ] **B4** (opcional) motivo de rechazo de KYC.

Son cambios de backend: se coordinan con la otra sesión (o se hacen aquí con la skill `nuevo-endpoint`, aprobados
por el usuario). Mientras tanto, la consola funciona con lo que hay (paginación en el cliente hasta 100).

---

## P1 — Consumidor

### Auth
| App | Web | Estado |
|---|---|---|
| `(auth)/login` (email + contraseña; 2FA en la misma pantalla) | `login/page.tsx` | difiere: sin 2FA ni enlace a recuperar |
| `(auth)/register` | `register/page.tsx` | difiere: la web inicia sesión sola tras registrar |
| `(auth)/forgot-password`, `(auth)/reset-password` (código de 6 dígitos o `?token=`) | — | falta |
| — | `page.tsx` (landing) | sobra en la app; **se conserva** como portada pública |

### Pestañas
| App | Web | Estado |
|---|---|---|
| `(tabs)/index` Inicio (mascotas, próximas citas, herramientas del rol, campana, onboarding pro) | `dashboard/page.tsx` | difiere: módulos por rol y analíticas de admin; sin mascotas ni citas |
| `(tabs)/explorar` (catálogo de 14, búsqueda, IA) | Sidebar | falta como página |
| `(tabs)/tienda-tab` (categorías, buscador, carrito, compras) | `tienda/page.tsx` | difiere: mezcla el alta de vendedor y filtra en el cliente |
| `(tabs)/perfil` (cuenta completa) | `perfil/page.tsx` | difiere: ficha de solo lectura |
| `(tabs)/menu` Herramientas (`canAccessRoute`) | Sidebar | difiere: filtra solo admin / todos |

### Perfil
| App | Web | Estado |
|---|---|---|
| `perfil/editar` (nombre, teléfono, bio, avatar) | — | falta |
| `perfil/verificacion` (KYC) | `perfil/verificacion` | existe |
| `perfil/partner` | `perfil/partner` | existe (`apiFetch` directo en la página) |
| `perfil/seguridad-2fa` (QR) | — | falta |
| `perfil/eliminar-cuenta` | — | falta |

### Mascotas + Carnet
| App | Web | Estado |
|---|---|---|
| `mascotas/index` | `mascotas/page.tsx` | difiere: alta en un modal |
| `mascotas/nuevo` (foto con presign) | modal | difiere: foto como URL de texto |
| `mascotas/[id]` (pestañas Resumen · Salud · Historial; pasaporte con QR) | `mascotas/[id]` | difiere: edición en línea, botón Premium (Stripe), sin pestañas ni pasaporte |
| `mascotas/editar/[id]` | dentro de `[id]` | difiere |
| `mascotas/diagnostico-ia` | — | falta |
| `carnet/[id]` → redirige a `mascotas/[id]?tab=salud` | `carnet/[pet_id]` | difiere: página aparte |
| `carnet/nueva-consulta`, `nueva-vacuna`, `receta/[id]` | `carnet/nuevo` (75 l.), formulario dentro de `[pet_id]`, — | difiere / falta |
| — | `carnet/page.tsx` (índice) | sobra |

### Tienda (cliente)
| App | Web | Estado |
|---|---|---|
| `tienda/producto/[id]` (reseña solo si compró) | `tienda/producto/[id]` | difiere |
| `tienda/carrito` (Stripe) | `CartDrawer` + `CartContext` | difiere: panel lateral; el carrito no es por usuario |
| `tienda/compras` | `tienda/compras` | difiere: sin detalle |
| `tienda/pedido/[id]` (pagar pendiente, cancelar) | — | falta |
| `tienda/pago-exitoso`, `pago-cancelado` (*deep links*) | idem | existe |

### Notificaciones · Búsqueda · Ayuda · Donaciones
| App | Web | Estado |
|---|---|---|
| `notificaciones` (servidor, no leídas, marcar) | `NotificationBell` | difiere: datos simulados |
| `busqueda` (por pestañas) | `MichiExplorer` en el topbar | difiere: sin página |
| `ayuda` | — | falta |
| `donaciones` (Stripe + estado al volver) | `donaciones/page.tsx` | difiere: **sin cobro** |

---

## P1+ — Admin (superadmin) → W4-A

| App | Qué hace | Endpoints | Web | Estado |
|---|---|---|---|---|
| `admin/index` | 4 contadores + 8 módulos | core `/users/stats/summary`, directorio `/clinics/` | bloque admin de `dashboard/page.tsx:150-204` (pastel) | difiere |
| `admin/usuarios` | lista, búsqueda/chips en el cliente; crear, editar (nombre, email, rol), activar/desactivar, borrar | core `GET/POST /users/`, `PATCH/DELETE /users/{id}`, `/toggle-status`, `GET /roles/` | — | **falta (prioridad 1)** |
| `admin/roles` | CRUD de nombre y descripción | core `/roles/*` | `admin/roles` (tabla) | existe |
| `admin/verificaciones` | KYC: 3 documentos, aprobar o rechazar | `/users/pending-verifications`, `/users/{id}/verify?status=` | `admin/verificaciones` | existe; **la web va mejor** con los documentos |
| `admin/moderacion` | 5 pestañas, aprobar o rechazar | ver tabla en `docs/PERMISOS_BACKEND.md` y `services/moderacion.ts` | `admin/moderacion` | existe; las dos versiones fallan (la web no rechaza solicitudes de adopción, `page.tsx:123-146`; falta la pestaña de vets) |
| `admin/stats` | KPIs, registros de 14 días, distribución por rol | core `/analytics/dashboard` | `admin/analytics` (otras métricas; usuarios y adopciones en 0, l.49-50) | difiere |
| `admin/config` | 4 interruptores, sincronizar BD, limpiar caché | core `/admin/system/*` | `admin/configuraciones` (CRUD clave-valor de `/settings/`) | difiere: **la web deja editar claves `system.*` a mano** |
| `admin/categorias` | CRUD | ecommerce `/categories/*` | `admin/categorias` (+ subcategorías, imagen, activo) | **la web tiene más** |
| `admin/clinicas`, `clinicas/[id]` | lista; detalle con 10 campos | directorio `/clinics/*` | — | falta ("Nueva" y "Suspender" no hacen nada en la app) |
| `admin/veterinarios` | usuarios con rol vet | core `/users/` (UUID fijo) | — | falta; la app la tiene a medias |
| `admin/productos`, `mascotas`, `servicios` | listas | ecommerce `/products/`, mascotas `/pets/admin/all`, directorio `/catalog/admin/all` | — | falta; en la app no se llega a `mascotas` ni a `servicios` y sus buscadores no filtran |
| (sin pantalla) `useAdminOrders` | pedidos | ecommerce `/orders/admin/*` | — | código sin usar |

**La consola web va más allá de la app** (es el foco del superadmin):
- Tablas con paginación, orden y búsqueda reales, y acciones en lote.
- Detalle de usuario.
- **Roles y permisos**: matriz por rol a partir de `ROLE_TOOLS`, `ROUTE_ACCESS` y `docs/PERMISOS_BACKEND.md`;
  usuarios por rol; y modo "ver como rol".
- Pedidos de admin.
- Moderación con contadores y pestaña de veterinarios.

Lo que pide backend está en B1–B4.

**Rescatable:** pastel de distribución por rol con Recharts (`dashboard/page.tsx:7,19,129,174-202`), visor KYC de
imagen/PDF (`admin/verificaciones/page.tsx:94-115`), subcategorías (`admin/categorias/page.tsx:101-180` +
`lib/services/categories.ts:73-93`), tabla de roles (`admin/roles/page.tsx:204-240`).

---

## P2 — Servicios

| Módulo | App (pantallas) | Web | Estado |
|---|---|---|---|
| Directorio | index, clinica/[id], especialista/[id], nuevo (vet), citas, citas/agendar/[clinic_id] | 5 de 6 | `especialista/[id]` falta; `clinica/[id]` mete gestión del dueño (modal "Nuevo especialista", l.363) |
| Adopciones | index, [id], nuevo (crear/editar), mis-publicaciones, solicitudes, ver-solicitudes/[id], solicitud/[id], solicitar/[id], mis-solicitudes, refugio/aplicaciones, contrato/[id] | 7 | faltan: mis-publicaciones, solicitudes (bandeja), solicitud/[id], refugio/aplicaciones, contrato/[id]. La web usa `?id=` en lugar de rutas, no permite editar y el admin de "pendientes" va en la página pública |
| Perdidas | index (lista + mapa), [id] (avistamientos, coincidencias, tracker, resolver), nuevo (geo + foto), editar/[id] | 3 | `[id]` y `editar` faltan. Sobran `reportar` (otro backend) y `rastreo/[id]` (🚨 falso) |
| Paseadores / Cuidadores | index, [id], solicitudes (proveedor y cliente), calendario (rol) | 4 + 4 | calendario falta; sobran `registro` (ahora va por `/perfil/partner`) |
| Pet-friendly | index (mapa), [id] (reseñas, borrar), nuevo (mapa + foto) | 3 | difiere: sin mapa ni reseñas; foto al bucket equivocado |
| Establecimientos | index, [id] (cupones, reseñas), nuevo, editar (rol) | — | falta todo |
| Grooming / Estilistas | estilistas/index, nuevo (rol); grooming/agendar, mis-citas, historial/[petId], gestion (rol) | — | falta todo |
| Entrenadores | index, [id], inscribir, mis-inscripciones, metas/[id], gestion, nuevo-programa | — | falta todo |
| Transportistas | index, solicitar, mis-viajes, tracking/[id], solicitudes, perfil-conductor, historial | — | falta todo |
| Aseguradoras | index, [id], cotizar, mis-polizas, reclamo/nuevo, gestion, reclamos, nuevo | — | falta todo |
| Laboratorio | index, agendar, gestion (rol) | — | falta todo |
| Funeraria | index, reservar, mis-reservas, memorial/[petId], memorial/nuevo, reporte-defuncion, certificado/[id], gestion, nuevo-servicio | — | falta todo (tono sensible) |

**Piezas compartidas a crear en la web (núcleo, W2):**
- `WebMap` con Leaflet, cargado con `dynamic(ssr:false)`. Base: `perdidas/rastreo/[id]/MapComponent.tsx`, del que se
  rescata el arreglo de íconos (l.6-12), el `divIcon` pulsante (l.14-38) y `MapUpdater` (l.42-46).
- `uploadToPresigned`, que junta `adopciones/nueva:99-131` y `paseadores/registro:46-57`.
- `PetPicker`: `getUserPets` se repite en 8 hooks.
- `SlotPicker`, usado por directorio y grooming.
- `ReviewsSection` con rating.
- `shareContent`, a partir de `adopciones/mascota/[id]:271-274` (`navigator.share`, o copiar al portapapeles si no
  hay).
- Para paseadores y cuidadores: `ProviderList`, `ProviderDetail`, `RequestsInbox` y `ProCalendar`.

**Solapamientos de la app:**
- Pet-friendly (perdidas `/places`) y Establecimientos (`/venues`) son dos backends para lo mismo.
- Grooming y Estilistas comparten `grooming.ts`.
- La web los espeja tal cual hasta que la app decida si fusionarlos.

## P3 — Herramientas pro

| Módulo | App | Web | Estado |
|---|---|---|---|
| Mi clínica | index (panel y métricas), agenda, servicios, horarios (+ excepciones), cirugías, pacientes, historial/[id], recetas, laboratorio, inventario, consultas-video, sucursales (hospital), veterinarios (hospital), config/[id] | `directorio/mi-clinica` (736 l., pestañas info, agenda, servicios, horario, cirugías; *mock*; deja fuera a `hospital`) | 4 existen o difieren; faltan 9 |
| Servicios pro | index, gestion, perfil | `paseadores|cuidadores/solicitudes`, `registro` | gestion existe partida en dos; perfil falta |
| Tienda vendedor | vendedor, productos, productos/[id], ordenes, analytics | alta dentro de `tienda/page.tsx:78-93` | falta todo |
| Patrocinadores | index, nuevo/nueva-campana (duplicadas), boost-alerta, estadisticas | — | falta todo |

---

## Rescatable de la web vieja (resumen)
- **Stripe:**
  - Checkout: `lib/services/ecommerce.ts:133`, `CartContext.tsx:103-116`.
  - Suscripción Premium: `ecommerce.ts:139`, `mascotas/[id]:88-90`.
  - `session_id` al volver del pago: `pago-exitoso:11`.
- **S3 presignado:** KYC en `perfil/verificacion:55-72` y `lib/auth.ts:130`, más los de P2.
- **Leaflet:** `perdidas/rastreo/[id]/MapComponent.tsx` (solo la parte del mapa, **no** la simulación) y el CSS en
  `app/layout.tsx:6`.
- **Recharts:** pastel por rol en `dashboard/page.tsx:174-202`.
- **Admin:** visor KYC, subcategorías y tabla de roles (arriba).
- **Búsqueda global:** debounce + React Query en `MichiExplorer.tsx:21-29`.
- **UI:** `OfflineBanner`, `ConfirmModal`, `ToasterProvider`. Sirven de referencia para `AppAlert`.

## Actualización 2026-10-23 — cobertura pantalla por pantalla

Cruce automático de `mobile/app/**` contra las páginas de `frontend/src/app/**` (sin `/dashboard`). «Tiene página» solo
significa que la ruta existe: todas son código viejo que se rehace en W4.

**156 pantallas en la app · 37 con página web · 119 faltan.**

| Módulo | Web/App | Faltan |
|---|---|---|
| admin | 4/14 | panel, clínicas (+detalle), config, mascotas, productos, servicios, stats, usuarios, veterinarios |
| adopciones | 3/12 | detalle, contrato, formulario de compatibilidad, mis publicaciones, nuevo, aplicaciones del refugio, solicitar, solicitud, ver solicitudes |
| aseguradoras | 0/8 | módulo completo |
| auth | 2/4 | forgot-password, reset-password |
| carnet | 1/4 | nueva consulta, nueva vacuna, receta |
| cuidadores / paseadores | 3/4 · 3/4 | calendario |
| directorio | 5/6 | especialista |
| entrenadores | 0/7 | módulo completo |
| establecimientos | 0/4 | módulo completo |
| estilistas / grooming | 0/3 · 0/4 | módulos completos |
| funeraria | 0/10 | módulo completo |
| laboratorio | 0/3 | módulo completo |
| mascotas | 2/5 | Michi-IA (diagnóstico y dieta), editar, nuevo |
| mi-clinica | 0/14 | módulo completo (la página vieja usa datos *mock*) |
| patrocinadores | 0/5 | módulo completo |
| perdidas | 1/5 | detalle, editar, mis reportes, nuevo |
| perfil | 3/6 | editar, eliminar cuenta, 2FA |
| servicios-pro | 0/3 | módulo completo |
| tienda | 5/12 | carrito, pedido, todo el panel de vendedor |
| transportistas | 0/8 | módulo completo |
| pestañas y sueltas | — | explorar, tienda-tab, menú, búsqueda, notificaciones, ayuda |
| donaciones, petfriendly, inicio, login, register | completos | (rehacer igual en W4) |
