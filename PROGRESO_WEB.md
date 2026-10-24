# Progreso — Web espejo de la app

Documento vivo de la web (`frontend/`). Claude lo lee al empezar y lo actualiza al terminar cada bloque.
Reglas: [`frontend/CLAUDE.md`](frontend/CLAUDE.md) · Hallazgos: [`AUDITORIA_WEB.md`](AUDITORIA_WEB.md) ·
App de referencia: [`PROGRESO_MOBILE.md`](PROGRESO_MOBILE.md).

**Leyenda:** ⬜ pendiente · 🔍 auditado · 🟡 en progreso · ✅ hecho · ⏸️ bloqueado · — no aplica

**Dónde se trabaja:** worktree `../michicondrias-web`, rama `web/espejo`. Se fusiona a `main` (producción en Vercel)
solo con la fase verificada y el visto bueno del usuario.

## Fase actual: **W4 — Módulos** ⬜ (W3 esqueleto ✅ · W2 kit base ✅)

| # | Fase | Qué | Estado |
|---|---|---|---|
| W0 | Cimientos | ESLint/knip/scripts, build en verde, hooks, `frontend/CLAUDE.md`, `web-drift.sh`, docs | ✅ 2026-10-08 |
| W1 | Auditoría web ↔ app | Mapa pantalla de la app → página web (existe/falta/sobra/difiere) + inventario de guardas de rol del backend | ✅ 2026-10-08 |
| W2 | Núcleo espejo | types, services, roles/roleTools, api.ts, tokens → CSS, contextos, componentes base | ✅ (falta `KeyboardScreen`, `DatePicker`, `BottomSheet`, `MediaCard`…: se crean al portar el módulo que los use) |
| W3 | Navegación y esqueleto | `(auth)` + `(app)`, rutas iguales a la app, shell (sidebar / barra inferior), redirects `/dashboard/*` | ✅ 2026-10-23 |
| W4 | Módulos (multiagente por lotes) | P1 → **W4-A Consola admin** → P2 → P3 | ✅ 2026-10-23 |
| W4-A | Consola de administración | Admin de la app ampliado a escritorio + matriz de roles/permisos + "ver como rol" | ✅ 2026-10-23 |
| W5 | Pulido de escritorio y cierre | hover/foco/atajos, tablas, SEO de la landing, borrar lo viejo, merge a `main` | 🟡 homologación de diseño lista (2026-10-23) |
| W6 | Continuo | `scripts/web-drift.sh` cada sesión; reflejar cambios de la app | ⬜ |
| W7 | Permisos editables (etapa 2) | tabla `role_permissions` en core + edición en la consola; backend y app leen permisos | ⬜ (diseño aparte, con aprobación) |

## Línea base (2026-10-08, código viejo)

| Métrica | Inicial | Meta |
|---|---|---|
| Páginas (`page.tsx`) | 51 (todas bajo `/dashboard`) | las de la app (~155) con rutas iguales |
| `style={{` en `src/` | 1,325 | 0 con valores sueltos |
| Páginas con hex sueltos | 42 | 0 |
| Páginas con React Query | 14 de 51 | todas las de datos (vía hooks) |
| Archivos con `lucide-react` | 0 (SVG pegados + ~630 emojis) | todos los íconos |
| ESLint errores / avisos | 129 / 61 (72 `no-explicit-any`, 20 `no-unescaped-entities`, 14 `set-state-in-effect`, 11 `purity`, 9 `immutability`…) | 0 / 0 |
| knip exports / tipos sin uso | 7 / 4 | 0 / 0 |
| `tsc` | limpio (tras arreglar `Sidebar.tsx:141`) | limpio |
| `next build` | **verde** (antes fallaba: ver bitácora) | verde |
| `scripts/web-drift.sh` | 65 espejos faltan → **52 iguales, 0 difieren, 0 faltan** (2026-10-23) | 0 difieren / 0 faltan |

## Módulos

