/**
 * useAdminOrders — Hook for admin order management
 * Wires up getAdminOrders, adminUpdateOrderStatus from ecommerce service
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminOrders, adminUpdateOrderStatus } from '@/src/services/ecommerce';
import type { Order } from '@/src/services/ecommerce';
import { showAlert } from '@/src/components/AppAlert';

export function useAdminOrders() {
    const queryClient = useQueryClient();
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const { data: orders = [], isLoading, refetch, isRefetching } = useQuery<Order[]>({
        queryKey: ['admin-orders'],
        queryFn: getAdminOrders,
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
            adminUpdateOrderStatus(orderId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
            showAlert({ type: 'success', title: 'Éxito', message: 'Estado del pedido actualizado correctamente.' });
        },
        onError: () => {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo actualizar el estado del pedido.' });
        },
    });

    const handleUpdateStatus = (orderId: string, status: string) => {
        updateStatusMutation.mutate({ orderId, status });
    };

    const filteredOrders = statusFilter === 'all'
        ? orders
        : orders.filter(o => o.status === statusFilter);

    return {
        // Data
        orders: filteredOrders,
        allOrders: orders,
        isLoading,
        refetch,
        isRefetching,

        // Filter
        statusFilter,
        setStatusFilter,

        // Actions
        handleUpdateStatus,
        isUpdatingStatus: updateStatusMutation.isPending,
    };
}

export type { Order };
