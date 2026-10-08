/**
 * Copia local de la sesión en el dispositivo: usuario para abrir sin red y borrado completo al cerrar sesión.
 * El token vive en `lib/api`; aquí solo la copia del usuario y las claves viejas.
 */
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { removeToken } from './api';
import type { User } from '../types/auth';

const USER_KEY = 'cached_user';
// Clave que usaban versiones anteriores para el rol; ya nadie la lee y se borra al cerrar sesión.
const LEGACY_ROLE_KEY = 'user_role';

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

/** Guarda solo los datos básicos del usuario: SecureStore admite ~2 KB por valor. */
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