Columnas: Audit. (W1) · Port. (W4: portado desde la app) · Rev. (revisión visual 375/1280, claro/oscuro).

| Prio | Módulo | Rutas de la app | Web hoy | Audit. | Port. | Rev. |
|---|---|---|---|---|---|---|
| P1 | Auth | `(auth)/` 4 | `/login`, `/register` | 🔍 | ⬜ | ⬜ |
| P1 | Pestañas (Inicio, Explorar, Tienda, Perfil, Herramientas) | `(tabs)/` 5 | `/dashboard` + Sidebar | 🔍 | ⬜ | ⬜ |
| P1 | Perfil | `perfil/` 5 | `/dashboard/perfil` 3 | 🔍 | ⬜ | ⬜ |
| P1 | Mascotas + Carnet | `mascotas/` 5 · `carnet/` 4 | 2 + 3 | 🔍 | ⬜ | ⬜ |
| P1 | Tienda cliente | `tienda/` (sin vendedor) | 5 | 🔍 | ⬜ | ⬜ |
| P1 | Notificaciones, Búsqueda, Ayuda | 3 | campana + `MichiExplorer` | 🔍 | ⬜ | ⬜ |
| **P1+** | **Admin (superadmin)** | `admin/` 15 | 6 sin guarda | 🔍 | ⬜ | ⬜ |
| P2 | Directorio y citas | `directorio/` 6 | 6 | 🔍 | ⬜ | ⬜ |
| P2 | Adopciones | 12 | 7 | 🔍 | ⬜ | ⬜ |
| P2 | Perdidas | 4 | 3 | 🔍 | ⬜ | ⬜ |
| P2 | Paseadores / Cuidadores | 4+4 | 4+4 | 🔍 | ✅ | ⬜ |
| P2 | Pet-friendly / Establecimientos | 3+4 | 3 / — | 🔍 | ✅ | ⬜ |
| P2 | Grooming / Estilistas | 4+2 | — | 🔍 | ✅ | ⬜ |
| P2 | Entrenadores | 7 | — | 🔍 | ✅ | ⬜ |
| P2 | Transportistas | 8 | — | 🔍 | ✅ | ⬜ |
| P2 | Aseguradoras | 8 | — | 🔍 | ✅ | ⬜ |
| P2 | Laboratorio | 3 | — | 🔍 | ✅ | ⬜ |
| P2 | Funeraria | 10 | — | 🔍 | ✅ | ⬜ |
| P2 | Donaciones | 1 | 1 | 🔍 | ⬜ | ⬜ |
| P3 | Mi clínica | 14 | `directorio/mi-clinica` (con datos *mock*) | 🔍 | ✅ | ⬜ |
| P3 | Servicios pro | 3 | `paseadores/registro`, `cuidadores/registro` | 🔍 | ✅ | ⬜ |
| P3 | Tienda vendedor | 5 | dentro de `/dashboard/tienda` | 🔍 | ✅ | ⬜ |
| P3 | Patrocinadores | 5 | — | 🔍 | ✅ | ⬜ |

## Decisiones

- **2026-10-23 (W3)**:
  - La **landing se conserva en `/`** (es la portada pública, también publicada en su propio dominio). La Inicio
    de la app vive en **`/inicio`**. El resto de rutas son idénticas a las de la app (`/mascotas/[id]`,
    `/tienda/pago-exitoso`, `/reset-password`, `/adopciones/solicitudes`…), que es lo que importa para los `link`
    de las notificaciones y los deep links del backend.
  - `/dashboard` y `/dashboard/*` redirigen con 301 a `/inicio` y `/*` (`next.config.ts`).
  - El shell: sidebar con herramientas del rol en ≥768 px; barra inferior de 4–5 pestañas (Inicio, Explorar,
    Michi-Shop, Perfil y Panel/Admin solo pro) + drawer con `ROLE_TOOLS` en móvil.
