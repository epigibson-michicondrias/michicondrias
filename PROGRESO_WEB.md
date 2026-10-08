# Progreso — Web espejo de la app

Documento vivo de la web (`frontend/`). Claude lo lee al empezar y lo actualiza al terminar cada bloque.
Reglas: [`frontend/CLAUDE.md`](frontend/CLAUDE.md) · Hallazgos: [`AUDITORIA_WEB.md`](AUDITORIA_WEB.md) ·
App de referencia: [`PROGRESO_MOBILE.md`](PROGRESO_MOBILE.md).

**Leyenda:** ⬜ pendiente · 🔍 auditado · 🟡 en progreso · ✅ hecho · ⏸️ bloqueado · — no aplica

**Dónde se trabaja:** worktree `../michicondrias-web`, rama `web/espejo`. Se fusiona a `main` (producción en Vercel)
solo con la fase verificada y el visto bueno del usuario.

## Fase actual: **W1 — Auditoría** ✅ → siguiente **W2 — Núcleo espejo**

| # | Fase | Qué | Estado |
|---|---|---|---|
| W0 | Cimientos | ESLint/knip/scripts, build en verde, hooks, `frontend/CLAUDE.md`, `web-drift.sh`, docs | ✅ 2026-10-08 |
| W1 | Auditoría web ↔ app | Mapa pantalla de la app → página web (existe/falta/sobra/difiere) + inventario de guardas de rol del backend | ✅ 2026-10-08 |
| W2 | Núcleo espejo | types, services, roles/roleTools, api.ts, tokens → CSS, contextos, componentes base | ⬜ |
| W3 | Navegación y esqueleto | `(auth)` + `(app)`, rutas iguales a la app, shell (sidebar / barra inferior), redirects `/dashboard/*` | ⬜ |
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
| `scripts/web-drift.sh` | 65 espejos faltan | 0 difieren / 0 faltan |

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

- [ ] **V1** Confirmar con el usuario la configuración de Vercel: root dir `frontend`, rama de producción, variable
  `NEXT_PUBLIC_API_URL`, si hay *previews* por rama y desde cuándo falla el build en producción.
- [ ] **V2** Agregar en el `launch.json` de la raíz una entrada que apunte al worktree, para usar `preview_start`.
- [ ] **V3** 🚨 Hotfix en producción: la web publicada escribe **ubicaciones aleatorias** en reportes de perdidas
  (`perdidas/rastreo/[id]/page.tsx:60-74`) y registra **donaciones sin cobro** (`donaciones/page.tsx:51`). Hay que
  desactivar las dos páginas en `main` sin esperar a W3 (requiere el visto bueno del usuario: sale a Vercel).
- [ ] **V4** Pasar a la otra sesión la tabla X1–X8 de `AUDITORIA_WEB.md`. **X1 (2FA saltable en 10 servicios) es de
  seguridad.**
- [ ] **B1–B4** Backend aditivo en core para la consola de admin: `GET /users/` con total y filtros,
  `GET /users/{id}`, `users_count` en roles y borrado seguro de roles (ver `AUDITORIA_WEB.md`).

## Bitácora

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
