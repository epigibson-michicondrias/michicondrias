# HANDOFF — Michicondrias (contexto vivo para Mimo y Claude)

Este archivo es **la memoria compartida** entre los agentes que trabajan en Michicondrias: **Mimo** (Xiaomi, `mimo`) y
**Claude Code**. El usuario alterna entre los dos cuando a uno se le acaba el uso, así que quien llegue lee esto primero
y sigue donde se quedó el otro.

> ## ⚠️ Regla obligatoria: actualizar este archivo en CADA cambio
> Cualquier agente, al terminar cualquier cambio (código, deploy, config, docs, decisión), **antes de cerrar el turno**:
> 1. Agrega una entrada arriba en **§4 Bitácora compartida**: fecha, agente, qué se hizo, archivos/commits, si se
>    desplegó y qué quedó a medias.
> 2. Mueve a hecho (o agrega) lo que corresponda en **§3 Pendientes**.
> 3. Si cambió algo de §1–§2 (repos, URLs, estado de un frente), actualízalo.
> 4. Incluye este archivo en el mismo commit del cambio.
>
> Los documentos por frente (`PROGRESO_MOBILE.md`, `PROGRESO_WEB.md`, `AUDITORIA_*.md`) siguen teniendo el detalle;
> aquí va el resumen para no perder el hilo.

**Idioma:** todo en español (UI, commits, docs). Variables y funciones en inglés. Reglas completas: [`CLAUDE.md`](CLAUDE.md)
(aplica a cualquier agente; los hooks de `.claude/` no corren en Mimo: respeta §3 Intocables a mano y corre los checks).

---

## 1. Mapa: qué hay y dónde vive

| Frente | Dónde | Producción | Cómo se despliega |
|---|---|---|---|
| App móvil (Expo) | `mobile/` del monorepo | APK + OTA (`expo-updates`) | OTA para JS; APK nuevo para nativo (ver Anexo A §3) |
| Backend (17 FastAPI) | `backend/` del monorepo | `https://michicondrias.duckdns.org/<servicio>/api/v1` (VM Oracle) | push a `main` que toque `backend/**` → GitHub Actions `deploy-oracle.yml`. Migraciones: `alembic upgrade head` **a mano antes** |
| Web app (Next.js 16) | `frontend/` del monorepo | https://michicondrias.vercel.app (Vercel, proyecto `michicondrias`, root `frontend/`) | push a `main` → Vercel. Variable `NEXT_PUBLIC_API_URL=https://michicondrias.duckdns.org` |
| Rediseño de la web («web espejo») | worktree `../michicondrias-web`, rama `web/espejo` | *preview* de Vercel por rama | se fusiona a `main` solo con fase verificada y visto bueno del usuario. Plan: `PROGRESO_WEB.md` (en esa rama) |
| Landing pública | repo aparte `../michicondrias-landing` (GitHub `michicondrias-landing-page`) | https://michicondrias-landing-page.vercel.app | push a `main` de ese repo → Vercel. **Fuente:** `frontend/src/features/landing/` + `frontend/public/landing/` del monorepo; se copian allá (sin `AuthRedirect.tsx`) |
| Docs | proyecto Vercel `michicondrias-docs` | (Vercel) | automático |

- **GitHub:** cuenta `epigibson-michicondrias`. Push: `GH_TOKEN=$(gh auth token --user epigibson-michicondrias) git -c credential.helper= -c 'credential.helper=!gh auth git-credential' push origin <rama>` (la cuenta activa de `gh` puede ser otra → 403).
- **Autonomía:** el usuario autoriza desplegar (push a `main`, `alembic` en prod) y borrar código muerto verificado sin pedir permiso por bloque. Sí pregunta antes de rediseños de flujo, borrar pantallas o tocar intocables (Anexo A §6).
- **Marca:** paleta *Midnight & Gold* (fondo `#0b0e17`, dorado `#e9c883`, azul `#4f8cff`). **Los gatos van primero** en fotos, ejemplos y textos ("gatos y perros"); los paseos son la excepción natural.
- **Nada inventado en textos públicos:** ni cifras, ni testimonios, ni funciones que la app no tiene. Verificar en el código antes de prometer algo.
- **Mimo:** `scripts/sync-mimo.sh` le pasa skills de `.claude/skills`, agentes de `.claude/agents` y MCP de `.mcp.json` a `.mimocode/`. Las skills de diseño (UI/UX Pro Max, `motion`) están enlazadas en `~/.agents/skills`.
- **Local:** `next dev` con Turbopack falla en el monorepo por `postgres_data/` (de otro usuario): usar `next dev --webpack`. En el worktree y en el repo de la landing Turbopack sí funciona.

---

## 2. Estado por frente (al 2026-10-23)

| Frente | Estado |
|---|---|
| App móvil | Fases 0–3 ✅ · Fase 4 🟡 (F1–F27 hechos en P1) · Fase 5 🟡 (U1–U2 ✅, U3–U11 pendientes). Detalle: `PROGRESO_MOBILE.md` |
| Backend | En producción y desplegando bien. Pendiente de seguridad X1 (abajo) |
| Web app (`main`) | Código viejo (50 páginas bajo `/dashboard`) + landing nueva en `/`. Build en verde desde `3eb2f9e`. Rastreo y donaciones simulados desactivados |
| Web espejo (`web/espejo`) | W0 ✅ W1 ✅ W2 ✅ **W3 ✅**: rutas iguales a la app (`(auth)`/`(app)`, sin `/dashboard`), shell sidebar/barra inferior, AuthShell + login 2FA, redirects. Build 52 páginas en verde. **37 de 156** pantallas de la app tienen página (contenido legacy a portar en W4) |
| Landing | Publicada (Next.js). 11 secciones, 28 funciones reales, fotos de Gemini con gatos al frente |

---

## 3. Pendientes (prioridad de arriba hacia abajo)

**Urgentes / seguridad**
- [x] **Login web** (2026-10-23): el bundle publicado ya usa `https://michicondrias.duckdns.org` (antes el AWS viejo → «NetworkError»).
- [x] **X1** (2026-10-23) 2FA saltable en 10 servicios: ya rechazan el token temporal (`is_temp`).
- [ ] **X2–X8** del backend (admin sin pasar guardas, servicios sin moderación, etc.): tabla en `AUDITORIA_WEB.md` (rama `web/espejo`) y `docs/PERMISOS_BACKEND.md`.

**App móvil — publicar**
- [x] **OTA del arreglo del login** (2026-10-23, Mimo): publicado en el canal `production` (runtime 1.0.0), update group
  `a84459e2-d146-42cd-a26e-0c4cc3b9b480`. Commit `89a584e`.