- **2026-10-08**:
  - Se rehace la web en **Next.js** como espejo de la app; Expo Web descartado.
  - El código común (types, services, roles, tokens) se **copia como espejo**, sin paquete compartido por ahora, para
    no tocar `mobile/` mientras otra sesión trabaja ahí. `scripts/web-drift.sh` detecta la deriva.
  - **Rutas iguales a la app**, sin `/dashboard`. Las viejas redirigen.
  - El **superadmin es el rol `admin`** actual.
  - Roles y permisos en dos etapas: primero la matriz visible y "ver como rol" (W4-A); después los permisos editables
    (W7, con backend).
  - La web ya está en Vercel.
  - Trabajo aislado en un worktree (`web/espejo`).

## Backlog

- [x] **V1** (2026-10-23: proyecto `michicondrias`, root `frontend/`, producción desde `main`; fallaba por `Sidebar.tsx:141`, ya corregido) Confirmar con el usuario la configuración de Vercel: root dir `frontend`, rama de producción, variable
  `NEXT_PUBLIC_API_URL`, si hay *previews* por rama y desde cuándo falla el build en producción.
- [ ] **V2** Agregar en el `launch.json` de la raíz una entrada que apunte al worktree, para usar `preview_start`.
- [x] **V3** (2026-10-23, `3eb2f9e` en `main`) 🚨 Hotfix en producción: la web publicada escribe **ubicaciones aleatorias** en reportes de perdidas
  (`perdidas/rastreo/[id]/page.tsx:60-74`) y registra **donaciones sin cobro** (`donaciones/page.tsx:51`). Hay que
  desactivar las dos páginas en `main` sin esperar a W3 (requiere el visto bueno del usuario: sale a Vercel).
- [ ] **V4** Pasar a la otra sesión la tabla X1–X8 de `AUDITORIA_WEB.md`. **X1 (2FA saltable en 10 servicios) es de
  seguridad.**
- [ ] **B1–B4** Backend aditivo en core para la consola de admin: `GET /users/` con total y filtros,
  `GET /users/{id}`, `users_count` en roles y borrado seguro de roles (ver `AUDITORIA_WEB.md`).

## Bitácora

- **2026-10-24 — Cableado de endpoints nuevos del backend (Claude).**
  - **Suspender/reactivar clínica** (`/admin/clinicas/[id]`): `is_suspended` en `types/directorio.ts` y
    `services/directorio.ts`; `suspendClinic`/`unsuspendClinic` en `services/moderacion.ts`;
    `useAdminClinicDetail` con mutación + `showAlert` de confirmación (invalida `admin-clinic` y `admin-clinics`);
    badge «Suspendida» y botón «Suspender»/«Reactivar clínica» en la ficha.
  - **Productos ocultos** (`/admin/productos`): `getAdminProducts`/`setProductVisibility` + `AdminProductFilter`
    en `services/ecommerce.ts`; `useAdminProducts` pasa a un solo `GET /products/admin/all` (antes armaba
    público + pendientes y los ocultos no aparecían); chip **«Ocultos»** y acción mostrar/ocultar por fila
    (`Eye`/`EyeOff`, con confirmación al ocultar).
  - **`buyer_name` en pedidos**: verificado en `types/ecommerce.ts` y visible en la tabla de `/admin/pedidos`;
    placeholder del buscador actualizado (folio, comprador o dirección).
  - **Aviso de mantenimiento**: `systemService.getPublicSettings()` (`GET /system/public`, sin sesión) + hook
    `usePublicSettings`/`useMaintenanceMode`; `MaintenanceBanner` no bloqueante en el root layout cuando
    `maintenance_mode` es true.
  - **Sincronización con conteos**: `syncDatabase` tipado como `SyncResult` (`{ message, last_sync, counts }`);
    `useAdminConfig` guarda `lastSyncResult` y `/admin/config` muestra los conteos de tablas (Usuarios, Mascotas,
    Clínicas, Productos, Pedidos, Notificaciones) tras sincronizar.
  - **Verificado:** `tsc` limpio, `eslint --quiet` 0 errores nuevos (20 previos intactos), `next build` verde
    (128 páginas). Revisión visual con mocks de API a 375×812 y 1280×800 en claro y oscuro: detalle de clínica
    (badge Suspendida + Reactivar), productos (chip Ocultos + ojos), pedidos (`buyer_name`) y config. El banner de
    mantenimiento se ve en todas. **No se probaron mutaciones** (la API es producción: suspend/unsuspend, visibility
    y sync escriben). Capturas en `output/ui-*.png` (no commiteadas).

