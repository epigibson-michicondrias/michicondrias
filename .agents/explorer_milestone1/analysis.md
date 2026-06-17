# Back Navigation Homogenization Analysis Report

## Executive Summary
This report presents a comprehensive audit of back navigation implementation across all screens in the `mobile/app` directory of the Michicondrias project. A total of **155 files** (including layouts, redirects, and screen files) were analyzed.

- **Total Screens/Files Audited:** 155
- **Screens with Standard Back Navigation:** 137
  - *Standard ScreenHeader:* 116
  - *Standard BackButton:* 21
- **Screens with Ad-hoc/Non-Standard Back Navigation (Homogenization Required):** 10
- **Screens with No Back Navigation (Tabs, Layouts, Redirects):** 8

The Michicondrias mobile application has a high level of standardization, with over 88% of screens correctly utilizing the standard `ScreenHeader` or `BackButton` components. However, **10 key screens** still utilize custom `TouchableOpacity` buttons with raw icons (`ChevronLeft` or `ArrowLeft`), direct `router.back()`/`goBack()` calls, or lack headers entirely. These screens require homogenization to ensure a unified user experience and visual consistency.

---

## Homogenization Priority Candidates
Below is the list of screens requiring homogenization, along with details of their current implementation and recommended changes:

| # | File Path (relative to `mobile/app/`) | Current Implementation | Homogenization Need | Recommendation |
|---|---------------------------------------|------------------------|---------------------|----------------|
| 1 | `forgot-password.tsx` | Custom `TouchableOpacity` with `ArrowLeft` icon calling `router.back()`. | **Yes** | Replace with standard `BackButton`. |
| 2 | `register.tsx` | Custom `TouchableOpacity` with `ArrowLeft` icon calling `router.back()`. | **Yes** | Replace with standard `BackButton`. |
| 3 | `adopciones/[id].tsx` | Custom `TouchableOpacity` overlay with `ChevronLeft` calling `goBack()`. | **Yes** | Replace with standard `BackButton` styled as an overlay. |
| 4 | `directorio/clinica/[id].tsx` | Custom `TouchableOpacity` overlay with `ChevronLeft` calling `router.back()`. | **Yes** | Replace with standard `BackButton` styled as an overlay. |
| 5 | `directorio/especialista/[id].tsx` | Custom `TouchableOpacity` overlay with `ChevronLeft` calling `router.back()`. | **Yes** | Replace with standard `BackButton` styled as an overlay. |
| 6 | `directorio/nuevo.tsx` | Custom header layout with `TouchableOpacity` + `ChevronLeft` calling `router.back()`. | **Yes** | Replace with standard `ScreenHeader`. |
| 7 | `perdidas/index.tsx` | Custom header layout with `TouchableOpacity` + `ChevronLeft` calling `router.back()`. | **Yes** | Replace with standard `ScreenHeader` or `BackButton`. |
| 8 | `perfil/partner.tsx` | No back button in header; uses a "Cancelar" text button at bottom calling `router.back()`. | **Yes** | Add standard `ScreenHeader` at the top. |
| 9 | `petfriendly/[id].tsx` | Custom `TouchableOpacity` overlay with `ChevronLeft` calling `goBack()`. | **Yes** | Replace with standard `BackButton` styled as an overlay. |
| 10| `tienda/producto/[id].tsx` | Custom `TouchableOpacity` overlay with `ChevronLeft` calling `goBack()`. | **Yes** | Replace with standard `BackButton` styled as an overlay. |

---

## Detailed Directory Audit

### 1. Root Screens
These are screens directly inside the `mobile/app/` directory.

| File Path | Implementation Details | Homogenization Needed |
|-----------|------------------------|-----------------------|
| `+html.tsx` | Root HTML template (no back navigation) | No |
| `+not-found.tsx` | "Not Found" screen, uses `<Link href="/">` to return home (no back button) | No |
| `_layout.tsx` | Root layout file (no back navigation) | No |
| `ayuda.tsx` | Uses standard `<BackButton onPress={() => router.back()} />` | No |
| `donaciones.tsx` | Uses standard `<BackButton onPress={() => router.back()} />` | No |
| `forgot-password.tsx` | Uses ad-hoc `<TouchableOpacity>` + `<ArrowLeft>` calling `router.back()` | **Yes** |
| `login.tsx` | Main landing/login screen (no back navigation) | No |
| `notificaciones.tsx` | Uses standard `ScreenHeader` | No |
| `register.tsx` | Uses ad-hoc `<TouchableOpacity>` + `<ArrowLeft>` calling `router.back()` | **Yes** |