**Web espejo** (`../michicondrias-web`, leer `PROGRESO_WEB.md` y `frontend/CLAUDE.md` de esa rama)
- [x] W2 (`bd1831f`, `f72e123`): espejos, `api.ts`, `tokens.css`, contextos Theme/Auth/Cart y kit base.
- [x] W3 (2026-10-23): grupos `(auth)`/`(app)`, rutas iguales a la app (Inicio en `/inicio`; `/` queda la landing),
  `AppShell` (sidebar + barra inferior + drawer de `ROLE_TOOLS`), `AuthShell` con login 2FA / registro / reset,
  redirects `/dashboard/*`. Build en verde (52 páginas). **Queda en `web/espejo` sin fusionar.**
- [x] W4 completo (P1, P2, P3 y W4-A consola admin, 2026-10-23).
- [x] Backend que pidió la consola (2026-10-23, Mimo): `buyer_name` en `/orders/admin/all`; `GET /products/admin/all`
  (incluye ocultos por el vendedor) + `PATCH /products/admin/{id}/visibility`; `POST /clinics/admin/{id}/suspend|unsuspend`
  con `is_suspended` (migración `c4e8a1b2d3f4` de directorio — **correr `alembic upgrade head` tras el deploy**);
  config con efecto real (`GET /system/public`, login bloqueado en `maintenance_mode` salvo admin, `sync_database`
  devuelve conteos). **Falta cablear en la web espejo:** `suspendClinic`/`unsuspendClinic`, `getAdminProducts` y el
  aviso de mantenimiento (la app móvil ya los usa).
- [x] KYC en la app (2026-10-23, Mimo): aprobar sin confirmar, rechazar con confirmación (`useAdminVerifications`).
- [ ] Pantallas portadas que aún usan CSS legacy (variables viejas y `#fff`, se ven mal en modo claro): dashboard/home,
  adopciones, carnet, perdidas, perfil, tienda/producto y compras, `(auth)/auth.module.css`. Componentes muertos
  candidatos a borrar: `Sidebar`, `tienda/CartDrawer`, `ui/ConfirmModal`, `ui/CustomSelect`. Entra en la revisión del
  consumidor (W5). ·
- [ ] Revisar el recorrido del **consumidor** en la web espejo: el usuario dice que hay muchas cosas que corregir
  (pendiente de detallar; hacerlo antes del merge). ·
  W5 pulido y merge · W7 permisos.
- [ ] B1–B4 backend aditivo en core para la consola de admin. V2 entrada de `launch.json` para el worktree.

**Landing**
- [ ] Foto `pro-transporte` (prompt 12 en `docs/landing-fotos-prompts.md`) → `frontend/public/landing/pro-transporte.webp` y conectarla en `ProRail.tsx`.
- [ ] Enlace de descarga (APK/tienda) → `NEXT_PUBLIC_APP_DOWNLOAD_URL` para mostrar «Descargar la app».
- [ ] Cada cambio de landing: copiar al repo `michicondrias-landing`, `npx next build`, push.

**App móvil** (detalle con IDs en `PROGRESO_MOBILE.md` → Backlog)
- [ ] Bloque A (Fase 4 en P1), Bloque B (auditoría P2/P3: A1–A5), Bloque C (U3–U11 y APK único). Ver Anexo A §8.

**Varios**
- [ ] Mimo: `mimo mcp auth supabase` y `mimo mcp auth expo` (OAuth, una vez).
- [ ] `npm audit` en `frontend/`: 6 vulnerabilidades (1 crítica) de dependencias viejas.

---

## 4. Bitácora compartida (más reciente arriba)

- **2026-10-23 · Mimo** — **U7 Carnet** cerrada: 4 hex de `receta/[id]` a tokens; 0 hex en el módulo. Sigue **U9**
  (U8 Tienda ya estaba hecho).
- **2026-10-23 · Mimo** — **U6 Mascotas** cerrada (`output/u6-mascotas/`): `diagnostico-ia` a `FormField` con
  validación inline, 0 hex y 0 `TextInput` en el módulo. Sigue **U7 Carnet**.
- **2026-10-23 · Mimo** — **U5 Perfil** cerrada (`output/u5-perfil/`): `app/perfil/` con 0 hex, `eliminar-cuenta` a
  `AuthField` con validación inline. Sigue **U6 Mascotas**.
- **2026-10-23 · Mimo** — **U4 Inicio/Explorar/Herramientas** cerrada (`output/u4-home/`): `EmptyState` con acción en
  Herramientas y el vacío de citas pasa al componente `EmptyState`. Las 3 pantallas cumplían tokens/refresh; Skeleton
  solo aplica en Inicio (los otros dos son catálogo estático). Sigue **U5 Perfil**.
- **2026-10-23 · Mimo** — **U3 Auth (Fase 5) completa** en la app móvil: componente `AuthField` (pill + ícono + error
  inline) en las 4 pantallas de `(auth)`, validación por campo con `validators.ts`, etiquetas en español, acento
  unificado a `theme.primary` y checkbox de Términos real. Capturas en `output/u3-auth/`. **Pendiente:** el modo
  oscuro no aplica en web (tema no responde a `prefers-color-scheme`) — revisar `ThemeContext`. Sigue U4 (Inicio,
  Explorar y Herramientas).
- **2026-10-23 · Mimo** — **Backend de la consola admin** (en `main`, **sin deploy todavía**):
  - ecommerce: `buyer_name` también en `/orders/admin/all`; `GET /products/admin/all` (filtros published/review/hidden/out)
    y `PATCH /products/admin/{id}/visibility` para mostrar/ocultar productos del vendedor.
  - directorio: columna `clinics.is_suspended` (**migración `c4e8a1b2d3f4`**, aditiva) + `POST /clinics/admin/{id}/suspend`
    y `/unsuspend`. El directorio público y la búsqueda de core omiten las suspendidas.
  - core: `GET /system/public` (mantenimiento, OTAs, push, `cache_version`) para que los clientes reaccionen;
    `login` devuelve 503 en `maintenance_mode` salvo admin; `POST /admin/system/database/sync` devuelve conteos reales.
  - app móvil: KYC aprobar sin confirmar / rechazar con confirmación; `useAdminProducts` con `admin/all` (ve ocultos);
    suspender/reactivar clínica cableado en `useAdminClinicDetail`.
  - Verificado: `py_compile` de los archivos tocados y `tsc`/ESLint limpios en móvil. **Desplegado** (`a5a383e` →
    `deploy-oracle.yml` en verde) y migración `c4e8a1b2d3f4` aplicada en la VM (directorio en head). 17/17 servicios
    activos; `/system/public` responde y los admin devuelven 401 sin sesión. Falta cablear los mismos endpoints en la
    web espejo.
