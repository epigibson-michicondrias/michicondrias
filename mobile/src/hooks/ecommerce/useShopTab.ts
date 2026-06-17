/**
 * useShopTab — Hook for shop tab screen
 * Extracts data fetching, category filtering, and search from app/(tabs)/tienda-tab.tsx
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { getProducts } from '@/src/services/ecommerce';
import {
  Sparkles, Package, Star, Heart, Tag,
} from 'lucide-react-native';

// ── Types ──
export interface ShopCategory {
  id: string;
  label: string;
  icon: any;
  color: string;
}

// ── Constants ──
export const CATEGORIES: ShopCategory[] = [
  { id: 'all', label: 'Todo', icon: Sparkles, color: '#7c3aed' },
  { id: 'alimentos', label: 'Alimentos', icon: Package, color: '#10b981' },
  { id: 'juguetes', label: 'Juguetes', icon: Star, color: '#f59e0b' },
  { id: 'salud', label: 'Salud', icon: Heart, color: '#ec4899' },
  { id: 'accesorios', label: 'Accesorios', icon: Tag, color: '#3b82f6' },
];

export function useShopTab() {
  const router = useRouter();
  const { user } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

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
    isLoading,
    isVendedor,
    categories: CATEGORIES,

    // Actions
    handleSearch,

    // Navigation
    router,
  };
}
