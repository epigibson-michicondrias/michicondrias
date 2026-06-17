import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Sitter } from '../../src/services/cuidadores';
import { useSitters } from '@/src/hooks/cuidadores';
import { useTheme } from '@/src/hooks/useTheme';
import { Star, MapPin, Clock, Home, ChevronRight, Shield } from 'lucide-react-native';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import DataList from '@/src/components/data/DataList';
import SearchBar from '@/src/components/SearchBar';
import FilterChip from '@/src/components/FilterChip';

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

    const listHeader = (
        <>
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
                <SearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Buscar por nombre o ubicación..."
                />

                <View style={styles.serviceFilterContainer}>
                    <FilterChip label="Todos" active={serviceFilter === ''} onPress={() => setServiceFilter('')} />
                    <FilterChip label="🏠 Guardería" active={serviceFilter === 'daycare'} onPress={() => setServiceFilter('daycare')} />
                    <FilterChip label="🌙 Hospedaje" active={serviceFilter === 'boarding'} onPress={() => setServiceFilter('boarding')} />
                </View>
            </View>
        </>
    );

    return (
        <ScreenContainer>
            <ScreenHeader
                title="🏠 Cuidadores"
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
        marginBottom: 20,
        gap: 12,
    },
    serviceFilterContainer: {
        flexDirection: 'row',
        gap: 8,
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
});
