import { apiFetch } from "../lib/api";

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

export interface InsuranceClaim {
    id: string;
    policy_id: string;
    amount_claimed: number;
    reason?: string;
    medical_receipt_url?: string;
    status?: string;
}

export interface InsuranceClaimDetail extends InsuranceClaim {
    policy_number?: string | null;
    pet_id?: string | null;
    pet_name?: string | null;
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

export async function getActivePlans(): Promise<InsurancePlan[]> {
    return apiFetch<InsurancePlan[]>("aseguradoras", "/plans");
}

export async function createPlan(data: InsurancePlanCreate): Promise<InsurancePlan> {
    return apiFetch<InsurancePlan>("aseguradoras", "/plans", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function calculateQuote(data: InsuranceQuoteRequest): Promise<InsuranceQuoteOut> {
    return apiFetch<InsuranceQuoteOut>("aseguradoras", "/quote", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function subscribeToPlan(data: InsuranceSubscribeRequest): Promise<PetInsurancePolicy> {
    return apiFetch<PetInsurancePolicy>("aseguradoras", "/subscribe", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function getActivePolicyByPet(petId: string): Promise<PetInsurancePolicy> {
    return apiFetch<PetInsurancePolicy>("aseguradoras", `/policies/pet/${petId}`);
}

export async function createClaim(data: InsuranceClaimCreate): Promise<InsuranceClaim> {
    return apiFetch<InsuranceClaim>("aseguradoras", "/claims", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateClaimStatus(claimId: string, data: InsuranceClaimUpdate): Promise<InsuranceClaim> {
    return apiFetch<InsuranceClaim>("aseguradoras", `/claims/${claimId}/status`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}

export async function createPolicy(data: PetInsurancePolicyCreate): Promise<PetInsurancePolicy> {
    return apiFetch<PetInsurancePolicy>("aseguradoras", "/policies", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function verifyClaimReceipt(claimId: string): Promise<any> {
    return apiFetch<any>("aseguradoras", `/claims/${claimId}/verify-receipt`, {
        method: "POST",
    });
}

export async function getMyPlans(): Promise<InsurancePlan[]> {
    return apiFetch<InsurancePlan[]>("aseguradoras", "/plans/mine");
}

export async function setPlanActive(planId: string, isActive: boolean): Promise<InsurancePlan> {
    return apiFetch<InsurancePlan>("aseguradoras", `/plans/${planId}/active`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: isActive }),
    });
}

export async function getProviderClaims(): Promise<InsuranceClaimDetail[]> {
    return apiFetch<InsuranceClaimDetail[]>("aseguradoras", "/claims/provider");
}

export async function getMyClaims(): Promise<InsuranceClaimDetail[]> {
    return apiFetch<InsuranceClaimDetail[]>("aseguradoras", "/claims/mine");
}

export async function getProviderPolicies(): Promise<PetInsurancePolicy[]> {
    return apiFetch<PetInsurancePolicy[]>("aseguradoras", "/policies/provider");
}