- **2026-10-23 — W5 homologación de diseño con la landing (Claude).**
  - **Inventario real:** de los CSS modules legacy, **11 estaban muertos** (las pantallas ya usaban los de
    `features/` o `pages.module.css`): `home`, `adopciones/*` (4), `carnet/*` (2), `perdidas/perdidas`,
    `perfil/verificacion`, `tienda/producto`, `tienda/compras`. Se borraron.
  - **Migrados a `tokens.css` + `theme.css`** (cero hex, cero variables de `globals.css`):
    `perfil/perfil.module.css`, `dashboard.module.css` (recortado a las 3 clases vivas de `/perdidas/reportar`),
    `modules.module.css` (formularios), `features/adopciones` (1 hex), `ErrorBoundary` (hex + emoji + botón a mano),
    `ToasterProvider`, `OfflineBanner` (hex + emoji; ahora `useSyncExternalStore` y `WifiOff` de lucide).
  - **Componentes muertos borrados** (knip + grep 0 usos): `Sidebar`, `MichiExplorer`, `tienda/CartDrawer`,
    `ui/ConfirmModal`, `ui/CustomSelect` + sus CSS. `ErrorBoundary` pasa al kit (`Button` + tokens).
  - Barrido final: **0 hex y 0 variables legacy** en CSS/TSX fuera de `features/landing` y `globals.css`.
  - **Verificado:** `tsc` limpio, `eslint --quiet` 0 errores en los tocados, `next build` verde. Revisión visual con
    mocks de API a 375×812 y 1280×800 en claro y oscuro: login, `/inicio`, `/adopciones`, `/perdidas`, `/tienda`,
    `/tienda/producto/[id]` (con foto) y el kit. Capturas en `/tmp` (no commiteadas).
  - **Deudas de UI encontradas:** el precio del producto usa `--color-primary` (azul) en vez del dorado de la landing;
    los emojis-ícono de `types/` y `utils/formatters.ts` son espejo de la app y no se tocaron (deriva si se cambian
    solo aquí). `/perfil` y el detalle de producto crashean con datos incompletos de mock (no es bug de producción).
  - **Siguiente (W5):** hover/foco/atajos de escritorio, tablas admin, SEO de la landing y merge a `main`.

- **2026-10-23 — Pulido post W4-A (`d960744`, Mimo).**
  - `AppOnlyNotice` pasa al kit base (`ScreenContainer` + `ScreenHeader` + `Card` + `EmptyState`) en vez de HTML suelto
    con clases legacy.
  - Nuevo `--app-bottom-inset` en `app/theme.css`: los pies fijos («Agendar», «Agregar a la bolsa») de directorio y
    servicios-pro quedaban **detrás** de la barra de pestañas en móvil; ahora se desplazan por encima (0 en escritorio).
  - Verificado: `tsc`, ESLint del archivo tocado y `next build` en verde.

- **2026-10-23 — W4-A consola admin + diseño de la landing (Claude + 4 agentes, `dcde5bc`…`dc2440d`).**
  - Backend core (`c7369c6`): `/users/search`, `/users/{id}`, roles con `users_count`/`is_system` y borrado seguro.
    Directorio (`2beae13`): el admin edita clínicas. **B1–B3 hechos**; B4 (motivo de rechazo KYC) sigue opcional.
  - Guarda de rol global en `(app)/layout.tsx` con `ROUTE_ACCESS`.
  - 18 rutas `/admin/*` (las de la app + `usuarios/[id]` y `pedidos`); `analytics` y `configuraciones` redirigen.
  - `app/theme.css`: capa de diseño web (Hanken Grotesk, CTA dorado, radios/sombras/foco/movimiento de la landing)
    sobre `tokens.css`; kit, shell, formularios, modal y AuthShell la usan.
  - Verificado: `tsc` y `next build` (128 páginas). Falta revisión visual con sesión (admin y consumidor).
  - **Siguiente (W5):** recorrido del consumidor y pantallas con CSS legacy (ver `HANDOFF.md` §3), luego merge.