- **2026-10-23 · Mimo** — Web espejo: pulido post W4-A (`d960744` + `68cb18d` en `web/espejo`, sin producción):
  `AppOnlyNotice` al kit base y `--app-bottom-inset` para que los pies fijos no queden detrás de la barra de pestañas.
  `tsc`/ESLint/`next build` en verde. Sigue W5 (recorrido del consumidor + CSS legacy).
- **2026-10-23 · Mimo** — **OTA del login publicada** (pendiente urgente de §3): canal `production`, runtime 1.0.0,
  update group `a84459e2-d146-42cd-a26e-0c4cc3b9b480`, mensaje «fix: login muestra errores y pide el código 2FA».
  Lleva el fix `89a584e` (login con `onError` y paso 2FA). `mobile/.env` ya apunta a `michicondrias.duckdns.org`.
- **2026-10-23 · Claude** — W4-A **terminada** y diseño homologado (`dc2440d` en `web/espejo`, push; build verde, 128
  páginas). 18 rutas de admin. Diseño: `frontend/src/app/theme.css` (capa web sobre `tokens.css`; el espejo queda
  intacto) con Hanken Grotesk, CTA dorado, tarjetas con brillo y navegación en vidrio; el primario vuelve a azul
  cambiando `--color-cta`. Backend `2beae13`: el admin puede editar clínicas. Falta revisión visual con sesión.
- **2026-10-23 · Claude** — W4-A consola admin (en curso):
  - **Backend desplegado** (`c7369c6`, sin migraciones): `GET /users/search` (paginado con total y filtros),
    `GET /users/{id}` (detalle + KYC firmado), `GET /roles/` con `users_count`/`is_system`; roles del sistema no se
    borran ni renombran y un rol con usuarios no se borra. `GET /users/` quedó igual (la app lo usa). Probado.
  - Web (`web/espejo`, `dcde5bc`, `f435930`): **guarda de rol global** en el layout de `(app)` con `ROUTE_ACCESS`
    (antes la web no validaba ninguna zona de rol); hooks `hooks/admin`; panel `/admin`, `/admin/usuarios` (búsqueda
    en servidor) y `/admin/usuarios/[id]`.
  - 4 agentes en paralelo: roles + matriz de permisos/"ver como rol", verificaciones y moderación; stats, config y
    categorías (+ redirects `analytics`→`stats`, `configuraciones`→`config`); clínicas, veterinarios, productos,
    mascotas, servicios y pedidos; y **homologar el diseño de la web app con la landing** (tokens, kit y shell).
  - Cuentas de prueba: `test.<rol>@example.com` (18, una por rol; verificadas). La contraseña está en
    `scripts/seed_test_data.py` (local, no se sube al repo).

- **2026-10-23 · Claude** — W4 Mi clínica completa en `web/espejo` (push, sin producción): 14 rutas `/mi-clinica/*`,
  hooks `hooks/clinica`, `components/Modal`; `/directorio/mi-clinica` redirige. Build verde (118 páginas). P3
  terminado. **Decisión del usuario:** terminar todo en la rama (falta W4-A admin y revisar al consumidor en la web
  espejo) y fusionar a `main` al final; la web en producción sigue siendo la vieja hasta entonces.

- **2026-10-23 · Claude** — W4 Tienda vendedor en `web/espejo` (`3063803`, push, sin producción): panel, catálogo,
  alta/edición de producto, pedidos y analíticas. `next build` verde (106 páginas). **Siguiente:** Mi clínica (14) y
  W4-A. El usuario reporta «muchas cosas que corregir para el consumidor» (pendiente de detallar).

- **2026-10-23 · Claude** — W4 P3 en `web/espejo` (push, sin producción): Servicios pro (`1612641`: listado,
  perfil profesional, mis tareas) y Patrocinadores (`65897f4`: campañas, nueva campaña, impulso de alerta con aviso
  de que no hay cobro, estadísticas; `/patrocinadores/nuevo` redirige a `nueva-campana`). `tsc`/ESLint limpios.
  Permisos de lectura, edición y checks agregados en `.claude/settings.local.json` (el clasificador de auto mode
  fallaba a ratos). **Siguiente:** Tienda vendedor (5 pantallas), Mi clínica (14) y W4-A.

- **2026-10-23 · Claude** — W4 P2 cerrado en `web/espejo` (`345a2cd`, `a0afcbd`, push, sin producción). Mimo había
  dejado sin commit el port de paseadores, cuidadores, pet-friendly, establecimientos, grooming, estilistas,
  entrenadores, transportistas, aseguradoras, laboratorio y funeraria (hooks por módulo + `features/servicios-pro`).
  Claude corrigió un error de tipos (`walker_id` en `paseadores/solicitudes`) y portó `cuidadores/registro`,
  `cuidadores/solicitudes` y `cuidadores/calendario`. `tsc` limpio, `next build` verde, ESLint limpio en lo nuevo
  (quedan errores legacy en `admin/*`). **Siguiente:** P3 (mi-clínica, servicios-pro, tienda vendedor,
  patrocinadores) y W4-A consola admin.

- **2026-10-23 · Mimo** — W4 multiagente en `web/espejo` (`a4e7d4e`): Adopciones, Directorio/citas,
  Perdidas/reportes, Notificaciones, Búsqueda y Ayuda portados con hooks y features por módulo. Build
  verde. Donaciones = aviso «en la app» (sin cobro simulado). **Siguiente para Claude:** P2 restantes
  (paseadores, cuidadores, estilistas, entrenadores, transportistas, aseguradoras, laboratorio, funeraria,
  pet-friendly, establecimientos), P3 (mi-clínica, servicios-pro, tienda vendedor, patrocinadores) y W4-A
  (consola admin). Luego W5 (pulido + merge a `main`) y el OTA del login móvil (§3).

- **2026-10-23 · Mimo** — W4 Tienda cliente + Inicio/Explorar en `web/espejo`:
  - Tienda: catálogo (categorías, orden, favoritos), bolsa con checkout Stripe, mis compras, producto,
    pedido con tracking y `PagoResultado` (pago-exitoso/cancelado). Hooks ecommerce espejo.
  - Inicio (`/inicio`): mascotas, próximas citas y atajos de `ROLE_TOOLS`. Explorar (`/explorar`): 15
    servicios con filtro por categoría. Build verde.
  - **Siguiente para Claude:** portar `perfil/partner` y `perfil/verificacion` (crear `useKYC` y
    `usePartnerUpgrade`), Notificaciones/Búsqueda/Ayuda, Admin (W4-A), y P2/P3. Luego W5 (pulido y merge
    a `main`) y recordar el OTA del login móvil (§3).

