# Progreso — App móvil premium

Documento vivo. Claude lo lee al empezar y lo actualiza al terminar cada tarea (`CLAUDE.md` §6).
Criterios de "Premium": `CLAUDE.md` §4 · Fases: `CLAUDE.md` §5 · Hallazgos detallados: `AUDITORIA_MOBILE.md`.

**Leyenda:** ⬜ pendiente · 🔍 auditado · 🟡 en progreso · ✅ hecho · ⏸️ bloqueado · — no aplica

## Fase actual: **1 — Auditoría**

| # | Fase | Estado |
|---|---|---|
| 0 | Cimientos (tooling, `.claude/`, documentos) | ✅ 2026-10-07 |
| 1 | Auditoría | ⬜ |
| 2 | Limpieza | ⬜ |
| 3 | Navegación y esqueleto | ⬜ |
| 4 | Funcionalidad faltante | ⬜ |
| 5 | UI/UX premium (+ APK con libs nativas) | ⬜ |

---

## Línea base (2026-10-07)

| Métrica | Valor | Meta |
|---|---|---|
| Pantallas (`app/**/*.tsx`, sin layouts) | 164 | — |
| Pantallas que importan tokens de `constants/design.ts` | 5 | todas |
| Pantallas que usan el componente `Button` | 5 | todas las que tengan botones |
| Pantallas con colores hex sueltos | 141 | 0 |
| Pantallas con `ActivityIndicator` / con `Skeleton` | 83 / 30 | 0 / todas las de datos |
| Pantallas con `EmptyState` | 40 | todas las listas |
| ESLint errores / advertencias | 12 / 219 | 0 / 0 |
| knip: archivos / deps / exports sin uso | 29 / 6 / 147 | 0 / 0 / 0 |
| expo-doctor | 18/20 | 20/20 |
| `tsc` | limpio | limpio |

Remedir las métricas de pantallas (desde `mobile/`):
```bash
bash -c 'grep -rlE "[\"'"'"']#[0-9a-fA-F]{3,8}[\"'"'"']" app --include="*.tsx" | wc -l; grep -rl "constants/design" app | wc -l; grep -rl ActivityIndicator app | wc -l; grep -rl Skeleton app | wc -l'
```

---

## Módulos

Prioridad: **P1** lo que todo usuario toca · **P2** flujos de consumidor secundarios · **P3** herramientas pro/admin.
Columnas = fases 1 (Auditoría), 4 (Funcional) y 5 (UI premium). Limpieza y navegación son globales.

| Prio | Módulo | Pant. | Audit. | Func. | UI | Notas |
|---|---|---|---|---|---|---|
| P1 | Auth (`login`, `register`, `forgot-password`, `reset-password`) | 4 | ⬜ | ⬜ | ⬜ | Las 4 con más hex sueltos (26–37 c/u); sin grupo `(auth)` |
| P1 | Pestañas (`(tabs)/`) | 5 | ⬜ | ⬜ | ⬜ | Inicio 645 líneas; revisar Inicio vs Explorar vs Menú |
| P1 | Perfil (`perfil/`, `(tabs)/two`) | 7+1 | ⬜ | ⬜ | ⬜ | Perfil en dos pantallas: pestaña `two` y `perfil/index` |
| P1 | Mascotas (`mascotas/`) | 5 | ⬜ | ⬜ | ⬜ | Incluye triage IA |
| P1 | Carnet (`carnet/`) | 6 | ⬜ | ⬜ | ⬜ | `carnet/[id]` es la más larga (987 líneas) |
| P1 | Tienda cliente (`tienda/`, sin vendedor) | 8 | ⬜ | ⬜ | ⬜ | Compra + Stripe |
| P1 | Notificaciones, Búsqueda, Ayuda | 3 | ⬜ | ⬜ | ⬜ | |
| P2 | Directorio y citas | 6 | ⬜ | ⬜ | ⬜ | `especialista/[id]` 809 líneas |
| P2 | Adopciones | 12 | ⬜ | ⬜ | ⬜ | Muchas pantallas de solicitudes: ¿fusionar? |
| P2 | Perdidas | 4 | ⬜ | ⬜ | ⬜ | |
| P2 | Paseadores / Cuidadores (cliente) | 4+4 | ⬜ | ⬜ | ⬜ | Detalles de 844 y 938 líneas casi gemelos → componente compartido |
| P2 | Pet-friendly / Establecimientos | 3+4 | ⬜ | ⬜ | ⬜ | Dos módulos de "lugares": ¿solapan? |
| P2 | Grooming / Estilistas | 4+2 | ⬜ | ⬜ | ⬜ | Dos nombres para lo mismo |
| P2 | Entrenadores | 7 | ⬜ | ⬜ | ⬜ | |
| P2 | Transportistas | 8 | ⬜ | ⬜ | ⬜ | |
| P2 | Aseguradoras | 8 | ⬜ | ⬜ | ⬜ | |
| P2 | Laboratorio | 3 | ⬜ | ⬜ | ⬜ | Dos servicios: `laboratorio.ts` y `laboratory.ts` |
| P2 | Funeraria | 10 | ⬜ | ⬜ | ⬜ | Tono sensible: copy cuidado |
| P2 | Donaciones | 1 | ⬜ | ⬜ | ⬜ | |
| P3 | Mi clínica (veterinario/hospital) | 14 | ⬜ | ⬜ | ⬜ | |
| P3 | Servicios pro | 3 | ⬜ | ⬜ | ⬜ | |
| P3 | Tienda vendedor | 5 | ⬜ | ⬜ | ⬜ | |
| P3 | Patrocinadores | 5 | ⬜ | ⬜ | ⬜ | |
| P3 | Admin | 14 | ⬜ | ⬜ | ⬜ | |

