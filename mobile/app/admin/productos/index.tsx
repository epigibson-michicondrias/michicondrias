/**
 * Productos (admin) — catálogo completo incluidos los ocultos del vendedor.
 * Filtros por estado, badges de estado y acciones reales: mostrar/ocultar y aprobar/rechazar.
 */
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useAdminProducts, type Product, type ProductFilter } from '@/src/hooks/admin/useAdminProducts';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import DataList from '@/src/components/data/DataList';
import SearchBar from '@/src/components/SearchBar';
import FilterChip from '@/src/components/FilterChip';
import Badge from '@/src/components/Badge';
import EmptyState from '@/src/components/EmptyState';
import { Eye, EyeOff, Check, X, ShoppingCart, PackageSearch } from 'lucide-react-native';
import { layout, spacing, radius, type, shadow, tint } from '@/constants/design';

const FILTERS: { key: ProductFilter; label: string }[] = [
    { key: 'all', label: 'Todos' },
    { key: 'published', label: 'Publicados' },
    { key: 'review', label: 'En revisión' },
    { key: 'hidden', label: 'Ocultos' },
    { key: 'out', label: 'Agotados' },
];

function statusOf(p: Product): { label: string; color: string } {
    if (p.is_approved === false) return { label: 'En revisión', color: 'warning' };
    if (p.is_active === false) return { label: 'Oculto', color: 'neutral' };
    return { label: 'Publicado', color: 'success' };
}

export default function AdminProductosScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const {
        products, total, count, isLoading, isFetching, refetch,
        searchText, setSearchText, filter, setFilter, filtering, clearFilters,
        toggleVisibility, approve, reject, busyId,
    } = useAdminProducts();

    const renderItem = ({ item }: { item: Product }) => {
        const status = statusOf(item);
        const isPending = item.is_approved === false;
        const isActive = item.is_active !== false;
        const busy = busyId === item.id;
        return (
            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
                <Image
                    source={item.image_url ? { uri: item.image_url } : undefined}
                    style={[styles.productImg, { backgroundColor: theme.primary + tint.faint }]}
                    contentFit="cover"
                    accessibilityLabel={item.name}
                />
                <View style={styles.productInfo}>
                    <View style={styles.topRow}>
                        <Text style={[type.bodyStrong, styles.productName, { color: theme.text }]} numberOfLines={2}>{item.name}</Text>
                        <Badge label={status.label} color={status.color} size="sm" />
                    </View>

                    <View style={styles.metaRow}>
                        <Text style={[type.bodyStrong, { color: theme.primary }]}>${item.price.toFixed(2)}</Text>
                        <Text style={[type.caption, { color: item.stock > 0 ? theme.textMuted : theme.error }]}>
                            {item.stock > 0 ? `${item.stock} en stock` : 'Agotado'}
                        </Text>
                    </View>

                    <View style={styles.actions}>
                        {isPending ? (
                            <>
                                <TouchableOpacity
                                    accessibilityRole="button"
                                    accessibilityLabel={`Aprobar ${item.name}`}
                                    style={[styles.actionBtn, { backgroundColor: theme.success, opacity: busy ? 0.6 : 1 }]}
                                    onPress={() => approve(item)}
                                    disabled={busy}
                                >
                                    <Check size={layout.icon.sm} color={theme.onPrimary} />
                                    <Text style={[type.labelSentence, { color: theme.onPrimary, fontWeight: '700' }]}>Aprobar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    accessibilityRole="button"
                                    accessibilityLabel={`Rechazar ${item.name}`}
                                    style={[styles.actionBtn, { backgroundColor: theme.error, opacity: busy ? 0.6 : 1 }]}
                                    onPress={() => reject(item)}
                                    disabled={busy}
                                >
                                    <X size={layout.icon.sm} color={theme.onPrimary} />
                                    <Text style={[type.labelSentence, { color: theme.onPrimary, fontWeight: '700' }]}>Rechazar</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <TouchableOpacity
                                accessibilityRole="button"
                                accessibilityLabel={isActive ? `Ocultar ${item.name}` : `Mostrar ${item.name}`}
                                style={[styles.actionBtn, { backgroundColor: theme.backgroundSecondary, opacity: busy ? 0.6 : 1 }]}
                                onPress={() => toggleVisibility(item)}
                                disabled={busy}
                            >
                                {isActive ? <EyeOff size={layout.icon.sm} color={theme.text} /> : <Eye size={layout.icon.sm} color={theme.text} />}
                                <Text style={[type.labelSentence, { color: theme.text, fontWeight: '700' }]}>{isActive ? 'Ocultar' : 'Mostrar'}</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            accessibilityRole="button"
                            accessibilityLabel={`Ver ${item.name}`}
                            style={[styles.actionBtn, { backgroundColor: theme.primary, opacity: busy ? 0.6 : 1 }]}
                            onPress={() => router.push(`/tienda/producto/${item.id}` as any)}
                            disabled={busy}
                        >
                            <Text style={[type.labelSentence, { color: theme.onPrimary, fontWeight: '700' }]}>Ver</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    const ListHeader = (
        <View style={styles.header}>
            <SearchBar value={searchText} onChangeText={setSearchText} placeholder="Buscar producto…" />
            <View style={styles.chips}>
                {FILTERS.map((f) => (
                    <FilterChip
                        key={f.key}
                        label={`${f.label} · ${count(f.key)}`}
                        active={filter === f.key}
                        onPress={() => setFilter(f.key)}
                    />
                ))}
            </View>
        </View>
    );

    return (
        <ScreenContainer>
            <ScreenHeader title="Productos" subtitle={`${total} en el catálogo`} />

            <DataList
                data={products}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                isLoading={isLoading}
                loadingMessage="Cargando productos…"
                onRefresh={() => refetch()}
                isRefreshing={isFetching}
                emptyIcon={filtering ? <PackageSearch size={layout.icon.xl} color={theme.textMuted} /> : <ShoppingCart size={layout.icon.xl} color={theme.textMuted} />}
                emptyTitle={filtering ? 'Sin resultados' : 'No hay productos'}
                emptySubtitle={filtering ? 'Prueba con otro filtro o término de búsqueda.' : 'Cuando los vendedores publiquen productos aparecerán aquí.'}
                emptyActionLabel={filtering ? 'Limpiar filtros' : undefined}
                onEmptyAction={filtering ? clearFilters : undefined}
                contentStyle={styles.list}
                header={ListHeader}
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: layout.screenPadding,
        paddingVertical: spacing.md,
        gap: spacing.md,
    },
    chips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    list: {
        paddingHorizontal: layout.screenPadding,
        paddingBottom: spacing.huge,
        paddingTop: spacing.sm,
        gap: spacing.md,
    },
    card: {
        flexDirection: 'row',
        padding: spacing.lg,
        borderRadius: radius.xl,
        borderWidth: 1,
        gap: spacing.lg,
        ...shadow.card,
    },
    productImg: {
        width: 96,
        height: 96,
        borderRadius: radius.lg,
    },
    productInfo: {
        flex: 1,
        justifyContent: 'space-between',
        gap: spacing.sm,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: spacing.sm,
    },
    productName: {
        flex: 1,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    actions: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        minHeight: layout.minTouch,
        borderRadius: radius.md,
    },
});
