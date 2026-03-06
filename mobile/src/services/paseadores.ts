import { apiFetch } from "../lib/api";

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
}

export interface WalkRequest {
    id: string;
    walker_id: string;
    client_user_id: string;
    pet_id: string;
    status: string;
    requested_date: string;
    duration_minutes: number;
    pickup_address?: string | null;
    notes?: string | null;
    total_price?: number | null;
}

export async function listWalkers(params?: Record<string, string>): Promise<Walker[]> {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiFetch<Walker[]>("paseadores", `/walkers/${qs}`);
}

export async function getWalker(id: string): Promise<Walker> {
    return apiFetch<Walker>("paseadores", `/walkers/${id}`);
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
