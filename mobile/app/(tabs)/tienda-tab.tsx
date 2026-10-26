import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Package,
  ShoppingBag,
  ArrowUpDown,
  LayoutGrid,
  List,
  SearchX,
  Heart,
  SlidersHorizontal,
  X,
  Check,
  MapPin,
  ChevronRight,
  Zap,
  CreditCard,
  ShieldCheck,
} from 'lucide-react-native';
import { haptic } from '@/src/utils/haptics';
import { useTheme } from '@/src/hooks/useTheme';
import { useShopTab, FAVORITES, SHOP_SORTS, type ShopViewMode, type ShopSort } from '@/src/hooks/ecommerce/useShopTab';
import { useGridCell } from '@/src/hooks/useViewMode';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import DataList from '@/src/components/data/DataList';
import SearchBar from '@/src/components/SearchBar';
import FilterChip from '@/src/components/FilterChip';
import OptionMenu from '@/src/components/OptionMenu';
import ViewModeToggle from '@/src/components/ViewModeToggle';
import BottomSheet from '@/src/components/BottomSheet';
import Button from '@/src/components/Button';
import { ProductGridCard, ProductListRow } from '@/src/features/tienda/ProductCard';
import CartBar, { CART_BAR_SPACE } from '@/src/features/tienda/CartBar';
import type { Product } from '@/src/types/ecommerce';
import { families, font, layout, radius, shadow, spacing, type } from '@/constants/design';

const VIEW_OPTIONS = [
  { value: 'grid' as const, label: 'Ver en cuadrícula', icon: LayoutGrid },
  { value: 'list' as const, label: 'Ver como lista', icon: List },
];
const GAP: Record<ShopViewMode, number> = { grid: spacing.md, list: spacing.sm };

