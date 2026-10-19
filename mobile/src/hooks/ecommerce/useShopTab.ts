/**
 * useShopTab — Pestaña Tienda: catálogo con categorías, favoritos, búsqueda, orden y forma de ver.
 * La búsqueda y el orden son locales sobre el catálogo de la categoría (el backend no ofrece `q` ni `sort`).
 */
import { useState, useEffect, useMemo } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/src/contexts/AuthContext';
import { useLocalSearchParams } from 'expo-router';
import { Sparkles, Package, Star, HeartPulse, Tag, Shirt, Bath, Heart } from 'lucide-react-native';
import { getProducts, getCategories } from '@/src/services/ecommerce';
import { useCart } from '@/src/contexts/CartContext';
import { useFavorites } from '@/src/hooks/useFavorites';
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

export type ShopSort = 'relevance' | 'price_asc' | 'price_desc' | 'rating';
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

function sortProducts(list: Product[], sort: ShopSort): Product[] {
  // Agotados al final en cualquier orden
  const byStock = (a: Product, b: Product) => Number(b.stock > 0) - Number(a.stock > 0);
  const sorted = [...list];
  switch (sort) {
    case 'price_asc': return sorted.sort((a, b) => byStock(a, b) || a.price - b.price);
    case 'price_desc': return sorted.sort((a, b) => byStock(a, b) || b.price - a.price);
    case 'rating': return sorted.sort((a, b) => byStock(a, b) || b.average_rating - a.average_rating || b.review_count - a.review_count);
    default: return sorted.sort(byStock);
  }
}

export function useShopTab() {
  const { category } = useLocalSearchParams<{ category?: string }>();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState<ShopSort>('relevance');
  const [viewMode, setViewMode] = useViewMode<ShopViewMode>('tienda', SHOP_VIEW_MODES, 'grid');
  const { cartCount, addToCart } = useCart();
  const { user } = useAuth();
  const { favoriteIds, isFavorite, toggleFavorite } = useFavorites('productos');

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
  const { data: catalog = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['store-products', categoryParam ?? 'all'],
    queryFn: () => getProducts(categoryParam),
    // Al cambiar de categoría se queda lo anterior en pantalla hasta que llega lo nuevo (sin parpadeo)
    placeholderData: keepPreviousData,
  });

  const products = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = selectedCategory === FAVORITES ? catalog.filter((p) => favoriteIds.includes(p.id)) : catalog;
    if (q) list = list.filter((p) => p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q));
    return sortProducts(list, sort);
  }, [catalog, searchQuery, sort, selectedCategory, favoriteIds]);

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
