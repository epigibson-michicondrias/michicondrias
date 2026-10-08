# Progreso — App móvil premium

Documento vivo. Claude lo lee al empezar y lo actualiza al terminar cada tarea (`CLAUDE.md` §6).
Criterios de "Premium": `CLAUDE.md` §4 · Fases: `CLAUDE.md` §5 · Hallazgos detallados: `AUDITORIA_MOBILE.md`.

**Leyenda:** ⬜ pendiente · 🔍 auditado · 🟡 en progreso · ✅ hecho · ⏸️ bloqueado · — no aplica

## Fase actual: **4 — Funcionalidad** (Fases 0, 2 y 3 ✅ · Fase 1 con P2/P3 pendientes) · ver `HANDOFF.md`

| # | Fase | Estado |
|---|---|---|
| 0 | Cimientos (tooling, `.claude/`, documentos) | ✅ 2026-10-07 |
| 1 | Auditoría | 🟡 P1 🔍 2026-10-07 · P2/P3 ⬜ |
| 2 | Limpieza | ✅ 2026-10-07 (quedan hooks muertos de módulos P2/P3, ver L9) |
| 3 | Navegación y esqueleto | ✅ 2026-10-07 (N1–N7; ver N8) |
| 4 | Funcionalidad faltante | 🟡 los 8 🚨 (F1–F8) hechos 2026-10-07 (F4/F5/F7/F8 **en producción**) · **F1–F27 ✅ (Fase 4 completa en P1)** |
| 5 | UI/UX premium (+ APK con libs nativas) | ⬜ |

> **Siguiente:** ~~F26~~ ✅. Bloque B (auditoría P2/P3, A1–A5) o Fase 5 (U1 Tema). cierran el Bloque A. Después: Bloque B (auditoría P2/P3, tareas
> A1–A5) y Fase 5 (U1 Tema primero). El detalle y el orden están en `HANDOFF.md` §8.

---

## Línea base (inicial 2026-10-07 → tras Fase 2)

| Métrica | Inicial | Tras Fase 2 | Tras Fase 3 | Meta |
|---|---|---|---|---|
| Pantallas (`app/**/*.tsx`, sin layouts) | 164 | 157 | 155 | — |
| Pantallas que importan tokens de `constants/design.ts` | 5 | 9 | 13 | todas |
| Pantallas que usan el componente `Button` | 5 | 6 | 7 | todas las que tengan botones |
| Pantallas con colores hex sueltos | 141 | 135 | 127 | 0 |
| Pantallas con `ActivityIndicator` / con `Skeleton` | 83 / 30 | 62 / 29 | 62 / 29 | 0 / todas las de datos |
| Pantallas con `EmptyState` | 40 | 41 | 42 | todas las listas |
| ESLint errores / advertencias | 12 / 219 | **0** / 83 | **0** / 73 | 0 / 0 |
| knip: archivos / deps / exports sin uso | 29 / 6 / 147 | 23 / 6 / 65 | — | 0 / 0 / 0 |
| expo-doctor | 18/20 | 18/20 | 18/20 | 20/20 |
| `tsc` | limpio | limpio | limpio | limpio |
| `npm run check` | falla | **pasa** | **pasa** | pasa |

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
| P1 | Auth (`login`, `register`, `forgot-password`, `reset-password`) | 4 | 🔍 | 🟡 | ⬜ | F9 ✅, F10 ✅, F11 ✅ y F12 ✅ (código de 6 dígitos + pantalla única de reset); queda la pasada U3 |
| P1 | Pestañas (`(tabs)/`) | 5 | 🔍 | ⬜ | ⬜ | Campana falsa; tienda ×5; Herramientas duplica Perfil |
| P1 | Perfil (`perfil/`, `(tabs)/two`) | 7+1 | 🔍 | 🟡 | ⬜ | F13 ✅ (2FA con QR, KYC con cámara, estado en partner); faltan F11/F12 (core) y la pasada U5 |
| P1 | Mascotas (`mascotas/`) | 5 | 🔍 | 🟡 | ⬜ | F16 ✅ (vacunas calculadas del carnet, Tracker con salida a facturación, compartir carnet con QR); falta F17 (IA) y la pasada U6 |
| P1 | Carnet (`carnet/`) | 6 | 🔍 | 🟡 | ⬜ | F15 ✅ (vacunas y consultas se editan y borran con confirmación); F14 ✅ (avisos de dosis y refuerzos en la bandeja); falta la pasada U7 |
| P1 | Tienda cliente (`tienda/`, sin vendedor) | 8 | 🔍 | 🟡 | ⬜ | F18 ✅ (`useCheckout`, carrito con precio/stock frescos, bolsa se vacía al confirmar el pago); F19 ✅ (pedidos vencidos, aviso de pago, `can_review`, paginación); F20 ✅ |
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
| ~~`perfil/kyc`~~ | ✅ borrada en Fase 2 (2026-10-07) | — |
| ~~`perfil/paleta`~~ | ✅ borrada en Fase 2 (2026-10-07) | — |
| `carnet/index` | borrar → `mascotas/index` | `(tabs)/two.tsx:165`, `useExplore.ts:61` |
| ~~`carnet/recordatorios`~~ | ✅ borrada en Fase 2 (2026-10-07) | — |
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
- [x] L1 Auth/Perfil muerto: `lib/auth.ts` (`getUserRole`, `logout`, `isAuthenticated`, `getPendingVerifications`,
      `verifyUser`, re-exports), `upgradeToPartner` + `upgradeMutation`/`handleUpgradeToPartner`, `getRoleIcon`,
      `getRoleLabel` → `getRoleLabelFor`, `KYCPresignedUrl`.
- [x] L2 Notificaciones/búsqueda muerto: barrels `notifications`/`search`, `useSearch.ts`, `types/notifications.ts`,
      `TYPE_CONFIG` del hook, `filterBySearch`, `useAlerts` + 4 funciones de `alerts.ts`.
