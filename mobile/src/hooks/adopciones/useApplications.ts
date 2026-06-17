/**
 * useApplications — Hook for managing adoption applications on user's listings
 * Extracts data fetching, filtering, and mutations from app/adopciones/solicitudes.tsx
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { getListings, getListingRequests, updateRequestStatus } from '@/src/services/adopciones';
import { useAuth } from '@/src/contexts/AuthContext';
import { showAlert } from '@/src/components/AppAlert';
import type { Listing, AdoptionRequest } from '@/src/types/adopciones';

export type ListingWithRequests = Listing & { requests: AdoptionRequest[] };

const STATUS_LABELS: Record<string, { label: string; color: string; icon: string }> = {
    PENDING: { label: "Pendiente", color: "#f59e0b", icon: "⏳" },
    REVIEWING: { label: "En Revisión", color: "#3b82f6", icon: "🔍" },
    INTERVIEW_SCHEDULED: { label: "Entrevista Programada", color: "#8b5cf6", icon: "📅" },
    APPROVED: { label: "Pre-Aprobada", color: "#22c55e", icon: "✅" },
    ADOPTED: { label: "¡Adoptado!", color: "#ec4899", icon: "🎉" },
    REJECTED: { label: "Rechazada", color: "#ef4444", icon: "❌" },
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
            const allListings = await getListings();
            const userListings = allListings.filter(listing => listing.published_by === user?.id);

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

    const getStatusInfo = (status: string) => STATUS_LABELS[status] || STATUS_LABELS.PENDING;

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
