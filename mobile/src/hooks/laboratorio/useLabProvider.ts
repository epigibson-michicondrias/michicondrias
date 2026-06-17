/**
 * useLabProvider — Hook for lab provider/admin functionality
 * Pending orders, results upload, anomalies, status updates
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getPendingLabOrders,
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
        queryKey: ['lab-orders-pending'],
        queryFn: getPendingLabOrders,
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
            queryClient.invalidateQueries({ queryKey: ['lab-orders-pending'] });
            showAlert({ type: 'success', title: 'Éxito', message: 'Resultados subidos correctamente' });
        },
        onError: () => {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudieron subir los resultados' });
        },
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
            updateLabOrderStatus(orderId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lab-orders-pending'] });
            showAlert({ type: 'success', title: 'Éxito', message: 'Estado actualizado' });
        },
        onError: () => {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo actualizar el estado' });
        },
    });

    const createOrderMutation = useMutation({
        mutationFn: (data: any) => createLabOrder(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lab-orders-pending'] });
            showAlert({ type: 'success', title: 'Éxito', message: 'Orden de laboratorio creada' });
        },
        onError: () => {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo crear la orden' });
        },
    });

    const createTestMutation = useMutation({
        mutationFn: (data: any) => createLabTest(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lab-tests'] });
            showAlert({ type: 'success', title: 'Éxito', message: 'Prueba de laboratorio creada' });
        },
        onError: () => {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo crear la prueba' });
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
        uploadResults: uploadResultsMutation.mutate,
        isUploadingResults: uploadResultsMutation.isPending,
        updateOrderStatus: updateStatusMutation.mutate,
        isUpdatingStatus: updateStatusMutation.isPending,
        createOrder: createOrderMutation.mutate,
        isCreatingOrder: createOrderMutation.isPending,
        createTest: createTestMutation.mutate,
        isCreatingTest: createTestMutation.isPending,

        // Refetch
        refetchOrders: pendingOrdersQuery.refetch,
        refetchAppointments: appointmentsQuery.refetch,
    };
}
