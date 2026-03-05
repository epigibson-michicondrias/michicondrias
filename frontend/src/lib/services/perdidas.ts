import { apiFetch } from "../api";

export interface LostPetReport {
    id: string;
    reporter_id: string;
    pet_name: string;
    species: string;
    breed: string | null;
    color: string | null;
    size: string | null;
    age_approx: string | null;
    description: string | null;
    image_url: string | null;
    report_type: "lost" | "found";
    last_seen_location: string | null;
    latitude: number | null;
    longitude: number | null;
    contact_phone: string | null;
    contact_email: string | null;

    // Michi-Tracker fields
    has_tracker: boolean;
    tracker_device_id: string | null;
    current_lat: number | null;
    current_lng: number | null;
    last_tracked_at: string | null;

    status: string;
    is_resolved: boolean;
    resolved_at: string | null;
    created_at: string | null;
    updated_at: string | null;
}

export interface PetfriendlyPlace {
    id: string;
    added_by: string;
    name: string;
    category: string;
    address: string | null;
    city: string | null;
    description: string | null;
    image_url: string | null;
    latitude: number | null;
    longitude: number | null;
    phone: string | null;
    website: string | null;
    rating: number;
    pet_sizes_allowed: string;
    has_water_bowls: string;
    has_pet_menu: string;
    created_at: string | null;
}

export interface PlaceCreate {
    name: string;
    category: string;
    address?: string;
    city?: string;
    description?: string;
    image_url?: string;
    latitude?: number;
    longitude?: number;
    phone?: string;
    website?: string;
    rating?: number;
    pet_sizes_allowed?: string;
    has_water_bowls?: string;
    has_pet_menu?: string;
}

export interface LostPetReportCreate {
    pet_name: string;
    species: string;
    breed?: string;
    color?: string;
    size?: string;
    age_approx?: string;
    description?: string;
    image_url?: string;
    report_type: "lost" | "found";
    last_seen_location?: string;
    latitude?: number;
    longitude?: number;
    contact_phone?: string;
    contact_email?: string;

    has_tracker?: boolean;
    tracker_device_id?: string;
}

export async function updateTrackerLocation(reportId: string, lat: number, lng: number): Promise<LostPetReport> {
    return apiFetch<LostPetReport>("perdidas", `/reports/${reportId}/location`, {
        method: "PATCH",
        body: JSON.stringify({ current_lat: lat, current_lng: lng }),
    });
}

export async function getReports(
    reportType?: string,
    status: string = "active",
    species?: string
): Promise<LostPetReport[]> {
    const params = new URLSearchParams();
    if (reportType) params.append("report_type", reportType);
    if (status) params.append("status", status);
    if (species) params.append("species", species);

    const qs = params.toString() ? `?${params.toString()}` : "";
    return apiFetch<LostPetReport[]>("perdidas", `/reports/${qs}`);
}

export async function getMyReports(): Promise<LostPetReport[]> {
    return apiFetch<LostPetReport[]>("perdidas", "/reports/mine");
}

export async function getReportById(reportId: string): Promise<LostPetReport> {
    return apiFetch<LostPetReport>("perdidas", `/reports/${reportId}`);
}

export async function createReport(report: LostPetReportCreate): Promise<LostPetReport> {
    return apiFetch<LostPetReport>("perdidas", "/reports/", {
        method: "POST",
        body: JSON.stringify(report),
    });
}

export async function updateReport(reportId: string, data: Partial<LostPetReport>): Promise<LostPetReport> {
    return apiFetch<LostPetReport>("perdidas", `/reports/${reportId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}

export async function resolveReport(reportId: string): Promise<LostPetReport> {
    return updateReport(reportId, { is_resolved: true, status: "resolved" });
}

export async function getPlaces(category?: string, city?: string): Promise<PetfriendlyPlace[]> {
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    if (city) params.append("city", city);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return apiFetch<PetfriendlyPlace[]>("perdidas", `/places/${qs}`);
}

export async function createPlace(place: PlaceCreate): Promise<PetfriendlyPlace> {
    return apiFetch<PetfriendlyPlace>("perdidas", "/places/", {
        method: "POST",
        body: JSON.stringify(place),
    });
}
export async function getPlaceById(placeId: string): Promise<PetfriendlyPlace> {
    return apiFetch<PetfriendlyPlace>("perdidas", `/places/${placeId}`);
}
