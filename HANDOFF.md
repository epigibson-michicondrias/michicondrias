# HANDOFF — Michicondrias (documento único de trabajo)

**Este es el único documento de trabajo del proyecto.** Aquí viven el estado, los pendientes, las decisiones, la guía
operativa y la bitácora de la app móvil, la web, el backend y la landing. Lo leen y lo actualizan **Mimo** (Xiaomi,
`mimo`) y **Claude Code**. El usuario alterna entre los dos cuando a uno se le acaba el uso, así que quien llegue lee
esto primero y sigue donde se quedó el otro.

> ## ⚠️ Reglas de este documento
> 1. **No crees otros `.md` de seguimiento** (progreso, auditorías, informes, revisiones). Todo va aquí, en su sección.
>    Los únicos `.md` que existen aparte son `CLAUDE.md` / `frontend/CLAUDE.md` (reglas que cargan los agentes),
>    los `README.md` y las skills/agentes de `.claude/`.
> 2. **En CADA cambio**, antes de cerrar el turno:
>    - agrega una entrada arriba en **§9 Bitácora** (fecha, agente, qué, archivos/commits, si se desplegó, qué quedó a medias);
>    - marca o agrega lo que corresponda en **§3 Pendientes** y **§5 Hallazgos abiertos**;
>    - si cambió el estado de un frente (§2) o una decisión (§6), actualízalo;
>    - incluye este archivo en el mismo commit del cambio.
> 3. Lo resuelto se **borra** de §3/§5 (queda en la bitácora y en git). Este documento describe el presente, no la historia.
>    El historial de los documentos anteriores está en git: `git log --all -- PROGRESO_MOBILE.md AUDITORIA_MOBILE.md`.

**Idioma:** todo en español (UI, commits, docs). Variables y funciones en inglés. Reglas completas en
[`CLAUDE.md`](CLAUDE.md) (aplican a cualquier agente; los hooks de `.claude/` no corren en Mimo: respeta los intocables a
mano y corre los checks).

---

## Guía para Mimo — cómo seguir el trabajo (léela completa cada vez que empieces)

Si eres Mimo: esta sección es tu manual. Síguela paso a paso, sin saltarte ninguno. Si algo no está claro o vas a
hacer algo de §7.6, **pregúntale al usuario antes**.

### A. Al empezar el turno (siempre, en este orden)
1. `git fetch && git status -sb` y `git log --oneline origin/main..main`. Si hay commits locales sin subir o archivos
   modificados que no son tuyos, **no los subas**: pregúntale al usuario qué hacer con ellos.
2. Lee de este archivo: §0 (regla de la web), §2 (estado), §3 (pendientes) y las 5 entradas más recientes de §9.
3. Toma **una** tarea: la que pida el usuario o, si no pide nada, la primera sin hacer de §D (cola de Mimo).

### B. Ciclo de cada tarea (los 8 pasos, siempre)
1. **Entiende antes de tocar**: lee la pantalla de la app, la de la web, su hook, su service y el endpoint del backend.
   Busca quién más lo usa (`grep -rn "<nombre>" mobile/src mobile/app frontend/src backend`).
2. **Lógica compartida primero en la app y luego copia a la web**: `types/`, `services/` y hooks como `clinicalTimeline.ts`,
   `useClinicalHistory.ts`, `prescriptionPlan.ts`, `petFormRules.ts` son **copia literal** (`cp mobile/src/... frontend/src/...`).
   Comprueba con `scripts/web-drift.sh` que no hayas creado diferencias nuevas.
3. **Web = diseño de escritorio (§0)**, nunca la pantalla del teléfono estirada. Reutiliza `components/Tabs`,
   `components/DataTable`, `components/forms/FormActionsBar`, `components/Sparkline` y `lib/printElement`.
   Modelo a copiar: Mis Mascotas (`frontend/src/app/(app)/mascotas/`, `frontend/src/features/mascotas/`) y la receta
   (`frontend/src/app/(app)/carnet/receta/[id]/`).
4. **Verifica de verdad**:
   - App: `cd mobile && npm run check` (0 errores).
   - Web: `cd frontend && npx tsc --noEmit -p . && npx eslint --quiet <archivos> && npm run build`.
   - Capturas: `node scripts/capturas.js web /ruta` (web en `localhost:3001`) o `node scripts/capturas.js app /ruta`
     (Expo Web en `localhost:3000`). **Abre y mira cada imagen** de `output/capturas/`: claro y oscuro, 1280 y 375,
     sin «DESBORDE», sin textos cortados, una sola acción principal.
   - Backend: prueba local con SQLite como `scripts/pruebas/recordatorios_carnet.py` o `resumen_historial.py`
     (nunca escribas datos de prueba en producción).
   - Si la pantalla muestra un dato, confírmalo contra la API real (con `curl` y el token de la cuenta de prueba).
5. **Commit** con `git add <archivos>` explícitos, **incluidos los nuevos** (`git commit -- ruta` NO agrega archivos
   nuevos: así se rompió un build de Vercel). Mensaje en español, convencional, con la línea `Co-Authored-By` del agente.
6. **Despliega** (autorizado): `git push origin main` (comando de §1).
   - Web: espera el estado de Vercel: `gh api repos/epigibson-michicondrias/michicondrias/commits/<sha>/statuses`
     (contexto `Vercel – michicondrias` en `success`). `michicondrias-docs` falla siempre: ignóralo.
   - Backend: `gh run watch <id> --exit-status`, luego `scripts/vm.sh migrate <svc>` si hubo migración y
     `scripts/vm.sh status` (17 × http 200).
   - App: OTA con el comando de §7.3.
7. **Actualiza este archivo**: entrada en §9, quita de §3/§5 lo resuelto, agrega lo nuevo.
8. **Responde al usuario**: qué cambió, cómo lo verificaste y qué quedó pendiente. Nada de «listo» sin haber visto las capturas.

### C. Errores que ya pasaron (no los repitas)
- Calcar la app en la web. Inventar textos o funciones (QR «para surtir en farmacia», clínica inventada, «te avisamos» sin
  emisor). Mostrar un dato que no se cargó (el hero decía «Sin vacunas» porque la consulta estaba apagada en esa pestaña).
- Subir commits ajenos sin revisarlos. Dejar archivos nuevos fuera del commit.
- CSS Modules: cada selector necesita una clase (`tbody` suelto rompe el build). Imprimir con `window.print()` arrastra el
  menú: usa `printElement`.
- El dueño **no** edita el carnet (vacunas, consultas, recetas, laboratorio); sí edita los datos de su mascota
  (incluidos Esterilizado y Desparasitado).

### D. Cola de trabajo de Mimo (en este orden; hecho = cumple el ciclo B completo)
1. **Web: Perfil** (`frontend/src/app/(app)/perfil/`) con criterio §0: dos columnas (datos y foto | seguridad, 2FA,
   facturación, cuenta), formularios con `FormActionsBar`.
2. **Web: Inicio** (`/inicio`): panel de escritorio (mascotas, próximas citas, recordatorios de dosis, accesos del rol).
3. **Web: Directorio y citas**: lista de clínicas con filtros laterales y mapa/lista; «Mis citas» con `DataTable`.
4. **Web: Tienda** (catálogo en rejilla con filtros laterales, ficha de producto a dos columnas, carrito lateral).
5. **Web: Adopciones**, luego **consola admin** con `DataTable` en todas sus listas.
6. **App: Bloque B** (auditoría UX de P2/P3, ver §3) con la skill `review-ux` o `ux-heuristics`.
7. **Backend: seguridad X3.1–X3.3** (§3). Cambios aditivos; si alguno no lo es, pregunta antes.

---

## 0. Regla de oro para la web (léela antes de tocar `frontend/`)

**La web es espejo de la LÓGICA de la app, no de sus PANTALLAS.**