- [x] L3 Tienda/carnet muerto: `types/ecommerce.ts`, `types/carnet.ts`, estilos `promo*`, `ShopCategory`, `OrderItem`,
      `getRemindersByPet`; `showAlert` con `require()` → import de `AppAlert` (`pedido/[id].tsx:225`).
- [x] L4 `useHome.QUICK_ACTIONS` por rol eliminado (solo atajos de dueño). `useMenu.BANNERS` se resuelve en N3.
- [x] L5 Los 12 errores de ESLint de la línea base + imports sin uso en los archivos P1.
- [x] L6 Pendientes previos (barrels eliminados; `laboratory.ts` → `clinicLaboratory.ts`: NO era duplicado, es el
      laboratorio interno de la clínica): borrar `src/components/ScreenHeader.tsx`; decidir barrels; unificar
      `laboratorio.ts`/`laboratory.ts`; exports duplicados de `roles.ts` y `Skeleton`.
- [ ] L9 Hooks sin importador en módulos P2/P3 (decidir en la auditoría de cada módulo si la pantalla debe usarlos o se
      borran): `admin/useAdminOrders`, `clinica/useAlerts` (+ 4 funciones de `services/alerts.ts`), `clinica/usePatients`,
      `ecommerce/useSubcategories`, `perdidas/useReportActions`, `perdidas/useReportForm`. Deps sin uso → APK de Fase 5.
- [ ] L7 Fuente única de tipos = `src/types/`: migrar las interfaces de cada servicio al tocar el módulo (no borrar
      `src/types/*` aunque knip los marque).
- [x] L8 Borrar las 5 paletas alternativas de `constants/palettes.ts` (dejar solo `premium`).

**Fase 3 — Navegación** (tras aprobar la propuesta; un bloque por sesión)
- [x] N1 Grupo `(auth)` + `_layout` con guard (`Stack.Protected`, consultar context7 SDK 55) y sin destello.
- [x] N2 Perfil único: secciones nuevas en la pestaña; `perfil/index` → `perfil/editar` (kyc y paleta ya borradas);
      un solo Cerrar sesión.
- [x] N3 Herramientas: solo herramientas del rol; quitar Cuenta, Soporte, Cerrar sesión y el banner duplicado.
- [x] N4 Inicio: quitar lupa y accesos a la tienda; atajos de dueño nuevos; tarjeta de estado solo si es accionable.
- [x] N5 Explorar: catálogo depurado (sin tienda, compras ni carnet; una sola entrada de IA; Veterinarios y clínicas).
- [x] N6 Tienda: borrar `/tienda/categorias` y las tarjetas; referencias `/tienda` → tab; badge del carrito;
      `PagoResultado` común.
- [x] N7 Ficha de mascota con pestañas (Resumen/Salud/Historial) absorbiendo `carnet/[id]`; redirect; borrar
      `carnet/index` (`carnet/recordatorios` ya borrada).
- [x] N8 `(tabs)/two` → `(tabs)/perfil` (hecho en N2). `menu.tsx` conserva el nombre de archivo (su título ya es
      «Herramientas»/«Administración»; renombrarlo solo movería la URL `/(tabs)/menu` sin beneficio).

**Fase 4 — Funcionalidad**
- [x] 🚨 F1 Sesión robusta: no borrar el token por error de red; `onUnauthorized` de `apiFetch` → AuthContext; `signOut`
      limpia React Query, carrito, dirección y `user_role`; renovación deslizante del token.
- [x] 🚨 F2 Caché GET de 30 s: opción `noCache` (o quitarla y dejar a React Query) para pedidos, compras, notificaciones
      y cualquier refresh/polling.
- [x] 🚨 F3 Login en web (`setUserRole`) + email con `trim` en login y forgot (minúsculas → F11).
- [x] 🚨🛠️ F4 Búsqueda: corregir `search.py:43` (columna `category`) y filtrar `is_approved`; precio en productos.
- [x] 🚨🛠️ F5 Notificaciones: `read-all`, `unread-count`, migración `notifications.link`; badge real; navegar por `link`
      con mapeo de tipos reales de respaldo.
- [x] 🚨 F6 Mascotas: editar solo el dueño (modo solo lectura); quitar la insignia falsa.
- [x] 🚨🛠️ F7 Carnet: `date_administered` opcional + campo en la app; quitar la promesa de aviso (o F14).
- [x] 🚨🛠️ F8 Pasaporte: llamada interna con token mascotas → carnet (`pets.py:331`).
- [x] F9 Auth en capas: `src/services/auth.ts` (con `API_URLS`) + `src/hooks/auth/*`; hook `usePartnerUpgrade` y
      helper "guardar token + recargar" común (`AuthContext.refreshSession`).
- [x] F10 Registro con login automático + línea a la cuenta profesional.
- [x] 🛠️ F11 Backend auth: email sin distinguir mayúsculas (revisar duplicados antes), mensajes en español, contraseña
      mínima, `created_at` en `/users/me`.
- [x] 🛠️ F12 Recuperación con código de 6 dígitos (decisión tomada): endpoint en core + pantalla única de reset
      (**migración aditiva** `f12a8b3c4d5e`: `users.reset_code_hash`/`reset_code_expires_at`).
- [x] F13 Perfil: 2FA con QR / "abrir en app autenticadora" / copiar, invalidar `user-profile`; verificacion con hook,
      cámara y CTA "Activar cuenta pro"; partner muestra el KYC antes de elegir.
- [x] 🛠️ F14 Recordatorios y refuerzos: job emisor dentro de carnet (`app/jobs/reminders.py`, cada 5 min): dosis de
      medicamento (`recetas`) y refuerzos 7 días antes (`vacunas`), con `link` a la pestaña Salud (**migración
      `c14a7e2b9d01`**).
- [x] 🛠️ F15 Carnet: PUT/DELETE de vacunas y consultas + UI con confirmación; recalcular `is_vaccinated`; invalidaciones
      (edición desde los mismos formularios: fecha de aplicación en solo lectura y la receta se gestiona aparte).
