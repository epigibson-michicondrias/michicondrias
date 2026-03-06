import { apiFetch } from "../lib/api";

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

// --- Veterinarians ---

export async function getVets(clinicId?: string): Promise<Vet[]> {
    const query = clinicId ? `?clinic_id=${clinicId}` : "";
    return apiFetch<Vet[]>("directorio", `/veterinarians/${query}`);
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

// --- Services Catalog ---

export interface ClinicServiceItem {
    id: string;
    clinic_id: string;
    name: string;
    description: string | null;
    price: number | null;
    duration_minutes: number;
    category: string | null;
    is_active: boolean;
}

export async function getClinicServices(clinicId: string): Promise<ClinicServiceItem[]> {
    return apiFetch<ClinicServiceItem[]>("directorio", `/catalog/clinics/${clinicId}/services`);
}

// --- Appointments ---

export interface AppointmentItem {
    id: string;
    clinic_id: string;
    service_id: string;
    pet_id: string;
    user_id: string;
    vet_id: string | null;
    date: string;
    start_time: string;
    end_time: string;
    status: string;
    notes: string | null;
    created_at: string | null;
    service_name: string | null;
    clinic_name: string | null;
}

export async function createAppointment(data: { clinic_id: string; service_id: string; pet_id: string; date: string; start_time: string; notes?: string }): Promise<AppointmentItem> {
    return apiFetch<AppointmentItem>("directorio", "/appointments/", { method: "POST", body: JSON.stringify(data) });
}

export async function getMyAppointments(): Promise<AppointmentItem[]> {
    return apiFetch<AppointmentItem[]>("directorio", "/appointments/me");
}
