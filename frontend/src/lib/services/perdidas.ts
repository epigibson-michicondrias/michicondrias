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
    status: string;
    is_resolved: boolean;
    resolved_at: string | null;
    created_at: string | null;
    updated_at: string | null;
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
