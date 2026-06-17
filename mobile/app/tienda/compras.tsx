import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { usePurchases, STATUS_MAP } from '@/src/hooks/ecommerce';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import EmptyState from '@/src/components/EmptyState';
import { Package, ShoppingBag } from 'lucide-react-native';
import { Order } from '@/src/services/ecommerce';

export default function ComprasScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { orders, isLoading } = usePurchases();

    const renderItem = ({ item }: { item: Order }) => {
        const statusInfo = STATUS_MAP[item.status] || { label: item.status, color: '#666' };
        const date = new Date(item.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
        return (
            <TouchableOpacity style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
                <View style={[styles.itemImagePlaceholder, { backgroundColor: theme.borderLight }]}>
                    <Package size={32} color={theme.textMuted} />
                </View>
                <View style={styles.content}>
                    <View style={styles.cardHeader}>
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
            <ScreenContainer>
                <LoadingOverlay message="Cargando pedidos..." />
            </ScreenContainer>
        );
    }

    return (
        <ScreenContainer>
            <ScreenHeader title="Mis Compras" />

            <FlatList
                data={orders}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <EmptyState
                        icon={<ShoppingBag size={40} color={theme.textMuted} strokeWidth={1} />}
                        title="Aún no has realizado compras"
                    />
                }
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
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
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
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
});
