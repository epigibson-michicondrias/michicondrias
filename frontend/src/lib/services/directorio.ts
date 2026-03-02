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
    is_24_hours: boolean;
    has_emergency: boolean;
    owner_user_id: string | null;
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
    clinic_id: string | null;
    user_id: string | null;
}

export async function getClinics(): Promise<Clinic[]> {
    return apiFetch<Clinic[]>("directorio", "/clinics/");
}

export async function getClinic(id: string): Promise<Clinic> {
    return apiFetch<Clinic>("directorio", `/clinics/${id}`);
}

export async function createClinic(clinic: ClinicCreate): Promise<Clinic> {
    return apiFetch<Clinic>("directorio", "/clinics/", {
        method: "POST",
        body: JSON.stringify(clinic),
    });
}

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
