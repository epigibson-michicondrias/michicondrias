import React from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, X, PawPrint, Heart, MapPin, Building2, Footprints, ShoppingBag, ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useGlobalSearch, SEARCH_TABS, type SearchTab, type SearchResultItem } from '@/src/hooks/search/useGlobalSearch';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { SkeletonList } from '@/src/components/Skeleton';
import EmptyState from '@/src/components/EmptyState';
import FilterChip from '@/src/components/FilterChip';
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
            <FlatList
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
                <View style={[styles.searchInputRow, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
                    <Search size={layout.icon.md} color={theme.textMuted} />
                    <TextInput
                        style={[type.body, styles.searchInput, { color: theme.text }]}
                        value={query}
                        onChangeText={setQuery}
                        placeholder="Buscar en Michicondrias…"
                        placeholderTextColor={theme.textMuted}
                        autoFocus
                        autoCorrect={false}
                        returnKeyType="search"
                        accessibilityLabel="Buscar"
                    />
                    {query.length > 0 && (
                        <TouchableOpacity
                            onPress={clearSearch}
                            style={styles.clearBtn}
                            accessibilityRole="button"
                            accessibilityLabel="Borrar búsqueda"
                        >
                            <X size={layout.icon.md} color={theme.textMuted} />
                        </TouchableOpacity>
                    )}
                </View>
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
    searchInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: radius.md,
        paddingLeft: spacing.lg,
        minHeight: layout.inputHeight,
        gap: spacing.md,
    },
    searchInput: {
        flex: 1,
        paddingVertical: spacing.md,
    },
    clearBtn: {
        width: layout.minTouch,
        height: layout.minTouch,
        alignItems: 'center',
        justifyContent: 'center',
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
