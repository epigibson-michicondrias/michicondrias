# Auditoría — App móvil

Hallazgos detallados por módulo (Fase 1) y resultados de las herramientas. El estado resumido vive en
[`PROGRESO_MOBILE.md`](PROGRESO_MOBILE.md); los criterios en [`CLAUDE.md`](CLAUDE.md) §4.

Clasificación de cada pieza: **funciona** · **rota/incompleta** · **muerta**.
Prioridad de hallazgos: **P0** roto/bloquea · **P1** confunde o se ve mal · **P2** pulido.

---

## Resultados de herramientas (2026-10-07)

Regenerar con `cd mobile && npm run deadcode`, `npx eslint .` y `npm run doctor`.

### knip — código muerto
**Tras la Fase 2 (2026-10-07):** 23 archivos · 6 dependencias · 65 exports · 65 tipos exportados sin uso.
Lo que queda es intencional o espera la auditoría de su módulo:
- `src/types/*` (decisión: fuente única de tipos; los servicios migran a ellos al tocar cada módulo, tarea L7).
- `src/components/FormField.tsx` y `src/utils/validators.ts`: se adoptan en la Fase 5 (formularios premium).
- Hooks de módulos P2/P3 sin importador (tarea L9): `admin/useAdminOrders`, `clinica/useAlerts`, `clinica/usePatients`,
  `ecommerce/useSubcategories`, `perdidas/useReportActions`, `perdidas/useReportForm`.
- Dependencias sin uso (`@expo/cli`, `@teovilla/react-native-web-maps`, `axios`, `expo-symbols`,
  `react-native-get-location`): varias nativas → APK de la Fase 5 (~~`expo-web-browser`~~ ✅ en uso desde F20).
- Exports: funciones de servicios de módulos no auditados y constantes `*_OPTIONS`/`*_DEFAULTS` de `src/types/`.

### ESLint (`eslint-config-expo`)
**Tras la Fase 2: 0 errores · 83 advertencias** (`npm run check` pasa). Línea base inicial: 12 errores · 219 advertencias. Por regla:

| Regla | Cantidad |
|---|---|
| `@typescript-eslint/no-unused-vars` | 193 |
| `react/no-unescaped-entities` | 11 |
| `import/no-duplicates` | 10 |
| `no-unused-expressions` | 6 |
| `react-hooks/exhaustive-deps` | 3 |
| `import/first` | 2 |
| `react-hooks/rules-of-hooks` | 1 ⚠️ (puede causar bugs reales; revisar en Fase 1) |
| otras | 6 |

### expo-doctor
18/20 checks OK. Fallan:
- **Duplicado nativo**: `expo-location@15.1.1` dentro de `@teovilla/react-native-web-maps` (dependencia sin uso según
  knip) → quitar esa dependencia lo resuelve.
- **13 paquetes con parche atrasado** dentro de SDK 55 (`expo` 55.0.26 → ~55.0.31, `react-native` 0.83.6 → 0.83.10,
  `expo-router`, `expo-updates`, …). Son nativos → actualizar con `npx expo install --check` junto con el APK de la
  Fase 5.

---

## Módulos

Plantilla (la llena la skill `auditar-modulo`):

```
## <Módulo> — auditado AAAA-MM-DD
Flujo(s): paso → paso → paso

| Pieza | Tipo | Estado | Hallazgo |
|---|---|---|---|

Redundancias: …
Propuesta de rediseño (requiere visto bueno): …
Backend: …
Arreglos: - [ ] P0 … - [ ] P1 … - [ ] P2 …
```

### Índice
Transversales · Pestañas · Auth · Perfil · Mascotas · Carnet · Tienda cliente · Notificaciones/Búsqueda/Ayuda ·
Botones rotos o redundantes (consolidado). La propuesta de navegación antes/después está en `PROGRESO_MOBILE.md`.

---

## Transversales — auditado 2026-10-07
Problemas que no son de un módulo y afectan a toda la app.

| Tema | Hallazgo | Prioridad |
|---|---|---|
| ✅ 2026-10-07 Caché GET de 30 s (`src/lib/api.ts:84-90`) — eliminada | Se pone encima de React Query y deja sin efecto el polling (pedido pendiente cada 5 s), el pull-to-refresh y las relecturas después de mutar (por ejemplo, el pedido pagado tarda hasta 30 s en verse). Se pide una opción `noCache` o quitar la caché manual y dejarle el trabajo a React Query | P0 |
| ✅ 2026-10-07 Sesión (`AuthContext.tsx:30-32,50-58`, `api.ts:124-130`) — resuelto (ver Bitácora) | (1) Sin red al arrancar, la app borra el token. (2) Un 401 borra el token, pero `user` sigue lleno: la sesión queda zombi. (3) `signOut` no limpia la caché de React Query, el carrito, la dirección ni `user_role`: el siguiente usuario ve datos del anterior. (4) El token no se renueva (`useSessionSync.ts:48`) y caduca a los 7 días | P0 |
| Tema: dos formas de leerlo | `useTheme()` (`src/hooks/useTheme`) convive con `constants/Colors` + `ThemeContext` directo (20 archivos: auth, `two`, `partner`, `paleta`, `(tabs)/_layout`) | P2 |
| Tema: paleta | En *Midnight & Gold*, `warning` es igual a `accent` (dorado) en los dos modos, así que un aviso no se distingue de un acento de marca. En oscuro compiten 3 colores de marca (dorado, azul `primary`, violeta `secondary`). Los colores de dominio (`#8b5cf6`, `#ec4899`, `#0ea5e9`… en `useExplore`, `useHome`, `roleTools`) son el arcoíris de Tailwind y chocan con la paleta. Los tokens `accents` y `motion` de `design.ts` no se usan. Las 5 paletas extra de `palettes.ts` no se pueden elegir (`ACTIVE_PALETTE` es una constante) | P1 |
| Tema: degradados fijos | Inicio, Explorar, Herramientas, Perfil y Tienda pintan el hero con `#1c2f6b → #101c3d` en los dos modos y fuerzan `StatusBar light-content`. En claro, la pantalla arranca azul marino y se funde con el crema: falta un token `heroGradient` por modo. Las pantallas de auth usan cada una un degradado distinto (celeste, verde, ámbar) que no sale de la paleta | P1 |
| Tema: persistencia | El modo se guarda en SecureStore (en web falla y queda atrapado en el catch) y parpadea al arrancar porque empieza en `system` | P2 |
| Notificaciones | No existen push (`expo-notifications` no está instalado). El modelo no tiene `link`. El backend emite tipos (`citas`, `seguros`, …) que la app no mapea | P0 (ver módulo) |
| ESLint `rules-of-hooks` | `src/hooks/rides/useRideTracking.ts:50` llama `useMutation` dentro de una función `make` (posible bug real; es del módulo Transportistas, P2) | P1 |
| ✅ 2026-10-07 Errores tras sesión vencida — resuelto (F23) | Si el token vence durante una mutación, el aviso «Tu sesión expiró» queda tapado por el `showAlert` de error de la pantalla (AppAlert tiene un solo espacio). Que los `onError` ignoren `ApiError.sessionExpired` | P2 |
| Tráfico de polling | Sin la caché manual, los intervalos de 15–30 s ya consultan la red de verdad (`useMyClinic`, `useReportDetail`, `usePatients`, `useMyApplications`) y `usePetDetail` hace refetch en cada foco. Es lo correcto, pero hay que vigilar la carga del backend | P2 |
| Redirección de arranque | `initialRouteName '(tabs)'` + `useEffect` de redirección: sin sesión se ven las pestañas un instante antes del login | P2 |

---

## Pestañas `(tabs)/` — auditado 2026-10-07
Flujo: arranque → Inicio · Explorar · Michi-Shop · Perfil (`two`) · Herramientas/Admin (`menu`, solo pro/admin).
`tienda-tab` y `two` se auditan con Tienda y Perfil.

| Pieza | Tipo | Estado | Hallazgo |
|---|---|---|---|
| app/(tabs)/_layout.tsx | layout | funciona | 5 pestañas y la 5.ª oculta para el consumidor (bien). Usa `Colors` en vez de `useTheme`. Altura y padding fijos por plataforma en lugar de safe area. 1 hex. El ícono de la Tienda no tiene badge del carrito |
| app/(tabs)/index.tsx (Inicio) | pantalla | funciona, con piezas falsas | 645 líneas, 23 hex. **El punto rojo de la campana se ve siempre** (:75), no está ligado a nada. La carga de mascotas y citas es un ícono `Activity` en lugar de un Skeleton (:206, :303). Sin pull-to-refresh. La tira de stats mezcla un dato («Mascotas», no tocable), un enlace («Citas») y un botón disfrazado de stat («Ver / Tienda»). **La tienda tiene 3 accesos en Inicio**: el stat (:121), la acción rápida «Michi-Shop» (`useHome.ts:36`) y el banner (:365), además de la pestaña. La lupa (:66) repite la barra de Explorar. Las cards de próximas citas llevan todas a la lista general (:337) y no a la cita. Las imágenes de placeholder salen de Unsplash por URL (:18-27), lo que obliga a tener red y no es una fuente confiable. Pinta el estado vacío de citas a mano en vez de usar `EmptyState`. Tiene `paddingBottom: 100` fijo |
| app/(tabs)/explorar.tsx | pantalla | funciona, con redundancias | 382 líneas, 12 hex. 20 tarjetas: **«Diagnóstico IA» aparece 2 veces** (tarjeta `useExplore.ts:62` y banner :174). «Clínicas» y «Veterinarios» van al mismo `/directorio`, porque `?type=clinic` no se lee en ningún lado. «Michi-Shop» y «Mis Compras» repiten la pestaña Tienda. «Carnet Salud» es dato personal, no descubrimiento. «Petfriendly» y «Establecimientos», y también «Estilistas» y el módulo grooming, parecen la misma cosa (pendiente de la auditoría P2). La barra de búsqueda es un `TextInput` falso que no se puede editar, solo navega. Las tarjetas no tienen etiqueta accesible. Usa `Dimensions.get` estático |
| app/(tabs)/menu.tsx (Herramientas) | pantalla | funciona, con redundancias | 268 líneas, 16 hex. El banner del rol repite la primera herramienta de la lista (por ejemplo, `/mi-clinica` aparece 2 veces). **Duplica Perfil**: sección «Cuenta» (Ser profesional, Verificación, 2FA, Notificaciones), «Soporte» (Ayuda, Apariencia → `perfil/paleta` falsa) y Cerrar sesión. La versión «v2.0.0» está escrita a mano. Estilos `menuCard`/`sectionHeader` muertos |
| src/hooks/home/useHome.ts | hook | funciona, con código muerto | `QUICK_ACTIONS` define 14 roles y **solo se usa `consumidor`** (:174): el resto duplica `roleTools.ts`. `STATUS_COLORS` en hex. Devuelve `router`. `useSessionSync` solo corre si Inicio está montada |
| src/hooks/home/useExplore.ts | hook | funciona | El catálogo de Explorar está escrito a mano, sin `roleTools` ni filtro por rol, y con colores hex |
| src/hooks/home/useMenu.ts | hook | funciona | `BANNERS` duplica a `ROLE_TOOLS` (otra lista de rutas por rol). Las secciones «Cuenta» y «Soporte» sobran si Perfil queda como único lugar |

Redundancias: tienda ×5 (pestaña + 3 en Inicio + Explorar), búsqueda ×2 (Inicio y Explorar), Diagnóstico IA ×2 en
Explorar, cuenta y soporte en Herramientas y en Perfil, banner de Herramientas y primera herramienta, `QUICK_ACTIONS`/
`BANNERS` frente a `ROLE_TOOLS`.
Propuesta de rediseño: ver «Propuesta de navegación» en `PROGRESO_MOBILE.md`.
Arreglos:
- [x] P0 Punto de la campana falso → badge real de no leídas (`(tabs)/index.tsx:75`)
- [ ] P1 Quitar los accesos duplicados a la tienda en Inicio (stat, acción rápida, banner) y en Explorar (Michi-Shop, Mis Compras)
- [ ] P1 Explorar: una sola entrada a Diagnóstico IA; fusionar Clínicas y Veterinarios (o implementar `?type=`); sacar Carnet
- [ ] P1 Herramientas: solo herramientas del rol; quitar Cuenta, Soporte y Cerrar sesión; banner o lista, no los dos
- [ ] P2 Borrar `QUICK_ACTIONS` de roles y `BANNERS`, y derivarlos de `ROLE_TOOLS`
- [ ] P2 Inicio: Skeleton en mascotas y citas, `EmptyState` en citas, pull-to-refresh, cada cita abre su detalle, placeholder local en vez de Unsplash
- [ ] P2 Hero con un token de degradado por tema; hex → tokens (index 23, menu 16, explorar 12); versión desde `expo-constants`

