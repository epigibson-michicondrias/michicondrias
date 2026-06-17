import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Dimensions, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { Heart, MapPin, Plus } from 'lucide-react-native';
import { useListings } from '@/src/hooks/adopciones';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import DataList from '@/src/components/data/DataList';
import SearchBar from '@/src/components/SearchBar';
import FilterChip from '@/src/components/FilterChip';
import type { Listing } from '@/src/types/adopciones';

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2;

export default function AdopcionesScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const {
        listings,
        isLoading,
        isRefetching,
        refetch,
        search,
        setSearch,
        speciesFilter,
        setSpeciesFilter,
        sizeFilter,
        setSizeFilter,
    } = useListings();

    const getSpeciesColor = (species: string) => {
        switch (species.toLowerCase()) {
            case 'perro': return '#f59e0b';
            case 'gato': return '#ec4899';
            case 'ave': return '#3b82f6';
            default: return '#10b981';
        }
    };

    const renderItem = ({ item }: { item: Listing }) => {
        const speciesColor = getSpeciesColor(item.species);
        return (
            <TouchableOpacity
                style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
                onPress={() => router.push(`/adopciones/${item.id}` as any)}
            >
                <View style={styles.imageWrapper}>
                    {item.photo_url ? (
                        <Image source={{ uri: item.photo_url }} style={styles.image} />
                    ) : (
                        <View style={[styles.imagePlaceholder, { backgroundColor: speciesColor + '10' }]}>
                            <Heart size={40} color={speciesColor} strokeWidth={1} />
                        </View>
                    )}
                    {item.is_emergency && (
                        <View style={styles.emergencyBadge}>
                            <Text style={styles.emergencyText}>🚨 URGENTE</Text>
                        </View>
                    )}
                    <View style={styles.cardOverlay} />
                    <View style={styles.genderBadge}>
                        <Text style={styles.genderText}>{item.gender === 'hembra' ? '♀️' : '♂️'}</Text>
                    </View>
                </View>
                <View style={styles.info}>
                    <View style={styles.nameRow}>
                        <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
                        <View style={[styles.speciesTag, { backgroundColor: speciesColor + '20' }]}>
                            <Text style={[styles.speciesTagText, { color: speciesColor }]}>{item.species.toUpperCase()}</Text>
                        </View>
                    </View>
                    <Text style={[styles.breed, { color: theme.textMuted }]} numberOfLines={1}>{item.breed || 'Mestizo'}</Text>
                    <View style={styles.location}>
                        <MapPin size={12} color={theme.primary} />
                        <Text style={[styles.locationText, { color: theme.textMuted }]} numberOfLines={1}>
                            {item.location || 'CDMX'}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const header = (
        <View style={styles.filterSection}>
            <SearchBar
                value={search}
                onChangeText={setSearch}
                placeholder="Busca por nombre, raza..."
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll} contentContainerStyle={styles.chipsContainer}>
                <FilterChip label="Todos" active={speciesFilter === 'all'} onPress={() => setSpeciesFilter('all')} />
                <FilterChip label="Perros" active={speciesFilter === 'perro'} onPress={() => setSpeciesFilter('perro')} />
                <FilterChip label="Gatos" active={speciesFilter === 'gato'} onPress={() => setSpeciesFilter('gato')} />
                <FilterChip label="Grandes" active={sizeFilter === 'grande'} onPress={() => setSizeFilter('grande')} />
            </ScrollView>
        </View>
    );

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Mascotas en Adopción"
                subtitle="Encuentra a tu nuevo mejor amigo"
                actionIcon={Plus}
                onAction={() => router.push('/adopciones/nuevo')}
            />

            <DataList
                data={listings}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                isLoading={isLoading}
                numColumns={2}
                onRefresh={refetch}
                isRefreshing={isRefetching}
                header={header}
                emptyIcon={<Text style={{ fontSize: 60 }}>🐕</Text>}
                emptyTitle="No hay michis ni lomitos"
                emptySubtitle="Intenta con otra búsqueda o vuelve más tarde."
                contentStyle={styles.list}
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    list: {
        paddingHorizontal: 22,
        paddingBottom: 40,
    },
    card: {
        width: cardWidth,
        margin: 8,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
    },
    imageWrapper: {
        height: 160,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    genderBadge: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    genderText: {
        fontSize: 16,
    },
    emergencyBadge: {
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: '#ef4444',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    emergencyText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '900',
    },
    info: {
        padding: 14,
        gap: 4,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    name: {
        fontSize: 16,
        fontWeight: '800',
        flex: 1,
    },
    speciesTag: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    speciesTagText: {
        fontSize: 10,
        fontWeight: '700',
    },
    breed: {
        fontSize: 12,
    },
    location: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    locationText: {
        fontSize: 11,
    },
    filterSection: {
        marginTop: 4,
        marginBottom: 8,
    },
    chipsScroll: {
        marginTop: 12,
    },
    chipsContainer: {
        gap: 8,
        paddingRight: 20,
    },
});
