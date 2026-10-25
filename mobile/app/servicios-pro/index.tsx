import React from 'react';
import { SkeletonList } from '@/src/components/Skeleton';
import { StyleSheet, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useServiciosPro } from '@/src/hooks/servicios-pro/useServiciosPro';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import RoleGuard from '@/src/components/RoleGuard';
import EmptyState from '@/src/components/EmptyState';
import { Search, Star, ShieldCheck, MapPin, Dog, Cat, User, Users } from 'lucide-react-native';
import AppRefreshControl from '@/src/components/AppRefreshControl';
import { families, font, layout, spacing } from '@/constants/design';

export default function ServiciosProScreen() {
    return (
        <RoleGuard roles={['paseador', 'cuidador']} message="Servicios Pro es para cuentas de paseador o cuidador.">
            <ServiciosProDirectory />
        </RoleGuard>
    );
}

function ServiciosProDirectory() {
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
                        <View style={[styles.verifiedBadge, { backgroundColor: theme.success, borderColor: theme.surface }]}>
                            <ShieldCheck size={12} color={theme.onPrimary} />
                        </View>
                    )}
                </View>
                <View style={styles.mainInfo}>
                    <View style={styles.nameRow}>
                        <Text style={[styles.name, { color: theme.text }]}>{item.display_name}</Text>
                        <View style={styles.ratingBox}>
                            <Star size={14} color={theme.warning} fill={theme.warning} />
                            <Text style={[styles.ratingText, { color: theme.text }]}>{item.rating ? item.rating.toFixed(1) : 'Nuevo'}</Text>
                        </View>
                    </View>
                    <View style={styles.locationRow}>
                        <MapPin size={14} color={theme.textMuted} />
                        <Text style={[styles.location, { color: theme.textMuted }]}>{item.location || 'Ubicación no indicada'}</Text>
                    </View>
                    {item.is_verified ? (
                        <Text style={[styles.verifiedText, { color: theme.success }]}>Verificado por el equipo</Text>
                    ) : null}
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
                    <Text style={[styles.tabText, { color: activeTab === 'walkers' ? theme.onPrimary : theme.textMuted }]}>Paseadores</Text>
                </TouchableOpacity>
                <TouchableOpacity accessibilityRole="button"
                    style={[styles.tab, { backgroundColor: theme.overlay }, activeTab === 'sitters' && { backgroundColor: theme.primary }]}
                    onPress={() => setActiveTab('sitters')}
                >
                    <Text style={[styles.tabText, { color: activeTab === 'sitters' ? theme.onPrimary : theme.textMuted }]}>Cuidadores</Text>
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
                <FlashList
            refreshControl={<AppRefreshControl />}
                    data={filteredData as any}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <EmptyState
                            icon={<Users size={32} color={theme.textMuted} />}
                            title={searchQuery ? 'Sin resultados' : 'Aún no hay profesionales'}
                            subtitle={searchQuery ? 'No encontramos profesionales con esa búsqueda.' : 'Cuando un profesional se registre aparecerá aquí.'}
                            actionLabel={searchQuery ? 'Quitar búsqueda' : undefined}
                            onAction={searchQuery ? () => setSearchQuery('') : undefined}
                        />
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
        justifyContent: 'center',
    },
    tabText: {
        fontSize: font.base,
        fontFamily: families.bold,
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
        paddingBottom: layout.listClearance,
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
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
    },
    verifiedText: {
        fontSize: font.xs,
        fontFamily: families.bold,
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
        fontFamily: families.extrabold,
    },
    ratingBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    ratingText: {
        fontSize: font.base,
        fontFamily: families.bold,
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
        justifyContent: 'center',
    },
    tagText: {
        fontSize: font.xs,
        fontFamily: families.bold,
    },
    price: {
        fontSize: font.xxl,
        fontFamily: families.extrabold,
    },
    priceUnit: {
        fontSize: font.md,
        fontFamily: families.semibold,
    },
});
