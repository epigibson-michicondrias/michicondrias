/**
 * useGroomingClient — Client-side grooming data hook
 * Fetches upcoming appointments and per-pet grooming history
 */
import { useState, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { showAlert } from '@/src/components/AppAlert';
import { errorMessage } from '@/src/hooks/servicios-pro/requestStatus';
import {
    getClientAppointments,
    getGroomingHistory,
    updateAppointmentStatus,
} from '@/src/services/grooming';
import type { GroomingAppointment, GroomingHistory } from '@/src/services/grooming';

export type AppointmentTab = 'upcoming' | 'history';

export function useGroomingClient(petId?: string) {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<AppointmentTab>('upcoming');

    const cancelMutation = useMutation({
        mutationFn: (id: string) => updateAppointmentStatus(id, 'cancelled'),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['grooming-client-appointments'] });
            queryClient.invalidateQueries({ queryKey: ['grooming-provider-appointments'] });
            queryClient.invalidateQueries({ queryKey: ['grooming-slots'] });
            showAlert({ type: 'success', title: 'Cita cancelada', message: 'Tu cita fue cancelada y el horario quedó libre.' });
        },
        onError: (e) => showAlert({ type: 'error', title: 'No se pudo cancelar', message: errorMessage(e, 'Inténtalo de nuevo.') }),
    });

    // ── All client appointments ──────────────────────────────────
    const {
        data: allAppointments = [],
        isLoading: appointmentsLoading,
        isRefetching: appointmentsRefetching,
        refetch: refetchAppointments,
    } = useQuery<GroomingAppointment[]>({
        queryKey: ['grooming-client-appointments'],
        queryFn: () => getClientAppointments(),
    });

    // ── Filter by tab ────────────────────────────────────────────
    const upcomingAppointments = useMemo(
        () => allAppointments.filter(a =>
            a.status === 'scheduled' || a.status === 'pending' || a.status === 'confirmed' || a.status === 'in_progress',
        ),
        [allAppointments],
    );

    const pastAppointments = useMemo(
        () => allAppointments.filter(a =>
            a.status === 'completed' || a.status === 'cancelled',
        ),
        [allAppointments],
    );

    const displayedAppointments = activeTab === 'upcoming' ? upcomingAppointments : pastAppointments;

    // ── Per-pet grooming history (used by historial screen) ──────
    const {
        data: groomingHistory,
        isLoading: historyLoading,
        isRefetching: historyRefetching,
        refetch: refetchHistory,
    } = useQuery<GroomingHistory>({
        queryKey: ['grooming-history', petId],
        queryFn: () => getGroomingHistory(petId!),
        enabled: !!petId,
    });

    return {
        cancelAppointment: (id: string) => cancelMutation.mutate(id),
        cancellingId: cancelMutation.isPending ? cancelMutation.variables ?? null : null,
        // Tab
        activeTab,
        setActiveTab,

        // Appointments
        allAppointments,
        upcomingAppointments,
        pastAppointments,
        displayedAppointments,
        appointmentsLoading,
        appointmentsRefetching,
        refetchAppointments,

        // Pet history
        groomingHistory,
        historyLoading,
        historyRefetching,
        refetchHistory,
    };
}
