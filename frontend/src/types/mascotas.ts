/**
 * Mascotas domain types
 * Extracted from src/services/mascotas.ts
 */

export interface Pet {
    has_active_subscription?: boolean;
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
    weight_kg?: number | null;
    microchip_number?: string | null;
}

export interface PetFormData {
    name: string;
    species: string;
    breed: string;
    /** Edad en años + meses sueltos (0–11); se guarda como `age_months` total. */
    age_years: string;
    age_months: string;
    gender: string;
    description: string;
    is_sterilized: boolean;
    is_dewormed: boolean;
    weight_kg: string;
    microchip_id: string;
}

export const PET_FORM_DEFAULTS: PetFormData = {
    name: '',
    species: 'gato',
    breed: '',
    age_years: '',
    age_months: '',
    gender: 'macho',
    description: '',
    is_sterilized: false,
    is_dewormed: false,
    weight_kg: '',
    microchip_id: '',
};

export interface SymptomCheckRequest {
    symptom_description: string;
    duration_hours: number;
    /** Opcional: da contexto (especie, peso, edad) al análisis; el backend ignora las mascotas ajenas. */
    pet_id?: string;
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

/** Options for species selector */
export const SPECIES_OPTIONS = [
    { label: 'Gato', value: 'gato' },
    { label: 'Perro', value: 'perro' },
];

/** Options for gender selector */
export const GENDER_OPTIONS = [
    { label: 'Macho', value: 'macho' },
    { label: 'Hembra', value: 'hembra' },
];
