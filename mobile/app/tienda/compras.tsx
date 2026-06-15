import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Package, Clock, ShoppingBag } from 'lucide-react-native';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { getMyOrders, Order } from '@/src/services/ecommerce';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pendiente', color: '#f59e0b' },
    paid: { label: 'Pagado', color: '#3b82f6' },
    shipped: { label: 'En Camino', color: '#3b82f6' },
    delivered: { label: 'Entregado', color: '#10b981' },
    cancelled: { label: 'Cancelado', color: '#ef4444' },
};

export default function ComprasScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const { data: orders = [], isLoading } = useQuery({
        queryKey: ['my-orders'],
        queryFn: getMyOrders,
    });

    const renderItem = ({ item }: { item: Order }) => {
        const statusInfo = STATUS_MAP[item.status] || { label: item.status, color: '#666' };
        const date = new Date(item.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
        return (
            <TouchableOpacity style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
                <View style={[styles.itemImagePlaceholder, { backgroundColor: theme.borderLight }]}>
                    <Package size={32} color={theme.textMuted} />
                </View>
                <View style={styles.content}>
                    <View style={styles.headerRow}>
                        <Text style={[styles.orderId, { color: theme.textMuted }]}>{item.id.slice(0, 8)}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '15' }]}>
                            <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
                        </View>
                    </View>
                    <Text style={[styles.itemName, { color: theme.text }]} numberOfLines={1}>Pedido #{item.id.slice(0, 8)}</Text>
                    <View style={styles.footerRow}>
                        <Text style={[styles.price, { color: theme.text }]}>${item.total_amount.toFixed(2)}</Text>
                        <View style={[styles.dot, { backgroundColor: theme.border }]} />
                        <Text style={[styles.date, { color: theme.textMuted }]}>{date}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <ChevronLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.text }]}>Mis Compras</Text>
                <View style={{ width: 44 }} />
            </View>

            <FlatList
                data={orders}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <ShoppingBag size={64} color={theme.textMuted} strokeWidth={1} />
                        <Text style={[styles.emptyText, { color: theme.textMuted }]}>Aún no has realizado compras</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 20,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        flex: 1,
        fontSize: 20,
        fontWeight: '900',
        textAlign: 'center',
    },
    list: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    card: {
        flexDirection: 'row',
        padding: 12,
        borderRadius: 24,
        gap: 16,
        marginBottom: 16,
        borderWidth: 1,
    },
    itemImagePlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        gap: 4,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    orderId: {
        fontSize: 11,
        fontWeight: '700',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '800',
    },
    itemName: {
        fontSize: 15,
        fontWeight: '800',
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 4,
    },
    price: {
        fontSize: 14,
        fontWeight: '900',
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
    },
    date: {
        fontSize: 12,
        fontWeight: '600',
    },
    empty: {
        paddingTop: 100,
        alignItems: 'center',
        gap: 20,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
    }
});
