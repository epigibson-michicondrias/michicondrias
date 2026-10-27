import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Sitter } from '../../src/services/cuidadores';
import { useSitters } from '@/src/hooks/cuidadores/useSitters';
import { useTheme } from '@/src/hooks/useTheme';
import {
    Star,
    MapPin,
    Clock,
    Home,
    ChevronRight,
    Shield,
    SlidersHorizontal,
    X,
    Dog,
    Cat,
    Trees,
    Check,
} from 'lucide-react-native';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import DataList from '@/src/components/data/DataList';
import SearchBar from '@/src/components/SearchBar';
import FilterChip from '@/src/components/FilterChip';
import BottomSheet from '@/src/components/BottomSheet';
import Button from '@/src/components/Button';
import { families, font, layout, radius, spacing, tint } from '@/constants/design';

export default function CuidadoresScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    const {
        sitters,
        isLoading,
        refetch,
        isRefetching,
        searchQuery,
        setSearchQuery,
        serviceFilter,
        setServiceFilter,
        hasYardOnly,
        setHasYardOnly,
        acceptsDogsOnly,
        setAcceptsDogsOnly,
        acceptsCatsOnly,
        setAcceptsCatsOnly,
        verifiedOnly,
        setVerifiedOnly,
        clearFilters,
        activeFiltersCount,
        hasActiveFilters,
    } = useSitters();

    const renderSitterItem = ({ item }: { item: Sitter }) => (
        <TouchableOpacity accessibilityRole="button"
            style={[styles.sitterCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => router.push({ pathname: '/cuidadores/[id]', params: { id: item.id } } as any)}
        >
            <View style={styles.sitterHeader}>
                <View style={[styles.avatarPlaceholder, { backgroundColor: theme.secondary + '20' }]}>
                    <Text style={[styles.avatarText, { color: theme.secondary }]}>
                        {(item.display_name || 'C').charAt(0).toUpperCase()}
                    </Text>
                </View>
                <View style={styles.sitterInfo}>
                    <Text style={[styles.sitterName, { color: theme.text }]}>{item.display_name || 'Cuidador'}</Text>
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

            <View style={styles.sitterStats}>
                <View style={styles.statItem}>
                    <Home size={14} color={theme.textMuted} />
                    <Text style={[styles.statText, { color: theme.textMuted }]}>
                        {item.total_sits || 0} cuidados
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
                <View style={[styles.serviceTag, { backgroundColor: theme.secondary + '10' }]}>
                    <Text style={[styles.serviceText, { color: theme.secondary }]}>
                        {item.service_type === 'hosting' ? 'Hospedaje' :
                         item.service_type === 'visiting' ? 'Visitas a domicilio' : 'Hospedaje y visitas'}
                    </Text>
                </View>
                <View style={[styles.serviceTag, { backgroundColor: theme.primary + '10' }]}>
                    <Text style={[styles.serviceText, { color: theme.primary }]}>
                        Hasta {item.max_pets || 1} mascotas
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
                {item.has_yard && (
                    <View style={[styles.serviceTag, { backgroundColor: theme.warning + tint.faint }]}>
                        <Text style={[styles.serviceText, { color: theme.warning }]}>
                            Patio propio
                        </Text>
                    </View>
                )}
            </View>

            <Text style={[styles.bioText, { color: theme.textMuted }]} numberOfLines={2}>
                {item.bio || 'Este cuidador aún no agregó una descripción.'}
            </Text>

            <View style={styles.sitterFooter}>
                <View style={styles.priceContainer}>
                    <Text style={[styles.priceText, { color: theme.primary }]}>
                        {item.price_per_day ? `$${item.price_per_day}` : item.price_per_visit ? `$${item.price_per_visit}` : 'Por acordar'}
                    </Text>
                    <Text style={[styles.priceUnit, { color: theme.textMuted }]}>/día</Text>
                </View>
                <View style={[styles.contactButton, { backgroundColor: theme.primary }]} accessible={false}>
                    <Text style={styles.contactButtonText}>Ver perfil</Text>
                    <ChevronRight size={16} color={theme.onPrimary} />
                </View>
            </View>
        </TouchableOpacity>
    );

    const listHeader = (
        <View style={styles.headerContainer}>
            <View style={styles.actionButtons}>
                <TouchableOpacity accessibilityRole="button"
                    style={[styles.actionButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                    onPress={() => router.push('/cuidadores/solicitudes' as any)}
                >
                    <Text style={[styles.actionButtonText, { color: theme.text }]}>Mis solicitudes</Text>
                </TouchableOpacity>
                <TouchableOpacity accessibilityRole="button"
                    style={[styles.actionButton, { backgroundColor: theme.primary, borderColor: theme.primary }]}
                    onPress={() => router.push('/perfil/partner' as any)}
                >
                    <Text style={[styles.actionButtonText, { color: theme.onPrimary }]}>Quiero ser cuidador</Text>
                </TouchableOpacity>
            </View>

            {/* Fila de búsqueda + botón de filtros homologado */}
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
                    accessibilityLabel="Abrir filtros de cuidadores"
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

            {/* Chips rápidos horizontales delgados */}
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
                    <FilterChip label="Todos" active={serviceFilter === '' && !hasYardOnly && !verifiedOnly} onPress={clearFilters} />
                    <FilterChip label="Hospedaje" active={serviceFilter === 'hosting'} onPress={() => setServiceFilter(serviceFilter === 'hosting' ? '' : 'hosting')} />
                    <FilterChip label="Visitas" active={serviceFilter === 'visiting'} onPress={() => setServiceFilter(serviceFilter === 'visiting' ? '' : 'visiting')} />
                    <FilterChip
                        label="Con patio"
                        icon={<Trees size={14} color={hasYardOnly ? theme.onPrimary : theme.warning} />}
                        active={hasYardOnly}
                        onPress={() => setHasYardOnly(!hasYardOnly)}
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
    );

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Cuidadores"
                subtitle="Deja a tu mascota en las mejores manos mientras no estás"
            />

            <DataList
                data={sitters}
                renderItem={renderSitterItem}
                keyExtractor={(item) => item.id}
                isLoading={isLoading}
                loadingMessage="Cargando cuidadores..."
                onRefresh={refetch}
                isRefreshing={isRefetching}
                header={listHeader}
                emptyIcon={<Star size={32} color={theme.textMuted} />}
                emptyTitle={hasActiveFilters
                    ? 'No encontramos cuidadores con esos criterios.'
                    : 'No hay cuidadores disponibles.'
                }
                contentStyle={styles.list}
            />

            {/* Modal Premium Homologado para Cuidadores */}
            <BottomSheet
                visible={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                title="Filtros de cuidadores"
            >
                <View style={styles.modalContent}>
                    <View style={styles.modalSubHeader}>
                        <Text style={[styles.modalSubTitle, { color: theme.textMuted }]}>
                            Filtra por modalidad de cuidado, especies y confianza
                        </Text>
                        {activeFiltersCount > 0 && (
                            <TouchableOpacity onPress={clearFilters} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                <Text style={[styles.modalResetText, { color: theme.primary }]}>Limpiar todo</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Modalidad de servicio */}
                    <View style={styles.filterSectionGroup}>
                        <Text style={[styles.filterGroupTitle, { color: theme.text }]}>Tipo de servicio</Text>
                        <View style={styles.optionsGrid}>
                            {[
                                { key: '', label: 'Cualquier modalidad', desc: 'Hospedaje o visitas a domicilio', icon: Home },
                                { key: 'hosting', label: 'Hospedaje en casa del cuidador', desc: 'Tu mascota duerme en su hogar', icon: Home },
                                { key: 'visiting', label: 'Visitas a tu domicilio', desc: 'El cuidador va a tu casa', icon: Clock },
                            ].map((item) => {
                                const isSelected = serviceFilter === item.key;
                                const IconComp = item.icon;
                                return (
                                    <TouchableOpacity
                                        key={item.key}
                                        style={[
                                            styles.optionCard,
                                            {
                                                backgroundColor: isSelected ? theme.primary + '10' : theme.surface,
                                                borderColor: isSelected ? theme.primary : theme.border,
                                            },
                                        ]}
                                        onPress={() => setServiceFilter(item.key)}
                                    >
                                        <View style={[styles.optionIconBox, { backgroundColor: isSelected ? theme.primary + '20' : theme.background }]}>
                                            <IconComp size={18} color={isSelected ? theme.primary : theme.textMuted} />
                                        </View>
                                        <View style={styles.optionDetails}>
                                            <Text style={[styles.optionCardText, { color: isSelected ? theme.primary : theme.text, fontFamily: isSelected ? families.bold : families.medium }]}>
                                                {item.label}
                                            </Text>
                                            <Text style={[styles.optionCardSub, { color: theme.textMuted }]}>
                                                {item.desc}
                                            </Text>
                                        </View>
                                        <View style={[styles.radioIndicator, { borderColor: isSelected ? theme.primary : theme.border }]}>
                                            {isSelected && <View style={[styles.radioDot, { backgroundColor: theme.primary }]} />}
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* Especies aceptadas */}
                    <View style={styles.filterSectionGroup}>
                        <Text style={[styles.filterGroupTitle, { color: theme.text }]}>Especies aceptadas</Text>
                        <View style={styles.optionsRow}>
                            <TouchableOpacity
                                style={[
                                    styles.pillOption,
                                    {
                                        backgroundColor: acceptsDogsOnly ? theme.primary : theme.surface,
                                        borderColor: acceptsDogsOnly ? theme.primary : theme.border,
                                    },
                                ]}
                                onPress={() => setAcceptsDogsOnly(!acceptsDogsOnly)}
                            >
                                <Dog size={14} color={acceptsDogsOnly ? theme.onPrimary : theme.text} />
                                <Text style={[styles.pillOptionText, { color: acceptsDogsOnly ? theme.onPrimary : theme.text, fontFamily: acceptsDogsOnly ? families.bold : families.medium }]}>
                                    Acepta perros
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.pillOption,
                                    {
                                        backgroundColor: acceptsCatsOnly ? theme.primary : theme.surface,
                                        borderColor: acceptsCatsOnly ? theme.primary : theme.border,
                                    },
                                ]}
                                onPress={() => setAcceptsCatsOnly(!acceptsCatsOnly)}
                            >
                                <Cat size={14} color={acceptsCatsOnly ? theme.onPrimary : theme.text} />
                                <Text style={[styles.pillOptionText, { color: acceptsCatsOnly ? theme.onPrimary : theme.text, fontFamily: acceptsCatsOnly ? families.bold : families.medium }]}>
                                    Acepta gatos
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Características y confianza */}
                    <View style={styles.filterSectionGroup}>
                        <Text style={[styles.filterGroupTitle, { color: theme.text }]}>Instalaciones y confianza</Text>
                        <TouchableOpacity
                            style={[
                                styles.optionCard,
                                {
                                    backgroundColor: hasYardOnly ? theme.warning + '10' : theme.surface,
                                    borderColor: hasYardOnly ? theme.warning : theme.border,
                                },
                            ]}
                            onPress={() => setHasYardOnly(!hasYardOnly)}
                        >
                            <View style={[styles.optionIconBox, { backgroundColor: hasYardOnly ? theme.warning + '20' : theme.background }]}>
                                <Trees size={18} color={hasYardOnly ? theme.warning : theme.textMuted} />
                            </View>
                            <View style={styles.optionDetails}>
                                <Text style={[styles.optionCardText, { color: hasYardOnly ? theme.warning : theme.text, fontFamily: families.bold }]}>
                                    Tiene patio o jardín privado
                                </Text>
                                <Text style={[styles.optionCardSub, { color: theme.textMuted }]}>
                                    Espacio al aire libre para que jueguen
                                </Text>
                            </View>
                            <View style={[styles.checkboxIndicator, { borderColor: hasYardOnly ? theme.warning : theme.border, backgroundColor: hasYardOnly ? theme.warning : 'transparent' }]}>
                                {hasYardOnly && <Check size={12} color="#FFFFFF" />}
                            </View>
                        </TouchableOpacity>

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
                                    Cuidador verificado
                                </Text>
                                <Text style={[styles.optionCardSub, { color: theme.textMuted }]}>
                                    Identidad y antecedentes revisados por el equipo
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
                            label={`Ver ${sitters.length} ${sitters.length === 1 ? 'cuidador' : 'cuidadores'}`}
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
    sitterCard: {
        padding: spacing.lg,
        borderRadius: radius.lg,
        marginBottom: spacing.md,
        borderWidth: 1,
    },
    sitterHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    avatarPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    avatarText: {
        fontSize: font.xl,
        fontFamily: families.bold,
    },
    sitterInfo: {
        flex: 1,
    },
    sitterName: {
        fontSize: font.lg,
        fontFamily: families.bold,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    locationText: {
        fontSize: font.xs,
        marginLeft: 4,
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
    sitterStats: {
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
    bioText: {
        fontSize: font.sm,
        lineHeight: 18,
        marginBottom: spacing.md,
    },
    sitterFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: '#00000010',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    priceText: {
        fontSize: font.xl,
        fontFamily: families.bold,
    },
    priceUnit: {
        fontSize: font.xs,
        marginLeft: 2,
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
    optionsGrid: {
        gap: spacing.xs,
    },
    optionsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
    },
    pillOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.pill,
        borderWidth: 1,
    },
    pillOptionText: {
        fontSize: font.sm,
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
    radioIndicator: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
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
