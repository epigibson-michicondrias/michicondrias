/**
 * useLabProvider — Hook for lab provider/admin functionality
 * Pending orders, results upload, anomalies, status updates
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getLabOrders,
    getMyLabTests,
    setLabTestActive,
    updateLabAppointmentStatus,
    getProviderLabAppointments,
    getLabAnomalies,
    uploadLabResults,
    updateLabOrderStatus,
    createLabOrder,
    createLabTest,
} from '@/src/services/laboratorio';
import { showAlert } from '@/src/components/AppAlert';

export function useLabProvider() {
    const queryClient = useQueryClient();

    const pendingOrdersQuery = useQuery({
        queryKey: ['lab-orders-all'],
        queryFn: () => getLabOrders(),
    });

    const myTestsQuery = useQuery({
        queryKey: ['lab-tests-mine'],
        queryFn: getMyLabTests,
    });

    const invalidateOrders = () => {
        queryClient.invalidateQueries({ queryKey: ['lab-orders-all'] });
        queryClient.invalidateQueries({ queryKey: ['lab-anomalies'] });
        queryClient.invalidateQueries({ queryKey: ['lab-history'] });
    };

    const appointmentStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: 'confirmed' | 'completed' | 'cancelled' }) =>
            updateLabAppointmentStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lab-appointments-provider'] });
            queryClient.invalidateQueries({ queryKey: ['lab-appointments-client'] });
        },
        onError: (e: any) => showAlert({ type: 'error', title: 'No se pudo actualizar', message: e?.message || 'Inténtalo de nuevo.' }),
    });

    const toggleTestMutation = useMutation({
        mutationFn: ({ id, active }: { id: string; active: boolean }) => setLabTestActive(id, active),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lab-tests-mine'] });
            queryClient.invalidateQueries({ queryKey: ['lab-tests'] });
        },
        onError: (e: any) => showAlert({ type: 'error', title: 'No se pudo actualizar', message: e?.message || 'Inténtalo de nuevo.' }),
    });

    const appointmentsQuery = useQuery({
        queryKey: ['lab-appointments-provider'],
        queryFn: getProviderLabAppointments,
    });

    const anomaliesQuery = useQuery({
        queryKey: ['lab-anomalies'],
        queryFn: getLabAnomalies,
    });

    const uploadResultsMutation = useMutation({
        mutationFn: ({ orderId, data }: { orderId: string; data: any }) =>
            uploadLabResults(orderId, data),
        onSuccess: () => {
            invalidateOrders();
            showAlert({ type: 'success', title: 'Resultados enviados', message: 'Notificamos al dueño y al veterinario.' });
        },
        onError: (e: any) => {
            showAlert({ type: 'error', title: 'No se pudieron subir los resultados', message: e?.message || 'Inténtalo de nuevo.' });
        },
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
            updateLabOrderStatus(orderId, status),
        onSuccess: () => {
            invalidateOrders();
        },
        onError: (e: any) => {
            showAlert({ type: 'error', title: 'No se pudo actualizar el estado', message: e?.message || 'Inténtalo de nuevo.' });
        },
    });

    const createOrderMutation = useMutation({
        mutationFn: (data: any) => createLabOrder(data),
        onSuccess: () => {
            invalidateOrders();
            showAlert({ type: 'success', title: 'Éxito', message: 'Orden de laboratorio creada' });
        },
        onError: (e: any) => {
            showAlert({ type: 'error', title: 'No se pudo crear la orden', message: e?.message || 'Inténtalo de nuevo.' });
        },
    });

    const createTestMutation = useMutation({
        mutationFn: (data: any) => createLabTest(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lab-tests'] });
            queryClient.invalidateQueries({ queryKey: ['lab-tests-mine'] });
            showAlert({ type: 'success', title: 'Estudio publicado', message: 'Ya aparece en el catálogo para los clientes.' });
        },
        onError: (e: any) => {
            showAlert({ type: 'error', title: 'No se pudo crear el estudio', message: e?.message || 'Inténtalo de nuevo.' });
        },
    });

    return {
        // Data
        pendingOrders: pendingOrdersQuery.data || [],
        appointments: appointmentsQuery.data || [],
        anomalies: anomaliesQuery.data || [],

        // Loading
        isLoadingOrders: pendingOrdersQuery.isLoading,
        isLoadingAppointments: appointmentsQuery.isLoading,
        isLoadingAnomalies: anomaliesQuery.isLoading,

        // Mutations
        myTests: myTestsQuery.data || [],
        isLoadingTests: myTestsQuery.isLoading,
        updateAppointmentStatus: (id: string, status: 'confirmed' | 'completed' | 'cancelled') => appointmentStatusMutation.mutate({ id, status }),
        toggleTest: (id: string, active: boolean) => toggleTestMutation.mutate({ id, active }),
        uploadResults: uploadResultsMutation.mutateAsync,
        isUploadingResults: uploadResultsMutation.isPending,
        updateOrderStatus: updateStatusMutation.mutate,
        isUpdatingStatus: updateStatusMutation.isPending,
        createOrder: createOrderMutation.mutate,
        isCreatingOrder: createOrderMutation.isPending,
        createTest: createTestMutation.mutateAsync,
        isCreatingTest: createTestMutation.isPending,

        // Refetch
        refetchOrders: pendingOrdersQuery.refetch,
        refetchAppointments: appointmentsQuery.refetch,
    };
}
