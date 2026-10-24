# Auditoría de seguridad X2–X8 — Backend Michicondrias

**Fecha:** 2026-10-24 · **Alcance:** `backend/michicondrias_*/` (17 microservicios FastAPI) · **Modo:** solo lectura + análisis estático. **No se modificó código.**

---

## Resumen ejecutivo

| | |
|---|---|
| Hallazgos totales | **15** |
| **P0** | **1** (credenciales de BD en el código fuente) |
| **P1** | **10** |
| **P2** | **4** |
| Falsos positivos descartados | 6 (ver «Lo que no es hallazgo») |

El hallazgo más urgente (**X8.1**) es la contraseña de la base de datos de producción (Supabase y Neon) escrita en
claro dentro del repositorio: en un `config.py` que se despliega y en scripts de migración. Cualquiera con acceso al
repo —o al historial de git— tiene la credencial de la base de producción.

En control de acceso hay dos problemas de raíz distintos:

1. **El admin no pasa varias guardas** (X2): los `require_*` de 5 servicios y los checks de dueño de otros tantos
   dejan fuera al rol `admin`, así que el «superadmin» no puede moderar ni actuar sobre recursos ajenos.
2. **Ocho servicios no tienen moderación** (X3): definen `require_admin` y nunca lo usan. Paseadores, cuidadores y
   campañas de patrocinadores se publican **sin pasar por aprobación**.

---

## Inventario y método

- **409 rutas** extraídas de `@router.(get|post|put|patch|delete)` en `backend/**/app/api/**` (208 cambian estado).
- **Semgrep** (OSS 1.182.1, `--metrics=off`) sobre `backend/` con los packs `p/security-audit`, `p/python`,
  `p/secrets`, `p/jwt`, `p/owasp-top-ten`, `p/fastapi`. Salida en `output/semgrep-backend/`. 237 reglas, 461 archivos,
  **31 hallazgos** (ver «Semgrep» al final).
- **Inventario de entry-points**: cada ruta state-changing clasificada por sus `Depends(...)` reales
  (`require_admin`, `require_<rol>`, `get_current_user_id`, `get_identity`, `RoleChecker`, `require_internal_token`).
- **Triaje manual**: cada hallazgo se confirmó leyendo la ruta, la guarda y el modelo. No se reporta patrón de
  Semgrep sin ruta de acceso verificada.

### Mecanismo de auth (contexto)

- **core** (`app/api/deps.py:57-74`): `require_role(*roles)` deja pasar siempre a `admin`. Carga usuario y rol desde
  la BD. Rechaza tokens temporales (`is_temp`).
- **Los otros 16**: validan el JWT con `SECRET_KEY` y leen el claim `role`. Cada uno define sus `require_<rol>`,
  **sin criterio común sobre `admin`** (unos lo incluyen, otros no).

---

## Tabla de hallazgos

### X2 — Admin sin pasar guardas / admin bloqueado por guardas

