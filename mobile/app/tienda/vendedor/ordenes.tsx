import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useSellerOrders } from '@/src/hooks/ecommerce';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import EmptyState from '@/src/components/EmptyState';
import { Package, Clock, Truck, CheckCircle, XCircle, User, MapPin } from 'lucide-react-native';
import { Order } from '@/src/services/ecommerce';

const STATUS_ICONS: Record<string, any> = {
    pending: Clock,
    shipped: Truck,
    delivered: CheckCircle,
    cancelled: XCircle,
};

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: "Pendiente", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
    shipped: { label: "Enviado", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
    delivered: { label: "Entregado", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
    cancelled: { label: "Cancelado", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
};

export default function VendedorOrdenesScreen() {
    const { theme } = useTheme();
    const {
        orders,
        filteredOrders,
        isLoading,
        filter,
        setFilter,
        updateStatus,
    } = useSellerOrders();

    const renderItem = ({ item }: { item: Order }) => {
        const status = STATUS_MAP[item.status] || STATUS_MAP.pending;
        const StatusIcon = STATUS_ICONS[item.status] || Clock;

        return (
            <View style={[styles.orderCard, { backgroundColor: theme.surface }]}>
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

                <View style={styles.orderBody}>
                    <View style={styles.infoRow}>
                        <User size={16} color={theme.textMuted} />
                        <Text style={[styles.infoText, { color: theme.text }]}>Comprador ID: {item.user_id.substring(0, 8)}...</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <MapPin size={16} color={theme.textMuted} />
                        <Text style={[styles.infoText, { color: theme.text }]} numberOfLines={1}>{item.shipping_address || "Sin dirección"}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Clock size={16} color={theme.textMuted} />
                        <Text style={[styles.infoText, { color: theme.text }]}>{new Date(item.created_at).toLocaleDateString()}</Text>
                    </View>
                </View>

                <View style={styles.orderFooter}>
                    <Text style={[styles.totalAmount, { color: theme.text }]}>Total: <Text style={{ color: theme.primary }}>${item.total_amount.toLocaleString()}</Text></Text>

                    {item.status === 'pending' && (
                        <TouchableOpacity
                            style={[styles.shipBtn, { backgroundColor: theme.primary }]}
                            onPress={() => updateStatus(item.id, 'shipped')}
                        >
                            <Truck size={16} color="#fff" />
                            <Text style={styles.shipBtnText}>Marcar Enviado</Text>
                        </TouchableOpacity>
                    )}
                    {item.status === 'shipped' && (
                        <TouchableOpacity
                            style={[styles.shipBtn, { backgroundColor: '#10b981' }]}
                            onPress={() => updateStatus(item.id, 'delivered')}
                        >
                            <CheckCircle size={16} color="#fff" />
                            <Text style={styles.shipBtnText}>Marcar Entregado</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Gestión de Pedidos"
                subtitle={`${orders.length} Ventas realizadas`}
            />

            <View style={styles.tabsContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
                    {[
                        { key: 'all', label: 'Todos' },
                        { key: 'pending', label: 'Pendientes' },
                        { key: 'shipped', label: 'Enviados' },
                        { key: 'delivered', label: 'Entregados' },
                    ].map(tab => (
                        <TouchableOpacity
                            key={tab.key}
                            onPress={() => setFilter(tab.key)}
                            style={[
                                styles.tab,
                                { backgroundColor: theme.surface, borderColor: theme.border },
                                filter === tab.key && { backgroundColor: theme.primary + '20', borderColor: theme.primary }
                            ]}
                        >
                            <Text style={[
                                styles.tabText,
                                { color: theme.textMuted },
                                filter === tab.key && { color: theme.primary, fontWeight: '800' }
                            ]}>{tab.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {isLoading ? (
                <View style={styles.center}>
                    <LoadingOverlay />
                </View>
            ) : (
                <FlatList
                    data={filteredOrders}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <EmptyState
                            icon={<Package size={40} color={theme.textMuted} strokeWidth={1} />}
                            title="No hay pedidos registrados"
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
    orderCard: { borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    orderIdBox: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    orderId: { fontSize: 14, fontWeight: '800' },
    statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
    statusLabel: { fontSize: 11, fontWeight: '800' },
    orderBody: { gap: 10, marginBottom: 20 },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    infoText: { fontSize: 14, fontWeight: '600' },
    orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
    totalAmount: { fontSize: 15, fontWeight: '800' },
    shipBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
    shipBtnText: { color: '#fff', fontSize: 12, fontWeight: '800' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
