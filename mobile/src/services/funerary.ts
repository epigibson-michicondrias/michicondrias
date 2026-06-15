import { apiFetch } from "../lib/api";

export interface PetDeath {
    id: string;
    pet_id: string;
    funerary_id: string;
    date_of_death: string;
    cause_of_death?: string;
    cremation_type?: string;
    urn_model?: string;
    certificate_url?: string;
    notes?: string;
    created_at?: string;
}

export interface PetDeathCreate {
    pet_id: string;
    date_of_death: string;
    cause_of_death?: string;
    cremation_type?: string;
    urn_model?: string;
    certificate_url?: string;
    notes?: string;
}

export interface PetMemorialPost {
    id: string;
    pet_id: string;
    user_id: string;
    message: string;
    photo_url?: string;
    created_at?: string;
}

export interface PetMemorialPostCreate {
    pet_id: string;
    message: string;
    photo_url?: string;
}

export interface FuneraryService {
    id: string;
    funerary_id: string;
    name: string;
    description?: string;
    price: number;
    cremation_type?: string;
    urn_included: boolean;
    is_active: boolean;
    created_at?: string;
}

export interface FuneraryServiceCreate {
    name: string;
    description?: string;
    price: number;
    cremation_type?: string;
    urn_included?: boolean;
}

export interface FuneraryBooking {
    id: string;
    client_id: string;
    pet_id: string;
    service_id: string;
    scheduled_date: string;
    status: string;
    notes?: string;
    created_at?: string;
}

export interface FuneraryBookingCreate {
    pet_id: string;
    service_id: string;
    scheduled_date: string;
    notes?: string;
}

export async function recordDeathReport(data: PetDeathCreate): Promise<PetDeath> {
    return apiFetch<PetDeath>("funeraria", "/death-report", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function getMemorialPosts(petId: string): Promise<PetMemorialPost[]> {
    return apiFetch<PetMemorialPost[]>("funeraria", `/memorial/${petId}`);
}

export async function createMemorialPost(data: PetMemorialPostCreate): Promise<PetMemorialPost> {
    return apiFetch<PetMemorialPost>("funeraria", "/memorial/post", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function createFuneraryService(data: FuneraryServiceCreate): Promise<FuneraryService> {
    return apiFetch<FuneraryService>("funeraria", "/services", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function getActiveFuneraryServices(): Promise<FuneraryService[]> {
    return apiFetch<FuneraryService[]>("funeraria", "/services");
}

export async function createBooking(data: FuneraryBookingCreate): Promise<FuneraryBooking> {
    return apiFetch<FuneraryBooking>("funeraria", "/bookings", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function getClientBookings(): Promise<FuneraryBooking[]> {
    return apiFetch<FuneraryBooking[]>("funeraria", "/bookings/client");
}

export async function getProviderBookings(): Promise<FuneraryBooking[]> {
    return apiFetch<FuneraryBooking[]>("funeraria", "/bookings/provider");
}

export async function downloadDeathCertificate(deathId: string): Promise<any> {
    return apiFetch<any>("funeraria", `/certificate/${deathId}/pdf`);
}

export async function getMemorialFeed(petId: string, sortBy?: string): Promise<PetMemorialPost[]> {
    const params = new URLSearchParams();
    if (sortBy) params.append("sort_by", sortBy);
    const query = params.toString();
    return apiFetch<PetMemorialPost[]>("funeraria", `/memorial/${petId}/feed${query ? `?${query}` : ""}`);
}
