/**
 * @module types/insurance
 * @description Types for the pet insurance domain — insurance plans, policies,
 * claims, quote calculations, and subscription requests.
 */

// ─── Insurance Plans ────────────────────────────────────────────────────────────

export interface InsurancePlan {
    id: string;
    insurer_id: string;
    name: string;
    description?: string;
    coverage_limit: number;
    base_premium: number;
    min_age: number;
    max_age: number;
    allowed_species: string[];
    is_active: boolean;
    created_at: string;
}

export interface InsurancePlanCreate {
    name: string;
    description?: string;
    coverage_limit: number;
    base_premium: number;
    min_age?: number;
    max_age?: number;
    allowed_species: string[];
}

// ─── Insurance Policies ─────────────────────────────────────────────────────────

export interface PetInsurancePolicy {
    id: string;
    pet_id: string;
    insurer_id: string;
    policy_number: string;
    coverage_details?: string;
    start_date: string;
    end_date: string;
    monthly_premium: number;
    status?: string;
    claims?: InsuranceClaim[];
}

export interface PetInsurancePolicyCreate {
    pet_id: string;
    insurer_id: string;
    policy_number: string;
    coverage_details?: string;
    start_date: string;
    end_date: string;
    monthly_premium: number;
    status?: string;
}

// ─── Insurance Claims ───────────────────────────────────────────────────────────

export interface InsuranceClaim {
    id: string;
    policy_id: string;
    amount_claimed: number;
    reason?: string;
    medical_receipt_url?: string;
    status?: string;
}

export interface InsuranceClaimCreate {
    policy_id: string;
    amount_claimed: number;
    reason?: string;
    medical_receipt_url?: string;
}

export interface InsuranceClaimUpdate {
    status: string;
}

// ─── Quotes & Subscriptions ─────────────────────────────────────────────────────

export interface InsuranceQuoteRequest {
    plan_id: string;
    pet_age: number;
    pet_species: string;
    has_preexisting_conditions?: boolean;
}

export interface InsuranceQuoteOut {
    plan_id: string;
    base_premium: number;
    calculated_premium: number;
    coverage_limit: number;
    pet_age: number;
    pet_species: string;
}

export interface InsuranceSubscribeRequest {
    pet_id: string;
    plan_id: string;
    pet_age: number;
    pet_species: string;
    has_preexisting_conditions?: boolean;
}

// ─── Constants & Defaults ───────────────────────────────────────────────────────

/** Claim status options */
export const CLAIM_STATUS_OPTIONS = [
    { label: 'Pendiente', value: 'pending' },
    { label: 'Aprobado', value: 'approved' },
    { label: 'Rechazado', value: 'rejected' },
    { label: 'En revisión', value: 'under_review' },
] as const;

/** Policy status options */
export const POLICY_STATUS_OPTIONS = [
    { label: 'Activa', value: 'active' },
    { label: 'Expirada', value: 'expired' },
    { label: 'Cancelada', value: 'cancelled' },
] as const;

/** Allowed species for insurance */
export const INSURANCE_SPECIES_OPTIONS = [
    { label: 'Perro', value: 'dog' },
    { label: 'Gato', value: 'cat' },
] as const;
