import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTheme } from '@/src/hooks/useTheme';
import { useSellerDashboard } from '@/src/hooks/ecommerce/useSellerDashboard';
import { REVENUE_STATUSES, sellerSubtotal } from '@/src/hooks/ecommerce/useSellerOrders';
import { formatCurrency } from '@/src/utils/formatters';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import EmptyState from '@/src/components/EmptyState';
import { Package, ShoppingBag, TrendingUp, List, ChevronRight, Activity, Star } from 'lucide-react-native';
import { font, spacing, layout } from '@/constants/design';

const { width } = Dimensions.get('window');

export default function VendedorDashboardScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { user } = useAuth();
    const { products, orders, isLoading } = useSellerDashboard();

    if (isLoading) {
        return (
            <ScreenContainer style={styles.center}>
                <LoadingOverlay message="Cargando datos de tu tienda..." />
            </ScreenContainer>
        );
    }

    const soldOrders = orders.filter(o => REVENUE_STATUSES.includes(o.status));
    const totalSales = soldOrders.reduce((acc, order) => acc + sellerSubtotal(order, user?.id), 0);
    const activeProducts = products.filter(p => p.is_active).length;
    const toShipOrders = orders.filter(o => o.status === 'paid' || o.status === 'confirmed').length;
    const reviewCount = products.reduce((acc, p) => acc + (p.review_count || 0), 0);
    const avgRating = reviewCount > 0
        ? products.reduce((acc, p) => acc + (p.average_rating || 0) * (p.review_count || 0), 0) / reviewCount
        : null;

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Mi Tienda"
                subtitle="Panel de Vendedor"
            />

            <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    {/* Sales Summary Card */}
                    <View style={[styles.summaryCard, { backgroundColor: theme.primary }]}>
                        <View style={styles.summaryTop}>
                            <View>
                                <Text style={styles.summaryLabel}>Ventas cobradas</Text>
                                <Text style={styles.summaryValue}>{formatCurrency(totalSales)}</Text>
                            </View>
                            <View style={styles.summaryIconBox}>
                                <TrendingUp size={24} color="#fff" />
                            </View>
                        </View>
                        <View style={styles.summaryBottom}>
                            <View style={styles.summaryStat}>
                                <Text style={styles.summaryStatLabel}>Pedidos cobrados</Text>
                                <Text style={styles.summaryStatValue}>{soldOrders.length}</Text>
                            </View>
                            <View style={styles.summaryDivider} />
                            <View style={styles.summaryStat}>
                                <Text style={styles.summaryStatLabel}>Productos</Text>
                                <Text style={styles.summaryStatValue}>{products.length}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Quick Stats Grid */}
                    <View style={styles.statsGrid}>
                        <View style={[styles.statItem, { backgroundColor: theme.surface }]}>
                            <Package size={20} color="#10b981" />
                            <Text style={[styles.statItemValue, { color: theme.text }]}>{activeProducts}</Text>
                            <Text style={[styles.statItemLabel, { color: theme.textMuted }]}>Activos</Text>
                        </View>
                        <View style={[styles.statItem, { backgroundColor: theme.surface }]}>
                            <Activity size={20} color="#f59e0b" />
                            <Text style={[styles.statItemValue, { color: theme.text }]}>{toShipOrders}</Text>
                            <Text style={[styles.statItemLabel, { color: theme.textMuted }]}>Por enviar</Text>
                        </View>
                        <View style={[styles.statItem, { backgroundColor: theme.surface }]}>
                            <Star size={20} color="#facc15" fill="#facc15" />
                            <Text style={[styles.statItemValue, { color: theme.text }]}>{avgRating !== null ? avgRating.toFixed(1) : '–'}</Text>
                            <Text style={[styles.statItemLabel, { color: theme.textMuted }]}>Rating</Text>
                        </View>
                    </View>

                    {/* Main Management Sections */}
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Gestión Comercial</Text>
                    <View style={styles.menuGrid}>
                        <TouchableOpacity
                            style={[styles.menuItem, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
                            onPress={() => router.push('/tienda/vendedor/productos' as any)}
                        >
                            <View style={[styles.iconBox, { backgroundColor: '#10b98115' }]}>
                                <List size={24} color="#10b981" />
                            </View>
                            <Text style={[styles.menuLabel, { color: theme.text }]}>Catálogo</Text>
                            <Text style={[styles.menuSub, { color: theme.textMuted }]}>Gestionar stock</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.menuItem, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
                            onPress={() => router.push('/tienda/vendedor/ordenes' as any)}
                        >
                            <View style={[styles.iconBox, { backgroundColor: '#3b82f615' }]}>
                                <ShoppingBag size={24} color="#3b82f6" />
                            </View>
                            <Text style={[styles.menuLabel, { color: theme.text }]}>Pedidos</Text>
                            <Text style={[styles.menuSub, { color: theme.textMuted }]}>{toShipOrders > 0 ? `${toShipOrders} por enviar` : 'Envíos y estados'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.menuItem, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
                            onPress={() => router.push('/tienda/vendedor/analytics' as any)}
                        >
                            <View style={[styles.iconBox, { backgroundColor: '#6366f115' }]}>
                                <TrendingUp size={24} color="#6366f1" />
                            </View>
                            <Text style={[styles.menuLabel, { color: theme.text }]}>Analíticas</Text>
                            <Text style={[styles.menuSub, { color: theme.textMuted }]}>Ingresos y stock</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Latest Products */}
                    <View style={styles.listHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Tus Productos</Text>
                        <TouchableOpacity onPress={() => router.push('/tienda/vendedor/productos' as any)}>
                            <Text style={{ color: theme.primary, fontWeight: '700' }}>Ver todos</Text>
                        </TouchableOpacity>
                    </View>

                    {products.length === 0 ? (
                        <EmptyState
                            icon={<Package size={40} color={theme.textMuted} strokeWidth={1} />}
                            title="Aún no tienes productos a la venta"
                            actionLabel="Añadir Primer Producto"
                            onAction={() => router.push('/tienda/vendedor/productos/nuevo' as any)}
                        />
                    ) : (
                        products.slice(0, 3).map(product => (
                            <TouchableOpacity
                                key={product.id}
                                style={[styles.productItem, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
                                onPress={() => router.push(`/tienda/vendedor/productos/${product.id}` as any)}
                            >
                                {product.image_url ? (
                                    <Image source={{ uri: product.image_url }} style={styles.productThumb} />
                                ) : (
                                    <View style={[styles.productThumb, { backgroundColor: theme.backgroundSecondary, justifyContent: 'center', alignItems: 'center' }]}>
                                        <Package size={22} color={theme.textMuted} />
                                    </View>
                                )}
                                <View style={styles.productInfo}>
                                    <Text style={[styles.productName, { color: theme.text }]}>{product.name}</Text>
                                    <Text style={[styles.productPrice, { color: theme.primary }]}>{formatCurrency(product.price)}</Text>
                                    <View style={styles.stockRow}>
                                        <View style={[styles.stockBadge, { backgroundColor: product.stock > 0 ? '#10b98115' : '#ef444415' }]}>
                                            <Text style={[styles.stockText, { color: product.stock > 0 ? '#10b981' : '#ef4444' }]}>
                                                Stock: {product.stock}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                <ChevronRight size={20} color={theme.textMuted} />
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            </ScrollView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    contentScroll: {
        flex: 1,
    },
    content: {
        paddingHorizontal: layout.screenPadding,
        paddingTop: spacing.xxl,
        paddingBottom: 100,
    },
    summaryCard: {
        padding: spacing.xxl,
        borderRadius: 32,
        gap: spacing.xl,
        marginBottom: spacing.xxl,
        elevation: 8,
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    summaryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    summaryLabel: { color: 'rgba(255,255,255,0.85)', fontSize: font.base, fontWeight: '700', textTransform: 'uppercase' },
    summaryValue: { color: '#fff', fontSize: 36, fontWeight: '800', marginTop: spacing.xs },
    summaryIconBox: { width: 48, height: 48, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    summaryBottom: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxl, paddingTop: spacing.xl, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.15)' },
    summaryStat: { flex: 1 },
    summaryStatLabel: { color: 'rgba(255,255,255,0.8)', fontSize: font.sm, fontWeight: '700' },
    summaryStatValue: { color: '#fff', fontSize: font.xxl, fontWeight: '800', marginTop: spacing.xxs },
    summaryDivider: { width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.2)' },
    statsGrid: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xxxl },
    statItem: {
        flex: 1,
        padding: spacing.lg,
        borderRadius: 20,
        alignItems: 'center',
        gap: spacing.sm,
        borderWidth: 1,
    },
    statItemValue: { fontSize: font.xxl, fontWeight: '800' },
    statItemLabel: { fontSize: font.xs, fontWeight: '700', textTransform: 'uppercase' },
    sectionTitle: { fontSize: font.base, fontWeight: '800', marginBottom: spacing.lg, textTransform: 'uppercase', letterSpacing: 0.5 },
    menuGrid: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xxxl },
    menuItem: {
        flex: 1,
        padding: spacing.xl,
        borderRadius: 28,
        gap: spacing.md,
        borderWidth: 1,
    },
    iconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    menuLabel: { fontSize: font.lg, fontWeight: '800' },
    menuSub: { fontSize: font.sm, fontWeight: '600' },
    listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
    productItem: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, borderRadius: 24, gap: spacing.lg, marginBottom: spacing.md, borderWidth: 1 },
    productThumb: { width: 60, height: 60, borderRadius: 14 },
    productInfo: { flex: 1, gap: spacing.xs },
    productName: { fontSize: font.base, fontWeight: '800' },
    productPrice: { fontSize: font.base, fontWeight: '800' },
    stockRow: { marginTop: spacing.xxs },
    stockBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xxs, borderRadius: 4, alignSelf: 'flex-start' },
    stockText: { fontSize: font.xs, fontWeight: '800' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.huge },
});