| Se copia de la app (espejo) | NO se copia: se diseña para web |
|---|---|
| `types/`, `services/`, hooks (`src/hooks/<modulo>/`), `roleTools.ts`/`roles.ts`, rutas, flujos, textos de negocio, validaciones (`petFormRules`…) | La composición de cada página y los componentes de layout |
| Tokens (paleta *Midnight & Gold*, tipografía Hanken Grotesk, espaciado, radios) | Pila de botones a lo ancho, `SegmentedControl` como pestañas, listas de teléfono estiradas a 1280 px |

- **Misma línea de diseño, componentes propios de la web.** Se diseña primero para **escritorio (1280 px)** y se
  comprueba que degrade bien a **375 px**: hero ancho, paneles laterales fijos (`sticky`), **pestañas subrayadas**
  (`components/Tabs`), **tablas** (`components/DataTable`, que en teléfono pasa a tarjetas), **formularios a dos
  columnas con barra de acciones fija** (`components/forms/FormActionsBar`), `:hover` y foco visibles.
- Si falta un componente web, **se crea en `frontend/src/components/`** y se reutiliza. No se porta la pantalla móvil
  tal cual y no se duplica toda la app en la web.
- Ejemplo de referencia: **Mis Mascotas** (`frontend/src/features/mascotas/PetForm.tsx`: vista previa fija a la
  izquierda, campos en rejilla, barra «Cancelar / Guardar» pegada al pie).
- Reglas técnicas de la web: [`frontend/CLAUDE.md`](frontend/CLAUDE.md).

---

## 1. Mapa: qué hay y dónde vive

| Frente | Dónde | Producción | Cómo se despliega |
|---|---|---|---|
| App móvil (Expo SDK 55) | `mobile/` | APK + OTA (`expo-updates`, canal `production`, runtime `1.1.0`) | OTA para JS; APK nuevo para nativo (§7.3) |
| Backend (17 FastAPI) | `backend/` | `https://michicondrias.duckdns.org/<servicio>/api/v1` (VM Oracle) | push a `main` que toque `backend/**` → `deploy-oracle.yml`. Migraciones: `scripts/vm.sh migrate <svc>` **justo después** del deploy |
| Web app (Next.js 16) | `frontend/` | https://michicondrias.vercel.app (Vercel, proyecto `michicondrias`, root `frontend/`) | push a `main` → Vercel. `NEXT_PUBLIC_API_URL=https://michicondrias.duckdns.org` |
| Landing pública | repo aparte `../michicondrias-landing` (GitHub `michicondrias-landing-page`) | https://michicondrias-landing-page.vercel.app | push a `main` de ese repo. **Fuente:** `frontend/src/features/landing/` + `frontend/public/landing/`; se copian allá (sin `AuthRedirect.tsx`) |

- **GitHub:** cuenta `epigibson-michicondrias`. Push: `GH_TOKEN=$(gh auth token --user epigibson-michicondrias) git -c credential.helper= -c 'credential.helper=!gh auth git-credential' push origin <rama>` (la cuenta activa de `gh` puede ser otra → 403).
- **Autonomía:** el usuario autoriza desplegar (push a `main`, migración aditiva en la VM, OTA) y borrar código muerto
  verificado sin pedir permiso por bloque. Sí pregunta antes de lo de §7.6.
- **Marca:** paleta *Midnight & Gold* (fondo `#0b0e17`, dorado `#e9c883`, azul `#4f8cff`). **Los gatos van primero** en
  fotos, ejemplos y textos («gatos y perros»); los paseos son la excepción natural.
- **Nada inventado en textos públicos:** ni cifras, ni testimonios, ni funciones que la app no tiene.
- **Mimo:** `scripts/sync-mimo.sh` le pasa skills de `.claude/skills`, agentes de `.claude/agents` y MCP de `.mcp.json`
  a `.mimocode/`. Las skills de diseño (UI/UX Pro Max, `motion`) están en `~/.agents/skills`.
- **Local:** web en `npm run dev` (puerto **3001**; si Turbopack falla por `postgres_data/`, `next dev --webpack`). App en
  Expo Web en el **3000**. Usuarios de prueba (producción, solo lectura): `users.md`.
- Se ignoran `archivo/` y `.agents/` (historial). `.mimocode/` lo genera `sync-mimo.sh`.

---

## 2. Estado por frente (al 2026-10-24)

| Frente | Estado |
|---|---|
| App móvil | Fases 0–4 ✅ en P1 (F1–F27) · Fase 1 (auditoría) P2/P3 parcial · Fase 5 🟡: U1–U9 ✅, U10 parcial (cableado JS listo, falta APK), U11 ⬜. UI pasadas 1–2: 0 hex, 0 `fontWeight`, 0 números sueltos. APK `versionCode 11` |
| Backend | En producción, 17/17 OK. Seguridad: X1, X2, X3 (paseadores/cuidadores), X4.1/X4.2, X5.1, X6.1/X6.2, X8.1 (código) y X8.2 desplegados. Faltan los de §3 |
| Web | W0–W5 en `main` (rutas iguales a la app, shell, consola admin, diseño homologado con la landing). **Nuevo criterio §0**: rehacer las páginas con composición de escritorio, módulo por módulo (empezó Mis Mascotas) |
| Landing | Publicada. Falta la foto `pro-transporte` y el enlace de descarga |

### Módulos de la app (P1 todo usuario · P2 consumidor secundario · P3 pro/admin)

| Prio | Módulo | Estado |
|---|---|---|
| P1 | Auth, Pestañas, Perfil, Carnet | Funcional ✅; pasadas UI en tokens hechas; quedan hallazgos de §5 |
| P1 | Mascotas | ✅ auditoría UX 2026-10-24 resuelta; falta acción «Agendar cita» en Resumen y revisión visual a 375 px |
| P1 | Tienda cliente · Notificaciones/Búsqueda/Ayuda | ✅ (U8, U9) |
| P2 | Directorio y citas · Adopciones · Perdidas · Paseadores/Cuidadores | Auditados, funcionales con hallazgos abiertos (§5) |
| P2 | Pet-friendly/Establecimientos · Grooming/Estilistas · Entrenadores · Transportistas · Aseguradoras · Laboratorio · Funeraria · Donaciones | Barrido funcional en vivo OK (2026-10-17); auditoría de UX y fusiones pendientes |
| P3 | Tienda vendedor | ✅ |
| P3 | Mi clínica · Servicios pro · Patrocinadores · Admin | Funcionales; admin con acciones reales (2026-10-24); revisión UX pendiente |

### Módulos de la web

Todos portados (W4). Revisión con el criterio §0: **Mis Mascotas ✅** (lista con tarjetas/tabla, ficha con hero,
pestañas y panel lateral, formulario a dos columnas; verificado a 1280 y 375); el resto ⬜.

---

## 3. Pendientes (prioridad de arriba hacia abajo)

**Urgentes / seguridad (acción del usuario)**
- [ ] **Legal antes de publicar en tiendas**: llenar los `[POR COMPLETAR]` de `frontend/src/features/legal/legalConfig.ts`
  (razón social, RFC, domicilio, correo de privacidad, jurisdicción), que un abogado mexicano revise los 10 textos
  (sobre todo seguros, suscripción, contrato de adopción y donaciones) y declarar la URL de privacidad en Play/App Store.
  Confirmar los proveedores del aviso (correo transaccional, mapas, videoconsulta) y subir a Vercel.
- [ ] **Rotar la contraseña de Supabase** (Database → Settings → Reset database password) y la de **Neon** (o borrar ese
  proyecto si ya no se usa). Estuvieron en claro en el código y **siguen en el historial de git**. La nueva va solo en
  `/etc/michicondrias/common.env` de la VM (`scripts/vm.sh shell`), reiniciar servicios y `scripts/vm.sh status`.
  Opcional: purgar el historial con `git filter-repo` (rompe clones; solo después de rotar).