---

## Backlog por fase

**Fase 2 — Limpieza** (lista base en `AUDITORIA_MOBILE.md` → knip)
- [ ] Borrar `src/components/ScreenHeader.tsx` (sin uso).
- [ ] Decidir barrels `src/hooks/<modulo>/index.ts`: usarlos en todas las pantallas o eliminarlos.
- [ ] Unificar `services/laboratorio.ts` y `services/laboratory.ts`.
- [ ] Quitar exports duplicados/no usados de `constants/roles.ts` y `Skeleton`.

**Fase 3 — Navegación**
- [ ] Grupo `(auth)` para login/register/forgot/reset.
- [ ] Una sola pantalla de Perfil; renombrar `(tabs)/two.tsx`.
- [ ] Revisar reparto Inicio / Explorar / Herramientas.

**Fase 5 — UI premium + APK**
- [ ] Revisar/completar componentes base (botón, tarjeta, fila, header, chips, input, select, imagen con
      placeholder, avatar, KPI, bottom sheet, FAB) y documentarlos en `mobile/src/components/README.md`.
- [ ] Revisar paleta *Midnight & Gold* en claro/oscuro (contraste, semánticos success/warning/danger/info).
- [ ] Libs nativas juntas: `expo-image`, `expo-haptics`, `@shopify/flash-list`, fuente propia con `expo-font`.
- [ ] En el mismo APK: quitar deps nativas sin uso (knip) y `npx expo install --check` (13 parches atrasados).
- [ ] Evaluar Prettier (formatear todo en un commit aparte).
- [ ] Evaluar Maestro para flujos E2E (login, compra, adopción).

## Decisiones

- **2026-10-07** — Verificación inicial: tsc + ESLint + knip + expo-doctor, sin tests por ahora (Maestro/jest más adelante).
- **2026-10-07** — Libs nativas premium se agregan juntas en la Fase 5 para sacar un solo APK.
- **2026-10-07** — MCP del proyecto: Context7, Supabase (solo lectura, proyecto de producción) y Expo.
- _Pendiente_: fuente única de tipos (`src/types/` vs interfaces dentro de `src/services/`). Decidir en Fase 2.

## Bitácora

- **2026-10-07** — Fase 0 completa: `CLAUDE.md`, este archivo y `AUDITORIA_MOBILE.md`; ESLint
  (`eslint-config-expo` 55) y knip instalados con scripts `check`, `typecheck`, `lint`, `deadcode`, `doctor`;
  `.claude/` con hooks (protección de rutas, lint por archivo, tsc al terminar), 4 skills y 2 agentes; `.mcp.json`.
  Línea base medida. Siguiente: Fase 1, empezando por los módulos P1 (Auth).
