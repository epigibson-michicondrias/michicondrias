/**
 * useRefugeApplications — Hook for refuge applications screen
 * Uses getRefugeApplications from adopciones service
 */
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { getRefugeApplications } from '@/src/services/adopciones';
import type { AdoptionForm } from '@/src/types/adopciones';

export const STATUS_COLORS: Record<string, string> = {
    pending: '#f59e0b',
    approved: '#10b981',
    rejected: '#ef4444',
    reviewing: '#3b82f6',
};

export const STATUS_LABELS: Record<string, string> = {
    pending: 'Pendiente',
    approved: 'Aprobada',
    rejected: 'Rechazada',
    reviewing: 'En revisión',
};

export function useRefugeApplications() {
    const router = useRouter();

    const {
        data: applications = [],
        isLoading,
        isRefetching,
        refetch,
    } = useQuery({
        queryKey: ['refuge-applications'],
        queryFn: getRefugeApplications,
    });

    const goToApplicationDetail = (applicationId: string) => {
        router.push(`/adopciones/solicitud/${applicationId}`);
    };

    return {
        // Data
        applications,
        isLoading,
        isRefetching,

        // Actions
        refetch,
        goToApplicationDetail,
    };
}

export type { AdoptionForm };