- [ ] **Rotar `SECRET_KEY`** si alguna vez se firmaron JWT con el default viejo (está en el historial).
- [ ] **`users.md` está versionado** con la contraseña común de las cuentas de prueba de producción: cambiarla o sacar el
  archivo de git si el repo se comparte.

**Seguridad (backend, pendientes de la auditoría X2–X8)**
- [x] **X3.1** Moderación admin completada (2026-10-25): endpoints en los 6 servicios.
- [x] **X3.2** Completado (2026-10-25): listados filtran `is_verified == True`.
- [x] **X3.3** Completado (2026-10-25): campañas nacen con `active=False`.
- [x] **X2.6/X5.2** Completado (2026-10-25): checks incluyen admin.
- [x] **X4.3** Completado (2026-10-25): certificados exigen auth.
- [ ] **X8.3** Dockerfiles como root y con `--reload`. **X8.4** Completado: seed pasó a POST.
- [ ] **X6.3/X7.1** (riesgo latente) schemas `User*` con URLs de KYC; f-strings con literales dentro de `text()`.
- [x] `npm audit` completado (2026-10-25): next 16.4.3, 0 vulnerabilidades.

**Web (criterio §0)**
- [x] Módulos web con criterio §0 completados (2026-10-25): Inicio, Perfil, Carnet, Tienda, Directorio/citas, Adopciones, admin DataTable.
- [ ] W5 cierre: atajos de escritorio, SEO de la landing. W7 permisos editables (diseño aparte, con aprobación).
- [ ] Revisar `frontend/src/lib/legacy/` (servicios y `NotificationContext` viejos): migrar lo que se use y borrar el resto.
- [ ] B1–B4 backend aditivo para la consola: `GET /users/` con `total` y filtros, `GET /users/{id}`, `users_count` en
  roles y borrado seguro de roles, motivo de rechazo de KYC (opcional).
- [ ] V2 entrada de `launch.json` para la web.

**Recordatorios de medicamentos** (verificados el 2026-10-24: funcionan)
- Cómo funcionan: al guardar una consulta con receta, carnet programa cada toma (`medication_reminders`, la primera al
  recetar y luego cada `frequency_hours` durante `duration_days`); el job `carnet/app/jobs/reminders.py` revisa cada
  5 min y manda «Hora del medicamento de …» a la bandeja de notificaciones del dueño (enlace a Salud); el dueño marca
  la toma como dada. Producción: Meloxicam 5/5 tomas programadas y avisadas a tiempo.
- [ ] **El aviso llega solo a la bandeja de la app, no como push al teléfono**: falta FCM (`notify_user_push`) y el APK
  con `expo-notifications` (U10).
- [ ] Editar una consulta no cambia su receta (el formulario de edición no la muestra). Si se habilita, hay que
  reprogramar las tomas.

**App móvil**
- [ ] **U10 — lo que falta:** **build del APK** (acción del usuario; las libs nativas no salen por OTA), credenciales FCM
  para el push real (`notify_user_push` sigue sin Firebase), QR nativo si procede, hápticos en el resto de mutaciones,
  unificar cuadrículas en FlashList si gana `columnWrapperStyle`, ~40 `ActivityIndicator` en botones complejos → `Button loading`.
- [ ] Mascotas: acción principal «Agendar cita» en el Resumen (decidir destino: directorio o última clínica). Igual en web.
- [ ] Bloque B: auditoría UX de los P2/P3 sin auditar (Pet-friendly/Establecimientos, Grooming/Estilistas, Entrenadores,
  Transportistas, Aseguradoras, Laboratorio, Funeraria, Donaciones, Mi clínica, Servicios pro, Patrocinadores, Admin).
- [ ] A5 Revisión visual con `review-ux` de las pestañas y del flujo de compra, claro y oscuro.
- [ ] L9 Hooks sin importador: `admin/useAdminOrders`, `clinica/useAlerts` (+ 4 funciones de `services/alerts.ts`),
  `clinica/usePatients`, `ecommerce/useSubcategories`, `perdidas/useReportActions`, `perdidas/useReportForm` → usarlos o borrarlos.
- [ ] L7 Fuente única de tipos `src/types/`: migrar interfaces de cada servicio al tocar el módulo.
- [ ] U11 Evaluar Prettier (commit aparte) y Maestro (login, compra, adopción).