- **2026-10-23 · Mimo** — W4 Carnet + Perfil en `web/espejo` (ver `PROGRESO_WEB.md`): hooks y páginas de carnet
  (vacunas, consultas, receta ticket, `CarnetItems` en la ficha) y de perfil (cuenta, editar, 2FA, eliminar
  cuenta). Build verde. Queda legacy `perfil/partner` y `perfil/verificacion` por portar. Siguiente módulo:
  Tienda cliente o Inicio/Explorar reales.

- **2026-10-23 · Mimo** — W4 módulo Mascotas en `web/espejo` (`f5d4f12`): hooks espejo de mascotas + carnet,
  `FormImagePicker`, utils de S3/upload/Stripe. `/mascotas` (3 vistas), `/mascotas/[id]` (Resumen·Salud·Historial)
  y `/mascotas/nuevo`. Build verde. Falta editar, IA y carnet fino.

- **2026-10-23 · Mimo** — Web espejo W3 en `web/espejo` (sin producción, **sin commit todavía**): grupos `(auth)` y
  `(app)` con rutas iguales a la app (Inicio en `/inicio` porque `/` es la landing; deep links `/mascotas/[id]`,
  `/tienda/pago-exitoso`, `/reset-password` intactos); `AppShell` (sidebar con `ROLE_TOOLS` ≥768 px, barra inferior de
  pestañas + drawer en móvil); `AuthShell` + hooks espejo `useLogin`/`useRegister`/`usePasswordReset` (login 2FA,
  registro con login automático, reset con código y `?token=`); `CartContext` espejo; redirects `/dashboard/*`. 47
  páginas movidas de `dashboard/` a `(app)/` con links reescritos; tabs nuevos `explorar`, `menu`, `notificaciones`,
  `busqueda`, `ayuda`. `typecheck` + `eslint` limpios en archivos nuevos; `npm run build` verde (52 páginas);
  `web-drift.sh` 52 iguales / 0 difieren. Siguiente: W4 (portar módulos P1 sobre este esqueleto).
- **2026-10-23 · Claude** — App: regresión del login (`a994753`, U3) — sin mensaje con contraseña incorrecta y las
  cuentas con 2FA no podían entrar (no pasaba al paso del código). Se restauran `onSuccess` (temp_token → paso 2FA) y
  `onError` en `login.tsx`. Commit en `main`; **falta publicar la OTA** (ver §3, no pude leer `.env`). Aviso: Mimo tiene
  W3 sin commit en el worktree (`(auth)`, `(app)`, `AppShell`, `AuthShell`, `CartContext`); Claude no lo tocó.
- **2026-10-23 · Claude** — Web espejo W2 parte 2 en `web/espejo` (`f72e123`, sin producción): `main` fusionado otra
  vez (trae `sync-mimo.sh` y X1); `ThemeContext` (claro/oscuro/sistema) y `AuthContext` espejo; kit base de 20
  componentes con las mismas props que la app (Button, Card, ListRow, FormField, ScreenHeader, AppAlert, RoleGuard…),
  estilos solo con `tokens.css`. Vitrina `/kit` revisada a 1280/375, claro y oscuro. Build y lint limpios. Siguiente:
  W3 (rutas iguales a la app con grupos `(auth)`/`(app)`, `AuthShell` y shell con barra lateral/inferior).
- **2026-10-23 · Claude** — Seguridad X1: aseguradoras, cuidadores, paseadores, entrenadores, establecimientos,
  estilistas, funeraria, laboratorio, patrocinadores y transportistas aceptaban el token temporal de 2FA (que ya lleva
  `role`), así que se podía saltar el 2FA. `_decode_token` ahora lo rechaza (403 «Se requiere completar la verificación
  2FA», igual que mascotas/core) y `get_optional_user_id` lo trata como sin sesión. Probado con JWT reales en los 10.
  Sin migraciones. Desplegado con `deploy-oracle.yml`.
- **2026-10-23 · Claude** — Verificado: tras el redeploy de `c37f2d4`, la web publicada llama a
  `https://michicondrias.duckdns.org`; el login ya no da «NetworkError».
- **2026-10-23 · Claude** — Este archivo pasa a ser el contexto vivo para Mimo y Claude (regla: actualizarlo en cada
  cambio). La web en Vercel tenía `NEXT_PUBLIC_API_URL` apuntando al AWS viejo; el usuario la cambió a
  `https://michicondrias.duckdns.org` y este commit dispara el redeploy.
- **2026-10-23 · Claude** — Mimo con las herramientas del proyecto: `scripts/sync-mimo.sh` (skills, agentes, MCP),
  skills de diseño enlazadas en `~/.agents/skills`, nota en `CLAUDE.md` §7 (`bfe988e`).
- **2026-10-23 · Claude** — Web espejo W2 parte 1 en `web/espejo` (`bd1831f`, sin producción): `main` fusionado en la
  rama; código viejo a `src/lib/legacy/`; copias espejo de la app (web-drift: 52 iguales); `src/lib/api.ts` espejo;
  `scripts/web-tokens.py` → `src/app/tokens.css` (Midnight & Gold claro/oscuro). Auditoría: 37/156 pantallas.
- **2026-10-23 · Claude** — Producción web (`3eb2f9e`): build de Vercel en verde (fallaba por `Sidebar.tsx:141` y
  `useSearchParams` sin `Suspense`); rastreo de perdidas (escribía coordenadas aleatorias) y donaciones (sin cobro)
  ahora dicen «Disponible en la app».
- **2026-10-23 · Claude** — Landing publicada en `michicondrias-landing-page.vercel.app`: el repo de Astro pasó a
  Next.js con la landing nueva (`b0826e7`, `a2d587a`); botones a la web app. Monorepo: enlaces centralizados en
  `links.ts` (`05a0406`).
- **2026-10-22/23 · Claude** — Landing nueva (`2a94044`, `3bf2a8b`, `3a71ebf`, `8cbd1f2`): Midnight & Gold, Hanken
  Grotesk, `motion` + `lenis`. Hero con foto y carnet animado; etapas con foto; rueda de funciones (port de works-wheel
  de 21st.dev); catálogo de 28 funciones reales; Michi-IA (chat con el formato real); así funciona adoptar; un día con
  tu mascota; promesas; profesionales (12 oficios con foto); app; FAQ; footer con revelado. Fotos generadas con
  Gemini por el usuario (prompts en `docs/landing-fotos-prompts.md`). Se corrigió que las alertas de perdidas no van a
  «vecinos»: el backend avisa al dueño por avistamientos y busca reportes a 10 km.
