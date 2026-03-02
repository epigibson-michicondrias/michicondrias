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
