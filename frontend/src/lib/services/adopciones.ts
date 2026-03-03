import { apiFetch } from "../api";

// ============================
// ADOPTION LISTING (the ad/post)
// ============================

export interface Listing {
    id: string;
    name: string;
    species: string;
    breed: string | null;
    age_months: number | null;
    size: string | null;
    description: string | null;
    photo_url: string | null;
    status: string;        // abierto, en_proceso, adoptado
    is_approved: boolean;
    published_by: string;
    adopted_by: string | null;

    // Enrichment Fields
    is_vaccinated: boolean;
    is_sterilized: boolean;
    is_dewormed: boolean;
    temperament: string | null;
    energy_level: string | null;
    social_cats: boolean;
    social_dogs: boolean;
    social_children: boolean;
    weight_kg: number | null;
    microchip_number: string | null;

    // Enrichment Fields 2.0
    gender: string | null;
    location: string | null;
    is_emergency: boolean;
    gallery: string[] | null;
}

export interface ListingCreate {
    name: string;
    species: string;
    breed: string | null;
    age_months: number | null;
    size: string | null;
    description: string | null;
    photo_url: string | null;

    // Enrichment Fields
    is_vaccinated: boolean;
    is_sterilized: boolean;
    is_dewormed: boolean;
    temperament: string | null;
    energy_level: string | null;
    social_cats: boolean;
    social_dogs: boolean;
    social_children: boolean;
    weight_kg: number | null;
    microchip_number: string | null;

    // Enrichment Fields 2.0
    gender: string | null;
    location: string | null;
    is_emergency: boolean;
    gallery: string[] | null;
}

export interface AdoptionRequest {
    id: string;
    listing_id: string;
    user_id: string;
    applicant_name: string | null;
    status: string;
    house_type: string;
    has_yard: boolean;
    own_or_rent: string;
    landlord_permission: boolean;
    other_pets: string | null;
    has_children: boolean;
    children_ages: string | null;
    hours_alone: number;
    financial_commitment: boolean;
    reason: string;
    previous_experience: string | null;
    pet_name?: string | null;
    pet_photo_url?: string | null;
}

export interface AdoptionRequestCreate {
    applicant_name?: string | null;
    house_type: string;
    has_yard: boolean;
    own_or_rent: string;
    landlord_permission: boolean;
    other_pets: string | null;
    has_children: boolean;
    children_ages: string | null;
    hours_alone: number;
    financial_commitment: boolean;
    reason: string;
    previous_experience: string | null;
}

// Public
export async function getListings(): Promise<Listing[]> {
    return apiFetch<Listing[]>("adopciones", "/pets/");
}

export async function getListing(id: string): Promise<Listing> {
    return apiFetch<Listing>("adopciones", `/pets/${id}`);
}

// Authenticated
export async function createListing(data: ListingCreate): Promise<Listing> {
    return apiFetch<Listing>("adopciones", "/pets/", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function getMyListings(): Promise<Listing[]> {
    return apiFetch<Listing[]>("adopciones", "/pets/me");
}

export async function updateListing(id: string, data: ListingCreate): Promise<Listing> {
    return apiFetch<Listing>("adopciones", `/pets/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function deleteListing(id: string): Promise<void> {
    return apiFetch("adopciones", `/pets/${id}`, {
        method: "DELETE",
    });
}

export async function requestAdoption(
    listingId: string,
    data: AdoptionRequestCreate
): Promise<AdoptionRequest> {
    return apiFetch<AdoptionRequest>("adopciones", `/pets/${listingId}/request`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function getMyRequests(): Promise<AdoptionRequest[]> {
    return apiFetch<AdoptionRequest[]>("adopciones", "/pets/requests/me");
}

// Admin
export async function getListingRequests(listingId: string): Promise<AdoptionRequest[]> {
    return apiFetch<AdoptionRequest[]>("adopciones", `/pets/admin/${listingId}/requests`);
}

export async function getPendingListings(): Promise<Listing[]> {
    return apiFetch<Listing[]>("adopciones", "/pets/admin/pending");
}

export async function approveListing(id: string): Promise<Listing> {
    return apiFetch<Listing>("adopciones", `/pets/admin/${id}/approve`, {
        method: "POST",
    });
}

export async function rejectListing(id: string): Promise<void> {
    return apiFetch("adopciones", `/pets/admin/${id}/reject`, {
        method: "DELETE",
    });
}

export async function updateRequestStatus(requestId: string, status: string): Promise<AdoptionRequest> {
    return apiFetch<AdoptionRequest>("adopciones", `/pets/admin/requests/${requestId}/status?status=${status}`, {
        method: "PUT",
    });
}

export async function approveAdoption(requestId: string): Promise<AdoptionRequest> {
    return apiFetch<AdoptionRequest>("adopciones", `/pets/admin/requests/${requestId}/approve`, {
        method: "POST",
    });
}