---

## Auth — auditado 2026-10-07
Flujos:
- Login: `_layout` → `/login` → POST `login/access-token` → [2FA: OTP → `/login/verify-2fa`] → `signIn` → `/users/me` → `/(tabs)`.
- Registro: `/register` → POST `/users/register` → alerta «Ir a Login» → hay que volver a escribir las credenciales.
- Recuperación: `/forgot-password` → correo con `michicondrias://reset-password?token=<JWT>` → `/reset-password` → `/login`.

| Pieza | Tipo | Estado | Hallazgo |
|---|---|---|---|
| app/login.tsx | pantalla | rota/incompleta | **En web, el login truena** después de guardar el token (`setUserRole` sin try/catch, `lib/auth.ts:45,75`). El email no pasa por `trim` ni minúsculas (:73) y el backend lo compara distinguiendo mayúsculas. Los errores del backend salen en inglés (:85). 504 líneas, 37 hex y 28 rgba, 0 tokens. Inputs, botón y tarjeta hechos a mano. Llama a `lib/auth` sin hook. Le faltan `autoComplete` y `returnKeyType` |
| app/register.tsx | pantalla | funciona | ~~No inicia sesión al terminar (:48-54)~~ ✅ login automático (F10) y ~~no menciona la cuenta profesional~~ ✅ línea hacia Perfil (F10). El «check» de términos es decorativo (:178). «Términos» y «Privacidad» no llevan a nada si las URL no están configuradas (por defecto vacías). Valida con alertas. 27 hex |
| app/forgot-password.tsx | pantalla | funciona | Email sin `trim` (:31). «Enviar enlace» no muestra spinner. En el estado de éxito hay 3 salidas, 2 de ellas iguales (:172 y :197). Jerga «token». 26 hex |
| app/reset-password.tsx | pantalla | rota/incompleta | Sin el deep link pide «pegar el token», pero **el correo nunca muestra el token** (solo un JWT dentro de la URL). La web alterna `michicondrias.com/reset-password` no existe (`frontend/` vacío). El ojo mide 18 px. Con una sesión abierta, `_layout` saca al usuario de la pantalla. 35 hex |
| app/_layout.tsx | layout | funciona | Lista de pantallas de auth escrita a mano (:46). Destello de las pestañas antes de la redirección. `inTabsGroup` sin uso. Advertencia `exhaustive-deps` |
| src/contexts/AuthContext.tsx | contexto | rota/incompleta | Ver Transversales (sesión). ~~`signIn(token)` ignora su parámetro~~ ✅ `signIn(token)` guarda el token y `refreshSession(token)` es el helper común (F9) |
| ~~src/lib/auth.ts~~ | servicio | ✅ resuelto 2026-10-07 (F9) | Arma la URL con `fetch` directo en vez de `API_URLS`. **Borrado**: hoy es `src/services/auth.ts` sobre `apiFetch`/`API_URLS` + `src/lib/sessionStorage.ts` (copia local del usuario). Código muerto ya eliminado en Fase 2 |
| src/hooks/home/useSessionSync.ts | hook | rota/incompleta | Solo guarda el token nuevo si cambió el rol (:48): la sesión no se renueva nunca |
| src/services/auth2fa.ts | servicio | funciona / parte muerta | `upgradeToPartner()` no manda `role_name` → 422. Solo lo usa `use2FA.upgradeMutation`, que está muerto |
| backend core login.py / users.py | backend | funciona | ~~El email distingue mayúsculas (login.py:39,135; crud_user.py:10)~~ ✅ sin distinguir, con duplicados revisados antes (F11) · ~~Mensajes en inglés~~ ✅ en español (F11) · ~~El registro no exige longitud mínima de contraseña y acepta `is_active` del cliente~~ ✅ mínimo 8 y `is_active` forzado (F11). El token de reset se puede reutilizar durante 30 min y no invalida las sesiones abiertas. 2FA sin códigos de respaldo |

Redundancias: las 4 pantallas copian el mismo esqueleto (unas 1300 líneas) con 4 acentos distintos. ~~«Guardar token + rol +
recargar» está copiado en `useSessionSync` y `perfil/partner`~~ ✅ unificado en `AuthContext.refreshSession` (F9). Auth está repartido entre ~~`lib/auth.ts`~~ (F9) y
`services/auth2fa.ts`. Cerrar sesión aparece en 3 lugares.
Propuesta de rediseño (requiere visto bueno):
1. Grupo `(auth)` con `AuthShell` común. Las URL no cambian; solo se tocan `_layout.tsx:46,62-65`.
2. Registro con login automático y una línea hacia la cuenta profesional.
3. Recuperación con **código de 6 dígitos** por correo en vez del JWT en un enlace (endpoint nuevo en core).
4. Sesión centralizada (`onUnauthorized` → AuthContext) y renovación deslizante.

Backend: ~~email sin distinguir mayúsculas (revisar antes si hay duplicados), mensajes en español, contraseña mínima~~
✅ (F11), recuperación por código o token de un solo uso (`password_changed_at`, migración aditiva) y códigos de respaldo de 2FA.
Arreglos:
- [x] P0 Sesión: no borrar el token por error de red; 401 → cerrar sesión de verdad; `signOut` completo; renovación (ver Transversales)
- [x] P0 Login en web roto (`lib/auth.ts:44-46,75,101`): se eliminó `user_role`
- [x] P1 Email normalizado en el cliente (login.tsx:73, forgot-password.tsx:31) y en el backend — ✅ `trim` en el cliente (F3) y minúsculas en cliente y backend con duplicados revisados (F11)
- [ ] P1 Reset sin deep link inutilizable (reset-password.tsx:111-130) → propuesta 3
- [x] P1 ~~Mensajes del backend en inglés (login.tsx:85)~~ ✅ en español (F11); ~~registro sin auto-login (register.tsx:48-54)~~ ✅ (F10)
- [x] P1 Capas: `src/services/auth.ts` + `src/hooks/auth/*`; quitar `apiFetch`/SecureStore de `perfil/partner.tsx:70-75` (F9: `useLogin`, `useRegister`, `usePasswordReset`, `usePartnerUpgrade`)
- [ ] P2 `AuthShell` + FormField/Button/KeyboardScreen, tokens, validación inline, autoComplete, objetivos ≥ 44 px, spinner en forgot
- [ ] P2 Destello de pestañas al arrancar; imports sin uso; URL de Términos y Privacidad

---

## Perfil — auditado 2026-10-07
Flujos: pestaña Perfil (`two`) → «Editar perfil» → `perfil/index` (formulario en línea + otro menú) → 2FA / Facturación /
Eliminar cuenta / Paleta. Verificación: `perfil/verificacion` **o** `perfil/kyc` (duplicadas). Alta pro: `perfil/partner`.

| Pieza | Tipo | Estado | Hallazgo |
|---|---|---|---|
| app/(tabs)/two.tsx | pantalla | funciona (menú) | 412 líneas, 18 hex. No usa ListRow, SectionHeader ni Card. **Muestra la inicial y no la foto real** (:44-50). Dos lápices que van al mismo sitio (:63 y :81). Bug de `isLast` en Privacidad (:176). Versión escrita a mano. Aquí vive el único selector real de tema (:112-137) |
| app/perfil/index.tsx | pantalla | funciona, con piezas rotas | 656 líneas. Formulario sin FormField ni validación inline. Carga con texto en vez de Skeleton. **«Configuración» → `/menu`** (:358), una pestaña oculta para el consumidor. **«Paleta de colores» → pantalla falsa** (:374). «Verificación (KYC)» → `perfil/kyc` duplicada (:299). Mis Mascotas, Compras y Cerrar sesión repiten la pestaña. 2FA, Facturación y Eliminar cuenta **solo se alcanzan desde aquí** |
| app/perfil/verificacion.tsx | pantalla | funciona | ~~Llama al servicio y hace `fetch` a S3 desde la pantalla~~ ✅ usa `useKYC` (F13). ~~Solo galería y sin pedir permiso~~ ✅ cámara y galería (F13). ~~No invalida `user-profile`~~ ✅ `reloadUser` al enviar (F13). ~~Si el estado es VERIFIED no ofrece «Activar cuenta pro»~~ ✅ CTA (F13). Encabezado con `paddingTop: 60` fijo. 8 hex |
| app/perfil/kyc.tsx | pantalla | duplicada / rota | Repite verificacion. **No refresca el estado al enviar** y deja reenviar con PENDING o VERIFIED. El texto dice que es solo para «patrocinador o establecimiento». 10 hex |
| app/perfil/seguridad-2fa.tsx | pantalla | funciona | ~~**No hay QR**: muestra el URI `otpauth://` como texto, no hay «Abrir en app autenticadora» ni botón de copiar. No invalida `user-profile`~~ ✅ QR en SVG + ambas acciones + invalidación (F13). 10 hex |
| app/perfil/partner.tsx | pantalla | funciona | ~~`apiFetch`, `setToken` y SecureStore en la pantalla, sin hook~~ ✅ `usePartnerUpgrade` (F9). ~~Avisa que falta el KYC **después** de elegir el rol~~ ✅ tarjeta de estado del KYC antes de elegir (F13). 15 roles con emoji escritos a mano |
| app/perfil/eliminar-cuenta.tsx | pantalla | funciona | La más cercana al estándar. Hace `useQuery` en la pantalla. `router.replace('/login')` es redundante |
| app/perfil/paleta.tsx | pantalla | **rota (falsa)** | «Aplicar paleta» no hace nada: muestra al usuario «edita constants/palettes.ts» (:20-36) |
| src/hooks/perfil/useProfile.ts | hook | funciona | `getRoleLabel` duplica `getRoleLabelFor` y muestra «Usuario» para 6 roles. `getRoleIcon` está muerto |
| src/hooks/perfil/useKYC.ts | hook | funciona | ~~Solo lo usa kyc.tsx. No hace `reloadUser` ni invalida~~ ✅ lo usa `verificacion` con cámara/galería y `reloadUser` al enviar (F13) |
| src/hooks/perfil/use2FA.ts | hook | funciona | ~~`handleUpgradeToPartner` está muerto y roto~~ ✅ borrado en Fase 2. F13 suma `openAuthenticator`, `copySecret` y la invalidación de `user-profile`. El disable manda `secretKey: code` como parche |
| services profile / avatar / kyc | servicio | funciona | Coinciden con `users.py` |
| backend core users.py | backend | funciona | `read_user_me` no devuelve `created_at`, así que «Miembro desde» nunca aparece. El portal de facturación crea un cliente de Stripe aunque no haya suscripción y vuelve a la web |

