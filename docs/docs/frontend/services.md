# ⚛️ Frontend: Arquitectura y Servicios

Guía técnica de la estructura de servicios de la WebApp de Michicondrias (Next.js).

## 1. Arquitectura de Servicios (`src/lib/services`)

Todos los servicios utilizan un patrón consistente basado en la utilidad `apiFetch` (definida en `src/lib/api.ts`).

### Capa de Comunicación (`apiFetch`)
- **Descripción**: Wrapper de `fetch` que maneja inyección de tokens JWT, prefijos de microservicios y respuestas de error estandarizadas.
- **Rutas**: `/core`, `/mascotas`, `/adopciones`, `/ecommerce`, `/directorio`.

## 2. Servicios de Negocio

### `mascotas.ts`
- **Funciones Críticas**:
    - `getUserPets(userId)`: Carga el carnet digital del usuario.
    - `getPetById(petId)`: Carga el perfil dinámico de la mascota.
    - `getLostPets(isFound)`: Consulta el board de mascotas perdidas.

### `adopciones.ts`
- **Funciones Críticas**:
    - `getListings()`: Feed principal de adopciones.
    - `getAdopcionesPresignedUrl(ext)`: Genera URL temporal en AWS S3 para subir fotos.
    - `requestAdoption(listingId, data)`: Procesa el formulario de solicitud.
    - `createListing(data)`: Crea una nueva mascota en adopción, asignando la URL pública de la foto.

### `moderacion.ts`
- **Funciones Críticas**:
    - Centraliza las llamadas de revisión administrativa de rutas dispares.
    - `approveAdoption()` / `rejectAdoption()`: Rutean correctamente hacia `adopciones/pets/admin/*`.
    - `approveLostPet()` / `rejectLostPet()`: Rutean correctamente hacia `perdidas/reports/admin/*`.

### `ecommerce.ts`
- **Funciones Críticas**:
    - `getProducts()`: Catálogo de suministros.
    - `createOrder(data)`: Motor de compras transaccional.

## 3. Manejo de Estado y Auth (`lib/auth.ts`)
- `login(email, password)`: Sincroniza el JWT con `localStorage` y el estado de la aplicación.
- `getCurrentUser()`: Hidrata los componentes con los datos del perfil y roles.
- `hasRole(...roles)`: Guardia de seguridad para el Sidebar y Rutas Protegidas.