| ID | Sev | Servicio | `archivo:línea` | Descripción | Impacto | Corrección propuesta |
|---|---|---|---|---|---|---|
| X2.1 | P1 | aseguradoras | `michicondrias_aseguradoras/app/api/deps.py:44-62` | `require_aseguradora` solo acepta `role == "aseguradora"` y `require_consumidor_or_aseguradora` solo `consumidor`/`aseguradora`. **`admin` no pasa.** | El admin no puede crear/editar pólizas, aprobar reclamos ni verificar recibos. Cualquier endpoint que use esas guardas le devuelve 403. | Añadir `admin` a los roles aceptados (como ya hace `require_establecimiento`). |
| X2.2 | P1 | laboratorio | `michicondrias_laboratorio/app/api/deps.py:55-72` | `require_veterinario` solo `veterinario`; `require_laboratorio` solo `laboratorio`. **`admin` no pasa.** | El admin no puede ver órdenes de lab, subir resultados, gestionar tests ni alertas de anomalías. | Incluir `admin` en ambas guardas. |
| X2.3 | P1 | entrenadores | `michicondrias_entrenadores/app/api/deps.py:54-62` | `require_entrenador` solo acepta `entrenador`. **`admin` no pasa.** | El admin no puede moderar programas, metas ni revisiones de video. | Añadir `admin` al rol permitido. |
| X2.4 | P1 | patrocinadores | `michicondrias_patrocinadores/app/api/deps.py:54-62` | `require_patrocinador` solo acepta `patrocinador`. **`admin` no pasa.** | El admin no puede pausar ni editar campañas de terceros (solo el dueño de la campaña). | Añadir `admin`; en el check de dueño de `PATCH /campaigns/{id}` (`sponsors.py:136`) permitir también a admin. |
| X2.5 | P1 | funeraria | `michicondrias_funeraria/app/api/routes/funerary.py:170,264` | `RoleChecker(["funeraria"])` en `POST /funerary/services` y `GET /funerary/bookings/provider`. A diferencia de `services/mine` y `services/{id}/active` (que sí incluyen `admin`), aquí **`admin` no pasa.** | El admin no puede dar de alta servicios funerarios ni ver las reservas de un proveedor. | Añadir `"admin"` a ambas listas `RoleChecker([...])`. |
| X2.6 | P2 | directorio, adopciones, ecommerce, perdidas, venues | `directorio/.../clinics.py:141,171,188,212` · `adopciones/.../pets.py:159,177` · `ecommerce/.../products.py:157,184` · `perdidas/.../places.py:102` · `establecimientos/.../venues.py:128,152` | Los **checks de dueño** (`owner_id != user_id` / `published_by != user_id` / `seller_id != user_id` / `added_by != user_id`) **no aceptan al admin**. Solo `DELETE /places/{id}` sí lo contempla (`places.py:120`). | El admin no puede corregir un abuso en un listing ajeno, ni editar/borrar clínicas, productos, lugares o venues inapropiados sin pasar por el dueño. | Cambiar a `if owner != user_id and role != "admin":` (patrón ya usado en `adopciones/.../pets.py:63` y `directorio/.../clinics.py:127`). |

### X3 — Servicios sin moderación

| ID | Sev | Servicio | `archivo:línea` | Descripción | Impacto | Corrección propuesta |
|---|---|---|---|---|---|---|
| X3.1 | P1 | paseadores, cuidadores, entrenadores, establecimientos, estilistas, laboratorio, patrocinadores, aseguradoras | `*/app/api/deps.py` (def. de `require_admin` en 8 servicios) | Los 8 servicios **definen `require_admin` y jamás lo usan** en ninguna ruta. No hay cola de pendientes, ni aprobación, ni suspensión de profesionales/campañas por parte del admin. | Cualquier usuario con rol profesional (paseador, cuidador, entrenador, estilista, laboratorio, patrocinador, aseguradora, establecimiento) publica contenido que **nunca pasa por revisión**. | Implementar `GET /admin/pending`, `POST /admin/{id}/approve|reject|suspend` en cada servicio (como ya existe en adopciones, directorio, ecommerce y perdidas). |
| X3.2 | P1 | paseadores, cuidadores | `michicondrias_paseadores/app/api/routes/walkers.py:206` · `michicondrias_cuidadores/app/api/routes/sitters.py:210` · modelos `walker.py:21` / `sitter.py:21` | El modelo tiene `is_verified = Column(Boolean, default=False)` pero **nunca se filtra** en `list_walkers` / `list_sitters` (solo `is_active == True`) y **ningún endpoint lo pone a `True`**. El alta (`walkers.py:225-243`) deja el perfil listable al instante. | Cualquiera que obtenga el rol `paseador`/`cuidador` aparece **de inmediato** en el directorio público, sin verificación alguna. | Filtrar por `is_verified == True` en el listado público y crear el flujo de aprobación (X3.1) que lo active. |
| X3.3 | P1 | patrocinadores | `michicondrias_patrocinadores/app/crud/crud_sponsor.py:15-23` · `sponsors.py:69-76` | `create_campaign` crea la campaña con `active=True`. `GET /campaigns/active` (público) devuelve **todas** las activas. No existe campo `is_approved` ni revisión. | Un patrocinador publica anuncios (con `target_link` externo) **sin aprobación** directamente en la app. | Añadir `is_approved=False` al crear y un `GET /campaigns/admin/pending` + approve/reject (o al menos filtrar por `is_approved`). |
| X3.4 | P2 | adopciones | `michicondrias_adopciones/app/api/routes/pets.py:133` | `GET /pets/{listing_id}` devuelve listings **no aprobados** a cualquiera que tenga una solicitud activa sobre ellos (además de dueño y admin). | Un solicitante puede ver una publicación mientras está en moderación. Alcance limitado (solo quien ya solicitó). | Decisión de producto: si se quiere ocultar del todo, quitar `has_request` del bypass. |

