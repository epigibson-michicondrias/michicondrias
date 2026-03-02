import { apiFetch } from "../api";

export interface PetfriendlyPlace {
    id: string;
    added_by: string;
    name: string;
    category: string;
    address: string | null;
    city: string | null;
    description: string | null;
    image_url: string | null;
    latitude: number | null;
    longitude: number | null;
    phone: string | null;
    website: string | null;
    rating: number;
    pet_sizes_allowed: string;
    has_water_bowls: string;
    has_pet_menu: string;
    created_at: string | null;
}

export interface PlaceCreate {
    name: string;
    category: string;
    address?: string;
    city?: string;
    description?: string;
    image_url?: string;
    latitude?: number;
    longitude?: number;
    phone?: string;
    website?: string;
    rating?: number;
    pet_sizes_allowed?: string;
    has_water_bowls?: string;
    has_pet_menu?: string;
}

export async function getPlaces(category?: string, city?: string): Promise<PetfriendlyPlace[]> {
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    if (city) params.append("city", city);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return apiFetch<PetfriendlyPlace[]>("perdidas", `/places/${qs}`);
}

export async function createPlace(place: PlaceCreate): Promise<PetfriendlyPlace> {
    return apiFetch<PetfriendlyPlace>("perdidas", "/places/", {
        method: "POST",
        body: JSON.stringify(place),
    });
}
