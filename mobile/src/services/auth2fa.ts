import { apiFetch } from "../lib/api";

// --- Two-Factor Authentication ---

export interface Setup2FAResponse {
    secret: string;
    otpauth_url: string;
}

export interface TwoFAActionResponse {
    // UserResponse from backend
    id: string;
    email: string;
    is_two_factor_enabled?: boolean;
}

export async function setup2FA(): Promise<Setup2FAResponse> {
    return apiFetch<Setup2FAResponse>("core", "/users/me/2fa/setup", {
        method: "POST",
    });
}

export async function enable2FA(code: string, secret: string): Promise<TwoFAActionResponse> {
    return apiFetch<TwoFAActionResponse>("core", "/users/me/2fa/enable", {
        method: "POST",
        body: JSON.stringify({ code, secret }),
    });
}

export async function disable2FA(code: string, secret: string): Promise<TwoFAActionResponse> {
    return apiFetch<TwoFAActionResponse>("core", "/users/me/2fa/disable", {
        method: "POST",
        body: JSON.stringify({ code, secret }),
    });
}
