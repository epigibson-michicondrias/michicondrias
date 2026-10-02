/**
 * useSellerOrders — Data fetching and mutations for seller order management
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { showAlert } from '@/src/components/AppAlert';
import { getSellerOrders, updateOrderStatus, Order } from '@/src/services/ecommerce';

export const ORDER_STATUS_MAP: Record<string, { label: string; color: string; bg: string; icon: string }> = {
    pending: { label: 'Esperando pago', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: 'Clock' },
    paid: { label: 'Pagado', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', icon: 'CreditCard' },
    confirmed: { label: 'Confirmado', color: '#6366f1', bg: 'rgba(99,102,241,0.12)', icon: 'CheckCircle' },
    shipped: { label: 'Enviado', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', icon: 'Truck' },
    delivered: { label: 'Entregado', color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: 'CheckCircle' },
    cancelled: { label: 'Cancelado', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', icon: 'XCircle' },
};

/** Siguiente paso válido para el vendedor (el backend solo acepta estas transiciones). */
export const SELLER_NEXT_STATUS: Record<string, { status: string; label: string } | undefined> = {
    paid: { status: 'shipped', label: 'Marcar enviado' },
    confirmed: { status: 'shipped', label: 'Marcar enviado' },
    shipped: { status: 'delivered', label: 'Marcar entregado' },
};

/** Estados que ya representan una venta cobrada (cuentan para ingresos). */
export const REVENUE_STATUSES = ['paid', 'confirmed', 'shipped', 'delivered'];

/** Lo que vendió este vendedor dentro de un pedido (puede incluir productos de otros vendedores). */
export function sellerSubtotal(order: Order, sellerId?: string | null): number {
    return (order.items || [])
        .filter(i => !i.product || !sellerId || i.product.seller_id === sellerId)
        .reduce((acc, i) => acc + i.price_at_purchase * i.quantity, 0);
}

export function useSellerOrders() {
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState('all');

    const { data: orders = [], isLoading, refetch } = useQuery({
        queryKey: ['seller-orders'],
        queryFn: getSellerOrders,
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => updateOrderStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
            queryClient.invalidateQueries({ queryKey: ['my-orders'] });
            queryClient.invalidateQueries({ queryKey: ['order-detail'] });
            showAlert({ type: 'success', title: 'Pedido actualizado', message: 'El comprador verá el nuevo estado de su pedido.' });
        },
        onError: (e: any) => showAlert({ type: 'error', title: 'No se pudo actualizar el estado', message: e?.message || 'Inténtalo de nuevo.' }),
    });

    const filteredOrders = orders.filter(o => filter === 'all' ? true : o.status === filter);

    const updateStatus = (id: string, status: string) => {
        statusMutation.mutate({ id, status });
    };

    return {
        orders,
        filteredOrders,
        isLoading,
        isUpdating: statusMutation.isPending,
        refetch,
        filter,
        setFilter,
        updateStatus,
    };
}