Redundancias: 2 pantallas de perfil, 2 de KYC. Ser profesional/Verificación ×3 (Perfil, Herramientas, Inicio). Cerrar
sesión ×3. Notificaciones ×3. 2FA ×2. Ayuda ×2. Apariencia ×2 (una falsa). Lápiz ×2.
Propuesta de rediseño (requiere visto bueno): **una sola pantalla de Perfil** (la pestaña) con: cabecera (foto real, rol,
insignia de verificación) → tarjeta de estado del alta pro (solo si aplica) → *Mi actividad* (mascotas, citas, compras,
adopciones) → *Cuenta* (datos personales, verificación, seguridad, facturación si aplica, ser profesional) →
*Preferencias* (tema claro/oscuro/sistema) → *Soporte y legal* (ayuda, privacidad/términos) → pie (cerrar sesión,
eliminar cuenta, versión). `perfil/index` → `perfil/editar` (solo el formulario). Se eliminan `perfil/kyc` y
`perfil/paleta`.
Backend: `created_at` en `/users/me`; `secret` opcional al desactivar 2FA; portal de facturación sin crear cliente y con
deep link de vuelta.
Arreglos:
- [ ] P0 Pantalla de paleta falsa y sus 2 accesos (`perfil/paleta.tsx`, `perfil/index.tsx:374`, `useMenu.ts:115`)
- [ ] P0 `perfil/kyc`: no refresca el estado y deja reenviar → eliminarla y apuntar a verificacion (`perfil/index.tsx:299`)
- [x] P1 2FA: QR, «Abrir en app autenticadora», copiar clave e invalidar `user-profile` (F13)
- [ ] P1 «Configuración» → `/menu` (`perfil/index.tsx:358`); 2FA, Facturación y Eliminar escondidos en Editar
- [ ] P1 Etiqueta de rol «Usuario» (`useProfile.ts:128-143`) → `getRoleLabelFor`; foto real en la pestaña
- [x] P1 partner: estado del KYC antes de elegir; verificacion: CTA «Activar cuenta pro» cuando esté VERIFIED (F13)
- [ ] P2 Capas (~~partner~~ ✅ F9, ~~verificacion~~ ✅ F13, eliminar-cuenta), código muerto, `perfil/index` 656 líneas → `src/features/perfil/`, hex

---

## Mascotas — auditado 2026-10-07
Flujo: Inicio (carrusel) / Perfil → `/mascotas` → `/mascotas/[id]` → `/carnet/[id]` · `/mascotas/editar/[id]` · alta en
`/mascotas/nuevo`. Explorar → `/mascotas/diagnostico-ia`. Deep link de Stripe: `michicondrias://mascotas/{id}?subscription=`.

| Pieza | Tipo | Estado | Hallazgo |
|---|---|---|---|
| app/mascotas/index.tsx | pantalla | funciona | `DataList` con skeleton, vacío y refresh. El pie dice «Ver carnet y detalles» pero abre la ficha. Emojis de placeholder. 2 hex |
| app/mascotas/[id].tsx | pantalla | funciona | ~~El engrane de editar se ve en mascotas ajenas~~ ✅ (F6) · ~~insignia «verificado» falsa~~ ✅ (F6) · ~~«Vacunas al día» del booleano manual (:80)~~ ✅ calculado del carnet (F16) · ~~«Notas médicas» muestra la descripción (:154)~~ ✅ (F6) · ~~Michi-Tracker activo sin salida (:102-118)~~ ✅ abre facturación (F16) · ~~`handleShare` sin botón~~ ✅ «Compartir carnet» con QR, solo el dueño (F16). `LoadingOverlay` a pantalla completa. Sin pull-to-refresh |
| app/mascotas/nuevo.tsx · editar/[id].tsx | pantalla | funciona | Comparten ~95 % del JSX. Sin FormField ni KeyboardScreen. Validación por alerta. Raza y descripción obligatorias en la app aunque el backend no las pide |
| app/mascotas/diagnostico-ia.tsx | pantalla | funciona | La IA es real (Claude con reglas de alarma como piso). 466 líneas. Usa `Picker` en vez de `FormSelect`. ~~El triage no manda mascota, especie ni peso~~ ✅ selector de mascota y `pet_id` (F17). ~~El vacío sin mascotas no tiene acción~~ ✅ «Agregar mascota» (F17). ~~Si falta el peso, la alerta no lleva a editar~~ ✅ CTA «Editar mascota» (F17). 9 hex y 4 `ActivityIndicator` |
| hooks mascotas | hook | funciona | Query keys duplicadas para la misma mascota (`pet` y `pet-profile`; `user-pets` y `my-pets-carnet`). Mutaciones con `useState` |
| backend pets.py | backend | funciona / riesgo | **El pasaporte compartido nunca trae vacunas**: llama a carnet sin token (:331). ~~`share_url` apunta a JSON~~ ✅ página legible y póliza enmascarada (F26). ~~`GET /pets/{id}` deja a cualquier usuario con sesión leer cualquier mascota, microchip incluido~~ ✅ solo dueño, equipo clínico, admin o servicio interno (F22). `diet-plan` no filtra `is_active` |

Redundancias: la **ficha de mascota y el carnet son 2 pantallas de detalle** de la misma mascota con el mismo hero. La
lista de mascotas y la de carnets son la misma lista. Diagnóstico IA aparece 2 veces en Explorar.
Propuesta de rediseño (requiere visto bueno): **una sola ficha `mascotas/[id]` con pestañas Resumen · Salud · Historial**
(el carnet pasa a ser Salud/Historial), «Compartir carnet» con QR en el header, modo solo lectura para quien no es el
dueño, y un `PetForm` único para alta y edición.
Backend: llamada interna con token mascotas→carnet, ~~página pública legible del pasaporte~~ ✅ (F26), ~~revisar la privacidad de
`GET /pets/{id}`~~ ✅ (F22), ~~`pet_id` opcional en symptom-check~~ ✅ (F17, con contexto de especie/peso/edad y sin datos de mascotas ajenas).
Arreglos:
- [x] P0 El pasaporte compartido nunca trae vacunas (`backend/michicondrias_mascotas/.../pets.py:331`)
- [x] P0 Editar visible en mascotas ajenas → 403 (`app/mascotas/[id].tsx:51`)
- [x] P1 ~~«Vacunas al día» manual; insignia falsa; «Notas médicas» con la descripción; Tracker sin salida; compartir sin botón~~ ✅ F6 (insignia, notas) y F16 (vacunas calculadas, Tracker → facturación, compartir carnet con QR)
- [x] P1 Diagnóstico IA: vacío sin acción y error de peso sin CTA a editar (F17: vacío con «Agregar mascota», error de peso con «Editar mascota» y selector de mascota en el triage)
- [ ] P2 `PetForm` común, Skeleton, `FormSelect`, `SegmentedTabs`, tokens, query keys unificadas

---

## Carnet — auditado 2026-10-07
Flujo: Perfil / Explorar → `/carnet` → `/carnet/[id]` (Historial · Vacunas · Recordatorios · Laboratorios) → FAB →
`nueva-consulta` / `nueva-vacuna`; Historial → `receta/[id]`. Veterinario: Mi clínica → `/carnet/[id]`.

| Pieza | Tipo | Estado | Hallazgo |
|---|---|---|---|
| app/carnet/index.tsx | pantalla | funciona (duplicada) | Repite la lista de mascotas. Hay un botón dentro de otro botón («Expediente» dentro de la tarjeta). **«Modo médico» pide teclear un UUID**. Jerga «DIGITAL ID» |
| app/carnet/[id].tsx | pantalla | funciona (gigante) | **987 líneas**, 15 hex, ~110 `fontSize` sueltos. Jerga «PATIENT_ID». Botón de IA sin texto. Vacío sin acción y sin FAB en Recordatorios y Laboratorios. Sin editar ni borrar vacunas o consultas. Fechas sin locale. Skeleton y refresh correctos |
| app/carnet/nueva-consulta.tsx | pantalla | funciona | «Guardar» es solo un ícono en el header. El dueño queda registrado como «veterinario» de la consulta |
| app/carnet/nueva-vacuna.tsx | pantalla | rota/incompleta | **No hay fecha de aplicación** (el backend pone la de hoy), así que no se pueden registrar vacunas pasadas. **Promete un aviso del refuerzo que no existe** (:102). El DatePicker no se puede limpiar. Invalidación incompleta |
| app/carnet/recordatorios.tsx | pantalla | **muerta** | Nadie navega a ella y repite la pestaña Recordatorios. Es, eso sí, la mejor maquetada (EmptyState, Badge, Skeleton) |
| app/carnet/receta/[id].tsx | pantalla | funciona | Encabezado hecho a mano. Comparte texto plano. Usa un ícono de bolsa de compras para la receta |
| hooks carnet | hook | funciona / parte muerta | `useReminders` solo lo usa la pantalla muerta. `canEdit` deja fuera a clínica y hospital. Rol calculado a mano en 4 hooks. `usePetCarnet` sin `enabled` |
| backend carnet | backend | funciona | ~~Solo GET y POST; no hay PUT ni DELETE aunque los schemas existen~~ ✅ PUT/DELETE + GET por id y recálculo de `is_vaccinated` (F15). ~~Ningún emisor de recordatorios ni refuerzos~~ ✅ emisor en `app/jobs/reminders.py` (F14). ~~Clínica y hospital pueden escribir pero no leer~~ ✅ lectura alineada con `VET_ROLES` (F22) |

Redundancias: el detalle de la mascota en 2 pantallas, los recordatorios en 2 sitios, la lista de mascotas ×2, **2
sistemas de recetas** (carnet y clínica, `services/prescriptions.ts`).
Propuesta de rediseño: fusionar con Mascotas (ver arriba), partir `carnet/[id]` en `src/features/carnet/`, borrar
`carnet/index` y `carnet/recordatorios`, quitar el «Modo médico» por UUID (el veterinario entra desde Mi clínica).
`carnet/[id]` queda como redirect (lo usan `mi-clinica/pacientes.tsx:46` y `useAgenda.ts:120`).
Backend: ~~PUT/DELETE de vacunas y consultas, `date_administered` opcional, `GET /records/{id}`, recalcular
`is_vaccinated`~~ ✅ (F7 y F15), ~~emisor de recordatorios (o quitar la promesa)~~ ✅ (F14), ~~alinear la lectura con `VET_ROLES`~~ ✅ (F22).
Arreglos:
- [x] P0 Promesa de un aviso del refuerzo que no existe (`nueva-vacuna.tsx:102`) — se quitó el texto (el emisor real es F14)
- [x] P0 Sin fecha de aplicación de la vacuna (`nueva-vacuna.tsx`, `schemas/carnet.py:64`)
- [ ] P1 `recordatorios.tsx` huérfana; «Modo médico» por UUID; botón anidado; ~~sin editar ni borrar~~ ✅ (F15: editar/eliminar vacunas y consultas con confirmación); guardar solo como ícono
- [ ] P1 Jerga PATIENT_ID / DIGITAL ID; botón de IA sin texto; invalidación tras vacuna y consulta
- [ ] P2 Partir `carnet/[id]` (987 l.), `EmptyState` con acción por pestaña, tokens, `ScreenHeader` en receta, fechas `es-MX`

---

## Tienda (cliente) — auditado 2026-10-07
Flujo: pestaña Michi-Shop → producto → «Agregar a la bolsa» → carrito → `POST /orders/` + checkout de Stripe (navegador
externo) → `/payments/return` → deep link `tienda/pago-exitoso|pago-cancelado` → `tienda/pedido/[id]` → `tienda/compras`.
**Stripe es real** (webhook firmado). El carrito y la dirección persisten en AsyncStorage **sin ligarse al usuario**.