- [x] F16 Mascotas: "vacunas al día" calculado, Tracker activo con salida, compartir carnet con QR (QR 📱 si es lib nativa).
- [x] F17 Diagnóstico IA: vacío con "Agregar mascota", error sin peso → editar, selector de mascota en triage
      (`pet_id` opcional en el backend, aditivo, con contexto de especie/peso/edad).
- [x] F18 Tienda: hook `useCheckout` (useMutation + invalidaciones), refrescar precio y stock del carrito, no vaciar antes
      de pagar.
- [x] 🛠️ F19 Tienda backend: liberar pedidos vencidos en `/orders/*`, notificar el pago a comprador y vendedor,
      `can_review` (`GET /products/{id}/review-eligibility`), paginación de `/orders/me` (scroll infinito en Mis compras).
- [x] F20 Stripe con `expo-web-browser` (`openAuthSessionAsync` en `utils/payments.openStripeUrl`: los 5 puntos que
      abren Stripe; en web sigue abriendo pestaña nueva).
- [x] F21 Ayuda: FAQ verídicas (solo tarjeta y el botón real «¡Quiero Adoptar!»), aviso si falla `Linking`,
      `ScreenContainer`/`ScreenHeader`, Términos y Privacidad (filas que se ocultan sin URL configurada).
- [x] 🛠️ F24 `link` en los emisores que faltan: directorio (`crud_services.notify_user`: citas, videoconsultas →
      `/mi-clinica/consultas-video`, laboratorio de clínica → la mascota), laboratorio, aseguradoras, funeraria y
      transportistas (hoy el mapeo por tipo + rol los cubre, salvo esos casos). Insertan con SQL crudo: agregar la
      columna `link` al INSERT solo **después** de aplicar la migración `d3e9a7b4c215` de core (✅ aplicada).
- [x] F25 Búsqueda: "ver todos" por pestaña hacia el listado del módulo y más dominios (adopciones, perdidas, servicios).
- [x] F26 Pasaporte público: enmascarar `policy_number` (últimos 4) y página legible en vez del JSON crudo (va con F16).
- [x] F27 `DatePicker` con `useTheme`/tokens y etiqueta en tipo oración (token nuevo `type.labelSentence`); fechas
      del carnet con locale `es-MX`.
- [x] F23 `onError` de mutaciones: no mostrar error si `ApiError.sessionExpired` (ya avisa AuthContext) — corte central
      en `AppAlert.notifySessionExpired` (un solo aviso al vencer la sesión).
- [x] 🛠️ F22 Privacidad: limitar `GET /pets/{id}` a dueño/veterinario/admin; alinear `VET_ROLES` en `pet_access.py`.

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
- **2026-10-07** — F6–F8. **F6** (app): ficha de mascota con `isOwner`; editar, Michi-Tracker y servicios solo para el
  dueño (admin y veterinarios la ven en lectura); fuera la insignia "verificado" falsa; "Notas médicas" (era la
  descripción) → "Sobre {nombre}" solo si existe. **F7** (carnet + app): `VaccineCreate.date_administered` opcional con
  validadores (no futura, refuerzo ≥ aplicación), sin migración (la columna ya existía); `nueva-vacuna` reescrita con
  tokens, `KeyboardScreen`, botón primario abajo, fecha de aplicación, refuerzo opcional (+1 año sugerido) y sin la
  promesa de aviso; fechas enviadas a mediodía local (evita "un día antes" en UTC-6); `api.ts` limpia "Value error, ".
  **F8** (mascotas): el pasaporte público lee vacunas y póliza directo de la base compartida (antes HTTP sin token →
  siempre vacío) y expone menos (sin prima, reclamos, notas ni id del veterinario). Verificado con TestClient + SQLite,
  SQL en Postgres (solo lectura), tsc/eslint y revisión visual (ficha y formulario, sin guardar en producción).
  `code-reviewer`: corregido el corrimiento de fecha; resto al backlog (F26, F27). Deploy: push a `main` sube carnet y
  mascotas; **sin migraciones**.
- **2026-10-07** — **Fase 2 completa** (solo app, OTA). Borrados: 18 barrels `src/hooks/*/index.ts` (55 imports pasados a
  directos), `components/useColorScheme(.web).ts` (patrocinadores/nuevo ignoraba el tema elegido → ahora `useTheme`),
  `src/components/ScreenHeader.tsx`, `useSearch`, `styles/common`, `utils/index`; pantallas `perfil/paleta` (falsa),
  `perfil/kyc` (duplicada) y `carnet/recordatorios` (huérfana) + `useReminders`; 5 paletas alternativas (queda solo
  Midnight & Gold). Código muerto de `lib/auth`, `auth2fa`, `use2FA`, `useProfile` (la etiqueta de rol ahora usa
  `getRoleLabelFor`: el consumidor ve «Dueño de mascota» y los roles que salían como «Usuario» muestran su nombre),
  `roles.ts`, `useHome.QUICK_ACTIONS`. Lint: 134 imports sin uso fuera, 12 errores base corregidos (comillas «»,
  `+not-found` en español con EmptyState, `useRideAction`, texto de pago-exitoso) → **`npm run check` pasa** por primera
  vez (0 errores, 83 avisos). `index.js`: el polyfill de MessageQueue ahora sí corre antes de expo-router (`require`).
  `services/laboratory.ts` → `clinicLaboratory.ts`. Verificado: tsc, check, web (arranque y ruta borrada → not-found),
  `code-reviewer` sin bloqueantes. Despliegue de backend (F4/F5/F7/F8) **pendiente del usuario**: el clasificador de
  permisos bloqueó leer credenciales de producción para correr la migración.
