import React from 'react';
import { StyleSheet, ScrollView, View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Package, ShoppingBag, ArrowUpDown, LayoutGrid, List, SearchX, Heart } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useShopTab, FAVORITES, SHOP_SORTS, type ShopViewMode } from '@/src/hooks/ecommerce/useShopTab';
import { useGridCell } from '@/src/hooks/useViewMode';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import DataList from '@/src/components/data/DataList';
import SearchBar from '@/src/components/SearchBar';
import FilterChip from '@/src/components/FilterChip';
import OptionMenu from '@/src/components/OptionMenu';
import ViewModeToggle from '@/src/components/ViewModeToggle';
import { ProductGridCard, ProductListRow } from '@/src/features/tienda/ProductCard';
import CartBar, { CART_BAR_SPACE } from '@/src/features/tienda/CartBar';
import type { Product } from '@/src/types/ecommerce';
import { families, layout, spacing, type } from '@/constants/design';

const VIEW_OPTIONS = [
  { value: 'grid' as const, label: 'Ver en cuadrícula', icon: LayoutGrid },
  { value: 'list' as const, label: 'Ver como lista', icon: List },
];
const GAP: Record<ShopViewMode, number> = { grid: spacing.md, list: spacing.sm };

export default function TiendaTabScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const shop = useShopTab();
  const isGrid = shop.viewMode === 'grid';
  const gap = GAP[shop.viewMode];
  const { columns, cellWidth } = useGridCell(gap);

  const renderItem = ({ item }: { item: Product }) => {
    const props = {
      product: item,
      onPress: () => router.push(`/tienda/producto/${item.id}`),
      onQuickAdd: shop.canBuy(item) ? () => shop.quickAdd(item) : undefined,
      isFavorite: shop.isFavorite(item.id),
      onToggleFavorite: () => shop.toggleFavorite(item.id),
    };
    return isGrid ? <ProductGridCard {...props} width={cellWidth} /> : <ProductListRow {...props} />;
  };

  const header = (
    <View style={styles.header}>
      <SearchBar value={shop.searchQuery} onChangeText={shop.setSearchQuery} placeholder="Buscar productos para tu michi..." />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsScroll}
        contentContainerStyle={styles.chips}
      >
        {shop.categories.map((cat) => {
          const active = shop.selectedCategory === cat.id;
          const Icon = cat.icon;
          return (
            <FilterChip
              key={cat.id}
              label={cat.label}
              active={active}
              onPress={() => shop.setSelectedCategory(active && cat.id !== 'all' ? 'all' : cat.id)}
              icon={<Icon size={layout.icon.xs} color={active ? theme.onPrimary : cat.color} />}
            />
          );
        })}
      </ScrollView>

      <View style={styles.toolbar}>
        <Text style={[type.caption, styles.count, { color: theme.textMuted }]}>
          {shop.isLoading || shop.isUpdating
            ? 'Buscando…'
            : `${shop.hasMore ? 'Más de ' : ''}${shop.products.length} ${shop.products.length === 1 ? 'producto' : 'productos'}`}
        </Text>
        <OptionMenu icon={ArrowUpDown} title="Ordenar por" value={shop.sort} onChange={shop.setSort} options={SHOP_SORTS} />
        <ViewModeToggle value={shop.viewMode} onChange={shop.setViewMode} options={VIEW_OPTIONS} />
      </View>
    </View>
  );

  const emptyProps = shop.selectedCategory === FAVORITES
    ? {
      emptyIcon: <Heart size={layout.icon.xl} color={theme.textMuted} />,
      emptyTitle: 'Sin favoritos aquí',
      emptySubtitle: 'Toca el corazón de un producto para guardarlo.',
    }
    : shop.hasFilters
      ? {
        emptyIcon: <SearchX size={layout.icon.xl} color={theme.textMuted} />,
        emptyTitle: 'Sin resultados',
        emptySubtitle: shop.searchQuery.trim()
          ? `No encontramos "${shop.searchQuery.trim()}". Prueba con otra palabra u otra categoría.`
          : 'Esta categoría todavía no tiene productos.',
        emptyActionLabel: 'Quitar filtros',
        onEmptyAction: shop.clearFilters,
      }
      : {
        emptyIcon: <ShoppingBag size={layout.icon.xl} color={theme.textMuted} />,
        emptyTitle: 'Aún no hay productos',
        emptySubtitle: 'Los vendedores están publicando sus productos. Vuelve pronto.',
      };

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Michi-Shop"
        subtitle="Todo para tu mejor amigo"
        showBack={false}
        actions={[
          { icon: Package, label: 'Mis compras', onPress: () => router.push('/tienda/compras') },
          {
            icon: ShoppingBag,
            label: `Abrir bolsa, ${shop.cartCount} ${shop.cartCount === 1 ? 'artículo' : 'artículos'}`,
            onPress: () => router.push('/tienda/carrito'),
            badge: shop.cartCount,
          },
        ]}
      />

      <DataList
        // Cambiar el número de columnas exige volver a montar la lista
        key={isGrid ? `grid-${columns}` : 'list'}
        data={shop.products}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={isGrid ? columns : 1}
        columnWrapperStyle={isGrid ? { gap } : undefined}
        ItemSeparatorComponent={() => <View style={{ height: gap }} />}
        header={header}
        isLoading={shop.isLoading}
        skeleton
        skeletonVariant={isGrid ? 'grid' : 'list'}
        onRefresh={shop.refetch}
        isRefreshing={shop.isRefetching}
        keyboardShouldPersistTaps="handled"
        onEndReached={shop.loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={shop.isLoadingMore ? <ActivityIndicator color={theme.primary} style={styles.footerLoader} /> : null}
        contentStyle={{ paddingBottom: CART_BAR_SPACE + spacing.lg }}
        {...emptyProps}
      />

      <CartBar />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.md, marginBottom: spacing.md },
  // Los chips llegan de orilla a orilla
  chipsScroll: { marginHorizontal: -layout.screenPadding },
  chips: { gap: spacing.sm, paddingHorizontal: layout.screenPadding, alignItems: 'center' },
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  count: { flex: 1, fontFamily: families.bold },
  footerLoader: { paddingVertical: spacing.lg },
});
