"use client";

/**
 * Mi tienda — panel del vendedor (`/tienda/vendedor`).
 * Espejo de `mobile/app/tienda/vendedor/index.tsx`.
 */
import { useRouter } from "next/navigation";
import { AlertTriangle, Clock, Package, Plus, ShoppingBag, Star, Store, TrendingUp, Truck } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import EmptyState from "@/components/EmptyState";
import ListRow from "@/components/ListRow";
import RoleGuard from "@/components/RoleGuard";
import SectionHeader from "@/components/SectionHeader";
import { Skeleton } from "@/components/Skeleton";
import { MediaRow, StatTile, SummaryCard } from "@/features/tienda/SellerKit";
import { useSellerAnalytics } from "@/hooks/ecommerce/useSellerAnalytics";
import { formatCurrency } from "@/utils/formatters";
import s from "@/features/tienda/vendedor.module.css";

const NEW_PRODUCT = "/tienda/vendedor/productos/nuevo";

export default function VendedorPage() {
  return (
    <RoleGuard roles={["vendedor"]}>
      <VendedorDashboard />
    </RoleGuard>
  );
}

function VendedorDashboard() {
  const router = useRouter();
  const a = useSellerAnalytics();
  const goNew = () => router.push(NEW_PRODUCT);

  // Avisos que piden una acción, de lo más urgente a lo menos
  const alerts = [
    a.toShipOrders > 0 && {
      icon: Truck,
      color: "var(--color-warning)",
      label: `${a.toShipOrders} ${a.toShipOrders === 1 ? "pedido por enviar" : "pedidos por enviar"}`,
      desc: "Ya están pagados: márcalos como enviados al despacharlos",
      route: "/tienda/vendedor/ordenes?filtro=todo",
    },
    a.outOfStockProducts > 0 && {
      icon: AlertTriangle,
      color: "var(--color-error)",
      label: `${a.outOfStockProducts} ${a.outOfStockProducts === 1 ? "producto agotado" : "productos agotados"}`,
      desc: "No se pueden comprar hasta que repongas existencias",
      route: "/tienda/vendedor/productos?filtro=agotados",
    },
    a.pendingApproval > 0 && {
      icon: Clock,
      color: "var(--color-info)",
      label: `${a.pendingApproval} en revisión`,
      desc: "Un admin los aprueba antes de mostrarlos en la tienda",
      route: "/tienda/vendedor/productos?filtro=revision",
    },
  ].filter(Boolean) as { icon: typeof Truck; color: string; label: string; desc: string; route: string }[];

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Mi tienda"
        subtitle="Panel de vendedor"
        actions={[{ icon: Plus, label: "Publicar producto", onPress: goNew }]}
      />

      <div className={s.content}>
        {a.isLoading ? (
          <>
            <Skeleton height={150} borderRadius={24} />
            <Skeleton height={90} />
            <Skeleton height={180} />
          </>
        ) : a.products.length === 0 ? (
          <EmptyState
            icon={<Store size={28} />}
            title="Tu tienda está lista"
            subtitle="Publica tu primer producto con foto, precio y existencias. Un admin lo revisa antes de mostrarlo en Michi-Shop."
            actionLabel="Publicar producto"
            onAction={goNew}
          />
        ) : (
          <>
            <SummaryCard
              label="Ventas cobradas"
              value={formatCurrency(a.totalRevenue)}
              icon={TrendingUp}
              stats={[
                { label: "Pedidos", value: a.soldOrders.length },
                { label: "Piezas", value: a.unitsSold },
                { label: "Ticket prom.", value: formatCurrency(a.avgOrderValue) },
              ]}
            />

            <div className={s.tiles}>
              <StatTile icon={Package} value={a.activeProducts} label="Publicados" color="var(--color-primary)" onPress={() => router.push("/tienda/vendedor/productos")} />
              <StatTile icon={Truck} value={a.toShipOrders} label="Por enviar" color="var(--color-warning)" onPress={() => router.push("/tienda/vendedor/ordenes?filtro=todo")} />
              <StatTile icon={Star} value={a.averageRating !== null ? a.averageRating.toFixed(1) : "–"} label="Calificación" color="var(--color-accent)" />
            </div>

            {alerts.length > 0 ? (
              <div className={s.section}>
                <SectionHeader overline title="Requiere tu atención" />
                {alerts.map((al) => (
                  <ListRow key={al.label} icon={al.icon} label={al.label} desc={al.desc} color={al.color} onPress={() => router.push(al.route)} />
                ))}
              </div>
            ) : null}

            <div className={s.section}>
              <SectionHeader overline title="Gestión" />
              <ListRow icon={Package} label="Catálogo" desc={`${a.products.length} productos · existencias y precios`} color="var(--color-primary)" onPress={() => router.push("/tienda/vendedor/productos")} />
              <ListRow icon={ShoppingBag} label="Pedidos" desc="Envíos y estados" color="var(--color-info)" onPress={() => router.push("/tienda/vendedor/ordenes")} />
              <ListRow icon={TrendingUp} label="Analíticas" desc="Tendencia de ventas y más vendidos" color="var(--color-secondary)" onPress={() => router.push("/tienda/vendedor/analytics")} />
            </div>

            {a.topProducts.length > 0 ? (
              <div className={s.section}>
                <SectionHeader overline title="Lo más vendido" />
                {a.topProducts.slice(0, 3).map((p, i) => (
                  <MediaRow
                    key={p.id}
                    imageUrl={p.image_url}
                    fallbackIcon={Package}
                    title={`${i + 1}. ${p.name}`}
                    lines={[{ text: `${p.units} ${p.units === 1 ? "pieza" : "piezas"} · ${formatCurrency(p.revenue)}` }]}
                    onPress={() => router.push(`/tienda/vendedor/productos/${p.id}`)}
                    accessibilityLabel={`${p.name}: ${p.units} piezas vendidas`}
                  />
                ))}
              </div>
            ) : (
              <p className={s.hint}>Cuando vendas, aquí verás tus productos más vendidos.</p>
            )}
          </>
        )}
      </div>
    </ScreenContainer>
  );
}
