import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Sitter } from '../../src/services/cuidadores';
import { useSitters } from '@/src/hooks/cuidadores/useSitters';
import { useTheme } from '@/src/hooks/useTheme';
import { Star, MapPin, Clock, Home, ChevronRight, Shield } from 'lucide-react-native';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import DataList from '@/src/components/data/DataList';
import SearchBar from '@/src/components/SearchBar';
import FilterChip from '@/src/components/FilterChip';
import { families, font, layout, spacing, tint } from '@/constants/design';

export default function CuidadoresScreen() {
    const router = useRouter();
    const { theme } = useTheme();

    const {
        sitters,
        isLoading,
        refetch,
        isRefetching,
        searchQuery,
        setSearchQuery,
        serviceFilter,
        setServiceFilter,
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
                {/* Solo indicación visual: toda la tarjeta abre el perfil (un botón dentro de otro falla en web) */}
                <View style={[styles.contactButton, { backgroundColor: theme.primary }]} accessible={false}>
                    <Text style={styles.contactButtonText}>Ver perfil</Text>
                    <ChevronRight size={16} color={theme.onPrimary} />
                </View>
            </View>
        </TouchableOpacity>
    );

    const listHeader = (
        <>
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

            <View style={styles.filtersContainer}>
                <SearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Buscar por nombre o ubicación..."
                />

                <View style={styles.serviceFilterContainer}>
                    <FilterChip label="Todos" active={serviceFilter === ''} onPress={() => setServiceFilter('')} />
                    <FilterChip label="Hospedaje" active={serviceFilter === 'hosting'} onPress={() => setServiceFilter('hosting')} />
                    <FilterChip label="Visitas a domicilio" active={serviceFilter === 'visiting'} onPress={() => setServiceFilter('visiting')} />
                </View>
            </View>
        </>
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
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    actionButtons: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    actionButton: {
        flex: 1,
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        paddingHorizontal: spacing.md,
    },
    actionButtonText: {
        fontSize: font.base,
        fontFamily: families.bold,
        textAlign: 'center',
        lineHeight: 18,
    },
    filtersContainer: {
        marginBottom: spacing.xl,
        gap: spacing.md,
    },
    serviceFilterContainer: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    list: {
        paddingHorizontal: layout.screenPadding,
        paddingBottom: layout.listClearance,
    },
    sitterCard: {
        padding: spacing.xl,
        borderRadius: 16,
        marginBottom: spacing.lg,
        borderWidth: 1,
    },
    sitterHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
        gap: spacing.lg,
    },
    avatarPlaceholder: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: font.h2,
        fontFamily: families.extrabold,
    },
    sitterInfo: {
        flex: 1,
    },
    sitterName: {
        fontSize: font.xxl,
        fontFamily: families.extrabold,
        marginBottom: spacing.xs,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    locationText: {
        fontSize: font.base,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    ratingText: {
        fontSize: font.base,
        fontFamily: families.semibold,
    },
    sitterStats: {
        flexDirection: 'row',
        gap: spacing.lg,
        marginBottom: spacing.lg,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    statText: {
        fontSize: font.base,
    },
    servicesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    serviceTag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: 6,
        gap: spacing.xs,
        justifyContent: 'center',
    },
    serviceText: {
        fontSize: font.sm,
        fontFamily: families.semibold,
    },
    bioText: {
        fontSize: font.base,
        lineHeight: 20,
        marginBottom: spacing.lg,
    },
    sitterFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: spacing.xxs,
    },
    priceText: {
        fontSize: font.xxl,
        fontFamily: families.extrabold,
    },
    priceUnit: {
        fontSize: font.base,
    },
    contactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        borderRadius: 8,
        gap: spacing.sm,
        justifyContent: 'center',
    },
    contactButtonText: {
        fontSize: font.base,
        fontFamily: families.semibold,
    },
});
