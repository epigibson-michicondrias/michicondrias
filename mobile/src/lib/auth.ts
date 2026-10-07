import { apiFetch, setToken, removeToken, getToken } from "./api";
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://michicondrias.duckdns.org";
const USER_KEY = 'cached_user';
// Clave que usaban versiones anteriores para el rol; ya nadie la lee y se borra al cerrar sesión.
const LEGACY_ROLE_KEY = 'user_role';

export interface LoginResponse {
    require_2fa: boolean;
    temp_token?: string;
    access_token?: string;
    token_type?: string;
}

export interface User {
    id: string;
    email: string;
    full_name: string;
    is_active: boolean;
    role_id?: string;
    role_name?: string;
    verification_status: "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";
    id_front_url?: string;
    id_back_url?: string;
    proof_of_address_url?: string;
    document_type?: string;
    created_at?: string;
    is_two_factor_enabled?: boolean;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const res = await fetch(`${BASE_URL}/core/api/v1/login/access-token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Credenciales incorrectas");
    }

    const data: LoginResponse = await res.json();

    // If 2FA is required, don't store token yet — return for UI to handle
    if (data.require_2fa) {
        return data;
    }

    if (data.access_token) {
        await setToken(data.access_token);
    }

    return data;
}

export async function verify2FALogin(
    tempToken: string, 
    code: string
): Promise<{ access_token: string; token_type: string }> {
    const res = await fetch(`${BASE_URL}/core/api/v1/login/verify-2fa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ temp_token: tempToken, code }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Código de verificación inválido");
    }

    const data = await res.json();
    
    await setToken(data.access_token);

    return data;
}

export async function requestPasswordReset(email: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/core/api/v1/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "No se pudo enviar el correo de recuperación");
    }
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/core/api/v1/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: newPassword }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "No se pudo restablecer la contraseña");
    }
}

export async function register(
    email: string,
    password: string,
    fullName: string
): Promise<User> {
    const res = await fetch(`${BASE_URL}/core/api/v1/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email,
            password,
            full_name: fullName,
        }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Error al registrar");
    }

    return res.json();
}

export async function isAuthenticated(): Promise<boolean> {
    const token = await getToken();
    return !!token;
}

export async function getCurrentUser(): Promise<User> {
    return await apiFetch<User>("core", "/users/me");
}

// ── Copia local del usuario ─────────────────────────────────────────
// Permite abrir la app sin conexión con la sesión guardada. Solo datos básicos (SecureStore admite ~2 KB por valor).

async function storageSet(key: string, value: string) {
    if (Platform.OS === 'web') localStorage.setItem(key, value);
    else await SecureStore.setItemAsync(key, value);
}

async function storageGet(key: string): Promise<string | null> {
    if (Platform.OS === 'web') return localStorage.getItem(key);
    return await SecureStore.getItemAsync(key);
}

async function storageDelete(key: string) {
    if (Platform.OS === 'web') localStorage.removeItem(key);
    else await SecureStore.deleteItemAsync(key);
}

export async function saveCachedUser(user: User) {
    const { id, email, full_name, is_active, role_id, role_name, verification_status, created_at, is_two_factor_enabled } = user;
    try {
        await storageSet(USER_KEY, JSON.stringify({ id, email, full_name, is_active, role_id, role_name, verification_status, created_at, is_two_factor_enabled }));
    } catch { /* sin almacenamiento: solo se pierde el arranque sin conexión */ }
}

export async function getCachedUser(): Promise<User | null> {
    try {
        const raw = await storageGet(USER_KEY);
        return raw ? (JSON.parse(raw) as User) : null;
    } catch {
        return null;
    }
}

/** Borra todo lo que identifica la sesión en el dispositivo (token, copia del usuario y claves viejas). */
export async function clearStoredSession() {
    await removeToken();
    try { await storageDelete(USER_KEY); } catch { /* nada que borrar */ }
    try { await storageDelete(LEGACY_ROLE_KEY); } catch { /* nada que borrar */ }
}

// Admin Methods
export async function getPendingVerifications(): Promise<User[]> {
    return await apiFetch<User[]>("core", "/users/pending-verifications");
}

export async function verifyUser(userId: string, status: "VERIFIED" | "REJECTED"): Promise<void> {
    await apiFetch("core", `/users/${userId}/verify?status=${status}`, {
        method: "POST",
    });
}

export {
    apiFetch,
    setToken,
    removeToken,
    getToken
};
