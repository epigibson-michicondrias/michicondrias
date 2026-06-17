import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Venue } from '../../src/services/venues';
import { useTheme } from '@/src/hooks/useTheme';
import { useVenues } from '@/src/hooks/venues';
import { Building2, MapPin, Tag, ChevronRight } from 'lucide-react-native';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import SearchBar from '@/src/components/SearchBar';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import EmptyState from '@/src/components/EmptyState';

export default function EstablecimientosScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const {
        venues: filteredVenues,
        isLoading,
        searchQuery,
        setSearchQuery,
    } = useVenues();

    const renderVenueItem = ({ item }: { item: Venue }) => (
        <TouchableOpacity
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
                <TouchableOpacity style={[styles.arrowButton, { backgroundColor: theme.border + '40' }]}>
                    <ChevronRight size={16} color={theme.textMuted} />
                </TouchableOpacity>
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

            {item.discount_coupon && (
                <View style={[styles.discountBanner, { backgroundColor: '#f59e0b15' }]}>
                    <Tag size={14} color="#f59e0b" />
                    <Text style={[styles.discountText, { color: '#f59e0b' }]}>
                        Cupón: {item.discount_coupon}
                    </Text>
                    {item.discount_description && (
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
                title="🏢 Establecimientos"
                subtitle="Encuentra los mejores lugares para tu mascota"
            />

            <View style={{ marginHorizontal: 24, marginBottom: 20 }}>
                <SearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Buscar por nombre o dirección..."
                />
            </View>

            {isLoading ? (
                <LoadingOverlay message="Cargando establecimientos..." />
            ) : (
                <FlatList
                    data={filteredVenues}
                    renderItem={renderVenueItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <EmptyState
                            icon={<Building2 size={32} color={theme.textMuted} />}
                            title={searchQuery ? 'No encontramos establecimientos con esos criterios.' : 'No hay establecimientos disponibles.'}
                        />
                    }
                />
            )}
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    list: {
        paddingHorizontal: 24,
        paddingBottom: 100,
    },
    venueCard: {
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
    },
    venueHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
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
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 4,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    locationText: {
        fontSize: 14,
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
        gap: 8,
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    amenityTag: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    amenityText: {
        fontSize: 11,
        fontWeight: '600',
    },
    discountBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        padding: 12,
        borderRadius: 12,
        gap: 8,
    },
    discountText: {
        fontSize: 13,
        fontWeight: '700',
    },
    discountDesc: {
        fontSize: 12,
        flex: 1,
    },
});