- **2026-10-23 — W4 P3: Mi clínica completa (Claude).**
  - 14 rutas bajo `/mi-clinica` (panel, agenda, pacientes, ficha médica, configuración, servicios, veterinarios,
    recetas, horarios, cirugías, inventario, laboratorio, videoconsultas y sucursales solo hospital). Los 12 hooks de
    `mobile/src/hooks/clinica` portados a `hooks/clinica` (sin `any`; el formulario se llena del servidor sin
    `setState` en efecto) + `useClinicPatients`. Piezas en `features/mi-clinica` (`ClinicGuard`, `PatientPicker`,
    `DateTimeField`, `format`, estilos) y `components/Modal` nuevo en el kit.
  - `/directorio/mi-clinica` (panel viejo con datos simulados) ahora redirige a `/mi-clinica`.
  - Verificado: `tsc`, ESLint y `next build` (118 páginas) en verde. **P3 completo.**
  - **Siguiente:** W4-A consola admin; luego W5 con la revisión del recorrido del consumidor que pidió el usuario.

- **2026-10-23 — W4 P3: Tienda vendedor (Claude, `3063803`).**
  - `/tienda/vendedor` (panel con ventas cobradas, avisos y más vendidos), `productos` (catálogo con filtros
    `?filtro=`, ocultar/publicar y eliminar con confirmación), `productos/[id]` (alta `nuevo` o edición, foto a URL
    firmada, vista previa lateral en escritorio), `ordenes` (marcar enviado/entregado con confirmación) y
    `analytics` (tendencia de 8 semanas, pedidos por estado). Hooks `useSeller*` y `useProductForm` en
    `hooks/ecommerce`; piezas en `features/tienda/SellerKit.tsx`.
  - Verificado: `tsc`, ESLint y `next build` (106 páginas) en verde.
  - **Siguiente:** Mi clínica (14) y W4-A.

- **2026-10-23 — W4 P3: Servicios pro y Patrocinadores (Claude, `1612641`, `65897f4`).**
  - Servicios pro: `/servicios-pro` (paseadores/cuidadores con `SegmentedControl` + `ProviderCard`),
    `/servicios-pro/perfil` (formulario desde el perfil guardado, sin `setState` en efecto; estado vacío con salida
    a registro) y `/servicios-pro/gestion` (mis tareas). Hooks en `hooks/servicios-pro`.
  - Patrocinadores: listado (banner + clic registrado), `nueva-campana` con validación por campo, `boost-alerta`
    (aviso explícito: el cobro y la difusión ampliada aún no se procesan) y `estadisticas`. `/patrocinadores/nuevo`
    **redirige** a `nueva-campana` (en la app es una pantalla duplicada). Hooks en `hooks/sponsors`, estilos en
    `features/patrocinadores`.
  - Verificado: `tsc` y ESLint limpios en lo nuevo.
  - **Siguiente:** Tienda vendedor (5), Mi clínica (14) y W4-A.

