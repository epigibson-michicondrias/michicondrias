import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getMyProducts, getSellerOrders } from '@/src/services/ecommerce';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ChevronLeft, Package, ShoppingBag, DollarSign, TrendingUp, Star, Clock } from 'lucide-react-native';

export default function VendedorAnalyticsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'dark'];

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['my-products'],
    queryFn: getMyProducts,
  });

  const { data: orders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ['seller-orders'],
    queryFn: getSellerOrders,
  });

  const isLoading = loadingProducts || loadingOrders;

  const totalRevenue = orders.reduce((acc, o) => acc + o.total_amount, 0);
  const activeProducts = products.filter((p) => p.is_active).length;
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const deliveredOrders = orders.filter((o) => o.status === 'delivered').length;
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ color: theme.textMuted, marginTop: 12, fontWeight: '600' }}>Cargando analíticas...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: theme.surface }]} onPress={() => router.back()}>
          <ChevronLeft size={20} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Analíticas</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Revenue Card */}
        <View style={[styles.revenueCard, { backgroundColor: theme.primary }]}>
          <Text style={styles.revenueLabel}>INGRESOS TOTALES</Text>
          <Text style={styles.revenueValue}>${totalRevenue.toLocaleString()}</Text>
          <View style={styles.revenueRow}>
            <View style={styles.revenueStat}>
              <Text style={styles.revenueStatLabel}>Pedidos</Text>
              <Text style={styles.revenueStatValue}>{orders.length}</Text>
            </View>
            <View style={styles.revenueDivider} />
            <View style={styles.revenueStat}>
              <Text style={styles.revenueStatLabel}>Promedio</Text>
              <Text style={styles.revenueStatValue}>${avgOrderValue.toFixed(0)}</Text>
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
            <Text style={[styles.statValue, { color: theme.text }]}>{pendingOrders}</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Pendientes</Text>
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
            { label: 'Pendientes', count: pendingOrders, color: '#f59e0b' },
            { label: 'Enviados', count: orders.filter((o) => o.status === 'shipped').length, color: '#3b82f6' },
            { label: 'Entregados', count: deliveredOrders, color: '#10b981' },
            { label: 'Cancelados', count: orders.filter((o) => o.status === 'cancelled').length, color: '#ef4444' },
          ].map((item) => {
            const pct = orders.length > 0 ? (item.count / orders.length) * 100 : 0;
            return (
              <View key={item.label} style={styles.breakdownRow}>
                <View style={styles.breakdownLabel}>
                  <View style={[styles.breakdownDot, { backgroundColor: item.color }]} />
                  <Text style={[styles.breakdownText, { color: theme.text }]}>{item.label}</Text>
                </View>
                <View style={styles.breakdownBar}>
                  <View style={[styles.breakdownFill, { width: `${pct}%`, backgroundColor: item.color }]} />
                </View>
                <Text style={[styles.breakdownCount, { color: theme.textMuted }]}>{item.count}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { fontSize: 20, fontWeight: '900' },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  revenueCard: {
    padding: 24,
    borderRadius: 28,
    marginBottom: 20,
  },
  revenueLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1,
  },
  revenueValue: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    marginTop: 4,
    marginBottom: 20,
  },
  revenueRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    paddingTop: 16,
  },
  revenueStat: { flex: 1 },
  revenueStatLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
  },
  revenueStatValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    marginTop: 2,
  },
  revenueDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    gap: 8,
  },
  statIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: { fontSize: 22, fontWeight: '900' },
  statLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 12,
  },
  breakdownCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    gap: 14,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  breakdownLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: 100,
  },
  breakdownDot: { width: 8, height: 8, borderRadius: 4 },
  breakdownText: { fontSize: 13, fontWeight: '600' },
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
    fontSize: 13,
    fontWeight: '700',
    width: 24,
    textAlign: 'right',
  },
});
