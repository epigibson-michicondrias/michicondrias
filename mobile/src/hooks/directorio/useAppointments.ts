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

export type FilterTab = 'all' | 'scheduled' | 'confirmed' | 'completed';

export const STATUS_CONFIG: Record<string, { label: string; color: string; lightColor: string }> = {
    scheduled: { label: 'Pendiente', color: '#f59e0b', lightColor: '#f59e0b20' },
    confirmed: { label: 'Confirmada', color: '#22c55e', lightColor: '#22c55e20' },
    completed: { label: 'Completada', color: '#3b82f6', lightColor: '#3b82f620' },
    cancelled: { label: 'Cancelada', color: '#ef4444', lightColor: '#ef444420' },
};

export const FILTER_TABS: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'Todas' },
    { key: 'scheduled', label: 'Pendientes' },
    { key: 'confirmed', label: 'Confirmadas' },
    { key: 'completed', label: 'Completadas' },
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

    const cancelMutation = useMutation({
        mutationFn: (id: string) => cancelAppointment(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-appointments'] });
            showAlert({
                type: 'success',
                title: 'Cita Cancelada',
                message: 'Tu cita ha sido cancelada exitosamente.',
            });
        },
        onError: (error: any) => {
            showAlert({
                type: 'error',
                title: 'Error',
                message: error.message || 'No se pudo cancelar la cita. Intenta de nuevo.',
            });
        },
    });

    const handleCancel = useCallback((appointment: Appointment) => {
        showAlert({
            type: 'warning',
            title: 'Cancelar Cita',
            message: `¿Estás seguro de cancelar tu cita en ${appointment.clinic_name || 'esta clínica'}?`,
            buttonText: 'Sí, cancelar',
            showCancel: true,
            cancelText: 'No, mantener',
            onButtonPress: () => cancelMutation.mutate(appointment.id),
        });
    }, [cancelMutation]);

    const handleReschedule = useCallback((appointment: Appointment) => {
        router.push(`/directorio/citas/agendar/${appointment.clinic_id}?reschedule_id=${appointment.id}` as any);
    }, [router]);

    const filtered = appointments.filter(a => {
        if (activeFilter === 'all') return a.status !== 'cancelled';
        return a.status === activeFilter;
    });

    return {
        appointments: filtered,
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
