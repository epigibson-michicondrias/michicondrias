/**
 * useApplicationDetail — Hook for processing a single adoption application
 * Manages request detail fetching, status updates, and approval flow
 */
import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getListing, getRequest, updateRequestStatus, approveAdoption } from '@/src/services/adopciones';
import { showAlert } from '@/src/components/AppAlert';
import { REQUEST_STATUS } from '@/src/features/adopciones/requestStatus';

export const STATUS_LABELS = REQUEST_STATUS;

export function useApplicationDetail() {
    const { id } = useLocalSearchParams();
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
            showAlert({ type: 'success', title: 'Listo', message: 'Le avisamos a quien envió la solicitud.' });
        },
        onError: (e: Error) => {
            showAlert({ type: 'error', title: 'No se pudo actualizar', message: e.message || 'Inténtalo de nuevo.' });
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
            showAlert({ type: 'error', title: 'No se pudo aprobar', message: e.message || 'Inténtalo de nuevo.' });
        },
    });

    const handleStatusUpdate = (status: string) => {
        const statusInfo = STATUS_LABELS[status] || STATUS_LABELS.PENDING;

        if (status === 'INTERVIEW_SCHEDULED' && !interviewDate) {
            showAlert({ type: 'info', title: 'Falta la fecha', message: 'Escribe cuándo y dónde será la entrevista.' });
            return;
        }

        showAlert({
            type: 'warning',
            title: status === 'REJECTED' ? '¿Rechazar esta solicitud?' : `¿Pasar a «${statusInfo.label}»?`,
            message: status === 'REJECTED' ? 'Se le avisará a quien la envió. No se puede deshacer.' : 'Se le avisará a quien la envió.',
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: status === 'REJECTED' ? 'Rechazar' : 'Confirmar',
            onButtonPress: () => statusMutation.mutate(status),
        });
    };

    const handleApprove = () => {
        showAlert({
            type: 'warning',
            title: '¿Aprobar la adopción?',
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


    return {
        // Data
        request,
        listing,
        isLoading,
        statusInfo,
        notes,
        interviewDate,

        isMutating: statusMutation.isPending || approveMutation.isPending,

        // Actions
        setNotes,
        setInterviewDate,
        handleStatusUpdate,
        handleApprove,
    };
}
