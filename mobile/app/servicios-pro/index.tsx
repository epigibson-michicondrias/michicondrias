import React from 'react';
import { SkeletonList } from '@/src/components/Skeleton';
import { StyleSheet, View, Text, TouchableOpacity, Image, FlatList, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useServiciosPro } from '@/src/hooks/servicios-pro/useServiciosPro';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { Search, Star, ShieldCheck, MapPin, Dog, Cat, User } from 'lucide-react-native';
import AppRefreshControl from '@/src/components/AppRefreshControl';
import { font, spacing, layout } from '@/constants/design';

export default function ServiciosProScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { activeTab, setActiveTab, searchQuery, setSearchQuery, filteredData, isLoading } = useServiciosPro();

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity accessibilityRole="button"
            style={[styles.card, { borderColor: theme.border }, { backgroundColor: theme.surface }]}
            onPress={() => router.push((activeTab === 'walkers' ? `/paseadores/${item.id}` : `/cuidadores/${item.id}`) as any)}
        >
            <View style={styles.cardHeader}>
                <View style={styles.imageContainer}>
                    <Image
                        source={item.photo_url ? { uri: item.photo_url } : undefined}
                        style={[styles.profileImage, { backgroundColor: theme.primaryLight }]}
                    />
                    {item.is_verified && (
                        <View style={styles.verifiedBadge}>
                            <ShieldCheck size={12} color="#fff" />
                        </View>
                    )}
                </View>
                <View style={styles.mainInfo}>
                    <View style={styles.nameRow}>
                        <Text style={[styles.name, { color: theme.text }]}>{item.display_name}</Text>
                        <View style={styles.ratingBox}>
                            <Star size={14} color="#facc15" fill="#facc15" />
                            <Text style={[styles.ratingText, { color: theme.text }]}>{item.rating ? item.rating.toFixed(1) : 'Nuevo'}</Text>
                        </View>
                    </View>
                    <View style={styles.locationRow}>
                        <MapPin size={14} color={theme.textMuted} />
                        <Text style={[styles.location, { color: theme.textMuted }]}>{item.location || 'Ubicación no indicada'}</Text>
                    </View>
                </View>
            </View>

            <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
                <View style={styles.tagsContainer}>
                    {item.accepts_dogs && <View style={[styles.tag, { backgroundColor: theme.primary + '15' }]}><Dog size={12} color={theme.primary} /><Text style={[styles.tagText, { color: theme.primary }]}>Perros</Text></View>}
                    {item.accepts_cats && <View style={[styles.tag, { backgroundColor: theme.secondary + '15' }]}><Cat size={12} color={theme.secondary} /><Text style={[styles.tagText, { color: theme.secondary }]}>Gatos</Text></View>}
                </View>
                <Text style={[styles.price, { color: theme.primary }]}>
                    {(activeTab === 'walkers' ? item.price_per_walk : item.price_per_day) ? `$${activeTab === 'walkers' ? item.price_per_walk : item.price_per_day}` : 'Por acordar'}
                    <Text style={[styles.priceUnit, { color: theme.textMuted }]}> / {activeTab === 'walkers' ? 'paseo' : 'día'}</Text>
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Servicios Pro"
                subtitle="Expertos al cuidado de tu mascota"
                actions={[{ icon: User, label: 'Mi perfil profesional', onPress: () => router.push('/servicios-pro/perfil' as any) }]}
            />

            <View style={styles.tabsContainer}>
                <TouchableOpacity accessibilityRole="button"
                    style={[styles.tab, { backgroundColor: theme.overlay }, activeTab === 'walkers' && { backgroundColor: theme.primary }]}
                    onPress={() => setActiveTab('walkers')}
                >
                    <Text style={[styles.tabText, { color: activeTab === 'walkers' ? '#fff' : theme.textMuted }]}>Paseadores</Text>
                </TouchableOpacity>
                <TouchableOpacity accessibilityRole="button"
                    style={[styles.tab, { backgroundColor: theme.overlay }, activeTab === 'sitters' && { backgroundColor: theme.primary }]}
                    onPress={() => setActiveTab('sitters')}
                >
                    <Text style={[styles.tabText, { color: activeTab === 'sitters' ? '#fff' : theme.textMuted }]}>Cuidadores</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.searchSection}>
                <View style={[styles.searchBar, { borderColor: theme.border }, { backgroundColor: theme.surface }]}>
                    <Search size={20} color={theme.textMuted} />
                    <TextInput
                        placeholder={`Buscar ${activeTab === 'walkers' ? 'paseadores' : 'cuidadores'}...`}
                        placeholderTextColor={theme.textMuted}
                        style={[styles.searchInput, { color: theme.text }]}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {isLoading ? (
                <SkeletonList count={4} />
            ) : (
                <FlatList
            refreshControl={<AppRefreshControl />}
                    data={filteredData as any}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={{ color: theme.textMuted, textAlign: 'center' }}>No se encontraron profesionales disponibles.</Text>
                        </View>
                    }
                />
            )}
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: layout.screenPadding,
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    tab: {
        flex: 1,
        paddingVertical: spacing.md,
        borderRadius: 14,
        alignItems: 'center',
    },
    tabText: {
        fontSize: font.base,
        fontWeight: '700',
    },
    searchSection: {
        paddingHorizontal: layout.screenPadding,
        marginBottom: spacing.xl,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        height: 56,
        borderRadius: 16,
        gap: spacing.md,
        borderWidth: 1,
    },
    searchInput: {
        flex: 1,
        fontSize: font.xl,
    },
    list: {
        paddingHorizontal: layout.screenPadding,
        paddingBottom: 100,
    },
    card: {
        padding: spacing.lg,
        borderRadius: 24,
        marginBottom: spacing.lg,
        borderWidth: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        gap: spacing.lg,
        marginBottom: spacing.lg,
    },
    imageContainer: {
        position: 'relative',
    },
    profileImage: {
        width: 64,
        height: 64,
        borderRadius: 20,
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        backgroundColor: '#6366f1',
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#101c3d',
    },
    mainInfo: {
        flex: 1,
        justifyContent: 'center',
        gap: spacing.xs,
    },
    nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    name: {
        fontSize: font.xxl,
        fontWeight: '800',
    },
    ratingBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    ratingText: {
        fontSize: font.base,
        fontWeight: '700',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    location: {
        fontSize: font.md,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: spacing.lg,
        borderTopWidth: 1,
    },
    tagsContainer: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: 8,
    },
    tagText: {
        fontSize: font.xs,
        fontWeight: '700',
    },
    price: {
        fontSize: font.xxl,
        fontWeight: '800',
    },
    priceUnit: {
        fontSize: font.md,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        paddingTop: 60,
    }
});
