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
| W4 | Módulos (multiagente por lotes) | P1 → **W4-A Consola admin** → P2 → P3 | ⬜ |
| W4-A | Consola de administración | Admin de la app ampliado a escritorio + matriz de roles/permisos + "ver como rol" | ⬜ |
| W5 | Pulido de escritorio y cierre | hover/foco/atajos, tablas, SEO de la landing, borrar lo viejo, merge a `main` | ⬜ |
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
| P2 | Paseadores / Cuidadores | 4+4 | 4+4 | 🔍 | ⬜ | ⬜ |
| P2 | Pet-friendly / Establecimientos | 3+4 | 3 / — | 🔍 | ⬜ | ⬜ |
| P2 | Grooming / Estilistas | 4+2 | — | 🔍 | ⬜ | ⬜ |
| P2 | Entrenadores | 7 | — | 🔍 | ⬜ | ⬜ |
| P2 | Transportistas | 8 | — | 🔍 | ⬜ | ⬜ |
| P2 | Aseguradoras | 8 | — | 🔍 | ⬜ | ⬜ |
| P2 | Laboratorio | 3 | — | 🔍 | ⬜ | ⬜ |
| P2 | Funeraria | 10 | — | 🔍 | ⬜ | ⬜ |
| P2 | Donaciones | 1 | 1 | 🔍 | ⬜ | ⬜ |
| P3 | Mi clínica | 14 | `directorio/mi-clinica` (con datos *mock*) | 🔍 | ⬜ | ⬜ |
| P3 | Servicios pro | 3 | `paseadores/registro`, `cuidadores/registro` | 🔍 | ⬜ | ⬜ |
| P3 | Tienda vendedor | 5 | dentro de `/dashboard/tienda` | 🔍 | ⬜ | ⬜ |
| P3 | Patrocinadores | 5 | — | 🔍 | ⬜ | ⬜ |

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

