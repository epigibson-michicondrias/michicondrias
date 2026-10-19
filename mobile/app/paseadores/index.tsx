import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Walker } from '../../src/services/paseadores';
import { Star, MapPin, Clock, Users, ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useWalkers } from '@/src/hooks/paseadores/useWalkers';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import SearchBar from '@/src/components/SearchBar';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import EmptyState from '@/src/components/EmptyState';
import AppRefreshControl from '@/src/components/AppRefreshControl';
import { font, spacing, layout } from '@/constants/design';

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
        <TouchableOpacity accessibilityRole="button"
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
                    <Star size={16} color={theme.warning} fill={theme.warning} />
                    <Text style={[styles.ratingText, { color: theme.text }]}>
                        {item.rating ? item.rating.toFixed(1) : 'Nuevo'}
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
                        {item.experience_years ?? 0} años exp.
                    </Text>
                </View>
            </View>

            <View style={styles.servicesContainer}>
                <View style={[styles.serviceTag, { backgroundColor: item.accepts_dogs ? theme.primary + '10' : theme.secondary + '10' }]}>
                    <Text style={[styles.serviceText, { color: item.accepts_dogs ? theme.primary : theme.secondary }]}>
                        {[item.accepts_dogs && 'Perros', item.accepts_cats && 'Gatos'].filter(Boolean).join(' y ') || 'Mascotas'}
                    </Text>
                </View>
                <View style={[styles.serviceTag, { backgroundColor: theme.secondary + '10' }]}>
                    <Text style={[styles.serviceText, { color: theme.secondary }]}>
                        Hasta {item.max_pets_per_walk} mascotas
                    </Text>
                </View>
                {item.is_verified && (
                    <View style={[styles.serviceTag, { backgroundColor: '#10b98120' }]}>
                        <Text style={[styles.serviceText, { color: theme.success }]}>
                            Verificado
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.walkerFooter}>
                <Text style={[styles.priceText, { color: theme.primary }]}>
                    {item.price_per_hour ? `$${item.price_per_hour}/hora` : item.price_per_walk ? `$${item.price_per_walk}/paseo` : 'Tarifa por acordar'}
                </Text>
                <TouchableOpacity accessibilityRole="button" 
                    style={[styles.contactButton, { backgroundColor: theme.primary }]}
                    onPress={() => router.push({ pathname: '/paseadores/[id]', params: { id: item.id } } as any)}
                >
                    <Text style={styles.contactButtonText}>Ver perfil</Text>
                    <ChevronRight size={16} color={theme.onPrimary} />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Paseadores"
                subtitle="Encuentra al paseador perfecto para tu mascota"
            />

            <View style={styles.actionButtons}>
                <TouchableOpacity accessibilityRole="button"
                    style={[styles.actionButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                    onPress={() => router.push('/paseadores/solicitudes' as any)}
                >
                    <Text style={[styles.actionButtonText, { color: theme.text }]}>Mis solicitudes</Text>
                </TouchableOpacity>
                <TouchableOpacity accessibilityRole="button"
                    style={[styles.actionButton, { backgroundColor: theme.primary, borderColor: theme.primary }]}
                    onPress={() => router.push('/perfil/partner' as any)}
                >
                    <Text style={[styles.actionButtonText, { color: theme.onPrimary }]}>Quiero ser paseador</Text>
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
            refreshControl={<AppRefreshControl />}
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
        paddingHorizontal: layout.screenPadding,
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
        fontWeight: '700',
        textAlign: 'center',
        lineHeight: 18,
    },
    searchWrapper: {
        marginHorizontal: layout.screenPadding,
        marginBottom: spacing.xl,
    },
    list: {
        paddingHorizontal: layout.screenPadding,
        paddingBottom: 100,
    },
    walkerCard: {
        padding: spacing.xl,
        borderRadius: 16,
        marginBottom: spacing.lg,
        borderWidth: 1,
    },
    walkerHeader: {
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
        fontWeight: '800',
    },
    walkerInfo: {
        flex: 1,
    },
    walkerName: {
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
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    ratingText: {
        fontSize: font.base,
        fontWeight: '600',
    },
    walkerStats: {
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
        marginBottom: spacing.lg,
    },
    serviceTag: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    serviceText: {
        fontSize: font.md,
        fontWeight: '600',
    },
    moreText: {
        fontSize: font.md,
        fontStyle: 'italic',
    },
    walkerFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    priceText: {
        fontSize: font.xl,
        fontWeight: '800',
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
        color: '#fff',
        fontSize: font.base,
        fontWeight: '600',
    },

});