- **2026-10-22 · Claude** — Push de 16 commits pendientes de la app/backend (clínicas, servicios, establecimientos,
  estética); `deploy-oracle.yml` en verde, sin migraciones nuevas.
- **2026-10-08 · Claude** — App móvil: Fases 0–3 y F1–F27, U1–U2 (ver Anexo A). Web: W0 cimientos y W1 auditoría.

---

# Anexo A — App móvil: guía detallada (escrita el 2026-10-08)

Hola, MIMO 👋. Este documento te pasa el proyecto tal como quedó el **2026-10-08**. Está pensado para que trabajes solo,
sin repetir trabajo ni errores ya resueltos. Léelo completo una vez; después úsalo como checklist.

**Idioma:** todo en español (UI, commits, docs). Nombres de variables y funciones en inglés.

---

## 0. Lee esto primero (en este orden)

1. [`CLAUDE.md`](CLAUDE.md): reglas del repo. **Aplican a cualquier agente**, aunque el nombre diga Claude.
   Lo más importante: §3 Intocables, §4 Estándar premium (definición de terminado de una pantalla), §8 Reglas de cambios.
2. [`PROGRESO_MOBILE.md`](PROGRESO_MOBILE.md): estado por fase y módulo, línea base, **Backlog con IDs** (F9, A1, U1…),
   decisiones y bitácora.
3. [`AUDITORIA_MOBILE.md`](AUDITORIA_MOBILE.md): hallazgos detallados por módulo (archivo:línea), con `[x]` en lo resuelto.

> Se ignoran `archivo/` y `.agents/` (historial). `.mimocode/` es la configuración de Mimo: la genera `scripts/sync-mimo.sh`.

---

## 1. Qué es y qué buscamos

- Monorepo: `mobile/` (Expo SDK 55, React Native 0.83, expo-router 55, React Query) + `backend/` (17 microservicios
  FastAPI sobre una **misma** base PostgreSQL en Supabase). Detalle en [`README.md`](README.md).
- **Objetivo:** la app móvil a nivel premium: 100 % funcional, sin botones rotos ni duplicados, navegación clara,
  diseño consistente (paleta *Midnight & Gold*, claro y oscuro).
- El usuario está en **fase de desarrollo** y da autonomía: decide tú los detalles de diseño y avanza con un commit por
  bloque. Ver §6 para lo que **sí** requiere preguntarle.

---

## 2. Estado actual (qué ya está hecho)

| Fase | Estado |
|---|---|
| 0 Cimientos (tooling, docs) | ✅ |
| 1 Auditoría | ✅ módulos P1 · ⬜ P2 y P3 (tareas A1–A4) |
| 2 Limpieza | ✅ (código muerto, barrels, pantallas falsas, lint en 0 errores) |
| 3 Navegación | ✅ (grupo `(auth)`, Perfil único, Herramientas, Inicio, Explorar, Tienda, ficha de mascota con pestañas) |
| 4 Funcionalidad | 🟡 F1–F27 ✅ (completa en módulos P1) |
| 5 UI premium + APK | 🟡 U1 ✅ tema · U2 ✅ componentes (PetForm, AuthShell, kit README); faltan U3–U11 (U3 arranca adoptando `AuthShell`) |

`npm run check` **pasa** (tsc limpio, ESLint 0 errores / 72 avisos). Repo sincronizado con `origin/main` y desplegado (ver §3).

### Navegación actual (ya implementada)
```
app/
├─ _layout.tsx        guarda de sesión: no pinta nada hasta conocer la sesión; sin sesión → /login;
│                     con sesión fuera de (auth) salvo reset-password
├─ (auth)/            login · register · forgot-password · reset-password (URLs sin el grupo)
├─ (tabs)/
│  ├─ index           Inicio: campana con badge real, mascotas, citas, atajos (Veterinarios, IA, Perdidas, Adopciones)
│  ├─ explorar        14 servicios en Salud / Servicios / Comunidad + única entrada a /busqueda
│  ├─ tienda-tab      chips de categoría, Mis pedidos + bolsa en header, badge de la bolsa en la tab bar
│  ├─ perfil          ÚNICA pantalla de cuenta (actividad, cuenta, tema, soporte, cerrar sesión)
│  └─ menu            Herramientas (solo pro/admin): herramientas del rol desde ROLE_TOOLS
├─ perfil/            editar · verificacion · seguridad-2fa · partner · eliminar-cuenta
├─ mascotas/[id]      ficha con pestañas Resumen · Salud · Historial (?tab=salud|historial)
├─ carnet/[id]        redirect → mascotas/[id]?tab=salud (nueva-consulta, nueva-vacuna, receta/[id] siguen)
└─ tienda/            pago-exitoso y pago-cancelado (deep links del backend) usan features/tienda/PagoResultado
```

---

## 3. Despliegue (estado al 2026-10-08)

✅ **Todo lo hecho hasta hoy está en producción** (4 despliegues el 2026-10-08): F17+F15 (mascotas/carnet), F11+F12+F22
(core), F24+F27 (notificaciones/DatePicker) y F14+F19+F25+F26 (carnet, tienda, búsqueda, pasaporte). Migraciones de core aplicadas en la VM: `d3e9a7b4c215` y
`f12a8b3c4d5e` (**head**). Último OTA del canal `production` (runtime 1.0.0): update group
`3704404d-82a9-447c-8dee-aef559b06db3` (F14, F19, F25, F26). Carnet en head `c14a7e2b9d01`. `scripts/vm.sh status`: 17/17 servicios activos en http 200.

### Acceso a producción (ya configurado en esta máquina)

| Qué | Cómo |
|---|---|
| VM de Oracle | alias SSH **`michicondrias-oracle`** en `~/.ssh/config` (usuario `opc`, llave en `~/.ssh`; **nunca** copies la llave al repo ni la pegues en chats) |
| Operar la VM | **`scripts/vm.sh`** (probado): `status`, `current <svc>`, `migrate <svc>`, `logs <svc> [n]`, `restart <svc>`, `shell` |
| En la VM | código en `/opt/michicondrias/services/michicondrias_<svc>`, venvs en `/opt/michicondrias/venvs/<svc>`, variables en `/etc/michicondrias/common.env` (+ `<svc>.env`), servicios systemd `michicondrias@<svc>` (usuario `michicondrias`) |
| Deploy del backend | push a `main` que toque `backend/**` o `deploy/**` → workflow `deploy-oracle.yml`; revisar con `gh run list --workflow deploy-oracle.yml --limit 1` y `gh run watch <id> --exit-status` |
| OTA de la app | `eas-cli` con sesión iniciada (cuenta `michicondrias`) |
| Base de datos | Supabase de producción **solo lectura** vía MCP (si lo tienes); las escrituras solo por migraciones de alembic |

