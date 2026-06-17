import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getCategories } from '@/src/services/ecommerce';
import { useTheme } from '@/src/hooks/useTheme';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import {
  Sparkles, Package, Star, Heart, Tag, ShoppingBag, ChevronRight
} from 'lucide-react-native';

export default function CategoriasScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['store-categories'],
    queryFn: getCategories,
  });

  const getCategoryTheme = (name: string) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('alimento')) {
      return { icon: Package, color: '#10b981', bg: '#10b98115' };
    } else if (nameLower.includes('juguete')) {
      return { icon: Star, color: '#f59e0b', bg: '#f59e0b15' };
    } else if (nameLower.includes('salud')) {
      return { icon: Heart, color: '#ec4899', bg: '#ec489915' };
    } else if (nameLower.includes('accesorio')) {
      return { icon: Tag, color: '#3b82f6', bg: '#3b82f615' };
    } else if (nameLower.includes('higiene')) {
      return { icon: Sparkles, color: '#14b8a6', bg: '#14b8a615' };
    } else if (nameLower.includes('ropa') || nameLower.includes('moda')) {
      return { icon: ShoppingBag, color: '#f43f5e', bg: '#f43f5e15' };
    }
    return { icon: Package, color: '#6b7280', bg: '#6b728015' };
  };

  const handleSelectCategory = (categoryId: string) => {
    router.replace(`/(tabs)/tienda-tab?category=${categoryId}` as any);
  };

  return (
    <ScreenContainer style={{ backgroundColor: isDark ? '#081a2e' : '#f0f9ff' }}>
      <ScreenHeader title="Categorías" subtitle="Explora productos por departamento" />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textMuted }]}>Cargando categorías...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
          {/* Opción Todo */}
          <TouchableOpacity
            style={[styles.categoryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => handleSelectCategory('all')}
          >
            <View style={[styles.iconBox, { backgroundColor: theme.primary + '15' }]}>
              <Sparkles size={24} color={theme.primary} />
            </View>
            <View style={styles.infoBox}>
              <Text style={[styles.categoryName, { color: theme.text }]}>Todos los Productos</Text>
              <Text style={[styles.categoryDesc, { color: theme.textMuted }]}>Ver el catálogo completo de Michi-Shop</Text>
            </View>
            <ChevronRight size={18} color={theme.textMuted} />
          </TouchableOpacity>

          {/* Categorías Dinámicas */}
          {categories.map((cat) => {
            const { icon: Icon, color, bg } = getCategoryTheme(cat.name);
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => handleSelectCategory(cat.id)}
              >
                <View style={[styles.iconBox, { backgroundColor: bg }]}>
                  <Icon size={24} color={color} />
                </View>
                <View style={styles.infoBox}>
                  <Text style={[styles.categoryName, { color: theme.text }]}>{cat.name}</Text>
                  <Text style={[styles.categoryDesc, { color: theme.textMuted }]}>
                    {cat.description || 'Productos de alta calidad seleccionados para tu mascota'}
                  </Text>
                </View>
                <ChevronRight size={18} color={theme.textMuted} />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 12,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 16,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoBox: {
    flex: 1,
    gap: 4,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '800',
  },
  categoryDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
});
