# Cobertura de roles y flujos — Michicondrias

Auditoría de navegación y permisos en la app móvil (`mobile/`). **Cómo se modela el acceso:**

- `src/constants/roleTools.ts` es la fuente única:
  - `ROLE_TOOLS` → qué herramientas ve cada rol en el menú Herramientas / Inicio.
  - `ROUTE_ACCESS` → prefijo de ruta → roles permitidos. `admin` siempre pasa.
  - **Cualquier ruta que no esté en `ROUTE_ACCESS` es abierta a cualquier usuario autenticado.**
    Es una decisión de diseño explícita (comentario en `roleTools.ts`): flujos como
    `/funeraria/reporte-defuncion` o `/adopciones/mis-publicaciones` los usan también los dueños.
- El backend tiene sus guardas (`require_role`, `require_admin`, `RoleChecker`, `owner_id`) en los 17
  microservicios. Discrepancias conocidas: `docs/SEGURIDAD_X2_X8.md` (X2–X8) y `docs/PERMISOS_BACKEND.md`.

---

## 1. Inventario de roles

| Rol | Tipo | Herramientas en `ROLE_TOOLS` |
|---|---|---|
| `consumidor` | cliente | 0 (usa las pestañas) |
| `veterinario` | pro salud | 11 |
| `hospital` | pro salud | 7 |
| `refugio` | comunitario | 5 |
| `vendedor` | tienda | 4 |
| `aseguradora` | pro | 3 |
| `funeraria` | pro | 3 |
| `entrenador` | pro | 2 |
| `estilista` | pro | 3 |
| `laboratorio` | pro | 1 |
| `patrocinador` | pro | 3 |
| `transportista` | pro | 3 |
| `establecimiento` | pro | 2 |
| `paseador` / `cuidador` | pro | vía `/servicios-pro` |
| `admin` | administración | 7 |

---

## 2. Hallazgos

### 🔴 H1 — 6 pantallas de admin no están en el menú del rol (hueco de navegación)

`ROLE_TOOLS.admin` lista **7** herramientas, pero existen **15** pantallas bajo `app/admin/`:

| Pantalla | ¿En `ROLE_TOOLS`? | ¿Cómo se llega hoy? |
|---|---|---|
| `/admin` (panel) | ✅ | menú |
| `/admin/verificaciones` | ✅ | menú |
| `/admin/moderacion` | ✅ | menú |
| `/admin/stats` | ✅ | menú |
| `/admin/usuarios` | ✅ | menú |
| `/admin/roles` | ✅ | menú |
| `/admin/config` | ✅ | menú |
| `/admin/clinicas` (+ `[id]`) | ❌ | solo desde el panel |
| `/admin/productos` | ❌ | solo desde el panel |
| `/admin/mascotas` | ❌ | solo desde el panel |
| `/admin/servicios` | ❌ | solo desde el panel |
| `/admin/categorias` | ❌ | solo desde el panel |
| `/admin/veterinarios` | ❌ | solo desde el panel |

**Impacto:** un admin que entra en «Herramientas» no ve clínicas, productos, mascotas, servicios,
categorías ni veterinarios. Solo las alcanza si sabe que están en el panel. Contradice la regla de
`roleTools.ts`: *«una ruta nueva de profesional/admin se registra AQUÍ»*.

**Corrección propuesta:** añadir las 6 entradas a `ROLE_TOOLS.admin` (o decidir que son sub-secciones
del panel y entonces no son herramientas del menú — pero hay que decirlo y mantener el panel
completo). Recomendado: añadirlas, con `home: false` para no ensuciar los atajos de Inicio.

### 🟡 H2 — Flujos de `consumidor` sin herramienta de entrada (por diseño, pero dispersos)

`ROLE_TOOLS.consumidor = []` es correcto (el consumidor navega por las pestañas), pero estos
flujos solo se alcanzan por un atajo contextual o por link profundo:

| Flujo | Entrada visible | Nota |
|---|---|---|
| `/adopciones` | ✅ Explorar › Comunidad | |
| `/perdidas` | ✅ Explorar › Comunidad | |
| `/donaciones` | ✅ Explorar › Comunidad | |
| `/funeraria/reservar`, `/funeraria/mis-reservas` | ⚠️ solo desde `/funeraria` | no está en Explorar |
| `/aseguradoras` (contratar) | ✅ Explorar › Salud › Seguros | |
| `/laboratorio` (cliente) | ✅ Explorar › Salud | |
| `/establecimientos` | ✅ Explorar › Servicios | |

**Corrección propuesta:** añadir «Funeraria» a Explorar › Comunidad (o Servicios) si es un flujo
que quieras que el consumidor descubra. Si es solo por referencia del veterinario, dejarlo como está.

### 🟡 H3 — `establecimientos` (lista) no está en `ROUTE_ACCESS`

