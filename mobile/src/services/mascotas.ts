import { apiFetch } from "../lib/api";

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
    gender: string | null;
    is_vaccinated: boolean;
    is_sterilized: boolean;
    is_dewormed: boolean;
    weight_kg?: number;
}

export async function getUserPets(userId: string): Promise<Pet[]> {
    return apiFetch<Pet[]>("mascotas", `/pets/user/${userId}`);
}

export async function getPetById(petId: string): Promise<Pet> {
    return apiFetch<Pet>("mascotas", `/pets/${petId}`);
}

export async function getMascotasPresignedUrl(ext: string): Promise<{ url: string; object_key: string }> {
    return apiFetch<{ url: string; object_key: string }>("mascotas", `/pets/presigned-url?ext=${ext}`);
}

export async function createPet(petData: Partial<Pet>): Promise<Pet> {
    return apiFetch<Pet>("mascotas", `/pets/`, {
        method: "POST",
        body: JSON.stringify(petData)
    });
}
