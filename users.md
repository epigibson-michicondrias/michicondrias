# Usuarios de prueba — Michicondrias

Creados el **2026-10-17** en **producción** (`https://michicondrias.duckdns.org`) para probar todos los botones,
pantallas, interacciones y vistas de la app. Todos con la **misma contraseña** y KYC en `VERIFIED` (para que los
roles profesionales entren sin pasar por la aprobación manual).

| | |
|---|---|
| **Contraseña (todos)** | `MichiTest2026!` |
| **Entrar desde la app** | Login con el correo de cada fila |
| **Limpieza** | Todos los correos empiezan con `test.` (y `@example.com`); se pueden borrar juntos cuando quieras |

## Usuarios por rol

| Correo | Rol | Nombre | Sirve para probar |
|---|---|---|---|
| `test.consumidor@example.com` | consumidor | Ana García | Inicio, Explorar, Tienda, Mascotas, Carnet, Perfil, Notificaciones, Adopciones (postularse), Perdidas |
| `test.consumidor2@example.com` | consumidor | Luis Martínez | Segunda cuenta para flujos de dos personas (adopciones, pedidos, citas) |
| `test.admin@example.com` | admin | Admin de Pruebas | `/admin` (panel, verificaciones, moderación, usuarios, roles, config) |
| `test.veterinario@example.com` | veterinario | Dra. Sofía Hernández | `/mi-clinica` (agenda, pacientes, videoconsultas, recetas, laboratorio, cirugías, inventario, servicios, horarios) |
| `test.hospital@example.com` | hospital | Hospital Michi Central | `/mi-clinica` + sucursales y médicos asociados |
| `test.refugio@example.com` | refugio | Refugio Patitas Felices | `/adopciones/mis-publicaciones`, nuevo, solicitudes, aplicaciones, donaciones |
| `test.hogar_temporal@example.com` | hogar_temporal | Casa Hogar Luna | Igual que refugio (sin panel de donaciones) |
| `test.vendedor@example.com` | vendedor | Carlos Méndez | `/tienda/vendedor` (catálogo, pedidos, productos, analíticas) |
| `test.paseador@example.com` | paseador | Juan Paseador | `/servicios-pro`, `/paseadores/solicitudes`, `/paseadores/calendario` |
| `test.cuidador@example.com` | cuidador | María Cuidadora | `/servicios-pro`, `/cuidadores/solicitudes`, `/cuidadores/calendario` |
| `test.aseguradora@example.com` | aseguradora | Seguros Michi Protección | `/aseguradoras/gestion`, reclamos, nuevo plan |
| `test.funeraria@example.com` | funeraria | Funeraria Pet Peace | `/funeraria/gestion`, nuevo servicio, reporte de defunción |
| `test.entrenador@example.com` | entrenador | Roberto Entrenador | `/entrenadores/gestion`, nuevo programa |
| `test.estilista@example.com` | estilista | Lucía Estilista | `/grooming/gestion`, `/estilistas/nuevo` |
| `test.laboratorio@example.com` | laboratorio | Lab Vet Diagnóstico | `/laboratorio/gestion` (órdenes y resultados) |
| `test.patrocinador@example.com` | patrocinador | Patrocinador Demo | `/patrocinadores/nueva-campana`, boost-alerta, estadísticas |
| `test.transportista@example.com` | transportista | Transporte Pet Move | `/transportistas/solicitudes`, perfil-conductor, historial |
| `test.establecimiento@example.com` | establecimiento | Café Pet Friendly Central | `/establecimientos/nuevo`, `/establecimientos` |

## Cuentas preexistentes (no creadas por mí)

| Correo | Rol | Notas |
|---|---|---|
| `admin@michicondrias.com` | admin | Cuenta admin original |
| `hackminor@live.com.mx` | consumidor | Cuenta de desarrollo (UNVERIFIED) |

## Cómo se crearon

1. Registro público `POST /core/api/v1/users/register` (misma contraseña, KYC `UNVERIFIED`).
2. Asignación de `role_id` + `verification_status = VERIFIED` + `is_active` directo en la base (script vía SSH a la VM).
3. Login verificado: `POST /core/api/v1/login/access-token` devuelve token con `role` correcto y `/users/me` lo confirma.

