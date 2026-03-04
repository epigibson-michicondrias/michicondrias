import { apiFetch } from "../api";

export interface Clinic {
    id: string;
    name: string;
    address: string | null;
    city: string | null;
    state: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    description: string | null;
    logo_url: string | null;
    is_24_hours: boolean;
    has_emergency: boolean;
    owner_user_id: string | null;
    is_approved?: boolean;
}

export interface ClinicCreate {
    name: string;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    description?: string | null;
    logo_url?: string | null;
    is_24_hours?: boolean;
    has_emergency?: boolean;
}

export interface Vet {
    id: string;
    first_name: string;
    last_name: string;
    specialty: string | null;
    license_number: string | null;
    phone: string | null;
    email: string | null;
    bio: string | null;
    photo_url: string | null;
    clinic_id: string | null;
    user_id: string | null;
}

export interface ClinicReview {
    id: string;
    clinic_id: string;
    user_id: string;
    rating: number;
    comment: string | null;
    created_at: string | null;
}

export interface ClinicRating {
    average_rating: number;
    total_reviews: number;
}

// --- Clinics ---

export async function getClinics(): Promise<Clinic[]> {
    return apiFetch<Clinic[]>("directorio", "/clinics/");
}

export async function getClinic(id: string): Promise<Clinic> {
    return apiFetch<Clinic>("directorio", `/clinics/${id}`);
}

export async function getMyClinics(): Promise<Clinic[]> {
    return apiFetch<Clinic[]>("directorio", "/clinics/me");
}

export async function createClinic(clinic: ClinicCreate): Promise<Clinic> {
    return apiFetch<Clinic>("directorio", "/clinics/", {
        method: "POST",
        body: JSON.stringify(clinic),
    });
}

export async function updateClinic(id: string, clinic: Partial<ClinicCreate>): Promise<Clinic> {
    return apiFetch<Clinic>("directorio", `/clinics/${id}`, {
        method: "PUT",
        body: JSON.stringify(clinic),
    });
}

export async function deleteClinic(id: string): Promise<void> {
    return apiFetch<void>("directorio", `/clinics/${id}`, {
        method: "DELETE",
    });
}

// --- Veterinarians ---

export async function getVets(clinicId?: string): Promise<Vet[]> {
    const query = clinicId ? `?clinic_id=${clinicId}` : "";
    return apiFetch<Vet[]>("directorio", `/veterinarians/${query}`);
}

export async function createVet(vet: Omit<Vet, "id" | "user_id">): Promise<Vet> {
    return apiFetch<Vet>("directorio", "/veterinarians/", {
        method: "POST",
        body: JSON.stringify(vet),
    });
}

export async function updateVet(id: string, vet: Partial<Vet>): Promise<Vet> {
    return apiFetch<Vet>("directorio", `/veterinarians/${id}`, {
        method: "PUT",
        body: JSON.stringify(vet),
    });
}

// --- Reviews ---

export async function getClinicReviews(clinicId: string): Promise<ClinicReview[]> {
    return apiFetch<ClinicReview[]>("directorio", `/reviews/clinics/${clinicId}/reviews`);
}

export async function createClinicReview(clinicId: string, rating: number, comment?: string): Promise<ClinicReview> {
    return apiFetch<ClinicReview>("directorio", `/reviews/clinics/${clinicId}/reviews`, {
        method: "POST",
        body: JSON.stringify({ rating, comment: comment || null }),
    });
}

export async function getClinicRating(clinicId: string): Promise<ClinicRating> {
    return apiFetch<ClinicRating>("directorio", `/reviews/clinics/${clinicId}/rating`);
}

