import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, FlatList, TextInput, ActivityIndicator, Dimensions, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getListings, Listing } from '../../src/services/adopciones';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ChevronLeft, Search, Heart, MapPin, Filter, Plus } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2;

export default function AdopcionesScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];
    const [searchQuery, setSearchQuery] = useState('');
    const [filterSpecies, setFilterSpecies] = useState('all');
    const [filterSize, setFilterSize] = useState('all');

    const { data: listings = [], isLoading } = useQuery({
        queryKey: ['adopciones-listings'],
        queryFn: getListings,
    });

    const filteredListings = listings.filter(l => {
        const matchesSearch = l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            l.breed?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            l.species?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesSpecies = filterSpecies === 'all' || l.species.toLowerCase() === filterSpecies.toLowerCase();
        const matchesSize = filterSize === 'all' || l.size?.toLowerCase() === filterSize.toLowerCase();

        return matchesSearch && matchesSpecies && matchesSize;
    });

    const renderItem = ({ item }: { item: Listing }) => {
        const getSpeciesColor = (species: string) => {
            switch (species.toLowerCase()) {
                case 'perro': return '#f59e0b';
                case 'gato': return '#ec4899';
                case 'ave': return '#3b82f6';
                default: return '#10b981';
            }
        };

        const speciesColor = getSpeciesColor(item.species);

        return (
            <TouchableOpacity
                style={[styles.card, { backgroundColor: theme.surface }]}
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

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <ChevronLeft size={24} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: theme.text }]}>Huellas Libres</Text>
                    <TouchableOpacity style={[styles.addBtn, { backgroundColor: theme.primary }]} onPress={() => router.push('/adopciones/nuevo')}>
                        <Plus size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
                <Text style={[styles.subtitle, { color: theme.textMuted }]}>Encuentra a tu nuevo mejor amigo</Text>

                <View style={styles.filterSection}>
                    <View style={[styles.searchBar, { backgroundColor: theme.surface }]}>
                        <Search size={20} color={theme.textMuted} />
                        <TextInput
                            placeholder="Busca por nombre, raza..."
                            placeholderTextColor={theme.textMuted}
                            style={[styles.searchInput, { color: theme.text }]}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll} contentContainerStyle={styles.chipsContainer}>
                        <FilterChip label="Todos" active={filterSpecies === 'all'} onPress={() => setFilterSpecies('all')} theme={theme} />
                        <FilterChip label="Perros" active={filterSpecies === 'perro'} onPress={() => setFilterSpecies('perro')} theme={theme} emoji="🐶" />
                        <FilterChip label="Gatos" active={filterSpecies === 'gato'} onPress={() => setFilterSpecies('gato')} theme={theme} emoji="🐱" />
                        <FilterChip label="Grandes" active={filterSize === 'grande'} onPress={() => setFilterSize('grande')} theme={theme} emoji="📏" />
                    </ScrollView>
                </View>
            </View>

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredListings}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    numColumns={2}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text style={{ fontSize: 60, marginBottom: 20 }}>🐕</Text>
                            <Text style={[styles.emptyTitle, { color: theme.text }]}>No hay michis ni lomitos</Text>
                            <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
                                Intenta con otra búsqueda o vuelve más tarde.
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

function FilterChip({ label, active, onPress, theme, emoji }: { label: string, active: boolean, onPress: () => void, theme: any, emoji?: string }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={[
                styles.chip,
                { backgroundColor: theme.surface, borderColor: theme.border },
                active && { backgroundColor: theme.primary, borderColor: theme.primary }
            ]}
        >
            {emoji && <Text style={{ marginRight: 4, fontSize: 12 }}>{emoji}</Text>}
            <Text style={[styles.chipText, { color: theme.textMuted }, active && { color: '#fff' }]}>{label}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 20,
    },
    addBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 56,
        paddingHorizontal: 16,
        borderRadius: 16,
        gap: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
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
        borderColor: 'rgba(255,255,255,0.05)',
    },
    imageWrapper: {
        height: 160,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    badge: {
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: 'rgba(0,0,0,0.4)',
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        fontSize: 14,
    },
    favBtn: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(239, 68, 68, 0.4)',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    info: {
        padding: 14,
        gap: 4,
    },
    name: {
        fontSize: 16,
        fontWeight: '800',
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
        backdropFilter: 'blur(10px)',
    },
    genderText: {
        fontSize: 16,
    },
    empty: {
        paddingTop: 80,
        alignItems: 'center',
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
    },
    filterSection: {
        marginTop: 16,
    },
    chipsScroll: {
        marginTop: 12,
    },
    chipsContainer: {
        gap: 8,
        paddingRight: 20,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    chipText: {
        fontSize: 13,
        fontWeight: '700',
    },
    emergencyBadge: {
        position: 'absolute',
        top: 10,
        left: 45,
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
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    speciesTag: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    speciesTagText: {
        fontSize: 10,
    }
});