| Pieza | Tipo | Estado | Hallazgo |
|---|---|---|---|
| app/(tabs)/tienda-tab.tsx | pantalla | funciona | 553 líneas, 15 hex. Skeleton y vacío hechos a mano y sin acción. **Sin pull-to-refresh** (el hook ya tiene `refetch`). **Categorías ×3** en la misma pantalla (ícono de filtro, tarjeta y chips). Tarjetas «Mis compras» y «Mi tienda» (del vendedor) dentro de la tienda del cliente. Estilos `promo*` muertos |
| app/tienda/index.tsx | pantalla | alias | Redirige a la pestaña: es un doble salto (lo usan useHome, useExplore y carrito) |
| app/tienda/categorias.tsx | pantalla | redundante | Repite los chips; mapa de colores duplicado |
| app/tienda/producto/[id].tsx | pantalla | funciona | 598 líneas. `LoadingOverlay`. `top: 52` fijo. **El formulario de reseña se ve para todos**, dueño incluido, y el backend responde 403/409. Las reseñas no muestran autor |
| app/tienda/carrito.tsx | pantalla | funciona | `KeyboardAvoidingView`. El vacío es un truco con `DataList` vacío. Botones de cantidad de 28 px. «Envío gratis» fijo. El precio sale del snapshot guardado |
| app/tienda/compras.tsx | pantalla | funciona | ~~`LoadingOverlay`. Sin paginación (el backend da 20).~~ ✅ F19 (Skeleton + scroll infinito). El refresh queda anulado por la caché de 30 s |
| app/tienda/pedido/[id].tsx | pantalla | funciona | Tiene un `showAlert` local con `require()` (error de lint). El polling de 5 s no sirve por la caché. «¿Necesitas ayuda?» solo muestra un correo |
| app/tienda/pago-exitoso.tsx · pago-cancelado.tsx | pantalla | funciona | **No se pueden borrar**: son destino del deep link (`checkout_urls.py:43`). Son copias una de otra. Exitoso promete que se avisará al vendedor y nadie lo avisa |
| src/contexts/CartContext.tsx | contexto | funciona | ~~`checkout` no invalida `my-orders` ni `store-products`~~ ✅ `hooks/ecommerce/useCheckout` con `useMutation` e invalidaciones (F18) · ~~Guarda el precio y el stock viejos~~ ✅ `useCartProducts` los refresca al abrir el carrito (F18) · ~~No se limpia al cerrar sesión~~ ✅ carrito por usuario (F1) · ~~Vacía la bolsa antes de pagar~~ ✅ se vacía al confirmar el pago en `PagoResultado` (F18) · ~~La lógica no usa `useMutation`~~ ✅ (F18). Hoy el contexto solo tiene estado: sin red |
| src/services/ecommerce.ts | servicio | funciona | Todos los endpoints existen. Sus tipos duplican `src/types/ecommerce.ts`, que está muerto |
| backend ecommerce | backend | funciona con huecos | ~~Los pedidos pendientes solo se liberan de forma perezosa en `create_order` (TTL 40 min). El webhook no notifica a nadie. No hay `can_review`. `/orders/me` sin paginación.~~ ✅ F19. `/products/` sin `q` |

Redundancias: entrada a la tienda ×5, «Mis compras» ×5, categorías ×3, carrito ×3 (aceptable), «Mi tienda» del vendedor
en la tienda del cliente, resultado de pago duplicado, mapa de categorías duplicado.
Propuesta de rediseño (requiere visto bueno): los chips como único filtro (se borra `/tienda/categorias`), sin
tarjetas de acciones en la pestaña, «Mis compras» con un solo hogar (Perfil), badge del carrito en la tab bar,
`PagoResultado` común conservando las 2 rutas, ~~Stripe con `expo-web-browser`~~ ✅ (F20: `utils/payments.openStripeUrl`
con `openAuthSessionAsync` en nativo).
Arreglos:
- [x] P0 Caché de 30 s contra el polling y el refresh de pedidos (ver Transversales)
- [x] P0 El carrito y la dirección pasan al siguiente usuario (`CartContext.tsx:28`, `carrito.tsx:14`) — ahora se guardan por usuario
- [ ] P1 ~~`checkout` sin invalidar; precio y stock viejos~~ ✅ (F18); reseña visible para quien no puede reseñar; texto «se avisará al vendedor»
- [ ] P1 Pedidos abandonados que no expiran (backend); ~~`showAlert` con `require()` (`pedido/[id].tsx:225`)~~ ✅ (Fase 2)
- [ ] P2 tienda-tab: refresh, EmptyState, SkeletonList, tokens. producto: Skeleton, safe area, extraer. carrito: KeyboardScreen, Button, 44 px

---

## Notificaciones, Búsqueda y Ayuda — auditado 2026-10-07
Flujos: campana / Perfil / Herramientas → `/notificaciones`; lupa de Inicio / barra de Explorar → `/busqueda`;
Perfil / Herramientas → `/ayuda`. **No hay push** (`expo-notifications` no está instalado; el WS de core no se usa).

| Pieza | Tipo | Estado | Hallazgo |
|---|---|---|---|
| app/notificaciones.tsx | pantalla | rota/incompleta | Lista y «marcar leída» funcionan. **Tocar una notificación nunca navega**: `NOTIFICATION_ROUTES` usa tipos que el backend no emite (este emite `general`, `alert`, `citas`, `seguros`, `laboratorio`, `funeraria`, `transportistas`). Mientras carga no muestra el header (sin salida). Tiene un «Reintentar» que repite el banner de error. Vacío hecho a mano. 6 hex |
| app/busqueda/index.tsx | pantalla | **rota** | **El backend responde siempre 500**: `search.py:43` usa `LOWER(category)` y `products` no tiene esa columna (verificado en Supabase). Los productos salen sin subtítulo ni precio. Pull-to-refresh sin sentido en resultados. ~~3 resultados por tipo y sin «ver más»~~ ✅ F25 (6 dominios, «Ver todos» al módulo, tokens + EmptyState) |
| app/ayuda.tsx | pantalla | funciona | ~~No usa ScreenContainer ni ScreenHeader (`paddingTop: 60`, sin safe area)~~ ✅ (F21) · ~~**FAQ falsas**: el botón «Solicitar adopción» no existe y promete transferencias y OXXO cuando Stripe solo acepta tarjeta~~ ✅ FAQ verídicas: «¡Quiero Adoptar!» y solo tarjeta (F21) · ~~`Linking.openURL` falla en silencio~~ ✅ aviso con el correo de soporte (F21). WhatsApp y teléfono quedan ocultos porque sus variables de entorno están vacías |
| hooks notifications / search | hook | rota / funciona | Mapeo de tipos equivocado. «Marcar todas» hace N `PATCH`. No hay contador de no leídas. Están muertos: barrels, `useSearch.ts`, `types/notifications.ts` y un `TYPE_CONFIG` duplicado |
| src/services/alerts.ts | servicio | parte muerta | Es de Mi clínica, no del usuario. 4 funciones muertas (vía `useAlerts`) |
| backend core notifications / search | backend | funciona / **rota** | Notificaciones: faltan `read-all`, `unread-count` y el campo `link`; la tabla está vacía en producción. Ecommerce no emite ninguna. Búsqueda: error 500 y **expone clínicas y productos no aprobados** |

Redundancias: Notificaciones ×3, Ayuda ×2, Búsqueda ×2 (más un SearchBar propio en cada módulo), Términos ×2.
Propuesta de rediseño (requiere visto bueno): Notificaciones solo con la campana de Inicio y un badge real; campo `link`
en el modelo y que la app navegue a `link`; Búsqueda solo en Explorar y ampliada a adopciones, perdidas, petfriendly y
servicios; Ayuda solo desde Perfil. Push en la Fase 5 (APK).
Arreglos:
- [x] P0 La búsqueda da 500 (`backend/michicondrias_core/app/api/routes/search.py:43`)
- [x] P0 Las notificaciones no navegan (`src/hooks/notifications/useNotifications.ts:31-37`)
- [x] P0 El punto de la campana es falso (`(tabs)/index.tsx:75`)
- [ ] P1 ~~La búsqueda expone contenido no aprobado~~ ✅; ~~FAQ falsas (`ayuda.tsx:12-13`)~~ ✅ (F21); ~~sin header durante la carga~~ ✅
- [ ] P1 Entradas duplicadas; tarjetas sin destino que parecen tocables; ~~`Linking` silencioso~~ ✅ (F21); productos sin precio
- [ ] P2 EmptyState, tokens, quitar el refresh de búsqueda, tipar `services/search.ts`, Ayuda con componentes base

---

## Botones rotos o redundantes — consolidado P1 (2026-10-07)

**Rotos o sin efecto**
| Pantalla:línea | Botón/acción | Problema |
|---|---|---|
| ~~busqueda/index.tsx~~ | ~~Buscar (cualquier texto)~~ | ✅ resuelto 2026-10-07 (falta deploy de core) |
| ~~notificaciones.tsx:39~~ | ~~Tocar una notificación~~ | ✅ resuelto 2026-10-07 (falta deploy de core) |
| ~~(tabs)/index.tsx:75~~ | ~~Punto rojo de la campana~~ | ✅ resuelto 2026-10-07 (falta deploy de core) |
| ~~login.tsx:222~~ | ~~«Entrar» en web~~ | ✅ resuelto |
| login.tsx:222 | «Entrar» con mayúsculas o espacios en el email | Falla (no normaliza) |
| perfil/paleta.tsx:20 | «Aplicar paleta» | No hace nada; muestra instrucciones de código |
| perfil/index.tsx:374 · useMenu.ts:115 | «Paleta de colores» / «Apariencia» | Llevan a la pantalla falsa |
| perfil/index.tsx:358 | «Configuración» | Lleva a `/menu` (pestaña oculta para el consumidor) |
| perfil/kyc.tsx:175 | «Enviar documentos» | No refresca el estado; deja reenviar estando PENDING o VERIFIED |
| perfil/seguridad-2fa.tsx:87 | «Escanea el código QR» | No hay QR |
| ~~mascotas/[id].tsx:51~~ | ~~Editar (mascota ajena)~~ | ✅ resuelto 2026-10-07 |
| mascotas/[id].tsx:102 | Michi-Tracker activo | Deshabilitado, sin destino |
| ~~mascotas/[id].tsx:71~~ | ~~Insignia «verificado»~~ | ✅ resuelto 2026-10-07 |
| ~~carnet/nueva-vacuna.tsx:102~~ | ~~«Se notificará el refuerzo»~~ | ✅ resuelto 2026-10-07 |
| carnet/index.tsx:119 | Buscar paciente por UUID | Inutilizable |
| tienda/producto/[id].tsx:255 | «Publicar reseña» | 403/409 para quien no compró o es el dueño |
| ~~tienda/pedido/[id].tsx:99~~ | ~~«Pagar ahora» → estado~~ | ✅ resuelto (sin caché) |
| register.tsx:178 | Check de términos | Decorativo |
| register.tsx:184,191 · ayuda.tsx:91 | Términos / Privacidad | Sin URL configurada → no hacen nada |
| forgot-password.tsx:183 · reset-password.tsx:111 | «¿Ya tienes el token?» / campo token | El correo no muestra el token |
| ayuda.tsx:27 | Email / WhatsApp | ~~Fallo silencioso~~ ✅ aviso (F21); WhatsApp oculto sin variable de entorno |
| diagnostico-ia.tsx:167 | Vacío «registra una mascota» | Sin botón |
| (tabs)/tienda-tab.tsx:200 | Vacío de productos | Sin acción |
| use2FA.ts:121 · auth2fa.ts:39 | `upgradeToPartner` | Muerto y roto (422) |

**Redundantes (misma acción en varios lugares)**
| Acción | Dónde está hoy | Dónde debe quedar |
|---|---|---|
| Ir a la tienda | Pestaña + stat «Ver Tienda» + acción rápida + banner (Inicio) + tarjeta en Explorar | Pestaña |
| Mis compras | Tienda (tarjeta) + Perfil + perfil/index + Explorar | Perfil › Mi actividad |
| Notificaciones | Campana + Perfil + Herramientas | Campana (con badge) |
| Búsqueda global | Lupa en Inicio + barra en Explorar | Explorar |
| Ayuda | Perfil + Herramientas | Perfil |
| Cerrar sesión | Perfil + perfil/index + Herramientas | Perfil |
| Ser profesional / Verificación | Perfil + Herramientas + tarjeta en Inicio | Perfil (+ tarjeta en Inicio solo si hay acción pendiente) |
| 2FA | perfil/index + Herramientas | Perfil › Cuenta › Seguridad |
| Apariencia | Selector en Perfil + paleta falsa ×2 | Selector en Perfil |
| Editar perfil | Lápiz + fila en `two` | Cabecera tocable |
| Verificación KYC | `perfil/verificacion` + `perfil/kyc` | `perfil/verificacion` |
| Detalle de la mascota | `mascotas/[id]` + `carnet/[id]` | Ficha con pestañas |
| Lista de mascotas | `mascotas/index` + `carnet/index` | `mascotas/index` |
| Recordatorios | Pestaña del carnet + `carnet/recordatorios` | Pestaña Salud |
| Diagnóstico IA | Tarjeta + banner en Explorar (+ ícono en el carnet) | 1 en Explorar + contextual en Salud |
| Clínicas / Veterinarios | 2 tarjetas → `/directorio` | 1 tarjeta |
| Categorías de la tienda | Ícono de filtro + tarjeta + chips + `/tienda/categorias` | Chips |
| Mi tienda (vendedor) | Tienda del cliente + Herramientas + Inicio | Herramientas (+ panel de Inicio) |
| Herramienta principal del rol | Banner de Herramientas + 1.ª fila | Una de las dos |
| Expediente de mascota | Tarjeta + botón «Expediente» anidado | Tarjeta |
| Reintentar | Botón propio + `QueryErrorBanner` (notificaciones) | `QueryErrorBanner` |
| Volver al login | 2 enlaces en el éxito de forgot-password | 1 |
| Resultado de pago | pago-exitoso + pago-cancelado (copias) | Un componente, 2 rutas |

