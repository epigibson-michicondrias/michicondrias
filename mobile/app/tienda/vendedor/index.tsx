import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTheme } from '@/src/hooks/useTheme';
import { useSellerDashboard } from '@/src/hooks/ecommerce';
import { formatCurrency } from '@/src/utils/formatters';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import EmptyState from '@/src/components/EmptyState';
import { Package, ShoppingBag, TrendingUp, List, ChevronRight, Settings, Activity, Star } from 'lucide-react-native';

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

    const totalSales = orders.reduce((acc, order) => acc + order.total_amount, 0);
    const activeProducts = products.filter(p => p.is_active).length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Mi Tienda"
                subtitle="Panel de Vendedor"
                actionIcon={Settings}
                onAction={() => router.push('/tienda/vendedor/config' as any)}
                gradient={['#10b981', '#059669', '#047857']}
            />

            <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    {/* Sales Summary Card */}
                    <View style={[styles.summaryCard, { backgroundColor: theme.primary }]}>
                        <View style={styles.summaryTop}>
                            <View>
                                <Text style={styles.summaryLabel}>Ventas Totales</Text>
                                <Text style={styles.summaryValue}>{formatCurrency(totalSales)}</Text>
                            </View>
                            <View style={styles.summaryIconBox}>
                                <TrendingUp size={24} color="#fff" />
                            </View>
                        </View>
                        <View style={styles.summaryBottom}>
                            <View style={styles.summaryStat}>
                                <Text style={styles.summaryStatLabel}>Pedidos</Text>
                                <Text style={styles.summaryStatValue}>{orders.length}</Text>
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
                            <Text style={[styles.statItemValue, { color: theme.text }]}>{pendingOrders}</Text>
                            <Text style={[styles.statItemLabel, { color: theme.textMuted }]}>Pendientes</Text>
                        </View>
                        <View style={[styles.statItem, { backgroundColor: theme.surface }]}>
                            <Star size={20} color="#facc15" fill="#facc15" />
                            <Text style={[styles.statItemValue, { color: theme.text }]}>4.9</Text>
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
                            <Text style={[styles.menuSub, { color: theme.textMuted }]}>Envíos y estados</Text>
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
                                onPress={() => router.push(`/tienda/producto/${product.id}` as any)}
                            >
                                <Image
                                    source={{ uri: product.image_url || 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=400' }}
                                    style={styles.productThumb}
                                />
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
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 100,
    },
    summaryCard: {
        padding: 24,
        borderRadius: 32,
        gap: 20,
        marginBottom: 24,
        elevation: 8,
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    summaryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    summaryLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '700', textTransform: 'uppercase' },
    summaryValue: { color: '#fff', fontSize: 36, fontWeight: '900', marginTop: 4 },
    summaryIconBox: { width: 48, height: 48, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    summaryBottom: { flexDirection: 'row', alignItems: 'center', gap: 24, paddingTop: 20, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.15)' },
    summaryStat: { flex: 1 },
    summaryStatLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '700' },
    summaryStatValue: { color: '#fff', fontSize: 18, fontWeight: '800', marginTop: 2 },
    summaryDivider: { width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.2)' },
    statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 32 },
    statItem: {
        flex: 1,
        padding: 16,
        borderRadius: 20,
        alignItems: 'center',
        gap: 6,
        borderWidth: 1,
    },
    statItemValue: { fontSize: 18, fontWeight: '900' },
    statItemLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
    sectionTitle: { fontSize: 14, fontWeight: '900', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.5 },
    menuGrid: { flexDirection: 'row', gap: 12, marginBottom: 32 },
    menuItem: {
        flex: 1,
        padding: 20,
        borderRadius: 28,
        gap: 12,
        borderWidth: 1,
    },
    iconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    menuLabel: { fontSize: 15, fontWeight: '800' },
    menuSub: { fontSize: 11, fontWeight: '600' },
    listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    productItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 24, gap: 14, marginBottom: 10, borderWidth: 1 },
    productThumb: { width: 60, height: 60, borderRadius: 14 },
    productInfo: { flex: 1, gap: 4 },
    productName: { fontSize: 14, fontWeight: '800' },
    productPrice: { fontSize: 13, fontWeight: '900' },
    stockRow: { marginTop: 2 },
    stockBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start' },
    stockText: { fontSize: 9, fontWeight: '900' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
});