### 2. Tab Screens (`(tabs)`)
These represent the main tab bar navigation.

| File Path | Implementation Details | Homogenization Needed |
|-----------|------------------------|-----------------------|
| `(tabs)/_layout.tsx` | Tab layout configuration (no back navigation) | No |
| `(tabs)/explorar.tsx` | Explore tab main page (no back navigation) | No |
| `(tabs)/index.tsx` | Home tab main page (no back navigation) | No |
| `(tabs)/menu.tsx` | Menu tab main page (no back navigation) | No |
| `(tabs)/tienda-tab.tsx` | Store tab main page (no back navigation) | No |
| `(tabs)/two.tsx` | Secondary tab placeholder (no back navigation) | No |

### 3. Admin (`admin`)
All screens in the admin dashboard.

| File Path | Implementation Details | Homogenization Needed |
|-----------|------------------------|-----------------------|
| `admin/categorias/index.tsx` | Uses standard `ScreenHeader` | No |
| `admin/clinicas/[id].tsx` | Uses standard `ScreenHeader`. *(Note: Renders a fallback "Regresar" touchable link in error states, which is acceptable)* | No |
| `admin/clinicas/index.tsx` | Uses standard `ScreenHeader` | No |
| `admin/config.tsx` | Uses standard `ScreenHeader` | No |
| `admin/index.tsx` | Uses standard `ScreenHeader` | No |
| `admin/mascotas/index.tsx` | Uses standard `ScreenHeader` | No |
| `admin/moderacion/index.tsx` | Uses standard `ScreenHeader` | No |
| `admin/productos/index.tsx` | Uses standard `ScreenHeader` | No |
| `admin/roles/index.tsx` | Uses standard `ScreenHeader` | No |
| `admin/servicios/index.tsx` | Uses standard `ScreenHeader` | No |
| `admin/stats.tsx` | Uses standard `ScreenHeader` | No |
| `admin/usuarios/index.tsx` | Uses standard `ScreenHeader` | No |
| `admin/verificaciones/index.tsx` | Uses standard `ScreenHeader` | No |
| `admin/veterinarios/index.tsx` | Uses standard `ScreenHeader` | No |

### 4. Adopciones (`adopciones`)
Adoptions module screens.

| File Path | Implementation Details | Homogenization Needed |
|-----------|------------------------|-----------------------|
| `adopciones/[id].tsx` | Uses ad-hoc `<TouchableOpacity>` + `<ChevronLeft>` calling `goBack()` | **Yes** |
| `adopciones/contrato/[id].tsx` | Uses standard `ScreenHeader` | No |
| `adopciones/formulario-compatibilidad.tsx` | Uses standard `ScreenHeader` | No |
| `adopciones/index.tsx` | Uses standard `ScreenHeader` | No |
| `adopciones/mis-publicaciones.tsx` | Uses standard `ScreenHeader` | No |
| `adopciones/mis-solicitudes.tsx` | Uses standard `ScreenHeader` | No |
| `adopciones/nuevo.tsx` | Uses standard `ScreenHeader` | No |
| `adopciones/refugio/aplicaciones.tsx` | Uses standard `ScreenHeader` | No |
| `adopciones/solicitar/[id].tsx` | Uses standard `ScreenHeader` | No |
| `adopciones/solicitud/[id].tsx` | Uses standard `ScreenHeader` | No |
| `adopciones/solicitudes.tsx` | Uses standard `ScreenHeader` | No |
| `adopciones/ver-solicitudes/[id].tsx` | Uses standard `ScreenHeader` | No |

### 5. Aseguradoras (`aseguradoras`)
Pet insurance module screens.

| File Path | Implementation Details | Homogenization Needed |
|-----------|------------------------|-----------------------|
| `aseguradoras/cotizar.tsx` | Uses standard `ScreenHeader` | No |
| `aseguradoras/gestion.tsx` | Uses standard `ScreenHeader` | No |
| `aseguradoras/index.tsx` | Uses standard `ScreenHeader` | No |
| `aseguradoras/mis-polizas.tsx` | Uses standard `ScreenHeader` | No |
| `aseguradoras/nuevo.tsx` | Uses standard `BackButton` | No |
| `aseguradoras/reclamo/nuevo.tsx` | Uses standard `ScreenHeader` | No |
| `aseguradoras/reclamos.tsx` | Uses standard `ScreenHeader` | No |

