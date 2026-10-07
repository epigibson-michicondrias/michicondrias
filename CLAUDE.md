# CLAUDE.md — Michicondrias

Guía de trabajo para Claude en este repo. El objetivo actual es **llevar la app móvil a nivel premium**: 100% funcional,
fácil de usar, visualmente consistente, sin botones ni flujos redundantes, con los servicios ajustados donde haga falta.

> **Antes de cualquier tarea, lee [`PROGRESO_MOBILE.md`](PROGRESO_MOBILE.md).** Ahí está la fase actual, el estado
> de cada módulo y las decisiones ya tomadas. Los hallazgos detallados están en
> [`AUDITORIA_MOBILE.md`](AUDITORIA_MOBILE.md). **Al terminar, actualiza ambos** (ver §6).

Idioma: todo en español (textos de UI, commits, documentación). Nombres de variables/funciones en inglés, como ya
están en el código.

---

## 1. Contexto rápido

- Monorepo: `mobile/` (Expo SDK 55, RN 0.83, expo-router, React Query) + `backend/` (17 microservicios FastAPI sobre
  PostgreSQL en Supabase).
- Arquitectura completa, roles, despliegue y APK: [`README.md`](README.md). No lo dupliques aquí.
- `archivo/` es **historial** y puede estar desactualizado: úsalo como pista, nunca como verdad.
- `.agents/` y `.mimocode/` son de herramientas anteriores; ignóralos.

### Mapa de la app móvil

| Ruta | Qué hay |
|---|---|
| `mobile/app/(tabs)/` | Pestañas: `index` (Inicio), `explorar`, `tienda-tab`, `two` (Perfil), `menu` (Herramientas/Admin, solo pro/admin) |
| `mobile/app/<modulo>/` | Pantallas por módulo (adopciones, carnet, mascotas, tienda, mi-clinica, admin, …) |
| `mobile/app/login.tsx`, `register.tsx`, … | Autenticación (hoy sueltas en la raíz, sin grupo `(auth)`) |
| `mobile/src/hooks/<modulo>/` | Lógica de pantalla con React Query |
| `mobile/src/services/*.ts` | Llamadas HTTP por microservicio. Base en `src/lib/api.ts` (`API_URLS`, `ApiError`; sin caché propia: la caché es React Query) |
| `mobile/src/types/` | Tipos por dominio (espejo de los schemas del backend) |
| `mobile/src/components/` | Componentes base (ver §4) |
| `mobile/src/features/<modulo>/` | Piezas grandes de pantalla extraídas |
| `mobile/src/constants/roleTools.ts` | **Fuente única** rol → herramientas/rutas + `ROUTE_ACCESS` |
| `mobile/constants/design.ts` | Tokens: `spacing`, `radius`, `shadow`, `type`, `layout` |
| `mobile/constants/palettes.ts` | Paleta *Midnight & Gold* (claro/oscuro). Se lee con `useTheme()` |

**Reglas de capas:** pantalla → hook → service → api. Ni `api`/`fetch` ni lógica de negocio en las pantallas.

### Cómo habla la app con el backend
- Cada microservicio se expone en `https://michicondrias.duckdns.org/<servicio>/api/v1/...` (Caddy). En la app la base
  es `EXPO_PUBLIC_API_URL` y las rutas por servicio están en `API_URLS` (`src/lib/api.ts`).
- Autenticación: JWT en `expo-secure-store`; el rol viaja en el token. El backend exige el rol en endpoints
  profesionales; la app lo espeja en `ROUTE_ACCESS` + `RoleGuard`.
- La app **no** habla directo con Supabase; solo el backend toca la base.

---

## 2. Comandos

Todos desde `mobile/`:

| Para qué | Comando |
|---|---|
| Verificar (tipos + lint) — **obligatorio antes de dar algo por terminado** | `npm run check` |
| Solo tipos (~17 s) | `npm run typecheck` |
| Código muerto (archivos, exports, dependencias sin uso) | `npm run deadcode` |
| Salud del proyecto Expo (versiones, duplicados) | `npm run doctor` |
| Desarrollo con hot reload | `npx expo start` (`r` recarga, `j` debugger) |
| Revisar pantallas en el navegador | `npx expo start --web --port 3000` |
| Emulador / dispositivo Android | `npx expo run:android` (o instalar el APK, ver README) |
| Agregar dependencias | `npx expo install <paquete>` (elige la versión compatible con SDK 55; no uses `npm i` para libs de Expo/RN) |

- ESLint arrastra 12 errores previos (línea base en `AUDITORIA_MOBILE.md`), así que `npm run check` falla hasta
  limpiarlos en la Fase 2. Mientras tanto la regla es: `typecheck` limpio y **ningún error nuevo** de ESLint en los
  archivos tocados (`npx eslint --quiet <archivos>`).
