/**
 * useApplicationDetail — Hook for processing a single adoption application
 * Manages request detail fetching, status updates, and approval flow
 */
import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getListing,
    getRequest,
    updateRequestStatus,
    approveAdoption,
    AdoptionRequest,
    Listing,
} from '@/src/services/adopciones';
import { useAuth } from '@/src/contexts/AuthContext';
import { showAlert } from '@/src/components/AppAlert';

export const STATUS_LABELS: Record<string, { label: string; tone: 'warning' | 'info' | 'primary' | 'success' | 'accent' | 'error' }> = {
    PENDING: { label: "Pendiente", tone: 'warning' },
    REVIEWING: { label: "En revisión", tone: 'info' },
    INTERVIEW_SCHEDULED: { label: "Entrevista programada", tone: 'primary' },
    APPROVED: { label: "Pre-aprobada", tone: 'success' },
    ADOPTED: { label: "Adoptado", tone: 'accent' },
    REJECTED: { label: "Rechazada", tone: 'error' },
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
        queryFn: () => getRequest(id as string),
        enabled: !!id,
    });

    const { data: listing } = useQuery({
        queryKey: ['adopcion', request?.listing_id],
        queryFn: () => getListing(request!.listing_id),
        enabled: !!request?.listing_id,
    });

    const statusMutation = useMutation({
        mutationFn: (status: string) => {
            const parts: string[] = [];
            if (status === 'INTERVIEW_SCHEDULED' && interviewDate) parts.push(`Entrevista: ${interviewDate}.`);
            if (notes.trim()) parts.push(notes.trim());
            return updateRequestStatus(id as string, status, parts.join(' ') || undefined);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adoption-request', id] });
            queryClient.invalidateQueries({ queryKey: ['user-listings-with-requests'] });
            queryClient.invalidateQueries({ queryKey: ['listing-requests'] });
            queryClient.invalidateQueries({ queryKey: ['adopciones-listings'] });
            queryClient.invalidateQueries({ queryKey: ['my-adopciones'] });
            showAlert({ type: 'success', title: 'Éxito', message: 'Estado actualizado correctamente' });
        },
        onError: (e: Error) => {
            showAlert({ type: 'error', title: 'Error', message: e.message || 'No se pudo actualizar el estado' });
        },
    });

    const approveMutation = useMutation({
        mutationFn: () => approveAdoption(id as string),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adoption-request', id] });
            queryClient.invalidateQueries({ queryKey: ['user-listings-with-requests'] });
            queryClient.invalidateQueries({ queryKey: ['listing-requests'] });
            queryClient.invalidateQueries({ queryKey: ['adopciones-listings'] });
            queryClient.invalidateQueries({ queryKey: ['my-adopciones'] });
            queryClient.invalidateQueries({ queryKey: ['my-adoption-requests'] });
            queryClient.invalidateQueries({ queryKey: ['user-pets'] });
            showAlert({ type: 'success', title: 'Adopción aprobada', message: 'La mascota ya aparece en la cuenta del adoptante.' });
        },
        onError: (e: Error) => {
            showAlert({ type: 'error', title: 'Error', message: e.message || 'No se pudo aprobar la adopción' });
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
            message: '¿Aprobar esta adopción? La mascota se registrará a nombre del adoptante, las demás solicitudes se rechazarán y esta acción no se puede deshacer.',
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
