import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useSellerAnalytics } from '@/src/hooks/ecommerce/useSellerAnalytics';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { formatCurrency } from '@/src/utils/formatters';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import { Package, ShoppingBag, Clock, TrendingUp, AlertTriangle } from 'lucide-react-native';
import { font, spacing, layout } from '@/constants/design';

export default function VendedorAnalyticsScreen() {
  const { theme } = useTheme();
  const {
    products,
    orders,
    isLoading,
    totalRevenue,
    activeProducts,
    soldOrders,
    toShipOrders,
    awaitingPayment,
    unitsSold,
    lowStockProducts,
    outOfStockProducts,
    deliveredOrders,
    shippedOrders,
    cancelledOrders,
    avgOrderValue,
  } = useSellerAnalytics();

  if (isLoading) {
    return (
      <ScreenContainer>
        <LoadingOverlay message="Cargando analíticas..." />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScreenHeader title="Analíticas" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Revenue Card */}
        <View style={[styles.revenueCard, { backgroundColor: theme.primary }]}>
          <Text style={styles.revenueLabel}>INGRESOS TOTALES</Text>
          <Text style={styles.revenueValue}>{formatCurrency(totalRevenue)}</Text>
          <View style={styles.revenueRow}>
            <View style={styles.revenueStat}>
              <Text style={styles.revenueStatLabel}>Ventas</Text>
              <Text style={styles.revenueStatValue}>{soldOrders.length}</Text>
            </View>
            <View style={styles.revenueDivider} />
            <View style={styles.revenueStat}>
              <Text style={styles.revenueStatLabel}>Piezas</Text>
              <Text style={styles.revenueStatValue}>{unitsSold}</Text>
            </View>
            <View style={styles.revenueDivider} />
            <View style={styles.revenueStat}>
              <Text style={styles.revenueStatLabel}>Ticket prom.</Text>
              <Text style={styles.revenueStatValue}>{formatCurrency(avgOrderValue)}</Text>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.statIconBox, { backgroundColor: '#10b98115' }]}>
              <Package size={22} color="#10b981" />
            </View>
            <Text style={[styles.statValue, { color: theme.text }]}>{products.length}</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Productos</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.statIconBox, { backgroundColor: '#3b82f615' }]}>
              <ShoppingBag size={22} color="#3b82f6" />
            </View>
            <Text style={[styles.statValue, { color: theme.text }]}>{activeProducts}</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Activos</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.statIconBox, { backgroundColor: '#f59e0b15' }]}>
              <Clock size={22} color="#f59e0b" />
            </View>
            <Text style={[styles.statValue, { color: theme.text }]}>{toShipOrders}</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Por enviar</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.statIconBox, { backgroundColor: '#6366f115' }]}>
              <TrendingUp size={22} color="#6366f1" />
            </View>
            <Text style={[styles.statValue, { color: theme.text }]}>{deliveredOrders}</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Entregados</Text>
          </View>
        </View>

        {/* Breakdown Section */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Desglose de Pedidos</Text>
        <View style={[styles.breakdownCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {[
            { label: 'Esperan pago', count: awaitingPayment, color: '#f59e0b' },
            { label: 'Por enviar', count: toShipOrders, color: '#6366f1' },
            { label: 'Enviados', count: shippedOrders, color: '#3b82f6' },
            { label: 'Entregados', count: deliveredOrders, color: '#10b981' },
            { label: 'Cancelados', count: cancelledOrders, color: '#ef4444' },
          ].map((item) => {
            const pct = orders.length > 0 ? (item.count / orders.length) * 100 : 0;
            return (
              <View key={item.label} style={styles.breakdownRow}>
                <View style={styles.breakdownLabel}>
                  <View style={[styles.breakdownDot, { backgroundColor: item.color }]} />
                  <Text style={[styles.breakdownText, { color: theme.text }]}>{item.label}</Text>
                </View>
                <View style={[styles.breakdownBar, { backgroundColor: theme.overlayHover }]}>
                  <View style={[styles.breakdownFill, { width: `${pct}%`, backgroundColor: item.color }]} />
                </View>
                <Text style={[styles.breakdownCount, { color: theme.textMuted }]}>{item.count}</Text>
              </View>
            );
          })}
        </View>

        {lowStockProducts + outOfStockProducts > 0 ? (
          <View style={[styles.breakdownCard, { backgroundColor: theme.warningLight, borderColor: theme.warning, marginTop: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md }]}>
            <AlertTriangle size={20} color={theme.warning} />
            <Text style={{ flex: 1, color: theme.text, fontSize: font.base, fontWeight: '600' }}>
              {outOfStockProducts > 0 ? `${outOfStockProducts} producto(s) agotado(s). ` : ''}
              {lowStockProducts > 0 ? `${lowStockProducts} con pocas unidades (5 o menos). ` : ''}
              Actualiza tu inventario desde el catálogo.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing.huge,
  },
  revenueCard: {
    padding: spacing.xxl,
    borderRadius: 28,
    marginBottom: spacing.xl,
  },
  revenueLabel: {
    fontSize: font.sm,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1,
  },
  revenueValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  revenueRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    paddingTop: spacing.lg,
  },
  revenueStat: { flex: 1 },
  revenueStatLabel: {
    fontSize: font.sm,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
  },
  revenueStatValue: {
    fontSize: font.xxl,
    fontWeight: '800',
    color: '#fff',
    marginTop: spacing.xxs,
  },
  revenueDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    padding: spacing.xl,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    gap: spacing.sm,
  },
  statIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: { fontSize: font.h2, fontWeight: '800' },
  statLabel: { fontSize: font.md, fontWeight: '700', textTransform: 'uppercase' },
  sectionTitle: {
    fontSize: font.base,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  breakdownCard: {
    padding: spacing.xl,
    borderRadius: 20,
    borderWidth: 1,
    gap: spacing.lg,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  breakdownLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    width: 110,
  },
  breakdownDot: { width: 8, height: 8, borderRadius: 4 },
  breakdownText: { fontSize: font.base, fontWeight: '600' },
  breakdownBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  breakdownFill: {
    height: '100%',
    borderRadius: 4,
  },
  breakdownCount: {
    fontSize: font.base,
    fontWeight: '700',
    width: 24,
    textAlign: 'right',
  },
});
