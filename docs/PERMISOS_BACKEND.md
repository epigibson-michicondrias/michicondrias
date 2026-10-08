# Inventario de permisos del backend (W1, 2026-10-08)

Base de la matriz de roles de la consola de admin (W4-A → `frontend/src/constants/permissions.ts`) y del diseño de
permisos editables (W7). Generado leyendo `backend/michicondrias_<svc>/app/api/**`. Rutas con prefijo
`/<svc>/api/v1`. **Acceso**: `público` · `autenticado` · `dueño` (autenticado + dueño del recurso) · lista de roles ·
`admin` · `interno` (cabecera `X-Internal-Token`).

## Mecanismo
- **core** (`app/api/deps.py`): decodifica el JWT y **carga usuario y rol desde la BD**; rechaza inactivos y tokens
  temporales (`is_temp`). `require_role(*roles)` siempre deja pasar a `admin`.
- **Los otros 16**: validan el JWT con `SECRET_KEY` y leen el **claim `role`** (lo escribe core en `login.py:62,74`;
  sin claim → `consumidor`). Cada servicio define sus `require_<rol>` sin criterio común sobre `admin`. El rol queda
  congelado en el token hasta `POST /users/me/refresh-token` (la app lo renueva en `useSessionSync`).
- **Dueño**: comprobación manual (`sub` vs `owner_id`, `published_by`, `seller_id`…); mascotas por SQL a `pets`.
- Roles sembrados (`core/app/seed_roles.py`): consumidor, admin, veterinario, clinica, hospital, refugio,
  hogar_temporal, vendedor, paseador, cuidador, patrocinador, establecimiento, funeraria, laboratorio, aseguradora,
  entrenador, estilista, transportista. Alias: `walker`→paseador, `sitter`→cuidador; `clinica`≈`hospital` (legado).

## Matriz por servicio

