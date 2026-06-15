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

export interface SymptomCheckRequest {
    symptom_description: string;
    duration_hours: number;
}

export interface SymptomCheckResponse {
    analysis_source: string;
    triage_level: string;
    urgency: string;
    summary: string;
    action_plan: string;
    disclaimer: string;
}

export interface DietPlanRequest {
    activity_level: string;
    allergies?: string;
    target_weight_kg?: number;
}

export interface DietPlanResponse {
    analysis_source: string;
    pet_name: string;
    resting_energy_requirement_kcal: number;
    daily_energy_needs_kcal: number;
    recommended_diet: string;
    hydration_target_ml: number;
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

