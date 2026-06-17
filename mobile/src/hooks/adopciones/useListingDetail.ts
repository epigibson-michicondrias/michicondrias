/**
 * useListingDetail — Hook for adoption listing detail
 */
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getListing } from '@/src/services/adopciones';
import type { Listing } from '@/src/types/adopciones';

export function useListingDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();

    const {
        data: listing,
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ['adopcion', id],
        queryFn: () => getListing(id!),
        enabled: !!id,
    });

    const goBack = () => router.back();
    const goToSolicitar = () => {
        if (id) router.push(`/adopciones/solicitar/${id}` as any);
    };

    return {
        listing,
        isLoading,
        error,
        refetch,
        goBack,
        goToSolicitar,
    };
}

export type { Listing };
