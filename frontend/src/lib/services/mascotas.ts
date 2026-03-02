import { apiFetch } from "../api";

export interface Pet {
    id: string;
    owner_id: string;
    name: string;
    species: string;
    breed: string | null;
    age_months: number | null;
    size: string | null;
    description: string | null;
    photo_url: string | null;
    is_active: boolean;
    adopted_from_listing_id: string | null;

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
}

export async function getUserPets(userId: string): Promise<Pet[]> {
    return apiFetch<Pet[]>("mascotas", `/pets/user/${userId}`);
}

export async function getPetById(petId: string): Promise<Pet> {
    return apiFetch<Pet>("mascotas", `/pets/${petId}`);
}

export async function createPet(petData: Partial<Pet>): Promise<Pet> {
    return apiFetch<Pet>("mascotas", `/pets/`, {
        method: "POST",
        body: JSON.stringify(petData)
    });
}

export interface LostPet {
    id: string;
    user_id: string;
    pet_name: string;
    species: string;
    breed: string | null;
    description: string | null;
    last_seen_location: string;
    date_lost: string;
    contact_phone: string;
    image_url: string | null;
    is_found: boolean;
    created_at: string;
}

export interface PetfriendlyPlace {
    id: string;
    name: string;
    category: string;
    description: string | null;
    address: string;
    city: string | null;
    state: string | null;
    latitude: number | null;
    longitude: number | null;
    rating: number;
    image_url: string | null;
    created_by_user_id: string;
}

export async function getLostPets(isFound?: boolean): Promise<LostPet[]> {
    const params = isFound !== undefined ? `?is_found=${isFound}` : "";
    return apiFetch<LostPet[]>("mascotas", `/lost-pets/${params}`);
}

export async function createLostPet(
    pet: Omit<LostPet, "id" | "user_id" | "created_at">
): Promise<LostPet> {
    return apiFetch<LostPet>("mascotas", "/lost-pets/", {
        method: "POST",
        body: JSON.stringify(pet),
    });
}

export async function getPlaces(category?: string, city?: string): Promise<PetfriendlyPlace[]> {
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    if (city) params.append("city", city);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return apiFetch<PetfriendlyPlace[]>("mascotas", `/places/${qs}`);
}

export async function createPlace(
    place: Omit<PetfriendlyPlace, "id" | "created_by_user_id">
): Promise<PetfriendlyPlace> {
    return apiFetch<PetfriendlyPlace>("mascotas", "/places/", {
        method: "POST",
        body: JSON.stringify(place),
    });
}