**Autorización del usuario (2026-10-07):** puedes desplegar tú mismo (push, migración en la VM, OTA) **cuando el bloque
esté verificado** (`npm run check` limpio, pruebas locales del backend y revisión en web). Al terminar, avisa qué
desplegaste. Sigue preguntando antes de hacer algo destructivo con datos, cambios de backend que no sean aditivos y el
APK (§6).

### Orden de despliegue (siempre)
```bash
git push origin main                                   # 1. si hay backend/**: dispara deploy-oracle.yml
gh run watch "$(gh run list --workflow deploy-oracle.yml --limit 1 --json databaseId -q '.[0].databaseId')" --exit-status
scripts/vm.sh migrate <svc>                            # 2. solo si agregaste migración (justo después del deploy)
scripts/vm.sh status                                   # 3. los 17 servicios: active + http 200
cd mobile && npx eas-cli update --channel production --environment production --platform android --message "…"   # 4. OTA (solo JS)
```
- La migración va **después** del deploy (el deploy es quien copia el archivo a la VM) y **enseguida**: mientras tanto,
  el código nuevo que lea la columna nueva falla. Las migraciones del repo son aditivas, así que no rompen el código viejo.
- Antes del OTA confirma que `mobile/.env` apunta a `https://michicondrias.duckdns.org` (el bundle usa el `.env` local).
- Si algo falla: `scripts/vm.sh logs <svc> 80`, corrige, vuelve a hacer push. No edites archivos a mano en la VM (el
  siguiente deploy los pisa con `rsync --delete`).

---

## 4. Reglas de trabajo (resumen operativo de CLAUDE.md)

- **Capas:** pantalla → hook (`src/hooks/<modulo>/`) → service (`src/services/`) → `apiFetch` (`src/lib/api.ts`).
  Nada de `fetch`/`apiFetch`/SecureStore en pantallas.
- **Tipos:** la fuente única es `src/types/<dominio>.ts` (decisión 2026-10-07). Cuando toques un módulo, mueve sus
  interfaces del service a `src/types/` e impórtalas desde ahí.
- **Imports:** de cada hook, directo a su archivo (`@/src/hooks/perfil/useAccount`). **Ya no hay barrels** `index.ts`.
- **Estilo:** colores solo de `useTheme().theme` (`@/src/hooks/useTheme`), nunca `constants/Colors` ni
  `ThemeContext` directo. Espaciado, radios, tipografía y tamaños desde `@/constants/design`
  (`spacing`, `radius`, `type`, `layout`, `shadow`, `tint`). Cero hex nuevos. Íconos solo de `lucide-react-native`.
- **Estados obligatorios:** carga con `Skeleton`, vacío con `EmptyState` (una acción), error ya lo cubre
  `ScreenContainer` (incluye `QueryErrorBanner`), pull-to-refresh con `AppRefreshControl`, botones con `loading`.
- **Backend:** mínimo y aditivo. Migraciones nuevas con `ADD COLUMN IF NOT EXISTS`; **nunca editar migraciones
  existentes**. Cada servicio tiene su tabla de versiones (`alembic_version_<svc>`). Todos comparten la base, así que
  leer otra tabla con SQL directo es válido (lo hacen carnet, laboratorio, etc.).
- **OTA vs APK:** JS/estilos salen por OTA. Dependencias nativas, permisos o `app.config.js` piden APK nuevo: van
  todas juntas en U10.
- **Commits:** chicos, en español, convencionales (`feat(mobile): …`, `fix(backend): …`, `refactor(mobile): …`).
  Uno por bloque. Un push a `main` con `backend/**` **despliega a producción**: hazlo solo con el bloque verificado y
  siguiendo el orden de despliegue de §3.
- **Cierre de cada bloque:** actualiza `PROGRESO_MOBILE.md` (checkbox del backlog + entrada en Bitácora) y marca `[x]`
  en `AUDITORIA_MOBILE.md`.

### Cómo verificar (sin herramientas especiales)
```bash
cd mobile && npm run check                              # obligatorio: tsc + ESLint (0 errores)
cd mobile && npx eslint --quiet <archivos tocados>
cd mobile && npx expo start --web --port 3000           # revisar en el navegador a 375×812, claro y oscuro
cd mobile && npm run deadcode                           # knip (código muerto)
```
- **Backend sin tocar producción:** prueba el router con `fastapi.testclient.TestClient` y una base SQLite en
  memoria. Sobrescribe `get_db` y las dependencias de auth (`deps.get_current_user_id`) y crea las tablas con
  `CREATE TABLE` a mano. Usa una `DATABASE_URL` falsa para que no se conecte a nada. Así se probaron F4, F5, F7 y F8.
- **Datos de producción:** la base real está casi vacía (0 productos, 0 clínicas, 0 notificaciones). No crees datos de
  prueba en producción ni hagas submits que escriban allá; prueba las escrituras en local.

---

## 5. Kit disponible (úsalo antes de crear algo nuevo)

**Componentes base** (`mobile/src/components/`):
| Componente | Para qué | Notas |
|---|---|---|
| `layout/ScreenContainer` | contenedor de toda pantalla | trae `QueryErrorBanner` (reintentar) |
| `layout/ScreenHeader` | header con atrás | `title`, `rightElement`, `onBack` |
| `Button` | acción | `variant` primary/secondary/ghost/danger/gold, `size`, `loading`, `icon`, `fullWidth` |
| `Card` | tarjeta | `onPress` la hace tocable, `elevated`, `flush` |
| `ListRow` | fila de menú/ajustes | `icon`, `label`, `desc`, `color` (hex del tema), `badge`, `destructive` |
| `SectionHeader` | título de sección | `overline`, `icon`, `actionLabel` + `onAction` |
| `FormField` | campo de formulario | `error` y `hint` inline, acepta cualquier prop de `TextInput` |
| `SegmentedControl` | 2–4 opciones / pestañas | genérico `<T>`: `value`, `onChange`, `options[{value,label,icon}]` |
| `EmptyState` | vacío | `icon`, `title`, `subtitle`, `actionLabel` + `onAction` |
| `Skeleton`, `SkeletonList` | carga | `import { Skeleton } from '@/src/components/Skeleton'` (sin default) |
| `AppRefreshControl` | pull-to-refresh | refetch de las queries activas |
| `KeyboardScreen` | formularios con scroll y teclado | |
| `showAlert` (`AppAlert`) | alertas | `type`, `title`, `message`, `showCancel`, `onButtonPress` |
| `DatePicker` | fechas | ⚠️ aún usa `Colors` (tarea F27) |

