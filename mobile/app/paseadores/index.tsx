import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Walker } from '../../src/services/paseadores';
import {
    Star,
    MapPin,
    Clock,
    Users,
    ChevronRight,
    SlidersHorizontal,
    X,
    Dog,
    Cat,
    Shield,
    Check,
} from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useWalkers } from '@/src/hooks/paseadores/useWalkers';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import SearchBar from '@/src/components/SearchBar';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import EmptyState from '@/src/components/EmptyState';
import AppRefreshControl from '@/src/components/AppRefreshControl';
import FilterChip from '@/src/components/FilterChip';
import BottomSheet from '@/src/components/BottomSheet';
import Button from '@/src/components/Button';
import { families, font, layout, radius, spacing, tint } from '@/constants/design';

export default function PaseadoresScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    const {
        walkers: filteredWalkers,
        isLoading,
        refetch,
        searchQuery,
        setSearchQuery,
        acceptsDogsOnly,
        setAcceptsDogsOnly,
        acceptsCatsOnly,
        setAcceptsCatsOnly,
        verifiedOnly,
        setVerifiedOnly,
        clearFilters,
        activeFiltersCount,
        hasActiveFilters,
    } = useWalkers();

    const renderWalkerItem = ({ item }: { item: Walker }) => (
        <TouchableOpacity accessibilityRole="button"
            style={[styles.walkerCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => router.push({ pathname: '/paseadores/[id]', params: { id: item.id } } as any)}
        >
            <View style={styles.walkerHeader}>
                <View style={[styles.avatarPlaceholder, { backgroundColor: theme.primary + '20' }]}>
                    <Text style={[styles.avatarText, { color: theme.primary }]}>
                        {(item.display_name || 'P').charAt(0).toUpperCase()}
                    </Text>
                </View>
                <View style={styles.walkerInfo}>
                    <Text style={[styles.walkerName, { color: theme.text }]}>{item.display_name || 'Paseador'}</Text>
                    <View style={styles.locationRow}>
                        <MapPin size={14} color={theme.textMuted} />
                        <Text style={[styles.locationText, { color: theme.textMuted }]}>
                            {item.location || 'Ubicación no disponible'}
                        </Text>
                    </View>
                </View>
                <View style={styles.ratingContainer}>
                    <Star size={16} color={theme.warning} fill={theme.warning} />
                    <Text style={[styles.ratingText, { color: theme.text }]}>
                        {item.rating ? item.rating.toFixed(1) : 'Nuevo'}
                    </Text>
                </View>
            </View>

            <View style={styles.walkerStats}>
                <View style={styles.statItem}>
                    <Users size={14} color={theme.textMuted} />
                    <Text style={[styles.statText, { color: theme.textMuted }]}>
                        {item.total_walks || 0} paseos
                    </Text>
                </View>
                <View style={styles.statItem}>
                    <Clock size={14} color={theme.textMuted} />
                    <Text style={[styles.statText, { color: theme.textMuted }]}>
                        {item.experience_years ?? 0} años exp.
                    </Text>
                </View>
            </View>

            <View style={styles.servicesContainer}>
                <View style={[styles.serviceTag, { backgroundColor: item.accepts_dogs ? theme.primary + '10' : theme.secondary + '10' }]}>
                    <Text style={[styles.serviceText, { color: item.accepts_dogs ? theme.primary : theme.secondary }]}>
                        {[item.accepts_dogs && 'Perros', item.accepts_cats && 'Gatos'].filter(Boolean).join(' y ') || 'Mascotas'}
                    </Text>
                </View>
                <View style={[styles.serviceTag, { backgroundColor: theme.secondary + '10' }]}>
                    <Text style={[styles.serviceText, { color: theme.secondary }]}>
                        Hasta {item.max_pets_per_walk} mascotas
                    </Text>
                </View>
                {item.is_verified && (
                    <View style={[styles.serviceTag, { backgroundColor: theme.success + tint.faint }]}>
                        <Shield size={12} color={theme.success} />
                        <Text style={[styles.serviceText, { color: theme.success }]}>
                            Verificado
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.walkerFooter}>
                <Text style={[styles.priceText, { color: theme.primary }]}>
                    {item.price_per_hour ? `$${item.price_per_hour}/hora` : item.price_per_walk ? `$${item.price_per_walk}/paseo` : 'Tarifa por acordar'}
                </Text>
                <View style={[styles.contactButton, { backgroundColor: theme.primary }]} accessible={false}>
                    <Text style={styles.contactButtonText}>Ver perfil</Text>
                    <ChevronRight size={16} color={theme.onPrimary} />
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Paseadores"
                subtitle="Encuentra al paseador perfecto para tu mascota"
            />

            <View style={styles.headerContainer}>
                <View style={styles.actionButtons}>
                    <TouchableOpacity accessibilityRole="button"
                        style={[styles.actionButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                        onPress={() => router.push('/paseadores/solicitudes' as any)}
                    >
                        <Text style={[styles.actionButtonText, { color: theme.text }]}>Mis solicitudes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity accessibilityRole="button"
                        style={[styles.actionButton, { backgroundColor: theme.primary, borderColor: theme.primary }]}
                        onPress={() => router.push('/perfil/partner' as any)}
                    >
                        <Text style={[styles.actionButtonText, { color: theme.onPrimary }]}>Quiero ser paseador</Text>
                    </TouchableOpacity>
                </View>

                {/* Búsqueda + Filtro */}
                <View style={styles.searchRow}>
                    <View style={styles.searchContainer}>
                        <SearchBar
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="Buscar por nombre o ubicación..."
                        />
                    </View>
                    <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel="Abrir filtros de paseadores"
                        style={[
                            styles.filterIconButton,
                            {
                                backgroundColor: activeFiltersCount > 0 ? theme.primary : theme.surface,
                                borderColor: activeFiltersCount > 0 ? theme.primary : theme.border,
                            },
                        ]}
                        onPress={() => setIsFilterModalOpen(true)}
                    >
                        <SlidersHorizontal
                            size={19}
                            color={activeFiltersCount > 0 ? theme.onPrimary : theme.text}
                        />
                        {activeFiltersCount > 0 && (
                            <View style={[styles.filterBadge, { backgroundColor: theme.error }]}>
                                <Text style={[styles.filterBadgeText, { color: '#FFFFFF' }]}>
                                    {activeFiltersCount}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Chips rápidos */}
                <View style={styles.quickFiltersWrapper}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContainer}>
                        {hasActiveFilters && (
                            <TouchableOpacity
                                accessibilityRole="button"
                                accessibilityLabel="Limpiar filtros"
                                style={[styles.clearPill, { backgroundColor: theme.surface, borderColor: theme.border }]}
                                onPress={clearFilters}
                            >
                                <X size={12} color={theme.textMuted} />
                                <Text style={[styles.clearPillText, { color: theme.textMuted }]}>Limpiar</Text>
                            </TouchableOpacity>
                        )}
                        <FilterChip label="Todos" active={!acceptsDogsOnly && !acceptsCatsOnly && !verifiedOnly} onPress={clearFilters} />
                        <FilterChip
                            label="Perros"
                            icon={<Dog size={14} color={acceptsDogsOnly ? theme.onPrimary : theme.warning} />}
                            active={acceptsDogsOnly}
                            onPress={() => setAcceptsDogsOnly(!acceptsDogsOnly)}
                        />
                        <FilterChip
                            label="Gatos"
                            icon={<Cat size={14} color={acceptsCatsOnly ? theme.onPrimary : theme.accent} />}
                            active={acceptsCatsOnly}
                            onPress={() => setAcceptsCatsOnly(!acceptsCatsOnly)}
                        />
                        <FilterChip
                            label="Verificados"
                            icon={<Shield size={14} color={verifiedOnly ? theme.onPrimary : theme.success} />}
                            active={verifiedOnly}
                            onPress={() => setVerifiedOnly(!verifiedOnly)}
                        />
                    </ScrollView>
                </View>
            </View>

            {isLoading ? (
                <LoadingOverlay message="Cargando paseadores..." />
            ) : (
                <FlatList
                    refreshControl={<AppRefreshControl />}
                    data={filteredWalkers}
                    renderItem={renderWalkerItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <EmptyState
                            icon={<Users size={32} color={theme.textMuted} />}
                            title={hasActiveFilters ? 'Sin resultados' : 'No hay paseadores'}
                            subtitle={hasActiveFilters ? 'No encontramos paseadores con esos criterios.' : 'No hay paseadores disponibles por el momento.'}
                            actionLabel={hasActiveFilters ? 'Quitar filtros' : undefined}
                            onAction={hasActiveFilters ? clearFilters : undefined}
                        />
                    }
                />
            )}

            {/* Modal Premium Homologado para Paseadores */}
            <BottomSheet
                visible={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                title="Filtros de paseadores"
            >
                <View style={styles.modalContent}>
                    <View style={styles.modalSubHeader}>
                        <Text style={[styles.modalSubTitle, { color: theme.textMuted }]}>
                            Encuentra paseadores ideales para la especie y necesidades de tu mascota
                        </Text>
                        {activeFiltersCount > 0 && (
                            <TouchableOpacity onPress={clearFilters} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                <Text style={[styles.modalResetText, { color: theme.primary }]}>Limpiar todo</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Especies aceptadas */}
                    <View style={styles.filterSectionGroup}>
                        <Text style={[styles.filterGroupTitle, { color: theme.text }]}>Especies aceptadas</Text>
                        <TouchableOpacity
                            style={[
                                styles.optionCard,
                                {
                                    backgroundColor: acceptsDogsOnly ? theme.primary + '10' : theme.surface,
                                    borderColor: acceptsDogsOnly ? theme.primary : theme.border,
                                },
                            ]}
                            onPress={() => setAcceptsDogsOnly(!acceptsDogsOnly)}
                        >
                            <View style={[styles.optionIconBox, { backgroundColor: acceptsDogsOnly ? theme.primary + '20' : theme.background }]}>
                                <Dog size={18} color={acceptsDogsOnly ? theme.primary : theme.textMuted} />
                            </View>
                            <View style={styles.optionDetails}>
                                <Text style={[styles.optionCardText, { color: acceptsDogsOnly ? theme.primary : theme.text, fontFamily: families.bold }]}>
                                    Paseo de perros
                                </Text>
                                <Text style={[styles.optionCardSub, { color: theme.textMuted }]}>
                                    Paseos individuales o en grupo con correa y accesorios
                                </Text>
                            </View>
                            <View style={[styles.checkboxIndicator, { borderColor: acceptsDogsOnly ? theme.primary : theme.border, backgroundColor: acceptsDogsOnly ? theme.primary : 'transparent' }]}>
                                {acceptsDogsOnly && <Check size={12} color="#FFFFFF" />}
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.optionCard,
                                {
                                    backgroundColor: acceptsCatsOnly ? theme.primary + '10' : theme.surface,
                                    borderColor: acceptsCatsOnly ? theme.primary : theme.border,
                                },
                            ]}
                            onPress={() => setAcceptsCatsOnly(!acceptsCatsOnly)}
                        >
                            <View style={[styles.optionIconBox, { backgroundColor: acceptsCatsOnly ? theme.primary + '20' : theme.background }]}>
                                <Cat size={18} color={acceptsCatsOnly ? theme.primary : theme.textMuted} />
                            </View>
                            <View style={styles.optionDetails}>
                                <Text style={[styles.optionCardText, { color: acceptsCatsOnly ? theme.primary : theme.text, fontFamily: families.bold }]}>
                                    Paseo de gatos
                                </Text>
                                <Text style={[styles.optionCardSub, { color: theme.textMuted }]}>
                                    Con arnés especial o carriola para gatos tranquilos
                                </Text>
                            </View>
                            <View style={[styles.checkboxIndicator, { borderColor: acceptsCatsOnly ? theme.primary : theme.border, backgroundColor: acceptsCatsOnly ? theme.primary : 'transparent' }]}>
                                {acceptsCatsOnly && <Check size={12} color="#FFFFFF" />}
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Verificación */}
                    <View style={styles.filterSectionGroup}>
                        <Text style={[styles.filterGroupTitle, { color: theme.text }]}>Seguridad y confianza</Text>
                        <TouchableOpacity
                            style={[
                                styles.optionCard,
                                {
                                    backgroundColor: verifiedOnly ? theme.success + '10' : theme.surface,
                                    borderColor: verifiedOnly ? theme.success : theme.border,
                                },
                            ]}
                            onPress={() => setVerifiedOnly(!verifiedOnly)}
                        >
                            <View style={[styles.optionIconBox, { backgroundColor: verifiedOnly ? theme.success + '20' : theme.background }]}>
                                <Shield size={18} color={verifiedOnly ? theme.success : theme.textMuted} />
                            </View>
                            <View style={styles.optionDetails}>
                                <Text style={[styles.optionCardText, { color: verifiedOnly ? theme.success : theme.text, fontFamily: families.bold }]}>
                                    Paseador verificado
                                </Text>
                                <Text style={[styles.optionCardSub, { color: theme.textMuted }]}>
                                    Identidad validada y calificaciones comprobadas
                                </Text>
                            </View>
                            <View style={[styles.checkboxIndicator, { borderColor: verifiedOnly ? theme.success : theme.border, backgroundColor: verifiedOnly ? theme.success : 'transparent' }]}>
                                {verifiedOnly && <Check size={12} color="#FFFFFF" />}
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View style={styles.modalFooter}>
                        <Button
                            label="Restablecer"
                            variant="secondary"
                            onPress={clearFilters}
                            style={styles.footerBtnHalf}
                        />
                        <Button
                            label={`Ver ${filteredWalkers.length} ${filteredWalkers.length === 1 ? 'paseador' : 'paseadores'}`}
                            variant="primary"
                            onPress={() => setIsFilterModalOpen(false)}
                            style={styles.footerBtnHalf}
                        />
                    </View>
                </View>
            </BottomSheet>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        marginBottom: spacing.md,
    },
    actionButtons: {
        flexDirection: 'row',
        paddingHorizontal: layout.screenPadding,
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    actionButton: {
        flex: 1,
        height: 48,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        paddingHorizontal: spacing.sm,
    },
    actionButtonText: {
        fontSize: font.sm,
        fontFamily: families.bold,
        textAlign: 'center',
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: layout.screenPadding,
        gap: spacing.sm,
    },
    searchContainer: {
        flex: 1,
    },
    filterIconButton: {
        width: 46,
        height: 46,
        borderRadius: radius.md,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    filterBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    filterBadgeText: {
        fontSize: 10,
        fontFamily: families.bold,
    },
    quickFiltersWrapper: {
        marginTop: spacing.xs,
    },
    chipsContainer: {
        alignItems: 'center',
        paddingHorizontal: layout.screenPadding,
        gap: spacing.xs,
    },
    clearPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: spacing.sm,
        paddingVertical: 6,
        borderRadius: radius.pill,
        borderWidth: 1,
    },
    clearPillText: {
        fontSize: font.xs,
        fontFamily: families.medium,
    },
    list: {
        paddingHorizontal: layout.screenPadding,
        paddingBottom: layout.listClearance,
    },
    walkerCard: {
        padding: spacing.lg,
        borderRadius: radius.lg,
        marginBottom: spacing.md,
        borderWidth: 1,
    },
    walkerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
        gap: spacing.md,
    },
    avatarPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: font.xl,
        fontFamily: families.bold,
    },
    walkerInfo: {
        flex: 1,
    },
    walkerName: {
        fontSize: font.lg,
        fontFamily: families.bold,
        marginBottom: 2,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    locationText: {
        fontSize: font.xs,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: font.sm,
        fontFamily: families.bold,
    },
    walkerStats: {
        flexDirection: 'row',
        gap: spacing.lg,
        marginBottom: spacing.md,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statText: {
        fontSize: font.xs,
    },
    servicesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
        marginBottom: spacing.md,
    },
    serviceTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: radius.xs,
    },
    serviceText: {
        fontSize: font.xs,
        fontFamily: families.medium,
    },
    walkerFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: '#00000010',
    },
    priceText: {
        fontSize: font.base,
        fontFamily: families.bold,
    },
    contactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.md,
    },
    contactButtonText: {
        fontSize: font.xs,
        fontFamily: families.bold,
        color: '#FFFFFF',
    },

    // Modal
    modalContent: {
        gap: spacing.lg,
        paddingBottom: spacing.xl,
    },
    modalSubHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modalSubTitle: {
        fontSize: font.xs,
        flex: 1,
        marginRight: spacing.sm,
    },
    modalResetText: {
        fontSize: font.xs,
        fontFamily: families.bold,
    },
    filterSectionGroup: {
        gap: spacing.xs,
    },
    filterGroupTitle: {
        fontSize: 13,
        fontFamily: families.bold,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.sm + 2,
        borderRadius: radius.md,
        borderWidth: 1,
        gap: spacing.sm,
    },
    optionIconBox: {
        width: 32,
        height: 32,
        borderRadius: radius.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionDetails: {
        flex: 1,
    },
    optionCardText: {
        fontSize: font.sm,
    },
    optionCardSub: {
        fontSize: font.xs,
        marginTop: 2,
    },
    checkboxIndicator: {
        width: 18,
        height: 18,
        borderRadius: 4,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalFooter: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginTop: spacing.sm,
    },
    footerBtnHalf: {
        flex: 1,
    },
});
