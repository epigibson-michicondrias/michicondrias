# 🔐 API: Autenticación y Usuarios

Documentación de los endpoints de identidad y seguridad de Michicondrias.

## 1. Login y Sesión

### `POST /core/api/v1/login/access-token`
**Función:** `login(email, password)`
- **Descripción**: Intercambia credenciales por un token JWT.
- **Payload**: `username`, `password` (Form Data).
- **Respuesta**: `access_token`, `token_type`.

### `GET /core/api/v1/users/me`
**Función**: `getCurrentUser()`
- **Descripción**: Obtiene el perfil completo del usuario autenticado.
- **Respuesta**: `id`, `email`, `full_name`, `role_name`, `verification_status`.

## 2. Registro y KYC

### `POST /core/api/v1/users/register`
**Función**: `register(email, password, fullName)`
- **Descripción**: Registra un nuevo usuario con rol 'consumidor'.
- **Payload**: `email`, `password`, `full_name`.

### `GET /core/api/v1/users/me/kyc/presigned-urls`
**Función**: `getKYCPresignedUrls(extensions)`
- **Descripción**: Genera URLs firmadas para subir documentos de identidad a S3.
- **Parámetros**: extensiones de archivos (`id_front`, `id_back`, `proof`).

### `POST /core/api/v1/users/me/kyc/finalize`
**Función**: `finalizeKYC(data)`
- **Descripción**: Finaliza el proceso de verificación enviando las URLs de los archivos subidos.

## 3. Administración de Usuarios

### `POST /core/api/v1/users/{user_id}/verify`
**Descripción**: (Admin) Aprueba o rechaza el KYC de un usuario.
- **Parámetros**: `status` (VERIFIED / REJECTED).
