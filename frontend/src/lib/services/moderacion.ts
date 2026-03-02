import { apiFetch } from "../api";
import { Listing } from "./adopciones";

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
