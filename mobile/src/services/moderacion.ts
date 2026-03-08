import { apiFetch } from "../lib/api";
import { Listing, AdoptionRequest } from "./adopciones";
import { LostPetReport } from "./perdidas";

// --- Adopciones ---
export async function getPendingAdoptions(): Promise<Listing[]> {
    return apiFetch<Listing[]>("adopciones", "/pets/admin/pending");
}

export async function getGlobalPendingRequests(): Promise<AdoptionRequest[]> {
    return apiFetch<AdoptionRequest[]>("adopciones", "/pets/admin/requests/pending");
}

export async function approveAdoption(listingId: string): Promise<Listing> {
    return apiFetch<Listing>("adopciones", `/pets/admin/${listingId}/approve`, {
        method: "POST"
    });
}

export async function rejectAdoption(listingId: string): Promise<void> {
    return apiFetch<void>("adopciones", `/pets/admin/${listingId}/reject`, {
        method: "DELETE"
    });
}

// --- Perdidas ---
export async function getPendingLostPets(): Promise<LostPetReport[]> {
    return apiFetch<LostPetReport[]>("perdidas", "/reports/admin/pending");
}

export async function approveLostPet(reportId: string): Promise<LostPetReport> {
    return apiFetch<LostPetReport>("perdidas", `/reports/admin/${reportId}/approve`, {
        method: "POST"
    });
}

export async function rejectLostPet(reportId: string): Promise<void> {
    return apiFetch<void>("perdidas", `/reports/admin/${reportId}/reject`, {
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

// --- Ecommerce (Productos) ---
export async function getPendingProducts(): Promise<any[]> {
    return apiFetch<any[]>("ecommerce", "/products/admin/pending");
}

export async function approveProduct(productId: string): Promise<any> {
    return apiFetch<any>("ecommerce", `/products/admin/${productId}/approve`, {
        method: "POST"
    });
}

export async function rejectProduct(productId: string): Promise<void> {
    return apiFetch<void>("ecommerce", `/products/admin/${productId}/reject`, {
        method: "DELETE"
    });
}

// --- KYC / Usuarios ---
export async function getPendingVerifications(): Promise<any[]> {
    return apiFetch<any[]>("core", "/users/pending-verifications");
}

export async function verifyUser(userId: string, status: 'VERIFIED' | 'REJECTED'): Promise<void> {
    return apiFetch<void>("core", `/users/${userId}/verify?status=${status}`, {
        method: "POST"
    });
}

// --- Solicitudes de Adopción ---
export async function approveAdoptionRequest(requestId: string): Promise<any> {
    return apiFetch<any>("adopciones", `/pets/admin/requests/${requestId}/approve`, {
        method: "POST"
    });
}

export async function rejectAdoptionRequest(requestId: string): Promise<any> {
    // Usamos el endpoint de status mandando 'rechazado'
    return apiFetch<any>("adopciones", `/pets/admin/requests/${requestId}/status?status=rechazado`, {
        method: "PUT"
    });
}
