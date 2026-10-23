/**
 * usePurchases — historial paginado de pedidos del comprador (`(app)/tienda/compras`).
 * Espejo de `mobile/src/hooks/ecommerce/usePurchases.ts`.
 */
import { useInfiniteQuery } from '@tanstack/react-query';
import { getMyOrders, MY_ORDERS_PAGE_SIZE } from '@/services/ecommerce';

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
        orders: [...new Map((data?.pages.flat() ?? []).map((o) => [o.id, o])).values()],
        isLoading,
        refetch,
        isRefetching,
        loadMore,
        isLoadingMore: isFetchingNextPage,
    };
}
