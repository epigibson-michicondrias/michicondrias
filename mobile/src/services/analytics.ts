import { apiFetch } from "../lib/api";

export interface AnalyticsMetrics {
    kpis: {
        total_users: number;
        pending_verifications: number;
        approved_verifications: number;
        system_admins: number;
        active_users?: number;
        inactive_users?: number;
        rejected_verifications?: number;
        professionals?: number;
        new_users_7d?: number;
        new_users_30d?: number;
    };
    registrations_14d?: { date: string; count: number }[];
    role_distribution: Record<string, number>;
}

export async function getAdminAnalytics(): Promise<AnalyticsMetrics> {
    return apiFetch<AnalyticsMetrics>("core", "/analytics/dashboard");
}
