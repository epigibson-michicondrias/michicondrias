import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Venue } from '../../src/services/venues';
import { useTheme } from '@/src/hooks/useTheme';
import { useVenues } from '@/src/hooks/venues/useVenues';
import { Building2, MapPin, Tag, ChevronRight } from 'lucide-react-native';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import SearchBar from '@/src/components/SearchBar';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import EmptyState from '@/src/components/EmptyState';
import AppRefreshControl from '@/src/components/AppRefreshControl';
import FilterChip from '@/src/components/FilterChip';
import { useAuth } from '@/src/contexts/AuthContext';
import { font, spacing } from '@/constants/design';

export default function EstablecimientosScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { user } = useAuth();
    const isVenueOwner = user?.role_name === 'establecimiento';
    const [onlyMine, setOnlyMine] = React.useState(false);
    const {
        venues: allVenues,
        isLoading,
        isError,
        refetch,
        searchQuery,
        setSearchQuery,
    } = useVenues();

    const filteredVenues = onlyMine ? allVenues.filter((v) => v.owner_id === user?.id) : allVenues;

    const renderVenueItem = ({ item }: { item: Venue }) => (
        <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`Ver ${item.name}`}
            style={[styles.venueCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => router.push({ pathname: '/establecimientos/[id]', params: { id: item.id } } as any)}
        >
            <View style={styles.venueHeader}>
                <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
                    <Building2 size={24} color={theme.primary} />
                </View>
                <View style={styles.venueInfo}>
                    <Text style={[styles.venueName, { color: theme.text }]}>{item.name}</Text>
                    <View style={styles.locationRow}>
                        <MapPin size={14} color={theme.textMuted} />
                        <Text style={[styles.locationText, { color: theme.textMuted }]} numberOfLines={1}>
                            {item.address}
                        </Text>
                    </View>
                </View>
                <View style={[styles.arrowButton, { backgroundColor: theme.border + '40' }]}>
                    <ChevronRight size={16} color={theme.textMuted} />
                </View>
            </View>

            {item.amenities && Object.keys(item.amenities).length > 0 && (
                <View style={styles.amenitiesContainer}>
                    {Object.entries(item.amenities).slice(0, 3).map(([key, value], index) => (
                        <View key={index} style={[styles.amenityTag, { backgroundColor: theme.secondary + '15' }]}>
                            <Text style={[styles.amenityText, { color: theme.secondary }]}>
                                {key}: {String(value)}
                            </Text>
                        </View>
                    ))}
                </View>
            )}

            {!!item.discount_coupon && (
                <View style={[styles.discountBanner, { backgroundColor: theme.warningLight }]}>
                    <Tag size={14} color={theme.warning} />
                    <Text style={[styles.discountText, { color: theme.warning }]}>
                        Cupón: {item.discount_coupon}
                    </Text>
                    {!!item.discount_description && (
                        <Text style={[styles.discountDesc, { color: theme.textMuted }]}>
                            - {item.discount_description}
                        </Text>
                    )}
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Establecimientos"
                subtitle="Encuentra los mejores lugares para tu mascota"
            />

            <View style={{ marginHorizontal: spacing.xxl, marginBottom: spacing.xl }}>
                <SearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Buscar por nombre o dirección..."
                />
            </View>

            {isVenueOwner && (
                <View style={{ flexDirection: 'row', gap: spacing.sm, marginHorizontal: spacing.xxl, marginBottom: spacing.md }}>
                    <FilterChip label="Todos" active={!onlyMine} onPress={() => setOnlyMine(false)} />
                    <FilterChip label="Mis locales" active={onlyMine} onPress={() => setOnlyMine(true)} />
                </View>
            )}

            {isLoading ? (
                <LoadingOverlay message="Cargando establecimientos..." />
            ) : (
                <FlatList
            refreshControl={<AppRefreshControl />}
                    data={filteredVenues}
                    renderItem={renderVenueItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        isError ? (
                            <EmptyState
                                icon={<Building2 size={32} color={theme.textMuted} />}
                                title="No se pudieron cargar los establecimientos"
                                subtitle="Revisa tu conexión e inténtalo de nuevo."
                                actionLabel="Reintentar"
                                onAction={() => refetch()}
                            />
                        ) : (
                            <EmptyState
                                icon={<Building2 size={32} color={theme.textMuted} />}
                                title={searchQuery ? 'No encontramos establecimientos con esos criterios.' : onlyMine ? 'Aún no has registrado locales.' : 'No hay establecimientos disponibles.'}
                                actionLabel={isVenueOwner && !searchQuery ? 'Registrar establecimiento' : undefined}
                                onAction={isVenueOwner && !searchQuery ? () => router.push('/establecimientos/nuevo' as any) : undefined}
                            />
                        )
                    }
                />
            )}
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    list: {
        paddingHorizontal: spacing.xxl,
        paddingBottom: 100,
    },
    venueCard: {
        padding: spacing.xl,
        borderRadius: 16,
        marginBottom: spacing.lg,
        borderWidth: 1,
    },
    venueHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    venueInfo: {
        flex: 1,
    },
    venueName: {
        fontSize: font.xxl,
        fontWeight: '800',
        marginBottom: spacing.xs,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    locationText: {
        fontSize: font.base,
        flex: 1,
    },
    arrowButton: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    amenitiesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginTop: spacing.lg,
        paddingTop: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: 'rgba(128,128,128,0.2)',
    },
    amenityTag: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: 8,
    },
    amenityText: {
        fontSize: font.sm,
        fontWeight: '600',
    },
    discountBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.md,
        padding: spacing.md,
        borderRadius: 12,
        gap: spacing.sm,
    },
    discountText: {
        fontSize: font.base,
        fontWeight: '700',
    },
    discountDesc: {
        fontSize: font.md,
        flex: 1,
    },
});
