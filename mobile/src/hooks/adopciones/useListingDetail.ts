/**
 * useListingDetail — Hook for adoption listing detail
 */
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getListing, getMyRequests } from '@/src/services/adopciones';
import { useAuth } from '@/src/contexts/AuthContext';
import type { Listing } from '@/src/types/adopciones';

export function useListingDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { user } = useAuth();

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

    // Solicitudes propias: para no dejar postular dos veces y llevar al seguimiento
    const { data: myRequests = [] } = useQuery({
        queryKey: ['my-adoption-requests'],
        queryFn: getMyRequests,
        enabled: !!user?.id,
    });
    const myRequest = myRequests.find((r) => r.listing_id === id && r.status !== 'REJECTED');
    const isOwner = !!user?.id && user.id === listing?.published_by;

    const goBack = () => router.back();
    const goToMyRequests = () => router.push('/adopciones/mis-solicitudes' as any);
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
        goToMyRequests,
        myRequest,
        isOwner,
    };
}

export type { Listing };
