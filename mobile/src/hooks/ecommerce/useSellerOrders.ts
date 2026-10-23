/**
 * useSellerOrders — Pedidos del vendedor: filtros por estado y avance (enviado → entregado) con confirmación.
 */
import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { showAlert } from '@/src/components/AppAlert';
import { getSellerOrders, updateOrderStatus, Order } from '@/src/services/ecommerce';

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

/** Filtros de la lista de pedidos; `filtro` en la URL abre uno directo (desde los avisos del panel). */
export const SELLER_ORDER_FILTERS: { key: string; label: string; match: (status: string) => boolean }[] = [
    { key: 'all', label: 'Todos', match: () => true },
    { key: 'todo', label: 'Por enviar', match: (s) => s === 'paid' || s === 'confirmed' },
    { key: 'shipped', label: 'Enviados', match: (s) => s === 'shipped' },
    { key: 'delivered', label: 'Entregados', match: (s) => s === 'delivered' },
    { key: 'pending', label: 'Esperando pago', match: (s) => s === 'pending' },
    { key: 'cancelled', label: 'Cancelados', match: (s) => s === 'cancelled' },
];

export function useSellerOrders() {
    const queryClient = useQueryClient();
    // `filtro` en la URL abre un filtro directo (desde los avisos del panel)
    const { filtro } = useLocalSearchParams<{ filtro?: string }>();
    const [filter, setFilter] = useState(SELLER_ORDER_FILTERS.some((f) => f.key === filtro) ? filtro! : 'all');

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

    const activeFilter = SELLER_ORDER_FILTERS.find((f) => f.key === filter) ?? SELLER_ORDER_FILTERS[0];
    const filteredOrders = orders.filter((o) => activeFilter.match(o.status));
    const countFor = (key: string) => orders.filter((o) => (SELLER_ORDER_FILTERS.find((f) => f.key === key) ?? SELLER_ORDER_FILTERS[0]).match(o.status)).length;

    /** Pide confirmación: el comprador ve el cambio y no se puede regresar al estado anterior. */
    const updateStatus = (id: string, status: string) => {
        const ref = `#${id.slice(0, 8).toUpperCase()}`;
        const shipped = status === 'shipped';
        showAlert({
            type: 'info',
            title: shipped ? `¿Ya enviaste el pedido ${ref}?` : `¿Se entregó el pedido ${ref}?`,
            message: shipped
                ? 'El comprador verá que su pedido va en camino.'
                : 'Márcalo cuando el comprador ya lo tenga en sus manos.',
            showCancel: true,
            cancelText: 'Todavía no',
            buttonText: shipped ? 'Sí, ya lo envié' : 'Sí, se entregó',
            onButtonPress: () => statusMutation.mutate({ id, status }),
        });
    };

    return {
        orders,
        filteredOrders,
        countFor,
        isLoading,
        isUpdating: statusMutation.isPending,
        updatingId: statusMutation.isPending ? statusMutation.variables?.id : undefined,
        refetch,
        filter,
        setFilter,
        updateStatus,
    };
}
