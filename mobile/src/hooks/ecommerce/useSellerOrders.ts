/**
 * useSellerOrders — Data fetching and mutations for seller order management
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { showAlert } from '@/src/components/AppAlert';
import { getSellerOrders, updateOrderStatus, Order } from '@/src/services/ecommerce';

export const ORDER_STATUS_MAP: Record<string, { label: string; color: string; bg: string; icon: string }> = {
    pending: { label: 'Pendiente', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: 'Clock' },
    shipped: { label: 'Enviado', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', icon: 'Truck' },
    delivered: { label: 'Entregado', color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: 'CheckCircle' },
    cancelled: { label: 'Cancelado', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', icon: 'XCircle' },
};

export function useSellerOrders() {
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState('all');

    const { data: orders = [], isLoading } = useQuery({
        queryKey: ['seller-orders'],
        queryFn: getSellerOrders,
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => updateOrderStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
            showAlert({ type: 'success', title: 'Éxito', message: 'Estado del pedido actualizado' });
        },
        onError: () => showAlert({ type: 'error', title: 'Error', message: 'No se pudo actualizar el estado' }),
    });

    const filteredOrders = orders.filter(o => filter === 'all' ? true : o.status === filter);

    const updateStatus = (id: string, status: string) => {
        statusMutation.mutate({ id, status });
    };

    return {
        orders,
        filteredOrders,
        isLoading,
        filter,
        setFilter,
        updateStatus,
    };
}
