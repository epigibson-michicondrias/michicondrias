import { apiFetch } from "../lib/api";

/** El usuario edita su propio nombre (PATCH /users/me). */
export async function updateMyProfile(data: { full_name: string }): Promise<{ id: string; full_name: string | null }> {
    return apiFetch<{ id: string; full_name: string | null }>("core", "/users/me", {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}