### 6. Búsqueda (`busqueda`)
Search module screens.

| File Path | Implementation Details | Homogenization Needed |
|-----------|------------------------|-----------------------|
| `busqueda/index.tsx` | Uses standard `ScreenHeader` | No |

### 7. Carnet de Salud (`carnet`)
Pet health record module screens.

| File Path | Implementation Details | Homogenization Needed |
|-----------|------------------------|-----------------------|
| `carnet/[id].tsx` | Uses standard `BackButton` | No |
| `carnet/index.tsx` | Uses standard `ScreenHeader` | No |
| `carnet/nueva-consulta.tsx` | Uses standard `ScreenHeader` | No |
| `carnet/nueva-vacuna.tsx` | Uses standard `ScreenHeader` | No |
| `carnet/receta/[id].tsx` | Uses standard `BackButton` | No |
| `carnet/recordatorios.tsx` | Uses standard `ScreenHeader` | No |

### 8. Cuidadores (`cuidadores`)
Pet sitters module screens.

| File Path | Implementation Details | Homogenization Needed |
|-----------|------------------------|-----------------------|
| `cuidadores/[id].tsx` | Uses standard `ScreenHeader` | No |
| `cuidadores/calendario.tsx` | Uses standard `ScreenHeader` | No |
| `cuidadores/index.tsx` | Uses standard `ScreenHeader` | No |
| `cuidadores/solicitudes.tsx` | Uses standard `ScreenHeader` | No |

### 9. Directorio Médico (`directorio`)
Medical directory module screens.

| File Path | Implementation Details | Homogenization Needed |
|-----------|------------------------|-----------------------|
| `directorio/citas/agendar/[clinic_id].tsx` | Uses standard `ScreenHeader` | No |
| `directorio/citas/index.tsx` | Uses standard `ScreenHeader` | No |
| `directorio/clinica/[id].tsx` | Uses ad-hoc `<TouchableOpacity>` overlay + `<ChevronLeft>` calling `router.back()` | **Yes** |
| `directorio/especialista/[id].tsx` | Uses ad-hoc `<TouchableOpacity>` overlay + `<ChevronLeft>` calling `router.back()` | **Yes** |
| `directorio/index.tsx` | Uses standard `BackButton` | No |
| `directorio/nuevo.tsx` | Uses ad-hoc `<TouchableOpacity>` + `<ChevronLeft>` calling `router.back()` in a custom header layout | **Yes** |

### 10. Entrenadores (`entrenadores`)
Pet training module screens.

| File Path | Implementation Details | Homogenization Needed |
|-----------|------------------------|-----------------------|
| `entrenadores/[id].tsx` | Uses standard `ScreenHeader` | No |
| `entrenadores/gestion.tsx` | Uses standard `ScreenHeader` | No |
| `entrenadores/index.tsx` | Uses standard `ScreenHeader` | No |
| `entrenadores/inscribir/[programId].tsx` | Uses standard `ScreenHeader` | No |
| `entrenadores/metas/[id].tsx` | Uses standard `ScreenHeader` | No |
| `entrenadores/mis-inscripciones.tsx` | Uses standard `ScreenHeader` | No |
| `entrenadores/nuevo-programa.tsx` | Uses standard `ScreenHeader` | No |

### 11. Establecimientos (`establecimientos`)
Pet-friendly venues module screens.

| File Path | Implementation Details | Homogenization Needed |
|-----------|------------------------|-----------------------|
| `establecimientos/[id].tsx` | Uses standard `ScreenHeader` | No |
| `establecimientos/editar/[id].tsx` | Uses standard `ScreenHeader` | No |
| `establecimientos/index.tsx` | Uses standard `ScreenHeader` | No |
| `establecimientos/nuevo.tsx` | Uses standard `ScreenHeader` | No |

### 12. Estilistas (`estilistas`)
Pet styling module screens.

| File Path | Implementation Details | Homogenization Needed |
|-----------|------------------------|-----------------------|
| `estilistas/index.tsx` | Uses standard `ScreenHeader` | No |
| `estilistas/nuevo.tsx` | Uses standard `ScreenHeader` | No |

### 13. Funeraria (`funeraria`)
Pet funeral services module screens.

