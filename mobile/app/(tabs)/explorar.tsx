import React from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, Flame, AlertCircle, Compass, ChevronRight, Siren, ShieldAlert } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useExplore } from '@/src/hooks/home/useExplore';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import SearchBar from '@/src/components/SearchBar';
import FilterChip from '@/src/components/FilterChip';
import SectionHeader from '@/src/components/SectionHeader';
import AppRefreshControl from '@/src/components/AppRefreshControl';
import { ServiceGrid } from '@/src/features/home/HomeSections';
import { haptic } from '@/src/utils/haptics';
import { layout, radius, shadow, spacing, families, font, type } from '@/constants/design';

export default function ExplorarScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { categories, sections, selectedCategory, handleCategoryPress } = useExplore();

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Explorar"
        subtitle="Servicios y comunidad para tu mascota"
        showBack={false}
        actions={[{ icon: Search, label: 'Buscar', onPress: () => router.push('/busqueda') }]}
      />

      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<AppRefreshControl />} contentContainerStyle={styles.scroll}>
        {/* Barra de búsqueda interactiva */}
        <View style={styles.inset}>
          <SearchBar placeholder="Buscar mascotas, clínicas, productos…" onPress={() => router.push('/busqueda')} />
        </View>

        {/* Tarjeta destacada de Urgencias Médicas 24 Horas */}
        <View style={styles.inset}>
          <TouchableOpacity
            style={[styles.emergencyBanner, { backgroundColor: theme.error + '10', borderColor: theme.error + '30' }]}
            onPress={() => {
              haptic.light();
              router.push('/directorio');
            }}
            accessibilityRole="button"
            accessibilityLabel="Urgencias veterinarias 24 horas. Ver clínicas abiertas ahora"
          >
            <View style={[styles.emergencyIconBox, { backgroundColor: theme.error + '25' }]}>
              <Siren size={20} color={theme.error} />
            </View>
            <View style={styles.emergencyInfo}>
              <View style={styles.emergencyTitleRow}>
                <Text style={[styles.emergencyTitle, { color: theme.error }]}>
                  Urgencias 24 Horas
                </Text>
                <View style={[styles.liveDot, { backgroundColor: theme.error }]} />
              </View>
              <Text style={[styles.emergencySubtitle, { color: theme.textMuted }]}>
                Clínicas con hospitalización y atención nocturna inmediata
              </Text>
            </View>
            <ChevronRight size={18} color={theme.error} />
          </TouchableOpacity>
        </View>

        {/* Categorías de servicios con scroll horizontal */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {categories.map((cat) => {
            const Icon = cat.icon;
            const active = selectedCategory === cat.key;
            return (
              <FilterChip
                key={cat.key}
                label={cat.label}
                active={active}
                onPress={() => {
                  haptic.selection();
                  handleCategoryPress(cat.key);
                }}
                icon={<Icon size={layout.icon.xs} color={active ? theme.onPrimary : cat.color} />}
              />
            );
          })}
        </ScrollView>

        {/* Secciones de Servicios */}
        {sections.map((section) => (
          <View key={section.key} style={styles.section}>
            <View style={styles.inset}>
              <SectionHeader title={section.label} subtitle={`${section.items.length} ${section.items.length === 1 ? 'servicio' : 'servicios'}`} />
            </View>
            <ServiceGrid
              items={section.items.map((item) => ({
                key: item.route,
                title: item.title,
                subtitle: item.subtitle,
                icon: item.icon,
                color: item.color,
                onPress: () => router.push(item.route as any),
              }))}
            />
          </View>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: spacing.md, paddingBottom: spacing.huge, gap: spacing.md },
  inset: { paddingHorizontal: layout.screenPadding },
  chips: { gap: spacing.xs, paddingHorizontal: layout.screenPadding, alignItems: 'center' },
  section: { gap: spacing.xs },
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    ...shadow.card,
  },
  emergencyIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyInfo: {
    flex: 1,
  },
  emergencyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  emergencyTitle: {
    fontSize: font.sm,
    fontFamily: families.bold,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  emergencySubtitle: {
    fontSize: font.xs,
    lineHeight: 16,
  },
});