- **2026-10-07** — **Fase 3 completa** (solo app, OTA). N1 grupo `(auth)` + guarda sin destello (deja abrir
  reset-password con sesión). N2 Perfil único `(tabs)/perfil` (+ `perfil/editar`, `useAccount`, `FormField` con error
  inline, `SegmentedControl`). N3 Herramientas solo con `ROLE_TOOLS`. N4 Inicio sin lupa ni accesos a la tienda, atajos
  nuevos. N5 Explorar con 14 servicios (fuera tienda, compras, carnet, clínicas duplicadas y Patrocinadores, que era el
  panel interno de campañas con presupuestos). N6 Tienda: chips como único filtro, Mis pedidos + bolsa en el header,
  contador en la tab bar, `PagoResultado` común, `/tienda/categorias` borrada. N7 ficha de mascota con pestañas
  Resumen · Salud · Historial (`usePetHealth`, `features/carnet/CarnetItems`, `features/mascotas/PetHealthTabs`);
  `carnet/[id]` redirige; `carnet/index` borrada; Mi clínica abre Historial. Verificado: `npm run check` (0 errores,
  73 avisos), revisión en web con sesión real (claro/oscuro) de cada bloque. Un commit por bloque.
  Siguiente: el trabajo continúa con otro agente según `HANDOFF.md`.
- **2026-10-07** — **Despliegue**: push a `main` (deploy-oracle ✅), migración de core `d3e9a7b4c215` aplicada en la VM
  (`ssh michicondrias-oracle`, `alembic upgrade head` → head) y OTA en `production` (update group
  `fbb8e04e-5fdf-41a7-939e-29103309fbfd`). Verificado en vivo con sesión real: búsqueda 200 (antes 500),
  `/notifications/me` y `/me/unread-count` 200. F4, F5, F7 y F8 ya están en producción.
- **2026-10-07** — **F9 Auth en capas** (solo app, sale por OTA). `src/lib/auth.ts` **borrado** → `src/services/auth.ts`
  sobre `apiFetch`/`API_URLS` (login form-urlencoded, verify-2FA, registro, forgot/reset, `/users/me`, refresh-token,
  upgrade-role y `getStoredTokenRole`), `src/types/auth.ts` (User, LoginResponse, TokenResponse, RefreshTokenResponse,
  RoleUpgradeResponse, VerificationStatus → L7 del módulo) y `src/lib/sessionStorage.ts` (copia local del usuario y
  `clearStoredSession`). `AuthContext`: `signIn(token)` guarda el token, limpia la caché de la cuenta anterior y carga
  el usuario; `refreshSession(token)` es el helper común «guardar token + recargar usuario» que antes estaba duplicado
  en `useSessionSync` y `perfil/partner`. Hooks nuevos: `hooks/auth/useLogin` (login + verify2FA), `useRegister`,
  `usePasswordReset` y `hooks/perfil/usePartnerUpgrade` (exige KYC VERIFIED y devuelve `{ok:false, verification}` para
  que la pantalla guíe a `/perfil/verificacion`). Las 4 pantallas `(auth)` y `perfil/partner` delegan en los hooks:
  **ninguna importa `lib/auth`, `apiFetch` ni SecureStore** (criterio de F9). `useSessionSync` usa el servicio y el
  helper común. Verificado: `npm run check` (0 errores, 73 avisos = línea base), knip sin novedades y smoke headless
  en web a 375×812 (9/9): login renderiza, validación de campos vacíos, credenciales falsas → error del backend
  «Incorrect email or password», register/forgot/reset renderizan, forgot con correo inexistente confirma el envío,
  reset con token falso → «Token inválido o expirado», sin errores de runtime. **Sin escrituras en producción.**
  Pendiente en Auth: F10 (auto-login tras registro + línea pro) y F13 (2FA con QR); mensajes del backend en inglés van
  en F11. Commit local; el OTA se agrupa con el siguiente bloque.
- **2026-10-07** — **F10 Registro con login automático** (solo app). `useRegister` encadena `register` → `login` →
  `signIn`: tras crear la cuenta el usuario **cae en Inicio con sesión** (antes caía en `/login` y reescribía sus
  credenciales). Si el login automático falla, aviso claro («Tu cuenta se creó… entra con tu correo y contraseña»).
  `register.tsx` ya no muestra el alerta «Ir a Login» y suma la línea hacia la cuenta profesional («¿Ofreces servicios
  para mascotas? Podrás activar tu cuenta profesional desde Perfil»). Verificado **sin tocar producción** con un core de
  juguete (stub con CORS) y un Metro aparte con `EXPO_PUBLIC_API_URL` apuntando al stub (sonda de seguridad: aborta si
  el tráfico no llega al stub antes de registrar): 7/7 — render, línea pro, validación local y, tras el registro,
  sesión abierta en Inicio (smoke headless 375×812). `npm run check` 0 errores. El arnés del stub quedó en
  `/tmp/opencode/f9-smoke/` (no se sube al repo). Commit local; el OTA sigue agrupado con el siguiente bloque.
- **2026-10-07** — **F13 Perfil: 2FA con QR y KYC con cámara** (solo app). `seguridad-2fa`: QR real en SVG
  (`react-native-qrcode-svg`, JS puro sobre `react-native-svg` que ya estaba → sin APK) en lugar del texto
  `otpauth://`, más «Abrir en app autenticadora» (`Linking`) y «Copiar clave» (web: portapapeles; nativo: el menú de
  compartir incluye «Copiar», y si tampoco hay, aviso para copiarla a mano — `expo-clipboard` va en el APK de U10).
  `use2FA` invalida `['user-profile']` al activar/desactivar. `verificacion` reescrita sobre `useKYC` (fuera el
  `fetch` a S3 y `services/kyc` de la pantalla): cada documento se captura **con cámara o galería**
  (`pickDocument`, `launchCameraAsync`/`launchImageLibraryAsync`), `reloadUser` al enviar y **CTA «Activar cuenta
  profesional» cuando el KYC está VERIFIED**. `partner` muestra la **tarjeta de estado del KYC antes de elegir el
  rol** (con enlace a verificación si falta). Helpers: `copyText` en `utils/helpers` y `shareContent` ahora informa
  si el menú abrió. Verificado sin tocar producción (stub core con CORS + Metro aparte con `EXPO_PUBLIC_API_URL`,
  sonda de seguridad incluida): **15/15** en web 375×812 — setup con QR (SVG de 180 px confirmado en el DOM), copiar
  clave con feedback, cámara/galería con filechooser real (3 documentos), envío → «¡Documentos enviados!», partner
  con el estado del KYC y CTA pro solo con VERIFIED, sin errores de runtime. `npm run check` 0 errores (72 avisos, −1
  vs línea base). Nota: la cámara nativa puede necesitar el plugin `expo-image-picker` en `app.config.js` (va con el
  APK de U10); en web funciona con el selector de archivos.
