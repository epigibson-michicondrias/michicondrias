/**
 * useGroomingClient — Client-side grooming data hook
 * Fetches upcoming appointments and per-pet grooming history
 */
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    getClientAppointments,
    getGroomingHistory,
} from '@/src/services/grooming';
import type { GroomingAppointment, GroomingHistory } from '@/src/services/grooming';

export type AppointmentTab = 'upcoming' | 'history';

export function useGroomingClient(petId?: string) {
    const [activeTab, setActiveTab] = useState<AppointmentTab>('upcoming');

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
            a.status === 'scheduled' || a.status === 'confirmed' || a.status === 'in_progress',
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
