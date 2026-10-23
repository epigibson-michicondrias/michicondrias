"use client";

/**
 * Analíticas del vendedor (`/tienda/vendedor/analytics`).
 * Espejo de `mobile/app/tienda/vendedor/analytics.tsx`.
 */
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, BarChart3, Package, PackageCheck, TrendingDown, TrendingUp, Truck } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import ListRow from "@/components/ListRow";
import RoleGuard from "@/components/RoleGuard";
import { Skeleton } from "@/components/Skeleton";
import { getOrderStatus } from "@/features/tienda/orderStatus";
import { MediaRow, MiniBarChart, StatTile, SummaryCard, TONE_COLORS } from "@/features/tienda/SellerKit";
import { useSellerAnalytics } from "@/hooks/ecommerce/useSellerAnalytics";
import { formatCurrency } from "@/utils/formatters";
import s from "@/features/tienda/vendedor.module.css";

export default function VendedorAnalyticsPage() {
  return (
    <RoleGuard roles={["vendedor"]}>
      <Analytics />
    </RoleGuard>
  );
}

function Analytics() {
  const router = useRouter();
  const a = useSellerAnalytics();

  const thisWeek = a.weeklySales[a.weeklySales.length - 1]?.value ?? 0;
  const lastWeek = a.weeklySales[a.weeklySales.length - 2]?.value ?? 0;
  const trend = lastWeek > 0 ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : null;
  const trendColor = trend !== null && trend >= 0 ? "var(--color-success)" : "var(--color-error)";

  const breakdown = [
    { key: "pending", count: a.awaitingPayment },
    { key: "paid", count: a.toShipOrders },
    { key: "shipped", count: a.shippedOrders },
    { key: "delivered", count: a.deliveredOrders },
    { key: "cancelled", count: a.cancelledOrders },
  ].map((b) => {
    const st = getOrderStatus(b.key);
    return { ...b, label: st.sellerLabel, color: TONE_COLORS[st.tone] };
  });

  return (
    <ScreenContainer>
      <ScreenHeader title="Analíticas" subtitle="Tu tienda en números" />

      <div className={s.content}>
        {a.isLoading ? (
          <>
            <Skeleton height={150} borderRadius={24} />
            <Skeleton height={160} />
            <Skeleton height={180} />
          </>
        ) : a.orders.length === 0 ? (
          <EmptyState
            icon={<BarChart3 size={28} />}
            title="Aún no hay ventas que analizar"
            subtitle="En cuanto recibas pedidos verás aquí tus ingresos, la tendencia semanal y lo más vendido."
            actionLabel="Ir a mi catálogo"
            onAction={() => router.push("/tienda/vendedor/productos")}
          />
        ) : (
          <>
            <SummaryCard
              label="Ingresos cobrados"
              value={formatCurrency(a.totalRevenue)}
              icon={TrendingUp}
              caption="Solo pedidos pagados; sin los cancelados ni los que esperan pago"
              stats={[
                { label: "Ventas", value: a.soldOrders.length },
                { label: "Piezas", value: a.unitsSold },
                { label: "Ticket prom.", value: formatCurrency(a.avgOrderValue) },
              ]}
            />

            <Card>
              <div className={s.cardHead}>
                <div style={{ flex: 1 }}>
                  <div className={s.cardTitle}>Ventas por semana</div>
                  <div className={s.cardCaption}>
                    Últimos 7 días: {formatCurrency(thisWeek)}
                    {trend !== null ? " · vs. 7 días anteriores" : ""}
                  </div>
                </div>
                {trend !== null ? (
                  <span className={s.trend} style={{ "--c": trendColor } as CSSProperties}>
                    {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {Math.abs(trend)}%
                  </span>
                ) : null}
              </div>
              <MiniBarChart data={a.weeklySales} formatValue={formatCurrency} />
            </Card>

            <div className={s.tiles}>
              <StatTile icon={Truck} value={a.toShipOrders} label="Por enviar" color="var(--color-warning)" onPress={() => router.push("/tienda/vendedor/ordenes?filtro=todo")} />
              <StatTile icon={PackageCheck} value={a.deliveredOrders} label="Entregados" color="var(--color-success)" />
              <StatTile icon={Package} value={a.activeProducts} label="Publicados" color="var(--color-primary)" onPress={() => router.push("/tienda/vendedor/productos")} />
            </div>

            <Card>
              <div className={s.cardTitle} style={{ marginBottom: "var(--space-md)" }}>Pedidos por estado</div>
              <div className={s.breakdown}>
                {breakdown.map((b) => {
                  const pct = a.orders.length > 0 ? (b.count / a.orders.length) * 100 : 0;
                  return (
                    <div key={b.key} className={s.breakdownRow} aria-label={`${b.label}: ${b.count}`}>
                      <span>{b.label}</span>
                      <div className={s.track}>
                        <div className={s.fill} style={{ width: `${pct}%`, "--c": b.color } as CSSProperties} />
                      </div>
                      <span className={s.count}>{b.count}</span>
                    </div>
                  );
                })}
              </div>
            </Card>

            {a.topProducts.length > 0 ? (
              <div className={s.section}>
                <div className={s.cardTitle}>Lo más vendido</div>
                {a.topProducts.map((p, i) => (
                  <MediaRow
                    key={p.id}
                    imageUrl={p.image_url}
                    fallbackIcon={Package}
                    title={`${i + 1}. ${p.name}`}
                    lines={[{ text: `${p.units} ${p.units === 1 ? "pieza" : "piezas"} · ${formatCurrency(p.revenue)}` }]}
                    onPress={() => router.push(`/tienda/vendedor/productos/${p.id}`)}
                    accessibilityLabel={`${p.name}: ${p.units} piezas, ${formatCurrency(p.revenue)}`}
                  />
                ))}
              </div>
            ) : null}

            {a.lowStockProducts + a.outOfStockProducts > 0 ? (
              <ListRow
                icon={AlertTriangle}
                label="Revisa tus existencias"
                desc={[
                  a.outOfStockProducts > 0 ? `${a.outOfStockProducts} agotados` : "",
                  a.lowStockProducts > 0 ? `${a.lowStockProducts} con 5 piezas o menos` : "",
                ].filter(Boolean).join(" · ")}
                color="var(--color-warning)"
                onPress={() => router.push("/tienda/vendedor/productos?filtro=agotados")}
              />
            ) : null}
          </>
        )}
      </div>
    </ScreenContainer>
  );
}
