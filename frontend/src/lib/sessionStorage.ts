/**
 * Copia local de la sesión (espejo de `mobile/src/lib/sessionStorage.ts`): usuario para abrir sin red y borrado
 * completo al cerrar sesión. El token vive en `lib/api`.
 */
import { removeToken } from "./api";
import type { User } from "../types/auth";

const USER_KEY = "cached_user";
const LEGACY_ROLE_KEY = "user_role";

export async function saveCachedUser(user: User) {
  const { id, email, full_name, is_active, role_id, role_name, verification_status, created_at, is_two_factor_enabled } = user;
  try {
    localStorage.setItem(
      USER_KEY,
      JSON.stringify({ id, email, full_name, is_active, role_id, role_name, verification_status, created_at, is_two_factor_enabled }),
    );
  } catch {
    // Sin almacenamiento: solo se pierde el arranque sin conexión.
  }
}

export async function getCachedUser(): Promise<User | null> {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export async function clearStoredSession() {
  await removeToken();
  try {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(LEGACY_ROLE_KEY);
  } catch {
    // Nada que borrar.
  }
}
