import { apiFetch } from "../api";

// ===================== TYPES =====================

export interface Walker {
    id: string;
    user_id: string;
    display_name: string;
    bio?: string | null;
    photo_url?: string | null;
    location?: string | null;
    price_per_walk?: number | null;
    price_per_hour?: number | null;
    rating?: number;
    total_walks: number;
    is_verified: boolean;
    is_active: boolean;
    experience_years?: number;
    accepts_dogs: boolean;
    accepts_cats: boolean;
    max_pets_per_walk: number;
    service_radius_km?: number;
    schedule_preference?: string | null;
    gallery?: string | null;
}

export interface WalkRequest {
    id: string;
    walker_id: string;
    client_user_id: string;
    pet_id: string;
    status: string;
    requested_date: string;
    requested_time?: string | null;
    duration_minutes: number;
    pickup_address?: string | null;
    notes?: string | null;
    total_price?: number | null;
}

export interface WalkReview {
    id: string;
    walk_request_id: string;
    reviewer_user_id: string;
    walker_id: string;
    rating: number;
    comment?: string | null;
}

export interface PresignedUrlResponse {
    url: string;
    object_key: string;
}

// ===================== API FUNCTIONS =====================

export async function listWalkers(params?: Record<string, string>): Promise<Walker[]> {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiFetch<Walker[]>("paseadores", `/walkers/${qs}`);
}

export async function getWalker(id: string): Promise<Walker> {
    return apiFetch<Walker>("paseadores", `/walkers/${id}`);
}

export async function registerAsWalker(data: Partial<Walker>): Promise<Walker> {
    return apiFetch<Walker>("paseadores", "/walkers/", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateWalker(id: string, data: Partial<Walker>): Promise<Walker> {
    return apiFetch<Walker>("paseadores", `/walkers/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function getMyWalkerProfile(): Promise<Walker> {
    return apiFetch<Walker>("paseadores", "/walkers/me/profile");
}

export async function requestWalk(walkerId: string, data: Partial<WalkRequest>): Promise<WalkRequest> {
    return apiFetch<WalkRequest>("paseadores", `/walkers/${walkerId}/request`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function getMyWalkRequests(): Promise<WalkRequest[]> {
    return apiFetch<WalkRequest[]>("paseadores", "/walkers/requests/me");
}

export async function getIncomingWalkRequests(): Promise<WalkRequest[]> {
    return apiFetch<WalkRequest[]>("paseadores", "/walkers/requests/incoming");
}

export async function updateWalkRequestStatus(requestId: string, status: string): Promise<WalkRequest> {
    return apiFetch<WalkRequest>("paseadores", `/walkers/requests/${requestId}/status?status=${status}`, {
        method: "PATCH",
    });
}

export async function createWalkReview(requestId: string, data: { rating: number; comment?: string }): Promise<WalkReview> {
    return apiFetch<WalkReview>("paseadores", `/walkers/requests/${requestId}/review`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function getWalkerReviews(walkerId: string): Promise<WalkReview[]> {
    return apiFetch<WalkReview[]>("paseadores", `/walkers/${walkerId}/reviews`);
}

export async function getPaseadoresPresignedUrl(ext: string): Promise<PresignedUrlResponse> {
    return apiFetch<PresignedUrlResponse>("paseadores", `/walkers/presigned-url?ext=${ext}`);
}
