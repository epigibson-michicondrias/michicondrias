import React from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useGlobalSearch, type SearchTab } from '@/src/hooks/search/useGlobalSearch';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { Search, X, PawPrint, Building2, ShoppingBag } from 'lucide-react-native';

const TABS: { key: SearchTab; label: string; icon: typeof PawPrint }[] = [
    { key: 'mascotas', label: 'Mascotas', icon: PawPrint },
    { key: 'clinicas', label: 'Clínicas', icon: Building2 },
    { key: 'productos', label: 'Productos', icon: ShoppingBag },
];

export default function BusquedaScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const {
        query,
        setQuery,
        activeTab,
        setActiveTab,
        activeResults,
        tabCounts,
        isLoading,
        hasSearched,
        clearSearch,
    } = useGlobalSearch();

    const renderTab = (tab: typeof TABS[0]) => {
        const isActive = activeTab === tab.key;
        const count = tabCounts[tab.key];
        const TabIcon = tab.icon;

        return (
            <TouchableOpacity
                key={tab.key}
                style={[
                    styles.tab,
                    {
                        backgroundColor: isActive ? theme.primary : theme.surface,
                        borderColor: isActive ? theme.primary : theme.borderLight,
                    },
                ]}
                onPress={() => setActiveTab(tab.key)}
            >
                <TabIcon size={16} color={isActive ? '#fff' : theme.textMuted} />
                <Text style={[styles.tabLabel, { color: isActive ? '#fff' : theme.text }]}>
                    {tab.label}
                </Text>
                {hasSearched && (
                    <View style={[styles.tabBadge, {
                        backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : theme.background,
                    }]}>
                        <Text style={[styles.tabBadgeText, {
                            color: isActive ? '#fff' : theme.textMuted,
                        }]}>
                            {count}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const renderResultItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.resultCard, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}
        >
            <View style={styles.resultContent}>
                <Text style={[styles.resultTitle, { color: theme.text }]} numberOfLines={1}>
                    {item.name || item.pet_name || item.display_name || 'Sin nombre'}
                </Text>
                <Text style={[styles.resultSubtitle, { color: theme.textMuted }]} numberOfLines={2}>
                    {item.description || item.breed || item.address || item.specialty || ''}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <ScreenContainer>
            <ScreenHeader title="Buscar" showBack={true} />

            {/* Search Input */}
            <View style={styles.searchContainer}>
                <View style={[styles.searchInputRow, {
                    backgroundColor: theme.surface,
                    borderColor: theme.borderLight,
                }]}>
                    <Search size={20} color={theme.textMuted} />
                    <TextInput
                        style={[styles.searchInput, { color: theme.text }]}
                        value={query}
                        onChangeText={setQuery}
                        placeholder="Buscar mascotas, clínicas, productos..."
                        placeholderTextColor={theme.textMuted}
                        autoFocus
                        returnKeyType="search"
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={clearSearch}>
                            <X size={20} color={theme.textMuted} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabsRow}>
                {TABS.map(renderTab)}
            </View>

            {/* Results */}
            {isLoading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={[styles.centerText, { color: theme.textMuted }]}>
                        Buscando...
                    </Text>
                </View>
            ) : !hasSearched ? (
                <View style={styles.centerContainer}>
                    <Search size={48} color={theme.textMuted} />
                    <Text style={[styles.centerText, { color: theme.textMuted }]}>
                        Escribe al menos 2 caracteres para buscar
                    </Text>
                </View>
            ) : activeResults.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Text style={[styles.centerText, { color: theme.textMuted }]}>
                        No se encontraron resultados en {TABS.find(t => t.key === activeTab)?.label}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={activeResults}
                    renderItem={renderResultItem}
                    keyExtractor={(item, index) => item.id || String(index)}
                    contentContainerStyle={styles.resultsList}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    searchContainer: {
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    searchInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    tabsRow: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        gap: 8,
        marginBottom: 16,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 10,
        borderWidth: 1,
        gap: 6,
    },
    tabLabel: {
        fontSize: 13,
        fontWeight: '600',
    },
    tabBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        minWidth: 20,
        alignItems: 'center',
    },
    tabBadgeText: {
        fontSize: 11,
        fontWeight: '700',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 40,
    },
    centerText: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
    },
    resultsList: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    resultCard: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 10,
    },
    resultContent: {
        gap: 4,
    },
    resultTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    resultSubtitle: {
        fontSize: 14,
        lineHeight: 20,
    },
});
