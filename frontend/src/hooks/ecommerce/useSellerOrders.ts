/**
 * useSellerOrders — pedidos del vendedor: filtros por estado y avance (enviado → entregado) con confirmación.
 * Espejo de `mobile/src/hooks/ecommerce/useSellerOrders.ts`. El filtro inicial llega por `?filtro=`.
 */
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { showAlert } from "@/components/AppAlert";
import { getSellerOrders, updateOrderStatus, type Order } from "@/services/ecommerce";
import { errorMessage } from "@/features/servicios-pro/requestStatus";

/** Siguiente paso válido para el vendedor (el backend solo acepta estas transiciones). */
export const SELLER_NEXT_STATUS: Record<string, { status: string; label: string } | undefined> = {
  paid: { status: "shipped", label: "Marcar enviado" },
  confirmed: { status: "shipped", label: "Marcar enviado" },
  shipped: { status: "delivered", label: "Marcar entregado" },
};

/** Estados que ya representan una venta cobrada (cuentan para ingresos). */
export const REVENUE_STATUSES = ["paid", "confirmed", "shipped", "delivered"];

/** ¿El renglón del pedido es de este vendedor? (un pedido puede mezclar vendedores). */
export const isSellerItem = (i: { product?: { seller_id: string | null } }, sellerId?: string | null) =>
  !i.product || !sellerId || i.product.seller_id === sellerId;

/** Lo que vendió este vendedor dentro de un pedido. */
export function sellerSubtotal(order: Order, sellerId?: string | null): number {
  return (order.items || [])
    .filter((i) => isSellerItem(i, sellerId))
    .reduce((acc, i) => acc + i.price_at_purchase * i.quantity, 0);
}

export const SELLER_ORDER_FILTERS: { key: string; label: string; match: (status: string) => boolean }[] = [
  { key: "all", label: "Todos", match: () => true },
  { key: "todo", label: "Por enviar", match: (s) => s === "paid" || s === "confirmed" },
  { key: "shipped", label: "Enviados", match: (s) => s === "shipped" },
  { key: "delivered", label: "Entregados", match: (s) => s === "delivered" },
  { key: "pending", label: "Esperando pago", match: (s) => s === "pending" },
  { key: "cancelled", label: "Cancelados", match: (s) => s === "cancelled" },
];

const findFilter = (key: string) => SELLER_ORDER_FILTERS.find((f) => f.key === key) ?? SELLER_ORDER_FILTERS[0];

export function useSellerOrders(initialFilter?: string | null) {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState(
    initialFilter && SELLER_ORDER_FILTERS.some((f) => f.key === initialFilter) ? initialFilter : "all",
  );

  const { data: orders = [], isLoading } = useQuery({ queryKey: ["seller-orders"], queryFn: getSellerOrders });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-orders"] });
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
      queryClient.invalidateQueries({ queryKey: ["order-detail"] });
      showAlert({ type: "success", title: "Pedido actualizado", message: "El comprador verá el nuevo estado de su pedido." });
    },
    onError: (e) =>
      showAlert({ type: "error", title: "No se pudo actualizar el estado", message: errorMessage(e, "Inténtalo de nuevo.") }),
  });

  const filteredOrders = orders.filter((o) => findFilter(filter).match(o.status));
  const countFor = (key: string) => orders.filter((o) => findFilter(key).match(o.status)).length;

  /** Pide confirmación: el comprador ve el cambio y no se puede regresar al estado anterior. */
  const updateStatus = (id: string, status: string) => {
    const ref = `#${id.slice(0, 8).toUpperCase()}`;
    const shipped = status === "shipped";
    showAlert({
      type: "info",
      title: shipped ? `¿Ya enviaste el pedido ${ref}?` : `¿Se entregó el pedido ${ref}?`,
      message: shipped
        ? "El comprador verá que su pedido va en camino."
        : "Márcalo cuando el comprador ya lo tenga en sus manos.",
      showCancel: true,
      cancelText: "Todavía no",
      buttonText: shipped ? "Sí, ya lo envié" : "Sí, se entregó",
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
    filter,
    setFilter,
    updateStatus,
  };
}