## Directorio y citas — auditado 2026-10-08
Flujo cliente: Inicio / Explorar / Búsqueda → `/directorio` (pestañas Clínicas · Especialistas) → `clinica/[id]` o `especialista/[id]` → `citas/agendar/[clinic_id]` → `/directorio/citas` (cancelar o reagendar, que vuelve a `agendar?reschedule_id=`). Profesional: `roleTools` «Mi directorio» y `useMyClinic.goToRegister` → `/directorio/nuevo`. Notificaciones `citas` → `/directorio/citas` (`crud_services.py:339`).
En producción hay **0 citas** (consulta de solo lectura en Supabase), así que se puede rehacer sin migrar datos.

| Pieza | Tipo | Estado | Hallazgo |
|---|---|---|---|
| app/directorio/index.tsx | pantalla | funciona | 587 líneas, 8 hex, sin `ScreenContainer` (sin banner de error) y sin pull-to-refresh. Carga doble: `ActivityIndicator` (:312) + `DataList isLoading`. **Dos botones que hacen lo mismo**: la tarjeta entera y «Ver Perfil» (:134) van a la misma ruta. Las tarjetas de profesional «Mi Clínica» (:282) y «Registrar mi Clínica» (:301) aparecen en el directorio del cliente. Los especialistas muestran el escudo verde aunque digan «Cédula sin registrar» (:193-197). `listEmptyComponent` (:329) está muerto. Pestañas y chips hechos a mano (no `FilterChip`/`SegmentedTabs`). `TextInput` en vez de `SearchBar` |
| app/directorio/clinica/[id].tsx | pantalla | funciona | 631 líneas, 8 hex. La carga es un texto (:20) y «Clínica no encontrada» (:21) no tiene botón para volver. **El formulario de reseña se ve para todos**, dueño incluido, y el backend le responde 403 (`reviews.py:36`). Las reseñas dicen «Usuario» con la inicial «U». «Agendar Cita General» (:317) aparece aunque la clínica no tenga servicios ni horario, y la pantalla de agendar no permite continuar. No lista a los veterinarios de la clínica |
| app/directorio/especialista/[id].tsx | pantalla | rota/incompleta | **809 líneas**. **Manda `vet_id` a agendar (:55), pero `useBookAppointment` no lo lee**, así que la cita no queda con el especialista aunque el backend acepta `vet_id` (`schemas/services.py:86`). El enlace a la clínica aparece 2 veces (:130 y :159). El mismo formulario de reseña que la clínica, visible también en el propio perfil (403). Muestra el teléfono y el correo del veterinario |
| app/directorio/citas/index.tsx | pantalla | funciona con huecos | 244 líneas, 7 hex (`#ef4444` en vez de `theme.error`). Usa `ScreenContainer`, `ScreenHeader` y `DataList` con refresh y vacío con acción ✅. **Las citas canceladas no aparecen en ningún filtro** («Todas» las excluye en `useAppointments.ts:104`), así que **una cita que cancela la clínica desaparece y su `cancellation_reason` nunca se ve**. Citas pasadas pendientes o confirmadas siguen mostrando «Reagendar/Cancelar». No separa próximas de pasadas. Las pestañas no son `FilterChip` |
| app/directorio/citas/agendar/[clinic_id].tsx | pantalla | funciona | 561 líneas, **14 hex**, emojis 🕒🚨. La carga es un texto. **Promete que las emergencias «tienen prioridad y pueden ser atendidas fuera del horario normal» (:322), pero el backend solo agrega `[EMERGENCIA]` a las notas**: igual exige un horario normal y el aviso a la clínica no dice que es urgente (`crud_services.py:306`). Validación por alerta, no por campo. Usa `KeyboardScreen` ✅ y slots reales del backend con manejo de 409 ✅ |
| app/directorio/nuevo.tsx | pantalla | funciona / capas rotas | **Llama a `createClinic` y a `queryClient` desde la pantalla** (:6, :44). `KeyboardAvoidingView` en vez de `KeyboardScreen`. No pide estado ni correo. **No está en `ROUTE_ACCESS` ni tiene `RoleGuard`, y el backend `POST /clinics/` no revisa el rol** (`clinics.py:56`): cualquier consumidor puede registrar una clínica (la mitiga la moderación) |
| hooks/directorio/useAppointments.ts | hook | funciona / duplicado | **Pide `/appointments/me` 2 veces** con dos query keys (`user-appointments` de `citas.ts` y `my-directorio-appointments` de `directorio.ts`). La segunda no la usa ninguna pantalla. Colores hex en `STATUS_CONFIG` |
| hooks/directorio/useBookAppointment.ts | hook | funciona | Ignora `vet_id`. `toLocalYMD` exportado sin uso (knip) |
| hooks/directorio/useClinicDetail · useVetDetail · useVetReviews · useClinicsAndVets | hook | funciona | Sin `isError` en clínica. `canRegister` calculado a mano (:35) en lugar de `roleTools`. `isMounted` innecesario |
| src/services/citas.ts vs directorio.ts | servicio | **duplicado / roto** | Dos clientes para `/appointments`. **`directorio.cancelAppointment` manda el motivo como `?reason=` y sin cuerpo (`directorio.ts:~287`), pero el backend exige el cuerpo `AppointmentCancel` (`appointments_routes.py:189`) → 422**: **la clínica no puede cancelar citas desde `mi-clinica/agenda` (`useAgenda.ts:86`)**. `citas.ts` sí manda el cuerpo. `MOCK_SERVICES` (:188) son datos falsos sin uso. `createAppointment`, `getUnreadAlertCount` y `deleteAlert` sin uso (knip). `src/types/citas.ts` muerto (knip) |
| backend directorio | backend | funciona con huecos | `GET /clinics/{id}` devuelve clínicas **no aprobadas** a cualquiera, y `ClinicResponse`/`VeterinarianResponse` públicos exponen `owner_user_id`/`user_id`. `cancel_appointment` revienta si la clínica es `None` (:198). `POST /clinics/` sin rol. No hay endpoint de «¿puedo reseñar?» |

Redundancias: 2 servicios de citas y 2 queries a `/appointments/me`. Tarjeta + «Ver Perfil». Enlace a la clínica ×2 en el especialista. «Mi Clínica» y «Registrar» en el directorio del cliente, cuando ya existen en `roleTools`/Herramientas. 3 botones «Agendar» en la clínica (cada servicio, el pie y, desde el especialista, otro más). `?type=clinic` ya no aplica: Explorar tiene una sola entrada «Veterinarios» (`useExplore.ts:34`).
Propuesta de rediseño (requiere visto bueno):
- `/directorio` con `SearchBar`, `FilterChip` (Todas · 24 h · Urgencias) y `SegmentedTabs` (Clínicas · Especialistas). Sin tarjetas de profesional.
- Ficha de clínica: info, servicios (cada uno abre agendar), médicos, reseñas, y un solo CTA «Agendar» que solo aparece si hay servicios.
- Especialista partido en `src/features/directorio/` (`ReviewSection` común con la clínica). Al agendar desde el especialista se manda y se guarda `vet_id`.
- Mis citas con pestañas «Próximas · Historial»: las canceladas van al historial con el motivo, y las pasadas sin acciones.
- `citas.ts` como único cliente de `/appointments`.
- `directorio/nuevo` en `ROUTE_ACCESS` (`veterinario`, `hospital`) con hook.

Backend: rol en `POST /clinics/` (veterinario/hospital/admin). `GET /clinics/{id}` solo aprobadas (salvo dueño o admin). Quitar `owner_user_id`/`user_id` del schema público. Guard de `clinic None` en cancel. Emergencia: marcar `is_emergency` en el aviso a la clínica (o quitar la promesa).
Arreglos:
- [ ] P0 La clínica no puede cancelar citas: `directorio.cancelAppointment` sin cuerpo → 422 (`services/directorio.ts` cancel, `useAgenda.ts:86`). Usar el cuerpo `{cancellation_reason}`
- [ ] P0 La cita agendada desde el especialista no queda asignada a él: `vet_id` ignorado (`especialista/[id].tsx:55`, `useBookAppointment.ts:102`)
- [ ] P1 Citas canceladas invisibles y motivo de cancelación nunca mostrado (`useAppointments.ts:104`). Acciones en citas pasadas
- [ ] P1 Promesa de emergencias sin respaldo (`agendar/[clinic_id].tsx:322`)
- [ ] P1 Formulario de reseña visible para el dueño o el propio veterinario (403) en clínica y especialista. Reseñas sin autor
- [ ] P1 `/directorio/nuevo`: sin rol en app ni en backend. Service y `queryClient` en la pantalla
- [ ] P1 Quitar «Mi Clínica»/«Registrar» del directorio. Una sola acción por tarjeta. Escudo verde con «Cédula sin registrar»
- [ ] P2 Unificar `citas.ts`/`directorio.ts` (borrar `MOCK_SERVICES`, `types/citas.ts` y la query duplicada). Skeleton, `ScreenContainer`, `SearchBar`/`FilterChip`, tokens (0 imports de `constants/design`), partir `especialista/[id]` (809 l.), `clinica/[id]` (631 l.) y `agendar` (561 l.)

---

## Adopciones — auditado 2026-10-08
Flujo adoptante: Inicio / Explorar / Búsqueda → `/adopciones` → `[id]` → «¡Quiero Adoptar!» → `solicitar/[id]` (exige KYC) → `mis-solicitudes` (desde Perfil).
Flujo de quien publica (refugio/hogar temporal, desde `roleTools`): `mis-publicaciones` · `nuevo` · `solicitudes` → `solicitud/[id]` (aprobar crea la mascota en mascotas) · `ver-solicitudes/[id]`.
Flujo B paralelo (solo refugio): `refugio/aplicaciones` → `contrato/[id]`.
En producción hay **0 solicitudes, 0 formularios y 0 contratos**.

