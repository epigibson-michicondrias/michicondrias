import { apiFetch } from "../lib/api";
import { Listing, AdoptionRequest } from "./adopciones";
import { LostPetReport } from "./perdidas";
import type { Clinic, Vet } from "./directorio";
import type { Product } from "../types/ecommerce";
import type { AdminUserDetail } from "./adminUsers";

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

/** Rechaza y elimina la publicación (no se puede deshacer). */
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

/** Rechaza y elimina el reporte (no se puede deshacer). */
export async function rejectLostPet(reportId: string): Promise<void> {
    return apiFetch<void>("perdidas", `/reports/admin/${reportId}/reject`, {
        method: "DELETE"
    });
}

// --- Directorio (Clinicas) ---
export async function getPendingClinics(): Promise<Clinic[]> {
    return apiFetch<Clinic[]>("directorio", "/clinics/admin/pending");
}

export async function approveClinic(clinicId: string): Promise<Clinic> {
    return apiFetch<Clinic>("directorio", `/clinics/admin/${clinicId}/approve`, {
        method: "POST"
    });
}

/** Rechaza y elimina la clínica (no se puede deshacer). */
export async function rejectClinic(clinicId: string): Promise<void> {
    return apiFetch<void>("directorio", `/clinics/admin/${clinicId}/reject`, {
        method: "DELETE"
    });
}

/** Suspender una clínica: deja de aparecer en el directorio público. No borra datos. */
export async function suspendClinic(clinicId: string): Promise<Clinic> {
    return apiFetch<Clinic>("directorio", `/clinics/admin/${clinicId}/suspend`, {
        method: "POST"
    });
}

/** Reactivar una clínica suspendida. */
export async function unsuspendClinic(clinicId: string): Promise<Clinic> {
    return apiFetch<Clinic>("directorio", `/clinics/admin/${clinicId}/unsuspend`, {
        method: "POST"
    });
}

// --- Directorio (Veterinarios) ---
export async function getPendingVeterinarians(): Promise<Vet[]> {
    return apiFetch<Vet[]>("directorio", "/veterinarians/admin/pending");
}

export async function approveVeterinarian(vetId: string): Promise<Vet> {
    return apiFetch<Vet>("directorio", `/veterinarians/admin/${vetId}/approve`, {
        method: "POST"
    });
}

/** Rechaza y elimina el veterinario (no se puede deshacer). */
export async function rejectVeterinarian(vetId: string): Promise<void> {
    return apiFetch<void>("directorio", `/veterinarians/admin/${vetId}/reject`, {
        method: "DELETE"
    });
}

// --- Ecommerce (Productos) ---
export async function getPendingProducts(): Promise<Product[]> {
    return apiFetch<Product[]>("ecommerce", "/products/admin/pending");
}

export async function approveProduct(productId: string): Promise<Product> {
    return apiFetch<Product>("ecommerce", `/products/admin/${productId}/approve`, {
        method: "POST"
    });
}

/** Rechaza y elimina el producto (no se puede deshacer). */
export async function rejectProduct(productId: string): Promise<void> {
    return apiFetch<void>("ecommerce", `/products/admin/${productId}/reject`, {
        method: "DELETE"
    });
}

// --- KYC / Usuarios ---
/**
 * Identidades por revisar. Es el único listado que trae los documentos KYC (X6.1):
 * `GET /users/` y `/users/search` ya no los incluyen; solo llegan aquí y en `GET /users/{id}`.
 */
export async function getPendingVerifications(): Promise<AdminUserDetail[]> {
    return apiFetch<AdminUserDetail[]>("core", "/users/pending-verifications");
}

/** Aprueba (`VERIFIED`) o rechaza (`REJECTED`) la identidad de una cuenta. */
export async function verifyUser(userId: string, status: 'VERIFIED' | 'REJECTED'): Promise<AdminUserDetail> {
    return apiFetch<AdminUserDetail>("core", `/users/${userId}/verify?status=${status}`, {
        method: "POST"
    });
}

// --- Solicitudes de Adopción ---
export async function approveAdoptionRequest(requestId: string): Promise<AdoptionRequest> {
    return apiFetch<AdoptionRequest>("adopciones", `/pets/admin/requests/${requestId}/approve`, {
        method: "POST"
    });
}

/** Marca la solicitud como rechazada (no borra el registro; el refugio puede reconsiderarla). */
export async function rejectAdoptionRequest(requestId: string): Promise<AdoptionRequest> {
    // El endpoint de status acepta el sinónimo en español 'rechazado' → REJECTED
    return apiFetch<AdoptionRequest>("adopciones", `/pets/admin/requests/${requestId}/status?status=rechazado`, {
        method: "PUT"
    });
}
