# HANDOFF — Michicondrias app móvil (para el siguiente agente)

Hola, MIMO 👋. Este documento te pasa el proyecto tal como quedó el **2026-10-07**. Está pensado para que trabajes solo,
sin repetir trabajo ni errores ya resueltos. Léelo completo una vez; después úsalo como checklist.

**Idioma:** todo en español (UI, commits, docs). Nombres de variables y funciones en inglés.

---

## 0. Lee esto primero (en este orden)

1. [`CLAUDE.md`](CLAUDE.md): reglas del repo. **Aplican a cualquier agente**, aunque el nombre diga Claude.
   Lo más importante: §3 Intocables, §4 Estándar premium (definición de terminado de una pantalla), §8 Reglas de cambios.
2. [`PROGRESO_MOBILE.md`](PROGRESO_MOBILE.md): estado por fase y módulo, línea base, **Backlog con IDs** (F9, A1, U1…),
   decisiones y bitácora.
3. [`AUDITORIA_MOBILE.md`](AUDITORIA_MOBILE.md): hallazgos detallados por módulo (archivo:línea), con `[x]` en lo resuelto.

> Se ignoran `archivo/`, `.agents/` y `.mimocode/` (son historial de herramientas anteriores).

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
| 4 Funcionalidad | 🟡 hechas las 8 urgentes (F1–F8); faltan F9–F27 |
| 5 UI premium + APK | ⬜ (U1–U11) |

`npm run check` **pasa** (tsc limpio, ESLint 0 errores / 73 avisos). Todo está en commits locales en `main`.

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

## 3. Despliegue (estado al 2026-10-07)

✅ **Todo lo de esta etapa ya está en producción:** migración de core `d3e9a7b4c215` aplicada en la VM (producción en
`d3e9a7b4c215 (head)`), push a `main` con deploy de `deploy-oracle.yml` exitoso, y OTA publicado en el canal
`production` (runtime 1.0.0, update group `fbb8e04e-5fdf-41a7-939e-29103309fbfd`).

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
| F9 | Auth en capas: `src/services/auth.ts` (con `API_URLS`, en vez de `lib/auth.ts` con URL a mano) + `src/hooks/auth/useLogin`, `useRegister`, `usePasswordReset`; hook `usePartnerUpgrade` para `perfil/partner.tsx`; helper común "guardar token + recargar usuario" (hoy duplicado en `useSessionSync` y `partner`) | ninguna pantalla de `(auth)` ni `partner` importa `lib/auth`, `apiFetch` o SecureStore |
| F10 | Registro con login automático + una línea hacia la cuenta profesional | tras registrarse cae en Inicio con sesión |
| F13 | Perfil: 2FA con QR (lib JS de QR en SVG; si es nativa, va a U10) + "Abrir en app autenticadora" + copiar clave; invalidar `['user-profile']`; `verificacion` con hook (`useKYC` ya existe: pásale la subida con cámara) y CTA "Activar cuenta pro" si está VERIFIED; `partner` muestra el estado del KYC antes de elegir rol | flujos recorridos en web sin errores |
| F16 | Mascotas: "Vacunas al día" calculado desde las vacunas (no del booleano manual), Michi-Tracker activo con salida (facturación o mapa), compartir carnet con QR (`handleShare` ya existe en `usePetDetail`, solo para el dueño) | ficha sin datos falsos |
| F17 | Diagnóstico IA: vacío con "Agregar mascota", error de "sin peso" con botón a editar, selector de mascota también en triage | sin callejones sin salida |
| F18 | Tienda: hook `useCheckout` (`useMutation`, invalida `my-orders`/`store-products`/`product`), refrescar precio y stock del carrito al abrirlo, no vaciar la bolsa antes de pagar | sin lógica de red en `CartContext` |
| F20 | Stripe con `expo-web-browser` `openAuthSessionAsync` (ya está en `package.json`; confirma que esté en el APK actual) | el pago vuelve a la app |
| F21 | Ayuda: FAQ verídicas (solo tarjeta, botón real "¡Quiero Adoptar!"), avisar si falla `Linking`, `ScreenContainer`/`ScreenHeader` | |
| F23 | Los `onError` de mutaciones no muestran error si `ApiError.sessionExpired` | un solo aviso al vencer la sesión |
| F15 🛠️ | PUT/DELETE de vacunas y consultas (carnet) + UI con confirmación | |
| F11 🛠️ | Core: email sin distinguir mayúsculas (**antes** busca duplicados por mayúsculas en `users`), mensajes en español, contraseña mínima, `created_at` en `/users/me` | |
| F12 🛠️ | Recuperación con código de 6 dígitos (decisión tomada): endpoint en core + pantalla única de reset | |
| F14 🛠️ | Emisor de recordatorios y refuerzos (job + notificación con `link`) | |
| F19 🛠️ | Tienda: liberar pedidos vencidos en `/orders/*`, notificar pago (tipo `store` + `link`), `can_review`, paginación | |
| F22 🛠️ | Privacidad: limitar `GET /pets/{id}` a dueño / veterinario / admin | |
| F24 🛠️ | `link` en los emisores que faltan (directorio, laboratorio, aseguradoras, funeraria, transportistas). Solo **después** de aplicar la migración `d3e9a7b4c215` | |
| F25–F27 | Búsqueda "ver todos" y más dominios; pasaporte legible y número de póliza enmascarado; `DatePicker` con tokens | |

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