- **2026-10-23 — W4 P2: servicios profesionales (Mimo, cierre de Claude).**
  - Mimo portó paseadores (lista, ficha, registro, solicitudes, calendario), cuidadores (lista, ficha),
    pet-friendly, establecimientos, grooming, estilistas, entrenadores, transportistas, aseguradoras,
    laboratorio y funeraria, con hooks por módulo (`hooks/{paseadores,cuidadores,petfriendly,venues,grooming,
    training,rides,insurance,laboratorio,funerary}`) y piezas compartidas en `features/servicios-pro`
    (`ServiceRequestCard`, `ProviderProfile`, `CalendarBoard`). Quedó sin commit; Claude corrigió el tipo de
    `walker_id` en `paseadores/solicitudes` y lo cerró.
  - Verificado: `tsc` limpio, `next build` verde, ESLint limpio en lo nuevo (los 27 errores restantes son legacy:
    `admin/*`, `cuidadores/registro`, `cuidadores/solicitudes`).
  - Claude portó `cuidadores/registro` (campos según tipo de servicio), `cuidadores/solicitudes` y
    `cuidadores/calendario` con los hooks de Mimo. P2 completo.
  - **Siguiente:** P3 (mi-clínica, servicios-pro, tienda vendedor, patrocinadores) y W4-A.

- **2026-10-23 — W4 port multiagente: Adopciones, Directorio, Perdidas, Notificaciones, Búsqueda, Ayuda.**
  - Varios agentes en paralelo por módulo (solo en sus carpetas). Quedaron hooks y features por módulo
    (`hooks/adopciones`, `hooks/directorio`, `hooks/perdidas`, `hooks/notifications`, `hooks/search` y
    `features/adopciones|directorio|perdidas`).
  - Rutas nuevas: `/adopciones/{nuevo,solicitar/[id],solicitud/[id]}`, `/directorio/especialista/[id]`,
    `/perdidas/{reportar,rastreo/[id]}`, además de Notificaciones/Búsqueda/Ayuda reales.
  - Donaciones queda «Disponible en la app» (sin cobro simulado). Perdidas no inventa coordenadas.
  - Verificado: `typecheck`, `eslint` y `npm run build` limpios.
  - **Siguiente para Claude:** módulos P2 restantes (paseadores/cuidadores, estilistas, entrenadores,
    transportistas, aseguradoras, laboratorio, funeraria, pet-friendly/establecimientos), P3 (mi-clínica
    completa, servicios-pro, tienda vendedor, patrocinadores) y **W4-A consola de admin**. Luego W5 (pulido
    y merge a `main`) y el OTA del login móvil.
- **2026-10-23 — W4 Tienda cliente + Inicio/Explorar.**
  - **Tienda:** hooks `useShopTab`, `useProduct`, `useCheckout`, `useCartProducts`, `usePurchases`,
    `useOrderDetail`, `useProductFavorites` + `features/tienda/orderStatus` y `PagoResultado`. Páginas
    `/tienda` (catálogo con categorías/orden/vistas y favoritos), `/tienda/carrito` (dirección + Stripe),
    `/tienda/compras` (filtros por estado), `/tienda/producto/[id]`, `/tienda/pedido/[id]` (tracking + pagar
    o cancelar) y `pago-exitoso`/`pago-cancelado` con `PagoResultado` (vacía la bolsa solo en éxito).
  - **Inicio:** `useHome` — saludo, mascotas, próximas citas y atajos de `ROLE_TOOLS` (o los del dueño).
  - **Explorar:** `useExplore` — 15 servicios en Salud/Servicios/Comunidad con filtro por categoría.
  - Verificado: `typecheck` y `eslint` limpios en archivos nuevos; `npm run build` verde.
  - **Siguiente para Claude:** `perfil/partner` + `perfil/verificacion` (faltan `useKYC`/`usePartnerUpgrade`),
    Notificaciones/Búsqueda/Ayuda, Admin (W4-A) y módulos P2/P3.
