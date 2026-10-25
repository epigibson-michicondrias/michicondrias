import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Package, TrendingUp, TrendingDown, Truck, PackageCheck, AlertTriangle, BarChart3 } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useScreenAccent } from '@/src/hooks/useScreenAccent';
import { useSellerAnalytics } from '@/src/hooks/ecommerce/useSellerAnalytics';
import { useOrderStatus } from '@/src/features/tienda/orderStatus';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import SummaryCard from '@/src/components/SummaryCard';
import StatTile from '@/src/components/StatTile';
import Card from '@/src/components/Card';
import ListRow from '@/src/components/ListRow';
import MiniBarChart from '@/src/components/MiniBarChart';
import EmptyState from '@/src/components/EmptyState';
import AppRefreshControl from '@/src/components/AppRefreshControl';
import { Skeleton } from '@/src/components/Skeleton';
import { MediaRow } from '@/src/components/MediaCard';
import { formatCurrency } from '@/src/utils/formatters';
import { families, layout, radius, spacing, tint, type } from '@/constants/design';

export default function VendedorAnalyticsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const accent = useScreenAccent() ?? theme.primary;
  const statusOf = useOrderStatus();
  const a = useSellerAnalytics();

  const thisWeek = a.weeklySales[a.weeklySales.length - 1]?.value ?? 0;
  const lastWeek = a.weeklySales[a.weeklySales.length - 2]?.value ?? 0;
  const trend = lastWeek > 0 ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : null;

  const breakdown = [
    { key: 'pending', count: a.awaitingPayment },
    { key: 'paid', count: a.toShipOrders },
    { key: 'shipped', count: a.shippedOrders },
    { key: 'delivered', count: a.deliveredOrders },
    { key: 'cancelled', count: a.cancelledOrders },
  ].map((b) => ({ ...b, ...statusOf(b.key) }));

  return (
    <ScreenContainer>
      <ScreenHeader title="Analíticas" subtitle="Tu tienda en números" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} refreshControl={<AppRefreshControl />}>
        {a.isLoading ? (
          <View style={styles.loading}>
            <Skeleton height={150} borderRadius={radius.xl} />
            <Skeleton height={160} />
            <Skeleton height={180} />
          </View>
        ) : a.orders.length === 0 ? (
          <EmptyState
            icon={<BarChart3 size={layout.icon.xl} color={theme.textMuted} />}
            title="Aún no hay ventas que analizar"
            subtitle="En cuanto recibas pedidos verás aquí tus ingresos, la tendencia semanal y lo más vendido."
            actionLabel="Ir a mi catálogo"
            onAction={() => router.push('/tienda/vendedor/productos')}
          />
        ) : (
          <>
            <SummaryCard
              label="Ingresos cobrados"
              value={formatCurrency(a.totalRevenue)}
              icon={TrendingUp}
              caption="Solo pedidos pagados; sin los cancelados ni los que esperan pago"
              stats={[
                { label: 'Ventas', value: a.soldOrders.length },
                { label: 'Piezas', value: a.unitsSold },
                { label: 'Ticket prom.', value: formatCurrency(a.avgOrderValue) },
              ]}
            />

            {/* Tendencia */}
            <Card>
              <View style={styles.cardHead}>
                <View style={styles.flex}>
                  <Text style={[type.title, { color: theme.text }]}>Ventas por semana</Text>
                  <Text style={[type.caption, { color: theme.textMuted }]}>
                    Últimos 7 días: {formatCurrency(thisWeek)}{trend !== null ? ' · vs. 7 días anteriores' : ''}
                  </Text>
                </View>
                {trend !== null ? (
                  <View style={[styles.trend, { backgroundColor: (trend >= 0 ? theme.success : theme.error) + tint.soft }]}>
                    {trend >= 0
                      ? <TrendingUp size={layout.icon.xs} color={theme.success} />
                      : <TrendingDown size={layout.icon.xs} color={theme.error} />}
                    <Text style={[type.caption, styles.bold, { color: trend >= 0 ? theme.success : theme.error }]}>{Math.abs(trend)}%</Text>
                  </View>
                ) : null}
              </View>
              <MiniBarChart data={a.weeklySales} color={accent} formatValue={formatCurrency} />
            </Card>

            <View style={styles.tiles}>
              <StatTile icon={Truck} value={a.toShipOrders} label="Por enviar" color={theme.warning} onPress={() => router.push('/tienda/vendedor/ordenes?filtro=todo')} />
              <StatTile icon={PackageCheck} value={a.deliveredOrders} label="Entregados" color={theme.success} />
              <StatTile icon={Package} value={a.activeProducts} label="Publicados" color={accent} onPress={() => router.push('/tienda/vendedor/productos')} />
            </View>

            {/* Pedidos por estado */}
            <Card>
              <Text style={[type.title, styles.cardTitle, { color: theme.text }]}>Pedidos por estado</Text>
              <View style={styles.breakdown}>
                {breakdown.map((b) => {
                  const pct = a.orders.length > 0 ? (b.count / a.orders.length) * 100 : 0;
                  return (
                    <View key={b.key} style={styles.breakdownRow} accessible accessibilityLabel={`${b.sellerLabel}: ${b.count}`}>
                      <Text style={[type.body, styles.breakdownLabel, { color: theme.text }]}>{b.sellerLabel}</Text>
                      <View style={[styles.bar, { backgroundColor: theme.overlayHover }]}>
                        <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: b.color }]} />
                      </View>
                      <Text style={[type.bodyStrong, styles.count, { color: theme.textMuted }]}>{b.count}</Text>
                    </View>
                  );
                })}
              </View>
            </Card>

            {a.topProducts.length > 0 ? (
              <View style={styles.section}>
                <Text style={[type.title, { color: theme.text }]}>Lo más vendido</Text>
                {a.topProducts.map((p, i) => (
                  <MediaRow
                    key={p.id}
                    imageUrl={p.image_url}
                    fallbackIcon={Package}
                    title={`${i + 1}. ${p.name}`}
                    lines={[{ text: `${p.units} ${p.units === 1 ? 'pieza' : 'piezas'} · ${formatCurrency(p.revenue)}` }]}
                    onPress={() => router.push(`/tienda/vendedor/productos/${p.id}`)}
                    accessibilityLabel={`${p.name}: ${p.units} piezas, ${formatCurrency(p.revenue)}`}
                  />
                ))}
              </View>
            ) : null}

            {a.lowStockProducts + a.outOfStockProducts > 0 ? (
              <ListRow
                icon={AlertTriangle}
                label="Revisa tus existencias"
                desc={[
                  a.outOfStockProducts > 0 ? `${a.outOfStockProducts} agotados` : '',
                  a.lowStockProducts > 0 ? `${a.lowStockProducts} con 5 piezas o menos` : '',
                ].filter(Boolean).join(' · ')}
                color={theme.warning}
                onPress={() => router.push('/tienda/vendedor/productos?filtro=agotados')}
              />
            ) : null}
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: layout.screenPadding, paddingBottom: spacing.huge, gap: spacing.lg },
  loading: { gap: spacing.lg },
  flex: { flex: 1 },
  bold: { fontFamily: families.extrabold },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  cardTitle: { marginBottom: spacing.md },
  trend: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs, paddingHorizontal: spacing.sm, paddingVertical: spacing.xxs, borderRadius: radius.pill },
  tiles: { flexDirection: 'row', gap: spacing.sm },
  breakdown: { gap: spacing.sm },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  breakdownLabel: { width: layout.iconBox.lg * 2.4 },
  bar: { flex: 1, height: spacing.sm, borderRadius: radius.pill, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: radius.pill },
  count: { minWidth: spacing.xl, textAlign: 'right' },
  section: { gap: spacing.sm },
});
