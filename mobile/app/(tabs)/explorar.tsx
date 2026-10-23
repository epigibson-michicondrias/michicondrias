import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useExplore } from '@/src/hooks/home/useExplore';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import SearchBar from '@/src/components/SearchBar';
import FilterChip from '@/src/components/FilterChip';
import SectionHeader from '@/src/components/SectionHeader';
import AppRefreshControl from '@/src/components/AppRefreshControl';
import { ServiceGrid } from '@/src/features/home/HomeSections';
import { layout, spacing } from '@/constants/design';

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
        <View style={styles.inset}>
          <SearchBar placeholder="Buscar mascotas, clínicas, productos…" onPress={() => router.push('/busqueda')} />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {categories.map((cat) => {
            const Icon = cat.icon;
            const active = selectedCategory === cat.key;
            return (
              <FilterChip
                key={cat.key}
                label={cat.label}
                active={active}
                onPress={() => handleCategoryPress(cat.key)}
                icon={<Icon size={layout.icon.xs} color={active ? theme.onPrimary : cat.color} />}
              />
            );
          })}
        </ScrollView>

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
  scroll: { paddingTop: spacing.lg, paddingBottom: spacing.huge, gap: spacing.lg },
  inset: { paddingHorizontal: layout.screenPadding },
  chips: { gap: spacing.sm, paddingHorizontal: layout.screenPadding },
  section: { gap: spacing.xs },
});
