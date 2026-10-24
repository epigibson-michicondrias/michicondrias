"use client";

/**
 * Mis compras — espejo de `mobile/app/tienda/compras.tsx`.
 */
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, RefreshCw, ShoppingBag } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import FilterChip from "@/components/FilterChip";
import EmptyState from "@/components/EmptyState";
import Badge from "@/components/Badge";
import { Skeleton } from "@/components/Skeleton";
import Button from "@/components/Button";
import { usePurchases } from "@/hooks/ecommerce/usePurchases";
import { getOrderStatus, PURCHASE_FILTERS, type PurchaseFilter } from "@/features/tienda/orderStatus";
import type { Order } from "@/types/ecommerce";
import s from "../tienda.module.css";

function matchesFilter(order: Order, filter: PurchaseFilter): boolean {
  const def = PURCHASE_FILTERS.find((f) => f.key === filter);
  if (!def?.statuses) return true;
  return def.statuses.includes(order.status as never);
}

export default function ComprasPage() {
  const { orders, isLoading, loadMore, isLoadingMore, isRefetching, refetch, hasMore } = usePurchases();
  const [filter, setFilter] = useState<PurchaseFilter>("all");
  const router = useRouter();

  const filtered = orders.filter((o) => matchesFilter(o, filter));
  const counts = {
    all: orders.length,
    active: orders.filter((o) => matchesFilter(o, "active")).length,
    delivered: orders.filter((o) => matchesFilter(o, "delivered")).length,
    cancelled: orders.filter((o) => matchesFilter(o, "cancelled")).length,
  };

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Mis compras"
        subtitle="Seguimiento de tus pedidos"
        actions={[{ icon: RefreshCw, label: "Actualizar", onPress: () => refetch(), loading: isRefetching }]}
      />

      <div className={s.chips}>
        {PURCHASE_FILTERS.map((f) => (
          <FilterChip
            key={f.key}
            label={`${f.label} (${counts[f.key]})`}
            active={filter === f.key}
            onPress={() => setFilter(f.key)}
          />
        ))}
      </div>

      {isLoading ? (
        <>
          {[0, 1, 2].map((i) => <Skeleton key={i} height={88} borderRadius={12} />)}
        </>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag size={28} />}
          title={orders.length === 0 ? "Aún no has realizado compras" : "Nada por aquí"}
          subtitle={orders.length === 0 ? "Cuando compres algo lo verás aquí." : "Prueba con otro filtro."}
          actionLabel={orders.length === 0 ? "Ir a la tienda" : "Ver todas"}
          onAction={() => (orders.length === 0 ? router.push("/tienda") : setFilter("all"))}
        />
      ) : (
        <>
          <div className={s.orderList}>
            {filtered.map((order) => {
              const st = getOrderStatus(order.status);
              const first = order.items?.[0]?.product;
              const extra = Math.max(0, (order.items?.length ?? 1) - 1);
              return (
                <Link key={order.id} href={`/tienda/pedido/${order.id}`} className={s.orderRow}>
                  <div className={s.orderMedia}>
                    {first?.image_url ? (
                      <Image src={first.image_url} alt="" width={56} height={56} className={s.cartImg} />
                    ) : (
                      <div className={s.cartImgFallback}><Package size={22} /></div>
                    )}
                  </div>
                  <div className={s.orderBody}>
                    <p className={s.cardName}>
                      {first?.name || "Pedido"}{extra > 0 ? ` y ${extra} más` : ""}
                    </p>
                    <p className={s.cardMeta}>
                      ${order.total_amount?.toFixed?.(2) ?? order.total_amount} · {order.items?.length ?? 0} piezas
                    </p>
                    <p className={s.cardMeta}>
                      {order.created_at?.slice(0, 10)} · #{String(order.id).slice(0, 8)}
                    </p>
                    {order.status === "pending" && (
                      <p className={s.orderPending}>Toca para pagar o cancelar</p>
                    )}
                  </div>
                  <Badge label={st.label} color={`var(--color-${st.tone})`} size="sm" />
                </Link>
              );
            })}
          </div>
          {hasMore && (
            <Button
              label={isLoadingMore ? "Cargando…" : "Ver más"}
              variant="secondary"
              onPress={loadMore}
              loading={isLoadingMore}
            />
          )}
        </>
      )}
    </ScreenContainer>
  );
}
