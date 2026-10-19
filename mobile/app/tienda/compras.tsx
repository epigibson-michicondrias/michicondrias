import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { usePurchases, STATUS_MAP } from '@/src/hooks/ecommerce/usePurchases';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { SkeletonList } from '@/src/components/Skeleton';
import EmptyState from '@/src/components/EmptyState';
import { Package, ShoppingBag } from 'lucide-react-native';
import { Order } from '@/src/services/ecommerce';
import { formatCurrency } from '@/src/utils/formatters';
import AppRefreshControl from '@/src/components/AppRefreshControl';
import { spacing, font } from '@/constants/design';

export default function ComprasScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { orders, isLoading, loadMore, isLoadingMore } = usePurchases();

    const renderItem = ({ item }: { item: Order }) => {
        const statusInfo = STATUS_MAP[item.status] || { label: item.status, color: theme.textMuted };
        const date = new Date(item.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
        const first = item.items?.[0]?.product;
        const units = (item.items || []).reduce((acc, i) => acc + i.quantity, 0);
        const extra = (item.items?.length || 0) - 1;
        const title = first?.name
            ? (extra > 0 ? `${first.name} y ${extra} más` : first.name)
            : `Pedido #${item.id.slice(0, 8).toUpperCase()}`;
        return (
            <TouchableOpacity
                style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
                onPress={() => router.push(`/tienda/pedido/${item.id}` as any)}
                accessibilityRole="button"
                accessibilityLabel={`${title}, ${statusInfo.label}, ${formatCurrency(item.total_amount)}`}
            >
                {first?.image_url ? (
                    <Image source={{ uri: first.image_url }} style={styles.itemImagePlaceholder} />
                ) : (
                    <View style={[styles.itemImagePlaceholder, { backgroundColor: theme.backgroundSecondary }]}>
                        <Package size={32} color={theme.textMuted} />
                    </View>
                )}
                <View style={styles.content}>
                    <View style={styles.cardHeader}>
                        <Text style={[styles.orderId, { color: theme.textMuted }]}>#{item.id.slice(0, 8).toUpperCase()}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '22' }]}>
                            <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
                        </View>
                    </View>
                    <Text style={[styles.itemName, { color: theme.text }]} numberOfLines={2}>{title}</Text>
                    <View style={styles.footerRow}>
                        <Text style={[styles.price, { color: theme.text }]}>{formatCurrency(item.total_amount)}</Text>
                        <View style={[styles.dot, { backgroundColor: theme.border }]} />
                        <Text style={[styles.date, { color: theme.textMuted }]}>{units > 0 ? `${units} ${units === 1 ? 'pieza' : 'piezas'} · ` : ''}{date}</Text>
                    </View>
                    {item.status === 'pending' ? (
                        <Text style={[styles.pendingHint, { color: theme.warning }]}>Pendiente de pago · toca para pagar o cancelar</Text>
                    ) : null}
                </View>
            </TouchableOpacity>
        );
    };

    if (isLoading) {
        return (
            <ScreenContainer>
                <ScreenHeader title="Mis Compras" />
                <View style={styles.list}>
                    <SkeletonList count={5} />
                </View>
            </ScreenContainer>
        );
    }

    return (
        <ScreenContainer>
            <ScreenHeader title="Mis Compras" />

            <FlatList
                refreshControl={<AppRefreshControl />}
                data={orders}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                onEndReached={loadMore}
                onEndReachedThreshold={0.4}
                ListFooterComponent={isLoadingMore ? <ActivityIndicator color={theme.primary} style={styles.footerLoader} /> : null}
                ListEmptyComponent={
                    <EmptyState
                        icon={<ShoppingBag size={40} color={theme.textMuted} strokeWidth={1} />}
                        title="Aún no has realizado compras"
                        subtitle="Cuando compres en Michi-Shop verás aquí tus pedidos y su seguimiento."
                        actionLabel="Ir a la tienda"
                        onAction={() => router.replace('/(tabs)/tienda-tab' as any)}
                    />
                }
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    footerLoader: {
        paddingVertical: spacing.lg,
    },
    list: {
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.huge,
    },
    card: {
        flexDirection: 'row',
        padding: spacing.md,
        borderRadius: 24,
        gap: spacing.lg,
        marginBottom: spacing.lg,
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
        gap: spacing.xs,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    orderId: {
        fontSize: font.sm,
        fontWeight: '700',
    },
    statusBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: 6,
    },
    statusText: {
        fontSize: font.xs,
        fontWeight: '800',
    },
    itemName: {
        fontSize: font.lg,
        fontWeight: '800',
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginTop: spacing.xs,
    },
    price: {
        fontSize: font.base,
        fontWeight: '800',
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
    },
    pendingHint: { fontSize: font.sm, fontWeight: '700', marginTop: spacing.xxs },
    date: {
        fontSize: font.md,
        fontWeight: '600',
    },
});
