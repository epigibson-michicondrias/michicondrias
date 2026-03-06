import { apiFetch } from "../lib/api";

export interface AnalyticsMetrics {
    kpis: {
        total_users: number;
        pending_verifications: number;
        approved_verifications: number;
        system_admins: number;
    };
    role_distribution: Record<string, number>;
}

export async function getAdminAnalytics(): Promise<AnalyticsMetrics> {
    return apiFetch<AnalyticsMetrics>("core", "/analytics/dashboard");
}
