import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Walker } from '../../src/services/paseadores';
import { Star, MapPin, Clock, Users, ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useWalkers } from '@/src/hooks/paseadores';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import SearchBar from '@/src/components/SearchBar';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import EmptyState from '@/src/components/EmptyState';

export default function PaseadoresScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const {
        walkers: filteredWalkers,
        isLoading,
        searchQuery,
        setSearchQuery,
    } = useWalkers();

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
                <TouchableOpacity 
                    style={[styles.contactButton, { backgroundColor: theme.primary }]}
                    onPress={() => router.push({ pathname: '/paseadores/[id]', params: { id: item.id, contact: 'true' } } as any)}
                >
                    <Text style={styles.contactButtonText}>Contactar</Text>
                    <ChevronRight size={16} color="#fff" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <ScreenContainer>
            <ScreenHeader
                title="🚶 Paseadores"
                subtitle="Encuentra al paseador perfecto para tu mascota"
            />

            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                    onPress={() => router.push('/paseadores/solicitudes' as any)}
                >
                    <Text style={[styles.actionButtonText, { color: theme.text }]}>📋 Mis Solicitudes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.primary, borderColor: theme.primary }]}
                    onPress={() => router.push('/directorio/nuevo' as any)}
                >
                    <Text style={[styles.actionButtonText, { color: '#fff' }]}>🐾 Quiero ser Paseador</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.searchWrapper}>
                <SearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Buscar por nombre o ubicación..."
                />
            </View>

            {isLoading ? (
                <LoadingOverlay message="Cargando paseadores..." />
            ) : (
                <FlatList
                    data={filteredWalkers}
                    renderItem={renderWalkerItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <EmptyState
                            icon={<Users size={32} color={theme.textMuted} />}
                            title={searchQuery ? 'Sin resultados' : 'No hay paseadores'}
                            subtitle={searchQuery ? 'No encontramos paseadores con esos criterios.' : 'No hay paseadores disponibles.'}
                        />
                    }
                />
            )}
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    actionButtons: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        gap: 12,
        marginBottom: 16,
    },
    actionButton: {
        flex: 1,
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        paddingHorizontal: 12,
    },
    actionButtonText: {
        fontSize: 13,
        fontWeight: '700',
        textAlign: 'center',
        lineHeight: 18,
    },
    searchWrapper: {
        marginHorizontal: 24,
        marginBottom: 20,
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

});
