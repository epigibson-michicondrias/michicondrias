/**
 * useRefugeApplications — Hook for refuge applications screen
 * Uses getRefugeApplications from adopciones service
 */
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { getRefugeApplications } from '@/src/services/adopciones';
import type { AdoptionForm } from '@/src/types/adopciones';

/** Tono semántico por estado; el color real se toma del tema en la pantalla. */
export const STATUS_TONES: Record<string, 'warning' | 'info' | 'success' | 'error'> = {
    pending: 'warning',
    submitted: 'warning',
    under_review: 'info',
    approved: 'success',
    rejected: 'error',
    reviewing: 'info',
};

export const STATUS_LABELS: Record<string, string> = {
    pending: 'Pendiente',
    submitted: 'Pendiente',
    under_review: 'En revisión',
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
        router.push(`/adopciones/contrato/${applicationId}` as any);
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