> Los correos `@example.com` **no reciben correo**: el «olvidé mi contraseña» no llegará a esas bandejas. Para probar
> el envío de códigos usa tu correo real o revisa los logs del servicio `core`.

## Datos de prueba creados (para que las pantallas no salgan vacías)

| Módulo | Qué hay | A nombre de |
|---|---|---|
| Mascotas | **Max** (Labrador, 3 años, 28.5 kg), **Luna** (Siamés, 2 años, 4.2 kg) | `test.consumidor` |
| Mascotas | **Rocky** (Bulldog Francés, 18 meses, 11 kg) | `test.consumidor2` |
| Mascotas | **Toby Smoke** (Mestizo) — creada vía la app | `test.consumidor` |
| Carnet Max | Antirrábica, Moquillo, Parvovirus (refuerzo **vencido**), Vacuna Smoke Test, Vacuna UI Final | vet: Dra. Sofía |
| Carnet Max | 3 consultas (control anual, cojera, post-barrido) | vet: Dra. Sofía |
| Carnet Luna | Tríple Felina, Leucemia Felina + 1 consulta (esterilización) | vet: Dra. Sofía |
| Tienda | 8 productos (croquetas, juguetes, cama, correa, shampoo, antipulgas) **aprobados** | `test.vendedor` |
| Adopciones | **Canela**, **Tommy**, **Nube**, **Smoke Adoptable** (aprobadas) | `test.refugio` |
| Perdidas | **Toby** (Beagle, Condesa, CDMX) | `test.consumidor` |
| Directorio | Perfil de **Dra. Sofía Hernández** (medicina interna, cédula MV-2024-78421) | `test.veterinario` |

## Resultado del barrido (2026-10-17)

**Verificado que funciona** (con Playwright sobre la app web a 375×812, contra producción):

- Login / logout en los 17 roles.
- **~140 rutas** cargan sin 404 ni pantalla en blanco (35 de consumidor + las de cada pro/admin).
- Alta de mascota (validación, éxito, aparece en lista e Inicio).
- Alta de vacuna y consulta en el carnet (después del fix P0).
- Publicación de adopción (pasa por moderación).
- Búsqueda («croquetas» → 2 productos; «Max» → 1 mascota).
- Carrito: agregar producto, ver totales, «Proceder al pago».
- Ficha de mascota con pestañas Resumen · Salud · Historial.
- Notificaciones, Perfil con todas sus secciones, Ayuda.
- Admin: lista de usuarios y moderación.
- Vendedor: ve sus productos con Editar / Ocultar / Eliminar.

**Bugs encontrados:**

| # | Gravedad | Qué pasa | Estado |
|---|---|---|---|
| 1 | **P0** | Registrar vacunas/consultas daba **500** (FK): el backend guardaba `users.id` pero la FK apunta a `veterinarians.id`. Nadie podía usar el carnet. | **Corregido** (commit `58d177e`, aplicado en la VM). **Falta `git push`** (no hay credenciales con permiso de escritura). |
| 2 | P1 | Los **500 sin manejar no llevan headers CORS** → la app muestra «Failed to fetch» en vez del error real. | Detectado, sin corregir |
| 3 | P1 | `GET /products/seller/me` filtra `is_approved`: el vendedor **no ve sus productos pendientes** de moderación. | Detectado, sin corregir |
| 4 | P1 | `GET /users/me/avatar` responde **401** desde la app (con curl + token responde 200). | Detectado, sin corregir |
| 5 | P2 | En Explorar, el campo de búsqueda es `readonly` y **clic en el input no navega** (sí funciona al tocar el contenedor). | Detectado, sin corregir |

> **Nota de despliegue:** el fix del bug #1 está commiteado localmente y **aplicado a mano en la VM** para poder
> probar. Cuando tengas permiso de push, `git push origin main` lo llevará al repo (el siguiente deploy lo
> re-aplicará limpio). Si alguien despliega sin ese commit, el carnet se vuelve a romper.

---

## Actualización del barrido (2026-10-17, segundo pase)

