const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://kowly51wia.execute-api.us-east-1.amazonaws.com";

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

type ServiceName = keyof typeof API_URLS;

function getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("access_token");
}

function setToken(token: string) {
    localStorage.setItem("access_token", token);
}

function removeToken() {
    localStorage.removeItem("access_token");
}

async function apiFetch<T>(
    service: ServiceName,
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_URLS[service]}${endpoint}`;
    const token = getToken();

    const headers: Record<string, string> = {
        ...(options.headers as Record<string, string> || {}),
    };

    // Only set application/json if not sending FormData
    if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
    }

    if (token) {
        (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(url, {
        ...options,
        headers,
    });

    if (res.status === 401 || res.status === 403) {
        removeToken();
        if (typeof window !== "undefined") {
            window.location.href = "/login";
        }
        throw new Error("No autorizado");
    }

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.detail || `Error ${res.status}`;

        // If the user was deleted from DB (like a Neon migration reset), force logout
        if (res.status === 404 && (errorMessage === "User not found" || errorMessage === "Usuario no encontrado")) {
            removeToken();
            if (typeof window !== "undefined") {
                window.location.href = "/login";
            }
        }

        throw new Error(errorMessage);
    }

    return res.json();
}

export { apiFetch, getToken, setToken, removeToken, API_URLS };
export type { ServiceName };
