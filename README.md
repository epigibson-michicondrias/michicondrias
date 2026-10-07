# 🐾 Michicondrias

Plataforma integral para el cuidado de mascotas: salud y carnet digital, directorio de clínicas, adopciones, mascotas
perdidas, tienda, servicios profesionales (paseo, cuidado, adiestramiento, estética, transporte), seguros, funeraria y más.

Monorepo con una **app móvil** (Expo / React Native) y **17 microservicios** (FastAPI) sobre una base PostgreSQL compartida.

## Arquitectura

| Capa | Tecnología |
|---|---|
| App móvil | Expo SDK 55, React Native 0.83, expo-router, React Query, `expo-updates` (OTA) |
| Backend | FastAPI + SQLAlchemy 2.0 + Alembic, un proceso `uvicorn` por servicio (Python 3.12, sin Docker) |
| Base de datos | PostgreSQL en Supabase (pooler de transacciones, puerto 6543), compartida por todos los servicios |
| Almacenamiento | Oracle Object Storage vía API S3 (bucket público de fotos + bucket privado para documentos KYC) |
| Servidor | VM Oracle Cloud (ARM, Always Free): `systemd` + Caddy como proxy inverso con prefijo por servicio |
| Pagos | Stripe (pedidos, suscripción Michi-Tracker Pro y donaciones) |
| IA | Claude (Anthropic) para el triage de síntomas, con reglas de urgencia como piso |
| CI/CD | GitHub Actions: `deploy-oracle.yml` (principal) y `deploy-aws-lambda.yml` (manual, alterno) |

La API pública es `https://michicondrias.duckdns.org/<servicio>/api/v1/...` (Caddy quita el prefijo y los servicios usan
`PROXY_PREFIX` como `root_path`). El puerto local de cada servicio está en [`deploy/services.conf`](deploy/services.conf),
que es la única fuente de verdad para systemd, Caddy y el despliegue.

## Microservicios

| Servicio | Responsabilidad |
|---|---|
| `core` | Usuarios, login (JWT, 2FA), roles, verificación de identidad (KYC), notificaciones, ajustes y analíticas |
| `mascotas` | Mascotas, galería, triage con IA, plan de dieta, Michi-Tracker |
| `carnet` | Carnet digital: vacunas, consultas, recetas y recordatorios |
| `directorio` | Clínicas, veterinarios, servicios, citas, agenda, pacientes, recetas, cirugías, inventario y videoconsultas |
| `laboratorio` | Estudios clínicos: citas, órdenes y resultados |
| `aseguradoras` | Planes, cotización, pólizas y reclamos |
| `adopciones` | Publicaciones, solicitudes, formularios de compatibilidad y contratos |
| `perdidas` | Mascotas perdidas, avistamientos y lugares pet-friendly |
| `ecommerce` | Catálogo, carrito/pedidos, vendedores, pagos Stripe, reseñas y donaciones |
| `paseadores`, `cuidadores` | Perfiles profesionales, solicitudes, calendario y reseñas |
| `entrenadores`, `estilistas` | Programas de adiestramiento y servicios de grooming, con reseñas |
| `transportistas` | Viajes para mascotas: tarifa, conductores, aceptación y seguimiento |
| `funeraria` | Servicios funerarios, reservas, memoriales y reporte de defunción |
| `patrocinadores` | Campañas, boost de alertas y estadísticas |
| `establecimientos` | Lugares y comercios pet-friendly, cupones y reseñas |

## Roles

El JWT lleva el rol del usuario. Todos empiezan como `consumidor`; para pasar a un rol profesional hay que completar la
verificación de identidad y que un `admin` la apruebe (Perfil → *Ser Profesional*). Tras la aprobación, la app pide un
token nuevo y el usuario ve sus herramientas sin volver a iniciar sesión.

`consumidor`, `admin` y los profesionales: `veterinario`, `hospital`, `refugio`, `hogar_temporal`, `vendedor`, `paseador`,
`cuidador`, `patrocinador`, `establecimiento`, `funeraria`, `aseguradora`, `laboratorio`, `entrenador`, `estilista`,
`transportista`. La app muestra a cada rol su panel en Inicio y una pestaña de *Herramientas*; el mapa rol → pantallas está
en `mobile/src/constants/roleTools.ts` y el backend exige el rol en los endpoints profesionales.

## Estructura del repositorio

