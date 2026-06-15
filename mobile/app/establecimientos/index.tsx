import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { searchVenues, Venue } from '../../src/services/venues';
import { useColorScheme } from '@/components/useColorScheme';
import { Building2, MapPin, Star, Tag, ChevronRight, Search } from 'lucide-react-native';

export default function EstablecimientosScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? {
        background: '#000',
        text: '#fff',
        textMuted: '#999',
        surface: '#111',
        border: '#333',
        primary: '#7c3aed',
        secondary: '#10b981',
    } : {
        background: '#fff',
        text: '#000',
        textMuted: '#666',
        surface: '#f9f9f9',
        border: '#e5e5e5',
        primary: '#7c3aed',
        secondary: '#10b981',
    };

    const [searchQuery, setSearchQuery] = useState('');

    const { data: venues = [], isLoading } = useQuery<Venue[]>({
        queryKey: ['venues'],
        queryFn: () => searchVenues(),
    });

    const filteredVenues = venues.filter(venue =>
        venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.address.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>🏢 Establecimientos</Text>
                <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                    Encuentra los mejores lugares para tu mascota
                </Text>
            </View>

            <View style={[styles.searchContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Search size={20} color={theme.textMuted} />
                <TextInput
                    placeholder="🔍 Buscar por nombre o dirección..."
                    placeholderTextColor={theme.textMuted}
                    style={[styles.searchInput, { color: theme.text }]}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={[styles.loadingText, { color: theme.textMuted }]}>Cargando establecimientos...</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredVenues}
                    renderItem={renderVenueItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Building2 size={48} color={theme.textMuted} style={{ opacity: 0.5 }} />
                            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                                {searchQuery ? 'No encontramos establecimientos con esos criterios.' : 'No hay establecimientos disponibles.'}
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 24,
        paddingTop: 60,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        opacity: 0.8,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 24,
        marginBottom: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 12,
        borderWidth: 1,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        fontSize: 16,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        gap: 16,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
    },
});
