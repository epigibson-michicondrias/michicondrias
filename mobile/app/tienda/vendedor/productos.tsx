import React from 'react';
import { StyleSheet, View, FlatList, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Trash2, Eye, EyeOff, Package, SearchX, Star } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useSellerProducts, CATALOG_FILTERS } from '@/src/hooks/ecommerce/useSellerProducts';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import EmptyState from '@/src/components/EmptyState';
import SearchBar from '@/src/components/SearchBar';
import FilterChip from '@/src/components/FilterChip';
import IconButton from '@/src/components/IconButton';
import Badge from '@/src/components/Badge';
import { SkeletonList } from '@/src/components/Skeleton';
import { MediaRow } from '@/src/components/MediaCard';
import AppRefreshControl from '@/src/components/AppRefreshControl';
import type { Product } from '@/src/services/ecommerce';
import { formatCurrency } from '@/src/utils/formatters';
import { layout, spacing } from '@/constants/design';
import { LOW_STOCK } from '@/src/features/tienda/ProductCard';

export default function VendedorProductosScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const c = useSellerProducts();
    const goNew = () => router.push('/tienda/vendedor/productos/nuevo');

    const statusBadge = (p: Product) => {
        if (p.is_approved === false) return <Badge label="En revisión" color={theme.info} size="sm" />;
        if (!p.is_active) return <Badge label="Oculto" color={theme.textMuted} size="sm" />;
        if (p.stock <= 0) return <Badge label="Agotado" color={theme.error} size="sm" />;
        if (p.stock <= LOW_STOCK) return <Badge label={`Quedan ${p.stock}`} color={theme.warning} size="sm" />;
        return null;
    };

    const renderItem = ({ item }: { item: Product }) => (
        <MediaRow
            imageUrl={item.image_url}
            fallbackIcon={Package}
            title={item.name}
            trailing={statusBadge(item)}
            lines={[
                { text: `${formatCurrency(item.price)} · ${item.stock} en existencia` },
                ...(item.review_count > 0 ? [{ text: `${item.average_rating.toFixed(1)} · ${item.review_count} ${item.review_count === 1 ? 'opinión' : 'opiniones'}`, icon: Star }] : []),
            ]}
            onPress={() => router.push(`/tienda/vendedor/productos/${item.id}`)}
            accessibilityLabel={`Editar ${item.name}`}
            actions={
                <>
                    <IconButton
                        icon={item.is_active ? Eye : EyeOff}
                        accessibilityLabel={item.is_active ? `Ocultar ${item.name} de la tienda` : `Publicar ${item.name} en la tienda`}
                        onPress={() => c.toggleProductStatus(item.id, item.is_active)}
                        loading={c.togglingId === item.id}
                        color={item.is_active ? theme.primary : theme.textMuted}
                        size="sm"
                    />
                    <IconButton
                        icon={Trash2}
                        accessibilityLabel={`Eliminar ${item.name}`}
                        onPress={() => c.handleDelete(item.id)}
                        color={theme.error}
                        size="sm"
                    />
                </>
            }
        />
    );

    const header = c.products.length > 0 ? (
        <View style={styles.header}>
            <SearchBar value={c.searchQuery} onChangeText={c.setSearchQuery} placeholder="Buscar en tu catálogo..." />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll} contentContainerStyle={styles.chips}>
                {CATALOG_FILTERS.filter((f) => f.key === 'todos' || c.counts[f.key] > 0).map((f) => (
                    <FilterChip
                        key={f.key}
                        label={f.label}
                        count={f.key === 'todos' ? undefined : c.counts[f.key]}
                        active={c.filter === f.key}
                        onPress={() => c.setFilter(f.key)}
                    />
                ))}
            </ScrollView>
        </View>
    ) : null;

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Mi catálogo"
                subtitle={`${c.products.length} ${c.products.length === 1 ? 'producto' : 'productos'}`}
                actions={[{ icon: Plus, label: 'Publicar producto', onPress: goNew }]}
            />

            {c.isLoading ? (
                <View style={styles.list}><SkeletonList count={5} inset={false} /></View>
            ) : (
                <FlatList
                    refreshControl={<AppRefreshControl />}
                    data={c.filteredProducts}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    ListHeaderComponent={header}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    contentContainerStyle={styles.list}
                    keyboardShouldPersistTaps="handled"
                    ListEmptyComponent={c.products.length > 0 ? (
                        <EmptyState
                            icon={<SearchX size={layout.icon.xl} color={theme.textMuted} />}
                            title="Sin resultados"
                            subtitle="Ningún producto coincide con la búsqueda o el filtro."
                            actionLabel="Ver todos"
                            onAction={() => { c.setFilter('todos'); c.setSearchQuery(''); }}
                        />
                    ) : (
                        <EmptyState
                            icon={<Package size={layout.icon.xl} color={theme.textMuted} strokeWidth={1.5} />}
                            title="Aún no tienes productos"
                            subtitle="Publica tu primer producto con foto, precio y existencias. Un admin lo revisa antes de mostrarlo en la tienda."
                            actionLabel="Publicar producto"
                            onAction={goNew}
                        />
                    )}
                />
            )}
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    list: { paddingHorizontal: layout.screenPadding, paddingBottom: spacing.huge },
    header: { gap: spacing.md, marginBottom: spacing.md },
    chipsScroll: { marginHorizontal: -layout.screenPadding },
    chips: { gap: spacing.sm, paddingHorizontal: layout.screenPadding, alignItems: 'center' },
    separator: { height: spacing.sm },
});