### X4 — Lectura de datos ajenos

| ID | Sev | Servicio | `archivo:línea` | Descripción | Impacto | Corrección propuesta |
|---|---|---|---|---|---|---|
| X4.1 | P1 | ecommerce | `michicondrias_ecommerce/app/api/routes/payments.py:89-110` | `POST /payments/create-subscription-session/{pet_id}` toma `user_id` del token pero **nunca comprueba que la mascota sea de ese usuario**. El `metadata` del checkout lleva `pet_id` y `user_id` que luego usa el webhook para activar la suscripción. | Cualquier usuario autenticado puede crear una sesión de pago para **cualquier `pet_id`**. Al pagar, el webhook `PATCH /pets/{pet_id}/subscription` (mascotas, con token interno) activa **Michi-Tracker Pro en la mascota de otra persona** y asocia el `stripe_subscription_id` a un pet ajeno. | Antes de crear la sesión, verificar `SELECT owner_id FROM pets WHERE id = :pet_id` y comparar con `user_id` (patrón ya usado en `mascotas/app/api/routes/pets.py`). |
| X4.2 | P1 | mascotas | `michicondrias_mascotas/app/api/routes/pets.py:236-243` | `GET /pets/adopted-from/{listing_id}` usa `identity_or_internal` (cualquier autenticado o token interno) pero **devuelve la mascota completa sin comprobar que `identity.user_id` sea su `owner_id`**. | Cualquier usuario autenticado puede leer los datos de **cualquier mascota** conociendo el `listing_id` de su adopción (UUID del listing de adopciones, que se comparte en notificaciones y URLs). | Añadir `if pet.owner_id != identity.get("user_id") and identity.get("role") != "admin": 403`. |
| X4.3 | P2 | funeraria | `michicondrias_funeraria/app/api/routes/funerary.py:312-325,341-360` | `GET /funerary/certificate/{death_id}/pdf` y `/{death_id}/file` son **públicos** (sin `Depends` de auth). Devuelven `pet_name`, `cause_of_death`, `date_of_death`, `cremation_type`, `urn_model` y generan el PDF. | Cualquiera con el `death_id` (UUID que viaja en enlaces de notificaciones) puede descargar el certificado de defunción y conocer la **causa de la muerte** de la mascota y datos del duelo. | Exigir auth y verificar que el llamante es el dueño de la mascota, la funeraria implicada o un admin (o emitir URLs firmadas de corta duración). |

### X5 — Escritura sin dueño

| ID | Sev | Servicio | `archivo:línea` | Descripción | Impacto | Corrección propuesta |
|---|---|---|---|---|---|---|
| X5.1 | P1 | ecommerce | `michicondrias_ecommerce/app/api/routes/payments.py:89` | (Misma raíz que X4.1.) `POST /create-subscription-session/{pet_id}` **no es solo lectura**: dispara el flujo de pago/Stripe que, vía webhook, **escribe** `has_active_subscription` y `stripe_subscription_id` sobre la mascota indicada. Es una escritura sin comprobación de dueño. | Ver X4.1. | Ver X4.1. |
| X5.2 | P2 | directorio, ecommerce, perdidas, venues, adopciones | ver X2.6 | Los `PUT`/`DELETE` con check de dueño que **excluyen al admin** (X2.6) también son un problema de escritura: el admin no puede corregir contenido abusivo ajeno. | El admin no tiene poder de moderación sobre listings ajenos. | Ver X2.6. |

