"use client";

/**
 * Pedidos del vendedor (`/tienda/vendedor/ordenes`, `?filtro=` abre un filtro).
 * Espejo de `mobile/app/tienda/vendedor/ordenes.tsx`.
 */
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Package, SearchX } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import EmptyState from "@/components/EmptyState";
import FilterChip from "@/components/FilterChip";
import RoleGuard from "@/components/RoleGuard";
import { SkeletonList } from "@/components/Skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { SellerOrderCard } from "@/features/tienda/SellerKit";
import { SELLER_ORDER_FILTERS, useSellerOrders } from "@/hooks/ecommerce/useSellerOrders";
import s from "@/features/tienda/vendedor.module.css";

export default function VendedorOrdenesPage() {
  return (
    <RoleGuard roles={["vendedor"]}>
      <Suspense fallback={<SkeletonList count={4} />}>
        <Ordenes />
      </Suspense>
    </RoleGuard>
  );
}

function Ordenes() {
  const { user } = useAuth();
  const { orders, filteredOrders, countFor, isLoading, isUpdating, updatingId, filter, setFilter, updateStatus } =
    useSellerOrders(useSearchParams().get("filtro"));

  return (
    <ScreenContainer>
      <ScreenHeader title="Pedidos" subtitle={`${orders.length} ${orders.length === 1 ? "pedido" : "pedidos"}`} />

      {isLoading ? (
        <SkeletonList count={4} />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<Package size={28} />}
          title="Aún no tienes pedidos"
          subtitle="Cuando alguien compre uno de tus productos aparecerá aquí."
        />
      ) : (
        <>
          <div className={s.filters}>
            <div className={s.chips}>
              {SELLER_ORDER_FILTERS.map((f) => {
                const count = countFor(f.key);
                if (f.key !== "all" && count === 0 && filter !== f.key) return null;
                return (
                  <FilterChip
                    key={f.key}
                    label={f.label}
                    count={f.key === "all" ? undefined : count}
                    active={filter === f.key}
                    onPress={() => setFilter(f.key)}
                  />
                );
              })}
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <EmptyState
              icon={<SearchX size={28} />}
              title="Nada en este filtro"
              subtitle="No tienes pedidos con este estado."
              actionLabel="Ver todos"
              onAction={() => setFilter("all")}
            />
          ) : (
            <div className={s.listWide}>
              {filteredOrders.map((o) => (
                <SellerOrderCard
                  key={o.id}
                  order={o}
                  sellerId={user?.id}
                  onAdvance={(status) => updateStatus(o.id, status)}
                  updating={updatingId === o.id}
                  disabled={isUpdating}
                />
              ))}
            </div>
          )}
        </>
      )}
    </ScreenContainer>
  );
}
