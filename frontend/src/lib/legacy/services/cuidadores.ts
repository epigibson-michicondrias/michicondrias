import { apiFetch } from "../api";

// ===================== TYPES =====================

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
    home_type?: string | null;
    accepts_dogs: boolean;
    accepts_cats: boolean;
    experience_years?: number;
    gallery?: string | null;
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
    address?: string | null;
    notes?: string | null;
    total_price?: number | null;
}

export interface SitReview {
    id: string;
    sit_request_id: string;
    reviewer_user_id: string;
    sitter_id: string;
    rating: number;
    comment?: string | null;
}

export interface PresignedUrlResponse {
    url: string;
    object_key: string;
}

// ===================== API FUNCTIONS =====================

export async function listSitters(params?: Record<string, string>): Promise<Sitter[]> {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiFetch<Sitter[]>("cuidadores", `/sitters/${qs}`);
}

export async function getSitter(id: string): Promise<Sitter> {
    return apiFetch<Sitter>("cuidadores", `/sitters/${id}`);
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

export async function createSitReview(requestId: string, data: { rating: number; comment?: string }): Promise<SitReview> {
    return apiFetch<SitReview>("cuidadores", `/sitters/requests/${requestId}/review`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function getSitterReviews(sitterId: string): Promise<SitReview[]> {
    return apiFetch<SitReview[]>("cuidadores", `/sitters/${sitterId}/reviews`);
}

export async function getCuidadoresPresignedUrl(ext: string): Promise<PresignedUrlResponse> {
    return apiFetch<PresignedUrlResponse>("cuidadores", `/sitters/presigned-url?ext=${ext}`);
}
