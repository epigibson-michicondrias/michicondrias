---
name: nuevo-endpoint
description: Agrega o ajusta un endpoint en un microservicio FastAPI de Michicondrias y lo conecta en la app móvil (schema, router, migración alembic aditiva si hace falta, servicio, tipo y hook). Úsala cuando una pantalla necesite un endpoint que no existe o que devuelve datos con otra forma.
---

# Nuevo endpoint de punta a punta

## 0. Antes
- Confirma que no existe ya: busca en `backend/michicondrias_<svc>/app/` (routers/api, schemas, models) y en
  `mobile/src/services/`. Muchas veces existe con otro nombre o en otro servicio.
- Elige el servicio dueño del dato (tabla de microservicios en `README.md`).

## 1. Backend (`backend/michicondrias_<svc>/app/`)
- Sigue la estructura del propio servicio (lee un endpoint vecino y cópiale el estilo: dependencias de auth,
  `get_db`, manejo de errores, paginación).
- Schema Pydantic de entrada/salida. Modelo SQLAlchemy si hay tabla nueva o columna nueva.
- Rol: exige el rol con la misma dependencia que usan los demás endpoints profesionales; debe coincidir con
  `ROUTE_ACCESS` en `mobile/src/constants/roleTools.ts`.
- Llamadas entre servicios: usar `INTERNAL_SERVICE_TOKEN` como ya lo hacen otros servicios.
- **Migración** (si cambia el esquema): nueva revisión en `alembic/versions/`, **aditiva e idempotente**
  (columnas nullable o con default, `IF NOT EXISTS`). Nunca editar una migración existente (el hook lo bloquea).

## 2. App móvil
- Tipo en `mobile/src/types/<dominio>.ts` igual al schema de salida.
- Función en `mobile/src/services/<svc>.ts` usando el cliente y `API_URLS` de `src/lib/api.ts`.
- Hook en `mobile/src/hooks/<modulo>/` (query o mutation + invalidación de las queryKeys afectadas).
- La pantalla consume el hook, nunca el servicio directo.

## 3. Verificar
- Backend: levantar el servicio local (ver README) y probar con `curl`, incluido el caso sin permiso (401/403).
- App: `cd mobile && npm run check`.

## 4. Avisar al usuario (siempre)
- Si hay migración: hay que correr `alembic upgrade head` del servicio contra producción **antes** de desplegar.
- Un push a `main` que toque `backend/**` despliega a producción automáticamente.
- Si la app depende del endpoint nuevo, publicar OTA solo después de que el backend esté desplegado.
