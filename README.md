# 🐾 Michicondrias - Plataforma Integral para Mascotas

Este es el repositorio monorepo de Michicondrias, una arquitectura de microservicios desplegada de forma serverless.

## Arquitectura
- **Frontend**: Next.js (Vercel)
- **Backend**: FastAPI (AWS Lambda + Mangum)
- **Base de Datos**: PostgreSQL (Neon Serverless)
- **Almacenamiento**: AWS S3
- **CI/CD**: GitHub Actions

## Microservicios
- `core`: Gestión de usuarios y KYC.
- `adopciones`: Flujo de adopción de mascotas.
- `mascotas`: Catálogo de mascotas.
- `perdidas`: Mascotas perdidas y lugares pet-friendly.
- `carnet`: Expediente médico y vacunación.
- `directorio`: Directorio de veterinarios y servicios.
- `ecommerce`: Donaciones y productos.