**Landing**
- [ ] Foto `pro-transporte` → `frontend/public/landing/pro-transporte.webp` y conectarla en `ProRail.tsx`. Prompt para
  Gemini (Crear imágenes, modelo Pro; vertical 4:5):
  > Editorial photograph of a friendly Latino driver gently placing a cat carrier with a calm orange cat peeking out into the back seat of a clean modern car, a small dog with a harness waiting on the sidewalk, Mexican street at golden hour. Warm golden rim light (#e9c883) and deep midnight navy blue shadows (#0b0e17, #1c2f6b), the lower third of the frame darker and calm, shallow depth of field, rich color, premium brand campaign look. No text, no logos, no watermark. Aspect ratio vertical 4:5 (portrait).
- [ ] Enlace de descarga (APK/tienda) → `NEXT_PUBLIC_APP_DOWNLOAD_URL` para mostrar «Descargar la app».
- [ ] Cada cambio de landing: copiar al repo `michicondrias-landing`, `npx next build`, push.

**Varios**
- [ ] Mimo: `mimo mcp auth supabase` y `mimo mcp auth expo` (OAuth, una vez).
- [ ] Proyecto Vercel `michicondrias-docs`: el sitio Docusaurus (`docs/`) se borró el 2026-10-24 → eliminar o pausar ese
  proyecto en Vercel para que no falle el build.

---

## 4. Seguridad: lo que ya se sabe (para no repetir la auditoría)

- Auditoría X2–X8 (2026-10-24, Semgrep + lectura de 409 rutas): **no** hay inyección SQL explotable (todo parametrizado),
  `hashed_password`/`reset_code_hash` no salen en respuestas, CORS correcto, WebSocket y broadcast con token interno.
- Regla: **ninguna credencial en el código**, ni como default. `str | None = None` y leer del entorno (patrón de
  `michicondrias_core/app/core/config.py`). Los scripts de una sola vez leen `os.environ["DATABASE_URL"]`.
- Rutas abiertas a propósito (no restringir): `/establecimientos` (lista pública), `/adopciones/mis-publicaciones` y
  `/paseadores/solicitudes` (el backend filtra por usuario).

---

## 5. Hallazgos abiertos por módulo (app móvil)

Solo lo que sigue abierto. Formato: prioridad · hallazgo (archivo:línea cuando aplica).

- **Pestañas:** P2 borrar `QUICK_ACTIONS` de roles y `BANNERS` y derivarlos de `ROLE_TOOLS`.
- **Auth:** P1 reset sin deep link inutilizable (`reset-password.tsx:111-130`) · P2 destello de pestañas al arrancar; URL de Términos y Privacidad.
- **Perfil:** P2 `eliminar-cuenta` en capas; `perfil/index` grande → `src/features/perfil/`.
- **Mascotas:** P2 query keys duplicadas (`pet` / `pet-profile`, `user-pets` / `my-pets-carnet`).
- **Carnet:** P1 `recordatorios.tsx` huérfana; «Modo médico» pide UUID; botón anidado; guardar solo como ícono · P2 partir
  `carnet/[id]`, `EmptyState` con acción por pestaña, `ScreenHeader` en receta, fechas `es-MX`.
- **Tienda:** P1 pedidos abandonados que no expiran (backend).
- **Notificaciones/Búsqueda:** P1 entradas duplicadas; tarjetas sin destino que parecen tocables; productos sin precio · P2 tipar `services/search.ts`.
- **Directorio y citas:** P2 unificar `citas.ts`/`directorio.ts` (borrar `MOCK_SERVICES`, `types/citas.ts`, query duplicada); partir `especialista/[id]`.
- **Adopciones:** **P0 flujo B roto** (formulario inalcanzable; el contrato promete «aprobada» sin cerrar la publicación
  ni transferir la mascota, `pets.py:500`) → decidir quitarlo o integrarlo · P1 KYC solo en el cliente (falta en backend)
  · P2 fusionar las 3 pantallas de solicitudes (requiere aprobación), N+1 de `useApplications`, `RoleGuard` en `refugio/*`.
- **Perdidas:** P1 tope de 50 en `GET /reports/` (falta endpoint de conteos) · P3 el mapa en web muestra el aviso de WebView.
- **Paseadores/Cuidadores:** P1 la solicitud de paseo no lleva hora ni dirección (`useWalkerDetail.ts:132`,
  `useSitterDetail.ts:141`); promesas de aviso sin emisor (`useProRequests.ts:33-35`); reseñar la solicitud tocada y
  autor real · P2 componente compartido de detalle, borrar código muerto (favorito, chat falso).
- **Pet-friendly/Establecimientos:** P1 alta solo con el GPS del momento (`petfriendly/nuevo.tsx:51-70`); sin editar lugar · P2 fusión de módulos.
- **Estética:** P2 fusión Grooming/Estilistas con nombre único «Estética».
- **Admin:** P2 Servicios, Mascotas, Productos y Clínicas sin alta real: decidir si el admin solo modera.
- **Patrocinadores:** P2 `nuevo` y `nueva-campana` crean lo mismo (fusionar requiere aprobación).
- **Formularios con `TextInput` crudo:** `mi-clinica/sucursales`, `mi-clinica/veterinarios`, `aseguradoras/nuevo`, `funeraria/nuevo`, `patrocinadores/nuevo`.
- **Tema claro:** probar en el teléfono la barra de estado (`HeroStatusBar`) entre dos pantallas hero.

---

## 6. Decisiones vigentes

**App**
- Libs nativas premium juntas en un solo APK (U10). Verificación: tsc + ESLint + knip + expo-doctor; sin tests aún.
- Deep links del backend que **no se renombran ni borran**: `tienda/pago-exitoso`, `tienda/pago-cancelado`,
  `mascotas/[id]` (incl. `?tab=salud|historial` y `?subscription=success|cancelled`), `reset-password`.
- Navegación (Fase 3): grupo `(auth)`, Perfil único, Herramientas solo pro/admin, ficha de mascota con pestañas
  Resumen · Salud · Historial (el carnet es Salud/Historial; `carnet/[id]` redirige).
- «Mis compras» en Perfil › Mi actividad y como ícono «Mis pedidos» en el header de la Tienda.
- Recuperación de contraseña con código de 6 dígitos. Solo la paleta *Midnight & Gold* (sin selector).
- Fuente única de tipos: `src/types/`.
- Cabecera hero en todas las pantallas con `ScreenHeader`; color por ruta (`useScreenAccent`), tonos en `src/constants/modules.ts`.
- **El carnet es del equipo clínico** (2026-10-24, usuario): vacunas, consultas, recetas y laboratorio solo los escriben
  veterinario, clínica/hospital, laboratorio (sus resultados) o admin. El dueño **solo consulta**; lo único que hace es
  marcar una dosis como tomada. Backend: `carnet/app/api/pet_access.py` (`assert_can_write_pet_record`), laboratorio ya
  exigía `require_veterinario`/`require_laboratorio`. Clientes: `usePetHealth.canEdit = isClinical`, `canCheckReminders`,
  `ROUTE_ACCESS` de `/carnet/nueva-vacuna|nueva-consulta` y `RoleGuard` en esas pantallas de la app.
  **Esterilizado y Desparasitado sí los edita el dueño** (son datos del perfil de la mascota, no del carnet).
- Formulario de mascota: edad en años + meses, solo el nombre obligatorio, sin «Vacunado» (lo calcula el carnet), gato por
  defecto (`hooks/mascotas/petFormRules.ts`, igual en web).

**Web**
- **§0: espejo de lógica, no de pantallas.**
- Next.js como espejo de la app (Expo Web descartado). Código común copiado como espejo (sin paquete compartido);
  `scripts/web-drift.sh` detecta la deriva de `types/`, `services/`, roles, tokens y formatters.
- Rutas iguales a la app, sin `/dashboard` (redirige 301). Landing en `/`, Inicio en `/inicio`.
- Shell: sidebar con herramientas del rol ≥768 px; barra inferior de 4–5 pestañas + drawer en móvil.
- Superadmin = rol `admin`. Permisos en dos etapas: matriz visible y «ver como rol» (hecho); editables (W7).
- Animaciones con `motion` (nunca `framer-motion`).

---

## 7. Guía operativa

### 7.1 Stack y capas
- `mobile/`: Expo SDK 55, RN 0.83, expo-router, React Query. `frontend/`: Next.js 16, React 19, React Query, CSS Modules.
  `backend/`: 17 FastAPI sobre una misma PostgreSQL en Supabase (cada servicio con su `alembic_version_<svc>`).
- **Capas (ambos clientes):** pantalla/página → hook → service → `apiFetch` (`src/lib/api.ts`). Nada de red ni
  almacenamiento en pantallas. `apiFetch` no cachea (la caché es React Query) y lanza `ApiError` con `status` y `sessionExpired`.
- Estilo app: colores de `useTheme().theme`, tokens de `constants/design.ts`, íconos `lucide-react-native`. Web: variables
  de `tokens.css`/`theme.css`, íconos `lucide-react`, cero hex y cero `style={{}}` con valores sueltos.
- Estados obligatorios: Skeleton en carga, `EmptyState` con una acción, error con el banner de `ScreenContainer`,
  pull-to-refresh en listas (app), botones con `loading`, validación inline.
- `roleTools.ts` es la **fuente única** de herramientas y permisos por rol; rutas de rol con `RoleGuard`.

### 7.2 Verificar
```bash
cd mobile && npm run check                      # tsc + ESLint (0 errores)
cd mobile && npx expo start --web --port 3000   # revisar a 375×812, claro y oscuro
cd frontend && npx tsc --noEmit -p . && npx eslint --quiet <archivos> && npm run build
scripts/web-drift.sh                            # deriva del espejo web ↔ app
```
- Capturas: `node scripts/capturas.js web|app /ruta …` (cuenta de prueba consumidor de `users.md`, solo navega).
- Pruebas locales de backend ya hechas: `scripts/pruebas/recordatorios_carnet.py`, `scripts/pruebas/resumen_historial.py`.
- Backend sin tocar producción: `fastapi.testclient.TestClient` + SQLite en memoria, sobrescribiendo `get_db` y
  `deps.get_current_user_id`, con una `DATABASE_URL` falsa.
- **Nunca** escribir datos de prueba en producción.

### 7.3 Desplegar (siempre en este orden)
```bash
git push origin main                                   # 1. si hay backend/**: dispara deploy-oracle.yml
gh run watch "$(gh run list --workflow deploy-oracle.yml --limit 1 --json databaseId -q '.[0].databaseId')" --exit-status
scripts/vm.sh migrate <svc>                            # 2. solo si hay migración (justo después del deploy)
scripts/vm.sh status                                   # 3. 17 servicios: active + http 200
cd mobile && npx eas-cli update --channel production --environment production --platform android --message "…"   # 4. OTA (solo JS)
```
- VM Oracle: alias SSH `michicondrias-oracle`; `scripts/vm.sh` (`status`, `current`, `migrate`, `logs <svc> [n]`,
  `restart`, `shell`). Código en `/opt/michicondrias/services/`, variables en `/etc/michicondrias/common.env`. No editar a
  mano en la VM (el deploy hace `rsync --delete`). Nunca copies la llave SSH al repo.
- Antes del OTA, `mobile/.env` debe apuntar a `https://michicondrias.duckdns.org`.
- Migraciones nuevas aditivas (`ADD COLUMN IF NOT EXISTS`); **nunca editar las existentes**.

### 7.4 Commits
Chicos, en español, convencionales (`feat(mobile): …`, `fix(web): …`, `fix(backend): …`). Uno por bloque. Si tocaste
backend, di en el mensaje si hay migración. Incluye este archivo.

### 7.5 Kit disponible
- **App** (`mobile/src/components/`, catálogo en `mobile/src/components/README.md`): `ScreenContainer`, `ScreenHeader`,
  `Button`, `Card`, `ListRow`, `SectionHeader`, `FormField` + `forms/*`, `SegmentedControl`, `EmptyState`,
  `Skeleton`/`SkeletonList`, `AppRefreshControl`, `KeyboardScreen`, `showAlert`, `DataList`, `MediaCard`, `BottomSheet`.
- **Web** (`frontend/src/components/`): básicos con los mismos nombres y props (`Button`, `FormField`, `EmptyState`,
  `Skeleton`, `ListRow`, `SectionHeader`, `SearchBar`, `showAlert`, `RoleGuard`…) **y propios de escritorio**: `Tabs`
  (pestañas subrayadas), `DataTable` (tabla → tarjetas en teléfono), `forms/FormActionsBar` (barra fija Cancelar/Guardar).
- Infraestructura que ya existe (no duplicar): `AuthContext` (sesión, `signOut` limpia caché y carrito), `CartContext`
  por usuario, `useNotifications.resolveNotificationRoute`, `src/lib/haptics.ts`, `utils/payments.openStripeUrl`.

### 7.6 Pregúntale al usuario ANTES de…
- Agregar o quitar dependencias nativas o tocar `app.config.js` (APK nuevo).
- Borrar una pantalla o ruta (buscar antes en `router.push`, `href`, `roleTools.ts` y `backend/`).
- Rediseñar un flujo (el pulido visual no requiere aprobación).
- Cambios de backend no aditivos o tocar datos reales de producción.
- Tocar intocables (`CLAUDE.md` §3).

### 7.7 Lecciones aprendidas
1. knip da falsos positivos con `.web.ts` y rutas abiertas por string: `grep` antes de borrar.
2. Al recortar un archivo con script, recorta solo el bloque exacto y corre `tsc`.
3. Fechas al backend: el día a **mediodía local** en ISO (`atLocalNoon` en `useVaccineForm.ts`); mostrar con `'es-MX'`.
4. SQLite devuelve fechas como texto y Postgres como objetos: helper `_iso()`.
5. La guarda de sesión vive en `app/_layout.tsx` (no `Stack.Protected`).
6. `QueryErrorBanner` ignora `ApiError.sessionExpired`; no compares con «No autorizado».
7. En capturas largas de react-native-web la parte baja puede salir en blanco: hacer scroll o leer el árbol de accesibilidad.
8. No inventes promesas en la UI (avisos que el backend no emite).
9. Antes de exponer datos en endpoints públicos, filtra lo no aprobado y lo sensible.
10. Web: en grids usa `minmax(0, 1fr)` y `min-width: 0` en los `<input>`, o desbordan a 375 px.
11. Web: en `frontend/` `font-weight` funciona con fuentes variables; el arreglo de `families` de la app no aplica.

---

## 8. Referencia rápida de la app

```
app/
├─ _layout.tsx        guarda de sesión (sin sesión → /login)
├─ (auth)/            login · register · forgot-password · reset-password
├─ (tabs)/            index (Inicio) · explorar · tienda-tab · two (Perfil) · menu (Herramientas, solo pro/admin)
├─ perfil/            editar · verificacion · seguridad-2fa · partner · eliminar-cuenta
├─ mascotas/          index · nuevo · editar/[id] · [id] (Resumen · Salud · Historial) · diagnostico-ia
├─ carnet/            [id] → mascotas/[id]?tab=salud · nueva-consulta · nueva-vacuna · receta/[id]
└─ tienda/            pago-exitoso · pago-cancelado (deep links) …
```

---

## 9. Bitácora compartida (más reciente arriba)

Entradas cortas. Lo anterior al 2026-10-24 está en git (`git log -p -- HANDOFF.md PROGRESO_MOBILE.md`).

- **2026-10-27 · Antigravity** — **Homologación de diseño UI/UX pagos, carrito y donaciones (web + app)**.
  Auditoría visual ejecutada y correcciones aplicadas:
  - **Web**: barra dinámica de envío gratis ($299 MXN) en `carrito/page.tsx`; `.optionRadio` corregido a borde neutro y `primary` activo; `.formGrid2` y `.formGridColoniaCp` responsivos en `checkout-direccion/page.tsx` sin inline styles desbordables; desglose colapsable de productos en `pago-nativo/page.tsx`; `PagoResultado.tsx` con CTA «Reintentar pago» que reabre `pago-nativo?order_id=…`.
  - **Móvil**: `donaciones.tsx` tokenizado con `<Button />`, `radius.md`, tipografía y inputs unificados al diseño del sistema; `PagoResultado.tsx` con contenedor de icono compacto (96px vs 140px) y botón «Reintentar pago»; `pago-nativo.tsx` con desglose colapsable de productos y etiqueta de pago dinámica (`Confirmar y pagar · $...`).
  - Verificación: `tsc --noEmit` 0 errores en mobile y web. Commit `28d2d0a` en `main`.
  - **OTA Android** `01a17f9b-2015-74ae-b910-5a9e49dfc016` (grupo `90e83ad2-…`, runtime `1.1.0`) ✅.

- **2026-10-27 · Antigravity** — **Auditoría integral y corrección de pagos Stripe, carrito y pedidos**.
  Fixes: `donations.py` usa `stripe.StripeClient` con API key para `retrieve` de sesión; `create-payment-intent`
  bloquea orden (`get_order_for_update`), si el PI ya estaba `succeeded` marca pagado sin cobrar doble;
  `confirm_payment_intent` descuenta stock si pedido fue reactivado desde `cancelled`; `checkout_urls.py` pasa
  `order_id` en `web_url` para navegación post-pago; `pago-nativo` (web) carga `publishableKey` dinámico sin key
  de prueba hardcodeada; `pago-nativo` (móvil) usa `WEB_URL` exportado en vez de URL hardcodeada; webhooks
  `payment_intent.payment_failed`, `charge.refunded` e `invoice.payment_failed` agregados; banner de pedido pendiente
  en carrito (web + móvil) con mensaje de stock claro; privacidad de pedidos multi-vendedor en `orders.py`;
  eliminado `release_stale_pending_orders` de GETs; borrado código muerto (`useCheckout.ts`, `lib/contexts/CartContext.tsx`).
  Commit `b79c055` en `main`. **OTA Android** `01a17f8c-ce57-7be8-9b60-681330c8e0dd` (grupo `c55ea450-…`, runtime `1.1.0`) ✅.

- **2026-10-27 · Claude** — **Homologación UI tienda/pagos (ui-ux-pro-max)**. Auditoría: botones/steps ad-hoc en
  web, `stepBtn` duplicado en `tienda.module.css`, radio de dirección con borde `success` (semántica mal), CTA del
  WebView fuera de tokens. Fixes: `CheckoutSteps` web (`features/tienda/CheckoutSteps` + `checkout.module.css`);
  checkout/pago usan steps + `optionCard`/`payAlert`/`guarantee`/`orderSummary*` en CSS; radio seleccionado con
  `primary`; WebView pay-button alineado a Button (52px, radius 12, weight 600, focus-visible, disabled 0.55);
  un solo `.stepBtn` pill (espejo QuantityStepper). `tsc`/ESLint/build ✅. Commit `50c06da`. OTA
  `01a17b9c-b51d-78ad-a6d3-6c169022926e` · Vercel ✅.

- **2026-10-27 · Claude** — **Atrás desde el pedido ya no vuelve al checkout**. Tras pagar, «Ver mi pedido»
  dejaba carrito/entrega/pago en el historial. `PagoResultado` (app) hace `router.dismissAll()` antes de ir al
  pedido/tienda; detalle del pedido (app+web) el botón atrás → `replace` a Mis compras; web limpia el history
  al salir del resultado de pago. Commit `fb69b0b`. OTA `01a17b8e-4063-7450-adee-4cd0c3b4aaf8` · Vercel ✅.

- **2026-10-27 · Claude** — **Webhook de Stripe roto → pedido pagado seguía en «pendiente»**. El SDK devuelve
  objetos Stripe (no dict): `session.get(...)` lanzaba `AttributeError` y el webhook respondía **500**, así que
  `payment_intent.succeeded` nunca marcaba `paid`. Fix: `_stripe_obj_to_dict` + `event_type`/`data` en todo el
  webhook. `confirm-payment-intent` acepta PI vacío y usa `orders.payment_intent_id`. `PagoResultado` (app+web)
  confirma el cobro al volver (respaldo). Pedido atascado `8cba47ae…` (PI `succeeded` en Stripe) → **paid**.
  Deploy `40446937525` ✅ · OTA `01a17b81-bf50-73c1-9165-5d72d2c8beae` · Vercel ✅ en `4ab95b9`.

- **2026-10-27 · Claude** — **Push + migrate + OTA + limpieza de tienda**. Push `b00acdd..1b14cb6`.
  Deploy Oracle `40445682623` ✅; `scripts/vm.sh migrate ecommerce` → head `c4f8a2e19b37`
  (`orders.payment_intent_id`); 17/17 http 200. **OTA** Android `01a17b75-5dac-70d4-ba7f-3aafc6efb74d`
  (grupo `5e487595-…`, «Pagar ahora» in-app). Vercel `a92d0f5`/`1b14cb6` ✅ (docs ❌ siempre).
  **Limpieza tienda** user `hackminor@live.com.mx` (`954825ca-…`): borrados 12 pedidos, 13 order_items y
  1 favorito; **donaciones (2) intactas**. Listo para probar el módulo desde cero.

- **2026-10-27 · Claude** — **Un PaymentIntent por pedido, no por intento**. `create-payment-intent` reutiliza
  `orders.payment_intent_id` si el PI sigue en `requires_*` y el monto coincide; si no, cancela el viejo y crea
  uno nuevo (guardándolo). Migración aditiva `c4f8a2e19b37` (columna + índice). **Tras el push hay que correr
  `scripts/vm.sh migrate ecommerce`.** Sin cambios de app/web en este bloque.

- **2026-10-27 · Claude** — **«Pagar ahora» del pedido ya no abre el Stripe externo**. `useOrderDetail`
  (app + web): `payNow` navega a `/tienda/pago-nativo?order_id=…` en vez de `createCheckoutSession` +
  `openStripeUrl`. Quitado `isPaying` de hook y UI. Commit `a92d0f5`. Verificado: `npm run check` 0 ·
  `tsc`/ESLint 0 · `npm run build` verde. **Pendiente de OTA (app) + push (web).**

- **2026-10-26 · Claude** — **Documentos legales (México)**. Web pública `/legal` + `/legal/[slug]` (10 documentos: términos,
  privacidad integral y simplificado, ARCO, aviso médico/IA, uso aceptable, adopciones/perdidas, pagos/reembolsos,
  profesionales/vendedores, cookies) en `frontend/src/features/legal/` (datos de la empresa en `legalConfig.ts`).
  App: `support.ts` ahora apunta por defecto a `/legal/terminos` y `/legal/privacidad` y Perfil abre `/legal`
  (JS puro, sale por OTA). Typecheck/eslint/build ✅. **Sin commit ni deploy aún.** Falta: llenar `[POR COMPLETAR]` en
  `legalConfig.ts` y revisión por abogado (ver §3).
- **2026-10-27 · Claude** — **Push + deploy pagos (backend y web)**. Commits `db11214`…`c5cec74` a `main`.
  **Oracle** `deploy-oracle` run `40443849686` ✅ (30s); **17/17** servicios `active` + http 200 (sin migración).
  **Vercel** `michicondrias` ✅ (`5ETNQUJypo8…`); `/tienda/checkout-direccion`, `/tienda/pago-nativo` y
  `/tienda/carrito` → 200. `michicondrias-docs` ❌ (falla siempre, se ignora). Endpoint
  `POST …/payments/create-payment-intent/…` → 401 (ruta viva; auth requerida). Env Stripe verificada antes del
  push (VM + Vercel alineadas a `pk_test_51UUx…`).

- **2026-10-27 · Claude** — **Env Stripe/Vercel lista**. Login Vercel con cuenta `epigibson-michicondrias`;
  frontend linkeado al proyecto `michicondrias` (`.vercel/` gitignored). **VM** `/etc/michicondrias/common.env`
  ya tenía las 3 claves (`sk_test`/`whsec`/`pk_test`, publishable = app/web, 107 chars). **Vercel**: la
  `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` de production era **otra distinta** (`pk_test_51T79…` ≠ backend
  `pk_test_51UUx…`) → reemplazada; también en development. `NEXT_PUBLIC_API_URL` ya era
  `https://michicondrias.duckdns.org`. `common.env.example` documenta Stripe; `users.md` corrige la nota de
  «secret no configurado». Listo para push (backend + Vercel).

- **2026-10-26 · Claude** — **Backend + frontend de pagos revisados y commiteados**. Backend: endpoints
  `create-payment-intent`, `create-embedded-session`, `confirm-payment-intent`, webhook
  `payment_intent.succeeded`; `STRIPE_PUBLISHABLE_KEY` en config (sin `pk_` hardcodeada). Frontend:
  `checkout-direccion` + `pago-nativo` (Stripe Elements, Suspense, botón submit, orderId/order_id), carrito sin
  checkout muerto, servicios espejo. Verificado: `py_compile` OK · `tsc` 0 · ESLint 0 en archivos tocados ·
  `npm run build` verde (rutas `/tienda/checkout-direccion` y `/tienda/pago-nativo`).

- **2026-10-25 · Claude** — **Mobile completo al git + OTA**. Commits: pagos P1–P2 (`e80e81a`, `69a1a6a`);
  componentes base + haptics/animations (`c81f126`); listas premium explorar/P2 (`3d8fa38`); mascotas + home +
  ecommerce (`bc52e40`); docs (`a7585de`). `npm run check` 0 errores. Push `73c9338..a7585de`. **OTA production**
  Android `01a17b4a-97e6-732d-ba63-d237b978df3e` (grupo `dc9568ca-…`, runtime 1.1.0). **No se commiteó** `backend/`,
  `frontend/` ni `scripts/` (siguen en el working tree).

- **2026-10-25 · Claude** — **UI pagos P2**. `CheckoutSteps` compartido; `Skeleton` en `pago-nativo`; quitado
  `useCheckout` sin usar; `#00a650` → `theme.success` en carrito/producto/CartItemRow. Verificado: `npm run check`
  0 errores.

- **2026-10-25 · Claude** — **UI pagos (ui-ux-pro-max), puntos 1–3**. (1) `PagoResultado` lee `orderId` y `order_id`
  (deep link del backend vs WebView); `pago-nativo` unifica `orderId` en `return_url` y al navegar → «Ver mi pedido»
  abre el detalle. (2) Quitar `user-scalable=no`/`maximum-scale` del HTML de Stripe; error HTML con
  `role="alert"`/`aria-live`. (3) Tokens: `#00a650`→`theme.success`, `#ffffff`→`theme.onPrimary`, inputs/tab Stripe
  desde tema; emoji `⚡`→ícono `Zap`. Archivos: `PagoResultado.tsx`, `pago-nativo.tsx`, `checkout-direccion.tsx`.

- **2026-10-25 · Mimo** — **Data dummy masiva + limpieza + Web Perfil**. Seed completo (~90 registros) en todos los
  módulos con estados de flujo variados: adopciones (abierto/adoptado, aprobadas con admin), perdidas (lost/found ×
  active/resolved), productos (19 únicos tras desactivar duplicados), planes de seguro (3 activos), tratamientos
  (en-curso/por-iniciar/terminado), laboratorio (8 pruebas), estética, entrenamiento, funerarias, pet-friendly,
  establecimientos, clínicas, veterinarios. Fixes de UI: CSS de aseguradoras (texto encimado), badges de perdidas
  (`report_type` + `status` correctos). **Web Perfil** reescrito a dos columnas premium (§0): hero con avatar/rol,
  datos personales en rejilla, actividad rápida, seguridad/2FA/facturación/soporte en columna derecha. **Web Inicio**
  a dos columnas: mascotas, citas y «Lo que toca hoy» con recordatorios de dosis (atrasadas destacadas) + accesos
  del rol, herramientas pro y alertas. **Web Directorio y Citas**: filtros laterales + toggle mapa/lista en
  directorio; «Mis citas» con DataTable. **Web Tienda marketplace**: estilo Mercado Libre/Amazon — sidebar de filtros,
  tarjetas con precio grande/envío gratis/cuotas sin interés/rating, ficha con buy box a dos columnas. App móvil:
  mismas badges en tarjetas. **Tienda premium**: filtros precio/rating, hover effects con zoom y quick view,
  buy box con trust signals y entrega estimada. **Adopciones** con filtros laterales; **Admin productos** con
  DataTable. **Bloque B**: auditoría UX P2/P3 — header estilistas a rosa (era morado), funeraria sin duplicados.
  **Seguridad X3.1–X3.3**: moderación admin en 6 servicios (pending/approve/reject/suspend), paseadores y
  cuidadores filtran `is_verified`, campañas nacen inactivas. Migraciones `b2c3d4e5f6a7` y `c3d4e5f6a7b8`.
  17/17 servicios OK. Vercel ✅, OTA `f0d45434-…`.

- **2026-10-25 · Mimo** — **Tratamientos premium (web + app)**. Panel «Lo que toca hoy» tipo checklist de vidrio con
  checkbox por dosis, atrasadas resaltadas en dorado, botón «Marcar las N tomas». Tarjetas de tratamiento con barra
  de avance y badge de estado. Ficha de tratamiento reescrita como documento premium: hero con anillo de progreso,
  grid de datos con iconos, próxima toma destacada, línea de tiempo con conectores de color (verde/oro/gris) y chips
  de estado, panel lateral con acciones e impresión. En la app: `TodayDoses` y `PetTreatmentsTab` nuevos, tab
  «Tratamientos» en la ficha de la mascota. Paleta *Midnight & Gold* respetada en ambos temas. Web en Vercel ✅;
  OTA `52110114-…` (runtime 1.1.0). **Arreglos móvil**: `SegmentedControl` sin iconos con 4+ tabs (el texto se
  apretaba), toggle de avisos ya no se sale de la tarjeta (`overflow: hidden`), panel vacío más compacto, y
  **pantalla de ficha de tratamiento** nueva (`app/carnet/tratamiento/[id]`) con hero, progreso, línea de tiempo
  y acciones — la tarjeta de tratamiento navega a ella.

- **2026-10-25 · Mimo** — **Historial de tomas, estados de tratamiento y fecha de inicio** (backend + app + web).
  El dueño fija cuándo empieza el tratamiento (`PATCH` con `start_date`): las tomas se reprograman desde esa fecha y
  las ya tomadas quedan como historial. Cada toma guarda `taken_at`. `GET /treatments` trae `status`
  (por-iniciar / en-curso / terminado). **Pestaña «Tratamientos»** propia en la ficha de la mascota (web), con
  tarjetas agrupadas por estado y **ficha de cada tratamiento en su URL** (`/carnet/tratamiento/[id]`): documento
  con datos, avance, línea de tiempo de cada toma y panel de acciones. Botón «Tomado» bloqueado hasta que toca la
  dosis. Migración aditiva `a1b2c3d4e5f6`. Pruebas locales 15/15 OK. **Verificado en producción**: endpoint
  `GET /reminders/treatments/{id}` responde, ficha renderiza a 1280 y 375 (claro/oscuro) sin desbordes. OTA
  `0873d365-…` (runtime 1.1.0).

- **2026-10-24 · Mimo** — **Interruptor de avisos de medicamentos (app + web)**: el dueño activa o desactiva los
  avisos de cada medicamento recetado en la pestaña Salud. Tarjeta por tratamiento con nombre, dosis/frecuencia/
  duración, avance («3 de 5 tomas»), interruptor «Avisos» y botón «Tomado» para la próxima dosis. En web, panel
  lateral de Medicamentos con `FormSwitch`; en app, `TreatmentItem` en `CarnetItems.tsx`. Lógica espejo en
  `services/reminders.ts` (`getTreatments`, `setPrescriptionReminders`) y `usePetHealth`. Capturas verificadas a
  1280 y 375, claro y oscuro. Resuelve el pendiente de recetas viejas sin tomas programadas. Web en Vercel ✅;
  OTA `e03ac7cd-…` (runtime 1.1.0). **Refuerzo**: botón «Tomado» se bloquea mientras muta y solo aparece cuando la
  dosis ya toca (vencida o dentro de la próxima hora); si no, «Podrás marcarla cuando toque la dosis».

- **2026-10-24 · Mimo** — **Cierre del bloque de recordatorios que dejó Claude sin commit**: endpoints
  `GET /reminders/pet/{id}/treatments` y `PATCH /reminders/prescriptions/{id}` (el dueño activa/desactiva los avisos de
  cada medicamento y, al activarlos en recetas viejas, se programan las tomas que faltan), emisor que respeta
  `reminders_enabled`, migración aditiva `d7f3b8a1c925` y pruebas locales (8/8 OK). **Sin UI todavía** (app y web no
  muestran el interruptor); el pendiente de recetas viejas queda como UI pendiente.

- **2026-10-24 · Claude** — **Recordatorios de medicamentos verificados** (producción y prueba local de punta a punta) y
  arreglo: las tomas arrancan al recetar (antes un intervalo después; `8fd68e4`, desplegado, 17/17). La receta calcula
  las tomas igual que el backend y aclara que el aviso llega a las notificaciones de la app. OTA `92191a52-…`.
  **Preparado para Mimo**: sección «Guía para Mimo» arriba, `scripts/capturas.js` y `scripts/pruebas/*.py`.

- **2026-10-24 · Claude** — **Receta médica premium** (app y web): documento con folio y estado, clínica y veterinario
  reales de la consulta (cédula y especialidad), paciente, diagnóstico, cada medicamento con dosis, frecuencia,
  duración, tomas totales, fechas y avance, notas y firma. Fuera las promesas falsas («surtir en farmacia» con QR,
  «Michicondrias Vet Clinica»). Web: panel lateral con avance e «Imprimir o guardar PDF» en ventana propia
  (`src/lib/printElement.ts`, sale solo el documento en tema claro). Lógica espejo en `hooks/carnet/prescriptionPlan.ts`
  + `usePrescriptionDetail` (ahora trae `clinic`, `vet`, `plans`, `status`, `folio`).

- **2026-10-24 · Claude** — **Web: la receta vuelve a verse en la consulta** del historial (la tarjeta nueva la dejaba
  dentro de «Ver detalle» y sin enlace): etiqueta «Receta», signos visibles y enlace «Ver receta» a
  `/carnet/receta/[id]` con los medicamentos. La app no cambió (usa `RecordItem`).

- **2026-10-24 · Claude** — **Historial clínico con superpoderes** (app y web): línea de tiempo por mes (consultas con
  recetas, vacunas, laboratorio), búsqueda, filtros por tipo y periodo, evolución de peso y temperatura, y resumen del
  historial: backend `POST /pets/{id}/ai/history-summary` (`mascotas/app/core/ai_history.py`: hechos en el servidor,
  Claude solo redacta; sin clave, resumen automático; dueño o equipo clínico). Web: copiar e imprimir/PDF
  (`features/mascotas/printHistory.ts`), `components/Sparkline`. App: compartir con `Share`. Lógica espejo en
  `hooks/carnet/clinicalTimeline.ts` + `useClinicalHistory.ts`. Commits `d53c189`, `c1826e4`, `a94222e`, `ef10a29`. Backend desplegado y probado en producción; web en Vercel; OTA
  `f16ec9b0-77bb-42d3-866d-9aeae07cf49a`.

- **2026-10-24 · Claude** — **Todo publicado**: push de `main` hasta `fe887bc` (8 commits previos + carnet en clientes
  `1508ef1`, web Mis Mascotas `d6a66b9`/`fe887bc`, docs unificados `e8758ab`). Vercel `michicondrias` ✅ (el primer
  intento falló: `git commit -- ruta` no incluye archivos nuevos; usar `git add` antes). **OTA**
  `1bd38d9f-1dc8-4237-8d9c-dadb3b7dfc20` (runtime 1.1.0). `michicondrias-docs` en Vercel falla (esperado: `docs/` borrado).

- **2026-10-24 · Claude** — **Carnet solo del equipo clínico** (regla del usuario): backend `pet_access.py` (el dueño ya
  no escribe vacunas/consultas; probado: dueño 403, veterinario/clínica/admin OK), `usePetHealth` en app y web
  (`canEdit` clínico, `canCheckReminders` del dueño, `findVet`), `ROUTE_ACCESS` + `RoleGuard` en
  `carnet/nueva-vacuna|nueva-consulta`, vacíos del dueño con «Buscar veterinario». **Backend desplegado** (`a600829`,
  solo ese commit sobre `origin/main`; `deploy-oracle.yml` verde, 17/17 http 200, verificado en la VM). Los 8 commits
  locales de web/app se reacomodaron encima sin subir. Clientes sin commit ni OTA.
- **2026-10-24 · Claude** — **Web Mis Mascotas con criterio §0 terminado**: ficha (`features/mascotas/PetDetailSections.tsx`
  + `PetDetail.module.css`: hero con migas y acciones, `Tabs` con conteos, Resumen con datos en rejilla y panel lateral
  de Tracker/servicios, Salud con `DataTable` de vacunas y panel de medicamentos/laboratorio/IA, Historial con peso),
  lista (`PetList.module.css`: tarjetas con portada o tabla, «Agregar mascota» con texto en el hero). Arreglo: las
  vacunas se piden siempre (antes el hero decía «Sin vacunas» en Historial; cambio también en la app).
  `DataTable.module.css` con clases (CSS Modules no acepta selectores de etiqueta sueltos). `tsc` limpio.

- **2026-10-24 · Claude** — **Documentación unificada**: este archivo absorbe `PROGRESO_MOBILE.md`, `AUDITORIA_MOBILE.md`,
  `PROGRESO_WEB.md`, `AUDITORIA_WEB.md` y los informes de `docs/` (seguridad, rotación, permisos, roles, expertos,
  prompts). Borrados también `NEXUS_CONTEXT.md`, `REVIEW_MIMO.md`, `archivo/*.md` y el sitio Docusaurus `docs/`.
  `CLAUDE.md` y `frontend/CLAUDE.md` apuntan aquí; skills apuntan a este archivo.
  Nueva regla §0 (web = espejo de lógica, no de pantallas). Sin commit.
- **2026-10-24 · Claude** — **Web: criterio propio de escritorio** (pedido del usuario). Componentes nuevos `Tabs`,
  `DataTable`, `forms/FormActionsBar`; `features/mascotas/PetForm.tsx` rehecho a dos columnas con vista previa fija y
  barra de acciones; `nuevo`/`editar` con «Cancelar». `tsc` limpio. Falta rehacer ficha y lista (§3).
- **2026-10-24 · Claude** — **Web: Mis Mascotas con heurísticas UX** (4/10 antes). Lo grave: no se podía editar ni
  eliminar (`/mascotas/editar/[id]` 404) → página nueva. Confirmación al borrar vacuna/consulta, Medicamentos y
  Laboratorio en Salud, fecha de aplicación que nunca salía (`date_administered`), formulario igual a la app, sin
  desborde a 375 px. Build en verde.
- **2026-10-24 · Claude** — **Web UI premium: tokens sincronizados + a11y**: tokens nuevos de la app en `tokens.css`,
  3 backdrops accesibles, 15 `style={{}}` a variables. Build en verde.
- **2026-10-24 · Claude** — **App: Mis Mascotas** auditoría UX (7/10) y arreglos: `petFormRules.ts`,
  `useTrackerBilling.ts`, alta → ficha en Salud, aviso de Stripe, stats tocables, eliminar con Tracker → «Gestionar
  suscripción», lista sin modo tarjetas. Solo OTA; sin commit.
- **2026-10-24 · Claude** — **App UI pasadas 1–2**: 0 hex, 0 `fontWeight`, 0 `fontSize`/radios/espaciado numéricos,
  6 componentes base reescritos, SkeletonList en 59 pantallas, EmptyState en 64.
- **2026-10-24 · Mimo** — **X8.2 desplegado** (`bb87c03`): `SECRET_KEY` sin default; no arranca sin ella.
- **2026-10-24 · Mimo** — **OTA** `d08da4ef-…` (runtime 1.1.0): `useRideTracking` sin violar rules-of-hooks.
- **2026-10-24 · Mimo** — **X4/X5/X6 desplegado** (`0c5541b`): dueño en `create-subscription-session`,
  `adopted-from` con dueño/admin, listados de usuarios sin KYC, contacto de perdidas solo para el denunciante o admin.
  APK `versionCode 11`.
- **2026-10-24 · Mimo** — **X2/X3 desplegado** (`a77c771`): admin pasa las guardas de rol y los checks de dueño de
  directorio; verificar/suspender en paseadores y cuidadores.
- **2026-10-24 · Mimo** — Admin con acciones reales (productos, roles, servicios, veterinarios); 13 herramientas admin
  en el menú; icono M + huella. OTA `bfa39f64-…`.
- **2026-10-24 · Mimo** — **U10 parcial**: `expo-image` (24 archivos), FlashList en `DataList`, `expo-haptics`,
  `expo-notifications` (`services/push.ts`), Hanken Grotesk; deps sin uso retiradas.
- **2026-10-24 · Mimo** — **Push tokens en core** (`8e97b97`, migración `e7c4a9b2d6f8`): `POST|DELETE|GET /push-tokens`
  y `notify_user_push` (sin FCM aún). Desplegado y migrado.
- **2026-10-24 · Claude** — Auditoría de seguridad X2–X8 (15 hallazgos: 1 P0, 10 P1, 4 P2); X8.1 limpiado en código.
- **2026-10-23** — Web W0–W5 fusionada a `main`; login web corregido; X1 (2FA saltable) desplegado; OTA `a84459e2-…`.
