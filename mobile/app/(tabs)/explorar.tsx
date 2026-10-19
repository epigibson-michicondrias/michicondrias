import React from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  View,
  Text,
  Dimensions,
} from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useAuth } from '@/src/contexts/AuthContext';
import { useExplore } from '@/src/hooks/home/useExplore';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import HeroStatusBar from '@/src/components/layout/HeroStatusBar';
import { Search, Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { font, spacing, layout } from '@/constants/design';

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
      <HeroStatusBar />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { backgroundColor: theme.background, paddingBottom: 120 }]}
      >
        {/* Header Gradient */}
        <LinearGradient
          colors={[...theme.heroGradient, theme.background]}
          style={styles.headerGradient}
        />

        {/* Header Title */}
        <View style={[styles.headerContainer, { paddingTop: insets.top + 16 }]}>
          <Text style={styles.headerTitle}>Explorar</Text>
          <Text style={styles.headerSubtitle}>Descubre todo para tu michi 🐱</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TouchableOpacity activeOpacity={0.85} accessibilityRole="search" accessibilityLabel="Buscar mascotas, clínicas y productos" onPress={() => router.push('/busqueda' as any)} style={[styles.searchBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.9)', borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(124,58,237,0.15)' }]}>
            <Search size={20} color={isDark ? 'rgba(255,255,255,0.5)' : theme.textMuted} />
            {/* Text (no TextInput): el input readonly interceptaba el clic en web y no navegaba */}
            <Text style={[styles.searchInput, { color: isDark ? 'rgba(255,255,255,0.4)' : theme.textMuted }]}>
              Buscar mascotas, clínicas, productos...
            </Text>
          </TouchableOpacity>
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
                <CatIcon size={16} color={isSelected ? theme.onPrimary : cat.color} />
                <Text
                  style={[
                    styles.categoryLabel,
                    { color: isSelected ? theme.onPrimary : theme.text },
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
              colors={theme.heroGradient}
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
    paddingHorizontal: layout.screenPadding,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: font.display,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: font.base,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.75)',
    marginTop: spacing.xs,
  },
  searchContainer: {
    paddingHorizontal: layout.screenPadding,
    marginTop: spacing.xl,
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    height: 50,
    borderRadius: 24,
    borderWidth: 1,
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: font.base,
    fontWeight: '500',
  },
  categoryList: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.sm,
    gap: spacing.md,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryLabel: {
    fontSize: font.base,
    fontWeight: '700',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  resultsCount: {
    fontSize: font.base,
    fontWeight: '600',
  },
  clearFilter: {
    fontSize: font.base,
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
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
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
    marginBottom: spacing.md,
  },
  gridTitle: {
    fontSize: font.lg,
    fontWeight: '800',
    textAlign: 'center',
  },
  gridSubtitle: {
    fontSize: font.sm,
    fontWeight: '500',
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  bannerContainer: {
    paddingHorizontal: layout.screenPadding,
    marginTop: spacing.xxxl,
  },
  aiBanner: {
    height: 120,
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  bannerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xxl,
    justifyContent: 'space-between',
  },
  bannerTextCol: {
    flex: 1,
  },
  bannerTag: {
    fontSize: font.xs,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1.5,
  },
  bannerTitle: {
    fontSize: font.h3,
    fontWeight: '900',
    color: '#fff',
    marginTop: spacing.xs,
  },
  bannerDesc: {
    fontSize: font.md,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
    marginTop: spacing.xs,
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
