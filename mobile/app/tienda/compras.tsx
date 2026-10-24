import React, { useMemo, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, ScrollView } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { Package, ShoppingBag, CalendarDays, Clock, SearchX } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { usePurchases } from '@/src/hooks/ecommerce/usePurchases';
import { useOrderStatus, PURCHASE_FILTERS, type PurchaseFilter } from '@/src/features/tienda/orderStatus';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { SkeletonList } from '@/src/components/Skeleton';
import EmptyState from '@/src/components/EmptyState';
import FilterChip from '@/src/components/FilterChip';
import Badge from '@/src/components/Badge';
import { MediaRow, type MediaLine } from '@/src/components/MediaCard';
import AppRefreshControl from '@/src/components/AppRefreshControl';
import type { Order } from '@/src/services/ecommerce';
import { formatCurrency } from '@/src/utils/formatters';
import { layout, spacing } from '@/constants/design';

const shortId = (id: string) => `#${id.slice(0, 8).toUpperCase()}`;

export default function ComprasScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const statusOf = useOrderStatus();
    const { orders, isLoading, loadMore, isLoadingMore } = usePurchases();
    const [filter, setFilter] = useState<PurchaseFilter>('all');

    const counts = useMemo(() => Object.fromEntries(PURCHASE_FILTERS.map((f) => [
        f.key, f.statuses ? orders.filter((o) => f.statuses!.includes(o.status as never)).length : orders.length,
    ])) as Record<PurchaseFilter, number>, [orders]);

    const visible = useMemo(() => {
        const statuses = PURCHASE_FILTERS.find((f) => f.key === filter)?.statuses;
        return statuses ? orders.filter((o) => statuses.includes(o.status as never)) : orders;
    }, [orders, filter]);

    const renderItem = ({ item }: { item: Order }) => {
        const status = statusOf(item.status);
        const first = item.items?.[0]?.product;
        const units = (item.items || []).reduce((acc, i) => acc + i.quantity, 0);
        const extra = (item.items?.length || 0) - 1;
        const title = first?.name ? (extra > 0 ? `${first.name} y ${extra} más` : first.name) : `Pedido ${shortId(item.id)}`;
        const date = new Date(item.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
        const lines: MediaLine[] = [
            { text: `${formatCurrency(item.total_amount)}${units > 0 ? ` · ${units} ${units === 1 ? 'pieza' : 'piezas'}` : ''}` },
            item.status === 'pending'
                ? { text: 'Toca para pagar o cancelar', icon: Clock, color: theme.warning }
                : { text: `${date} · ${shortId(item.id)}`, icon: CalendarDays },
        ];
        return (
            <MediaRow
                imageUrl={first?.image_url}
                fallbackIcon={Package}
                title={title}
                trailing={<Badge label={status.label} color={status.color} size="sm" />}
                lines={lines}
                onPress={() => router.push(`/tienda/pedido/${item.id}`)}
                accessibilityLabel={`${title}, ${status.label}, ${formatCurrency(item.total_amount)}`}
            />
        );
    };

    const header = orders.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll} contentContainerStyle={styles.chips}>
            {PURCHASE_FILTERS.map((f) => (
                <FilterChip
                    key={f.key}
                    label={f.label}
                    count={f.key === 'all' ? undefined : counts[f.key]}
                    active={filter === f.key}
                    onPress={() => setFilter(f.key)}
                />
            ))}
        </ScrollView>
    ) : null;

    return (
        <ScreenContainer>
            <ScreenHeader title="Mis compras" subtitle={orders.length > 0 ? 'Seguimiento de tus pedidos' : undefined} />

            {isLoading ? (
                <View style={styles.list}><SkeletonList count={5} inset={false} /></View>
            ) : (
                <FlashList
                    refreshControl={<AppRefreshControl />}
                    data={visible}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    ListHeaderComponent={header}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    contentContainerStyle={styles.list}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.4}
                    ListFooterComponent={isLoadingMore ? <ActivityIndicator color={theme.primary} style={styles.footerLoader} /> : null}
                    ListEmptyComponent={orders.length > 0 ? (
                        <EmptyState
                            icon={<SearchX size={layout.icon.xl} color={theme.textMuted} />}
                            title="Nada por aquí"
                            subtitle="No tienes compras con este estado."
                            actionLabel="Ver todas"
                            onAction={() => setFilter('all')}
                        />
                    ) : (
                        <EmptyState
                            icon={<ShoppingBag size={layout.icon.xl} color={theme.textMuted} strokeWidth={1.5} />}
                            title="Aún no has realizado compras"
                            subtitle="Cuando compres en Michi-Shop verás aquí tus pedidos y su seguimiento."
                            actionLabel="Ir a la tienda"
                            onAction={() => router.replace('/(tabs)/tienda-tab')}
                        />
                    )}
                />
            )}
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    list: { paddingHorizontal: layout.screenPadding, paddingBottom: spacing.huge },
    chipsScroll: { marginHorizontal: -layout.screenPadding, marginBottom: spacing.md },
    chips: { gap: spacing.sm, paddingHorizontal: layout.screenPadding, alignItems: 'center' },
    separator: { height: spacing.sm },
    footerLoader: { paddingVertical: spacing.lg },
});
