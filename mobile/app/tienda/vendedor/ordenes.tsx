import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useAuth } from '@/src/contexts/AuthContext';
import { useSellerOrders, ORDER_STATUS_MAP, SELLER_NEXT_STATUS } from '@/src/hooks/ecommerce/useSellerOrders';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import EmptyState from '@/src/components/EmptyState';
import { Package, Clock, Truck, CheckCircle, XCircle, CreditCard, User, MapPin } from 'lucide-react-native';
import { Order } from '@/src/services/ecommerce';
import { formatCurrency } from '@/src/utils/formatters';
import AppRefreshControl from '@/src/components/AppRefreshControl';

const STATUS_ICONS: Record<string, any> = {
    pending: Clock,
    paid: CreditCard,
    confirmed: CheckCircle,
    shipped: Truck,
    delivered: CheckCircle,
    cancelled: XCircle,
};

const FILTERS: { key: string; label: string; match: (status: string) => boolean }[] = [
    { key: 'all', label: 'Todos', match: () => true },
    { key: 'todo', label: 'Por enviar', match: (s) => s === 'paid' || s === 'confirmed' },
    { key: 'shipped', label: 'Enviados', match: (s) => s === 'shipped' },
    { key: 'delivered', label: 'Entregados', match: (s) => s === 'delivered' },
    { key: 'pending', label: 'Esperando pago', match: (s) => s === 'pending' },
    { key: 'cancelled', label: 'Cancelados', match: (s) => s === 'cancelled' },
];