| Pieza | Tipo | Estado | Hallazgo |
|---|---|---|---|
| app/adopciones/index.tsx | pantalla | funciona | 238 líneas, 2 hex. `SearchBar`, `FilterChip`, `DataList` con refresh ✅. El «+» del header deja publicar a cualquiera, pero **el consumidor no tiene entrada a «Mis publicaciones»** (solo existe en `roleTools` del refugio) y el éxito le dice «Puedes ver su estado en Mis publicaciones» (`useListingForm.ts:146`): callejón sin salida. Chip «Grandes» suelto |
| app/adopciones/[id].tsx | pantalla | funciona | 448 líneas, 7 hex. `LoadingOverlay` a pantalla completa. Compartir sin enlace (solo texto). Para el dueño, el pie dice «Gestiona las solicitudes desde Solicitudes recibidas» sin botón que lleve allí (:163) |
| app/adopciones/solicitar/[id].tsx | pantalla | funciona / incompleta | 376 líneas, 9 hex, `LoadingOverlay` + `ActivityIndicator`. **El KYC se exige solo en la app** (:52); `POST /pets/{id}/request` no lo revisa (`pets.py:175`). **Bloquea a veterinarios** como «equipo» (:32), aunque un veterinario es un adoptante válido. Jerga «Centro de Seguridad», «Validando perfil de seguridad» |
| app/adopciones/mis-solicitudes.tsx | pantalla | funciona | 215 líneas, 5 hex. **Indicador «En Vivo» falso** (es un `refetchInterval` de 30 s, verde hex :188). Botón de refrescar con ícono de reloj, redundante con el pull-to-refresh. No muestra los formularios del flujo B, aunque esas notificaciones enlazan aquí (`pets.py:541,573`) |
| app/adopciones/mis-publicaciones.tsx | pantalla | funciona | 182 líneas. «Eliminar» se ve en publicaciones adoptadas (el backend responde 400). El spinner de borrado (`isDeleting`) sale en todas las filas. No avisa que editar una publicación aprobada **la vuelve a moderación** (`crud_pet.py:66`) |
| app/adopciones/nuevo.tsx | pantalla | funciona | 434 líneas, **12 hex**. Alta y edición (`?editId`) en una sola ✅. Sin `FormField`/`KeyboardScreen` |
| app/adopciones/solicitudes.tsx | pantalla | funciona / redundante | 412 líneas, `LoadingOverlay`. **N+1**: `getMyListings` + 1 petición por publicación (`useApplications.ts:45`). `AppRefreshControl` en `FlatList` con `scrollEnabled={false}` (:226) no hace nada. Botones de estado en la tarjeta (Rechazar · Revisión · Entrevista sin fecha) que repiten los del detalle. **Ignora `?id=`**: el admin llega desde `admin/moderacion/index.tsx:221` y solo ve *sus propias* publicaciones |
| app/adopciones/ver-solicitudes/[id].tsx | pantalla | redundante / confunde | 356 líneas. Modal con el mismo detalle que `solicitud/[id]`. **«Aprobar» pone `APPROVED` («Pre-aprobada»), no concreta la adopción** (:152), y después ya no ofrece la aprobación final: hay que buscarla en otra pantalla |
| app/adopciones/solicitud/[id].tsx | pantalla | funciona | 460 líneas, 8 hex, `LoadingOverlay`. Es la única con la aprobación real (crea la mascota). «Aprobar Adopción» está duplicado en el código (:264 y :274). Fecha de entrevista en texto libre. 3-4 botones de color al mismo nivel (ninguna acción domina) |
| app/adopciones/formulario-compatibilidad.tsx | pantalla | **muerta** | **Nadie navega a ella** (grep de `formulario-compatibilidad` y `petId`: 0 resultados). Sin ella, el flujo B no tiene entrada |
| app/adopciones/refugio/aplicaciones.tsx | pantalla | rota (flujo B) | Siempre vacía (nadie puede enviar formularios). En `ROUTE_ACCESS` pero **sin `RoleGuard`**: un no-refugio ve el error 403. La tarjeta lleva directo a firmar el contrato, sin ver el formulario |
| app/adopciones/contrato/[id].tsx | pantalla | rota (flujo B) | **Firma el refugio, pero el texto dice «te comprometes a cumplir…» como si fuera el adoptante** (`useAdoptionContract.ts:101`). Firmar marca el formulario como aprobado y avisa «Tu postulación fue aprobada», pero **no cierra la publicación ni crea la mascota** (`pets.py:500-545`): promesa sin efecto. Términos fijos en el cliente. `refuge_id: ''` |
| hooks/adopciones | hook | funciona / duplicado | `['my-requests']` y `['my-adoption-requests']` son la misma consulta. `useMyListings.updateMutation` muerto. `STATUS_LABELS` duplicado en `useApplications` y `useApplicationDetail` (export sin uso, knip). `useApplyForm` muta con `useState` y no con `useMutation` |
| backend adopciones | backend | funciona / riesgo | **Privacidad**: `GET /pets/{id}` es público y devuelve publicaciones **sin aprobar o adoptadas**, con `microchip_number`, `published_by` y **`adopted_by`** (`schemas/pet.py:44-49`). KYC no exigido en `request`. `approve` no es idempotente: si `crud.approve_adoption` falla después del POST a mascotas, un reintento duplica la mascota. `GET /adoptions/refuge/applications` excluye a `hogar_temporal` |

Redundancias:
- **2 sistemas de adopción paralelos**: solicitudes (`/request`) y formularios + contratos (`/adoptions/forms`), con estados y pantallas distintos. Solo funciona el primero.
- **3 pantallas para gestionar las mismas solicitudes** (`solicitudes`, `ver-solicitudes/[id]`, `solicitud/[id]`) con acciones distintas en cada una.
- La consulta de mis solicitudes ×2. Refresh ×2 en `mis-solicitudes`.

Propuesta de rediseño (requiere visto bueno):
- **Un solo flujo**: quitar el flujo B (`formulario-compatibilidad`, `refugio/aplicaciones`, `contrato/[id]` y sus endpoints) o integrar la compatibilidad y el contrato **dentro** de la solicitud. Sin datos en producción, quitarlo es barato.
- Gestión en 2 pantallas: `solicitudes` (lista con filtro por mascota vía `?listing=`, que también sirve al admin) → `solicitud/[id]` como único detalle. Una acción primaria según el estado: Revisar → Entrevista (`DatePicker`) → «Aprobar adopción». Rechazar como secundaria. Se borra `ver-solicitudes/[id]`.
- «Mis publicaciones» y «Mis solicitudes» accesibles desde Perfil para cualquier usuario que publique o postule.
- `adopciones/[id]` del dueño con CTA «Ver solicitudes (n)».

Backend: esquema público sin `adopted_by`/`microchip_number`. `GET /pets/{id}` solo aprobadas y abiertas (salvo dueño o admin). Exigir `verification_status == VERIFIED` en `POST /{id}/request`. `GET /admin/{listing_id}/requests` ya permite al admin. Idempotencia en `approve` (no crear la mascota si ya existe `adopted_from_listing_id`).
Arreglos:
- [ ] P0 Flujo B roto de punta a punta: formulario inalcanzable; el contrato promete «aprobada» sin cerrar la publicación ni transferir la mascota (`pets.py:500`); `mis-solicitudes` no lo muestra. Decidir: quitarlo o integrarlo
- [ ] P0 `ver-solicitudes/[id]` «Aprobar» solo pre-aprueba y deja sin salida la aprobación real (:152)
- [ ] P1 Privacidad: `GET /pets/{id}` público con `adopted_by`, microchip y publicaciones sin aprobar
- [ ] P1 KYC solo en el cliente; veterinarios bloqueados para adoptar (`solicitar/[id].tsx:32,52`)
- [ ] P1 Consumidor que publica sin acceso a «Mis publicaciones»; el dueño sin CTA a sus solicitudes (`[id].tsx:163`)
- [ ] P1 Admin → `/adopciones/solicitudes?id=` ignora el parámetro (`admin/moderacion/index.tsx:221`)
- [ ] P1 «En Vivo» falso y refresh duplicado (`mis-solicitudes.tsx`). Eliminar en adoptadas. Aviso de remoderación al editar
- [ ] P2 Fusionar las 3 pantallas de solicitudes. N+1 de `useApplications`. Query keys unificadas. `RoleGuard` en `refugio/*`. Skeleton en lugar de `LoadingOverlay` (5 pantallas), tokens, `FormField`/`KeyboardScreen` en `nuevo`

---

## Perdidas — auditado 2026-10-08
Flujo: Inicio / Explorar / Búsqueda → `/perdidas` (lista o mapa, chips lost/found y especie, stats) → `[id]` (contactar, «Avisar que lo vi», compartir) · dueño: coincidencias, avistamientos, «Marcar como encontrado», `editar/[id]`. Alta en `/perdidas/nuevo` (GPS obligatorio). Notificaciones `alert` → `/perdidas`.

| Pieza | Tipo | Estado | Hallazgo |
|---|---|---|---|
| app/perdidas/index.tsx | pantalla | funciona | 372 líneas, 4 hex, `LoadingOverlay` en vista lista (:222). Refresh ✅, vacío con acción ✅. **Las estadísticas mienten**: «Reunidos» cuenta solo hasta 50 (límite por defecto de `GET /reports/`) y «Perdidos/Encontrados» salen de la lista filtrada (con el filtro «lost», encontrados = 0). Sin paginación (50 máx.) |
| app/perdidas/[id].tsx | pantalla | funciona | 665 líneas, **17 hex**. Avistamientos reales con aviso al dueño ✅, coincidencias ✅, tracker con polling de 15 s ✅. Compartir manda solo texto, sin enlace al reporte (:361). Coordenadas crudas del tracker (:207). **El dueño no puede borrar el reporte** (el endpoint existe). Sin datos de contacto de quien avistó |
| app/perdidas/nuevo.tsx | pantalla | funciona / capas rotas | 510 líneas, **26 hex**, 3 `ActivityIndicator`. **Lógica, service y `queryClient` en la pantalla** (:14, :93, :99), mientras `hooks/perdidas/useReportForm.ts` hace lo mismo y está muerto (knip). `KeyboardAvoidingView`, sin `ScreenContainer`. Validación por alerta |
| app/perdidas/editar/[id].tsx | pantalla | funciona | 272 líneas, `LoadingOverlay` + `ActivityIndicator`. **No permite mover el punto del mapa** y permite borrar los dos contactos (sin la validación del alta). Solo se llega desde el pie del detalle |
| hooks/perdidas/useReports · useReportDetail · useEditReport | hook | funciona | Invalidaciones correctas (`lost-pet-reports`, `lost-pet-resolved`, `perdidas-report`). `useReportDetail` usa `Linking`/`Location` (aceptable en hook) |
| hooks/perdidas/useReportActions · useReportForm | hook | **muerta** | Sin importador (knip) |
| src/services/perdidas.ts | servicio | funciona | `updateTrackerLocation` y `broadcastReport` sin uso (knip). No usa `GET /reports/mine` ni `DELETE /reports/{id}` |
| backend perdidas | backend | funciona / riesgo | **Privacidad**: `GET /reports/` y `/{id}` son públicos sin sesión y devuelven `contact_phone`, `contact_email`, `reporter_id`, **`tracker_device_id` y la ubicación en vivo del collar** (`current_lat/lng`) (`schemas/lost_pet.py:55-66`): permite raspar teléfonos y rastrear el collar. **La notificación de avistamiento no lleva `link`** (`lost_pets.py:250-258`, F24 no cubrió perdidas): abre la lista y no el reporte. La moderación (`/admin/{id}/approve`) no filtra nada: los reportes son públicos desde el alta. `matches` no exige ser dueño |

Redundancias: alta duplicada (pantalla vs `useReportForm` muerto). «Marcar como encontrado» en el cuerpo y «Editar» en el pie (dos zonas de acciones del dueño). Contactar por teléfono y por correo en un solo botón que adivina (aceptable).
Propuesta de rediseño (requiere visto bueno):
- `nuevo` y `editar` con un `ReportForm` común (hook `useReportForm` revivido), con mapa editable en los dos.
- «Mis reportes» (con `GET /reports/mine`) en Perfil, con resolver y eliminar con confirmación.
- Detalle del dueño con una sola barra de acciones: Encontrado (primaria) · Editar · Eliminar.
- Compartir con enlace al reporte.
- Stats desde un endpoint de conteos (o quitarlos).

Backend: `link` `/perdidas/{id}` en `_notify_user` (avistamiento y difusión). Esquema público sin `tracker_device_id`, `reporter_id` ni `current_lat/lng` (solo para el dueño). Contacto solo con sesión. Endpoint de conteos. Decidir si la moderación oculta reportes.
Arreglos:
- [ ] P1 Privacidad: tracker en vivo, `tracker_device_id` y contactos expuestos sin sesión en `GET /reports/`
- [ ] P1 Aviso de avistamiento sin `link` → abre la lista y no el reporte (`lost_pets.py:254`)
- [ ] P1 Sin «Mis reportes» ni eliminar. Editar no permite mover el punto ni valida el contacto
- [ ] P1 Estadísticas incorrectas (tope de 50 y dependen del filtro) (`useReports.ts:39-43`)
- [ ] P2 `nuevo.tsx`: sacar la lógica a `useReportForm` y borrar `useReportActions`. Compartir con enlace. Skeleton, `ScreenContainer`, `KeyboardScreen`, tokens (26 + 17 hex). Partir `[id]` (665 l.) y `nuevo` (510 l.)

---

