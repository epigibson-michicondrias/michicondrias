import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://michicondrias.duckdns.org";

const API_URLS = {
    core: `${BASE_URL}/core/api/v1`,
    adopciones: `${BASE_URL}/adopciones/api/v1`,
    directorio: `${BASE_URL}/directorio/api/v1`,
    carnet: `${BASE_URL}/carnet/api/v1`,
    ecommerce: `${BASE_URL}/ecommerce/api/v1`,
    mascotas: `${BASE_URL}/mascotas/api/v1`,
    perdidas: `${BASE_URL}/perdidas/api/v1`,
    paseadores: `${BASE_URL}/paseadores/api/v1`,
    cuidadores: `${BASE_URL}/cuidadores/api/v1`,
    aseguradoras: `${BASE_URL}/aseguradoras/api/v1/insurance`,
    entrenadores: `${BASE_URL}/entrenadores/api/v1/training`,
    establecimientos: `${BASE_URL}/establecimientos/api/v1/venues`,
    estilistas: `${BASE_URL}/estilistas/api/v1/grooming`,
    funeraria: `${BASE_URL}/funeraria/api/v1/funerary`,
    patrocinadores: `${BASE_URL}/patrocinadores/api/v1/sponsors`,
    transportistas: `${BASE_URL}/transportistas/api/v1/rides`,
    laboratorio: `${BASE_URL}/laboratorio/api/v1`,
};

export type ServiceName = keyof typeof API_URLS;

import { Platform } from 'react-native';

const TOKEN_KEY = 'access_token';

/** Error HTTP del backend. `sessionExpired` indica que el token ya no sirve y hay que volver a iniciar sesión. */
export class ApiError extends Error {
    constructor(message: string, public status: number, public sessionExpired = false) {
        super(message);
        this.name = 'ApiError';
    }
}

// AuthContext se registra aquí para enterarse cuando el backend rechaza el token (sesión vencida o inválida).
let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
    unauthorizedHandler = handler;
}

export async function getToken(): Promise<string | null> {
    if (Platform.OS === 'web') {
        return localStorage.getItem(TOKEN_KEY);
    }
    return await SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string) {
    if (Platform.OS === 'web') {
        localStorage.setItem(TOKEN_KEY, token);
        return;
    }
    await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function removeToken() {
    if (Platform.OS === 'web') {
        localStorage.removeItem(TOKEN_KEY);
        return;
    }
    await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function apiFetch<T>(
    service: ServiceName,
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    // Sin caché propia: React Query ya cachea por query y decide cuándo volver a pedir (refresh, polling, invalidación).
    const url = `${API_URLS[service]}${endpoint}`;

    const token = await getToken();

    const headers: Record<string, string> = {
        ...(options.headers as Record<string, string> || {}),
    };

    if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
    }

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);

    try {
        const res = await fetch(url, {
            ...options,
            headers,
            signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            const detail = typeof errorData.detail === 'string' ? errorData.detail : '';

            // El backend responde 403 "Could not validate credentials" cuando el token venció o es inválido,
            // y 403 con otros mensajes cuando el usuario no tiene permiso para esa acción.
            const sessionExpired =
                res.status === 401 ||
                (res.status === 403 && /could not validate credentials|not authenticated|2fa|dos factores/i.test(detail));
            if (sessionExpired) {
                // Una respuesta tardía con un token viejo no debe cerrar la sesión que se abrió después
                if (token && (await getToken()) === token) {
                    await removeToken();
                    unauthorizedHandler?.();
                }
                throw new ApiError("Tu sesión expiró. Inicia sesión de nuevo.", res.status, true);
            }
            if (res.status === 403) {
                throw new ApiError(detail || "No tienes permiso para realizar esta acción", res.status);
            }
            const message = Array.isArray(errorData.detail)
                // Pydantic antepone "Value error, " a los mensajes de los validadores propios
                ? errorData.detail.map((d: any) => String(d?.msg ?? '').replace(/^Value error, /, '')).filter(Boolean).join('. ')
                : detail;
            throw new ApiError(message || `Error ${res.status}`, res.status);
        }

        return await res.json();
    } catch (error: any) {
        clearTimeout(timeout);
        if (error.name === 'AbortError') {
            throw new Error("Tiempo de espera agotado. Verifica tu conexión.");
        }
        throw error;
    }
}
