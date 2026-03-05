---
sidebar_position: 6
---

# Paso 5: Migraciones de Base de Datos

Las tablas se crean en **Neon PostgreSQL**, la base de datos serverless compartida por todos los microservicios.

## Ejecutar el SQL en Neon

1. Ir a [Neon Console](https://console.neon.tech/)
2. Abrir tu proyecto → **SQL Editor**
3. Pegar y ejecutar el SQL correspondiente al nuevo servicio

## SQL para Paseadores

```sql
-- =================== TABLAS DE PASEADORES ===================

-- Perfil de cada paseador registrado
CREATE TABLE IF NOT EXISTS walkers (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id VARCHAR(36) NOT NULL UNIQUE,      -- FK lógica al user de Core
    display_name VARCHAR(200) NOT NULL,
    bio TEXT,
    photo_url VARCHAR(500),
    location VARCHAR(300),
    price_per_walk FLOAT,                     -- Precio por paseo en MXN
    price_per_hour FLOAT,                     -- Precio por hora en MXN
    rating FLOAT DEFAULT 0.0,                 -- Calculado automáticamente
    total_walks INTEGER NOT NULL DEFAULT 0,   -- Contador de paseos completados
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    experience_years INTEGER DEFAULT 0,
    accepts_dogs BOOLEAN DEFAULT TRUE,
    accepts_cats BOOLEAN DEFAULT FALSE,
    max_pets_per_walk INTEGER NOT NULL DEFAULT 3,
    service_radius_km FLOAT DEFAULT 5.0,
    schedule_preference VARCHAR(100),         -- "Mañanas", "Tardes", "Flexible"
    gallery TEXT                              -- JSON array de URLs de imágenes
);

-- Solicitudes de paseo (lifecycle: pending → accepted → in_progress → completed)
CREATE TABLE IF NOT EXISTS walk_requests (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    walker_id VARCHAR(36) NOT NULL,
    client_user_id VARCHAR(36) NOT NULL,
    pet_id VARCHAR(36) NOT NULL,              -- FK lógica a mascotas
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    requested_date VARCHAR(20) NOT NULL,      -- Fecha ISO
    requested_time VARCHAR(10),               -- HH:MM
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    pickup_address TEXT,
    notes TEXT,
    total_price FLOAT                         -- Calculado automáticamente
);

-- Reseñas post-paseo
CREATE TABLE IF NOT EXISTS walk_reviews (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    walk_request_id VARCHAR(36) NOT NULL UNIQUE,  -- 1 reseña por paseo
    reviewer_user_id VARCHAR(36) NOT NULL,
    walker_id VARCHAR(36) NOT NULL,
    rating INTEGER NOT NULL,                      -- 1 a 5
    comment TEXT
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_walkers_user_id ON walkers(user_id);
CREATE INDEX idx_walkers_is_active ON walkers(is_active);
CREATE INDEX idx_walkers_is_verified ON walkers(is_verified);
CREATE INDEX idx_walk_requests_walker ON walk_requests(walker_id);
CREATE INDEX idx_walk_requests_client ON walk_requests(client_user_id);
CREATE INDEX idx_walk_requests_status ON walk_requests(status);
CREATE INDEX idx_walk_reviews_walker ON walk_reviews(walker_id);
CREATE INDEX idx_walk_reviews_request ON walk_reviews(walk_request_id);
```

## SQL para Cuidadores

```sql
-- =================== TABLAS DE CUIDADORES ===================

-- Perfil de cada cuidador registrado
CREATE TABLE IF NOT EXISTS sitters (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id VARCHAR(36) NOT NULL UNIQUE,
    display_name VARCHAR(200) NOT NULL,
    bio TEXT,
    photo_url VARCHAR(500),
    location VARCHAR(300),
    price_per_day FLOAT,                      -- MXN por día de hospedaje
    price_per_visit FLOAT,                    -- MXN por visita a domicilio
    rating FLOAT DEFAULT 0.0,
    total_sits INTEGER NOT NULL DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    service_type VARCHAR(30) NOT NULL DEFAULT 'both',  -- hosting, visiting, both
    max_pets INTEGER NOT NULL DEFAULT 2,
    has_yard BOOLEAN DEFAULT FALSE,
    home_type VARCHAR(100),                   -- "Casa", "Departamento", etc.
    accepts_dogs BOOLEAN DEFAULT TRUE,
    accepts_cats BOOLEAN DEFAULT TRUE,
    experience_years INTEGER DEFAULT 0,
    gallery TEXT
);

-- Solicitudes de cuidado (con rango de fechas)
CREATE TABLE IF NOT EXISTS sit_requests (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    sitter_id VARCHAR(36) NOT NULL,
    client_user_id VARCHAR(36) NOT NULL,
    pet_id VARCHAR(36) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    service_type VARCHAR(30) NOT NULL DEFAULT 'hosting',
    start_date VARCHAR(20) NOT NULL,          -- Fecha inicio ISO
    end_date VARCHAR(20) NOT NULL,            -- Fecha fin ISO
    address TEXT,
    notes TEXT,
    total_price FLOAT
);

-- Reseñas post-cuidado
CREATE TABLE IF NOT EXISTS sit_reviews (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    sit_request_id VARCHAR(36) NOT NULL UNIQUE,
    reviewer_user_id VARCHAR(36) NOT NULL,
    sitter_id VARCHAR(36) NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT
);

-- Índices
CREATE INDEX idx_sitters_user_id ON sitters(user_id);
CREATE INDEX idx_sitters_is_active ON sitters(is_active);
CREATE INDEX idx_sitters_is_verified ON sitters(is_verified);
CREATE INDEX idx_sit_requests_sitter ON sit_requests(sitter_id);
CREATE INDEX idx_sit_requests_client ON sit_requests(client_user_id);
CREATE INDEX idx_sit_requests_status ON sit_requests(status);
CREATE INDEX idx_sit_reviews_sitter ON sit_reviews(sitter_id);
CREATE INDEX idx_sit_reviews_request ON sit_reviews(sit_request_id);
```

## ¿Por qué estos índices?

| Índice | Consulta que acelera |
|---|---|
| `user_id` | "Obtener mi perfil de paseador/cuidador" (`WHERE user_id = ?`) |
| `is_active` | "Listar todos los activos" (la query más frecuente) |
| `is_verified` | Futuro filtro de "solo verificados" |
| `walker_id` / `sitter_id` | "Solicitudes recibidas por este proveedor" |
| `client_user_id` | "Mis solicitudes como cliente" |
| `status` | Filtrar por estado (`pending`, `completed`, etc.) |
| `walk_request_id` / `sit_request_id` | Buscar si ya existe una reseña para este servicio |

:::tip ¿Por qué no usamos foreign keys (FK)?
En una arquitectura de microservicios, los `user_id` y `pet_id` pertenecen a **otros servicios** (Core y Mascotas). No podemos crear foreign keys SQL entre tablas que viven en schemas lógicamente separados. Usamos **foreign keys lógicas** — validamos la existencia del recurso via API en tiempo de ejecución cuando es necesario.
:::