- **2026-10-07** — **F16 Mascotas: ficha sin datos falsos** (solo app). «Vacunas» del Resumen **calculado del carnet**
  (`usePetHealth.vaccinesStatus`: sin vacunas / refuerzo (`next_due_date`) vencido / al día) en vez del booleano manual
  `is_vaccinated`; las vacunas ahora se cargan también en el Resumen. **Michi-Tracker activo con salida**: con la
  suscripción vigente la tarjeta abre la **facturación** (`createBillingPortalSession`) para ver, cambiar o cancelar;
  sin suscripción sigue activando el alta. **Compartir carnet con QR** (solo el dueño): botón en el header de la ficha
  → `usePetDetail.openShare` pide la URL pública del pasaporte y abre `features/mascotas/PetPassportShare` (QR del
  enlace, URL copiable y «Compartir enlace» con fallback a copiar). El smoke cazó un bug real (el `QRCode` con valor
  vacío revienta al cerrar el modal → pantalla blanca) y quedó corregido. Verificado sin tocar producción (stub con
  mascota `is_vaccinated: true` + vacuna con refuerzo vencido): **10/10** — la ficha muestra «Vencido» pese al booleano,
  el Tracker abre facturación (POST al portal), el modal con QR dibujado (SVG 180) se cierra sin romper. `npm run
  check` 0 errores (72 avisos).
- **2026-10-07** — **F17 Diagnóstico IA sin callejones** (app + backend aditivo). App: selector de mascota **también en
  el triage** (opcional; manda `pet_id`), el vacío sin mascotas ofrece **«Agregar mascota»** (en el triage y en el plan
  nutricional) y si falta el peso la alerta lleva a **«Editar mascota»** (pre-chequeo en el hook + mapeo del 400 del
  backend). Backend (`mascotas`): `SymptomCheckRequest.pet_id` **opcional y aditivo** — el dueño pasa contexto real
  («Michi (gato, Criollo, 4.2 kg, 18 meses)») al prompt de Claude y al resumen de reglas; las mascotas ajenas se
  ignoran (sin filtrar datos). Verificado sin tocar producción: TestClient + SQLite en memoria **4/4** (sin pet_id =
  comportamiento previo, con pet_id propio hay contexto, mascota ajena ignorada, id inexistente sin contexto) y smoke
  web con stub **11/11** (selector con las mascotas, `pet_id` presente/ausente en el body según corresponde, CTA de
  peso navega a `/mascotas/editar/[id]`, «Agregar mascota» navega al alta). `npm run check` 0 errores.
  **El backend queda listo para desplegar** (sin migración; se agrupa con el siguiente bloque 🛠️).
- **2026-10-07** — **F18 Tienda: checkout en capas y bolsa honesta** (solo app). La red sale de `CartContext` (que
  queda solo con estado) → **`hooks/ecommerce/useCheckout`** (`useMutation`: crear pedido → sesión de Stripe → abrir la
  pasarela; si la apertura falla, cancela el pedido para devolver el stock; invalida `my-orders`, `store-products` y
  `product` al iniciar el pago). **`hooks/ecommerce/useCartProducts`** refresca **precio y stock al abrir el carrito**
  (`syncProducts` en el contexto: ajusta cantidades, retira agotados y avisa). **La bolsa ya NO se vacía antes de
  pagar**: se limpia cuando el pago se confirma (`PagoResultado` en el deep link de éxito). `clearCart` quedó con
  `useCallback` (si no, su efecto en `PagoResultado` entraba en loop). Verificado sin tocar producción (stub con
  producto cuyo precio cambia entre pasos): **13/13** — el carrito se ve con el precio del snapshot ($100), al
  reabrirlo se refresca al del servidor ($250) y se pide el producto al backend, el checkout crea pedido + sesión y
  abre la pasarela (en web navega a Stripe), la bolsa sigue llena hasta que `pago-exitoso` la vacía. `npm run check`
  0 errores.
- **2026-10-07** — **F23 Un solo aviso al vencer la sesión** (transversal, solo app). En vez de tocar los ~138 `onError`
  de mutaciones (74 archivos), el corte es **central en `AppAlert`**: `notifySessionExpired()` (lo llama `AuthContext`
  justo antes de mostrar «Tu sesión expiró») silencia los avisos de `type: 'error'` durante 5 s — los `onError` de las
  acciones que caen con la sesión ya no tapan ni duplican el aviso bueno. Verificado sin tocar producción (stub con
  modo «sesión vencida» que responde 401 con token): **7/7** — compartir el carnet con la sesión vencida muestra UN
  aviso («Tu sesión expiró»), NO aparece el «No se pudo compartir» de la acción en vuelo y la guarda lleva al login.
  `npm run check` 0 errores.
