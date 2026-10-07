# Progreso — App móvil premium

Documento vivo. Claude lo lee al empezar y lo actualiza al terminar cada tarea (`CLAUDE.md` §6).
Criterios de "Premium": `CLAUDE.md` §4 · Fases: `CLAUDE.md` §5 · Hallazgos detallados: `AUDITORIA_MOBILE.md`.

**Leyenda:** ⬜ pendiente · 🔍 auditado · 🟡 en progreso · ✅ hecho · ⏸️ bloqueado · — no aplica

## Fase actual: **1 — Auditoría** (P1 completa · faltan P2 y P3)

| # | Fase | Estado |
|---|---|---|
| 0 | Cimientos (tooling, `.claude/`, documentos) | ✅ 2026-10-07 |
| 1 | Auditoría | 🟡 P1 🔍 2026-10-07 · P2/P3 ⬜ |
| 2 | Limpieza | ⬜ |
| 3 | Navegación y esqueleto | ⬜ propuesta aprobada 2026-10-07 |
| 4 | Funcionalidad faltante | 🟡 F1–F5 adelantadas 2026-10-07 (F4/F5 esperan deploy del backend) |
| 5 | UI/UX premium (+ APK con libs nativas) | ⬜ |

> **Orden recomendado:** las tareas P0 de la Fase 4 marcadas 🚨 (sesión, caché, búsqueda) no dependen de la navegación y
> conviene adelantarlas: hoy rompen flujos completos o filtran datos entre usuarios.

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
| P1 | Auth (`login`, `register`, `forgot-password`, `reset-password`) | 4 | 🔍 | ⬜ | ⬜ | Login roto en web; reset sin deep link inutilizable; sesión frágil (ver Transversales) |
| P1 | Pestañas (`(tabs)/`) | 5 | 🔍 | ⬜ | ⬜ | Campana falsa; tienda ×5; Herramientas duplica Perfil |
| P1 | Perfil (`perfil/`, `(tabs)/two`) | 7+1 | 🔍 | ⬜ | ⬜ | 2 perfiles, 2 KYC, paleta falsa, 2FA sin QR |
| P1 | Mascotas (`mascotas/`) | 5 | 🔍 | ⬜ | ⬜ | Ficha y carnet duplicados; editar visible en ajenas; triage IA real |
| P1 | Carnet (`carnet/`) | 6 | 🔍 | ⬜ | ⬜ | 987 líneas; sin fecha de vacuna; recordatorios huérfana; promesa de aviso falsa |
| P1 | Tienda cliente (`tienda/`, sin vendedor) | 8 | 🔍 | ⬜ | ⬜ | Stripe real; carrito y dirección pasan entre usuarios; caché de 30 s |
| P1 | Notificaciones, Búsqueda, Ayuda | 3 | 🔍 | ⬜ | ⬜ | Búsqueda da 500; notificaciones no navegan; FAQ falsas |
| P2 | Directorio y citas | 6 | ⬜ | ⬜ | ⬜ | `especialista/[id]` 809 líneas; `?type=clinic` ignorado |
| P2 | Adopciones | 12 | ⬜ | ⬜ | ⬜ | Muchas pantallas de solicitudes: ¿fusionar? |
| P2 | Perdidas | 4 | ⬜ | ⬜ | ⬜ | |
| P2 | Paseadores / Cuidadores (cliente) | 4+4 | ⬜ | ⬜ | ⬜ | Detalles de 844 y 938 líneas casi gemelos → componente compartido |
| P2 | Pet-friendly / Establecimientos | 3+4 | ⬜ | ⬜ | ⬜ | Dos módulos de "lugares": ¿solapan? (ambos en Explorar) |
| P2 | Grooming / Estilistas | 4+2 | ⬜ | ⬜ | ⬜ | Dos nombres para lo mismo |
| P2 | Entrenadores | 7 | ⬜ | ⬜ | ⬜ | |
| P2 | Transportistas | 8 | ⬜ | ⬜ | ⬜ | `useRideTracking.ts:50` viola rules-of-hooks |
| P2 | Aseguradoras | 8 | ⬜ | ⬜ | ⬜ | |
| P2 | Laboratorio | 3 | ⬜ | ⬜ | ⬜ | Dos servicios: `laboratorio.ts` y `laboratory.ts` |
| P2 | Funeraria | 10 | ⬜ | ⬜ | ⬜ | Tono sensible: copy cuidado |
| P2 | Donaciones | 1 | ⬜ | ⬜ | ⬜ | |
| P3 | Mi clínica (veterinario/hospital) | 14 | ⬜ | ⬜ | ⬜ | Segundo sistema de recetas (`services/prescriptions.ts`) |
| P3 | Servicios pro | 3 | ⬜ | ⬜ | ⬜ | |
| P3 | Tienda vendedor | 5 | ⬜ | ⬜ | ⬜ | |
| P3 | Patrocinadores | 5 | ⬜ | ⬜ | ⬜ | |
| P3 | Admin | 14 | ⬜ | ⬜ | ⬜ | |

