/**
 * Tipos de autenticación y cuenta — espejo de los schemas de core.
 * Fuente única: los servicios e hooks importan de aquí (decisión L7).
 */

export type VerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

/** Usuario propio (registro, /users/me y respuesta de upgrade-role). */
export interface User {
    id: string;
    email: string;
    full_name: string;
    is_active: boolean;
    role_id?: string;
    role_name?: string;
    verification_status: VerificationStatus;
    id_front_url?: string;
    id_back_url?: string;
    proof_of_address_url?: string;
    document_type?: string;
    created_at?: string;
    is_two_factor_enabled?: boolean;
}

/** Login OAuth2. Con 2FA activo devuelve `temp_token` en lugar del token final. */
export interface LoginResponse {
    require_2fa: boolean;
    temp_token?: string;
    access_token?: string;
    token_type?: string;
}

export interface TokenResponse {
    access_token: string;
    token_type: string;
}

/** POST /users/me/refresh-token: token nuevo con el rol y la verificación actuales de la base. */
export interface RefreshTokenResponse extends TokenResponse {
    role_name: string;
    verification_status: VerificationStatus;
}

/** POST /users/me/upgrade-role: usuario actualizado + token que ya lleva el rol nuevo. */
export type RoleUpgradeResponse = User & TokenResponse;
