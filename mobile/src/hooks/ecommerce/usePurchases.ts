/**
 * usePurchases — Data fetching for buyer's order history
 */
import { useInfiniteQuery } from '@tanstack/react-query';
import { getMyOrders, MY_ORDERS_PAGE_SIZE } from '@/src/services/ecommerce';

export const STATUS_MAP: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pendiente', color: '#f59e0b' },
    paid: { label: 'Pagado', color: '#3b82f6' },
    confirmed: { label: 'Confirmado', color: '#6366f1' },
    shipped: { label: 'En camino', color: '#3b82f6' },
    delivered: { label: 'Entregado', color: '#10b981' },
    cancelled: { label: 'Cancelado', color: '#ef4444' },
};

/** Historial paginado: carga 20 pedidos y trae más al llegar al final de la lista (F19). */
export function usePurchases() {
    const { data, isLoading, refetch, isRefetching, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
        queryKey: ['my-orders'],
        queryFn: ({ pageParam }) => getMyOrders(pageParam, MY_ORDERS_PAGE_SIZE),
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) =>
            lastPage.length < MY_ORDERS_PAGE_SIZE ? undefined : allPages.reduce((n, page) => n + page.length, 0),
    });

    const loadMore = () => {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage();
    };

    return {
        // Sin duplicados si entra un pedido nuevo entre páginas (la paginación es por offset)
        orders: [...new Map((data?.pages.flat() ?? []).map((o) => [o.id, o])).values()],
        isLoading,
        refetch,
        isRefetching,
        loadMore,
        isLoadingMore: isFetchingNextPage,
    };
}
