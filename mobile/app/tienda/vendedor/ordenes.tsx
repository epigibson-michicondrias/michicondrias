import React from 'react';
import { StyleSheet, View, FlatList, ScrollView } from 'react-native';
import { Package, SearchX } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useAuth } from '@/src/contexts/AuthContext';
import { useSellerOrders, SELLER_ORDER_FILTERS } from '@/src/hooks/ecommerce/useSellerOrders';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import EmptyState from '@/src/components/EmptyState';
import FilterChip from '@/src/components/FilterChip';
import { SkeletonList } from '@/src/components/Skeleton';
import AppRefreshControl from '@/src/components/AppRefreshControl';
import SellerOrderCard from '@/src/features/tienda/SellerOrderCard';
import type { Order } from '@/src/services/ecommerce';
import { layout, spacing } from '@/constants/design';

export default function VendedorOrdenesScreen() {
    const { theme } = useTheme();
    const { user } = useAuth();
    const { orders, filteredOrders, countFor, isLoading, isUpdating, updatingId, filter, setFilter, updateStatus } = useSellerOrders();

    const renderItem = ({ item }: { item: Order }) => (
        <SellerOrderCard
            order={item}
            sellerId={user?.id}
            onAdvance={(status) => updateStatus(item.id, status)}
            updating={updatingId === item.id}
            disabled={isUpdating}
        />
    );

    const header = orders.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll} contentContainerStyle={styles.chips}>
            {SELLER_ORDER_FILTERS.map((f) => {
                const count = countFor(f.key);
                if (f.key !== 'all' && count === 0 && filter !== f.key) return null;
                return (
                    <FilterChip
                        key={f.key}
                        label={f.label}
                        count={f.key === 'all' ? undefined : count}
                        active={filter === f.key}
                        onPress={() => setFilter(f.key)}
                    />
                );
            })}
        </ScrollView>
    ) : null;

    return (
        <ScreenContainer>
            <ScreenHeader title="Pedidos" subtitle={`${orders.length} ${orders.length === 1 ? 'pedido' : 'pedidos'}`} />

            {isLoading ? (
                <View style={styles.list}><SkeletonList count={4} inset={false} /></View>
            ) : (
                <FlatList
                    refreshControl={<AppRefreshControl />}
                    data={filteredOrders}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    ListHeaderComponent={header}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={orders.length === 0 ? (
                        <EmptyState
                            icon={<Package size={layout.icon.xl} color={theme.textMuted} strokeWidth={1.5} />}
                            title="Aún no tienes pedidos"
                            subtitle="Cuando alguien compre uno de tus productos aparecerá aquí."
                        />
                    ) : (
                        <EmptyState
                            icon={<SearchX size={layout.icon.xl} color={theme.textMuted} />}
                            title="Nada en este filtro"
                            subtitle="No tienes pedidos con este estado."
                            actionLabel="Ver todos"
                            onAction={() => setFilter('all')}
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
    separator: { height: spacing.md },
});