| File Path | Implementation Details | Homogenization Needed |
|-----------|------------------------|-----------------------|
| `funeraria/certificado/[id].tsx` | Uses standard `ScreenHeader` | No |
| `funeraria/gestion.tsx` | Uses standard `ScreenHeader` | No |
| `funeraria/index.tsx` | Uses standard `ScreenHeader` | No |
| `funeraria/memorial/[petId].tsx` | Uses standard `ScreenHeader` | No |
| `funeraria/memorial/nuevo.tsx` | Uses standard `ScreenHeader` | No |
| `funeraria/mis-reservas.tsx` | Uses standard `ScreenHeader` | No |
| `funeraria/nuevo-servicio.tsx` | Uses standard `ScreenHeader` | No |
| `funeraria/nuevo.tsx` | Uses standard `BackButton` | No |
| `funeraria/reporte-defuncion.tsx` | Uses standard `ScreenHeader` | No |
| `funeraria/reservar.tsx` | Uses standard `ScreenHeader` | No |

### 14. Estética / Grooming (`grooming`)
Pet grooming module screens.

| File Path | Implementation Details | Homogenization Needed |
|-----------|------------------------|-----------------------|
| `grooming/agendar.tsx` | Uses standard `ScreenHeader` | No |
| `grooming/gestion.tsx` | Uses standard `ScreenHeader` | No |
| `grooming/historial/[petId].tsx` | Uses standard `ScreenHeader` | No |
| `grooming/mis-citas.tsx` | Uses standard `ScreenHeader` | No |

### 15. Laboratorio (`laboratorio`)
Clinical laboratory module screens.

| File Path | Implementation Details | Homogenization Needed |
|-----------|------------------------|-----------------------|
| `laboratorio/gestion.tsx` | Uses standard `ScreenHeader` | No |
| `laboratorio/index.tsx` | Uses standard `ScreenHeader` | No |

### 16. Mascotas (`mascotas`)
User pets management module screens.

| File Path | Implementation Details | Homogenization Needed |
|-----------|------------------------|-----------------------|
| `mascotas/[id].tsx` | Uses standard `BackButton` | No |
| `mascotas/diagnostico-ia.tsx` | Uses standard `ScreenHeader` | No |
| `mascotas/editar/[id].tsx` | Uses standard `ScreenHeader` | No |
| `mascotas/index.tsx` | Uses standard `ScreenHeader` | No |
| `mascotas/nuevo.tsx` | Uses standard `ScreenHeader` | No |

### 17. Mi Clínica (`mi-clinica`)
Professional veterinarian portal screens.

| File Path | Implementation Details | Homogenization Needed |
|-----------|------------------------|-----------------------|
| `mi-clinica/agenda.tsx` | Uses standard `ScreenHeader` | No |
| `mi-clinica/cirugias.tsx` | Uses standard `ScreenHeader` | No |
| `mi-clinica/config/[id].tsx` | Uses standard `ScreenHeader` | No |
| `mi-clinica/consultas-video.tsx` | Uses standard `ScreenHeader` | No |
| `mi-clinica/historial/[id].tsx` | Uses standard `ScreenHeader` | No |
| `mi-clinica/horarios.tsx` | Uses standard `ScreenHeader` | No |
| `mi-clinica/index.tsx` | Uses standard `ScreenHeader` | No |
| `mi-clinica/inventario.tsx` | Uses standard `ScreenHeader` | No |
| `mi-clinica/laboratorio.tsx` | Uses standard `ScreenHeader` | No |
| `mi-clinica/pacientes.tsx` | Uses standard `ScreenHeader` | No |
| `mi-clinica/recetas.tsx` | Uses standard `ScreenHeader` | No |
| `mi-clinica/servicios.tsx` | Uses standard `ScreenHeader` | No |
| `mi-clinica/sucursales.tsx` | Uses standard `ScreenHeader` | No |
| `mi-clinica/veterinarios.tsx` | Uses standard `ScreenHeader` | No |

### 18. Paseadores (`paseadores`)
Pet walkers module screens.

| File Path | Implementation Details | Homogenization Needed |
|-----------|------------------------|-----------------------|
| `paseadores/[id].tsx` | Uses standard `ScreenHeader` | No |
| `paseadores/calendario.tsx` | Uses standard `ScreenHeader` | No |
| `paseadores/index.tsx` | Uses standard `ScreenHeader` | No |
| `paseadores/solicitudes.tsx` | Uses standard `ScreenHeader` | No |

### 19. Patrocinadores (`patrocinadores`)
Sponsors and campaigns module screens.

