/**
 * useViewApplications — Solicitudes recibidas para una publicación.
 * Cada solicitud se gestiona en `solicitud/[id]` (revisión, entrevista, pre-aprobación y aprobación final).
 */
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getListingRequests, getListing, type AdoptionRequest } from '@/src/services/adopciones';

/** Primero las que esperan respuesta; las cerradas al final. */
const ORDER: Record<string, number> = { PENDING: 0, REVIEWING: 1, INTERVIEW_SCHEDULED: 2, APPROVED: 3, ADOPTED: 4, REJECTED: 5 };

export function useViewApplications() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();

    const { data = [], isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['listing-requests', id],
        queryFn: () => getListingRequests(id as string),
        enabled: !!id,
    });

    const { data: listing } = useQuery({
        queryKey: ['adopcion', id],
        queryFn: () => getListing(id as string),
        enabled: !!id,
    });

    const requests = [...data].sort((a: AdoptionRequest, b: AdoptionRequest) =>
        (ORDER[a.status] ?? 9) - (ORDER[b.status] ?? 9)
        || new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return {
        requests,
        listing,
        isLoading,
        refetch,
        isRefetching,
        pendingCount: data.filter((r) => r.status === 'PENDING').length,
        openRequest: (requestId: string) => router.push(`/adopciones/solicitud/${requestId}`),
    };
}
