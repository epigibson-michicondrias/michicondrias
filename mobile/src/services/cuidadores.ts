import { apiFetch } from "../lib/api";

export interface Sitter {
    id: string;
    user_id: string;
    display_name: string;
    bio?: string | null;
    photo_url?: string | null;
    location?: string | null;
    price_per_day?: number | null;
    price_per_visit?: number | null;
    rating?: number;
    total_sits: number;
    is_verified: boolean;
    is_active: boolean;
    service_type: string;
    max_pets: number;
    has_yard: boolean;
    accepts_dogs: boolean;
    accepts_cats: boolean;
    experience_years?: number;
}

export interface SitRequest {
    id: string;
    sitter_id: string;
    client_user_id: string;
    pet_id: string;
    status: string;
    service_type: string;
    start_date: string;
    end_date: string;
    notes?: string | null;
    total_price?: number | null;
}

export async function listSitters(params?: Record<string, string>): Promise<Sitter[]> {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiFetch<Sitter[]>("cuidadores", `/sitters/${qs}`);
}

export async function getSitter(id: string): Promise<Sitter> {
    return apiFetch<Sitter>("cuidadores", `/sitters/${id}`);
}

export async function requestSit(sitterId: string, data: Partial<SitRequest>): Promise<SitRequest> {
    return apiFetch<SitRequest>("cuidadores", `/sitters/${sitterId}/request`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function getMySitRequests(): Promise<SitRequest[]> {
    return apiFetch<SitRequest[]>("cuidadores", "/sitters/requests/me");
}

export async function getIncomingSitRequests(): Promise<SitRequest[]> {
    return apiFetch<SitRequest[]>("cuidadores", "/sitters/requests/incoming");
}

export async function updateSitRequestStatus(requestId: string, status: string): Promise<SitRequest> {
    return apiFetch<SitRequest>("cuidadores", `/sitters/requests/${requestId}/status?status=${status}`, {
        method: "PATCH",
    });
}

export async function registerAsSitter(data: Partial<Sitter>): Promise<Sitter> {
    return apiFetch<Sitter>("cuidadores", "/sitters/", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateSitter(id: string, data: Partial<Sitter>): Promise<Sitter> {
    return apiFetch<Sitter>("cuidadores", `/sitters/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function getMySitterProfile(): Promise<Sitter> {
    return apiFetch<Sitter>("cuidadores", "/sitters/me/profile");
}