| File Path | Implementation Details | Homogenization Needed |
|-----------|------------------------|-----------------------|
| `patrocinadores/boost-alerta.tsx` | Uses standard `ScreenHeader` | No |
| `patrocinadores/estadisticas.tsx` | Uses standard `ScreenHeader` | No |
| `patrocinadores/index.tsx` | Uses standard `ScreenHeader` | No |
| `patrocinadores/nueva-campana.tsx` | Uses standard `ScreenHeader` | No |
| `patrocinadores/nuevo.tsx` | Uses standard `BackButton` | No |

### 20. Mascotas Perdidas (`perdidas`)
Lost pets alerts module screens.

| File Path | Implementation Details | Homogenization Needed |
|-----------|------------------------|-----------------------|
| `perdidas/[id].tsx` | Uses standard `BackButton` | No |
| `perdidas/editar/[id].tsx` | Uses standard `ScreenHeader` | No |
| `perdidas/index.tsx` | Uses ad-hoc `<TouchableOpacity>` + `<ChevronLeft>` calling `router.back()` | **Yes** |
| `perdidas/nuevo.tsx` | Uses standard `BackButton` | No |

### 21. Perfil (`perfil`)
User settings and profile screens.

| File Path | Implementation Details | Homogenization Needed |
|-----------|------------------------|-----------------------|
| `perfil/index.tsx` | Uses standard `ScreenHeader` | No |
| `perfil/kyc.tsx` | Uses standard `ScreenHeader` | No |
| `perfil/paleta.tsx` | Uses standard `BackButton` | No |
| `perfil/partner.tsx` | No back header; Cancel button at bottom using `router.back()` | **Yes** |
| `perfil/seguridad-2fa.tsx` | Uses standard `ScreenHeader` | No |
| `perfil/verificacion.tsx` | Uses standard `BackButton` | No |

### 22. Petfriendly (`petfriendly`)
Petfriendly places directory screens.

| File Path | Implementation Details | Homogenization Needed |
|-----------|------------------------|-----------------------|
| `petfriendly/[id].tsx` | Uses ad-hoc `<TouchableOpacity>` overlay + `<ChevronLeft>` calling `goBack()` | **Yes** |
| `petfriendly/index.tsx` | Uses standard `ScreenHeader` | No |
| `petfriendly/nuevo.tsx` | Uses standard `BackButton` | No |

### 23. Servicios Pro (`servicios-pro`)
Professional services management screens.

| File Path | Implementation Details | Homogenization Needed |
|-----------|------------------------|-----------------------|
| `servicios-pro/gestion.tsx` | Uses standard `ScreenHeader` | No |
| `servicios-pro/index.tsx` | Uses standard `ScreenHeader` | No |
| `servicios-pro/perfil.tsx` | Uses standard `ScreenHeader` | No |

### 24. Tienda (`tienda`)
E-commerce and marketplace screens.

| File Path | Implementation Details | Homogenization Needed |
|-----------|------------------------|-----------------------|
| `tienda/carrito.tsx` | Uses standard `ScreenHeader` | No |
| `tienda/compras.tsx` | Uses standard `ScreenHeader` | No |
| `tienda/index.tsx` | Redirect file returning `null` (no back navigation) | No |
| `tienda/pago-cancelado.tsx` | Uses standard `BackButton` | No |
| `tienda/pago-exitoso.tsx` | Uses standard `BackButton` | No |
| `tienda/producto/[id].tsx` | Uses ad-hoc `<TouchableOpacity>` overlay + `<ChevronLeft>` calling `goBack()` | **Yes** |
| `tienda/vendedor/analytics.tsx` | Uses standard `ScreenHeader` | No |
| `tienda/vendedor/index.tsx` | Uses standard `ScreenHeader` | No |
| `tienda/vendedor/ordenes.tsx` | Uses standard `ScreenHeader` | No |
| `tienda/vendedor/productos/[id].tsx` | Uses standard `ScreenHeader` | No |
| `tienda/vendedor/productos.tsx` | Uses standard `ScreenHeader` | No |

### 25. Transportistas (`transportistas`)
Pet transport module screens.

| File Path | Implementation Details | Homogenization Needed |
|-----------|------------------------|-----------------------|
| `transportistas/historial.tsx` | Uses standard `ScreenHeader` | No |
| `transportistas/index.tsx` | Uses standard `ScreenHeader` | No |
| `transportistas/nuevo.tsx` | Uses standard `BackButton` | No |
| `transportistas/perfil-conductor.tsx` | Uses standard `ScreenHeader` | No |
| `transportistas/solicitar.tsx` | Uses standard `ScreenHeader` | No |
| `transportistas/tracking/[id].tsx` | Uses standard `ScreenHeader` | No |
