/**
 * useAdminStats — Business logic for the admin stats screen
 * Fetches analytics data and KPIs (solo cifras reales del backend: `/analytics/dashboard`).
 */
import { useQuery } from '@tanstack/react-query';
import { getAdminAnalytics } from '@/services/analytics';
import { normalizeRole } from '@/constants/roles';

export interface RoleRow {
    role: string;
    count: number;
    /** Porcentaje sobre el total de usuarios (0–100). */
    pct: number;
}

export function useAdminStats() {
    const { data: metrics, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['admin-analytics'],
        queryFn: getAdminAnalytics,
    });

    const kpis = metrics?.kpis;
    const roleDistribution = metrics?.role_distribution;

    // Distribución por rol: alias unificados (p. ej. "hospital" y su alias), sin roles vacíos, de mayor a menor.
    const merged: Record<string, number> = {};
    for (const [role, count] of Object.entries(roleDistribution ?? {})) {
        const key = normalizeRole(role);
        merged[key] = (merged[key] ?? 0) + count;
    }
    const total = kpis?.total_users ?? 0;
    const roleRows: RoleRow[] = Object.entries(merged)
        .filter(([, count]) => count > 0)
        .map(([role, count]) => ({ role, count, pct: total ? (count / total) * 100 : 0 }))
        .sort((a, b) => b.count - a.count);

    const registrations = metrics?.registrations_14d ?? [];
    const maxRegistrations = Math.max(1, ...registrations.map((r) => r.count));
    const totalRegistrations = registrations.reduce((acc, r) => acc + r.count, 0);

    return {
        metrics,
        isLoading,
        refetch,
        isRefetching,
        kpis,
        roleDistribution,
        roleRows,
        registrations,
        maxRegistrations,
        totalRegistrations,
    };
}