export default function VendedorOrdenesScreen() {
    const { theme } = useTheme();
    const { user } = useAuth();
    const {
        orders,
        isLoading,
        isUpdating,
        filter,
        setFilter,
        updateStatus,
    } = useSellerOrders();

    const activeFilter = FILTERS.find(f => f.key === filter) || FILTERS[0];
    const filteredOrders = orders.filter(o => activeFilter.match(o.status));

    const confirmAdvance = (order: Order, next: { status: string; label: string }) => {
        updateStatus(order.id, next.status);
    };

    const renderItem = ({ item }: { item: Order }) => {
        const status = ORDER_STATUS_MAP[item.status] || ORDER_STATUS_MAP.pending;
        const StatusIcon = STATUS_ICONS[item.status] || Clock;
        const next = SELLER_NEXT_STATUS[item.status];
        // Un pedido puede incluir productos de varios vendedores: aquí solo cuenta lo que vendió este usuario
        const myItems = (item.items || []).filter(i => !i.product || !user || i.product.seller_id === user.id);
        const mySubtotal = myItems.reduce((acc, i) => acc + i.price_at_purchase * i.quantity, 0);

        return (
            <View style={[styles.orderCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
                <View style={styles.orderHeader}>
                    <View style={styles.orderIdBox}>
                        <Package size={16} color={theme.textMuted} />
                        <Text style={[styles.orderId, { color: theme.text }]}>Pedido #{item.id.substring(0, 8).toUpperCase()}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                        <StatusIcon size={12} color={status.color} />
                        <Text style={[styles.statusLabel, { color: status.color }]}>{status.label}</Text>
                    </View>
                </View>

                <View style={[styles.itemsBox, { backgroundColor: theme.backgroundSecondary }]}>
                    {myItems.map(i => (
                        <Text key={i.id} style={[styles.itemLine, { color: theme.text }]} numberOfLines={1}>
                            {i.quantity} × {i.product?.name || 'Producto'}
                        </Text>
                    ))}
                </View>

                <View style={styles.orderBody}>
                    <View style={styles.infoRow}>
                        <User size={16} color={theme.textMuted} />
                        <Text style={[styles.infoText, { color: theme.text }]}>Comprador {item.user_id.substring(0, 8)}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <MapPin size={16} color={theme.textMuted} />
                        <Text style={[styles.infoText, { color: theme.text }]} numberOfLines={3}>{item.shipping_address || 'Sin dirección de envío'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Clock size={16} color={theme.textMuted} />
                        <Text style={[styles.infoText, { color: theme.text }]}>{new Date(item.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
                    </View>
                </View>

                <View style={[styles.orderFooter, { borderTopColor: theme.divider }]}>
                    <Text style={[styles.totalAmount, { color: theme.text }]}>Tu venta: <Text style={{ color: theme.primary }}>{formatCurrency(mySubtotal)}</Text></Text>

                    {next ? (
                        <TouchableOpacity
                            style={[styles.shipBtn, { backgroundColor: next.status === 'delivered' ? theme.success : theme.primary }, isUpdating && { opacity: 0.6 }]}
                            onPress={() => confirmAdvance(item, next)}
                            disabled={isUpdating}
                            accessibilityRole="button"
                            accessibilityLabel={`${next.label} pedido ${item.id.substring(0, 8)}`}
                        >
                            {isUpdating ? <ActivityIndicator size="small" color="#fff" /> : next.status === 'delivered' ? <CheckCircle size={16} color="#fff" /> : <Truck size={16} color="#fff" />}
                            <Text style={styles.shipBtnText}>{next.label}</Text>
                        </TouchableOpacity>
                    ) : item.status === 'pending' ? (
                        <Text style={[styles.waitText, { color: theme.textMuted }]}>El comprador aún no paga</Text>
                    ) : null}
                </View>
            </View>
        );
    };

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Gestión de pedidos"
                subtitle={`${orders.length} ${orders.length === 1 ? 'pedido' : 'pedidos'}`}
            />

            <View style={styles.tabsContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
                    {FILTERS.map(tab => {
                        const count = orders.filter(o => tab.match(o.status)).length;
                        const active = filter === tab.key;
                        return (
                            <TouchableOpacity
                                key={tab.key}
                                onPress={() => setFilter(tab.key)}
                                accessibilityRole="button"
                                accessibilityState={{ selected: active }}
                                style={[
                                    styles.tab,
                                    { backgroundColor: theme.surface, borderColor: theme.border },
                                    active && { backgroundColor: theme.primaryLight, borderColor: theme.primary }
                                ]}
                            >
                                <Text style={[
                                    styles.tabText,
                                    { color: theme.textMuted },
                                    active && { color: theme.primary, fontWeight: '800' }
                                ]}>{tab.label}{tab.key !== 'all' && count > 0 ? ` · ${count}` : ''}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {isLoading ? (
                <View style={styles.center}>
                    <LoadingOverlay />
                </View>
            ) : (
                <FlatList
                    refreshControl={<AppRefreshControl />}
                    data={filteredOrders}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <EmptyState
                            icon={<Package size={40} color={theme.textMuted} strokeWidth={1} />}
                            title={orders.length === 0 ? 'Aún no tienes pedidos' : 'No hay pedidos en este filtro'}
                            subtitle={orders.length === 0 ? 'Cuando alguien compre uno de tus productos aparecerá aquí.' : undefined}
                        />
                    }
                />
            )}
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    tabsContainer: { marginBottom: 16 },
    tabsScroll: { paddingHorizontal: 24, gap: 10 },
    tab: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, borderWidth: 1 },
    tabText: { fontSize: 13, fontWeight: '600' },
    list: { padding: 24, paddingBottom: 100 },
    orderCard: { borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1 },
    itemsBox: { borderRadius: 14, padding: 12, gap: 4, marginBottom: 14 },
    itemLine: { fontSize: 13, fontWeight: '700' },
    waitText: { fontSize: 12, fontWeight: '600' },
    orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    orderIdBox: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    orderId: { fontSize: 14, fontWeight: '800' },
    statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
    statusLabel: { fontSize: 11, fontWeight: '800' },
    orderBody: { gap: 10, marginBottom: 20 },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    infoText: { fontSize: 14, fontWeight: '600' },
    orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1 },
    totalAmount: { fontSize: 15, fontWeight: '800' },
    shipBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
    shipBtnText: { color: '#fff', fontSize: 12, fontWeight: '800' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