- **2026-10-07** — **F20 Stripe con vuelta a la app** (solo app). Nuevo `utils/payments.openStripeUrl`: en nativo abre
  la pasarela con **`WebBrowser.openAuthSessionAsync`** (redirect `michicondrias://` → la sesión se cierra sola cuando
  el pago vuelve por deep link; si el usuario la cierra, carrito y pedido se conservan) y en web mantiene `Linking`
  (que en el navegador abre la pasarela en pestaña nueva). Se usa en los **5 puntos que abren Stripe**: checkout del
  carrito, reintento de pago del pedido (`useOrderDetail`), suscripción de Michi-Tracker y portal de facturación
  (`usePetDetail`), portal de facturación de Perfil (`useAccount`) y donaciones. `useCheckout` además se reordenó:
  primero queda el pedido en pantalla y **después** se abre la pasarela (sin bloquear la mutación en el navegador de
  auth, que en nativo se cierra con el deep link). `expo-web-browser` era dependencia sin uso en la auditoría y ya está
  en uso (knip: 6 → 5 deps sin uso). Verificado sin tocar producción: regresión del flujo de compra **13/13** con stub
  (pedido + sesión de pago creados, la página de Stripe se carga, la bolsa se conserva hasta `pago-exitoso`).
  `npm run check` 0 errores. La ruta nativa (`openAuthSessionAsync`) se confirma en el próximo APK/emulador.
- **2026-10-07** — **F21 Ayuda verídica** (solo app). Las FAQ ya describen la app real: la adopción cita el botón que
  existe (**«¡Quiero Adoptar!»**, antes decía «Solicitar Adopción») y los pagos son **solo tarjeta** (fuera las
  transferencias y tiendas de conveniencia que Stripe no acepta). `Linking.openURL` ya no falla en silencio: avisa y
  ofrece el correo de soporte. La pantalla usa `ScreenContainer`/`ScreenHeader` (adiós `paddingTop: 60` y el problema
  de safe area) y suma la fila de **Aviso de Privacidad** junto a Términos (ambas se ocultan si su URL no está
  configurada). Verificado sin tocar producción: **7/7** con stub — render, FAQ corregidas (sin «Solicitar
  Adopción» ni «transferencias»), Email visible y los opcionales ocultos, el contacto no rompe la pantalla.
  `npm run check` 0 errores. **Pendiente del usuario:** valores de `EXPO_PUBLIC_SUPPORT_PHONE`,
  `EXPO_PUBLIC_SUPPORT_WHATSAPP`,   `EXPO_PUBLIC_TERMS_URL` y `EXPO_PUBLIC_PRIVACY_URL` en `.env` para que se vean
  WhatsApp, teléfono y las filas legales.
- **2026-10-07** — **F15 Carnet editable** (app + backend). **Backend (carnet)**: PUT y DELETE de vacunas y consultas
  (con `assert_can_write_pet_record`: dueño o equipo clínico), GET por id para editar, y **recálculo de
  `is_vaccinated`** en la mascota al crear/borrar vacunas (SQL sobre la base compartida). `MedicalRecordUpdate` acepta
  además `temperature_c` (aditivo). Verificado con TestClient + SQLite: **6/6** (PUT, DELETE conservando el estado,
  recálculo a falso al vaciar, vuelta a true al crear, PUT/DELETE de consulta, 403 de extraños y 404). **App**:
  servicios y tipos de actualización/borrado, botones **Editar/Eliminar** en cada vacuna y consulta (solo dueño o
  clínica), **borrar siempre con confirmación**, y edición desde los mismos formularios (`nueva-vacuna`,
  `nueva-consulta` con `?id=`): precarga, guarda con PUT y **la fecha de aplicación queda en solo lectura** (dato
  clínico) y la receta se gestiona aparte. Invalidaciones de `pet-vaccines`/`pet-records`, `pet-profile` y la ficha
  individual. Verificado sin tocar producción: smoke con stub **13/13** (confirmación con Cancelar que conserva, DELETE
  que borra y llega al backend, edición precargada con la fecha solo lectura, PUT con los cambios y vuelta al carnet).
  `npm run check` 0 errores. **El backend de carnet queda listo para desplegar** (sin migración; se agrupa con F14/F19/F22/F24).
- **2026-10-07** — **Despliegue**: push a `main` (12 commits, `485780b..802734c`) → `deploy-oracle.yml` ✅ (sync + reinicio
  + health-check), `scripts/vm.sh status` **17/17 activos en http 200** y **OTA en `production`** (runtime 1.0.0, update
  group `830b5963-79ad-4b4f-a2ff-602f489237f3`, commit `802734c`). Sin migraciones (F17 y F15 son solo código). Ya en
  producción: F9–F21 y F15 (app) + `pet_id` del triage y carnet PUT/DELETE (backend).
- **2026-10-07** — **F11 Core: cuenta honesta** (backend de core). **Chequeo previo de duplicados** en producción (solo
  lectura: 2 usuarios, 0 con mayúsculas, 0 duplicados case-insensitive) y luego el correo **dejó de distinguir
  mayúsculas**: `get_user_by_email` compara en minúsculas (login, forgot y el chequeo de duplicados del registro) y
  `create_user` guarda el correo normalizado. **Mensajes en español** («Correo o contraseña incorrectos», «La cuenta
  está desactivada», duplicados de usuario/configuración: antes todo en inglés). **Contraseña mínima de 8** en
  `UserCreate`/`UserUpdate` (mensaje en español vía 422, que la app ya muestra limpio). **`created_at` en `/users/me`**
  (la columna existía en `public.users` y `BaseModel` ya la mapeaba: solo faltaba exponerla; ahora puede salir «Miembro
  desde» en U5). Además el registro público **fuerza `is_active: true`** (antes el cliente podía mandar `false`).
  Verificado con TestClient + SQLite: **6/6** (normalización, duplicado por mayúsculas, login con otra combinación y
  mensaje en español, contraseña corta rechazada, `is_active` forzado, `created_at` presente). **Pendiente de
  desplegar** (sin migración; se agrupa con F12/F14/F19/F22/F24).
