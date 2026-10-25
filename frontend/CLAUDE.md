# CLAUDE.md — Web (`frontend/`)

La web es un **espejo de la app móvil**: mismas funciones, rutas, roles, colores y arquitectura, contra la misma API.
Solo cambia la plataforma (barra lateral en escritorio, barra inferior bajo 768 px). Ante la duda, **la app manda**
en *qué* hace cada pantalla: mira cómo lo hace `mobile/` y replícalo.

> **Espejo de lógica, no de pantallas.** Tipos, servicios, hooks, rutas y flujos son los de la app. La interfaz **no se
> calca del teléfono**: misma línea de diseño (paleta *Midnight & Gold*, tipografía, tokens, tono) pero con
> componentes y composición propios de la web — pensada primero para escritorio (1280 px) y que degrade bien a 375 px:
> hero ancho, paneles laterales, pestañas subrayadas, tablas, formularios a dos columnas con barra de acciones,
> estados `:hover`/foco. Si un componente web no existe, se crea en `src/components/`.

> Antes de cualquier tarea lee [`../HANDOFF.md`](../HANDOFF.md) (documento único: §0 regla web, §2 estado, §3
> pendientes, §6 decisiones) y actualízalo en cada cambio. No crees otros `.md`.
> Las reglas generales del repo siguen en [`../CLAUDE.md`](../CLAUDE.md) (idioma, intocables, commits).

## 1. Stack y comandos

Next.js 16 (App Router, Turbopack, React Compiler) · React 19 · React Query 5 · CSS Modules · `lucide-react`.
Publicada en **Vercel** (root dir `frontend/`): un push a `main` que toque `frontend/**` sale a producción; las ramas
generan *preview*.

| Para qué | Comando (desde `frontend/`) |
|---|---|
| Verificar (tipos + lint) — obligatorio antes de dar algo por terminado | `npm run check` |
| Build igual al de Vercel — obligatorio antes de fusionar a `main` | `npm run build` |
| Código muerto | `npm run deadcode` |
| Desarrollo | `npm run dev` (puerto **3001**; la app en Expo Web usa el 3000) |
| Deriva del espejo contra la app (desde la raíz) | `scripts/web-drift.sh` (`-d` muestra los diffs) |

ESLint arrastra errores del código viejo (`src/lib/legacy/`). Regla mientras se reescribe:
`typecheck` limpio, `build` en verde y **ningún error nuevo** en los archivos tocados (`npx eslint --quiet <archivos>`).

## 2. Arquitectura (igual que la app)

**Capas:** página (`src/app/**/page.tsx`) → hook (`src/hooks/<modulo>/`) → service (`src/services/`) → `apiFetch`
(`src/lib/api.ts`). Nada de `fetch`/`apiFetch`/`localStorage` en páginas ni componentes.

| Web | Espejo de | Cómo se mantiene |
|---|---|---|
| `src/types/*` | `mobile/src/types/*` | **copia literal** (solo cambian imports) |
| `src/services/*` | `mobile/src/services/*` (salvo `rideGeo`) | **copia literal** |
| `src/constants/roles.ts`, `roleTools.ts` | `mobile/src/constants/` | copia; `lucide-react-native` → `lucide-react` |
| `src/constants/design.ts`, `palettes.ts` | `mobile/constants/` | copia; además se vuelcan a variables CSS en `globals.css` |
| `src/utils/formatters.ts`, `validators.ts` | `mobile/src/utils/` | copia literal |
| `src/lib/api.ts` | `mobile/src/lib/api.ts` | misma API (`API_URLS`, `ApiError`, `sessionExpired`, timeout); token en `localStorage` |
| `src/contexts/` (Auth, Theme, Cart) | `mobile/src/contexts/` | misma interfaz pública |
| `src/hooks/<modulo>/` | `mobile/src/hooks/<modulo>/` | misma lógica; `expo-router` → `next/navigation` |
| `src/components/*` | `mobile/src/components/*` | mismos nombres y props en los básicos (`Button`, `FormField`, `EmptyState`…); los de composición son propios de la web |

- Un cambio en una copia espejo se hace **primero en la app** (o se anota para la otra sesión) y luego se copia. Nunca
  divergir a propósito: `scripts/web-drift.sh` tiene que salir limpio.
- **Rutas iguales a la app** (sin `/dashboard`): `/mascotas/[id]`, `/tienda/pago-exitoso`, `/mi-clinica/...`. Así los
  `link` de notificaciones y los *deep links* del backend sirven en ambas. Las pantallas de sesión viven en
  `src/app/(app)/`, las de autenticación en `src/app/(auth)/`.
- **Roles:** `src/constants/roleTools.ts` es la fuente única (`ROLE_TOOLS`, `ROUTE_ACCESS`, `canAccessRoute`). Rutas
  de profesional/admin: registradas ahí y la página envuelta en `RoleGuard`. El superadmin es el rol `admin`.
- Páginas con `"use client"` cuando usan hooks; `useSearchParams` siempre bajo `<Suspense>` (si no, el build falla).

## 3. Estándar premium web (definición de terminado de una página)

Todo lo de `../CLAUDE.md` §4 aplica, traducido a web:
- **Diseño:** cero hex y cero `style={{}}` con valores sueltos; colores con `var(--color-*)` y espaciado, radios,
  tipografía y sombras con las variables de tokens. Íconos solo de `lucide-react` (nada de emojis como íconos ni SVG
  pegados).
- **Componentes base** en vez de recrearlos: `ScreenContainer`, `ScreenHeader`, `Button`, `Card`, `ListRow`,
  `SectionHeader`, `FormField` + `forms/*`, `Badge`, `FilterChip`, `SearchBar`, `SegmentedControl`, `EmptyState`,
  `Skeleton`/`SkeletonList`, `DataList`, `showAlert`, `RoleGuard`.
- **Estados:** carga con `Skeleton`, vacío con `EmptyState` (una acción), error con el banner de `ScreenContainer`,
  botones con `loading`/`disabled` durante mutaciones, validación inline en formularios.
- **Web en particular:** `<Link>`/`<a>` para navegar y `<button>` para acciones (nunca `div` con `onClick`); foco de
  teclado visible; `:hover` en lo clicable; `alt` en imágenes; `<title>` por página; objetivos ≥ 44 px en táctil.
- **Responsive:** se revisa a **375×812** y **1280×800**, claro y oscuro. En escritorio se aprovecha el ancho (rejillas,
  tablas en admin) sin cambiar el flujo de la app.
- **Funcional:** cada acción pega a un endpoint real; tras mutar se invalidan las queries correctas.
- La API es la de **producción**: solo lecturas reales. Nada de escrituras de prueba allá.

Si una página supera ~400 líneas, extrae secciones a `src/features/<modulo>/`.

## 4. Trabajo en paralelo (multiagente)

- Esta línea de trabajo vive en el worktree `../michicondrias-web` (rama `web/espejo`); `mobile/` y `backend/` son de
  **solo lectura** desde aquí (otra sesión trabaja en ellos).
- Los agentes de módulo solo escriben en `src/app/(app)/<modulo>/`, `src/hooks/<modulo>/` y `src/features/<modulo>/`.
  Si necesitan algo del núcleo (componentes, contextos, `api.ts`, espejos) lo piden en su reporte; el agente principal
  lo crea para mantener un solo criterio.
