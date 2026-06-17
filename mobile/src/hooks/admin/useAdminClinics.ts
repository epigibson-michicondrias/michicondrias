/**
 * useAdminClinics — Business logic for the admin clinics screen
 * Wraps useQuery for fetching all clinics
 */
import { useQuery } from '@tanstack/react-query';
import { getClinics, Clinic } from '@/src/services/directorio';

export type { Clinic };

export function useAdminClinics() {
    const { data: clinics = [], isLoading, isFetching, refetch } = useQuery({
        queryKey: ['admin-clinics'],
        queryFn: getClinics,
    });

    return {
        clinics,
        isLoading,
        isFetching,
        refetch,
    };
}
