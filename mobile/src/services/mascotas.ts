/**
 * Mascotas service — API calls only
 * Types are imported from types/mascotas.ts
 */
import { apiFetch } from "../lib/api";
import type {
    Pet,
    SymptomCheckRequest,
    SymptomCheckResponse,
    DietPlanRequest,
    DietPlanResponse,
} from "../types/mascotas";

// Re-export types for backward compatibility
export type { Pet, SymptomCheckRequest, SymptomCheckResponse, DietPlanRequest, DietPlanResponse };

export async function getUserPets(userId: string): Promise<Pet[]> {
    return apiFetch<Pet[]>("mascotas", `/pets/user/${userId}`);
}

export async function getAllPets(): Promise<Pet[]> {
    return apiFetch<Pet[]>("mascotas", "/pets/admin/all");
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

export async function aiSymptomCheck(data: SymptomCheckRequest): Promise<SymptomCheckResponse> {
    return apiFetch<SymptomCheckResponse>("mascotas", "/pets/ai/symptom-check", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function aiDietPlan(petId: string, data: DietPlanRequest): Promise<DietPlanResponse> {
    return apiFetch<DietPlanResponse>("mascotas", `/pets/${petId}/ai/diet-plan`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function sharePetPassport(petId: string): Promise<{ token: string; share_url: string }> {
    return apiFetch<{ token: string; share_url: string }>("mascotas", `/pets/${petId}/passport/share`);
}

export async function updatePet(petId: string, petData: Partial<Pet>): Promise<Pet> {
    return apiFetch<Pet>("mascotas", `/pets/${petId}`, {
        method: "PUT",
        body: JSON.stringify(petData)
    });
}

