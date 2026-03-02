import { apiFetch } from "../api";
import { Listing } from "./adopciones";
import { LostPetReport } from "./perdidas";

// --- Adopciones ---
export async function getPendingAdoptions(): Promise<Listing[]> {
    return apiFetch<Listing[]>("adopciones", "/admin/pending");
}

export async function approveAdoption(listingId: string): Promise<Listing> {
    return apiFetch<Listing>("adopciones", `/admin/${listingId}/approve`, {
        method: "POST"
    });
}

export async function rejectAdoption(listingId: string): Promise<void> {
    return apiFetch<void>("adopciones", `/admin/${listingId}/reject`, {
        method: "DELETE"
    });
}


// --- Perdidas ---
export async function getPendingLostPets(): Promise<LostPetReport[]> {
    return apiFetch<LostPetReport[]>("perdidas", "/admin/pending");
}

export async function approveLostPet(reportId: string): Promise<LostPetReport> {
    return apiFetch<LostPetReport>("perdidas", `/admin/${reportId}/approve`, {
        method: "POST"
    });
}

export async function rejectLostPet(reportId: string): Promise<void> {
    return apiFetch<void>("perdidas", `/admin/${reportId}/reject`, {
        method: "DELETE"
    });
}

// --- Directorio (Clinicas) ---
export async function getPendingClinics(): Promise<any[]> {
    return apiFetch<any[]>("directorio", "/clinics/admin/pending");
}

export async function approveClinic(clinicId: string): Promise<any> {
    return apiFetch<any>("directorio", `/clinics/admin/${clinicId}/approve`, {
        method: "POST"
    });
}

export async function rejectClinic(clinicId: string): Promise<void> {
    return apiFetch<void>("directorio", `/clinics/admin/${clinicId}/reject`, {
        method: "DELETE"
    });
}

// --- Directorio (Veterinarios) ---
export async function getPendingVeterinarians(): Promise<any[]> {
    return apiFetch<any[]>("directorio", "/veterinarians/admin/pending");
}

export async function approveVeterinarian(vetId: string): Promise<any> {
    return apiFetch<any>("directorio", `/veterinarians/admin/${vetId}/approve`, {
        method: "POST"
    });
}

export async function rejectVeterinarian(vetId: string): Promise<void> {
    return apiFetch<void>("directorio", `/veterinarians/admin/${vetId}/reject`, {
        method: "DELETE"
    });
}
