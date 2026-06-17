/**
 * useAdminStats — Business logic for the admin stats screen
 * Fetches analytics data and KPIs
 */
import { useQuery } from '@tanstack/react-query';
import { getAdminAnalytics } from '@/src/services/analytics';

export function useAdminStats() {
    const { data: metrics, isLoading } = useQuery({
        queryKey: ['admin-analytics'],
        queryFn: getAdminAnalytics,
    });

    const kpis = metrics?.kpis;
    const roleDistribution = metrics?.role_distribution;

    return {
        metrics,
        isLoading,
        kpis,
        roleDistribution,
    };
}