**Medición transversal de los 3 módulos (22 pantallas):** ninguna importa `constants/design` (0 tokens), hay 264 `fontSize` numéricos, ninguna usa `RoleGuard` y `directorio/index`, `directorio/nuevo` y `perdidas/nuevo` no usan `ScreenContainer`. Hex por pantalla: directorio 1–14, adopciones 0–12, perdidas 4–26.

## Paseadores y Cuidadores — auditado 2026-10-08
Flujo cliente: Explorar → `/paseadores` o `/cuidadores` → `[id]` → «Reservar» (modal) → `POST /walkers|sitters/{id}/request` →
«Mis solicitudes» (`/…/solicitudes`, vista de cliente) → cancelar o reseñar desde el perfil. Búsqueda global → `[id]`.
Flujo profesional (roleTools `servicioPro`): Herramientas → `/…/solicitudes` (vista de proveedor: aceptar, iniciar, completar) ·
`/…/calendario` · `/servicios-pro/gestion|perfil`. **Producción: 0 paseadores, 0 cuidadores, 0 solicitudes.**
Medidas: 3 039 líneas en 8 pantallas, 33 hex (más 12 en `STATUS_COLORS` de los 2 hooks de calendario), 0 imports de
`constants/design`, ~79 `fontSize` sueltos en los detalles, `LoadingOverlay` a pantalla completa en index, detalle y solicitudes.

| Pieza | Tipo | Estado | Hallazgo |
|---|---|---|---|
| app/paseadores/index.tsx | pantalla | funciona | `LoadingOverlay` (:134). 2 botones sobre la lista (:110-123). «Quiero ser paseador» se ve también a quien ya es paseador o tiene otro rol pro. El botón «Ver perfil» (:92) repite el toque de la tarjeta. 4 hex |
| app/cuidadores/index.tsx | pantalla | **rota** | **Los tipos de servicio no existen**: usa `daycare`/`boarding` (:76-77, chips :150-151), pero el backend usa `hosting`/`visiting`/`both` (`sitters.py:68`, `models/sitter.py:23`). La etiqueta siempre dice «Guardería y hospedaje», y los chips «Guardería» y «Hospedaje» solo muestran a los cuidadores `both`. Pone «/día» aunque el precio sea por visita (:109-111). 5 hex |
| app/paseadores/[id].tsx (844 l.) | pantalla | **rota** | **El DatePicker abre con «Invalid Date»**: `walkDate` empieza en `''` (`useWalkerDetail.ts:23`) y la pantalla hace `new Date('' + 'T12:00:00')` (:409). En Android el picker nativo puede fallar con ese valor. **La solicitud no lleva hora ni dirección de recogida** (`useWalkerDetail.ts:132-137`), aunque el schema las acepta (`walkers.py:121-123`) y el calendario las muestra («Sin hora»). Las reseñas siempre dicen «C / Cliente» (:325-329). El formulario reseña la *primera* solicitud sin reseña, no la que el usuario tocó (:282). Sin mascotas: «No tienes mascotas registradas» sin acción (:382). Error hecho a mano (:63-80). 10 hex, 4 `ActivityIndicator` |
| app/cuidadores/[id].tsx (935 l.) | pantalla | funciona / incompleta | ~90 % igual al de paseadores (diff: tipo de servicio, rango de fechas, hogar). **No manda `address`** para «Visitas a domicilio» (`useSitterDetail.ts:141-147`), así que el cuidador no sabe adónde ir. `ScreenHeader` dentro del `ScrollView` (:92-95), distinto del de paseadores. 10 hex |
| app/paseadores/solicitudes.tsx · cuidadores/solicitudes.tsx | pantalla | funciona / rol mal declarado | Son idénticas salvo `kind` (80 l. cada una). Ya usan `ServiceRequestCard`. `LoadingOverlay` a pantalla completa (:27). **Sirven a 2 perspectivas, pero `ROUTE_ACCESS` las limita a `paseador`/`cuidador`** (`roleTools.ts:178,180`). El cliente entra igual («Mis solicitudes», `index.tsx:113/:129`) solo porque no hay `RoleGuard`, y `canAccessRoute` descartaría una notificación al cliente con ese link (`useNotifications.ts:42`) |
| app/paseadores/calendario.tsx · cuidadores/calendario.tsx | pantalla | funciona (duplicada) | Gemelas (238/242 l.) y sus hooks también. El skeleton de carga no tiene header, así que no hay salida (:28-34). Tocar una cita solo abre una alerta, sin acciones. Muestra las canceladas. Sin pull-to-refresh. En cuidadores, la alerta muestra `hosting` en crudo (:124). Sin `RoleGuard` |
| hooks useWalkerDetail · useSitterDetail | hook | funciona / con muerto | Código muerto: `isFavorite/toggleFavorite`, `handleContact` (chat **simulado**: «Abriendro chat…», :118), `registerMutation`/`registerAsWalker|Sitter`, `registerModalVisible`. `handleBook(_serviceType)` ignora su argumento. Las invalidaciones son correctas |
| hooks useWalkers · useSitters · useWalkRequests · useSitRequests · useProRequests | hook | funciona | `useProRequests` ya unifica las 2 cosas. **Promesas sin emisor**: «El cliente verá el cambio de inmediato», «El cliente ya puede dejar su reseña» (`useProRequests.ts:33-35`) y «enviada al paseador» (`useWalkerDetail.ts:63`), pero ningún backend notifica |
| hooks useWalkerCalendar · useSitterCalendar | hook | funciona (duplicado) | Lo único que cambia es la agrupación por fecha o por rango. `STATUS_COLORS` con 6 hex cada uno, duplicando `StatusBadge` |
| services paseadores.ts · cuidadores.ts | servicio | funciona | Las 10 rutas existen. `registerAs*` solo lo usa el hook muerto. `src/types/paseadores.ts` y `cuidadores.ts` están **muertos** (knip): los tipos viven en el servicio |
| backend walkers.py · sitters.py | backend | funciona con huecos | Las transiciones de estado ya están bien controladas. **Ningún endpoint notifica** (ni solicitud nueva, ni aceptada, ni completada). **`is_verified` no lo pone nadie** (no hay endpoint y hay 0 filas), así que la insignia «Verificado» es inalcanzable. `GET /walkers/` sin paginación |

Redundancias: **2 detalles casi idénticos** (1 779 l.), 2 calendarios + 2 hooks gemelos, 2 pantallas de solicitudes
gemelas, 4 implementaciones de reseñas a mano (paseador, cuidador, pet-friendly y establecimiento) aunque ya existe
`components/reviews/ReviewsSection` (la usa entrenadores), selector de mascota hecho a mano aunque existe
`features/salud/PetPicker`, «Ver perfil» = tocar la tarjeta.

Propuesta de rediseño (requiere visto bueno): **componente compartido «perfil de proveedor»**
```
src/features/servicios-pro/
  ProviderProfile.tsx    pantalla completa: <ProviderProfile kind="walk" | "sit" />
  ProviderHero.tsx       foto/inicial, nombre, rating, insignia verificado, compartir
  ProviderFacts.tsx      stats [{icon, value, label}] + Sobre mí + Ubicación/radio + especies (+ hogar si sit)
  ProviderPricing.tsx    filas [{label, amount}] («Por hora»/«Por paseo» · «Por día»/«Por visita»)
  BookingSheet.tsx       PetPicker (con «Agregar mascota» si no hay) + children por tipo + Notas + Button loading
  providerConfig.ts      WALK/SIT: textos, stats, precios, campos de reserva (fecha+hora+duración+recogida |
                         tipo+inicio+fin+dirección si visiting), payload
src/hooks/servicios-pro/useProviderDetail.ts(kind)   fusiona useWalkerDetail/useSitterDetail sin el código muerto
```
Las reseñas van con `ReviewsSection` (con `canReview` e `requestId` elegible), `PetPicker` se mueve a `src/components/` y
`app/paseadores/[id].tsx` y `app/cuidadores/[id].tsx` quedan como envoltorios de ~10 líneas (de 1 779 a ~450 líneas). Igual con
`ProRequestsScreen kind` (solicitudes) y `ProCalendar kind` + `useProCalendar(kind)`. Más adelante el mismo perfil sirve
para estilistas y entrenadores. En las listas: un solo CTA por tarjeta (la tarjeta entera), «Mis solicitudes» como ícono del
header y «Quiero ser…» solo para consumidores.
Backend: notificación a core al crear o cambiar de estado una solicitud (paseo, cuidado), endpoint admin para
`is_verified` (o derivarlo del KYC verificado de core), paginación en `GET /walkers/` y `/sitters/`.
Arreglos:
- [ ] P0 Fecha inicial vacía → «Invalid Date» en el modal de paseo (`useWalkerDetail.ts:23`, `paseadores/[id].tsx:409`)
- [ ] P0 Tipos de servicio inexistentes `daycare`/`boarding` en la lista de cuidadores (`cuidadores/index.tsx:76,150-151`)
- [ ] P1 La solicitud de paseo no lleva hora ni dirección, y la de visitas no lleva dirección (`useWalkerDetail.ts:132`, `useSitterDetail.ts:141`)
- [ ] P1 Promesas de aviso sin emisor (`useProRequests.ts:33-35`, `useWalkerDetail.ts:63`): emitir notificaciones o quitar los textos
- [ ] P1 `ROUTE_ACCESS` de `/paseadores/solicitudes` y `/cuidadores/solicitudes` contradice el uso de cliente (`roleTools.ts:178,180`). Sacarlas de `ROUTE_ACCESS` o separar las rutas. `RoleGuard` en los calendarios
- [ ] P1 Reseñar la solicitud tocada, no la primera. Autor real en las reseñas. «Agregar mascota» cuando no hay
- [ ] P1 Insignia «Verificado» inalcanzable (backend sin setter)
- [ ] P2 Componente compartido (arriba), borrar el código muerto de los hooks (favorito, chat falso, registro) y `src/types/{paseadores,cuidadores}.ts`, Skeleton, tokens, calendario con header en carga y sin canceladas, `service_type` legible

---

## Lugares pet-friendly + Establecimientos — auditado 2026-10-08
Flujos: Explorar «Pet-friendly» → `/petfriendly` (lista o mapa, chips de categoría) → `[id]` (llamar, mapa, web, reseñas,
eliminar si es mío) · «+» → `/petfriendly/nuevo` (cualquier usuario, ubicación por GPS). Explorar «Establecimientos» →
`/establecimientos` → `[id]` (amenidades, cupón «reclamar», reseñas, canjear si soy el dueño) → `editar/[id]`. Rol
`establecimiento` (roleTools :124-125) → `/establecimientos/nuevo` · `/establecimientos`.
Backend: lugares en **perdidas** (`/places`, tabla `petfriendly_places`), establecimientos en su propio servicio (`/venues`,
`pet_friendly_venues`). **Producción: 0 lugares y 0 establecimientos.**
Medidas: 2 474 líneas en 7 pantallas, 30 hex, 0 tokens, `ActivityIndicator` a pantalla completa en `petfriendly/[id]:52`,
`establecimientos/[id]:45` y `editar/[id]:27`.

