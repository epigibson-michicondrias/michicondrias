/**
 * useShopTab — catálogo de la tienda (`(app)/tienda`): categorías, búsqueda, orden y forma de ver.
 * Espejo de `mobile/src/hooks/ecommerce/useShopTab.ts`.
 */
import { useState, useEffect, useMemo } from 'react';
import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'next/navigation';
import { Sparkles, Package, Star, HeartPulse, Tag, Shirt, Bath, Heart } from 'lucide-react';
import type { ComponentType } from 'react';
import { getProducts, getCategories, PRODUCTS_PAGE_SIZE, type ProductSort } from '@/services/ecommerce';
import { useDebounce } from '@/hooks/useDebounce';
import { useCart } from '@/contexts/CartContext';
import type { Product } from '@/types/ecommerce';

export interface ShopCategory {
  id: string;
  label: string;
  icon: ComponentType<{ size?: number; color?: string }>;
}

export const FAVORITES = 'favorites';

export type ShopSort = ProductSort;
export const SHOP_SORTS: { value: ShopSort; label: string }[] = [
  { value: 'relevance', label: 'Relevancia' },
  { value: 'price_asc', label: 'Menor precio' },
  { value: 'price_desc', label: 'Mayor precio' },
  { value: 'rating', label: 'Mejor calificados' },
];

export type ShopViewMode = 'grid' | 'list';

function categoryStyle(name: string): { icon: ShopCategory['icon'] } {
  const n = name.toLowerCase();
  if (n.includes('alimento') || n.includes('comida')) return { icon: Package };
  if (n.includes('juguete')) return { icon: Star };
  if (n.includes('salud') || n.includes('farmacia')) return { icon: HeartPulse };
  if (n.includes('accesorio')) return { icon: Tag };
  if (n.includes('higiene') || n.includes('baño')) return { icon: Bath };
  if (n.includes('ropa') || n.includes('moda')) return { icon: Shirt };
  return { icon: Package };
}

export function useShopTab() {
  const params = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState<ShopSort>('relevance');
  const [viewMode, setViewMode] = useState<ShopViewMode>('grid');
  const { cartCount, addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await Promise.resolve();
      if (cancelled) return;
      const category = params.get('category');
      if (category) setSelectedCategory(category);
    })();
    return () => { cancelled = true; };
  }, [params]);

  const { data: dbCategories = [] } = useQuery({
    queryKey: ['store-categories'],
    queryFn: getCategories,
  });

  const categories = useMemo<ShopCategory[]>(() => [
    { id: 'all', label: 'Todo', icon: Sparkles },
    ...dbCategories.map((c) => ({ id: c.id, label: c.name, ...categoryStyle(c.name) })),
  ], [dbCategories]);

  const categoryParam = selectedCategory === 'all' ? undefined : selectedCategory;
  const q = useDebounce(searchQuery.trim(), 350);

  const {
    data, isLoading, refetch, isRefetching, fetchNextPage, hasNextPage, isFetchingNextPage, isPlaceholderData,
  } = useInfiniteQuery({
    queryKey: ['store-products', 'catalog', categoryParam ?? 'all', q, sort],
    queryFn: ({ pageParam }) => getProducts({
      category: categoryParam,
      q,
      sort,
      skip: pageParam,
      limit: PRODUCTS_PAGE_SIZE,
    }),
    initialPageParam: 0,
    getNextPageParam: (last, all) => (last.length < PRODUCTS_PAGE_SIZE ? undefined : all.reduce((n, p) => n + p.length, 0)),
    placeholderData: keepPreviousData,
  });

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
    hasMore: !!hasNextPage,
    loadMore,
    isLoadingMore: isFetchingNextPage,
    isUpdating: isPlaceholderData || searchQuery.trim() !== q,
    isLoading,
    refetch,
    isRefetching,
    cartCount,
    quickAdd: (product: Product) => addToCart(product, 1) > 0,
    canBuy: (product: Product) => !user || product.seller_id !== user.id,
  };
}
