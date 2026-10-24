/**
 * push (web) — Stub: las notificaciones push no aplican en web.
 * Evita cargar `expo-notifications` allí (el módulo avisa que los listeners de push no están
 * soportados en web). Misma API que `push.ts` para que los callers no distingan plataforma.
 */

export async function registerPushToken(): Promise<string | null> {
    return null;
}

export async function unregisterPushToken(): Promise<void> {}
