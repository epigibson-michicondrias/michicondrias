import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSellerOrders, updateOrderStatus, Order } from '../../../src/services/ecommerce';
import Colors from '../../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ChevronLeft, Package, Clock, Truck, CheckCircle, XCircle, MoreHorizontal, User, MapPin, DollarSign } from 'lucide-react-native';

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; icon: any }> = {
    pending: { label: "Pendiente", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", icon: Clock },
    shipped: { label: "Enviado", color: "#3b82f6", bg: "rgba(59,130,246,0.12)", icon: Truck },
    delivered: { label: "Entregado", color: "#10b981", bg: "rgba(16,185,129,0.12)", icon: CheckCircle },
    cancelled: { label: "Cancelado", color: "#ef4444", bg: "rgba(239,68,68,0.12)", icon: XCircle },
};

export default function VendedorOrdenesScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState('all');

    const { data: orders = [], isLoading } = useQuery({
        queryKey: ['seller-orders'],
        queryFn: getSellerOrders,
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => updateOrderStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
            Alert.alert("Éxito", "Estado del pedido actualizado");
        },
        onError: () => Alert.alert("Error", "No se pudo actualizar el estado"),
    });

    const filteredOrders = orders.filter(o => filter === 'all' ? true : o.status === filter);

    const renderItem = ({ item }: { item: Order }) => {
        const status = STATUS_MAP[item.status] || STATUS_MAP.pending;
        const StatusIcon = status.icon;

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
                            onPress={() => statusMutation.mutate({ id: item.id, status: 'shipped' })}
                        >
                            <Truck size={16} color="#fff" />
                            <Text style={styles.shipBtnText}>Marcar Enviado</Text>
                        </TouchableOpacity>
                    )}
                    {item.status === 'shipped' && (
                        <TouchableOpacity
                            style={[styles.shipBtn, { backgroundColor: '#10b981' }]}
                            onPress={() => statusMutation.mutate({ id: item.id, status: 'delivered' })}
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
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <ChevronLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <View style={styles.titleBox}>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Gestión de Pedidos</Text>
                    <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>{orders.length} Ventas realizadas</Text>
                </View>
            </View>

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
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredOrders}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Package size={64} color={theme.textMuted} strokeWidth={1} />
                            <Text style={[styles.emptyText, { color: theme.textMuted }]}>No hay pedidos registrados</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: 24, paddingBottom: 24, gap: 16 },
    backBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.03)', justifyContent: 'center', alignItems: 'center' },
    titleBox: { flex: 1 },
    headerTitle: { fontSize: 24, fontWeight: '900' },
    headerSubtitle: { fontSize: 13, fontWeight: '600' },
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
    empty: { paddingTop: 100, alignItems: 'center', gap: 20 },
    emptyText: { fontSize: 16, fontWeight: '600', textAlign: 'center' }
});