### core
| Método | Ruta | Acceso | Nota |
|---|---|---|---|
| POST | /login/access-token, /login/verify-2fa, /forgot-password, /reset-password, /reset-password/code | público | |
| POST | /users/register | público | siempre crea `consumidor` |
| GET/PATCH/DELETE | /users/me | autenticado | admin no puede borrarse |
| * | /users/me/kyc/*, /me/avatar/*, /me/2fa/*, /me/refresh-token | autenticado | |
| POST | /users/me/upgrade-role | autenticado + KYC aprobado | solo `SELF_SERVICE_ROLES` |
| GET/POST | /users/ | admin | |
| PATCH/DELETE | /users/{id} | admin | no puede quitarse su propio rol |
| GET | /users/pending-verifications, /users/stats/summary | admin | |
| POST | /users/{id}/verify, /users/{id}/toggle-status | admin | |
| GET | /roles/ | autenticado | |
| POST/PUT/DELETE | /roles/* | admin | |
| GET | /settings/public | público | |
| * | /settings/*, /analytics/dashboard, /admin/system/* | admin | |
| GET | /search/ | autenticado | |
| GET/PATCH | /notifications/me, /me/unread-count, /me/read-all, /{id}/read | autenticado / dueño | |
| POST | /notifications/broadcast | interno | |

### adopciones (`/pets`)
| Método | Ruta | Acceso | Nota |
|---|---|---|---|
| GET | /, /{id} | público | `/{id}` devuelve también no aprobadas |
| GET | /presigned-url, /me, /requests/me | autenticado | |
| POST | / | autenticado | cualquier rol publica; queda pendiente |
| PUT/DELETE | /{id} | dueño | admin no pasa |
| POST | /{id}/request, /adoptions/forms | autenticado | no a la propia |
| GET | /requests/{id} | dueño (solicitante o publicador), admin | |
| GET/POST/DELETE | /admin/pending, /admin/requests/pending, /admin/{id}/approve, /admin/{id}/reject | admin | |
| GET/PUT/POST | /admin/{id}/requests, /admin/requests/{id}/status, /admin/requests/{id}/approve | publicador, admin | ruta "/admin" sin guarda de admin |
| GET | /adoptions/refuge/applications | refugio, admin | `hogar_temporal` fuera |
| POST/PUT | /adoptions/contracts/sign, /adoptions/forms/{id}/status | publicador, admin | |

### directorio
| Método | Ruta | Acceso | Nota |
|---|---|---|---|
| GET | clínicas, veterinarios, reseñas, rating, servicios, horarios, slots | público | |
| GET/POST | /clinics/me, /clinics/ | autenticado | alta pendiente de aprobación |
| PUT/DELETE + gestión | /clinics/{id}, vets de la clínica, catálogo, horario, métricas, pacientes, alertas, cirugías, inventario, laboratorio, recetas | dueño de la clínica | admin no pasa |
| * | /clinics/admin/*, /veterinarians/admin/*, /catalog/admin/all | admin | |
| GET | /clinics/hospitals/clinics, /clinics/hospitals/veterinarians | hospital, admin | `clinica` fuera |
| POST | /veterinarians/ | veterinario, clinica, hospital, admin | |
| PUT | /veterinarians/{id} | dueño | |
| POST | reseñas de clínica/vet | autenticado | no a sí mismo |
| POST/GET | /appointments/, /appointments/me | autenticado | |
| GET/PUT | /appointments/clinic/{cid}, /{id}/confirm, /{id}/complete | dueño de la clínica | |
| PUT | /appointments/{id}/cancel · /reschedule | cliente o clínica · cliente | |
| POST/GET | /consultations/, /consultations/me | autenticado | mascota propia |
| GET | /consultations/vet/incoming | veterinario, clinica, hospital, admin | |

### carnet
| Método | Ruta | Acceso |
|---|---|---|
| GET | registros, vacunas y recordatorios por mascota | dueño, veterinario, clinica, hospital, admin (y vets registrados) |
| POST/PUT/DELETE | /records/*, /vaccines/* | dueño, veterinario, clinica, hospital, admin |
| POST | /reminders/{id}/check | dueño |

### ecommerce
| Método | Ruta | Acceso | Nota |
|---|---|---|---|
| GET | productos, reseñas, categorías, donaciones | público | producto no aprobado: vendedor o admin |
| GET | /products/seller/me, /presigned-url, /{id}/review-eligibility | autenticado | |
| POST | /products/ | vendedor, admin | |
| PUT/DELETE | /products/{id} | dueño | admin no pasa |
| POST | /products/{id}/reviews | autenticado + compra pagada | |
| * | /products/admin/*, /categories/* (escritura), /orders/admin/* | admin | `GET /categories/init-db/seed` escribe |
| POST | /donations/, /donations/checkout | público | |
| GET | /donations/mine · /donations/{id} | autenticado · dueño | |
| POST/GET | /orders/, /orders/me, /orders/seller/me | autenticado | |
| GET/PATCH | /orders/{id}, /orders/{id}/status | comprador o vendedor | comprador solo cancela |
| POST | /payments/create-checkout-session/{order} | dueño del pedido | |
| POST | /payments/create-subscription-session/{pet}, /billing/portal-session | autenticado | sin check de dueño de la mascota |

### mascotas
| Método | Ruta | Acceso |
|---|---|---|
| GET | /lost-pets/*, /places/* | público |
| POST | /lost-pets/, /places/ | autenticado |
| GET | /pets/user/{uid} | dueño, admin, interno |
| GET | /pets/admin/all | admin |
| GET | /pets/{id} | dueño, veterinario, clinica, hospital, admin, interno |
| PUT/DELETE | /pets/{id} | dueño |
| GET | /pets/{id}/passport/share · /pets/passport/view/{token} | dueño · público firmado |
| POST | /pets/ai/symptom-check · /pets/{id}/ai/diet-plan | autenticado · dueño |
| PATCH | /pets/{id}/subscription, /pets/by-subscription/{id} | interno |

### perdidas
| Método | Ruta | Acceso |
|---|---|---|
| GET | /reports/*, /places/*, reseñas | público |
| POST/GET | altas, presigned, /reports/mine | autenticado |
| POST/PATCH/DELETE | /reports/{id}/resolve, /reports/{id}, /broadcast | dueño |
| PATCH | /reports/{id}/location | dueño o interno (tracker) |
| POST · GET | /reports/{id}/sightings | autenticado (no dueño) · dueño, admin |
| * | /reports/admin/* | admin |
| PUT · DELETE | /places/{id} | dueño · dueño, admin |

### paseadores (`/walkers`) y cuidadores (`/sitters`)
| Método | Ruta | Acceso |
|---|---|---|
| GET | /, /{id}, /{id}/reviews | público |
| GET | /presigned-url, /me/profile, /requests/me, /requests/incoming | autenticado |
| POST | / | paseador/walker, admin · cuidador/sitter, admin |
| PUT | /{id} | dueño |
| POST · PATCH · POST | /{id}/request · /requests/{id}/status · /requests/{id}/review | dueño de la mascota · cliente o prestador · cliente |
| — | moderación | **no existe** |

### laboratorio (`/labs`)
| Acceso | Rutas |
|---|---|
| público | GET /tests |
| veterinario (sin admin) | POST/GET /orders, /orders/vet |
| laboratorio (sin admin) | /orders/lab, /pending, /tests/mine, /appointments/provider, /alerts/anomalies, resultados, estado, tests |
| dueño, lab/vet de la orden, admin | GET /pet/{id}/history |
| autenticado (dueño) | POST/GET /appointments, /appointments/client; PATCH estado (cliente solo cancela) |

### aseguradoras (`/insurance`)
| Acceso | Rutas |
|---|---|
| público | GET /plans, POST /quote |
| aseguradora (sin admin, + dueña) | /policies, /policies/provider, planes, /claims/provider, estado y verificación de reclamos |
| dueño, aseguradora de la póliza, admin | GET /policies/pet/{id} |
| consumidor, aseguradora | POST /claims |
| autenticado (dueño) | GET /claims/mine, POST /subscribe |

### entrenadores (`/training`)
| Acceso | Rutas |
|---|---|
| público | GET /programs, reseñas |
| entrenador (sin admin) | programas, metas, /enrollments/provider, revisión de video |
| autenticado (dueño) | POST /enroll, GET /enrollments/client |
| cliente o entrenador | estado e inscripción/metas |
| autenticado + completado | POST reseña |

### establecimientos (`/venues`)
| Acceso | Rutas |
|---|---|
| público | /search, /{id}, reseñas, score |
| establecimiento, admin | POST / |
| establecimiento, admin + dueño | PUT/DELETE /{id}, /coupons/redeem (admin falla en el check de dueño) |
| autenticado | /{id}/coupons/claim, /{id}/reviews |

### estilistas (`/grooming`)
| Acceso | Rutas |
|---|---|
| público | /services, slots, reseñas |
| estilista, admin (+ dueño) | servicios propios, /appointments/provider, fotos |
| dueño de la mascota, admin | POST /appointments, GET /files/{pet} (también estilista con cita) |
| autenticado / dueño | /appointments/client, estado, reseñas |

### funeraria (`/funerary`)
| Acceso | Rutas |
|---|---|
| público | /services, memorial, feed, **certificados PDF** |
| funeraria, veterinario, consumidor, clinica, hospital, admin | POST /death-report |
| dueño de la mascota, admin | POST /memorial/post |
| funeraria (sin admin) | POST /services, GET /bookings/provider |
| funeraria, admin (+ dueño) | /services/mine, activar servicio |
| autenticado / dueño | reservas del cliente y su estado |

### patrocinadores (`/sponsors`)
| Acceso | Rutas |
|---|---|
| público | /campaigns/active, /geo-target, /{id}/click |
| patrocinador (sin admin, + dueño) | crear y editar campañas, /boost-alert, /campaigns/stats — **sin moderación** |

### transportistas (`/rides`)
| Acceso | Rutas |
|---|---|
| público | POST /estimate |
| dueño de la mascota | POST /request |
| autenticado | GET /my, /drivers/available |
| transportista, admin | solicitudes, viajes propios, historial, perfil; aceptar/rechazar/iniciar/terminar/ubicación |
| cliente, conductor o admin | cancelar, track, detalle |
| cliente | calificar |

## Inconsistencias encontradas (para la otra sesión / backlog de backend)
1. 🚨 **El token temporal de 2FA se acepta** en aseguradoras, cuidadores, paseadores, entrenadores, establecimientos,
   estilistas, funeraria, laboratorio, patrocinadores y transportistas (su `deps.py` no rechaza `is_temp`). Ese token
   ya lleva el `role` (`core login.py:62`), así que con él **se salta el 2FA** en esos servicios. El token de reset
   (`login.py:147`) también lleva `role`.
2. **Admin no pasa** `require_aseguradora`, `require_entrenador`, `require_veterinario`/`require_laboratorio`
   (laboratorio), `require_patrocinador`, `RoleChecker(["funeraria"])`, `require_consumidor_or_aseguradora`.
3. **Los checks de dueño excluyen a admin** en todo directorio, adopciones `pets.py:151,168`, ecommerce
   `products.py:154,181`, perdidas `places.py:102` y venues `venues.py:88,111`.
4. `require_veterinario` (laboratorio) solo acepta `veterinario`; carnet/mascotas usan
   `VET_ROLES = {veterinario, clinica, hospital, admin}`.
5. `clinica` no entra donde sí entra `hospital` (directorio `clinics.py:224,239`).
6. `require_admin` definido y nunca usado en 8 servicios: **no hay moderación de admin** en paseadores, cuidadores,
   entrenadores, establecimientos, estilistas, laboratorio, patrocinadores ni aseguradoras.
7. Rutas `/admin/*` de adopciones sin guarda de admin (`pets.py:298,309,338`); son de quien publicó.
8. `hogar_temporal` no puede ver `/adoptions/refuge/applications` (`pets.py:485`).
9. Lista cerrada en `POST /funerary/death-report` (`funerary.py:100`) y en `POST /insurance/claims` (solo
   `consumidor`).
10. Falta check de dueño en `POST /payments/create-subscription-session/{pet_id}` (`payments.py:89`) y en
    `GET /pets/adopted-from/{listing_id}` (`mascotas pets.py:236`).
11. Públicos dudosos: certificados de defunción (`funerary.py:312,341`); `GET /adopciones/pets/{id}` sin aprobar
    (`pets.py:114`).
12. `GET /categories/init-db/seed` escribe en la BD (`categories.py:113`).
13. Mensajes de error mezclados inglés/español; `lost-pets`/`places` duplicados entre mascotas y perdidas.