> El resto de `PUT`/`DELETE` revisados (productos, pedidos, mascotas, places, venues, campañas, citas, reclamos,
> carnet) **sí** verifican dueño o rol autorizado. No se encontraron `PUT`/`DELETE` completamente abiertos.

### X6 — Datos sensibles expuestos

| ID | Sev | Servicio | `archivo:línea` | Descripción | Impacto | Corrección propuesta |
|---|---|---|---|---|---|---|
| X6.1 | P1 | core | `michicondrias_core/app/schemas/user.py:64-72` · `routes/users.py:228-238,260-288` | `UserResponse` incluye `id_front_url`, `id_back_url` y `proof_of_address_url` (**documentos de identidad KYC**). Ese schema se usa en `GET /users/` y `GET /users/search` (listados de **todos** los usuarios, admin-only) y en `GET /users/pending-verifications`. | El admin (o quien comprometa una cuenta de admin) obtiene las **URLs de los documentos de identidad (INE/pasaporte) y comprobantes de domicilio de todos los usuarios**, no solo de los que está revisando. Son objetos S3 accesibles por URL. | Usar un schema sin KYC para los listados generales y reservar `UserKYCResponse` para `pending-verifications` y el detalle de un usuario en revisión. |
| X6.2 | P1 | perdidas | `michicondrias_perdidas/app/api/routes/lost_pets.py:70-77` | `_for_viewer` solo oculta `contact_phone` / `contact_email` cuando **no hay sesión** (`if not viewer_id`). **Cualquier usuario autenticado** ve el teléfono y el correo del denunciante de un reporte de mascota perdida. | Un consumidor cualquiera puede extraer teléfonos y correos de todos los reportes de perdidas activos (fácil de automatizar: `GET /perdidas/` con cualquier JWT). | Ocultar `contact_phone`/`contact_email` a todos los que no sean el propio `reporter_id` (o un admin). |
| X6.3 | P2 | core | `michicondrias_core/app/schemas/user.py:21-28` · `routes/users.py:52-54` | `GET /users/me` devuelve `id_front_url`, `id_back_url`, `proof_of_address_url` propios (esperado), pero el patrón de exponer URLs S3 de KYC en cualquier respuesta `User*` facilita filtraciones si algún consumidor del schema se amplía. | Riesgo latente más que exposición activa. | Mantener el KYC fuera de `UserBase`/`UserResponse` y usar un schema dedicado solo donde hace falta. |

### X7 — Inyección / SQL crudo

| ID | Sev | Servicio | `archivo:línea` | Descripción | Impacto | Corrección propuesta |
|---|---|---|---|---|---|---|
| X7.1 | P2 | core, cuidadores, entrenadores, estilistas, paseadores | `core/.../system.py:106` · `cuidadores/.../sitters.py:36` · `entrenadores/.../training.py:38` · `estilistas/.../grooming.py:69` · `paseadores/.../walkers.py:37` | Se usan **f-strings dentro de `text()`**: `text(f"SELECT COUNT(*) FROM {table}")` y `text(f"SELECT id, {column} FROM {table} WHERE id IN :ids")`. En todos los casos los valores de `table`/`column` son **literales en el propio código** (`"pets"`, `"name"`, tupla fija de tablas) — **no hay entrada de usuario**. | **No explotable hoy** (los interpolados no son controlables), pero es una trampa de mantenimiento: si alguien pasa un valor del request a esos helpers, se convierte en SQLi. Semgrep lo marca como `avoid-sqlalchemy-text`. | Mantener helpers privados con argumentos tipados/`Literal[...]`, o usar un allowlist de tablas/columnas antes de interpolar. |

> **X7: no se encontró ninguna inyección SQL explotable.** Todas las consultas con datos de usuario usan
> parámetros `:param` (`text("... WHERE id = :id"), {"id": ...}`), incluido el buscador global de
> `core/app/api/routes/search.py` (además escapa los comodines `LIKE`).