```
mobile/        App Expo (app/ = pantallas con expo-router, src/ = hooks, servicios, componentes, constants/ = tema y tokens)
backend/       Un directorio por microservicio: michicondrias_<servicio>/app + alembic/
deploy/        Despliegue: Oracle (principal), AWS Lambda (alterno) y services.conf
docs/          Documentación (Docusaurus) y auditorías
scripts/       Utilidades de migración y datos de prueba
.github/       Workflows de despliegue
```

## Desarrollo local

### Backend

Cada servicio es independiente. Necesitas Python 3.12 y un PostgreSQL accesible.

```bash
cd backend/michicondrias_core
python3.12 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

export DATABASE_URL=postgresql://usuario:clave@localhost:5432/michicondrias
export SECRET_KEY=un-secreto-largo
export INTERNAL_SERVICE_TOKEN=un-token-interno      # llamadas entre servicios
uvicorn app.main:app --port 8000
```

El resto de variables (almacenamiento S3, Stripe, `ANTHROPIC_API_KEY`, Resend, etc.) están descritas en
[`deploy/oracle/common.env.example`](deploy/oracle/common.env.example). Sin `ANTHROPIC_API_KEY` el triage usa solo reglas
de urgencia; sin claves de Stripe, los pagos responden con un error claro.

Las migraciones son por servicio, cada uno con su propia tabla de versiones: `cd backend/michicondrias_<servicio> && alembic upgrade head`.

### App móvil

```bash
cd mobile
npm install
cp .env.example .env     # EXPO_PUBLIC_API_URL, EXPO_PUBLIC_STORAGE_URL, EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
npx expo start           # o: npx expo start --web --port 3000
```

Opcionales: `EXPO_PUBLIC_TERMS_URL`, `EXPO_PUBLIC_PRIVACY_URL`, `EXPO_PUBLIC_SUPPORT_PHONE`, `EXPO_PUBLIC_SUPPORT_WHATSAPP`.
Si apuntas `EXPO_PUBLIC_API_URL` a un proxy local, debe replicar las rutas `/<servicio>/api/v1`.

Comprobación de tipos: `cd mobile && npx tsc --noEmit -p .`

**Sistema de diseño:** paleta *Midnight & Gold* en `mobile/constants/palettes.ts`, tokens (espaciado, radios, sombras,
tipografía) en `mobile/constants/design.ts` y componentes base en `mobile/src/components` (`Button`, `Card`, `ListRow`,
`SectionHeader`, `Skeleton`, `EmptyState`, `RoleGuard`…). Usa los colores del tema (`useTheme()`), no hex sueltos.

### Compilar el APK

La app se distribuye como APK firmado (`com.michicondrias.mobile`) y recibe cambios de JavaScript por OTA (canal
`production`, `runtimeVersion` 1.0.0). Los cambios nativos (permisos, esquema de enlaces, versión) requieren un APK nuevo.

```bash
cd mobile/android
./gradlew assembleRelease     # APK en app/build/outputs/apk/release/
```

El keystore de release (`mobile/android/app/michicondrias-release.keystore`) **no está en el repositorio**: guárdalo en un
lugar seguro, sin él no se pueden publicar actualizaciones de la misma app. `android/` está en `.gitignore`.

## Despliegue

Un `git push` a `main` que toque `backend/**` o `deploy/**` ejecuta `deploy-oracle.yml`: sincroniza el código a la VM
(`rsync`), actualiza el venv de cada servicio si cambió su `requirements.txt`, reinicia y comprueba la salud de los 17.

**Las migraciones no corren solas.** Antes de desplegar código que cambie el esquema, aplica `alembic upgrade head` del
servicio contra la base de producción (las migraciones del repositorio son aditivas e idempotentes).

La guía completa (puesta en marcha de la VM, Caddy, almacenamiento y cómo volver a AWS) está en
[`deploy/README.md`](deploy/README.md). Secrets de CI: `ORACLE_HOST`, `ORACLE_SSH_KEY` y, opcional, `ORACLE_USER`.

## Seguridad

- Ningún secreto va en el repositorio: se configuran en `/etc/michicondrias/common.env` en la VM y como secrets de GitHub.
- Los servicios validan el JWT y el rol por su cuenta; las llamadas entre servicios usan `INTERNAL_SERVICE_TOKEN`.
- Los documentos de identidad se guardan en un bucket privado y se sirven con URLs firmadas temporales.
- Eliminar la cuenta anonimiza los datos personales y se bloquea si hay pedidos, viajes o suscripciones en curso.

## Documentación

- [`deploy/README.md`](deploy/README.md): despliegue y operación.
- [`docs/AUDITORIA_APP.md`](docs/AUDITORIA_APP.md): auditoría de pantallas y flujos de la app.
