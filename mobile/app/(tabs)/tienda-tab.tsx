import React from 'react';
import {
  StyleSheet, ScrollView, TouchableOpacity, View, Text,
  StatusBar, Image, TextInput, Dimensions
} from 'react-native';
import KeyboardScreen from '../../src/components/KeyboardScreen';
import { useTheme } from '@/src/hooks/useTheme';
import { useShopTab } from '@/src/hooks/ecommerce/useShopTab';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ShoppingBag, Search, ShoppingCart, Package, CreditCard,
  ChevronRight, Star, Heart, Tag, Sparkles, TrendingUp,
  Filter, ArrowRight, X
} from 'lucide-react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = Math.floor((width - 61) / 2);

export default function TiendaTabScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const {
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    products,
    isLoading,
    isVendedor,
    categories,
    handleSearch,
    totalProducts,
    showAll,
    setShowAll,
    cartCount,
    router,
  } = useShopTab();
  const isSearching = searchQuery.trim().length > 0;
  const visibleProducts = showAll || isSearching ? products : products.slice(0, 6);

  return (
    <ScreenContainer>
      <StatusBar barStyle="light-content" />

      <KeyboardScreen contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <LinearGradient
          colors={['#1c2f6b', '#101c3d', theme.background]}
          style={[styles.header, { paddingTop: insets.top + 16 }]}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerLabel}>MICHICONDRIAS</Text>
              <Text style={styles.headerTitle}>Michi-Shop</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.headerBtn}
                onPress={() => router.push('/tienda/carrito' as any)}
                accessibilityRole="button"
                accessibilityLabel={`Abrir bolsa, ${cartCount} artículos`}
              >
                <ShoppingCart size={22} color="#fff" />
                {cartCount > 0 ? (
                  <View style={[styles.cartBadge, { backgroundColor: theme.error }]}>
                    <Text style={styles.cartBadgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Search size={18} color="rgba(255,255,255,0.6)" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar productos para tu michi..."
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              accessibilityLabel="Buscar productos"
            />
            {isSearching ? (
              <TouchableOpacity
                style={styles.filterBtn}
                onPress={() => setSearchQuery('')}
                accessibilityRole="button"
                accessibilityLabel="Borrar búsqueda"
              >
                <X size={16} color="#fff" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.filterBtn}
                onPress={() => router.push('/tienda/categorias' as any)}
                accessibilityRole="button"
                accessibilityLabel="Ver categorías"
              >
                <Filter size={16} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickAction, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => router.push('/tienda/categorias' as any)}
          >
            <View style={[styles.quickIconBox, { backgroundColor: theme.secondaryLight }]}>
              <ShoppingBag size={20} color={theme.secondary} />
            </View>
            <Text style={[styles.quickLabel, { color: theme.text }]}>Categor{'\u00ed'}as</Text>
            <ChevronRight size={14} color={theme.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickAction, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => router.push('/tienda/compras' as any)}
          >
            <View style={[styles.quickIconBox, { backgroundColor: theme.accentLight }]}>
              <CreditCard size={20} color={theme.accent} />
            </View>
            <Text style={[styles.quickLabel, { color: theme.text }]}>Mis Compras</Text>
            <ChevronRight size={14} color={theme.textMuted} />
          </TouchableOpacity>

          {isVendedor && (
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => router.push('/tienda/vendedor' as any)}
            >
              <View style={[styles.quickIconBox, { backgroundColor: theme.successLight }]}>
                <TrendingUp size={20} color={theme.success} />
              </View>
              <Text style={[styles.quickLabel, { color: theme.text }]}>Mi Tienda</Text>
              <ChevronRight size={14} color={theme.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Categor{'\u00ed'}as</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesList}>
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              const Icon = cat.icon;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    isActive
                      ? { backgroundColor: theme.primary }
                      : { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                  accessibilityLabel={`Categoría ${cat.label}`}
                >
                  <Icon size={16} color={isActive ? '#fff' : cat.color} />
                  <Text style={[
                    styles.categoryLabel,
                    { color: isActive ? '#fff' : theme.text }
                  ]}>{cat.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Products Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, styles.sectionTitleInline, { color: theme.text }]}>
              {isSearching ? `Resultados (${products.length})` : showAll ? 'Todos los productos' : 'Productos destacados'}
            </Text>
            {!isSearching && totalProducts > 6 ? (
              <TouchableOpacity onPress={() => setShowAll(!showAll)} style={styles.seeAllBtn} accessibilityRole="button">
                <Text style={[styles.seeAllText, { color: theme.primary }]}>{showAll ? 'Ver menos' : 'Ver todos'}</Text>
                <ArrowRight size={14} color={theme.primary} />
              </TouchableOpacity>
            ) : null}
          </View>

          {isLoading ? (
            <View style={styles.loadingGrid}>
              {[1, 2, 3, 4].map((i) => (
                <View key={i} style={[styles.productSkeleton, { backgroundColor: theme.surface }]} />
              ))}
            </View>
          ) : products.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: theme.surface }]}>
              <ShoppingBag size={48} color={theme.textMuted} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                {isSearching ? 'Sin resultados' : 'Aún no hay productos aquí'}
              </Text>
              <Text style={[styles.emptyDesc, { color: theme.textMuted }]}>
                {isSearching
                  ? `No encontramos "${searchQuery.trim()}". Prueba con otra palabra o revisa las categorías.`
                  : selectedCategory === 'all'
                    ? 'Los vendedores están publicando sus productos. Vuelve pronto.'
                    : 'Esta categoría todavía no tiene productos.'}
              </Text>
            </View>
          ) : (
            <View style={styles.productsGrid}>
              {visibleProducts.map((product: any) => (
                <TouchableOpacity
                  key={product.id}
                  style={[styles.productCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                  onPress={() => router.push(`/tienda/producto/${product.id}` as any)}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={`${product.name}, $${product.price?.toFixed(2)}`}
                >
                  <View style={styles.productImageContainer}>
                    {product.image_url ? (
                      <Image source={{ uri: product.image_url }} style={styles.productImage} />
                    ) : (
                      <View style={[styles.productImagePlaceholder, { backgroundColor: theme.backgroundSecondary }]}>
                        <Package size={32} color={theme.textMuted} />
                      </View>
                    )}
                    {product.stock <= 0 && (
                      <View style={[styles.discountBadge, { backgroundColor: theme.error }]}>
                        <Text style={styles.discountText}>Agotado</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.productInfo}>
                    <Text style={[styles.productName, { color: theme.text }]} numberOfLines={2}>{product.name}</Text>
                    <Text style={[styles.productPrice, { color: theme.primary }]}>
                      ${product.price?.toFixed(2) || '0.00'}
                    </Text>
                    {product.review_count > 0 && (
                      <View style={styles.ratingRow}>
                        <Star size={12} color={theme.accent} fill={theme.accent} />
                        <Text style={[styles.ratingText, { color: theme.textMuted }]}>
                          {Number(product.average_rating).toFixed(1)} ({product.review_count})
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

      </KeyboardScreen>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  filterBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActions: {
    paddingHorizontal: 24,
    gap: 10,
    marginTop: -16,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 22,
    borderWidth: 1,
    gap: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  quickIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
  },
  section: {
    marginTop: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitleInline: {
    marginBottom: 0,
    paddingHorizontal: 0,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '700',
  },
  categoriesList: {
    paddingHorizontal: 24,
    gap: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    gap: 8,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '800',
  },
  loadingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    gap: 12,
  },
  productSkeleton: {
    width: CARD_WIDTH,
    height: 200,
    borderRadius: 24,
  },
  emptyState: {
    marginHorizontal: 24,
    padding: 40,
    borderRadius: 28,
    alignItems: 'center',
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  emptyDesc: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    gap: 12,
  },
  productCard: {
    width: CARD_WIDTH,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  productImageContainer: {
    width: '100%',
    height: 130,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
  },
  productInfo: {
    padding: 12,
    gap: 4,
  },
  productName: {
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '900',
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
  },
  promoSection: {
    paddingHorizontal: 24,
    marginTop: 28,
  },
  promoBanner: {
    height: 120,
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#101c3d',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  promoGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  promoContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    justifyContent: 'space-between',
  },
  promoTextCol: { flex: 1 },
  promoTag: {
    fontSize: 9,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
  },
  promoTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    marginTop: 4,
  },
  promoDesc: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
});