- **2026-10-08** — **F12 Recuperación con código de 6 dígitos** (core + app). **Core**: `forgot-password` genera un
  código de 6 dígitos, guarda su **HMAC** (nunca en claro) con vencimiento de 30 min y lo manda por correo junto al
  enlace de siempre (que se mantiene); el nuevo `POST /reset-password/code` lo valida, cambia la contraseña y lo
  **invalida al usarlo** (un solo uso, a diferencia del token). Helpers `generate_reset_code`/`hash_reset_code`/
  `verify_reset_code` en `core/security.py`. **Migración aditiva `f12a8b3c4d5e`** (`users.reset_code_hash`,
  `reset_code_expires_at`) — ⚠️ hay que correr `alembic upgrade head` de core en producción tras el deploy. El correo
  muestra el código en grande además del botón/enlace. **App**: pantalla **única** de reset — con código + correo por
  defecto y con los campos de contraseña; si llega el deep link `?token=` usa el flujo de enlace (sin código). El
  `forgot-password` habla de código («Enviar código») y el botón «¿Ya tienes el código?» lleva al reset. Verificado:
  backend con TestClient **6/6** (guarda hash+vencimiento, rechaza código erróneo/expirado, cambia la contraseña de
  verdad y el código no se puede reusar) y smoke con stub **9/9** (envío, rechazo del código malo, éxito con el bueno,
  y el deep link con token sigue pidiendo solo contraseña). `npm run check` 0 errores.

- **2026-10-08** — **F22 Privacidad de la ficha de mascota** (backend). `GET /pets/{id}` ya **no es público para
  cualquier sesión**: solo el dueño, el equipo clínico (`VET_ROLES`), un admin o un servicio interno (token interno de
  carnet). La búsqueda no se afecta (solo lista mascotas propias) y el pasaporte compartido sigue siendo su propio
  endpoint público. Además **`pet_access` quedó alineado con `VET_ROLES`** en la lectura: clínica y hospital podían
  escribir el carnet pero no leerlo. Verificado con TestClient + SQLite: **4/4** (dueño 200, extraño 403, los cuatro
  roles clínicos 200, servicio interno 200). **Pendiente de desplegar** (sin migración; junto a F11/F12).
- **2026-10-08** — **Despliegue**: push (`802734c..b951380`, F11+F12+F22) → `deploy-oracle.yml` ✅, **migración de core
  `f12a8b3c4d5e` aplicada en la VM** (`scripts/vm.sh migrate core` → head) y **OTA en `production`** (update group
  `a16937de-d804-4085-9275-c429d26a4b86`, commit `b951380`). `scripts/vm.sh status`: **17/17 activos en http 200**.
  Ya en producción: correo sin mayúsculas, mensajes en español, contraseña mínima, `created_at`, recuperación con
  código de 6 dígitos (y su pantalla única) y la ficha de mascota solo para dueño/equipo clínico/admin.
- **2026-10-08** — **F24 `link` en los emisores que faltaban** (backend). Los 5 emisores que insertan notificaciones
  con SQL crudo (directorio, laboratorio, aseguradoras, funeraria y transportistas) ahora guardan también el **`link`**
  interno de la app: citas → `/mi-clinica/agenda` (clínica) o `/directorio/citas` (cliente), videoconsultas →
  `/mi-clinica/consultas-video`, cirugías y recetas → la ficha de la mascota (`/mascotas/{id}`), resultados de
  laboratorio → la mascota o `/mi-clinica/laboratorio`, y cada emisor a su pantalla (reclamos, mis-pólizas, gestión
  funeraria, solicitudes/mis-viajes). Si el rol no puede abrir el link, la app cae al mapeo por tipo+rol de siempre
  (`resolveNotificationRoute` lo valida). Verificado: los 8 archivos compilan y `notify_user` con link inserta bien en
  una tabla `notifications` de prueba. **Pendiente de desplegar** (sin migración; la `d3e9a7b4c215` ya está aplicada).
- **2026-10-08** — **F27 DatePicker con el sistema de diseño** (solo app). `DatePicker` deja `constants/Colors` y el
  `ThemeContext` directo por el `useTheme()` estándar, y sus estilos pasan a los tokens (`spacing`, `radius` y el
  token nuevo **`type.labelSentence`** para etiquetas de campo en tipo oración — antes cada uno armaba su estilo).
  La receta (`carnet/receta/[id]`) muestra sus fechas con locale **`es-MX`** (compartir y ficha). Verificado en web:
  el formulario de vacuna renderiza con la etiqueta «Fecha de aplicación» en tipo oración y la fecha en es-MX.
  `npm run check` 0 errores (72 avisos = línea base).
- **2026-10-08** — **Despliegue**: push (`b951380..126b982`, F24+F27) → `deploy-oracle.yml` ✅, `vm.sh status`
  **17/17 en http 200** y **OTA en `production`** (update group `f60b79a3-41bc-4332-9fe9-0b7297ab6555`). Sin migraciones.
  Ya en producción: las notificaciones de los 5 servicios llevan a su pantalla con `link` y el `DatePicker` usa el
  sistema de diseño. **Cola restante: F25 (búsqueda), F26 (pasaporte), F19 (pedidos) y F14 (recordatorios).**
- **2026-10-08** — **Revisión del trabajo de MIMO** (`REVIEW_MIMO.md`, F9–F27): todo ✅. Atendido: `react-native-qrcode-svg`
  fijado en `6.3.26` (es JS sobre `react-native-svg`, ya instalado → **OTA-safe**, no cuenta para U10); duplicados por
  mayúsculas de F11 ya estaban verificados (0). Los hex de `(auth)/*` son deuda previa de pantallas enteras con
  `Colors` → se resuelven completas en U3, no a parches.
