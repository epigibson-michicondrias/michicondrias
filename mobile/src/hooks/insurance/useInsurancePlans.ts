/**
 * useInsurancePlans — Hook for insurance plans list screen
 * Fetches active insurance plans
 */
import { useQuery } from '@tanstack/react-query';
import { getActivePlans, InsurancePlan } from '@/src/services/insurance';

export function useInsurancePlans() {
    const {
        data: plans = [],
        isLoading,
        refetch,
        isRefetching,
    } = useQuery<InsurancePlan[]>({
        queryKey: ['insurancePlans'],
        queryFn: () => getActivePlans(),
    });

    return {
        plans,
        isLoading,
        refetch,
        isRefetching,
    };
}