---

## Propuesta de navegación (Fase 3) — ✅ aprobada 2026-10-07

Principio: **cada destino tiene un hogar**. Inicio = *lo mío hoy* · Explorar = *descubrir servicios* · Tienda = *comprar* ·
Perfil = *mi cuenta y mi actividad* · Herramientas = *mi trabajo* (solo pro/admin). Atajos contextuales sí, duplicados
no. Las URLs públicas no cambian (deep links de Stripe, reset y notificaciones siguen funcionando).

### Antes
```
app/
├─ login · register · forgot-password · reset-password      (sueltas en la raíz; guarda con useEffect → destello)
├─ (tabs)/
│  ├─ index      INICIO: lupa · campana (punto falso) · stats [Mascotas | Citas | "Ver Tienda"] · tarjeta alta pro
│  │             · panel del rol (pro) · carrusel mascotas · acciones [Buscar vet, Mis citas, Michi-Shop, Perdidos]
│  │             · próximas citas · banner Tienda
│  ├─ explorar   EXPLORAR: búsqueda → /busqueda · chips · 20 tarjetas (incl. Michi-Shop, Mis Compras, Carnet,
│  │             Clínicas = Veterinarios, Diagnóstico IA) · banner Diagnóstico IA (otra vez)
│  ├─ tienda-tab TIENDA: carrito · filtro → /tienda/categorias · tarjetas [Categorías, Mis compras, Mi tienda] · chips
│  ├─ two        PERFIL: lápiz + "Editar perfil" · Ser pro · Verificación · Notificaciones · Tema · Mis mascotas
│  │             · Mis compras · Carnet · Citas · Adopciones · Ayuda · Privacidad · Cerrar sesión
│  └─ menu       HERRAMIENTAS (pro/admin): banner = 1.ª herramienta · herramientas · CUENTA [Ser pro, Verificación,
│                2FA, Notificaciones] · SOPORTE [Ayuda, Apariencia → paleta falsa] · Cerrar sesión
├─ perfil/index  2.º perfil: formulario + [Mis mascotas, Compras, KYC → perfil/kyc, Configuración → /menu,
│                Paleta (falsa), 2FA, Facturación, Eliminar cuenta, Cerrar sesión]
├─ perfil/kyc ≈ perfil/verificacion · perfil/paleta (falsa)
├─ mascotas/index ≈ carnet/index · mascotas/[id] ≈ carnet/[id] · carnet/recordatorios (huérfana)
├─ tienda/index (redirect) · tienda/categorias (= chips) · pago-exitoso ≈ pago-cancelado
└─ notificaciones (×3 entradas) · busqueda (×2, da 500) · ayuda (×2)
```

