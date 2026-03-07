import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { listSitters, Sitter } from '../../src/services/cuidadores';
import { useColorScheme } from '@/components/useColorScheme';
import { Search, Star, MapPin, Clock, Home, Users, ChevronRight, Shield } from 'lucide-react-native';

export default function CuidadoresScreen() {
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
    const [serviceFilter, setServiceFilter] = useState<string>('');

    const { data: sitters = [], isLoading } = useQuery<Sitter[]>({
        queryKey: ['sitters'],
        queryFn: () => listSitters(),
    });

    const filteredSitters = sitters.filter(sitter => {
        const matchSearch = sitter.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (sitter.location || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchService = !serviceFilter || sitter.service_type === serviceFilter || sitter.service_type === 'both';
        return matchSearch && matchService;
    });

    const renderSitterItem = ({ item }: { item: Sitter }) => (
        <TouchableOpacity
            style={[styles.sitterCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => router.push({ pathname: '/cuidadores/[id]', params: { id: item.id } } as any)}
        >
            <View style={styles.sitterHeader}>
                <View style={[styles.avatarPlaceholder, { backgroundColor: theme.secondary + '20' }]}>
                    <Text style={[styles.avatarText, { color: theme.secondary }]}>
                        {item.display_name.charAt(0).toUpperCase()}
                    </Text>
                </View>
                <View style={styles.sitterInfo}>
                    <Text style={[styles.sitterName, { color: theme.text }]}>{item.display_name}</Text>
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

            <View style={styles.sitterStats}>
                <View style={styles.statItem}>
                    <Home size={14} color={theme.textMuted} />
                    <Text style={[styles.statText, { color: theme.textMuted }]}>
                        {item.total_sits || 0} cuidades
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
                <View style={[styles.serviceTag, { backgroundColor: theme.secondary + '10' }]}>
                    <Text style={[styles.serviceText, { color: theme.secondary }]}>
                        {item.service_type === 'daycare' ? '🏠 Guardería' : 
                         item.service_type === 'boarding' ? '🌙 Hospedaje' : '🏠+🌙 Ambos'}
                    </Text>
                </View>
                <View style={[styles.serviceTag, { backgroundColor: theme.primary + '10' }]}>
                    <Text style={[styles.serviceText, { color: theme.primary }]}>
                        👥 {item.max_pets || 1} mascotas
                    </Text>
                </View>
                {item.is_verified && (
                    <View style={[styles.serviceTag, { backgroundColor: '#10b98120' }]}>
                        <Shield size={12} color="#10b981" />
                        <Text style={[styles.serviceText, { color: '#10b981' }]}>
                            Verificado
                        </Text>
                    </View>
                )}
                {item.has_yard && (
                    <View style={[styles.serviceTag, { backgroundColor: '#f59e0b20' }]}>
                        <Text style={[styles.serviceText, { color: '#f59e0b' }]}>
                            🏡 Patio propio
                        </Text>
                    </View>
                )}
            </View>

            <Text style={[styles.bioText, { color: theme.textMuted }]} numberOfLines={2}>
                {item.bio || 'Profesional dedicado al cuidado de mascotas con experiencia y amor.'}
            </Text>

            <View style={styles.sitterFooter}>
                <View style={styles.priceContainer}>
                    <Text style={[styles.priceText, { color: theme.primary }]}>
                        ${item.price_per_day || 30}
                    </Text>
                    <Text style={[styles.priceUnit, { color: theme.textMuted }]}>/día</Text>
                </View>
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
                <Text style={[styles.title, { color: theme.text }]}>🏠 Cuidadores</Text>
                <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                    Deja a tu mascota en las mejores manos mientras no estás
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
                    <Text style={[styles.actionButtonText, { color: '#fff' }]}>🐾 Quiero ser Cuidador</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.filtersContainer}>
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
                
                <View style={styles.serviceFilterContainer}>
                    <TouchableOpacity
                        style={[
                            styles.filterButton,
                            serviceFilter === '' && styles.filterButtonActive,
                            { 
                                backgroundColor: serviceFilter === '' ? theme.primary : theme.surface,
                                borderColor: theme.border 
                            }
                        ]}
                        onPress={() => setServiceFilter('')}
                    >
                        <Text style={[
                            styles.filterButtonText,
                            { color: serviceFilter === '' ? '#fff' : theme.text }
                        ]}>
                            Todos
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.filterButton,
                            serviceFilter === 'daycare' && styles.filterButtonActive,
                            { 
                                backgroundColor: serviceFilter === 'daycare' ? theme.primary : theme.surface,
                                borderColor: theme.border 
                            }
                        ]}
                        onPress={() => setServiceFilter('daycare')}
                    >
                        <Text style={[
                            styles.filterButtonText,
                            { color: serviceFilter === 'daycare' ? '#fff' : theme.text }
                        ]}>
                            🏠 Guardería
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.filterButton,
                            serviceFilter === 'boarding' && styles.filterButtonActive,
                            { 
                                backgroundColor: serviceFilter === 'boarding' ? theme.primary : theme.surface,
                                borderColor: theme.border 
                            }
                        ]}
                        onPress={() => setServiceFilter('boarding')}
                    >
                        <Text style={[
                            styles.filterButtonText,
                            { color: serviceFilter === 'boarding' ? '#fff' : theme.text }
                        ]}>
                            🌙 Hospedaje
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={[styles.loadingText, { color: theme.textMuted }]}>Cargando cuidadores...</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredSitters}
                    renderItem={renderSitterItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                                {searchQuery || serviceFilter ? 
                                    'No encontramos cuidadores con esos criterios.' : 
                                    'No hay cuidadores disponibles.'
                                }
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
    filtersContainer: {
        paddingHorizontal: 24,
        marginBottom: 20,
        gap: 12,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
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
    serviceFilterContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    filterButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
    },
    filterButtonActive: {
        borderColor: 'transparent',
    },
    filterButtonText: {
        fontSize: 12,
        fontWeight: '600',
    },
    list: {
        paddingHorizontal: 24,
        paddingBottom: 100,
    },
    sitterCard: {
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
    },
    sitterHeader: {
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
    sitterInfo: {
        flex: 1,
    },
    sitterName: {
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
    sitterStats: {
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
        marginBottom: 12,
    },
    serviceTag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 4,
    },
    serviceText: {
        fontSize: 11,
        fontWeight: '600',
    },
    bioText: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 16,
    },
    sitterFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 2,
    },
    priceText: {
        fontSize: 18,
        fontWeight: '800',
    },
    priceUnit: {
        fontSize: 14,
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