`/establecimientos/nuevo` y `/establecimientos/editar` sí están restringidos a `establecimiento`,
pero `/establecimientos` (la lista) no está en `ROUTE_ACCESS` → cualquier autenticado la abre.
**Es correcto** (es un directorio público de locales pet-friendly), pero conviene documentarlo para
que nadie lo «restinja» por error. Lo mismo `/adopciones/mis-publicaciones`, `/paseadores/solicitudes`.

### 🟢 H4 — Guardas del layout (correctas)

- `app/admin/_layout.tsx` envuelve todo `/admin` con `RoleGuard roles={['admin']}` → las 15 pantallas
  quedan protegidas aunque no lleven `RoleGuard` individual. **Correcto y limpio.**
- Igual para `/mi-clinica`, `/tienda/vendedor`, etc. (sus `_layout` correspondientes).

---

## 3. Matriz rol → flujo de negocio

| Rol | Flujo esperado | ¿Completo? | Observación |
|---|---|---|---|
| **consumidor** | Comprar en tienda (catálogo → bolsa → checkout → pedido) | ✅ | U8 hecho |
| | Adoptar (listado → detalle → postular) | ✅ | |
| | Agendar cita (directorio → clínica → agendar) | ✅ | |
| | Reportar pérdida | ✅ | |
| | Contratar pro (paseador, cuidador, estética…) | ⚠️ | Detalles con `BottomSheet` OK; **faltan listas y calendarios** (P2) |
| | Ver carnet / mascotas | ✅ | |
| **vendedor** | Publicar producto, ver pedidos, analíticas | ✅ | U8 hecho |
| **veterinario / hospital** | Mi clínica, agenda, pacientes, recetas, laboratorio | ✅ | |
| **refugio** | Publicar mascota, revisar solicitudes y formularios | ✅ | |
| **admin** | Moderar, verificar KYC, usuarios, roles, config, stats | 🟡 | **Ver H1**: 6 pantallas inalcanzables desde el menú |
| | Gestionar clínicas, productos, mascotas, servicios | 🟡 | Pantallas arregladas hoy, pero sin entrada en el menú |
| **paseador / cuidador** | Gestionar servicios, solicitudes, calendario | ⚠️ | `useRideTracking` viola rules-of-hooks (solo transportistas) |
| **transportista** | Solicitudes, viajes, historial, tracking | ⚠️ | `useRideTracking.ts:50` viola rules-of-hooks |
| **aseguradora** | Planes, reclamos, nuevo plan | ✅ | |
| **funeraria** | Gestión, nuevos servicios, reporte de defunción | ✅ | `reporte-defuncion` abierto a dueños, a propósito |
| **estilista** | Gestión, mis servicios, nuevo | ✅ | |
| **entrenador** | Gestión de cursos, nuevo programa | ✅ | |
| **patrocinador** | Campañas, boost de alerta, estadísticas | ✅ | |
| **establecimiento** | Registrar local, editar | ✅ | |

---

## 4. Contraste con el backend (resumen)

| Tema | Estado | Detalle |
|---|---|---|
| Guards `require_role` | ⚠️ | **X2.1–X2.6**: 5 servicios excluyen a `admin` de sus guards locales (`require_aseguradora`, `require_veterinario`, `RoleChecker`…), así que el superadmin no puede moderar contenido ajeno. Ver `SEGURIDAD_X2_X8.md`. |
| Moderación `is_approved` | ⚠️ | **X3.1–X3.2**: 8 servicios (paseadores, cuidadores, entrenadores, establecimientos, estilistas, laboratorio, patrocinadores, aseguradoras) tienen `require_admin` definido y **sin usar**; `is_verified` no se filtra. |
| Dueño (`owner_id`) | ⚠️ | **X4.1/X5.1**: suscripciones sin check de dueño; **X6.2**: teléfono/correo del denunciante visible a cualquier autenticado. |
| `admin` en la app | ✅ | `ROLE_TOOLS` + `ROUTE_ACCESS` (`/admin` con `roles: []`) + `RoleGuard` en layout. |

**La app está por delante del backend**: deja pasar al admin a zonas que el backend todavía no deja
moderar (X2) o no modera (X3). Los P1 de `SEGURIDAD_X2_X8.md` son la prioridad real.

---

## 5. Prioridades

1. **H1** — registrar las 6 pantallas de admin en `ROLE_TOOLS.admin` (rápido, alto impacto).
2. **X2** del backend — dejar que `admin` pase las guards locales (es lo que impide que el admin
   modere de verdad).
3. **X3** — moderación real en los 8 servicios sin `is_approved`.
4. `useRideTracking.ts:50` — violación de rules-of-hooks (puede romper el tracking en vivo).
5. **H2** — decidir si «Funeraria» entra en Explorar para el consumidor.