### Después
```
app/
├─ _layout          Stack.Protected/guard por sesión (sin destello) · limpia todo al cerrar sesión
├─ (auth)/          _layout + AuthShell común · URLs iguales
│  ├─ login · register (auto-login) · forgot-password · reset-password (código de 6 dígitos*)
├─ (tabs)/
│  ├─ index         INICIO — "lo mío hoy"
│  │                header: logo · campana con badge real (única entrada a Notificaciones) · avatar → Perfil
│  │                tarjeta de estado accionable (solo si hay algo pendiente: alta pro, pedido sin pagar)
│  │                panel del rol (pro/admin): 4 atajos + "Ver todas" → Herramientas
│  │                Mis mascotas (carrusel + alta) · Próximas citas (cada una abre su cita; vacío → "Agendar")
│  │                Atajos dueño: Veterinarios · Diagnóstico IA · Perdidas · Adopciones
│  │                ✂ fuera: lupa, stat "Ver Tienda", acción Michi-Shop, banner Tienda
│  ├─ explorar      EXPLORAR — "descubrir"
│  │                búsqueda real (única entrada a /busqueda) · chips Salud/Servicios/Comunidad
│  │                Salud: Veterinarios y clínicas · Diagnóstico IA (1 sola) · Laboratorios · Seguros
│  │                Servicios: Paseadores · Cuidadores · Estética · Entrenadores · Transporte · Lugares pet-friendly**
│  │                · Funeraria
│  │                Comunidad: Adopciones · Perdidas · Donaciones
│  │                ✂ fuera: Michi-Shop, Mis Compras, Carnet, duplicado Clínicas, banner IA duplicado
│  ├─ tienda-tab    TIENDA (badge del carrito en la pestaña)
│  │                header: carrito · ícono Mis pedidos · búsqueda · chips de categoría (único filtro) · productos
│  │                ✂ fuera: tarjetas Categorías / Mis compras / Mi tienda, /tienda/categorias
│  ├─ two → perfil  PERFIL — "mi cuenta" (pantalla única)
│  │                cabecera (foto real, rol, insignia verificación) → Editar
│  │                Mi actividad: Mis mascotas · Mis citas · Mis compras · Mis adopciones
│  │                Cuenta: Datos personales · Verificación · Seguridad (2FA) · Facturación (si aplica) · Ser profesional
│  │                Preferencias: Tema claro/oscuro/sistema
│  │                Soporte y legal: Ayuda · Privacidad y términos
│  │                pie: Cerrar sesión (única) · Eliminar cuenta · versión
│  └─ menu          HERRAMIENTAS (solo pro/admin) — solo herramientas del rol, derivadas de ROLE_TOOLS
│                   ✂ fuera: Cuenta, Soporte, Cerrar sesión, banner duplicado
├─ perfil/          editar (ex index, solo formulario) · verificacion · seguridad-2fa · partner · eliminar-cuenta
│                   ✂ borrar: kyc, paleta
├─ mascotas/        index · nuevo · editar/[id] (PetForm común) · diagnostico-ia
│  └─ [id]          FICHA con pestañas Resumen · Salud (vacunas, recordatorios, labs) · Historial (consultas, recetas)
│                   compartir carnet + QR · modo solo lectura si no es el dueño
├─ carnet/          [id] → redirect a mascotas/[id]?tab=salud · nueva-consulta · nueva-vacuna · receta/[id]
│                   ✂ borrar: index, recordatorios
├─ tienda/          producto/[id] · carrito · compras · pedido/[id] · pago-exitoso + pago-cancelado (PagoResultado)
│                   index se queda solo como alias · ✂ borrar: categorias
└─ notificaciones (solo campana) · busqueda (solo Explorar) · ayuda (solo Perfil)
```
\* Requiere un endpoint nuevo en core. \** Pendiente de la auditoría P2: decidir si Pet-friendly y Establecimientos se
fusionan (igual Grooming/Estilistas).

### Pantallas que se eliminan o fusionan
| Pantalla | Destino | Referencias a actualizar |
|---|---|---|
| `perfil/index` | → `perfil/editar` (solo formulario) | `(tabs)/two.tsx:65,81` |
| `perfil/kyc` | borrar → `perfil/verificacion` | `perfil/index.tsx:299` |
| `perfil/paleta` | borrar (el tema se elige en Perfil) | `perfil/index.tsx:374`, `useMenu.ts:115` |
| `carnet/index` | borrar → `mascotas/index` | `(tabs)/two.tsx:165`, `useExplore.ts:61` |
| `carnet/recordatorios` | borrar (pestaña Salud) | ninguna (huérfana) |
| `carnet/[id]` | redirect → `mascotas/[id]?tab=salud` | `usePetDetail.ts:48`, `mi-clinica/pacientes.tsx:46`, `useAgenda.ts:120`, `usePetRecords.ts:27` |
| `tienda/categorias` | borrar (chips) | `tienda-tab.tsx:100,114` |
| `tienda/index` | se queda como alias; las referencias van directo al tab | `useHome.ts:36`, `useExplore.ts:77`, `carrito.tsx:129` |
| `pago-exitoso` / `pago-cancelado` | **se quedan** (deep link del backend) con un componente común | — |
| `(tabs)/two` | renombrar a `(tabs)/perfil` una vez que `perfil/index` ya no exista (verificar que no choque) | sin referencias directas |

