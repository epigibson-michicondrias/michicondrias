import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { listWalkers, Walker } from '../../src/services/paseadores';
import { useColorScheme } from '@/components/useColorScheme';
import { Search, Star, MapPin, Clock, Users, ChevronRight, Plus } from 'lucide-react-native';

export default function PaseadoresScreen() {
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

    const { data: walkers = [], isLoading } = useQuery<Walker[]>({
        queryKey: ['walkers'],
        queryFn: () => listWalkers(),
    });

    const filteredWalkers = walkers.filter(walker =>
        walker.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (walker.location || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderWalkerItem = ({ item }: { item: Walker }) => (
        <TouchableOpacity
            style={[styles.walkerCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => router.push({ pathname: '/paseadores/[id]', params: { id: item.id } } as any)}
        >
            <View style={styles.walkerHeader}>
                <View style={[styles.avatarPlaceholder, { backgroundColor: theme.primary + '20' }]}>
                    <Text style={[styles.avatarText, { color: theme.primary }]}>
                        {item.display_name.charAt(0).toUpperCase()}
                    </Text>
                </View>
                <View style={styles.walkerInfo}>
                    <Text style={[styles.walkerName, { color: theme.text }]}>{item.display_name}</Text>
                    <View style={styles.locationRow}>
                        <MapPin size={14} color={theme.textMuted} />
                        <Text style={[styles.locationText, { color: theme.textMuted }]}>
                            {item.location || 'Ubicación no disponible'}
                        </Text>
                    </View>
                </View>
                <View style={styles.ratingContainer}>
                    <Star size={16} color="#fbbf24" fill="#fbbf24" />
                    <Text style={[styles.ratingText, { color: theme.text }]}>
                        {item.rating ? item.rating.toFixed(1) : '5.0'}
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
                        {item.experience_years || 1}+ años
                    </Text>
                </View>
            </View>

            <View style={styles.servicesContainer}>
                <View style={[styles.serviceTag, { backgroundColor: item.accepts_dogs ? theme.primary + '10' : theme.secondary + '10' }]}>
                    <Text style={[styles.serviceText, { color: item.accepts_dogs ? theme.primary : theme.secondary }]}>
                        {item.accepts_dogs ? '🐕 Perros' : '🐈 Gatos'}
                    </Text>
                </View>
                <View style={[styles.serviceTag, { backgroundColor: theme.secondary + '10' }]}>
                    <Text style={[styles.serviceText, { color: theme.secondary }]}>
                        👥 {item.max_pets_per_walk} mascotas
                    </Text>
                </View>
                {item.is_verified && (
                    <View style={[styles.serviceTag, { backgroundColor: '#10b98120' }]}>
                        <Text style={[styles.serviceText, { color: '#10b981' }]}>
                            ✅ Verificado
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.walkerFooter}>
                <Text style={[styles.priceText, { color: theme.primary }]}>
                    ${item.price_per_hour || 20}/hora
                </Text>
                <TouchableOpacity style={[styles.contactButton, { backgroundColor: theme.primary }]}>
                    <Text style={styles.contactButtonText}>Contactar</Text>
                    <ChevronRight size={16} color="#fff" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>🚶 Paseadores</Text>
                <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                    Encuentra al paseador perfecto para tu mascota
                </Text>
            </View>

            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                    onPress={() => router.push('/adopciones/solicitudes' as any)}
                >
                    <Text style={[styles.actionButtonText, { color: theme.text }]}>📋 Mis Solicitudes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.primary }]}
                    onPress={() => router.push('/directorio/nuevo' as any)}
                >
                    <Text style={[styles.actionButtonText, { color: '#fff' }]}>🐾 Quiero ser Paseador</Text>
                </TouchableOpacity>
            </View>

            <View style={[styles.searchContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Search size={20} color={theme.textMuted} />
                <TextInput
                    placeholder="🔍 Buscar por nombre o ubicación..."
                    placeholderTextColor={theme.textMuted}
                    style={[styles.searchInput, { color: theme.text }]}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={[styles.loadingText, { color: theme.textMuted }]}>Cargando paseadores...</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredWalkers}
                    renderItem={renderWalkerItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                                {searchQuery ? 'No encontramos paseadores con esos criterios.' : 'No hay paseadores disponibles.'}
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
    actionButtons: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        gap: 12,
        marginBottom: 16,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '600',
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
    walkerCard: {
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
    },
    walkerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 16,
    },
    avatarPlaceholder: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 24,
        fontWeight: '800',
    },
    walkerInfo: {
        flex: 1,
    },
    walkerName: {
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
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 14,
        fontWeight: '600',
    },
    walkerStats: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 16,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statText: {
        fontSize: 13,
    },
    servicesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    serviceTag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    serviceText: {
        fontSize: 12,
        fontWeight: '600',
    },
    moreText: {
        fontSize: 12,
        fontStyle: 'italic',
    },
    walkerFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    priceText: {
        fontSize: 16,
        fontWeight: '800',
    },
    contactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 6,
    },
    contactButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
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
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
    },
});