### Botones e interacciones probados y que FUNCIONAN

| Qué se probó | Resultado |
|---|---|
| Login / logout (17 roles) | ✅ |
| ~140 rutas (todos los roles) | ✅ cargan, sin 404 |
| Alta de mascota (validación, éxito, lista + Inicio) | ✅ |
| Editar mascota / ficha con pestañas | ✅ |
| Alta de vacuna (dueño → NULL, vet → perfil) | ✅ |
| **Editar vacuna** (precarga + guardar) | ✅ |
| **Eliminar vacuna** (pide confirmación) | ✅ |
| Alta de consulta (vet) | ✅ |
| Publicar adopción (pasa por moderación) | ✅ |
| Solicitudes y publicaciones de adopción (refugio) | ✅ |
| **Editar producto** (abre form con validación «Falta la foto») | ✅ |
| **Ocultar / mostrar producto** | ✅ |
| **Eliminar producto** (pide confirmación) | ✅ |
| **2FA**: pantalla + «Iniciar Configuración» → QR, clave, verificar | ✅ |
| Carrito: agregar, quitar, dirección, «Proceder al pago» | ✅ |
| Checkout: crea pedido + llama a Stripe (ver nota) | ✅ |
| **Editar perfil** (nombre se guarda de verdad) | ✅ |
| **Compartir carnet con QR** | ✅ |
| Diagnóstico IA | ✅ |
| Búsqueda (productos, mascotas) | ✅ |
| Buscador de Explorar (clic → `/busqueda`) | ✅ **corregido** |
| Notificaciones (estado vacío correcto) | ✅ |
| Perdidas: lista + detalle | ✅ |
| Donaciones: pantalla + flujo | ✅ |
| Agenda del veterinario (filtros, estado vacío) | ✅ |
| Admin: usuarios, moderación | ✅ |

### Bugs corregidos en este pase

| # | Qué | Fix |
|---|---|---|
| B-02 | Los 500 sin manejar no llevaban headers CORS («Failed to fetch») | Los 17 servicios ahora añaden `Access-Control-Allow-Origin` en la respuesta de error del middleware |
| B-03 | `GET /products/seller/me` filtraba `is_approved` | El vendedor ve **todos** sus productos (también los pendientes) |
| B-04 | `GET /users/me/avatar` respondía 401 sin sesión | `useAvatar` solo consulta con `user` (sin token no se dispara) |
| B-05 | El buscador de Explorar no navegaba al clic | Se reemplazó el `TextInput` readonly por un `Text` (el input interceptaba el clic en web) |

### Notas de configuración (no son bugs de código)

- **Stripe**: `STRIPE_SECRET_KEY` **no está configurado** en el servicio `ecommerce` de producción → el botón
  «Proceder al pago» crea el pedido y luego muestra «Pagos no disponibles; tu carrito se conservó». Para probar el
  pago real hay que poner la clave de Stripe en `/etc/michicondrias/ecommerce.env`.
- **Moderación**: productos, adopciones y veterinarios nuevos quedan `is_approved: false` hasta que un admin los
  aprueba en `/admin/moderacion`. Es el flujo esperado.
- **Reseñas**: el botón de reseña aparece solo si el usuario compró el producto (`can_review`).
- **Agenda del vet**: muestra citas *recibidas* (no crea huecos); la disponibilidad se configura en
  `/mi-clinica/horarios`.

### Estado del código

- El fix P0 del carnet (`58d177e`) y los fixes B-02…B-05 están **commiteados/aplicados en la VM**.
- **Falta `git push`** (las credenciales de GitHub de esta máquina solo tienen lectura). Cuando tengas permiso,
  `git push origin main` sube todo. El detalle está en `PROGRESO_MOBILE.md` (Bitácora 2026-10-17).

---

## Inventario de datos de prueba (2026-10-17, llenado completo)

Todas las tablas del dominio tienen contenido para que **ninguna pantalla salga vacía** al entrar con los usuarios
de arriba. Conteos reales en producción:

| Módulo | Tabla | # | Qué hay |
|---|---|---|---|
| **Usuario final** | `pets` | 6 | Max, Luna (Ana) · Rocky, Mishi (Luis) · Toby Smoke · una más |
| | `vaccines` | 9 | Antirrábica, Moquillo, Parvovirus (vencida), Tríple Felina, Leucemia + pruebas |
| | `medical_records` | 5 | Control anual, cojera, esterilización, post-barrido, seguimiento |
| | `prescriptions` | 1 | Meloxicam con recordatorios |
| | `orders` + `order_items` | 4 + 5 | 2 pagados, 2 cancelados (pruebas de checkout) |
| | `product_reviews` | 2 | 5★ Pelota, 4★ Croquetas Gatito |
| | `donations` | 1 | $500 a refugios |
| | `notifications` | 9 | Citas, vacunas, pedidos, adopciones, admin (con `link`) |
| | `lost_pet_reports` | 1 | Toby (Beagle, Condesa) |
| **Tienda** | `products` | 8 | Croquetas ×2, juguetes ×2, cama, correa, shampoo, antipulgas (aprobados) |
| **Adopciones** | `adoption_listings` | 4 | Canela, Tommy, Nube, Smoke Adoptable |
| | `adoption_requests` | 3 | Luis se postula a las 3 primeras |
| **Clínica** | `clinics` | 1 | Hospital Michi Central (24/7, urgencias, aprobada) |
| | `clinic_services` | 5 | Consulta, vacunación, cirugía, laboratorio, urgencias |
| | `clinic_schedules` | 6 | Lun–Vie 9–18, Sáb 9–14 |
| | `appointments` | 3 | Pasadas y futuras (Max, Luna, Rocky) |
| **Seguros** | `insurance_plans` | 3 | Básico, Premium, Senior |
| | `pet_insurance_policies` | 3 | Pólizas activas |
| | `insurance_claims` | 3 | Reclamos (pendiente, aprobado, rechazado) |
| **Funeraria** | `funerary_services` | 3 | Cremación individual/colectiva, memorial |
| | `funerary_bookings` | 1 | Reserva de cremación |
| | `pet_memorial_posts` | 1 | «En memoria de Luna» |
| **Entrenadores** | `training_programs` | 3 | Obediencia, trucos, terapia de conducta |
| **Estilistas** | `grooming_services` | 3 | Baño y corte, spa felino, corte de raza |
| **Laboratorio** | `lab_test_catalog` | 4 | Biometría, perfil hepático, orina, coproparasitoscópico |
| | `lab_orders` | 2 | Órdenes con notas clínicas |
| **Transportes** | `driver_profiles` | 1 | Toyota Hilux, 3 mascotas, A/C |
| | `pet_rides` | 1 | Viaje a la clínica |
| **Patrocinadores** | `sponsor_campaigns` | 2 | Primavera Michi, Boost Perdidos |
| **Pet-friendly** | `pet_friendly_venues` | 3 | Café, parque, hotel |
| **Paseo/cuidado** | `walkers` + `sitters` | 1 + 1 | Perfiles con tarifas y zonas |
| | `walk_requests` | 1 | Solicitud de paseo |

## Bugs encontrados durante el llenado (2026-10-17)

| # | Servicio | Qué pasa | Estado |
|---|---|---|---|
| B-06 | aseguradoras | `_notify()` no aceptaba `link` → **500 al crear reclamos** | **Corregido** (firmas con `link`) |
| B-07 | transportistas | Mismo bug: `_notify()` sin `link` → **500 al solicitar viaje** | **Corregido** |
| B-08 | funeraria | Mismo bug: `_notify()` sin `link` → **500 al crear servicios** | **Corregido** |
| B-09 | directorio | `AppointmentCreate` no seteaba `date` cuando venía `appointment_date` + `start_time` → **500 al crear citas** | **Corregido** |

> Los fixes B-06…B-09 están **aplicados en la VM** y **commiteados**. `git push` los subirá cuando haya permiso.

---

## Tu cuenta real — `hackminor@live.com.mx` (Ricardo)

Rellena con datos de prueba para que al entrar veas todo con contenido:

| Qué tiene | Detalle |
|---|---|
| **Mascotas** | **Nami** (gato Carey, 4.5 kg) · **Kira** (Border Collie, 18.5 kg) · **Michi** (gatito mestizo, 1.8 kg) |
| **Carnet Nami** | 4 vacunas (1 vencida a propósito) + 3 consultas + 1 receta (enjuague bucal) |
| **Carnet Kira** | 3 vacunas (plan de cachorros) + 1 consulta |
| **Carnet Michi** | 1 vacuna (tríple felina) |
| **Compras** | 2 pedidos pagados (croquetas + juguetes) |
| **Citas** | 1 cita futura en Hospital Michi Central |
| **Notificaciones** | 8 (vacuna vencida, cita, adopciones, oferta, reporte, pedido…) |
| **Adopciones** | 1 solicitud enviada |
| **Donación** | $750 a refugios |
| **Perdidas** | Reporte de **Luna** (gato Carey, Del Valle) |
| **Seguro** | Póliza activa para Nami (MICH-2026-RIC-001) |

> **Tu contraseña no la toqué** — la que ya tenías sigue funcionando. Los datos se insertaron directo en la base.

---

## Inventario completo de datos (2026-10-17, seed masivo)

**70 tablas del dominio — 0 vacías.** Cualquier pantalla que abras tiene contenido real:

| Módulo | Tablas con datos |
|---|---|
| **Usuarios y roles** | 20 usuarios · 18 roles |
| **Mascotas y carnet** | 10 mascotas · 18 vacunas · 7 consultas · 2 recetas · 5 recordatorios · 1 record extended |
| **Tienda** | 8 productos · 6 pedidos · 8 items · 2 reseñas · 6 categorías |
| **Adopciones** | 4 publicaciones · 5 solicitudes · 2 formularios de compatibilidad · 1 contrato |
| **Perdidas** | 2 reportes · 2 avistamientos · 1 lost_pets |
| **Clínica** | 1 clínica · 5 servicios · 6 horarios · 4 citas · 2 excepciones · 3 recetas clínicas · 5 alertas · 5 métricas · 10 inventario · 2 cirugías · 2 videoconsultas |
| **Laboratorio** | 4 tests catálogo · 3 órdenes · 5 resultados · 3 citas · 2 órdenes de lab |
| **Seguros** | 3 planes · 4 pólizas · 3 reclamos |
| **Funeraria** | 3 servicios · 1 booking · 1 memorial · 1 defunción |
| **Entrenadores** | 3 programas · 2 inscripciones · 6 metas · 1 reseña |
| **Grooming/Estética** | 3 servicios · 4 citas · 1 reseña · 1 archivo |
| **Paseo/Cuidado** | 1 paseador · 1 cuidador · 2 paseos · 2 cuidados · 1+1 reseñas |
| **Transportes** | 1 conductor · 1 viaje |
| **Patrocinadores** | 2 campañas · 2 stats · 1 boost |
| **Pet-friendly** | 3 venues · 2 reseñas · 3 places · 2 reseñas · 1 cupón |
| **Donaciones** | 2 donaciones |
| **Notificaciones** | 28 (para todos los roles) |

### Cómo se llenó

- **API** para mascotas, productos, pedidos, adopciones, citas, seguros, funeraria, entrenadores, grooming, lab,
  transporte, patrocinadores, establecimientos, paseo/cuidado, donaciones (probando los endpoints de paso).
- **SQL directo** (vía SSH a la VM) para las 31 tablas que estaban vacías: reviews, formularios de adopción, contratos,
  citas de grooming, tests/resultados de lab, cirugías, inventario, recetas clínicas, alertas/métricas, videoconsultas,
  avistamientos, solicitudes de cuidado, metas de entrenamiento, defunciones, lugares pet-friendly, excepciones de
  horario, cupones, record extended.
- **Constraints respetados**: `lab_appointments.status` (pending/confirmed/completed/cancelled), `clinic_alerts.type`
  (emergency/inventory/laboratory/vaccination/followup) y `priority` (high/medium/low), `claimed_coupons.status`
  (active/redeemed/expired), `medical_records_extended` (enums de prognosis/trend/adherence).
