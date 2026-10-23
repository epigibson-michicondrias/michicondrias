/**
 * useShopTab — Pestaña Tienda: catálogo con categorías, favoritos, búsqueda, orden y forma de ver.
 * Búsqueda, orden y paginación los hace el backend (`GET /products/?q=&sort=&skip=&limit=`).
 */
import { useState, useEffect, useMemo } from 'react';
import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/src/contexts/AuthContext';
import { useLocalSearchParams } from 'expo-router';
import { Sparkles, Package, Star, HeartPulse, Tag, Shirt, Bath, Heart } from 'lucide-react-native';
import { getProducts, getCategories, PRODUCTS_PAGE_SIZE, type ProductSort } from '@/src/services/ecommerce';
import { useDebouncedValue } from '@/src/hooks/useDebouncedValue';
import { useCart } from '@/src/contexts/CartContext';
import { useProductFavorites } from '@/src/hooks/ecommerce/useProductFavorites';
import { useViewMode } from '@/src/hooks/useViewMode';
import type { IconComponent } from '@/src/components/IconButton';
import type { Product } from '@/src/types/ecommerce';
import { accents } from '@/constants/design';

export interface ShopCategory {
  id: string;
  label: string;
  icon: IconComponent;
  color: string;
}

/** Filtro especial: productos guardados en favoritos. */
export const FAVORITES = 'favorites';

export type ShopSort = ProductSort;
export const SHOP_SORTS: { value: ShopSort; label: string }[] = [
  { value: 'relevance', label: 'Relevancia' },
  { value: 'price_asc', label: 'Menor precio' },
  { value: 'price_desc', label: 'Mayor precio' },
  { value: 'rating', label: 'Mejor calificados' },
];

const SHOP_VIEW_MODES = ['grid', 'list'] as const;
export type ShopViewMode = (typeof SHOP_VIEW_MODES)[number];

/** Ícono y color de una categoría según su nombre (las categorías vienen del backend). */
function categoryStyle(name: string): Pick<ShopCategory, 'icon' | 'color'> {
  const n = name.toLowerCase();
  if (n.includes('alimento') || n.includes('comida')) return { icon: Package, color: accents.health };
  if (n.includes('juguete')) return { icon: Star, color: accents.warning };
  if (n.includes('salud') || n.includes('farmacia')) return { icon: HeartPulse, color: accents.rose };
  if (n.includes('accesorio')) return { icon: Tag, color: accents.info };
  if (n.includes('higiene') || n.includes('baño')) return { icon: Bath, color: accents.teal };
  if (n.includes('ropa') || n.includes('moda')) return { icon: Shirt, color: accents.orchid };
  return { icon: Package, color: accents.neutral };
}

export function useShopTab() {
  const { category } = useLocalSearchParams<{ category?: string }>();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState<ShopSort>('relevance');
  const [viewMode, setViewMode] = useViewMode<ShopViewMode>('tienda', SHOP_VIEW_MODES, 'grid');
  const { cartCount, addToCart } = useCart();
  const { user } = useAuth();
  const { favoriteIds, isFavorite, toggleFavorite } = useProductFavorites();

  // Enlaces con ?category=… abren la tienda en esa categoría
  useEffect(() => {
    if (category) setSelectedCategory(category);
  }, [category]);

  const { data: dbCategories = [] } = useQuery({
    queryKey: ['store-categories'],
    queryFn: getCategories,
  });

  const categories = useMemo<ShopCategory[]>(() => [
    { id: 'all', label: 'Todo', icon: Sparkles, color: accents.gold },
    ...(favoriteIds.length > 0 ? [{ id: FAVORITES, label: 'Favoritos', icon: Heart, color: accents.danger }] : []),
    ...dbCategories.map((c) => ({ id: c.id, label: c.name, ...categoryStyle(c.name) })),
  ], [dbCategories, favoriteIds.length]);

  // Si se vacían los favoritos estando en ese filtro, se vuelve a "Todo"
  useEffect(() => {
    if (selectedCategory === FAVORITES && favoriteIds.length === 0) setSelectedCategory('all');
  }, [selectedCategory, favoriteIds.length]);

  const categoryParam = selectedCategory === 'all' || selectedCategory === FAVORITES ? undefined : selectedCategory;
  // Se busca al dejar de escribir (no en cada tecla)
  const q = useDebouncedValue(searchQuery.trim(), 350);
  const favoritesOnly = selectedCategory === FAVORITES;
  const {
    data, isLoading, refetch, isRefetching, fetchNextPage, hasNextPage, isFetchingNextPage, isPlaceholderData,
  } = useInfiniteQuery({
    queryKey: ['store-products', 'catalog', categoryParam ?? 'all', q, sort, favoritesOnly ? 'favorites' : null],
    queryFn: ({ pageParam }) => getProducts({
      category: categoryParam,
      q,
      sort,
      favorites: favoritesOnly || undefined,
      skip: pageParam,
      limit: PRODUCTS_PAGE_SIZE,
    }),
    initialPageParam: 0,
    getNextPageParam: (last, all) => (last.length < PRODUCTS_PAGE_SIZE ? undefined : all.reduce((n, p) => n + p.length, 0)),
    // Al cambiar de filtro se queda lo anterior en pantalla hasta que llega lo nuevo (sin parpadeo)
    placeholderData: keepPreviousData,
  });

  // Sin duplicados si el catálogo cambia entre páginas (la paginación es por offset)
  const products = useMemo(
    () => [...new Map((data?.pages.flat() ?? []).map((p) => [p.id, p])).values()],
    [data],
  );

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  };

  const hasFilters = searchQuery.trim().length > 0 || selectedCategory !== 'all';
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
  };

  return {
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    sort,
    setSort,
    viewMode,
    setViewMode,
    hasFilters,
    clearFilters,

    products,
    /** Hay más páginas por cargar (el total exacto no se conoce). */
    hasMore: !!hasNextPage,
    loadMore,
    isLoadingMore: isFetchingNextPage,
    /** Llega un resultado nuevo (búsqueda/orden/categoría) mientras se muestra el anterior. */
    isUpdating: isPlaceholderData || searchQuery.trim() !== q,
    isLoading,
    refetch,
    isRefetching,

    cartCount,
    quickAdd: (product: Product) => addToCart(product, 1) > 0,
    /** El vendedor no puede comprar sus propios productos (el backend lo rechaza al pagar). */
    canBuy: (product: Product) => !user || product.seller_id !== user.id,
    isFavorite,
    toggleFavorite,
  };
}
