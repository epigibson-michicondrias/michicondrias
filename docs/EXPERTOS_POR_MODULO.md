# Expertos por módulo — Michicondrias

Cada módulo tiene **un agente experto** responsable de auditarlo, mejorarlo y corregirlo.
Cuando haya una **incidencia** o una **mejora**, se la pasa al experto de ese módulo: él ya
conoce su dominio, sus endpoints y sus pantallas.

## Cómo usarlo
1. Identifica el módulo (usa la tabla de abajo).
2. Lanza un agente con el brief de «eres el experto del módulo X» y pásale la incidencia/mejora.
3. El experto audita, corrige, verifica (`typecheck` + `build` + revisión visual) y hace commit.
4. Registra el resultado en `HANDOFF.md` §4 Bitácora.

**Reglas de convivencia (varios expertos en paralelo):**
- Cada experto edita **solo archivos de su módulo** (`src/app/(app)/<modulo>/`, `src/hooks/<modulo>/`,
  `src/services/*` de su dominio). Si necesita un cambio en componentes compartidos del kit,
  lo **reporta** en su resumen en vez de tocarlo.
- Trabajan sobre `main` en `/home/epigibson/Documentos/Desarrollos/michicondrias/frontend/`.
- **Nada de `push`**: el commit lo revisa el humano. La API de producción es **solo lectura**.

## Cuadro de expertos

### Web (`frontend/`) — consola de admin y app
| Módulo | Rutas | Expertos / estado |
|---|---|---|
| **Usuarios** | `admin/usuarios`, `admin/usuarios/[id]` | 🟢 en curso |
| **Roles y permisos** | `admin/roles` | 🟢 en curso (mismo experto de Usuarios) |
| **Moderación** | `admin/moderacion` | 🟢 en curso |
| **Verificaciones (KYC)** | `admin/verificaciones` | 🟢 en curso (mismo experto de Moderación) |
| **Mascotas (admin)** | `admin/mascotas` | 🟢 en curso (mismo experto de Moderación) |
| **Clínicas / Directorio** | `admin/clinicas`, `directorio`, `mi-clinica` | 🟢 en curso |
| **Veterinarios y Servicios** | `admin/veterinarios`, `admin/servicios`, `servicios-pro` | 🟢 en curso |
| **Tienda** (productos, pedidos, categorías) | `admin/productos`, `admin/pedidos`, `admin/categorias`, `tienda` | 🟢 en curso |
| **Sistema** (config, stats, panel) | `admin/config`, `admin/configuraciones`, `admin/stats`, `admin/analytics`, `admin` | 🟢 en curso |

### App móvil (`mobile/`) — módulos de la Fase 5
| Módulo | Pantallas | Estado |
|---|---|---|
| Auth | `(auth)/*` | ✅ U3 |
| Inicio / Explorar / Herramientas | `(tabs)/*` | ✅ U4 |
| Perfil | `perfil/*` | ✅ U5 |
| Mascotas | `mascotas/*` | ✅ U6 |
| Carnet | `carnet/*` | ✅ U7 |
| Tienda cliente | `tienda/*` | ✅ U8 |
| Notificaciones / Búsqueda / Ayuda | `notificaciones`, `busqueda`, `ayuda` | ✅ U9 |
| Admin (móvil) | `admin/*` | ✅ auditado y corregido |

### Backend (`backend/`) — por microservicio
| Servicio | Dominio | Estado seguridad |
|---|---|---|
| `core` | usuarios, auth, notificaciones, roles, push_tokens | ✅ X1, X4.2, X6.1, X8.2 |
| `directorio` | clínicas, veterinarios, citas, servicios | ✅ X2, `is_suspended` |
| `ecommerce` | productos, pedidos, pagos | ✅ X2, X4.1, X5.1 |
| `paseadores` / `cuidadores` | profesionales | ✅ X3 (`is_verified` + suspend) |
| `adopciones`, `perdidas`, `mascotas` | comunidad | ✅ X4, X6.2 |
| `aseguradoras`, `entrenadores`, `estilistas`, `funeraria`, `laboratorio`, `patrocinadores`, `establecimientos`, `transportistas` | pro | ✅ X2/X3 |

## Riesgos conocidos pendientes
- **Rotación de credenciales** (solo el usuario): `docs/ROTACION_CREDENCIALES.md`.
- `npm audit` de `frontend/`: vulnerabilidades de dependencias.
- U11 (Prettier/Maestro) y detalles de W5 de la web (hover/foco/atajos, tablas admin, SEO).

---

## Capa de expertos por ROL

Además del experto por módulo, **cada rol tiene un agente experto** que verifica que
todo le funcione de punta a punta a ese rol (web + app móvil). Cuando un rol reporte que
algo no le sirve, se la pasa a su experto.

| Rol | Qué debe poder hacer | Expertos / estado |
|---|---|---|
| **Consumidor** | Comprar, adoptar, agendar cita, reportar pérdida, contratar pro, ver mascotas/carnet, donar | 🟢 |
| **Admin** | Moderar, verificar KYC, usuarios/roles/config/stats, gestionar clínicas, productos, mascotas, servicios | 🟢 (consola admin) |
| **Veterinario** | Mi consultorio, agenda, pacientes, recetas, laboratorio, cirugías, inventario, servicios, horarios | 🟢 |
| **Hospital** | Mi clínica, sucursales, médicos asociados, agenda, pacientes, inventario, servicios | 🟢 |
| **Refugio** | Publicar mascota, ver solicitudes y formularios, donaciones | 🟢 |
| **Vendedor** | Mi tienda, catálogo, productos, pedidos, analíticas | 🟢 |
| **Paseador / Cuidador** | Gestionar servicios, solicitudes, calendario, perfil | 🟢 |
| **Entrenador** | Gestionar cursos, nuevo programa, metas, video evidencia | 🟢 |
| **Transportista** | Solicitudes, perfil de conductor, historial, tracking | 🟢 |
| **Estilista** | Gestión estilista, mis servicios, nuevo | 🟢 |
| **Aseguradora** | Gestión de planes, reclamos, nuevo plan | 🟢 |
| **Funeraria** | Gestión funeraria, nuevos servicios, reporte de defunción, memoriales | 🟢 |
| **Laboratorio** | Órdenes, registrar resultados | 🟢 |
| **Establecimiento** | Registrar establecimiento, ver y editar locales | 🟢 |
| **Patrocinador** | Campañas, boost de alerta, estadísticas | 🟢 |

**Cómo audita un experto de rol:**
1. Lee `ROLE_TOOLS` + `ROUTE_ACCESS` de su rol (fuente única de permisos).
2. Recorre **cada flujo** de su rol en web y app, verificando: el botón existe → navega → el endpoint responde →
   la acción tiene efecto → el estado se refresca → no hay callejones sin salida.
3. Contrasta con `docs/COBERTURA_ROLES.md` y las guardas del backend (`require_role`, `owner_id`).
4. Corrige lo que encuentre en los archivos de **su rol** y reporta los huecos de su dominio.