- No hay tests automatizados todavía: la verificación es `npm run check` + revisión visual + recorrer el flujo.
- Revisión visual: navegador integrado contra `localhost:3000`, viewport móvil (375×812), **claro y oscuro**.
- Backend: ver README (venv por servicio; `alembic upgrade head` manual — las migraciones **no** corren solas).

### Automatizaciones (`.claude/`)
- **Hook al editar** (`protect-paths.sh`): bloquea escribir en los intocables de §3.
- **Hook tras editar** (`lint-file.sh`): `eslint --fix` sobre el archivo de `mobile/` y muestra errores.
- **Hook al terminar el turno** (`typecheck-on-stop.sh`): si hay `.ts/.tsx` cambiados, corre `tsc`; si falla, hay
  que corregir antes de terminar.

---

## 3. Intocables

No modificar sin que el usuario lo pida explícitamente (los marcados con 🔒 los bloquea el hook):
- 🔒 `.env*` (salvo `.env.example`), keystores (`*.keystore`, `*.jks`), `mobile/android/`, `mobile/ios/`,
  `mobile/eas.json`.
- 🔒 Migraciones existentes en `backend/*/alembic/versions/` y `supabase/migrations/` (pueden estar aplicadas en
  producción). Se crean nuevas, nunca se editan las viejas.
- `mobile/app.config.js` (`runtimeVersion`, esquema, permisos): cambiarlo rompe el OTA y exige APK nuevo. Avisar antes.
- `deploy/services.conf`, workflows de `.github/`: afectan producción.
- `node_modules/`, `dist/`, `.expo/`: generados.

---

## 4. Estándar premium (definición de terminado de una pantalla)

Una pantalla está **✅ Premium** solo si cumple todo esto:

**Sistema de diseño**
- [ ] Cero hex sueltos: colores desde `useTheme()` (`@/src/hooks/useTheme`). Excepción: colores de identidad en
      `roleTools.ts`.
- [ ] Espaciado, radios, sombras y tipografía desde `constants/design.ts` (nada de `padding: 13`, `fontSize: 15.5`).
- [ ] Usa los componentes base en vez de recrearlos: `ScreenContainer`, `layout/ScreenHeader`, `Button`, `Card`,
      `ListRow`, `SectionHeader`, `FormField` + `forms/*`, `Badge`, `FilterChip`, `SearchBar`, `EmptyState`,
      `Skeleton`/`SkeletonList`, `AppRefreshControl`, `showAlert` (`AppAlert`), `KeyboardScreen`.
- [ ] Si falta un componente, se crea en `src/components/` y se reutiliza; no se copian estilos entre pantallas.
- [ ] Íconos solo de `lucide-react-native`.

**Estados (todos obligatorios)**
- [ ] Carga con `Skeleton` con la forma del contenido (no `ActivityIndicator` a pantalla completa).
- [ ] Vacío con `EmptyState`: mensaje útil y **una** acción clara.
- [ ] Error: la pantalla usa `ScreenContainer`, que ya incluye `QueryErrorBanner` (reintentar). Nunca pantalla en blanco.
- [ ] Pull-to-refresh en listas (`AppRefreshControl`). Botones con `loading`/`disabled` durante mutaciones.
- [ ] Formularios: validación inline por campo, teclado correcto, inputs no tapados (`KeyboardScreen`).

**UX**
- [ ] Una sola acción primaria por pantalla, visualmente dominante. Secundarias discretas.
- [ ] Sin botones redundantes (misma acción en header + FAB + tarjeta = elegir uno).
- [ ] Toda pantalla tiene salida. Ningún callejón sin salida.
- [ ] Objetivos táctiles ≥ 44 px (`layout.minTouch`), contraste legible en ambos temas, safe areas respetadas.
- [ ] Textos en español claro, sin jerga técnica. Confirmación antes de acciones destructivas.
- [ ] Pantallas de profesional/admin con `RoleGuard` y registradas en `ROUTE_ACCESS`.

**Funcional**
- [ ] Cada botón hace algo real contra el backend (el endpoint existe en `backend/michicondrias_<svc>`).
- [ ] Tras mutar se invalidan las queries correctas (la lista se actualiza sola).
- [ ] `npm run check` limpio en los archivos tocados.

Si una pantalla supera ~400 líneas, extrae secciones a `src/features/<modulo>/`.

---

## 5. Fases del proyecto

Se avanza **en orden**, **una fase (o un módulo de la fase) por sesión**, con commit al final. El estado de cada fase
vive en `PROGRESO_MOBILE.md`.

