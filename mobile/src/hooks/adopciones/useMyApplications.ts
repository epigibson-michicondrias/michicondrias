/**
 * useMyApplications — Hook for fetching user's own adoption applications
 * Extracts data fetching from app/adopciones/mis-solicitudes.tsx
 */
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { getMyRequests } from '@/src/services/adopciones';
import type { AdoptionRequest } from '@/src/types/adopciones';

const STEPS = [
    { key: "PENDING", label: "Enviada" },
    { key: "REVIEWING", label: "Revisión" },
    { key: "INTERVIEW_SCHEDULED", label: "Entrevista" },
    { key: "APPROVED", label: "Aprobada" },
    { key: "ADOPTED", label: "Finalizada" },
] as const;

export function useMyApplications() {
    const router = useRouter();

    const {
        data: requests = [],
        isLoading,
        isRefetching,
        refetch,
    } = useQuery({
        queryKey: ['my-requests'],
        queryFn: getMyRequests,
        refetchInterval: 30000,
    });

    const getProgressIndex = (status: string) => {
        if (status === 'REJECTED') return -1;
        const index = STEPS.findIndex((s) => s.key === status);
        return index !== -1 ? index : 0;
    };

    const goToExplore = () => router.push('/adopciones');
    const goToMyPets = () => router.push('/mascotas');

    return {
        requests,
        isLoading,
        isRefetching,
        refetch,
        getProgressIndex,
        goToExplore,
        goToMyPets,
        STEPS,
    };
}

export type { AdoptionRequest };
