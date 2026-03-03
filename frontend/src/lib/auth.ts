import { apiFetch, setToken, removeToken, getToken } from "./api";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://kowly51wia.execute-api.us-east-1.amazonaws.com";
interface LoginResponse {
    access_token: string;
    token_type: string;
}

interface User {
    id: string;
    email: string;
    full_name: string;
    is_active: boolean;
    role_name: string;
    verification_status: "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";
    id_front_url?: string;
    id_back_url?: string;
    proof_of_address_url?: string;
}

function parseJwtRole(token: string): string {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.role || "consumidor";
    } catch {
        return "consumidor";
    }
}

function getUserRole(): string {
    if (typeof window === "undefined") return "consumidor";
    return localStorage.getItem("user_role") || "consumidor";
}

function setUserRole(role: string) {
    localStorage.setItem("user_role", role);
}

async function login(email: string, password: string): Promise<LoginResponse> {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const res = await fetch(`${BASE_URL}/core/api/v1/login/access-token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Credenciales incorrectas");
    }

    const data: LoginResponse = await res.json();
    setToken(data.access_token);

    // Extract role from JWT and save
    const role = parseJwtRole(data.access_token);
    setUserRole(role);

    return data;
}

async function register(
    email: string,
    password: string,
    fullName: string
): Promise<User> {
    const res = await fetch(`${BASE_URL}/core/api/v1/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email,
            password,
            full_name: fullName,
        }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Error al registrar");
    }

    return res.json();
}

function logout() {
    removeToken();
    if (typeof window !== "undefined") {
        localStorage.removeItem("user_role");
        window.location.href = "/login";
    }
}

function isAuthenticated(): boolean {
    return !!getToken();
}

function hasRole(...roles: string[]): boolean {
    const current = getUserRole();
    return current === "admin" || roles.includes(current);
}

async function getCurrentUser(): Promise<User> {
    const res = await apiFetch<User>("core", "/users/me");
    return res;
}

interface KYCPresignedUrl {
    key: "id_front" | "id_back" | "proof_of_address";
    url: string;
    object_key: string;
}

interface KYCPresignedUrlsResponse {
    urls: KYCPresignedUrl[];
}

async function getKYCPresignedUrls(extensions: {
    id_front: string;
    id_back: string;
    proof_of_address: string;
}): Promise<KYCPresignedUrlsResponse> {
    const params = new URLSearchParams({
        id_front_ext: extensions.id_front,
        id_back_ext: extensions.id_back,
        proof_ext: extensions.proof_of_address,
    });
    return await apiFetch<KYCPresignedUrlsResponse>("core", `/users/me/kyc/presigned-urls?${params.toString()}`);
}

async function finalizeKYC(data: {
    id_front_url: string;
    id_back_url: string;
    proof_of_address_url: string;
}): Promise<User> {
    return await apiFetch<User>("core", "/users/me/kyc/finalize", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export {
    login,
    register,
    logout,
    isAuthenticated,
    getUserRole,
    hasRole,
    getCurrentUser,
    getKYCPresignedUrls,
    finalizeKYC
};
export type { User, LoginResponse, KYCPresignedUrl };
