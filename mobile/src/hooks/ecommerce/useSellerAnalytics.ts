/**
 * useSellerAnalytics — Data fetching and computed analytics for seller dashboard
 */
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/src/contexts/AuthContext';
import { getMyProducts, getSellerOrders } from '@/src/services/ecommerce';
import { REVENUE_STATUSES, sellerSubtotal } from './useSellerOrders';

export function useSellerAnalytics() {
    const { user } = useAuth();
    const { data: products = [], isLoading: loadingProducts } = useQuery({
        queryKey: ['my-products'],
        queryFn: getMyProducts,
    });

    const { data: orders = [], isLoading: loadingOrders } = useQuery({
        queryKey: ['seller-orders'],
        queryFn: getSellerOrders,
    });

    const isLoading = loadingProducts || loadingOrders;

    // Ingresos reales: solo pedidos cobrados y solo la parte de este vendedor (no pendientes ni cancelados)
    const soldOrders = orders.filter((o) => REVENUE_STATUSES.includes(o.status));
    const totalRevenue = soldOrders.reduce((acc, o) => acc + sellerSubtotal(o, user?.id), 0);
    const activeProducts = products.filter((p) => p.is_active).length;
    const awaitingPayment = orders.filter((o) => o.status === 'pending').length;
    const toShipOrders = orders.filter((o) => o.status === 'paid' || o.status === 'confirmed').length;
    const deliveredOrders = orders.filter((o) => o.status === 'delivered').length;
    const shippedOrders = orders.filter((o) => o.status === 'shipped').length;
    const cancelledOrders = orders.filter((o) => o.status === 'cancelled').length;
    const avgOrderValue = soldOrders.length > 0 ? totalRevenue / soldOrders.length : 0;
    const unitsSold = soldOrders.reduce(
        (acc, o) => acc + (o.items || []).filter((i) => !i.product || !user || i.product.seller_id === user.id).reduce((a, i) => a + i.quantity, 0),
        0,
    );
    const lowStockProducts = products.filter((p) => p.is_active && p.stock > 0 && p.stock <= 5).length;
    const outOfStockProducts = products.filter((p) => p.is_active && p.stock <= 0).length;
    const reviewCount = products.reduce((acc, p) => acc + (p.review_count || 0), 0);
    const averageRating = reviewCount > 0
        ? products.reduce((acc, p) => acc + (p.average_rating || 0) * (p.review_count || 0), 0) / reviewCount
        : null;

    return {
        products,
        orders,
        soldOrders,
        isLoading,
        totalRevenue,
        activeProducts,
        awaitingPayment,
        toShipOrders,
        // compat: "pendientes" ahora significa pedidos esperando envío o pago
        pendingOrders: awaitingPayment + toShipOrders,
        deliveredOrders,
        shippedOrders,
        cancelledOrders,
        avgOrderValue,
        unitsSold,
        lowStockProducts,
        outOfStockProducts,
        reviewCount,
        averageRating,
    };
}
