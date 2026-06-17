import React from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  View,
  Text,
  TextInput,
  Dimensions,
} from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useAuth } from '@/src/contexts/AuthContext';
import { useExplore } from '@/src/hooks/home';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import { Search, Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 12;
const CARD_HORIZONTAL_PADDING = 24;
const CARD_WIDTH = (SCREEN_WIDTH - CARD_HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;

export default function ExplorarScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const {
    categories,
    filteredItems,
    rows,
    selectedCategory,
    handleCategoryPress,
    clearFilter,
  } = useExplore();

  return (
    <ScreenContainer>
      <StatusBar barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { backgroundColor: theme.background, paddingBottom: 120 }]}
      >
        {/* Header Gradient */}
        <LinearGradient
          colors={[theme.primary, theme.primary + 'AA', theme.background]}
          style={styles.headerGradient}
        />

        {/* Header Title */}
        <View style={[styles.headerContainer, { paddingTop: insets.top + 16 }]}>
          <Text style={styles.headerTitle}>Explorar</Text>
          <Text style={styles.headerSubtitle}>Descubre todo para tu michi 🐱</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.9)', borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(124,58,237,0.15)' }]}>
            <Search size={20} color={isDark ? 'rgba(255,255,255,0.5)' : '#94a3b8'} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Buscar servicios, tiendas, clínicas..."
              placeholderTextColor={isDark ? 'rgba(255,255,255,0.4)' : '#94a3b8'}
              editable={false}
            />
          </View>
        </View>

        {/* Category Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        >
          {categories.map((cat) => {
            const CatIcon = cat.icon;
            const isSelected = selectedCategory === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                activeOpacity={0.7}
                onPress={() => handleCategoryPress(cat.key)}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: isSelected
                      ? cat.color
                      : isDark
                      ? 'rgba(255,255,255,0.08)'
                      : theme.surface,
                    borderColor: isSelected
                      ? cat.color
                      : theme.border,
                  },
                ]}
              >
                <CatIcon size={16} color={isSelected ? '#fff' : cat.color} />
                <Text
                  style={[
                    styles.categoryLabel,
                    { color: isSelected ? '#fff' : theme.text },
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Results count */}
        <View style={styles.resultsHeader}>
          <Text style={[styles.resultsCount, { color: theme.textMuted }]}>
            {selectedCategory
              ? `${filteredItems.length} en ${selectedCategory}`
              : `${filteredItems.length} servicios disponibles`}
          </Text>
          {selectedCategory && (
            <TouchableOpacity onPress={clearFilter}>
              <Text style={[styles.clearFilter, { color: theme.primary }]}>Ver todos</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Services Grid - 2 columns */}
        <View style={styles.gridContainer}>
          {rows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.gridRow}>
              {row.map((item) => {
                const Icon = item.icon;
                return (
                  <TouchableOpacity
                    key={item.title}
                    activeOpacity={0.75}
                    style={[
                      styles.gridCard,
                      {
                        backgroundColor: theme.surface,
                        borderColor: theme.border,
                        width: CARD_WIDTH,
                      },
                    ]}
                    onPress={() => router.push(item.route as any)}
                  >
                    <View style={[styles.gridIconCircle, { backgroundColor: item.color + '18' }]}>
                      <Icon size={24} color={item.color} />
                    </View>
                    <Text style={[styles.gridTitle, { color: theme.text }]} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={[styles.gridSubtitle, { color: theme.textMuted }]} numberOfLines={1}>
                      {item.subtitle}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              {/* Spacer if odd number of items in last row */}
              {row.length === 1 && <View style={{ width: CARD_WIDTH }} />}
            </View>
          ))}
        </View>

        {/* AI Feature Banner */}
        <View style={styles.bannerContainer}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.aiBanner}
            onPress={() => router.push('/mascotas/diagnostico-ia' as any)}
          >
            <LinearGradient
              colors={['#7c3aed', '#8b5cf6', '#a78bfa']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.bannerContent}>
              <View style={styles.bannerTextCol}>
                <Text style={styles.bannerTag}>INTELIGENCIA ARTIFICIAL</Text>
                <Text style={styles.bannerTitle}>Diagnóstico IA</Text>
                <Text style={styles.bannerDesc}>Analiza síntomas con tecnología avanzada</Text>
              </View>
              <View style={styles.bannerIconBox}>
                <Sparkles size={40} color="rgba(255,255,255,0.4)" />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 320,
  },
  headerContainer: {
    paddingHorizontal: 24,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginTop: 20,
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 24,
    borderWidth: 1,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  categoryList: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 8,
    gap: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 16,
    marginBottom: 16,
  },
  resultsCount: {
    fontSize: 13,
    fontWeight: '600',
  },
  clearFilter: {
    fontSize: 13,
    fontWeight: '700',
  },
  gridContainer: {
    paddingHorizontal: CARD_HORIZONTAL_PADDING,
    gap: CARD_GAP,
  },
  gridRow: {
    flexDirection: 'row',
    gap: CARD_GAP,
  },
  gridCard: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  gridIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  gridTitle: {
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
  gridSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 3,
    textAlign: 'center',
  },
  bannerContainer: {
    paddingHorizontal: 24,
    marginTop: 28,
  },
  aiBanner: {
    height: 120,
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  bannerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    justifyContent: 'space-between',
  },
  bannerTextCol: {
    flex: 1,
  },
  bannerTag: {
    fontSize: 9,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1.5,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
    marginTop: 4,
  },
  bannerDesc: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  bannerIconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
