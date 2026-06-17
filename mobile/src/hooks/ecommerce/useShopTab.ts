/**
 * useShopTab — Hook for shop tab screen
 * Extracts data fetching, category filtering, and search from app/(tabs)/tienda-tab.tsx
 */
import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { getProducts, getCategories } from '@/src/services/ecommerce';
import {
  Sparkles, Package, Star, Heart, Tag, ShoppingBag,
} from 'lucide-react-native';

// ── Types ──
export interface ShopCategory {
  id: string;
  label: string;
  icon: any;
  color: string;
}

export function useShopTab() {
  const router = useRouter();
  const { user } = useAuth();
  const { category } = useLocalSearchParams<{ category?: string }>();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Update selectedCategory when category query parameter changes
  useEffect(() => {
    if (category) {
      setSelectedCategory(category);
    }
  }, [category]);

  // Fetch categories dynamically from backend
  const { data: dbCategories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['store-categories'],
    queryFn: getCategories,
  });

  const categories = useMemo(() => {
    const list: ShopCategory[] = [
      { id: 'all', label: 'Todo', icon: Sparkles, color: '#7c3aed' }
    ];

    dbCategories.forEach(cat => {
      let icon = Package;
      let color = '#6b7280';
      const nameLower = cat.name.toLowerCase();

      if (nameLower.includes('alimento')) {
        icon = Package;
        color = '#10b981';
      } else if (nameLower.includes('juguete')) {
        icon = Star;
        color = '#f59e0b';
      } else if (nameLower.includes('salud')) {
        icon = Heart;
        color = '#ec4899';
      } else if (nameLower.includes('accesorio')) {
        icon = Tag;
        color = '#3b82f6';
      } else if (nameLower.includes('higiene')) {
        icon = Sparkles;
        color = '#14b8a6';
      } else if (nameLower.includes('ropa') || nameLower.includes('moda')) {
        icon = ShoppingBag;
        color = '#f43f5e';
      }

      list.push({
        id: cat.id,
        label: cat.name,
        icon,
        color,
      });
    });

    return list;
  }, [dbCategories]);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['store-products', selectedCategory],
    queryFn: () => getProducts(selectedCategory === 'all' ? undefined : selectedCategory),
  });

  const isVendedor = user?.role_name === 'vendedor';

  const handleSearch = () => {
    router.push(`/tienda?q=${searchQuery}` as any);
  };

  return {
    // State
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,

    // Data
    products,
    isLoading: isLoading || categoriesLoading,
    isVendedor,
    categories,

    // Actions
    handleSearch,

    // Navigation
    router,
  };
}
