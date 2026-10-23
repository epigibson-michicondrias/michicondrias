/**
 * Servicio de autenticación (core): login, 2FA, registro, recuperación de contraseña,
 * usuario actual, renovación de token y cambio a cuenta profesional.
 * No guarda sesión: el token lo guardan los hooks vía `AuthContext.signIn` / `refreshSession`.
 */
import { apiFetch, getToken } from '../lib/api';
import type {
    LoginResponse,
    RefreshTokenResponse,
    RoleUpgradeResponse,
    TokenResponse,
    User,
} from '../types/auth';

/** Login OAuth2 (form-urlencoded). Con 2FA activo devuelve `temp_token` en lugar del token final. */
export async function login(email: string, password: string): Promise<LoginResponse> {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    return apiFetch<LoginResponse>('core', '/login/access-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
    });
}

/** Completa el login con el código de la app de autenticación y devuelve el token final. */
export async function verify2FALogin(tempToken: string, code: string): Promise<TokenResponse> {
    return apiFetch<TokenResponse>('core', '/login/verify-2fa', {
        method: 'POST',
        body: JSON.stringify({ temp_token: tempToken, code }),
    });
}

/** Registro público (rol consumidor). */
export async function register(email: string, password: string, fullName: string): Promise<User> {
    return apiFetch<User>('core', '/users/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, full_name: fullName }),
    });
}

/** Envía el correo de recuperación. El backend responde siempre igual para no revelar si el correo existe. */
export async function requestPasswordReset(email: string): Promise<void> {
    await apiFetch('core', '/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
    });
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
    await apiFetch('core', '/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, new_password: newPassword }),
    });
}

/** Restablece la contraseña con el código de 6 dígitos del correo (de un solo uso, expira a los 30 min). */
export async function resetPasswordWithCode(email: string, code: string, newPassword: string): Promise<void> {
    await apiFetch('core', '/reset-password/code', {
        method: 'POST',
        body: JSON.stringify({ email, code, new_password: newPassword }),
    });
}

export async function getCurrentUser(): Promise<User> {
    return apiFetch<User>('core', '/users/me');
}

/** Token nuevo con el rol actual de la base (el JWT lleva el rol: hay que renovarlo cuando cambia). */
export async function refreshToken(): Promise<RefreshTokenResponse> {
    return apiFetch<RefreshTokenResponse>('core', '/users/me/refresh-token', { method: 'POST' });
}

/** Cuenta profesional. El backend exige el KYC aprobado y devuelve un token que ya lleva el rol nuevo. */
export async function upgradeRole(roleName: string): Promise<RoleUpgradeResponse> {
    return apiFetch<RoleUpgradeResponse>('core', `/users/me/upgrade-role?role_name=${encodeURIComponent(roleName)}`, {
        method: 'POST',
    });
}

/** Rol que trae el JWT guardado en el dispositivo (null si no hay sesión o el token no se puede leer). */
export async function getStoredTokenRole(): Promise<string | null> {
    try {
        const token = await getToken();
        if (!token) return null;
        const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(b64)).role ?? null;
    } catch {
        return null;
    }
}
