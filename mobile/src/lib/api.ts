import * as SecureStore from 'expo-secure-store';

const BASE_URL = "https://kowly51wia.execute-api.us-east-1.amazonaws.com";

const API_URLS = {
    core: `${BASE_URL}/core/api/v1`,
    adopciones: `${BASE_URL}/adopciones/api/v1/adopciones`,
    directorio: `${BASE_URL}/directorio/api/v1/directorio`,
    carnet: `${BASE_URL}/carnet/api/v1`,
    ecommerce: `${BASE_URL}/ecommerce/api/v1`,
    mascotas: `${BASE_URL}/mascotas/api/v1`,
    perdidas: `${BASE_URL}/perdidas/api/v1`,
    paseadores: `${BASE_URL}/paseadores/api/v1`,
    cuidadores: `${BASE_URL}/cuidadores/api/v1`,
};

export type ServiceName = keyof typeof API_URLS;

const TOKEN_KEY = 'access_token';

export async function getToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function removeToken() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function apiFetch<T>(
    service: ServiceName,
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
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

    const res = await fetch(url, {
        ...options,
        headers,
    });

    if (res.status === 401 || res.status === 403) {
        await removeToken();
        // In a real app, we'd trigger a navigation to Login here
        // For now, we'll just throw the error
        throw new Error("No autorizado");
    }

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.detail || `Error ${res.status}`;
        throw new Error(errorMessage);
    }

    return res.json();
}
