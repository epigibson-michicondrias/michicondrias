import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { Search, PawPrint, Heart, MapPin, Building2, Footprints, ShoppingBag, ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useGlobalSearch, SEARCH_TABS, type SearchTab, type SearchResultItem } from '@/src/hooks/search/useGlobalSearch';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { SkeletonList } from '@/src/components/Skeleton';
import EmptyState from '@/src/components/EmptyState';
import FilterChip from '@/src/components/FilterChip';
import SearchBar from '@/src/components/SearchBar';
import { spacing, radius, type, layout } from '@/constants/design';

const TAB_ICONS: Record<SearchTab, typeof PawPrint> = {
    mascotas: PawPrint,
    adopciones: Heart,
    perdidas: MapPin,
    clinicas: Building2,
    servicios: Footprints,
    productos: ShoppingBag,
};

export default function BusquedaScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const {
        query,
        setQuery,
        activeTab,
        activeTabInfo,
        setActiveTab,
        activeResults,
        tabCounts,
        isLoading,
        isError,
        hasSearched,
        clearSearch,
    } = useGlobalSearch();

    const goSeeAll = () => router.push(activeTabInfo.seeAllRoute as any);

    const renderResultItem = ({ item }: { item: SearchResultItem }) => (
        <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={item.subtitle ? `${item.title}. ${item.subtitle}` : item.title}
            style={[styles.resultCard, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}
            onPress={() => router.push(item.route as any)}
        >
            <View style={styles.resultContent}>
                <Text style={[type.subtitle, { color: theme.text }]} numberOfLines={1}>
                    {item.title}
                </Text>
                {!!item.subtitle && (
                    <Text style={[type.body, { color: theme.textMuted }]} numberOfLines={2}>
                        {item.subtitle}
                    </Text>
                )}
            </View>
            <ChevronRight size={layout.icon.md} color={theme.textMuted} />
        </TouchableOpacity>
    );

    // «Ver todos»: el backend manda hasta 5 por dominio; el listado completo vive en el módulo (F25)
    const seeAllFooter = (
        <TouchableOpacity
            style={styles.seeAll}
            onPress={goSeeAll}
            accessibilityRole="link"
            accessibilityLabel={activeTabInfo.seeAllLabel}
        >
            <Text style={[type.bodyStrong, { color: theme.primary }]}>{activeTabInfo.seeAllLabel}</Text>
            <ChevronRight size={layout.icon.sm} color={theme.primary} />
        </TouchableOpacity>
    );

    const renderBody = () => {
        if (!hasSearched) {
            return (
                <EmptyState
                    icon={<Search size={layout.icon.xl} color={theme.textMuted} />}
                    title="¿Qué estás buscando?"
                    subtitle="Escribe al menos 2 letras: mascotas, adopciones, reportes de perdidas, clínicas, paseadores o productos."
                />
            );
        }
        if (isLoading) return <View style={styles.listPadding}><SkeletonList count={4} /></View>;
        // El error ya lo muestra ScreenContainer con su banner y botón de reintentar
        if (isError) return null;
        if (activeResults.length === 0) {
            return (
                <EmptyState
                    icon={<Search size={layout.icon.xl} color={theme.textMuted} />}
                    title={`Sin resultados en ${activeTabInfo.label}`}
                    subtitle="Prueba con otra palabra o revisa el listado completo."
                    actionLabel={activeTabInfo.seeAllLabel}
                    onAction={goSeeAll}
                />
            );
        }
        return (
            <FlashList
                data={activeResults}
                renderItem={renderResultItem}
                keyExtractor={(item) => item.id}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.listPadding}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={seeAllFooter}
            />
        );
    };

    return (
        <ScreenContainer>
            <ScreenHeader title="Buscar" showBack={true} />

            <View style={styles.searchContainer}>
                <SearchBar
                    value={query}
                    // Limpiar con el botón de la barra (o al dejar el campo vacío) también resetea el debounce
                    onChangeText={(text) => (text.length === 0 ? clearSearch() : setQuery(text))}
                    placeholder="Buscar en Michicondrias…"
                    autoFocus
                />
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tabsRow}
                style={styles.tabsScroll}
                keyboardShouldPersistTaps="handled"
            >
                {SEARCH_TABS.map((tab) => {
                    const Icon = TAB_ICONS[tab.key];
                    const active = activeTab === tab.key;
                    return (
                        <FilterChip
                            key={tab.key}
                            label={tab.label}
                            active={active}
                            onPress={() => setActiveTab(tab.key)}
                            icon={<Icon size={layout.icon.sm} color={active ? theme.onPrimary : theme.textMuted} />}
                            count={hasSearched ? tabCounts[tab.key] : undefined}
                        />
                    );
                })}
            </ScrollView>

            <View style={styles.body}>{renderBody()}</View>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    searchContainer: {
        paddingHorizontal: layout.screenPadding,
        marginBottom: spacing.md,
    },
    tabsScroll: {
        flexGrow: 0,
        marginBottom: spacing.lg,
    },
    tabsRow: {
        paddingHorizontal: layout.screenPadding,
        gap: spacing.sm,
    },
    body: {
        flex: 1,
    },
    listPadding: {
        paddingHorizontal: layout.screenPadding,
        paddingBottom: spacing.huge,
    },
    resultCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        borderRadius: radius.md,
        borderWidth: 1,
        marginBottom: spacing.sm,
        gap: spacing.md,
        minHeight: layout.minTouch,
    },
    resultContent: {
        flex: 1,
        gap: spacing.xs,
    },
    seeAll: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        minHeight: layout.minTouch,
        marginTop: spacing.sm,
    },
});