### X8 — Config / secretos

| ID | Sev | Servicio | `archivo:línea` | Descripción | Impacto | Corrección propuesta |
|---|---|---|---|---|---|---|
| X8.1 | **P0** | raíz del repo y directorio | `backend/michicondrias_directorio/app/core/config.py:8` · `backend/migrate_to_supabase.py:5` · `backend/migrate_adopciones_v2.py:5` · `backend/migrate_mascotas_v2.py:4` · `backend/migrate_missing_features.py:4` · `backend/run_restore.py:5` · `backend/check_pet.py:4` · `backend/enrich_pet.py:3` · `backend/scripts/supabase_setup/add_2fa_cols.py:5` | **Credenciales de base de datos de producción en claro dentro del código fuente:** `postgresql://postgres:Michicondrias201094*@db.zaegmfufrzjmjiemrvvp.supabase.co:5432/postgres` (Supabase, incluida como **valor por defecto** en `directorio/app/core/config.py:8`, que se despliega a producción) y `postgresql://neondb_owner:npg_QjveaCY3fGb4@ep-jolly-mouse-...` (Neon, en `check_pet.py`). | **Acceso total a la base de producción** para cualquiera que pueda leer el repositorio o su historial de git. El `config.py` de directorio hace que el servicio arranque apuntando a prod incluso sin variables de entorno. | 1) **Rotar ya** las contraseñas de Supabase y Neon. 2) Sacar las credenciales del código: leer `DATABASE_URL` solo de variables de entorno. 3) En `directorio/app/core/config.py` dejar `DATABASE_URL: str \| None = None` como en core. 4) Limpiar los scripts de migración (que lean `os.environ`). 5) Dado que ya está en el historial de git, la rotación es obligatoria (no basta con borrar el archivo). |
| X8.2 | P1 | todos los servicios | `*/app/core/config.py` (p. ej. `core/app/core/config.py:17`) | `SECRET_KEY: str = "super_secreto_cambiar_en_produccion"` — valor por defecto **en el código**. Si la variable de entorno no se define, todos los servicios firman y validan JWT con una clave pública/débil conocida. | Falsificación de tokens JWT con cualquier `role` (incluido `admin`) y `sub` arbitrario. | Eliminar el default: `SECRET_KEY: str` (requerido, Pydantic falla al arrancar si no está). Generar una clave aleatoria de 32+ bytes en producción y rotarla. |
| X8.3 | P2 | todos los servicios | `*/Dockerfile:1-10` | Los 16 Dockerfiles **no declaran `USER`** (Semgrep `missing-user`): el proceso corre como **root** dentro del contenedor. El `CMD` además incluye `--reload` (auto-reload de uvicorn, pensado para desarrollo). | Si se explota una vulnerabilidad en la app, el atacante tiene root en el contenedor. `--reload` puede dejar procesos de vigilancia y comportamientos de desarrollo en producción. | Añadir `RUN useradd -m app && USER app` (o similar) y quitar `--reload` del `CMD` de producción. |
| X8.4 | P2 | core, ecommerce | `core/app/api/routes/system.py:62-66` · `ecommerce/app/api/routes/categories.py:113-133` | `GET /system/public` es un endpoint público que expone ajustes del sistema (ya filtra `debug_mode` y `last_sync` — bien). `GET /categories/init-db/seed` **escribe** en la BD siendo un `GET` (está protegido por `require_admin`, y solo actúa si la tabla está vacía). | `GET` que muta es un problema de diseño (los proxies/CDN podrían cachearlo o repetirlo); funcionalmente hoy está acotado a admin. | Cambiar a `POST /categories/init-db/seed`. |

---

## Lo que **no** es hallazgo (para no repetir trabajo)

