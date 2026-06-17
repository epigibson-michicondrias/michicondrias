/**
 * useSellerAnalytics — Data fetching and computed analytics for seller dashboard
 */
import { useQuery } from '@tanstack/react-query';
import { getMyProducts, getSellerOrders } from '@/src/services/ecommerce';

export function useSellerAnalytics() {
    const { data: products = [], isLoading: loadingProducts } = useQuery({
        queryKey: ['my-products'],
        queryFn: getMyProducts,
    });

    const { data: orders = [], isLoading: loadingOrders } = useQuery({
        queryKey: ['seller-orders'],
        queryFn: getSellerOrders,
    });

    const isLoading = loadingProducts || loadingOrders;

    const totalRevenue = orders.reduce((acc, o) => acc + o.total_amount, 0);
    const activeProducts = products.filter((p) => p.is_active).length;
    const pendingOrders = orders.filter((o) => o.status === 'pending').length;
    const deliveredOrders = orders.filter((o) => o.status === 'delivered').length;
    const shippedOrders = orders.filter((o) => o.status === 'shipped').length;
    const cancelledOrders = orders.filter((o) => o.status === 'cancelled').length;
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    return {
        products,
        orders,
        isLoading,
        totalRevenue,
        activeProducts,
        pendingOrders,
        deliveredOrders,
        shippedOrders,
        cancelledOrders,
        avgOrderValue,
    };
}