- **2026-10-23 — W4 módulos Carnet y Perfil.**
  - **Carnet:** `useVaccineForm`, `useConsultationForm`, `usePrescriptionDetail`. `/carnet` (lista de carnets),
    `/carnet/[pet_id]` → redirect a `mascotas/[id]?tab=salud`, `/carnet/nueva-vacuna`, `/carnet/nueva-consulta`
    (con receta), `/carnet/receta/[id]` (ticket). `features/carnet/CarnetItems` (`VaccineItem`, `RecordItem`)
    conectados en la ficha de mascota con editar/eliminar.
  - **Perfil:** `useProfile`, `useAccount`, `use2FA` + `constants/support`. `/perfil` (cuenta, actividad,
    apariencia, legal), `/perfil/editar`, `/perfil/seguridad-2fa` (clave + enlace otpauth, sin lib de QR),
    `/perfil/eliminar-cuenta` (confirmación + 2FA si está activo). Quedan legacy `partner` y `verificacion`
    (W4 los rehace con `useKYC`/`usePartnerUpgrade`).
  - Verificado: `typecheck` y `eslint` limpios en archivos nuevos; `npm run build` verde.
- **2026-10-23 — W4 módulo Mascotas.**
  - `usePets`, `usePetDetail`, `usePetForm` y `usePetHealth` espejo (con `next/navigation`). Utils espejo
    `helpers`, `upload`, `payments`. `FormImagePicker` nuevo en el kit.
  - `/mascotas`: lista con 3 modos de vista (cuadrícula, lista, tarjetas), skeleton y vacío con una acción.
  - `/mascotas/[id]`: ficha con Resumen (edad, peso, vacunas al día calculadas del carnet, Michi-Tracker,
    descripción), Salud (vacunas + entrada a IA) e Historial (consultas). Compartir carnet con enlace de 24 h.
  - `/mascotas/nuevo`: formulario con foto, información básica y salud (validación inline).
  - Verificado: `typecheck` y `eslint` limpios, `npm run build` verde. Falta `editar/[id]`, `diagnostico-ia`
    y el detalle fino de carnet (`PetHealthTabs`) — van con el módulo carnet.
- **2026-10-23 — W3 Navegación y esqueleto.**
  - Rutas iguales a la app en `src/app/(app)/` (sin `/dashboard`): 47 páginas movidas con links reescritos;
    tabs nuevos `inicio`, `explorar`, `menu`, `notificaciones`, `busqueda`, `ayuda`. `/` sigue siendo la landing.
  - Auth en `src/app/(auth)/` con `AuthShell` y los hooks espejo `useLogin` / `useRegister` / `usePasswordReset`
    (login con 2FA, registro con login automático, recuperación con código + deep link `?token=`).
  - Shell `AppShell`: sidebar con `ROLE_TOOLS` en escritorio, barra inferior de pestañas + drawer en móvil,
    `CartContext` espejo en `src/contexts/`, guarda de sesión en `(app)/layout.tsx`.
  - `next.config.ts`: `redirects` de `/dashboard` → `/inicio` y `/dashboard/:path*` → `/:path*`. `AuthRedirect`
    de la landing ahora apunta a `/inicio`.
  - Se borró `src/app/dashboard/`. Quedan `Sidebar.tsx` y `MichiExplorer.tsx` sin uso (los borra W5).
  - Verificado: `npm run typecheck` y `eslint --quiet` limpios en archivos nuevos; `npm run build` en verde (52 páginas).
  - Siguiente: W4 — portar módulos P1 (auth ya está; pestañas Inicio/Explorar/Tienda/Perfil reales, mascotas, carnet,
    tienda cliente, notificaciones) sobre este esqueleto.
- **2026-10-08 — W0 Cimientos.**
  - Worktree `../michicondrias-web` en la rama `web/espejo`.
  - **Build arreglado**, fallaba por dos causas:
    - `Sidebar.tsx:141` importaba `getPlaces` de `mascotas` (es de `petfriendly`).
    - Las páginas con `useSearchParams` no estaban dentro de `<Suspense>`. Se resolvió en `dashboard/layout.tsx`.
  - Herramientas:
    - ESLint 9 con `eslint-config-next` (`eslint.config.mjs`), knip (`knip.json`).
    - Scripts `typecheck`, `lint`, `check`, `deadcode`; `dev` en el puerto 3001.
  - Hooks `lint-file.sh` y `typecheck-on-stop.sh` ahora cubren `frontend/` y sirven en worktrees. Entrada `web` en
    `.claude/launch.json`.
  - Nuevos: `scripts/web-drift.sh`, `frontend/CLAUDE.md`, este documento y `AUDITORIA_WEB.md`.