export default function TiendaTabScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const shop = useShopTab();
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const isGrid = shop.viewMode === 'grid';
  const gap = GAP[shop.viewMode];
  const { columns, cellWidth } = useGridCell(gap);

  const activeFiltersCount = (shop.selectedCategory !== 'all' ? 1 : 0) + (shop.sort !== 'relevance' ? 1 : 0);
  const hasActiveFilters = shop.searchQuery.trim() !== '' || activeFiltersCount > 0;

  const handleResetFilters = () => {
    shop.clearFilters();
    shop.setSort('relevance');
  };

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
      {/* Barra de Búsqueda Compacta + Botón de Filtros con Badge */}
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <SearchBar
            value={shop.searchQuery}
            onChangeText={shop.setSearchQuery}
            placeholder="Buscar productos para tu michi..."
          />
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Abrir filtros de tienda"
          style={[
            styles.filterIconButton,
            {
              backgroundColor: activeFiltersCount > 0 ? theme.primary : theme.surface,
              borderColor: activeFiltersCount > 0 ? theme.primary : theme.border,
            },
          ]}
          onPress={() => {
            haptic.light();
            setIsFilterModalOpen(true);
          }}
        >
          <SlidersHorizontal
            size={19}
            color={activeFiltersCount > 0 ? theme.onPrimary : theme.text}
          />
          {activeFiltersCount > 0 && (
            <View style={[styles.filterBadge, { backgroundColor: theme.error }]}>
              <Text style={[styles.filterBadgeText, { color: '#FFFFFF' }]}>
                {activeFiltersCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Franja de Envío / Ubicación estilo Mercado Libre */}
      <View style={styles.locationStrip}>
        <MapPin size={13} color={theme.textMuted} />
        <Text style={[styles.locationText, { color: theme.textMuted }]}>
          Enviar a <Text style={{ color: theme.text, fontFamily: families.bold }}>México</Text>
        </Text>
        <ChevronRight size={13} color={theme.textMuted} />
      </View>

      {/* Carrusel de Beneficios Mercado Libre */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.promoScroll}
        contentContainerStyle={styles.promoContainer}
      >
        <View style={[styles.promoCard, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
          <View style={[styles.promoIconBox, { backgroundColor: theme.success + '18' }]}>
            <Zap size={15} color={theme.success} />
          </View>
          <View>
            <Text style={[styles.promoTitle, { color: theme.success }]}>Envío GRATIS</Text>
            <Text style={[styles.promoSubtitle, { color: theme.textMuted }]}>En pedidos desde $299</Text>
          </View>
        </View>

        <View style={[styles.promoCard, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
          <View style={[styles.promoIconBox, { backgroundColor: theme.primary + '18' }]}>
            <CreditCard size={15} color={theme.primary} />
          </View>
          <View>
            <Text style={[styles.promoTitle, { color: theme.text }]}>Hasta 12 MSI</Text>
            <Text style={[styles.promoSubtitle, { color: theme.textMuted }]}>En miles de productos</Text>
          </View>
        </View>

        <View style={[styles.promoCard, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
          <View style={[styles.promoIconBox, { backgroundColor: theme.secondary + '18' }]}>
            <ShieldCheck size={15} color={theme.secondary} />
          </View>
          <View>
            <Text style={[styles.promoTitle, { color: theme.text }]}>Compra Protegida</Text>
            <Text style={[styles.promoSubtitle, { color: theme.textMuted }]}>Garantía Michicondrias</Text>
          </View>
        </View>
      </ScrollView>

      {/* Categorías Circulares estilo Mercado Libre */}
      <View style={styles.circleCategoriesWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.circleScroll}
          contentContainerStyle={styles.circleContainer}
        >
          {shop.categories.map((cat) => {
            const active = shop.selectedCategory === cat.id;
            const Icon = cat.icon;
            return (
              <TouchableOpacity
                key={cat.id}
                style={styles.circleCategoryItem}
                onPress={() => {
                  haptic.selection();
                  shop.setSelectedCategory(active && cat.id !== 'all' ? 'all' : cat.id);
                }}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.circleIconBox,
                    {
                      backgroundColor: active ? theme.primary : theme.surface,
                      borderColor: active ? theme.primary : theme.borderLight,
                    },
                  ]}
                >
                  <Icon size={19} color={active ? theme.onPrimary : cat.color || theme.text} />
                </View>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.circleCategoryLabel,
                    {
                      color: active ? theme.primary : theme.textMuted,
                      fontFamily: active ? families.bold : families.medium,
                    },
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Barra de Herramientas: Resultados, Filtros activos y Vista */}
      <View style={styles.toolbar}>
        <Text style={[type.caption, styles.count, { color: theme.textMuted }]}>
          {shop.isLoading || shop.isUpdating
            ? 'Buscando…'
            : `${shop.hasMore ? 'Más de ' : ''}${shop.products.length} ${shop.products.length === 1 ? 'producto' : 'productos'}`}
        </Text>
        {hasActiveFilters && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Limpiar filtros"
            style={[styles.clearPill, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={handleResetFilters}
          >
            <X size={12} color={theme.textMuted} />
            <Text style={[styles.clearPillText, { color: theme.textMuted }]}>Limpiar</Text>
          </TouchableOpacity>
        )}
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
        onEmptyAction: handleResetFilters,
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

      {/* Modal Premium Homologado para Tienda */}
      <BottomSheet
        visible={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Filtros de Michi-Shop"
      >
        <View style={styles.modalContent}>
          <View style={styles.modalSubHeader}>
            <Text style={[styles.modalSubTitle, { color: theme.textMuted }]}>
              Organiza productos por categoría y orden de precios
            </Text>
            {activeFiltersCount > 0 && (
              <TouchableOpacity onPress={handleResetFilters} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={[styles.modalResetText, { color: theme.primary }]}>Limpiar todo</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Categoría */}
          <View style={styles.filterSectionGroup}>
            <Text style={[styles.filterGroupTitle, { color: theme.text }]}>Categoría</Text>
            <View style={styles.optionsGrid}>
              {shop.categories.map((cat) => {
                const isSelected = shop.selectedCategory === cat.id;
                const IconComp = cat.icon;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.optionCard,
                      {
                        backgroundColor: isSelected ? theme.primary + '10' : theme.surface,
                        borderColor: isSelected ? theme.primary : theme.border,
                      },
                    ]}
                    onPress={() => shop.setSelectedCategory(cat.id)}
                  >
                    <View style={[styles.optionIconBox, { backgroundColor: isSelected ? theme.primary + '20' : theme.background }]}>
                      <IconComp size={18} color={isSelected ? theme.primary : cat.color} />
                    </View>
                    <Text style={[styles.optionCardText, { color: isSelected ? theme.primary : theme.text, fontFamily: isSelected ? families.bold : families.medium }]}>
                      {cat.label}
                    </Text>
                    <View style={[styles.radioIndicator, { borderColor: isSelected ? theme.primary : theme.border }]}>
                      {isSelected && <View style={[styles.radioDot, { backgroundColor: theme.primary }]} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Ordenar por */}
          <View style={styles.filterSectionGroup}>
            <Text style={[styles.filterGroupTitle, { color: theme.text }]}>Ordenar por</Text>
            <View style={styles.optionsGrid}>
              {SHOP_SORTS.map((s) => {
                const isSelected = shop.sort === s.value;
                return (
                  <TouchableOpacity
                    key={s.value}
                    style={[
                      styles.optionCard,
                      {
                        backgroundColor: isSelected ? theme.primary + '10' : theme.surface,
                        borderColor: isSelected ? theme.primary : theme.border,
                      },
                    ]}
                    onPress={() => shop.setSort(s.value)}
                  >
                    <Text style={[styles.optionCardText, { color: isSelected ? theme.primary : theme.text, fontFamily: isSelected ? families.bold : families.medium }]}>
                      {s.label}
                    </Text>
                    <View style={[styles.radioIndicator, { borderColor: isSelected ? theme.primary : theme.border }]}>
                      {isSelected && <View style={[styles.radioDot, { backgroundColor: theme.primary }]} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Footer */}
          <View style={styles.modalFooter}>
            <Button
              label="Restablecer"
              variant="secondary"
              onPress={handleResetFilters}
              style={styles.footerBtnHalf}
            />
            <Button
              label={`Ver ${shop.products.length} ${shop.products.length === 1 ? 'producto' : 'productos'}`}
              variant="primary"
              onPress={() => setIsFilterModalOpen(false)}
              style={styles.footerBtnHalf}
            />
          </View>
        </View>
      </BottomSheet>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.xs, marginBottom: spacing.sm },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchContainer: {
    flex: 1,
  },
  filterIconButton: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    fontSize: 10,
    fontFamily: families.bold,
  },
  locationStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  locationText: {
    fontSize: 12,
    fontFamily: families.regular,
  },
  promoScroll: {
    marginHorizontal: -layout.screenPadding,
    marginTop: 2,
  },
  promoContainer: {
    paddingHorizontal: layout.screenPadding,
    gap: spacing.sm,
  },
  promoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    minWidth: 170,
  },
  promoIconBox: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoTitle: {
    fontSize: 11,
    fontFamily: families.bold,
  },
  promoSubtitle: {
    fontSize: 10,
    fontFamily: families.regular,
  },
  circleCategoriesWrapper: {
    marginTop: spacing.xs,
  },
  circleScroll: {
    marginHorizontal: -layout.screenPadding,
  },
  circleContainer: {
    paddingHorizontal: layout.screenPadding,
    gap: spacing.md,
    paddingVertical: 4,
  },
  circleCategoryItem: {
    alignItems: 'center',
    gap: 5,
    width: 58,
  },
  circleIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    ...shadow.card,
  },
  circleCategoryLabel: {
    fontSize: 10,
    textAlign: 'center',
  },
  quickFiltersWrapper: {
    marginTop: spacing.xs,
  },
  chipsScroll: { marginHorizontal: -layout.screenPadding },
  chips: { gap: spacing.xs, paddingHorizontal: layout.screenPadding, alignItems: 'center' },
  clearPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  clearPillText: {
    fontSize: font.xs,
    fontFamily: families.medium,
  },
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
  count: { flex: 1, fontFamily: families.bold },
  footerLoader: { paddingVertical: spacing.lg },

  // Modal
  modalContent: {
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  modalSubHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalSubTitle: {
    fontSize: font.xs,
    flex: 1,
    marginRight: spacing.sm,
  },
  modalResetText: {
    fontSize: font.xs,
    fontFamily: families.bold,
  },
  filterSectionGroup: {
    gap: spacing.xs,
  },
  filterGroupTitle: {
    fontSize: 13,
    fontFamily: families.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  optionsGrid: {
    gap: spacing.xs,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm + 2,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  optionIconBox: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionCardText: {
    fontSize: font.sm,
    flex: 1,
  },
  radioIndicator: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  footerBtnHalf: {
    flex: 1,
  },
});
