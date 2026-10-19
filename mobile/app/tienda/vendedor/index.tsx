import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Package, ShoppingBag, TrendingUp, Truck, Star, Plus, AlertTriangle, Clock, Store } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useScreenAccent } from '@/src/hooks/useScreenAccent';
import { useSellerAnalytics } from '@/src/hooks/ecommerce/useSellerAnalytics';
import { formatCurrency } from '@/src/utils/formatters';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import SummaryCard from '@/src/components/SummaryCard';
import StatTile from '@/src/components/StatTile';
import ListRow from '@/src/components/ListRow';
import SectionHeader from '@/src/components/SectionHeader';
import EmptyState from '@/src/components/EmptyState';
import AppRefreshControl from '@/src/components/AppRefreshControl';
import { Skeleton } from '@/src/components/Skeleton';
import { MediaRow } from '@/src/components/MediaCard';
import { layout, radius, spacing } from '@/constants/design';

export default function VendedorDashboardScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const accent = useScreenAccent() ?? theme.primary;
    const a = useSellerAnalytics();
    const goNew = () => router.push('/tienda/vendedor/productos/nuevo');

    // Avisos que piden una acción, de lo más urgente a lo menos
    const alerts = [
        a.toShipOrders > 0 && {
            icon: Truck, color: theme.warning,
            label: `${a.toShipOrders} ${a.toShipOrders === 1 ? 'pedido por enviar' : 'pedidos por enviar'}`,
            desc: 'Ya están pagados: márcalos como enviados al despacharlos',
            route: '/tienda/vendedor/ordenes?filtro=todo',
        },
        a.outOfStockProducts > 0 && {
            icon: AlertTriangle, color: theme.error,
            label: `${a.outOfStockProducts} ${a.outOfStockProducts === 1 ? 'producto agotado' : 'productos agotados'}`,
            desc: 'No se pueden comprar hasta que repongas existencias',
            route: '/tienda/vendedor/productos?filtro=agotados',
        },
        a.pendingApproval > 0 && {
            icon: Clock, color: theme.info,
            label: `${a.pendingApproval} en revisión`,
            desc: 'Un admin los aprueba antes de mostrarlos en la tienda',
            route: '/tienda/vendedor/productos?filtro=revision',
        },
    ].filter(Boolean) as { icon: typeof Truck; color: string; label: string; desc: string; route: string }[];

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Mi tienda"
                subtitle="Panel de vendedor"
                actions={[{ icon: Plus, label: 'Publicar producto', onPress: goNew }]}
            />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} refreshControl={<AppRefreshControl />}>
                {a.isLoading ? (
                    <View style={styles.loading}>
                        <Skeleton height={150} borderRadius={radius.xl} />
                        <Skeleton height={70} />
                        <Skeleton height={180} />
                    </View>
                ) : a.products.length === 0 ? (
                    <EmptyState
                        icon={<Store size={layout.icon.xl} color={theme.textMuted} />}
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
                                { label: 'Pedidos', value: a.soldOrders.length },
                                { label: 'Piezas', value: a.unitsSold },
                                { label: 'Ticket prom.', value: formatCurrency(a.avgOrderValue) },
                            ]}
                        />

                        <View style={styles.tiles}>
                            <StatTile icon={Package} value={a.activeProducts} label="Publicados" color={accent} onPress={() => router.push('/tienda/vendedor/productos')} />
                            <StatTile icon={Truck} value={a.toShipOrders} label="Por enviar" color={theme.warning} onPress={() => router.push('/tienda/vendedor/ordenes?filtro=todo')} />
                            <StatTile icon={Star} value={a.averageRating !== null ? a.averageRating.toFixed(1) : '–'} label="Calificación" color={theme.accent} />
                        </View>

                        {alerts.length > 0 ? (
                            <View style={styles.section}>
                                <SectionHeader overline title="Requiere tu atención" />
                                {alerts.map((al) => (
                                    <ListRow key={al.label} icon={al.icon} label={al.label} desc={al.desc} color={al.color} onPress={() => router.push(al.route as never)} />
                                ))}
                            </View>
                        ) : null}

                        <View style={styles.section}>
                            <SectionHeader overline title="Gestión" />
                            <ListRow icon={Package} label="Catálogo" desc={`${a.products.length} productos · existencias y precios`} color={accent} onPress={() => router.push('/tienda/vendedor/productos')} />
                            <ListRow icon={ShoppingBag} label="Pedidos" desc="Envíos y estados" color={theme.info} onPress={() => router.push('/tienda/vendedor/ordenes')} />
                            <ListRow icon={TrendingUp} label="Analíticas" desc="Tendencia de ventas y más vendidos" color={theme.secondary} onPress={() => router.push('/tienda/vendedor/analytics')} />
                        </View>

                        {a.topProducts.length > 0 ? (
                            <View style={styles.section}>
                                <SectionHeader overline title="Lo más vendido" />
                                {a.topProducts.slice(0, 3).map((p, i) => (
                                    <MediaRow
                                        key={p.id}
                                        imageUrl={p.image_url}
                                        fallbackIcon={Package}
                                        title={`${i + 1}. ${p.name}`}
                                        lines={[{ text: `${p.units} ${p.units === 1 ? 'pieza' : 'piezas'} · ${formatCurrency(p.revenue)}` }]}
                                        onPress={() => router.push(`/tienda/vendedor/productos/${p.id}`)}
                                        accessibilityLabel={`${p.name}: ${p.units} piezas vendidas`}
                                    />
                                ))}
                            </View>
                        ) : (
                            <Text style={[styles.hint, { color: theme.textMuted }]}>
                                Cuando vendas, aquí verás tus productos más vendidos.
                            </Text>
                        )}
                    </>
                )}
            </ScrollView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    content: { paddingHorizontal: layout.screenPadding, paddingBottom: spacing.huge, gap: spacing.xl },
    loading: { gap: spacing.lg },
    tiles: { flexDirection: 'row', gap: spacing.sm },
    section: { gap: spacing.sm },
    hint: { textAlign: 'center' },
});