---

## Backlog por fase

Tareas chicas (≤ 1 sesión). 🚨 = P0 · 🛠️ = toca backend (deploy a producción + `alembic upgrade head` si hay migración)
· 📱 = requiere APK nuevo. Detalle de cada una en `AUDITORIA_MOBILE.md`.

**Fase 1 — Auditoría (resto)**
- [ ] A1 Auditar P2: Directorio/citas, Adopciones, Perdidas.
- [ ] A2 Auditar P2: Paseadores/Cuidadores, Pet-friendly/Establecimientos, Grooming/Estilistas (decidir fusiones).
- [ ] A3 Auditar P2: Entrenadores, Transportistas, Aseguradoras, Laboratorio, Funeraria, Donaciones.
- [ ] A4 Auditar P3: Mi clínica, Servicios pro, Tienda vendedor, Patrocinadores, Admin.
- [ ] A5 Revisión visual con capturas (skill `review-ux`) de las pestañas y del flujo de compra, en claro y oscuro.

**Fase 2 — Limpieza** (aprobación del usuario por bloque)
- [ ] L1 Auth/Perfil muerto: `lib/auth.ts` (`getUserRole`, `logout`, `isAuthenticated`, `getPendingVerifications`,
      `verifyUser`, re-exports), `upgradeToPartner` + `upgradeMutation`/`handleUpgradeToPartner`, `getRoleIcon`,
      `getRoleLabel` → `getRoleLabelFor`, `KYCPresignedUrl`.
- [ ] L2 Notificaciones/búsqueda muerto: barrels `notifications`/`search`, `useSearch.ts`, `types/notifications.ts`,
      `TYPE_CONFIG` del hook, `filterBySearch`, `useAlerts` + 4 funciones de `alerts.ts`.
- [ ] L3 Tienda/carnet muerto: `types/ecommerce.ts`, `types/carnet.ts`, estilos `promo*`, `ShopCategory`, `OrderItem`,
      `getRemindersByPet`; `showAlert` con `require()` → import de `AppAlert` (`pedido/[id].tsx:225`).
- [ ] L4 `useHome.QUICK_ACTIONS` de roles y `useMenu.BANNERS` → derivar de `ROLE_TOOLS` (una sola fuente).
- [ ] L5 Los 12 errores de ESLint de la línea base + imports sin uso en los archivos P1.
- [ ] L6 Pendientes previos: borrar `src/components/ScreenHeader.tsx`; decidir barrels; unificar
      `laboratorio.ts`/`laboratory.ts`; exports duplicados de `roles.ts` y `Skeleton`.
- [ ] L7 Fuente única de tipos = `src/types/`: migrar las interfaces de cada servicio al tocar el módulo (no borrar
      `src/types/*` aunque knip los marque).
- [ ] L8 Borrar las 5 paletas alternativas de `constants/palettes.ts` (dejar solo `premium`).

**Fase 3 — Navegación** (tras aprobar la propuesta; un bloque por sesión)
- [ ] N1 Grupo `(auth)` + `_layout` con guard (`Stack.Protected`, consultar context7 SDK 55) y sin destello.
- [ ] N2 Perfil único: secciones nuevas en la pestaña; `perfil/index` → `perfil/editar`; borrar `perfil/kyc` y
      `perfil/paleta`; un solo Cerrar sesión.
- [ ] N3 Herramientas: solo herramientas del rol; quitar Cuenta, Soporte, Cerrar sesión y el banner duplicado.
- [ ] N4 Inicio: quitar lupa y accesos a la tienda; atajos de dueño nuevos; tarjeta de estado solo si es accionable.
- [ ] N5 Explorar: catálogo depurado (sin tienda, compras ni carnet; una sola entrada de IA; Veterinarios y clínicas).
- [ ] N6 Tienda: borrar `/tienda/categorias` y las tarjetas; referencias `/tienda` → tab; badge del carrito;
      `PagoResultado` común.
