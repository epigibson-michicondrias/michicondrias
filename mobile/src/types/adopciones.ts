/**
 * Adopciones domain types
 * Extracted from src/services/adopciones.ts
 */

export interface Listing {
    id: string;
    name: string;
    species: string;
    breed: string | null;
    age_months: number | null;
    size: string | null;
    description: string | null;
    photo_url: string | null;
    status: string;
    is_approved: boolean;
    published_by: string;
    adopted_by: string | null;
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
    gender: string | null;
    location: string | null;
    is_emergency: boolean;
    gallery: string[] | null;
}

export interface ListingCreate extends Partial<Listing> {
    name: string;
    species: string;
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
    created_at: string;
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

export interface PresignedUrlResponse {
    url: string;
    object_key: string;
}

export interface AdoptionForm {
    id: string;
    pet_id: string;
    has_other_pets: boolean;
    has_yard: boolean;
    hours_left_alone: number;
    experience_level: string | null;
    applicant_id: string;
    compatibility_score: number;
    status: string;
    created_at: string;
}

export interface AdoptionFormCreate {
    pet_id: string;
    has_other_pets: boolean;
    has_yard: boolean;
    hours_left_alone: number;
    experience_level: string;
}

export interface AdoptionContract {
    id: string;
    form_id: string;
    refuge_id: string;
    terms: string;
    signed_contract_url: string | null;
    created_at: string;
}

export interface AdoptionContractCreate {
    form_id: string;
    refuge_id: string;
    terms: string;
    signed_contract_url?: string;
}

/** Options for size selector */
export const SIZE_OPTIONS = [
    { label: 'Pequeño', value: 'small', icon: '🐾' },
    { label: 'Mediano', value: 'medium', icon: '🐕' },
    { label: 'Grande', value: 'large', icon: '🐕‍🦺' },
];

/** Options for energy level */
export const ENERGY_OPTIONS = [
    { label: 'Bajo', value: 'low', icon: '😴' },
    { label: 'Medio', value: 'medium', icon: '🏃' },
    { label: 'Alto', value: 'high', icon: '⚡' },
];
