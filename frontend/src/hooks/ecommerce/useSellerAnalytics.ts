/**
 * useSellerAnalytics — métricas del vendedor (panel y analíticas): ingresos, pedidos por estado, existencias,
 * ventas por semana y más vendidos. Espejo de `mobile/src/hooks/ecommerce/useSellerAnalytics.ts`.
 */
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getMyProducts, getSellerOrders } from "@/services/ecommerce";
import { isSellerItem, REVENUE_STATUSES, sellerSubtotal } from "./useSellerOrders";
import { CATALOG_FILTERS, LOW_STOCK, type CatalogFilter } from "./useSellerProducts";

const WEEKS = 8;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function useSellerAnalytics() {
  const { user } = useAuth();
  const sellerId = user?.id;
  const productsQuery = useQuery({ queryKey: ["my-products"], queryFn: getMyProducts });
  const ordersQuery = useQuery({ queryKey: ["seller-orders"], queryFn: getSellerOrders });

  const metrics = useMemo(() => {
    const products = productsQuery.data ?? [];
    const orders = ordersQuery.data ?? [];
    // Ingresos reales: solo pedidos cobrados y solo la parte de este vendedor
    const soldOrders = orders.filter((o) => REVENUE_STATUSES.includes(o.status));
    const totalRevenue = soldOrders.reduce((acc, o) => acc + sellerSubtotal(o, sellerId), 0);
    // Mismos criterios que los filtros del catálogo, para que las cifras del panel cuadren al tocar
    const countBy = (key: CatalogFilter) => products.filter(CATALOG_FILTERS.find((f) => f.key === key)!.match).length;
    const byStatus = (...st: string[]) => orders.filter((o) => st.includes(o.status)).length;
    const reviewCount = products.reduce((acc, p) => acc + (p.review_count || 0), 0);

    // 8 tramos móviles de 7 días que terminan hoy (no semanas de calendario: un lunes iría en cero)
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() + 1 - 7 * WEEKS);
    const weeklySales = Array.from({ length: WEEKS }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + 7 * i);
      return { label: d.toLocaleDateString("es-MX", { day: "numeric", month: "short" }).replace(".", ""), value: 0 };
    });
    for (const o of soldOrders) {
      const index = Math.floor((new Date(o.created_at).getTime() - start.getTime()) / WEEK_MS);
      if (index >= 0 && index < WEEKS) weeklySales[index].value += sellerSubtotal(o, sellerId);
    }

    const byProduct = new Map<string, { name: string; image_url: string | null; units: number; revenue: number }>();
    for (const o of soldOrders) {
      for (const i of (o.items || []).filter((it) => isSellerItem(it, sellerId))) {
        const row = byProduct.get(i.product_id) ?? {
          name: i.product?.name || "Producto",
          image_url: i.product?.image_url ?? null,
          units: 0,
          revenue: 0,
        };
        row.units += i.quantity;
        row.revenue += i.price_at_purchase * i.quantity;
        byProduct.set(i.product_id, row);
      }
    }
    const topProducts = [...byProduct.entries()]
      .map(([id, r]) => ({ id, ...r }))
      .sort((a, b) => b.units - a.units)
      .slice(0, 5);

    return {
      products,
      orders,
      soldOrders,
      totalRevenue,
      weeklySales,
      topProducts,
      activeProducts: countBy("publicados"),
      pendingApproval: countBy("revision"),
      outOfStockProducts: countBy("agotados"),
      lowStockProducts: products.filter((p) => p.is_active && p.stock > 0 && p.stock <= LOW_STOCK).length,
      awaitingPayment: byStatus("pending"),
      toShipOrders: byStatus("paid", "confirmed"),
      shippedOrders: byStatus("shipped"),
      deliveredOrders: byStatus("delivered"),
      cancelledOrders: byStatus("cancelled"),
      avgOrderValue: soldOrders.length > 0 ? totalRevenue / soldOrders.length : 0,
      unitsSold: soldOrders.reduce(
        (acc, o) =>
          acc + (o.items || []).filter((i) => isSellerItem(i, sellerId)).reduce((a, i) => a + i.quantity, 0),
        0,
      ),
      averageRating:
        reviewCount > 0
          ? products.reduce((acc, p) => acc + (p.average_rating || 0) * (p.review_count || 0), 0) / reviewCount
          : null,
    };
  }, [productsQuery.data, ordersQuery.data, sellerId]);

  return { ...metrics, isLoading: productsQuery.isLoading || ordersQuery.isLoading };
}
