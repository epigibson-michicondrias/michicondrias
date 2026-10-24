/**
 * useAdminOrders — todos los pedidos de la tienda para el admin (`GET /orders/admin/all`), con filtro por estado,
 * búsqueda por folio o dirección y cambio de estado con confirmación (`PATCH /orders/admin/{id}/status`).
 * No existe en la app: la consola web lo agrega con los endpoints que ya expone el servicio de ecommerce.
 */
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminUpdateOrderStatus, getAdminOrders, type Order } from '@/services/ecommerce';
import { showAlert } from '@/components/AppAlert';
import { errorMessage } from '@/features/servicios-pro/requestStatus';
import { getOrderStatus, type OrderStatus } from '@/features/tienda/orderStatus';

export type { Order };
export type AdminOrderFilter = 'all' | 'pending' | 'to_ship' | 'shipped' | 'delivered' | 'cancelled';

export const ADMIN_ORDER_FILTERS: { key: AdminOrderFilter; label: string; statuses?: OrderStatus[] }[] = [
    { key: 'all', label: 'Todos' },
    { key: 'pending', label: 'Esperando pago', statuses: ['pending'] },
    { key: 'to_ship', label: 'Por enviar', statuses: ['paid', 'confirmed'] },
    { key: 'shipped', label: 'En camino', statuses: ['shipped'] },
    { key: 'delivered', label: 'Entregados', statuses: ['delivered'] },
    { key: 'cancelled', label: 'Cancelados', statuses: ['cancelled'] },
];

/** Siguiente paso del pedido. El pago lo marca el cobro, no el admin: un pedido pendiente no se puede avanzar. */
const NEXT: Partial<Record<OrderStatus, { status: OrderStatus; label: string }>> = {
    paid: { status: 'shipped', label: 'Marcar enviado' },
    confirmed: { status: 'shipped', label: 'Marcar enviado' },
    shipped: { status: 'delivered', label: 'Marcar entregado' },
};
const CANCELLABLE: OrderStatus[] = ['pending', 'paid', 'confirmed'];

const matches = (o: Order, f: AdminOrderFilter) => {
    const statuses = ADMIN_ORDER_FILTERS.find((x) => x.key === f)?.statuses;
    return !statuses || statuses.includes(o.status as OrderStatus);
};

export const orderFolio = (o: Order) => `#${o.id.slice(0, 8).toUpperCase()}`;

export function useAdminOrders() {
    const queryClient = useQueryClient();
    const [searchText, setSearchText] = useState('');
    const [filter, setFilter] = useState<AdminOrderFilter>('all');
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const { data: orders = [], isLoading, isFetching } = useQuery({ queryKey: ['admin-orders'], queryFn: () => getAdminOrders() });

    const sorted = useMemo(() => [...orders].sort((a, b) => b.created_at.localeCompare(a.created_at)), [orders]);

    const filtered = useMemo(() => {
        const q = searchText.trim().toLowerCase().replace(/^#/, '');
        return sorted.filter(
            (o) => matches(o, filter) && (!q || `${o.id} ${o.shipping_address ?? ''} ${o.buyer_name ?? ''}`.toLowerCase().includes(q)),
        );
    }, [sorted, searchText, filter]);

    const mutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => adminUpdateOrderStatus(id, status),
        onMutate: ({ id }) => setUpdatingId(id),
        onSettled: () => setUpdatingId(null),
        onSuccess: (_, { status }) => {
            queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
            queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
            queryClient.invalidateQueries({ queryKey: ['my-orders'] });
            queryClient.invalidateQueries({ queryKey: ['order-detail'] });
            showAlert({ type: 'success', title: 'Pedido actualizado', message: `Ahora está "${getOrderStatus(status).label}".` });
        },
        onError: (e) => {
            showAlert({ type: 'error', title: 'No se pudo actualizar', message: errorMessage(e, 'Intenta de nuevo en un momento.') });
        },
    });

    const nextStep = (o: Order) => NEXT[o.status as OrderStatus] ?? null;
    const canCancel = (o: Order) => CANCELLABLE.includes(o.status as OrderStatus);

    const advance = (o: Order) => {
        const next = nextStep(o);
        if (!next) return;
        showAlert({
            type: 'info',
            title: next.label,
            message: `El pedido ${orderFolio(o)} pasará a "${getOrderStatus(next.status).label}" y el comprador lo verá así.`,
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Confirmar',
            onButtonPress: () => mutation.mutate({ id: o.id, status: next.status }),
        });
    };

    const cancel = (o: Order) => {
        showAlert({
            type: 'error',
            title: 'Cancelar pedido',
            message: `¿Seguro que quieres cancelar el pedido ${orderFolio(o)}? Las existencias vuelven al inventario y no se puede deshacer.`,
            showCancel: true,
            cancelText: 'Volver',
            buttonText: 'Cancelar pedido',
            onButtonPress: () => mutation.mutate({ id: o.id, status: 'cancelled' }),
        });
    };

    const filtering = !!searchText.trim() || filter !== 'all';

    return {
        orders: filtered,
        total: orders.length,
        count: (f: AdminOrderFilter) => orders.filter((o) => matches(o, f)).length,
        isLoading,
        isFetching,
        searchText,
        setSearchText,
        filter,
        setFilter,
        filtering,
        clearFilters: () => {
            setSearchText('');
            setFilter('all');
        },
        nextStep,
        canCancel,
        advance,
        cancel,
        updatingId,
    };
}
