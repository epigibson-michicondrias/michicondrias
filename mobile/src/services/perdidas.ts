import { apiFetch } from "../lib/api";

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
    status: string;
    is_resolved: boolean;
    created_at: string | null;

    // Michi-Tracker Pro fields
    has_tracker: boolean;
    tracker_device_id: string | null;
    current_lat: number | null;
    current_lng: number | null;
    last_tracked_at: string | null;
}

export async function getReports(
    reportType?: string,
    status: string = "active"
): Promise<LostPetReport[]> {
    const params = new URLSearchParams();
    if (reportType) params.append("report_type", reportType);
    if (status) params.append("status", status);

    const qs = params.toString() ? `?${params.toString()}` : "";
    return apiFetch<LostPetReport[]>("perdidas", `/reports/${qs}`);
}

export async function getReportById(reportId: string): Promise<LostPetReport> {
    return apiFetch<LostPetReport>("perdidas", `/reports/${reportId}`);
}

export async function updateTrackerLocation(reportId: string, lat: number, lng: number): Promise<LostPetReport> {
    return apiFetch<LostPetReport>("perdidas", `/reports/${reportId}/location`, {
        method: "PATCH",
        body: JSON.stringify({ current_lat: lat, current_lng: lng }),
    });
}

export async function getPerdidasPresignedUrl(ext: string): Promise<{ url: string; object_key: string }> {
    return apiFetch<{ url: string; object_key: string }>("perdidas", `/reports/presigned-url?ext=${ext}`);
}

export async function createReport(reportData: Partial<LostPetReport>): Promise<LostPetReport> {
    return apiFetch<LostPetReport>("perdidas", `/reports/`, {
        method: "POST",
        body: JSON.stringify(reportData)
    });
}

export async function resolveReport(reportId: string): Promise<LostPetReport> {
    return apiFetch<LostPetReport>("perdidas", `/reports/${reportId}/resolve`, {
        method: "POST",
    });
}

export async function updateReport(reportId: string, reportData: Partial<LostPetReport>): Promise<LostPetReport> {
    return apiFetch<LostPetReport>("perdidas", `/reports/${reportId}`, {
        method: "PATCH",
        body: JSON.stringify(reportData)
    });
}
