"use client";

/**
 * Pedidos (`/admin/pedidos`): todos los pedidos de la tienda con filtros por estado, búsqueda por folio o dirección
 * y cambio de estado (enviar, entregar, cancelar) con confirmación. No existe en la app.
 */
import Link from "next/link";
import { ChevronRight, ShoppingBag, XCircle } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";
import FilterChip from "@/components/FilterChip";
import IconButton from "@/components/IconButton";
import SearchBar from "@/components/SearchBar";
import { SkeletonList } from "@/components/Skeleton";
import { TONE_COLORS } from "@/features/tienda/SellerKit";
import { getOrderStatus } from "@/features/tienda/orderStatus";
import { ADMIN_ORDER_FILTERS, orderFolio, useAdminOrders } from "@/hooks/admin/useAdminOrders";
import { formatCurrency } from "@/utils/formatters";
import s from "@/features/admin/admin.module.css";

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default function AdminPedidosPage() {
  const o = useAdminOrders();
  const toShip = o.count("to_ship");

  return (
    <ScreenContainer>
      <ScreenHeader title="Pedidos" subtitle={`${o.total} ${o.total === 1 ? "pedido" : "pedidos"}${toShip ? ` · ${toShip} por enviar` : ""}`} />

      <div className={s.toolbar}>
        <SearchBar value={o.searchText} onChangeText={o.setSearchText} placeholder="Buscar por folio, comprador o dirección..." />
        <div className={s.chips}>
          {ADMIN_ORDER_FILTERS.map((f) => (
            <FilterChip key={f.key} label={f.label} count={o.count(f.key)} active={o.filter === f.key} onPress={() => o.setFilter(f.key)} />
          ))}
        </div>
      </div>

      {o.isLoading ? (
        <SkeletonList count={6} />
      ) : o.orders.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag size={28} />}
          title={o.filtering ? "Sin resultados" : "Aún no hay pedidos"}
          subtitle={o.filtering ? "Ningún pedido coincide con la búsqueda o el filtro." : "Las compras de la tienda aparecerán aquí."}
          actionLabel={o.filtering ? "Quitar filtros" : undefined}
          onAction={o.filtering ? o.clearFilters : undefined}
        />
      ) : (
        <div className={s.tableWrap} style={{ opacity: o.isFetching && !o.updatingId ? 0.6 : 1 }}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Comprador y envío</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {o.orders.map((ord) => {
                const st = getOrderStatus(ord.status);
                const next = o.nextStep(ord);
                const busy = o.updatingId === ord.id;
                const items = ord.items?.reduce((n, it) => n + it.quantity, 0) ?? 0;
                return (
                  <tr key={ord.id}>
                    <td>
                      <div className={s.cellMain}>
                        <span className={s.cellTitle}>{orderFolio(ord)}</span>
                        {items ? <span className={s.cellSub}>{items} {items === 1 ? "artículo" : "artículos"}</span> : null}
                      </div>
                    </td>
                    <td data-label="Fecha" className={`${s.cellSub} ${s.nowrap}`}>
                      {fmtDate(ord.created_at)}
                    </td>
                    <td data-label="Total" className={`${s.cellTitle} ${s.nowrap}`}>
                      {formatCurrency(ord.total_amount)}
                    </td>
                    <td data-label="Estado">
                      <Badge label={st.label} color={TONE_COLORS[st.tone]} size="sm" />
                    </td>
                    <td data-label="Comprador">
                      <div className={s.cellMain}>
                        <Link href={`/admin/usuarios/${ord.user_id}`} className={s.cellLink}>
                          {ord.buyer_name || "Ver comprador"}
                        </Link>
                        <span className={s.cellSub}>{ord.shipping_address || "Sin dirección de envío"}</span>
                      </div>
                    </td>
                    <td>
                      <div className={s.cellActions}>
                        {next ? (
                          <Button label={next.label} iconRight={<ChevronRight size={16} />} size="sm" variant="secondary" fullWidth={false} onPress={() => o.advance(ord)} loading={busy} disabled={!!o.updatingId && !busy} />
                        ) : null}
                        {o.canCancel(ord) ? (
                          <IconButton icon={XCircle} accessibilityLabel={`Cancelar el pedido ${orderFolio(ord)}`} onPress={() => o.cancel(ord)} color="var(--color-error)" size="sm" disabled={!!o.updatingId} />
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </ScreenContainer>
  );
}