**Piezas de pantalla** (`src/features/`): `tienda/PagoResultado`, `carnet/CarnetItems` (RecordItem, VaccineItem,
ReminderItem, LabItem), `mascotas/PetHealthTabs` (PetHealthTab, PetHistoryTab).

**Infraestructura que ya resuelve cosas (no la dupliques):**
- `src/lib/api.ts` → `apiFetch` **no tiene caché propia** (la caché es React Query). Lanza `ApiError` con `status` y
  `sessionExpired`. Si el backend rechaza el token vigente, avisa a `AuthContext`, que cierra la sesión y lleva a /login.
  Quita el prefijo `"Value error, "` de los 422 de Pydantic.
- `src/contexts/AuthContext.tsx` → copia local del usuario para abrir sin red. `signOut()` borra token, caché de React
  Query y el carrito de esa cuenta. `useSessionSync` (montado en `app/_layout.tsx`) renueva el token.
- `src/contexts/CartContext.tsx` + `src/lib/cartStorage.ts` → carrito y dirección **por usuario**.
- `src/constants/roleTools.ts` → `ROLE_TOOLS`, `ROUTE_ACCESS`, `canAccessRoute`: **fuente única** de herramientas y
  permisos por rol. Las rutas nuevas de rol se registran ahí y la pantalla lleva `RoleGuard`.
- `src/constants/roles.ts` → `normalizeRole`, `isProRole`, `getRoleLabelFor`.
- `src/hooks/notifications/useNotifications.ts` → `resolveNotificationRoute` (usa `link` del backend y, si no hay,
  decide por tipo y rol) y `useUnreadNotificationCount` (badge). Las queries secundarias usan `meta: { silentError: true }`
  para que su falla no saque el banner de error.

---

## 6. Pregúntale al usuario ANTES de…

- Agregar o quitar **dependencias nativas** o tocar `app.config.js`. Van juntas en U10 y requieren APK nuevo.
- Borrar una **pantalla o ruta** que no esté en el mapa aprobado. Primero busca referencias en `router.push`, `href`,
  `roleTools.ts` y `backend/`, porque pueden ser deep links.
- Cambios de backend que **no sean aditivos** (renombrar o borrar columnas, cambiar contratos usados por la web).
- Tocar **datos reales** de producción (borrar, corregir o sembrar registros) o cualquier migración que no sea aditiva.
  El despliegue normal (push, migración aditiva y OTA) sí lo puedes hacer tú, según §3.

**No renombres ni borres** estas rutas, que son deep links del backend: `tienda/pago-exitoso`, `tienda/pago-cancelado`,
`mascotas/[id]`, `reset-password`.

---

## 7. Lecciones aprendidas (errores que ya pasaron — evítalos)

1. **knip da falsos positivos** con archivos `.web.ts` (Expo los resuelve por plataforma) y con rutas que se abren por
   string. Siempre `grep` antes de borrar.
2. **Al recortar un archivo con un script, no cortes "desde X hasta el final".** Pasó en `tienda/pedido/[id].tsx` y se
   borró el `StyleSheet`. Recorta solo el bloque exacto y corre `tsc`.
3. **Fechas al backend:** no mandes `'YYYY-MM-DD'` a un campo `datetime`. Se guarda 00:00 UTC y en México (UTC-6) se
   muestra el día anterior. Manda el día a **mediodía local** en ISO (ver `atLocalNoon` en
   `src/hooks/carnet/useVaccineForm.ts`). Muestra las fechas con locale `'es-MX'`.
4. **Postgres vs SQLite en pruebas:** SQLite devuelve las fechas como texto y Postgres como objetos. Usa un helper tipo
   `_iso()` (ver `backend/michicondrias_mascotas/.../pets.py`).
5. **`Stack.Protected`** no se usó porque casi todas las rutas están sueltas en la raíz y solo protege las que se le
   listan. La guarda vive en `app/_layout.tsx`. No la quites sin mover toda la app a un grupo.
6. **Mensajes de error:** `QueryErrorBanner` ignora `ApiError.sessionExpired`. No vuelvas a comparar con el texto
   "No autorizado", porque ya no existe.
7. **react-native-web:** en las capturas largas la parte de abajo puede salir en blanco por el pintado perezoso. Usa
   `scroll_to` o lee el árbol de accesibilidad antes de concluir que algo no se ve.
8. **"Failed to load theme mode" en web** es conocido: `ThemeContext` usa SecureStore, que no existe en web. Se corrige en U1.
9. **No inventes promesas en la UI** (avisos, notificaciones o recordatorios que el backend no emite). Ya se quitaron
   varias; si un texto promete algo, verifica que exista el emisor.
10. **Antes de exponer datos en endpoints públicos** (pasaporte, búsqueda), filtra lo no aprobado y lo sensible
    (primas, reclamos, notas, IDs internos).

---

## 8. Cola de trabajo (en este orden)

El detalle de cada tarea está en `PROGRESO_MOBILE.md` → *Backlog por fase* y en `AUDITORIA_MOBILE.md`. 🛠️ = toca backend.

