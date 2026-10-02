/**
 * useViewApplications — Hook for viewing all applications for a listing
 * Manages request list, detail modal, and status update mutations
 */
import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getListingRequests,
    updateRequestStatus,
    AdoptionRequest,
    getListing,
} from '@/src/services/adopciones';
import { showAlert } from '@/src/components/AppAlert';

export function useViewApplications() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const queryClient = useQueryClient();

    const [selectedRequest, setSelectedRequest] = useState<AdoptionRequest | null>(null);

    const { data: requests = [], isLoading } = useQuery({
        queryKey: ['listing-requests', id],
        queryFn: () => getListingRequests(id as string),
    });

    const { data: listing } = useQuery({
        queryKey: ['adopcion', id],
        queryFn: () => getListing(id as string),
    });

    const mutation = useMutation({
        mutationFn: ({ requestId, status }: { requestId: string; status: string }) =>
            updateRequestStatus(requestId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['listing-requests', id] });
            queryClient.invalidateQueries({ queryKey: ['user-listings-with-requests'] });
            queryClient.invalidateQueries({ queryKey: ['my-requests'] });
            setSelectedRequest(null);
            showAlert({ type: 'success', title: 'Éxito', message: 'Estado de la solicitud actualizado.' });
        },
        onError: (e: Error) => {
            showAlert({ type: 'error', title: 'Error', message: e.message || 'No se pudo actualizar la solicitud.' });
        },
    });

    const handleStatusUpdate = (requestId: string, status: string) => {
        const action = status === 'APPROVED' ? 'aprobar' : 'rechazar';
        showAlert({
            type: 'warning',
            title: 'Confirmar Acción',
            message: `¿Estás seguro de que deseas ${action} esta solicitud?`,
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Confirmar',
            onButtonPress: () => mutation.mutate({ requestId, status }),
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': case 'ADOPTED': return '#10b981';
            case 'REJECTED': return '#ef4444';
            default: return '#f59e0b';
        }
    };

    const goBack = () => router.back();
    const closeModal = () => setSelectedRequest(null);

    return {
        // Data
        requests,
        listing,
        isLoading,
        selectedRequest,

        // Actions
        setSelectedRequest,
        handleStatusUpdate,
        getStatusColor,
        goBack,
        closeModal,
    };
}