- [ ] N7 Ficha de mascota con pestañas (Resumen/Salud/Historial) absorbiendo `carnet/[id]`; redirect; borrar
      `carnet/index` y `carnet/recordatorios`.
- [ ] N8 Renombrar `(tabs)/two` → `(tabs)/perfil` (y opcionalmente `menu` → `herramientas`, actualizando `/(tabs)/menu`).

**Fase 4 — Funcionalidad**
- [x] 🚨 F1 Sesión robusta: no borrar el token por error de red; `onUnauthorized` de `apiFetch` → AuthContext; `signOut`
      limpia React Query, carrito, dirección y `user_role`; renovación deslizante del token.
- [x] 🚨 F2 Caché GET de 30 s: opción `noCache` (o quitarla y dejar a React Query) para pedidos, compras, notificaciones
      y cualquier refresh/polling.
- [x] 🚨 F3 Login en web (`setUserRole`) + email con `trim` en login y forgot (minúsculas → F11).
- [x] 🚨🛠️ F4 Búsqueda: corregir `search.py:43` (columna `category`) y filtrar `is_approved`; precio en productos.
- [x] 🚨🛠️ F5 Notificaciones: `read-all`, `unread-count`, migración `notifications.link`; badge real; navegar por `link`
      con mapeo de tipos reales de respaldo.
- [ ] 🚨 F6 Mascotas: editar solo el dueño (modo solo lectura); quitar la insignia falsa.
- [ ] 🚨🛠️ F7 Carnet: `date_administered` opcional + campo en la app; quitar la promesa de aviso (o F14).
- [ ] 🚨🛠️ F8 Pasaporte: llamada interna con token mascotas → carnet (`pets.py:331`).
- [ ] F9 Auth en capas: `src/services/auth.ts` (con `API_URLS`) + `src/hooks/auth/*`; hook `usePartnerUpgrade` y
      helper "guardar token + recargar" común.
- [ ] F10 Registro con login automático + línea a la cuenta profesional.
- [ ] 🛠️ F11 Backend auth: email sin distinguir mayúsculas (revisar duplicados antes), mensajes en español, contraseña
      mínima, `created_at` en `/users/me`.
- [ ] 🛠️ F12 Recuperación con código de 6 dígitos (si se aprueba) o token de un solo uso.
- [ ] F13 Perfil: 2FA con QR / "abrir en app autenticadora" / copiar, invalidar `user-profile`; verificacion con hook,
      cámara y CTA "Activar cuenta pro"; partner muestra el KYC antes de elegir.
- [ ] 🛠️ F14 Recordatorios y refuerzos: job emisor de notificaciones (o confirmar que se quitan de la UI).
- [ ] 🛠️ F15 Carnet: PUT/DELETE de vacunas y consultas + UI con confirmación; recalcular `is_vaccinated`; invalidaciones.
- [ ] F16 Mascotas: "vacunas al día" calculado, Tracker activo con salida, compartir carnet con QR (QR 📱 si es lib nativa).
- [ ] F17 Diagnóstico IA: vacío con "Agregar mascota", error sin peso → editar, selector de mascota en triage.
- [ ] F18 Tienda: hook `useCheckout` (useMutation + invalidaciones), refrescar precio y stock del carrito, no vaciar antes
      de pagar.
- [ ] 🛠️ F19 Tienda backend: liberar pedidos vencidos en `/orders/*`, notificar el pago a comprador y vendedor,
      `can_review`, paginación de `/orders/me`.
- [ ] F20 Stripe con `expo-web-browser` (`openAuthSessionAsync`; verificar que ya está en el APK actual).
- [ ] F21 Ayuda: FAQ verídicas, aviso si falla `Linking`, configurar soporte, términos y privacidad.
- [ ] 🛠️ F24 `link` en los emisores que faltan: directorio (`crud_services.notify_user`: citas, videoconsultas →
      `/mi-clinica/consultas-video`, laboratorio de clínica → la mascota), laboratorio, aseguradoras, funeraria y
      transportistas (hoy el mapeo por tipo + rol los cubre, salvo esos casos). Insertan con SQL crudo: agregar la
      columna `link` al INSERT solo **después** de aplicar la migración `d3e9a7b4c215` de core.
