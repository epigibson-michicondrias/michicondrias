/**
 * useGroomingProvider — Provider-side grooming management hook
 * Fetches provider appointments, handles photo upload and status updates
 */
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { showAlert } from '@/src/components/AppAlert';
import {
    getProviderAppointments,
    updateAppointmentPhotos,
} from '@/src/services/grooming';
import type { GroomingAppointment, GroomingAppointmentUpdatePhotos } from '@/src/services/grooming';

export type ProviderFilter = 'all' | 'scheduled' | 'in_progress' | 'completed';

export function useGroomingProvider() {
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState<ProviderFilter>('all');

    // ── Provider appointments ────────────────────────────────────
    const {
        data: appointments = [],
        isLoading,
        isRefetching,
        refetch,
    } = useQuery<GroomingAppointment[]>({
        queryKey: ['grooming-provider-appointments'],
        queryFn: () => getProviderAppointments(),
    });

    const filteredAppointments = useMemo(() => {
        if (filter === 'all') return appointments;
        return appointments.filter(a => a.status === filter);
    }, [appointments, filter]);

    // ── Photo / status mutation ──────────────────────────────────
    const photoMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: GroomingAppointmentUpdatePhotos }) =>
            updateAppointmentPhotos(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['grooming-provider-appointments'] });
            showAlert({
                type: 'success',
                title: '¡Actualizado!',
                message: 'Las fotos y reporte se guardaron correctamente.',
            });
        },
        onError: () => {
            showAlert({
                type: 'error',
                title: 'Error',
                message: 'No se pudieron guardar los cambios.',
            });
        },
    });

    const updatePhotos = (appointmentId: string, data: GroomingAppointmentUpdatePhotos) => {
        photoMutation.mutate({ id: appointmentId, data });
    };

    const updateStatus = (appointmentId: string, status: string) => {
        photoMutation.mutate({ id: appointmentId, data: { status } });
    };

    return {
        // Data
        appointments: filteredAppointments,
        allAppointments: appointments,
        filter,

        // Loading
        isLoading,
        isRefetching,
        isUpdating: photoMutation.isPending,

        // Actions
        setFilter,
        refetch,
        updatePhotos,
        updateStatus,
    };
}
