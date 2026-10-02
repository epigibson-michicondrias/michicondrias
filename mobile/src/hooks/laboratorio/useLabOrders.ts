/**
 * useLabOrders — Hook for client-facing lab functionality
 * Lab appointments, pet lab history, and test catalog
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getClientLabAppointments,
    createLabAppointment,
    getPetLabHistory,
    getLabTests,
    updateLabAppointmentStatus,
} from '@/src/services/laboratorio';
import { showAlert } from '@/src/components/AppAlert';

export function useLabOrders(petId?: string) {
    const queryClient = useQueryClient();

    const appointmentsQuery = useQuery({
        queryKey: ['lab-appointments-client'],
        queryFn: getClientLabAppointments,
    });

    const testsQuery = useQuery({
        queryKey: ['lab-tests'],
        queryFn: getLabTests,
    });

    const historyQuery = useQuery({
        queryKey: ['lab-history', petId],
        queryFn: () => getPetLabHistory(petId!),
        enabled: !!petId,
    });

    const createAppointmentMutation = useMutation({
        mutationFn: (data: any) => createLabAppointment(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lab-appointments-client'] });
            queryClient.invalidateQueries({ queryKey: ['lab-appointments-provider'] });
        },
        onError: (e: any) => {
            showAlert({ type: 'error', title: 'No se pudo crear la cita', message: e?.message || 'Inténtalo de nuevo.' });
        },
    });

    const cancelAppointmentMutation = useMutation({
        mutationFn: (id: string) => updateLabAppointmentStatus(id, 'cancelled'),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lab-appointments-client'] });
            queryClient.invalidateQueries({ queryKey: ['lab-appointments-provider'] });
        },
        onError: (e: any) => {
            showAlert({ type: 'error', title: 'No se pudo cancelar', message: e?.message || 'Inténtalo de nuevo.' });
        },
    });

    return {
        // Data
        appointments: appointmentsQuery.data || [],
        tests: testsQuery.data || [],
        history: historyQuery.data || [],

        // Loading
        isLoadingAppointments: appointmentsQuery.isLoading,
        isLoadingTests: testsQuery.isLoading,
        isLoadingHistory: historyQuery.isLoading,

        // Actions
        createAppointment: createAppointmentMutation.mutateAsync,
        cancelAppointment: cancelAppointmentMutation.mutate,
        isCancelling: cancelAppointmentMutation.isPending,
        isCreatingAppointment: createAppointmentMutation.isPending,

        // Refetch
        refetchAppointments: appointmentsQuery.refetch,
    };
}
