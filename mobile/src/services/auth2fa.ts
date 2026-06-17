import { apiFetch } from "../lib/api";

// --- Two-Factor Authentication ---

export interface Setup2FAResponse {
    secret: string;
    qr_uri: string;
}

export interface TwoFAActionResponse {
    success: boolean;
}

export async function setup2FA(): Promise<Setup2FAResponse> {
    return apiFetch<Setup2FAResponse>("core", "/users/me/2fa/setup", {
        method: "POST",
    });
}

export async function enable2FA(code: string): Promise<TwoFAActionResponse> {
    return apiFetch<TwoFAActionResponse>("core", "/users/me/2fa/enable", {
        method: "POST",
        body: JSON.stringify({ code }),
    });
}

export async function disable2FA(code: string): Promise<TwoFAActionResponse> {
    return apiFetch<TwoFAActionResponse>("core", "/users/me/2fa/disable", {
        method: "POST",
        body: JSON.stringify({ code }),
    });
}

// --- Role Upgrade ---

export async function upgradeToPartner(): Promise<any> {
    return apiFetch<any>("core", "/users/me/upgrade-role", {
        method: "POST",
    });
}
