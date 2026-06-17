import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://kowly51wia.execute-api.us-east-1.amazonaws.com";

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

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 30_000; // 30 seconds

function getCached(key: string): any | null {
    const entry = cache.get(key);
    if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
        return entry.data;
    }
    cache.delete(key);
    return null;
}

function setCache(key: string, data: any) {
    cache.set(key, { data, timestamp: Date.now() });
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
    const url = `${API_URLS[service]}${endpoint}`;
    const isGet = !options.method || options.method === 'GET';

    // Use cache for GET requests
    if (isGet) {
        const cached = getCached(url);
        if (cached) return cached;
    }

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

        if (res.status === 401 || res.status === 403) {
            await removeToken();
            throw new Error("No autorizado");
        }

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            const errorMessage = errorData.detail || `Error ${res.status}`;
            throw new Error(errorMessage);
        }

        const data = await res.json();

        // Cache GET responses
        if (isGet) {
            setCache(url, data);
        }

        return data;
    } catch (error: any) {
        clearTimeout(timeout);
        if (error.name === 'AbortError') {
            throw new Error("Tiempo de espera agotado. Verifica tu conexión.");
        }
        throw error;
    }
}
