/**
 * useApplications — Hook for managing adoption applications on user's listings
 * Extracts data fetching, filtering, and mutations from app/adopciones/solicitudes.tsx
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { getMyListings, getListingRequests, updateRequestStatus } from '@/src/services/adopciones';
import { useAuth } from '@/src/contexts/AuthContext';
import { showAlert } from '@/src/components/AppAlert';
import type { Listing, AdoptionRequest } from '@/src/types/adopciones';

export type ListingWithRequests = Listing & { requests: AdoptionRequest[] };

type Tone = 'warning' | 'info' | 'primary' | 'success' | 'accent' | 'error';
const STATUS_LABELS: Record<string, { label: string; tone: Tone }> = {
    PENDING: { label: "Pendiente", tone: 'warning' },
    REVIEWING: { label: "En revisión", tone: 'info' },
    INTERVIEW_SCHEDULED: { label: "Entrevista programada", tone: 'primary' },
    APPROVED: { label: "Pre-aprobada", tone: 'success' },
    ADOPTED: { label: "Adoptado", tone: 'accent' },
    REJECTED: { label: "Rechazada", tone: 'error' },
};

const FILTER_OPTIONS = [
    { key: 'all', label: 'Todas' },
    { key: 'PENDING', label: 'Pendientes' },
    { key: 'REVIEWING', label: 'En Revisión' },
    { key: 'INTERVIEW_SCHEDULED', label: 'Entrevista' },
    { key: 'APPROVED', label: 'Aprobadas' },
];

export function useApplications() {
    const router = useRouter();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [refreshing, setRefreshing] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const { data: listings = [], isLoading, refetch } = useQuery({
        queryKey: ['user-listings-with-requests'],
        queryFn: async () => {
            const userListings = await getMyListings();

            const listingsWithRequests = await Promise.all(
                userListings.map(async (listing) => {
                    try {
                        const requests = await getListingRequests(listing.id);
                        return { ...listing, requests };
                    } catch {
                        return { ...listing, requests: [] };
                    }
                })
            );

            return listingsWithRequests as ListingWithRequests[];
        },
        enabled: !!user?.id,
    });

    const mutation = useMutation({
        mutationFn: ({ requestId, status }: { requestId: string; status: string }) =>
            updateRequestStatus(requestId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-listings-with-requests'] });
            queryClient.invalidateQueries({ queryKey: ['listing-requests'] });
            queryClient.invalidateQueries({ queryKey: ['my-requests'] });
        },
        onError: (e: any) => {
            showAlert({ type: 'error', title: 'No se pudo actualizar', message: e?.message || 'Inténtalo de nuevo.' });
        },
    });

    const onRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    const handleStatusUpdate = (requestId: string, status: string) => {
        const statusInfo = STATUS_LABELS[status] || STATUS_LABELS.PENDING;
        showAlert({
            type: 'warning',
            title: 'Actualizar Estado',
            message: `¿Cambiar estado a "${statusInfo.label}"?`,
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Confirmar',
            onButtonPress: () => mutation.mutate({ requestId, status }),
        });
    };

    const filterRequests = (requests: AdoptionRequest[]) => {
        if (filterStatus === 'all') return requests;
        return requests.filter((request) => request.status === filterStatus);
    };

    const allRequests = listings.flatMap((listing) =>
        listing.requests.map((request) => ({ request, listing }))
    );
    const filteredAllRequests = allRequests.filter(({ request }) => {
        if (filterStatus === 'all') return true;
        return request.status === filterStatus;
    });

    /** Color resuelto con el tema (se pasa `theme` desde la pantalla). */
    const getStatusInfo = (status: string, theme: any) => {
        const info = STATUS_LABELS[status] || STATUS_LABELS.PENDING;
        return { label: info.label, color: theme[info.tone] as string };
    };

    const goToRequestDetail = (requestId: string) =>
        router.push(`/adopciones/solicitud/${requestId}` as any);
    const goToListingRequests = (listingId: string) =>
        router.push(`/adopciones/ver-solicitudes/${listingId}` as any);

    return {
        listings,
        isLoading,
        refreshing,
        filterStatus,
        setFilterStatus,
        onRefresh,
        handleStatusUpdate,
        filterRequests,
        filteredAllRequests,
        getStatusInfo,
        goToRequestDetail,
        goToListingRequests,
        FILTER_OPTIONS,
        STATUS_LABELS,
    };
}

export type { Listing, AdoptionRequest };
