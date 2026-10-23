/**
 * useSellerAnalytics — Métricas del vendedor (panel y analíticas): ingresos, pedidos por estado, existencias,
 * ventas por semana y productos más vendidos. Todo sale de sus productos y sus pedidos.
 */
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/src/contexts/AuthContext';
import { getMyProducts, getSellerOrders } from '@/src/services/ecommerce';
import { REVENUE_STATUSES, sellerSubtotal } from './useSellerOrders';
import { CATALOG_FILTERS } from './useSellerProducts';

const WEEKS = 8;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

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
    // Mismos criterios que los filtros del catálogo, para que las cifras del panel cuadren al tocar
    const countBy = (key: (typeof CATALOG_FILTERS)[number]['key']) => products.filter(CATALOG_FILTERS.find((f) => f.key === key)!.match).length;
    const activeProducts = countBy('publicados');
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
    const outOfStockProducts = countBy('agotados');
    const reviewCount = products.reduce((acc, p) => acc + (p.review_count || 0), 0);
    const averageRating = reviewCount > 0
        ? products.reduce((acc, p) => acc + (p.average_rating || 0) * (p.review_count || 0), 0) / reviewCount
        : null;

    const isMine = (i: { product?: { seller_id: string | null } }) => !i.product || !user || i.product.seller_id === user.id;

    // Ventas en 8 tramos de 7 días que terminan hoy (el último son los últimos 7 días). Tramos móviles en vez de
    // semanas de calendario: un lunes la "semana en curso" iría en cero y la comparación engañaría.
    const weeklySales = (() => {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        start.setDate(start.getDate() + 1 - 7 * WEEKS);
        const weeks = Array.from({ length: WEEKS }, (_, i) => {
            const d = new Date(start);
            d.setDate(d.getDate() + 7 * i);
            return { from: d.getTime(), label: d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }).replace('.', ''), value: 0 };
        });
        for (const o of soldOrders) {
            const t = new Date(o.created_at).getTime();
            const index = Math.floor((t - start.getTime()) / WEEK_MS);
            if (index >= 0 && index < WEEKS) weeks[index].value += sellerSubtotal(o, user?.id);
        }
        return weeks.map(({ label, value }) => ({ label, value }));
    })();

    // Más vendidos por piezas (con lo que generaron)
    const topProducts = (() => {
        const byProduct = new Map<string, { name: string; image_url: string | null; units: number; revenue: number }>();
        for (const o of soldOrders) {
            for (const i of (o.items || []).filter(isMine)) {
                const row = byProduct.get(i.product_id) ?? { name: i.product?.name || 'Producto', image_url: i.product?.image_url ?? null, units: 0, revenue: 0 };
                row.units += i.quantity;
                row.revenue += i.price_at_purchase * i.quantity;
                byProduct.set(i.product_id, row);
            }
        }
        return [...byProduct.entries()].map(([id, r]) => ({ id, ...r })).sort((a, b) => b.units - a.units).slice(0, 5);
    })();

    const pendingApproval = countBy('revision');
    const hiddenProducts = countBy('ocultos');

    return {
        weeklySales,
        topProducts,
        pendingApproval,
        hiddenProducts,
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
