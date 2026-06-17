/**
 * usePurchases — Data fetching for buyer's order history
 */
import { useQuery } from '@tanstack/react-query';
import { getMyOrders, Order } from '@/src/services/ecommerce';

export const STATUS_MAP: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pendiente', color: '#f59e0b' },
    paid: { label: 'Pagado', color: '#3b82f6' },
    shipped: { label: 'En Camino', color: '#3b82f6' },
    delivered: { label: 'Entregado', color: '#10b981' },
    cancelled: { label: 'Cancelado', color: '#ef4444' },
};

export function usePurchases() {
    const { data: orders = [], isLoading } = useQuery({
        queryKey: ['my-orders'],
        queryFn: getMyOrders,
    });

    return {
        orders,
        isLoading,
    };
}
