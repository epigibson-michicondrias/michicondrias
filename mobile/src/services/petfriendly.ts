import { apiFetch } from "../lib/api";

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

export async function getPlaces(category?: string, city?: string): Promise<PetfriendlyPlace[]> {
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    if (city) params.append("city", city);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return apiFetch<PetfriendlyPlace[]>("perdidas", `/places/${qs}`);
}

export async function getPlaceById(placeId: string): Promise<PetfriendlyPlace> {
    return apiFetch<PetfriendlyPlace>("perdidas", `/places/${placeId}`);
}

export async function getPetfriendlyPresignedUrl(ext: string): Promise<{ url: string; object_key: string }> {
    return apiFetch<{ url: string; object_key: string }>("perdidas", `/places/presigned-url?ext=${ext}`);
}

export async function createPlace(placeData: Partial<PetfriendlyPlace>): Promise<PetfriendlyPlace> {
    return apiFetch<PetfriendlyPlace>("perdidas", `/places/`, {
        method: "POST",
        body: JSON.stringify(placeData)
    });
}

export interface PetfriendlyReview {
    id: string;
    place_id: string;
    user_id: string;
    rating: number;
    comment: string | null;
    created_at: string;
}

export interface PetfriendlyReviewCreate {
    rating: number;
    comment: string;
}

export async function getPlaceReviews(placeId: string): Promise<PetfriendlyReview[]> {
    return apiFetch<PetfriendlyReview[]>("perdidas", `/places/${placeId}/reviews`);
}

export async function createPlaceReview(
    placeId: string,
    data: PetfriendlyReviewCreate
): Promise<PetfriendlyReview> {
    return apiFetch<PetfriendlyReview>("perdidas", `/places/${placeId}/reviews`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}
