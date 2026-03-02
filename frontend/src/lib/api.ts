const API_URLS = {
    core: "http://localhost:8000/api/v1",
    adopciones: "http://localhost:8001/api/v1/adopciones",
    directorio: "http://localhost:8002/api/v1/directorio",
    carnet: "http://localhost:8003/api/v1",
    ecommerce: "http://localhost:8004/api/v1",
    mascotas: "http://localhost:8005/api/v1",
    perdidas: "http://localhost:8006/api/v1",
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
        throw new Error(errorData.detail || `Error ${res.status}`);
    }

    return res.json();
}

export { apiFetch, getToken, setToken, removeToken, API_URLS };
export type { ServiceName };