### Bloque A — Terminar la Fase 4 en módulos P1 (recomendado primero)
| ID | Tarea | Terminado cuando |
|---|---|---|
| ~~F9~~ ✅ | Auth en capas: `src/services/auth.ts` (con `API_URLS`, en vez de `lib/auth.ts` con URL a mano) + `src/hooks/auth/useLogin`, `useRegister`, `usePasswordReset`; hook `usePartnerUpgrade` para `perfil/partner.tsx`; helper común "guardar token + recargar usuario" (hoy duplicado en `useSessionSync` y `partner`) — hecho 2026-10-07 | ninguna pantalla de `(auth)` ni `partner` importa `lib/auth`, `apiFetch` o SecureStore |
| ~~F10~~ ✅ | Registro con login automático + una línea hacia la cuenta profesional — hecho 2026-10-07 | tras registrarse cae en Inicio con sesión |
| ~~F13~~ ✅ | Perfil: 2FA con QR (lib JS de QR en SVG; si es nativa, va a U10) + "Abrir en app autenticadora" + copiar clave; invalidar `['user-profile']`; `verificacion` con hook (`useKYC` ya existe: pásale la subida con cámara) y CTA "Activar cuenta pro" si está VERIFIED; `partner` muestra el estado del KYC antes de elegir rol — hecho 2026-10-07 | flujos recorridos en web sin errores |
| ~~F16~~ ✅ | Mascotas: "Vacunas al día" calculado desde las vacunas (no del booleano manual), Michi-Tracker activo con salida (facturación o mapa), compartir carnet con QR (`handleShare` ya existe en `usePetDetail`, solo para el dueño) — hecho 2026-10-07 | ficha sin datos falsos |
| ~~F17~~ ✅ | Diagnóstico IA: vacío con "Agregar mascota", error de "sin peso" con botón a editar, selector de mascota también en triage (`pet_id` opcional y aditivo en backend) — hecho 2026-10-07 | sin callejones sin salida |
| ~~F18~~ ✅ | Tienda: hook `useCheckout` (`useMutation`, invalida `my-orders`/`store-products`/`product`), refrescar precio y stock del carrito al abrirlo, no vaciar la bolsa antes de pagar — hecho 2026-10-07 | sin lógica de red en `CartContext` |
| ~~F20~~ ✅ | Stripe con `expo-web-browser` `openAuthSessionAsync` (ya está en `package.json`; confirmado: es dependencia declarada y ya se usa) — hecho 2026-10-07 (`utils/payments.openStripeUrl` en los 5 puntos que abren Stripe) | el pago vuelve a la app |
| ~~F21~~ ✅ | Ayuda: FAQ verídicas (solo tarjeta, botón real "¡Quiero Adoptar!"), avisar si falla `Linking`, `ScreenContainer`/`ScreenHeader` — hecho 2026-10-07 | |
| ~~F23~~ ✅ | Los `onError` de mutaciones no muestran error si `ApiError.sessionExpired` — hecho 2026-10-07 (corte central en `AppAlert.notifySessionExpired`) | un solo aviso al vencer la sesión |
| ~~F15~~ 🛠️ ✅ | PUT/DELETE de vacunas y consultas (carnet) + UI con confirmación — hecho 2026-10-07 (GET por id, recálculo de `is_vaccinated`, editar desde los formularios y borrar con confirmación) | |
| ~~F11~~ 🛠️ ✅ | Core: email sin distinguir mayúsculas (**antes** busca duplicados por mayúsculas en `users`), mensajes en español, contraseña mínima, `created_at` en `/users/me` — hecho 2026-10-07 (0 duplicados en producción; + `is_active` forzado en el registro) | |
| ~~F12~~ 🛠️ ✅ | Recuperación con código de 6 dígitos (decisión tomada): endpoint en core + pantalla única de reset — hecho 2026-10-08 (**migración `f12a8b3c4d5e`: correr `alembic upgrade head` de core tras el deploy**; código HMAC de un solo uso + enlace conservado) | |
| ~~F14~~ 🛠️ ✅ | Emisor de recordatorios y refuerzos (job + notificación con `link`) — hecho 2026-10-08 (`carnet/app/jobs/reminders.py`, migración `c14a7e2b9d01`) | |
| ~~F19~~ 🛠️ ✅ | Tienda: liberar pedidos vencidos en `/orders/*`, notificar pago (tipo `store` + `link`), `can_review`, paginación — hecho 2026-10-08 (sin migración) | |
| ~~F22~~ 🛠️ ✅ | Privacidad: limitar `GET /pets/{id}` a dueño / veterinario / admin — hecho 2026-10-08 (+ servicios internos; `pet_access` alineado con `VET_ROLES` también en la lectura) | |
| ~~F24~~ 🛠️ ✅ | `link` en los emisores que faltan (directorio, laboratorio, aseguradoras, funeraria, transportistas). Solo **después** de aplicar la migración `d3e9a7b4c215` | |
| ~~F25–F27~~ ✅ | ~~Búsqueda "ver todos" y más dominios; pasaporte legible y número de póliza enmascarado; `DatePicker` con tokens~~ — hecho 2026-10-08 | |

### Bloque B — Auditoría P2/P3 (Fase 1 restante)
Mismo formato de sección que ya usa `AUDITORIA_MOBILE.md` (tabla Pieza/Tipo/Estado/Hallazgo, redundancias, propuesta,
backend, arreglos P0/P1/P2):
- A1: Directorio y citas, Adopciones, Perdidas.
- A2: Paseadores/Cuidadores (detalles casi gemelos → componente compartido), Pet-friendly vs Establecimientos (¿fusión?),
  Grooming vs Estilistas.
- A3: Entrenadores, Transportistas (`useRideTracking`), Aseguradoras, Laboratorio, Funeraria (copy sensible), Donaciones.
- A4: Mi clínica, Servicios pro, Tienda vendedor, **Patrocinadores** (su `index` muestra presupuestos de campañas sin
  `RoleGuard`; revisar permisos), Admin.
- Resuelve también L9: 6 hooks sin importador. Decide si la pantalla debe usarlos o si se borran.

### Bloque C — Fase 5 (UI premium)
**U1 Tema primero:**
- `warning` distinto de `accent`.
- Un token de degradado del hero por modo, para reemplazar el `#1c2f6b` fijo de Inicio, Explorar y Tienda.
- Acentos de dominio armonizados con *Midnight & Gold*, en lugar del arcoíris Tailwind de `roleTools`, `useHome` y `useExplore`.
- `StatusBar` según el tema.
- Guardar el tema en AsyncStorage.

Después, U2–U9 pantalla por pantalla con el checklist de CLAUDE.md §4. Por último **U10**, el APK único con las libs
nativas (`expo-image`, `expo-haptics`, FlashList, fuente propia, `expo-notifications` + tabla `push_tokens`), y **pídele
el visto bueno al usuario antes**.

---

## 9. Plantilla de cierre de cada bloque

1. `cd mobile && npm run check` → 0 errores.
2. Recorrer el flujo en web (375×812, claro y oscuro) sin escribir en producción.
3. `PROGRESO_MOBILE.md`: marcar `[x]` en el backlog y agregar una entrada en la Bitácora con fecha, qué se hizo,
   archivos clave, cómo se verificó y qué quedó pendiente.
4. `AUDITORIA_MOBILE.md`: marcar `[x]` en los hallazgos resueltos.
5. Commit convencional en español. Si tocaste backend, en el mensaje di si hay migración y que se corre antes del deploy.
6. Si el cambio necesita deploy, despliégalo con el orden de §3 y avisa qué salió. Si necesita APK nuevo, anótalo y
   pregúntale al usuario (U10).

¡Éxito, compa! 🐾