| # | Fase | Qué se hace | Herramientas |
|---|---|---|---|
| 0 | Cimientos | Tooling de verificación, `.claude/`, documentos | — ✅ |
| 1 | Auditoría | Solo lectura. Por módulo: cada pantalla/hook/servicio → *funciona / rota-incompleta / muerta*, hallazgos UI/UX y redundancias en `AUDITORIA_MOBILE.md` | plan mode, skill `auditar-modulo`, agente `ui-reviewer`, `npm run deadcode` |
| 2 | Limpieza | Borrar lo muerto, con la auditoría como lista y **aprobación del usuario** por bloque | `npm run deadcode`, agente `code-reviewer` |
| 3 | Navegación y esqueleto | Reestructurar rutas: grupo `(auth)`, 4–5 pestañas máximo, qué va en Inicio/Explorar/Perfil, eliminar pantallas duplicadas. **Propuesta aprobada antes de mover nada** | plan mode |
| 4 | Funcionalidad faltante | Completar lo roto/incompleto y ajustar servicios | skills `nuevo-endpoint`, `nueva-pantalla` |
| 5 | UI/UX premium | Design system primero (tokens, componentes, tipografía), luego pantallas módulo por módulo. Aquí entran juntas las libs nativas — `expo-image`, `expo-haptics`, FlashList, fuente propia vía `expo-font` — para sacar **un solo APK nuevo**; micro-interacciones con Reanimated (ya instalado) | skills `nueva-pantalla`, `review-ux`, agente `ui-reviewer` |

### Ciclo dentro de cada tarea
1. **Leer** `PROGRESO_MOBILE.md` y la sección del módulo en `AUDITORIA_MOBILE.md`.
2. **Planear** en plan mode si el cambio toca más de un par de archivos o mueve navegación.
3. **Proponer**: rediseños de flujo, borrar/fusionar pantallas o cambiar navegación → **visto bueno del usuario antes
   de implementar**. El pulido visual no requiere aprobación.
4. **Implementar**: componentes base primero, luego pantallas. Backend mínimo y aditivo.
5. **Verificar**: `npm run check`, capturas claro/oscuro a 375 px, recorrer el flujo completo.
6. **Revisar**: agente `code-reviewer` sobre el diff.
7. **Cerrar** (§6) y proponer un commit chico. No hacer commit/push sin que el usuario lo pida.

---

## 6. Cierre de sesión (siempre)

- `PROGRESO_MOBILE.md`: estado de la fase/módulo, entrada en la **Bitácora** (fecha, qué se hizo, archivos clave),
  decisiones nuevas en **Decisiones**, pendientes en **Backlog**.
- `AUDITORIA_MOBILE.md`: marcar hallazgos resueltos (`[x]`) y agregar los nuevos.
- Si se movió la línea base (hex, tokens, skeletons, lint, knip), volver a medirla.

---

## 7. Herramientas disponibles

- **Skills** (`.claude/skills/`): `auditar-modulo`, `nueva-pantalla`, `review-ux`, `nuevo-endpoint`.
- **Agentes** (`.claude/agents/`): `code-reviewer` (diff antes del commit), `ui-reviewer` (capturas + hallazgos).
  Para auditorías grandes se pueden lanzar varios en paralelo por módulo, pero las decisiones de diseño y las
  ediciones las hace el agente principal para mantener la consistencia.
- **MCP** (`.mcp.json`):
  - `context7`: documentación al día de Expo, Expo Router, Reanimated, React Query. Úsalo antes de usar una API que
    no conozcas bien en SDK 55.
  - `supabase`: esquema, tablas y tipos. **Configurado en solo lectura y es la base de producción**: solo consultas
    de lectura, nunca datos personales en las respuestas más allá de lo necesario.
  - `expo`: docs y herramientas de Expo/EAS (requiere sesión de Expo).

---

## 8. Reglas de cambios

- **Backend**: solo si la app lo necesita. Migraciones aditivas e idempotentes. Avisar al usuario que hay que correr
  `alembic upgrade head` en producción. Un push a `main` que toque `backend/**` o `deploy/**` **despliega a producción**.
- **OTA vs APK**: cambios de JS/estilos salen por OTA. Dependencias nativas, permisos, `app.config.js` o versión
  requieren APK nuevo → avisar antes y agruparlos (fase 5).
- No borrar pantallas ni rutas sin aprobación; puede haber enlaces profundos o notificaciones del backend apuntando a
  ellas. Al eliminar una, buscar referencias (`router.push`, `href`, `roleTools.ts`, `backend/`).
- Rutas nuevas de rol: registrarlas en `roleTools.ts` (`ROLE_TOOLS` y `ROUTE_ACCESS`), nunca hardcodear en menús.
- Commits chicos, en español, estilo convencional: `feat(mobile): …`, `fix(mobile): …`, `refactor(mobile): …`,
  `style(mobile): …`, `chore: …`. Una fase o módulo por commit para poder revertir fácil.
- Hábitos: `/clear` entre tareas distintas, `/compact` si la sesión se alarga. El usuario revisa los diffs.