| Tema | Por qué no es hallazgo |
|---|---|
| **Inyección SQL (X7)** | Todas las consultas con datos de usuario usan parámetros `:param`. Los f-strings de `text()` (X7.1) interpolar solo literales internos. El buscador de core escapa comodines `LIKE`. |
| **`hashed_password` / `reset_code_hash` / `two_factor_secret` en respuestas** | Ningún schema de respuesta (`UserResponse`, `UserMeResponse`, `Token`, `LoginResponse`) incluye esos campos. Se usan solo en servidor. |
| **CORS** | `allow_origins` está restringido a `localhost:3000/3001` y `https://michicondrias.vercel.app` (core) / `https://michicondrias.vercel.app` (resto). **No** hay `*` con `allow_credentials=True`. |
| **Token temporal de 2FA (X1)** | Ya resuelto: los 17 servicios rechazan `is_temp` en `_decode_token` / `get_current_user`. No se reabre. |
| **WebSocket de notificaciones** | `core/.../notifications.py:109-118` valida el JWT y exige `payload.sub == user_id`. Correcto. |
| **`POST /notifications/broadcast`** | Protegido con `require_internal_token` (cabecera `X-Internal-Token`). Correcto. |
| **Owner checks en carnet** | `carnet/app/api/pet_access.py` comprueba `owner_id` o `VET_ROLES` (incluye `admin`). Correcto. |
| **`GET /categories/init-db/seed` como vector de escritura masiva** | Es `require_admin` y solo inserta si la tabla está vacía. El problema es que es un `GET` (X8.4), no que esté abierto. |
| **CORS abierto / debug activo en producción** | `debug_mode` se guarda en settings y **no se expone** en `/system/public`. No se encontró `app = FastAPI(debug=True)` ni `allow_origins=["*"]`. |
| **SQL f-string en scripts `check_pet.py` / `enrich_pet.py`** | Son scripts locales de una sola ejecución con `PET_ID` hardcodeado; no son un endpoint. Su problema real es la credencial (X8.1). |

---

## Semgrep — cómo reproducir

Packs ejecutados (modo «importante»: `--severity WARNING --severity ERROR`):

```bash
mkdir -p output/semgrep-backend/{raw,results}
uvx semgrep \
  --config p/security-audit --config p/python --config p/secrets \
  --config p/jwt --config p/owasp-top-ten --config p/fastapi \
  --metrics=off --json \
  --output output/semgrep-backend/raw/all-scan.json \
  --severity WARNING --severity ERROR \
  backend/
```

Resultado: 237 reglas · 461 archivos · 31 hallazgos (todos `ERROR`):

| Regla | # | Veredicto |
|---|---|---|
| `dockerfile.security.missing-user` | 15 | **Confirmado** → X8.3 (todos los Dockerfiles) |
| `generic.secrets...detected-username-and-password-in-uri` | 9 | **Confirmado** → X8.1 (scripts + `directorio/config.py`) |
| `python.sqlalchemy...avoid-sqlalchemy-text` | 7 | 2 son scripts locales (X8.1); 5 son los f-strings con literales → X7.1 (no explotables) |

Artefactos: `output/semgrep-backend/raw/all-scan.json`, `output/semgrep-backend/raw/scan.log`.
No se ejecutó Semgrep Pro (solo OSS): no hay análisis de flujo entre archivos; los checks de dueño se verificaron
manualmente.

---

## Prioridad de arreglo sugerida

1. **Ahora (P0):** rotar credenciales de Supabase/Neon y sacarlas del código (X8.1). Rotar `SECRET_KEY` y quitar el default (X8.2).
2. **Siguiente (P1):** cerrar X4.1/X5.1 (dueño de la mascota en pagos) y X4.2; ocultar teléfono/correo en perdidas (X6.2); sacar el KYC de los listados (X6.1); filtrar paseadores/cuidadores por `is_verified` (X3.2).
3. **Después (P1/P2):** alinear las guardas para que `admin` pase (X2.1–X2.5) y los checks de dueño acepten admin (X2.6); crear moderación en los 8 servicios sin ella (X3.1, X3.3); proteger certificados funerarios (X4.3).
4. **Limpieza (P2):** `USER` en Dockerfiles y quitar `--reload` (X8.3), `POST` en el seed (X8.4), endurecer helpers SQL (X7.1).
