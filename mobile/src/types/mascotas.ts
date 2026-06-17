/**
 * Mascotas domain types
 * Extracted from src/services/mascotas.ts
 */

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

export interface PetFormData {
    name: string;
    species: string;
    breed: string;
    age_months: string;
    gender: string;
    description: string;
    is_vaccinated: boolean;
    is_sterilized: boolean;
    is_dewormed: boolean;
    weight_kg: string;
    microchip_id: string;
}

export const PET_FORM_DEFAULTS: PetFormData = {
    name: '',
    species: 'perro',
    breed: '',
    age_months: '',
    gender: 'macho',
    description: '',
    is_vaccinated: false,
    is_sterilized: false,
    is_dewormed: false,
    weight_kg: '',
    microchip_id: '',
};

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

/** Options for species selector */
export const SPECIES_OPTIONS = [
    { label: 'Perro', value: 'perro', icon: '🐕' },
    { label: 'Gato', value: 'gato', icon: '🐈' },
];

/** Options for gender selector */
export const GENDER_OPTIONS = [
    { label: 'Macho', value: 'macho', icon: '♂️' },
    { label: 'Hembra', value: 'hembra', icon: '♀️' },
];
