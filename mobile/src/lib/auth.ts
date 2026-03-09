import { apiFetch, setToken, removeToken, getToken } from "./api";
import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://kowly51wia.execute-api.us-east-1.amazonaws.com";
const ROLE_KEY = 'user_role';

export interface LoginResponse {
    access_token: string;
    token_type: string;
}

export interface User {
    id: string;
    email: string;
    full_name: string;
    is_active: boolean;
    role_id?: string;
    role_name?: string;
    verification_status: "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";
    id_front_url?: string;
    id_back_url?: string;
    proof_of_address_url?: string;
    document_type?: string;
    created_at?: string;
}

function parseJwtRole(token: string): string {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.role || "consumidor";
    } catch {
        return "consumidor";
    }
}

export async function getUserRole(): Promise<string> {
    const role = await SecureStore.getItemAsync(ROLE_KEY);
    return role || "consumidor";
}

async function setUserRole(role: string) {
    await SecureStore.setItemAsync(ROLE_KEY, role);
}

export async function login(email: string, password: string): Promise<LoginResponse> {
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
    await setToken(data.access_token);

    const role = parseJwtRole(data.access_token);
    await setUserRole(role);

    return data;
}

export async function register(
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

export async function logout() {
    await removeToken();
    await SecureStore.deleteItemAsync(ROLE_KEY);
}

export async function isAuthenticated(): Promise<boolean> {
    const token = await getToken();
    return !!token;
}

export async function getCurrentUser(): Promise<User> {
    return await apiFetch<User>("core", "/users/me");
}

// Admin Methods
export async function getPendingVerifications(): Promise<User[]> {
    return await apiFetch<User[]>("core", "/users/pending-verifications");
}

export async function verifyUser(userId: string, status: "VERIFIED" | "REJECTED"): Promise<void> {
    await apiFetch("core", `/users/${userId}/verify?status=${status}`, {
        method: "POST",
    });
}

export {
    apiFetch,
    setToken,
    removeToken,
    getToken
};