- **2026-10-08 — W1 Auditoría** (4 agentes Explore en paralelo: P1, P2, admin + pro, permisos del backend).
  - `AUDITORIA_WEB.md` tiene el mapa completo app → web, el rescatable y los hallazgos.
  - `docs/PERMISOS_BACKEND.md` tiene la matriz de acceso de los 17 servicios, base de W4-A y W7.
  - Conclusión: no se rescata ninguna página tal cual; se porta la app y se reaprovechan piezas sueltas (Leaflet,
    Stripe, S3, Recharts, visor KYC).
  - Hallazgos urgentes: tracker falso y donaciones sin cobro en la web publicada (V3); 2FA saltable en 10 servicios
    del backend (X1).
- **2026-10-23 — Producción y W2 (parte 1).**
  - En `main` (`3eb2f9e`): build de Vercel en verde otra vez (getPlaces + Suspense, mismos arreglos de W0) y V3 hecho:
    rastreo de perdidas y donaciones muestran «Disponible en la app» en vez de datos simulados. La landing nueva ya
    estaba en `/` y también se publica sola en `michicondrias-landing-page.vercel.app` (repo aparte).
  - `main` fusionado en `web/espejo` (82 commits de la app + landing).
  - Auditoría web ↔ app actualizada (ver `AUDITORIA_WEB.md`, sección 2026-10-23): **37 de 156** pantallas tienen página.
  - W2: el código viejo pasa a `src/lib/legacy/` (api, services, auth) sin cambios de lógica; copias espejo de la app en
    `src/types`, `src/services`, `src/constants` (roles, roleTools, modules, design, palettes) y `src/utils`;
    `src/lib/api.ts` espejo (token en `localStorage`), `src/lib/rnShim.ts` y `src/lib/uiScale.ts` para lo nativo.
  - Tokens: `scripts/web-tokens.py` genera `src/app/tokens.css` (42 colores claro/oscuro, espacios, radios, letra)
    desde los espejos. `--radius-lg` pasa de 20 a 16 px también en las páginas viejas.
  - Siguiente: contextos (Auth, Theme, Cart) y componentes base con los mismos nombres y props que la app.
- **2026-10-23 — W2 parte 2 (kit base).**
  - Contextos: `ThemeContext` (claro/oscuro/sistema con `data-theme` y `useSyncExternalStore`) y `AuthContext` (misma
    lógica que la app); `useTheme`, `useScreenAccent`; `lib/prefs`, `sessionStorage`, `cartStorage` con `localStorage`.
  - Componentes con los mismos nombres y props que la app: `Button`, `IconButton`, `Card`, `Badge`, `FilterChip`,
    `SectionHeader`, `ListRow`, `EmptyState`, `SearchBar`, `SegmentedControl`, `Skeleton`/`SkeletonList`/`SkeletonGrid`,
    `FormField`, `forms/FormSection|FormSelect|FormSwitch`, `layout/ScreenContainer|ScreenHeader`, `QueryErrorBanner`,
    `RoleGuard`, `AppAlert` (`showAlert`), `AppProviders`. Estilos solo con variables de `tokens.css`.
  - `/kit` (noindex): vitrina revisada a 1280 y 375 px, claro y oscuro, sin errores. Tipos y lint limpios.
  - Falta del kit: `CartContext`, `DetailLayout`, `HeroBackground`, `KeyboardScreen`, `AuthShell`, `BottomSheet`,
    `DatePicker`, `MediaCard`, `StatTile`, `SummaryCard`, `MiniBarChart`, `OptionMenu`, `QuantityStepper`,
    `ViewModeToggle`, `DataList`, `FormImagePicker`, `WebMapView`, reseñas y viajes. Se agregan al portar el módulo que
    los use (W4) o en W3 si son de estructura (`AuthShell`, `CartContext`).

