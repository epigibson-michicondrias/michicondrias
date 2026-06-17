/**
 * useOrderDetail — Hook to fetch order details by ID
 */
import { useQuery } from '@tanstack/react-query';
import { getOrder } from '@/src/services/ecommerce';

export function useOrderDetail(orderId: string) {
    const { data: order, isLoading, error, refetch } = useQuery({
        queryKey: ['order-detail', orderId],
        queryFn: () => getOrder(orderId),
        enabled: !!orderId,
    });

    return {
        order,
        isLoading,
        error,
        refetch,
    };
}
