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
