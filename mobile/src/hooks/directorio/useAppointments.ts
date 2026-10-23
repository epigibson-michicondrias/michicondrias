/**
 * useAppointments — Data fetching, filtering, and mutations for the appointments screen
 */
import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserAppointments, cancelAppointment, Appointment } from '@/src/services/citas';
import { getMyAppointments } from '@/src/services/directorio';
import type { AppointmentItem } from '@/src/services/directorio';
import { showAlert } from '@/src/components/AppAlert';

export type FilterTab = 'all' | 'scheduled' | 'confirmed' | 'completed' | 'cancelled';

/** Etiqueta y tono del tema por estado (el color se resuelve con `theme[tone]`). */
export const STATUS_CONFIG: Record<string, { label: string; tone: 'warning' | 'info' | 'success' | 'primary' | 'error' }> = {
    scheduled: { label: 'Por confirmar', tone: 'warning' },
    pending: { label: 'Por confirmar', tone: 'warning' },
    rescheduled: { label: 'Reagendada', tone: 'info' },
    confirmed: { label: 'Confirmada', tone: 'success' },
    completed: { label: 'Completada', tone: 'primary' },
    cancelled: { label: 'Cancelada', tone: 'error' },
};

export const FILTER_TABS: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'Todas' },
    { key: 'scheduled', label: 'Por confirmar' },
    { key: 'confirmed', label: 'Confirmadas' },
    { key: 'completed', label: 'Completadas' },
    { key: 'cancelled', label: 'Canceladas' },
];

export function formatDateTime(dateStr: string): { date: string; time: string } {
    try {
        const parts = dateStr.split(' ');
        if (parts.length >= 2) {
            return { date: parts[0], time: parts.slice(1).join(' ') };
        }
        const d = new Date(dateStr);
        return {
            date: d.toLocaleDateString('es-MX'),
            time: d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
        };
    } catch {
        return { date: dateStr, time: '' };
    }
}

export function useAppointments() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

    const { data: appointments = [], isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['user-appointments'],
        queryFn: getUserAppointments,
    });

    // Directorio appointments (from the directorio service)
    const { data: directorioAppointments = [], isLoading: directorioLoading } = useQuery<AppointmentItem[]>({
        queryKey: ['my-directorio-appointments'],
        queryFn: getMyAppointments,
    });

    const invalidateAppointments = () => {
        queryClient.invalidateQueries({ queryKey: ['user-appointments'] });
        queryClient.invalidateQueries({ queryKey: ['my-directorio-appointments'] });
        queryClient.invalidateQueries({ queryKey: ['clinic-slots'] });
    };

    const cancelMutation = useMutation({
        mutationFn: (id: string) => cancelAppointment(id),
        onSuccess: () => {
            invalidateAppointments();
            showAlert({
                type: 'success',
                title: 'Cita Cancelada',
                message: 'Tu cita ha sido cancelada exitosamente.',
            });
        },
        onError: (error: any) => {
            showAlert({
                type: 'error',
                title: 'No se pudo cancelar',
                message: error.message || 'Inténtalo de nuevo.',
            });
        },
    });

    const handleCancel = useCallback((appointment: Appointment) => {
        showAlert({
            type: 'warning',
            title: '¿Cancelar la cita?',
            message: `¿Estás seguro de cancelar tu cita en ${appointment.clinic_name || 'esta clínica'}?`,
            buttonText: 'Sí, cancelar',
            showCancel: true,
            cancelText: 'No, mantener',
            onButtonPress: () => cancelMutation.mutate(appointment.id),
        });
    }, [cancelMutation]);

    const handleReschedule = useCallback((appointment: Appointment) => {
        router.push(`/directorio/citas/agendar/${appointment.clinic_id}?reschedule_id=${appointment.id}&service_id=${appointment.service_id ?? ''}` as any);
    }, [router]);

    const matches = (a: Appointment, key: FilterTab) => {
        if (key === 'all') return a.status !== 'cancelled' && a.status !== 'rescheduled';
        if (key === 'scheduled') return a.status === 'pending' || a.status === 'scheduled';
        return a.status === key;
    };
    const countFor = (key: FilterTab) => appointments.filter((a) => matches(a, key)).length;

    const filtered = appointments.filter(a => {
        if (activeFilter === 'all') return a.status !== 'cancelled' && a.status !== 'rescheduled';
        // El backend guarda las citas por confirmar como "pending"
        if (activeFilter === 'scheduled') return a.status === 'pending' || a.status === 'scheduled';
        return a.status === activeFilter;
    });

    return {
        appointments: filtered,
        countFor,
        allAppointments: appointments,
        directorioAppointments,
        directorioLoading,
        isLoading,
        isRefetching,
        refetch,
        activeFilter,
        setActiveFilter,
        handleCancel,
        handleReschedule,
        cancelMutation,
    };
}
