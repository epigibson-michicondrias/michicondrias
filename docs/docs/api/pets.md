# 🐾 API: Mascotas y Adopciones

Gestión de identidades permanentes y procesos de adopción.

## 1. Mascotas (Permanentes)

### `GET /mascotas/api/v1/pets/user/{user_id}`
**Función**: `getUserPets(userId)`
- **Descripción**: Obtiene la lista de mascotas registradas de un usuario.

### `GET /mascotas/api/v1/pets/{pet_id}`
**Función**: `getPetById(petId)`
- **Descripción**: Detalle completo de una mascota (incluye CHIP y salud).

### `POST /mascotas/api/v1/pets/`
**Función**: `createPet(petData)`
- **Descripción**: Registra una nueva mascota.

## 2. Adopciones (Listings)

### `GET /adopciones/api/v1/pets/presigned-url`
**Función**: `getAdopcionesPresignedUrl(ext)`
- **Descripción**: Genera una URL firmada de S3 (`michicondrias-storage-1`) para subir la fotografía de la mascota directamente desde el frontend evitando los límites de API Gateway.

### `GET /adopciones/api/v1/pets/`
**Función**: `getListings()`
- **Descripción**: Lista pública de mascotas en adopción (Aprobadas).

### `POST /adopciones/api/v1/pets/`
**Función**: `createListing(data)`
- **Descripción**: Publica una nueva mascota para adopción (Requiere aprobación).

### `POST /adopciones/api/v1/pets/{listing_id}/request`
**Función**: `requestAdoption(listingId, data)`
- **Descripción**: Envía una solicitud de adopción.

## 3. Administración (Adopciones)

### `POST /adopciones/api/v1/pets/admin/{id}/approve`
**Función**: `approveListing(id)`
- **Descripción**: (Admin) Aprueba una publicación.

### `POST /adopciones/api/v1/pets/admin/requests/{request_id}/approve`
**Función**: `approveAdoption(requestId)`
- **Descripción**: (Admin) Finaliza la adopción y crea automáticamente el registro en el servicio de Mascotas.
