/**
 * push — Registro del token de notificaciones push (expo-notifications) contra el backend.
 *
 * El endpoint `core /push-tokens` lo habilita el backend; hasta que esté en producción el registro
 * falla en silencio y no debe bloquear el arranque ni el login: los callers envuelven la llamada.
 *
 * No configura FCM ni credenciales de Firebase: eso es una pieza aparte (credenciales del proyecto Expo).
 * En web hay un stub (`push.web.ts`) que no carga expo-notifications: el módulo avisa allí que los
 * listeners de push no están soportados y no hace falta.
 */
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { apiFetch } from '../lib/api';

/** Token recordado en memoria para poder borrarlo al cerrar sesión. */
let currentToken: string | null = null;

/**
 * Pide permisos de notificación, obtiene el token de Expo Push y lo registra en el backend.
 * Silenciosa: cualquier fallo (sin permiso, sin red, endpoint aún inexistente) se traga aquí.
 * Devuelve el token registrado, o `null` si no hubo suerte.
 */
export async function registerPushToken(): Promise<string | null> {
    try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId;
        if (!projectId) return null;

        const existing = await Notifications.getPermissionsAsync();
        let status = existing.status;
        if (status !== 'granted') {
            const asked = await Notifications.requestPermissionsAsync();
            status = asked.status;
        }
        if (status !== 'granted') return null;

        const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
        if (!token) return null;

        await apiFetch('core', '/push-tokens', {
            method: 'POST',
            body: JSON.stringify({ token, platform: Platform.OS }),
        });
        currentToken = token;
        return token;
    } catch {
        // Endpoint aún no desplegado, sin red o permiso revocado: no rompemos el flujo de la app.
        return null;
    }
}

/**
 * Borra el token del backend al cerrar sesión. Silenciosa y sin bloquear el cierre:
 * si el registro nunca llegó a completarse no hay nada que borrar.
 */
export async function unregisterPushToken(): Promise<void> {
    if (!currentToken) return;
    const token = currentToken;
    currentToken = null;
    try {
        await apiFetch('core', `/push-tokens/${encodeURIComponent(token)}`, { method: 'DELETE' });
    } catch {
        // El token expira solo en el backend; no vale la pena molestar al usuario.
    }
}