- **2026-10-08** — **F14 Recordatorios y refuerzos** (carnet + app). **Carnet**: emisor `app/jobs/reminders.py`, tarea
  asyncio que arranca con el servicio (`startup`) y cada 5 min (`REMINDERS_INTERVAL_SECONDS`; se apaga con
  `REMINDERS_JOB_ENABLED=false`) inserta en `notifications`: (1) **dosis de medicamento** que ya tocan y no se marcaron
  como tomadas (tipo `recetas`; las de más de 6 h se silencian para no inundar la bandeja) y (2) **refuerzos de vacuna**
  que vencen en ≤ 7 días o vencieron hace < 30 (tipo `vacunas`, fecha en hora de México). Un aviso por dosis/vacuna;
  si se cambia la fecha del refuerzo, `update_vaccine` limpia la marca y se vuelve a avisar. Todo en una transacción con
  `pg_try_advisory_xact_lock`. `link` → `/mascotas/{id}?tab=salud`. **Migración aditiva `c14a7e2b9d01`**
  (`medication_reminders.notified_at`, `vaccines.booster_notified_at`; `sent` sigue siendo «el dueño la marcó como
  tomada»). **App**: tipo `vacunas` en la bandeja (ícono jeringa) y en `resolveNotificationRoute`; `nueva-vacuna`
  vuelve a prometer el aviso, ahora con emisor real («Te avisaremos en tus notificaciones una semana antes»).
  Verificado: SQLite con 5 pasadas (aviso único, sin duplicados, dosis viejas silenciadas, refuerzo reprogramado se
  reavisa, editar sin cambiar fecha no reavisa) y arranque del servicio con el job vivo aunque la BD falle. Push
  todavía no (las notificaciones push van con `expo-notifications` en U10).
- **2026-10-08** — **F19 Tienda backend + app** (ecommerce, sin migración). **Backend**: los pedidos pendientes vencidos
  (TTL 40 min) se liberan —cancelados y con el stock devuelto— antes de **toda** lectura de `/orders/*` y antes de crear
  el checkout de Stripe (antes solo al crear otro pedido); el webhook, al marcar el pedido pagado, **avisa al comprador**
  («¡Pago recibido!» → `/tienda/pedido/{id}`) y **a cada vendedor** con sus piezas (→ `/tienda/vendedor/ordenes`),
  tipo `store`, sin romper el webhook si la bandeja falla; la liberación usa `FOR UPDATE SKIP LOCKED` y el webhook
  bloquea el pedido (`get_order_for_update`), para que el stock no se devuelva dos veces ni compitan pago y vencimiento
  (hallazgo del `code-reviewer`); `/orders/me` ordena por fecha + id y la app quita duplicados entre páginas; nuevo `GET /products/{id}/review-eligibility`
  (`can_review` + `reason`); `/orders/me` paginado con tope de 50. Mensajes de pedidos en español. **App**: tipos de
  ecommerce migrados a `src/types/ecommerce.ts` (el service los reexporta); `usePurchases` con `useInfiniteQuery`
  (20 por página, misma key `['my-orders']`) y «Mis compras» con scroll infinito y `SkeletonList` en vez de
  `LoadingOverlay`; la ficha del producto muestra el formulario de reseña **solo** si `can_review` (antes lo veía todo
  el mundo y el backend lo rechazaba), textos honestos y fechas `es-MX`; la notificación `store` lleva al vendedor a sus
  órdenes. Verificado: TestClient+SQLite (pedido vencido → cancelado y stock devuelto al leer, páginas 20+6, tope 50,
  `can_review` en sus 3 casos, avisos a comprador y 2 vendedores, bandeja caída no truena), tsc + ESLint limpios y
  web: Mis compras pide `?skip=0&limit=20`.
- **2026-10-08** — **F25 Búsqueda** (core + app, sin migración). **Core**: `/search/` suma 3 dominios públicos (aditivo,
  hasta 5 por dominio): `adoptions` (abiertas y aprobadas), `lost_pets` (reportes activos, **sin teléfono ni correo**)
  y `services` (paseadores y cuidadores activos, por nombre o zona); consultas validadas contra el esquema real. **App**:
  6 pestañas como `FilterChip` desplazables (Mis mascotas, Adopciones, Perdidas, Clínicas, Paseos y cuidado,
  Productos), cada resultado con su ficha, «Ver todos» al pie de la lista y como acción del vacío hacia el listado del
  módulo; pantalla pasada a tokens (`spacing`/`radius`/`type`/`layout`), `EmptyState` para inicio y vacío, el error
  queda en el banner de `ScreenContainer`, botón de borrar de 44 px. Token nuevo **`onPrimary`** en la paleta (texto e
  íconos sobre `primary`). Los tipos nuevos son opcionales para tolerar el backend anterior. Verificado: tsc + ESLint
  limpios, web 375×812 claro/oscuro (inicio, vacío con «Ver todas mis mascotas»).
- **2026-10-08** — **F26 Pasaporte público** (mascotas + app, sin migración). El mismo enlace del QR
  (`/pets/passport/view/{token}`) responde con una **página HTML legible** si lo abre un navegador (`Accept: text/html`)
  y con JSON en otro caso (o con `?format=json`): foto, especie/raza, edad en años y meses, sexo, tamaño, peso,
  microchip, vacunas con estado del refuerzo (vigente/vencido) y seguro vigente, con la paleta Midnight & Gold
  (`app/core/passport_page.py`). **Número de póliza enmascarado** a los últimos 4 (también en el JSON). Enlace vencido
  o mascota inexistente → página amable en vez de JSON de error. Todo el texto de la base se escapa y la foto solo se
  pinta si es `https://`. App: la tarjeta del QR explica qué verá quien lo escanee y que el enlace dura 24 h.
  Verificado: TestClient+SQLite (póliza `•••• 3456`, XSS escapado, `javascript:` descartado, JSON intacto, 403/404 en
  HTML y JSON) y la página a 375 px.
- **2026-10-08** — **Despliegue F14+F19+F25+F26**: push (`0d9f61d..f7522d3`) → `deploy-oracle.yml` ✅, **migración de
  carnet `c14a7e2b9d01` aplicada** (head), `vm.sh status` **17/17 en http 200** y **OTA en `production`** (runtime
  1.0.0, update group `3704404d-82a9-447c-8dee-aef559b06db3`). La primera pasada del emisor de recordatorios falló
  (corrió entre el deploy y la migración) sin afectar al resto del carnet, como se diseñó; las siguientes ya leen las
  columnas nuevas. **Fase 4 completa en los módulos P1.** Siguiente: Bloque B (auditoría P2/P3) o Fase 5 (U1 Tema).
