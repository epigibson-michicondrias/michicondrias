/**
 * useApplicationDetail — Hook for processing a single adoption application
 * Manages request detail fetching, status updates, and approval flow
 */
import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getListing,
    getListingRequests,
    updateRequestStatus,
    approveAdoption,
    AdoptionRequest,
    Listing,
} from '@/src/services/adopciones';
import { useAuth } from '@/src/contexts/AuthContext';
import { showAlert } from '@/src/components/AppAlert';

export const STATUS_LABELS: Record<string, { label: string; color: string; icon: string }> = {
    PENDING: { label: "Pendiente", color: "#f59e0b", icon: "⏳" },
    REVIEWING: { label: "En Revisión", color: "#3b82f6", icon: "🔍" },
    INTERVIEW_SCHEDULED: { label: "Entrevista Programada", color: "#8b5cf6", icon: "📅" },
    APPROVED: { label: "Pre-Aprobada", color: "#22c55e", icon: "✅" },
    ADOPTED: { label: "¡Adoptado!", color: "#ec4899", icon: "🎉" },
    REJECTED: { label: "Rechazada", color: "#ef4444", icon: "❌" },
};

export function useApplicationDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const [notes, setNotes] = useState('');
    const [interviewDate, setInterviewDate] = useState('');

    const { data: request, isLoading } = useQuery({
        queryKey: ['adoption-request', id],
        queryFn: async () => {
            const requests = await getListingRequests('all');
            return requests.find(r => r.id === id) || null;
        },
        enabled: !!id,
    });

    const { data: listing } = useQuery({
        queryKey: ['adopcion', request?.listing_id],
        queryFn: () => getListing(request!.listing_id),
        enabled: !!request?.listing_id,
    });

    const statusMutation = useMutation({
        mutationFn: (status: string) => updateRequestStatus(id as string, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adoption-request', id] });
            showAlert({ type: 'success', title: 'Éxito', message: 'Estado actualizado correctamente' });
        },
        onError: () => {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo actualizar el estado' });
        },
    });

    const approveMutation = useMutation({
        mutationFn: () => approveAdoption(id as string),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adoption-request', id] });
            showAlert({ type: 'success', title: '¡Éxito!', message: 'Adopción aprobada exitosamente' });
        },
        onError: () => {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo aprobar la adopción' });
        },
    });

    const handleStatusUpdate = (status: string) => {
        const statusInfo = STATUS_LABELS[status] || STATUS_LABELS.PENDING;

        if (status === 'INTERVIEW_SCHEDULED' && !interviewDate) {
            showAlert({ type: 'error', title: 'Error', message: 'Por favor selecciona una fecha para la entrevista' });
            return;
        }

        showAlert({
            type: 'warning',
            title: 'Confirmar Acción',
            message: `¿Cambiar estado a "${statusInfo.label}"?`,
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Confirmar',
            onButtonPress: () => statusMutation.mutate(status),
        });
    };

    const handleApprove = () => {
        showAlert({
            type: 'warning',
            title: 'Aprobar Adopción',
            message: '¿Estás seguro de que deseas aprobar esta adopción? Esta acción es irreversible.',
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Aprobar',
            onButtonPress: () => approveMutation.mutate(),
        });
    };

    const statusInfo = request
        ? STATUS_LABELS[request.status] || STATUS_LABELS.PENDING
        : STATUS_LABELS.PENDING;

    const goBack = () => router.back();

    return {
        // Data
        request,
        listing,
        isLoading,
        statusInfo,
        notes,
        interviewDate,

        // Actions
        setNotes,
        setInterviewDate,
        handleStatusUpdate,
        handleApprove,
        goBack,
    };
}