- [ ] F25 Búsqueda: "ver todos" por pestaña hacia el listado del módulo y más dominios (adopciones, perdidas, servicios).
- [ ] F23 `onError` de mutaciones: no mostrar error si `ApiError.sessionExpired` (ya avisa AuthContext).
- [ ] 🛠️ F22 Privacidad: limitar `GET /pets/{id}` a dueño/veterinario/admin; alinear `VET_ROLES` en `pet_access.py`.

**Fase 5 — UI premium + APK**
- [ ] U1 **Tema** (antes que nada): `warning` distinto de `accent`; token `heroGradient` por modo (adiós `#1c2f6b` fijo);
      paleta de acentos de dominio armonizada con *Midnight & Gold* (reemplaza el arcoíris Tailwind de
      `useExplore`/`useHome`/`roleTools`); `StatusBar` según el tema; un solo acceso `useTheme()`; tema guardado en
      AsyncStorage; decidir paletas alternas.
- [ ] U2 Componentes base: revisar los existentes y crear `AuthShell`, `SegmentedTabs`, `PetForm`; adoptar `FormField`
      y `utils/validators.ts`; documentar en `mobile/src/components/README.md`.
- [ ] U3 Auth (4 pantallas) con `AuthShell`, validación inline, autoComplete, ≥ 44 px.
- [ ] U4 Inicio, Explorar y Herramientas: tokens, Skeleton, EmptyState, refresh.
- [ ] U5 Perfil + `perfil/editar` + verificacion, 2FA, partner, eliminar-cuenta.
- [ ] U6 Mascotas: ficha con pestañas, `PetForm`, diagnóstico IA (`FormSelect`, colores del tema).
- [ ] U7 Carnet: partir `carnet/[id]` en `src/features/carnet/`, formularios con botón primario abajo, receta.
- [ ] U8 Tienda: tab, producto (extraer), carrito, compras, pedido.
- [ ] U9 Notificaciones, búsqueda (ampliada a más dominios) y Ayuda.
- [ ] 📱 U10 APK único: `expo-image`, `expo-haptics`, FlashList, fuente propia, **`expo-notifications` (push + tabla
      `push_tokens` 🛠️)**, QR si es nativa; quitar deps sin uso; `npx expo install --check`.
- [ ] U11 Evaluar Prettier (commit aparte) y Maestro (login, compra, adopción).

## Decisiones

- **2026-10-07** — Verificación inicial: tsc + ESLint + knip + expo-doctor, sin tests por ahora (Maestro/jest más adelante).
- **2026-10-07** — Libs nativas premium se agregan juntas en la Fase 5 para sacar un solo APK.
- **2026-10-07** — MCP del proyecto: Context7, Supabase (solo lectura, proyecto de producción) y Expo.
- **2026-10-07** — `tienda/pago-exitoso`, `tienda/pago-cancelado` y `mascotas/[id]` son destino de deep links del backend:
  no se borran ni se renombran.
- **2026-10-07** — El usuario delegó estas decisiones a Claude ("tú decide"):
  1. **Propuesta de navegación aprobada** tal como está arriba → la Fase 3 queda desbloqueada.
  2. "Mis compras" vive en Perfil › Mi actividad **y** como ícono discreto "Mis pedidos" en el header de la Tienda
     (contexto natural de compra). Se quitan las otras 3 entradas.
  3. Recuperación de contraseña con **código de 6 dígitos** por correo (endpoint nuevo en core, tarea F12). El enlace
     actual se mantiene mientras tanto.
  4. **Se borran las 5 paletas alternativas**; queda solo *Midnight & Gold* (claro/oscuro). Sin selector de paleta.
  5. Fuente única de tipos: **`src/types/`** (como dice `CLAUDE.md`). Los servicios pasan a importar de ahí módulo por
     módulo, cuando se toquen; en la Fase 2 no se borran los archivos de `src/types/` marcados por knip.