| Pieza | Tipo | Estado | Hallazgo |
|---|---|---|---|
| app/petfriendly/index.tsx | pantalla | funciona | Lista y mapa, chips de categoría, error con «Reintentar». `LoadingOverlay` dentro del vacío (:108-111). 1 hex |
| app/petfriendly/[id].tsx (613 l.) | pantalla | funciona / incompleta | **El formulario de reseña se ve al autor del lugar**, y el backend le responde 403 (`places.py` create_place_review). **El formulario se limpia aunque falle**: `handleCreateReview` se traga el error (`usePlaceDetail.ts:47-51`) y la pantalla borra el texto (:215-217). Autor fijo «V / Visitante». Jerga «Puntos Michi». **No hay editar**, aunque existe `PUT /places/{id}` (`places.py:91`). 6 hex, 4 `ActivityIndicator` |
| app/petfriendly/nuevo.tsx (481 l.) | pantalla | funciona / capas | **Importa servicios y sube la imagen desde la pantalla** (:13, :85-128) sin `useMutation`. `KeyboardAvoidingView` sin `ScreenContainer` ni `FormField` ni `KeyboardScreen`. **Solo acepta la posición GPS actual** (:51-70, :177): hay que estar en el lugar. `Dimensions` estático. 8 hex |
| app/establecimientos/index.tsx | pantalla | funciona | **Muestra el código del cupón en la lista** (:71-75). Amenidades como «WiFi: true» (:64). «Solo míos» se filtra en el cliente sobre los primeros 50 (:32). Vacío con acción solo para dueños |
| app/establecimientos/[id].tsx (563 l.) | pantalla | **rota (cupones)** | Muestra el cupón en claro (:166-172), así que «Reclamar» no aporta nada. **El canje está roto en el backend**: el código es el mismo para todos los clientes y `redeem` marca *cualquier* reclamo activo con ese código (`venues.py:215-250`). Spinner a pantalla completa (:45). 9 hex, 5 `ActivityIndicator` |
| app/establecimientos/nuevo.tsx · editar/[id].tsx | pantalla | funciona / rol sin declarar | Funcionan contra `require_establecimiento` (`venues.py:24,77,100`), pero **no están en `ROUTE_ACCESS` ni tienen `RoleGuard`**: un consumidor llega al formulario y recibe 403 al guardar. El modelo no tiene foto, coordenadas, categoría ni teléfono |
| hooks usePlaces · usePlaceDetail | hook | funciona | Las invalidaciones son correctas |
| hooks useVenues · useVenueDetail · useVenueForm · useVenueReviews | hook | funciona | `searchVenues()` sin paginación (`limit` 50 en el backend). `useVenueForm` expone `router` |
| services petfriendly.ts · venues.ts | servicio | funciona | Todas las rutas existen. `src/types/petfriendly.ts` y `venues.ts` están **muertos** (knip) |
| backend perdidas/places.py · establecimientos/venues.py | backend | funciona / cupón roto | Los 2 recalculan su propia calificación con reglas distintas (lugares: guardada; venues: `/score` al vuelo). Ninguno aparece en la búsqueda global (`core/search.py`) |

Redundancias: **los 2 módulos son lo mismo** («lugar que acepta mascotas»). Están lado a lado en Explorar
(`useExplore.ts:45-46`), los 2 tienen detalle con dirección → mapa y reseñas a mano, y la ficha de establecimiento es un
subconjunto pobre de la de lugar (sin foto, mapa, categoría ni contacto). Solo agrega *dueño oficial*, amenidades y
cupón, y el cupón está roto.

Propuesta de rediseño (requiere visto bueno) — **fusionar en un solo módulo «Lugares pet-friendly» (`/petfriendly`)**:
- Base: `petfriendly_places`. Es la más rica (mapa, foto, categoría, contacto, aporte de la comunidad) y las 2 tablas están
  vacías, así que no hay migración de datos.
- Lo que aporta Establecimientos pasa a ser atributos del lugar: `is_official` (lo registró o reclamó un usuario con rol
  `establecimiento`), `amenities` JSONB y `discount_description`. Insignia «Oficial» y promoción en la ficha.
- Cupón rehecho: «Obtener cupón» genera un **código único por cliente** (tabla nueva `place_coupons` en perdidas) y el
  dueño lo canjea con ese código. El código general deja de ser público.
- App: un `PlaceForm` común (alta y edición; ubicación por GPS **o** mover el pin o escribir la dirección), detalle con
  `ReviewsSection` (sin formulario para el autor), «Editar»/«Eliminar» en el header si es mío. Rol `establecimiento` en
  roleTools: «Registrar mi establecimiento» → `/petfriendly/nuevo?oficial=1`, «Mis lugares» → `/petfriendly?mios=1`,
  «Canjear cupón».
- Borrar `app/establecimientos/**`, `hooks/venues/*` y `services/venues.ts`, y quitar la tarjeta «Establecimientos» de Explorar.
  El servicio backend `establecimientos` se retira después (toca `deploy/services.conf` → producción, con aprobación).
- Alternativa mínima mientras tanto: ocultar «Establecimientos» de Explorar y no mostrar el código del cupón.
Backend: migración aditiva en perdidas (columnas + `place_coupons`), `GET /places?mine=1` y paginación, lugares en la
búsqueda global, y no permitir reseñar al autor desde la UI.
Arreglos:
- [ ] P1 Cupón público y canje que marca el reclamo de otro cliente (`venues.py:121-161,215-250`, `establecimientos/[id].tsx:166-172`)
- [ ] P1 Formulario de reseña visible al autor (403) y que se limpia aunque falle (`petfriendly/[id].tsx:174-226`, `usePlaceDetail.ts:47-51`)
- [ ] P1 `/establecimientos/nuevo|editar` fuera de `ROUTE_ACCESS` y sin `RoleGuard`
- [ ] P1 Alta solo con el GPS del momento (`petfriendly/nuevo.tsx:51-70`). Sin editar lugar (existe el PUT)
- [ ] P2 Fusión (arriba). `nuevo.tsx`: hook + `useMutation` + `FormField`/`KeyboardScreen`. Skeletons, tokens, amenidades legibles, borrar `src/types/{petfriendly,venues}.ts`

---

## Estética (Grooming + Estilistas) — auditado 2026-10-08
Flujo cliente: Explorar «Estética» → `/estilistas` (catálogo de servicios) → tarjeta → `/grooming/agendar?service_id`
(servicio → mascota → fecha → horario) → `/grooming/mis-citas` (próximas e historial, cancelar, reseñar) →
`/grooming/historial/[petId]` (también desde `mascotas/[id].tsx:178`).
Flujo estilista (roleTools :103-104): `/grooming/gestion` (citas, estados, fotos antes/después, reporte de piel) ·
`/estilistas/nuevo` (alta de servicio). **Backend único**: servicio `estilistas`, prefijo `/grooming`
(`API_URLS.estilistas`). **Producción: 0 servicios, 0 citas, 1 ficha.**
Medidas: 2 013 líneas en 6 pantallas, 24 hex, 0 tokens, 7 `ActivityIndicator` (agendar ×5, gestion ×2). Las listas usan `DataList`.

| Pieza | Tipo | Estado | Hallazgo |
|---|---|---|---|
| app/estilistas/index.tsx | pantalla | funciona | **La tarjeta no dice quién es el estilista** (`groomer_name` llega y no se muestra), y no hay perfil del estilista. El estilista ve «Ofrecer Servicios» (repite roleTools) y no ve sus citas. Título «Estilistas» cuando Explorar dice «Estética». Rol calculado en la pantalla (:21-22). 4 hex |
| app/estilistas/nuevo.tsx | pantalla | funciona / incompleta | `KeyboardScreen` sí, `FormField` no. **Al crear no invalida `['grooming-services']`**: el servicio nuevo no aparece en el catálogo (`useGroomingForm.ts:31-56`, sin `useMutation`). `parseFloat` sin validar (:42) y error genérico. Sin `RoleGuard` |
| app/grooming/agendar.tsx (433 l.) | pantalla | funciona | 5 `ActivityIndicator`. «Registra una mascota primero.» sin acción (:153-155). **Hoy ofrece horarios que ya pasaron**: el backend da 09–17 fijo, sin ver la hora actual ni la duración (`grooming.py:329-354`). Texto «Spa & Grooming». 7 hex |
| app/grooming/mis-citas.tsx | pantalla | funciona / capas | **`useMutation` + servicio dentro de la pantalla** para la reseña (:18, :47-58). Cancelar y reseñar funcionan e invalidan bien. 8 hex |
| app/grooming/gestion.tsx (566 l.) | pantalla | funciona / incompleta | Estados y fotos reales (las sube a S3 con el presigned de mascotas). **Sin «Mis servicios»**: `getMyGroomingServices` y `updateGroomingService` existen y están muertos (knip, `grooming.ts:122,126`), así que no se puede ver, editar ni pausar un servicio. Guardar fotos no invalida `grooming-client-appointments` ni `grooming-history` (`useGroomingProvider.ts:45-46`). Sin `RoleGuard`. Supera 400 líneas |
| app/grooming/historial/[petId].tsx | pantalla | funciona / parte muerta | **La «ficha» (tipo de pelo, champú, conducta, alergias) nunca se puede llenar**: no hay endpoint que la escriba (`crud_grooming.py:48-52` la crea en nulos), así que el bloque :30-60 nunca aparece |
| hooks grooming (5) | hook | funciona | `useGroomingBooking` guarda `service_type = nombre` (:119), sin `service_id` ni precio en la cita. `getGroomerReviews` muerto (knip): las reseñas del estilista no se ven en ningún lado (solo el promedio en la tarjeta) |
| services/grooming.ts | servicio | funciona | 3 funciones y 2 interfaces muertas (knip). `src/types/grooming.ts` está **muerto** |
| backend estilistas/grooming.py | backend | funciona con huecos | Ningún endpoint notifica (cita nueva, cambio de estado). `GET /files/{pet_id}` **crea** la ficha al leer (:205). Un estilista que atendió una vez a la mascota ve **todas** sus citas, incluidos los reportes de piel de otros estilistas (:198-210). Las reseñas exponen `full_name` completo. No sale en la búsqueda global |

Redundancias: **un solo dominio con 2 nombres de carpeta y 4 nombres en la UI**: «Estética» (Explorar), «Estilistas»
(catálogo), «grooming» (agendar, alertas, roleTools «Nuevo tipo de grooming») y «Spa & Grooming». La entrada del estilista
está en 2 sitios (botón del catálogo + roleTools). Hay reseñas a mano en mis-citas y en el catálogo, aparte del perfil de
proveedor de paseadores y cuidadores.

Propuesta de rediseño (requiere visto bueno) — **un solo módulo: carpeta `app/grooming/` (código), nombre «Estética» en
toda la UI**:
- `grooming/index` (ex `estilistas/index`): catálogo con el nombre del estilista y rating. Tocar el estilista abre
  `grooming/estilista/[id]`, que es el mismo `ProviderProfile` de paseadores y cuidadores (servicios, reseñas con
  `getGroomerReviews`, CTA «Agendar»). Tocar el servicio va directo a «Agendar».
- `grooming/gestion` con pestañas **Citas · Mis servicios** (lista, editar o pausar con los endpoints que ya existen, y
  «Nuevo servicio» → `grooming/servicio/nuevo`, ex `estilistas/nuevo`). Fuera el botón «Ofrecer Servicios» del catálogo del cliente.
- «Mis citas» se queda solo en Perfil › Mis citas (y en el estado vacío de Agendar).
- Referencias a actualizar: `useExplore.ts:41`, `roleTools.ts:103-104,190-191`, `useGroomingForm.ts:3`. No hay deep links
  del backend a `/estilistas`; se puede dejar `estilistas/index` como `Redirect` durante un release.
Backend: `PATCH /files/{pet_id}` (dueño o estilista con cita) para la ficha, o quitarla de la UI. GET de la ficha sin
crearla. Historial filtrado por estilista cuando no es el dueño. `service_id` y `price` en la cita (migración aditiva).
Horarios que respeten la hora actual y la duración. Notificaciones de cita nueva y de cambio de estado. Estilistas en la búsqueda global.
Arreglos:
- [ ] P1 El servicio nuevo no aparece en el catálogo (`useGroomingForm.ts`: `useMutation` + invalidar `grooming-services`)
- [ ] P1 El estilista no puede ver, editar ni pausar sus servicios (endpoints listos, sin UI). Catálogo sin nombre del estilista
- [ ] P1 Horarios pasados ofrecidos hoy (`grooming.py:329-354`). Ficha de estética imposible de llenar (`historial/[petId].tsx:30-60`)
- [ ] P1 Privacidad: un estilista ve los reportes de otros estilistas en el historial de la mascota (`grooming.py:198-210`)
- [ ] P1 `RoleGuard` en `grooming/gestion` y `estilistas/nuevo`. Invalidar cliente e historial al guardar fotos
- [ ] P2 Fusión de carpetas y nombre único «Estética». Reseña de mis-citas a un hook. Skeleton en agendar. `FormField`. Tokens. Borrar `src/types/grooming.ts` y los exports muertos
