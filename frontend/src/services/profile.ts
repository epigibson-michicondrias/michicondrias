import { apiFetch } from "../lib/api";
import type { User } from "../types/auth";

/** Perfil propio (GET /users/me) con los campos opcionales de perfil. */
export type MyProfile = User & {
    phone?: string | null;
    location?: string | null;
    bio?: string | null;
    avatar_url?: string | null;
};

export interface ProfileUpdate {
    full_name?: string;
    /** Cadena vacía = borrar el dato. */
    phone?: string;
    location?: string;
    bio?: string;
}

export async function getMyProfile(): Promise<MyProfile> {
    return apiFetch<MyProfile>("core", "/users/me");
}

/** El usuario edita su nombre, teléfono, ubicación y bio (PATCH /users/me). Solo se envían los campos indicados. */
export async function updateMyProfile(data: ProfileUpdate): Promise<MyProfile> {
    return apiFetch<MyProfile>("core", "/users/me", {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}

/**
 * Elimina la cuenta (DELETE /users/me). Requiere la contraseña actual (y el código 2FA si está activo).
 * El backend responde 409 si hay pedidos, viajes o suscripciones en curso (el mensaje explica cuál).
 */
export async function deleteMyAccount(password: string, totpCode?: string): Promise<void> {
    await apiFetch<{ deleted: boolean }>("core", "/users/me", {
        method: "DELETE",
        body: JSON.stringify({ password, totp_code: totpCode || undefined }),
    });
}