- **2026-10-07** — Las tareas 🚨 de la Fase 4 que no dependen de la navegación (F1 sesión, F2 caché, F3 login web) se
  adelantan antes de la Fase 2.

## Bitácora

- **2026-10-07** — Fase 0 completa: `CLAUDE.md`, este archivo y `AUDITORIA_MOBILE.md`; ESLint
  (`eslint-config-expo` 55) y knip instalados con scripts `check`, `typecheck`, `lint`, `deadcode`, `doctor`;
  `.claude/` con hooks (protección de rutas, lint por archivo, tsc al terminar), 4 skills y 2 agentes; `.mcp.json`.
  Línea base medida. Siguiente: Fase 1, empezando por los módulos P1 (Auth).
- **2026-10-07** — Fase 1, módulos P1 auditados (Auth, Pestañas, Perfil, Mascotas, Carnet, Tienda cliente,
  Notificaciones/Búsqueda/Ayuda) con 5 agentes en paralelo + revisión propia de pestañas y tema. Solo lectura de código
  (más consultas de lectura a Supabase). Hallazgos en `AUDITORIA_MOBILE.md` (sección Transversales + 7 módulos +
  consolidado de botones). Propuesta de navegación antes/después y backlog por fase en este archivo. Siguiente: visto
  bueno de la propuesta y adelantar los 🚨 de la Fase 4, o seguir con la auditoría P2.
- **2026-10-07** — Fase 4 adelantada, F1–F3 (solo app, sale por OTA, sin backend ni APK). `api.ts`: sin caché GET propia,
  `ApiError` (status, `sessionExpired`) y aviso a AuthContext solo si el token rechazado sigue siendo el vigente.
  `AuthContext`: copia local del usuario (`lib/auth.ts`) para abrir sin red; 401/403/400/404 cierran la sesión;
  `signOut` borra token, copia, `user_role` viejo, React Query y el carrito de esa cuenta. `CartContext` + nuevo
  `lib/cartStorage.ts`: carrito y dirección por usuario (se conservan si solo vence la sesión). `useSessionSync` montado
  en `_layout`, renueva siempre el token. Login/forgot con `trim`; adiós `user_role`. Verificado: tsc limpio, 0 errores
  ESLint nuevos, en web con sesión real (Inicio carga, refresh-token 1 vez, sin 401) y con token inválido (limpia y
  queda en /login). Revisión con `code-reviewer`: corregidos los 3 hallazgos importantes. Nota: quien actualice y abra
  sin red por primera vez cae en /login (aún no tiene copia local); se arregla solo al reconectar.
- **2026-10-07** — F4 y F5 (backend + app). **Core**: búsqueda sin la columna inexistente `products.category` (JOIN con
  `categories`), solo clínicas/productos aprobados, comodines LIKE escapados, 5 por tipo, precio y categoría;
  notificaciones con columna `link` (migración `d3e9a7b4c215`, aditiva, + índice parcial de no leídas),
  `GET /notifications/me/unread-count` y `PATCH /notifications/me/read-all`; aviso de KYC con `link`.
  **Adopciones**: cada aviso manda `link` (quien publica vs quien postula). **App**: tipos en `src/types/`
  (`notifications.ts`, `search.ts`); `resolveNotificationRoute` (link permitido por rol → si no, tipo + rol, con los
  11 tipos reales); badge real en la campana de Inicio; `notificaciones.tsx` reescrita con tokens, `EmptyState` y
  header siempre; búsqueda con subtítulo (precio · categoría) y salto a la pestaña con resultados;
  `QueryErrorBanner` ignora `ApiError.sessionExpired` (regresión de F1: buscaba el texto "No autorizado") y queries con
  `meta.silentError`. Verificado: TestClient + SQLite (búsqueda, permisos, contador, leer todas, link > 255 → 422),
  `alembic heads` único y SQL generado, tsc/eslint limpios, web con sesión real en claro/oscuro. Revisión
  `code-reviewer`: corregidos tipos faltantes (`cirugias`, `kyc`), links de adopciones y 7 menores.
  **Deploy pendiente (lo hace el usuario):** `alembic upgrade head` de core en producción **antes** del push.

