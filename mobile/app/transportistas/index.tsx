import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useTransporters } from '@/src/hooks/rides/useTransporters';
import { DriverProfile } from '@/src/services/rides';
import { useAuth } from '@/src/contexts/AuthContext';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { Car, Users, Snowflake, Box, CheckCircle2, Plus, Clock, User, Inbox, Route, Star, AlertCircle } from 'lucide-react-native';
import SearchBar from '@/src/components/SearchBar';
import { SkeletonList } from '@/src/components/Skeleton';
import EmptyState from '@/src/components/EmptyState';

export default function TransportistasScreen() {
    const { theme } = useTheme();
    const { user } = useAuth();
    const { searchQuery, setSearchQuery, drivers, isLoading, isError, isRefetching, refetch, router } = useTransporters();

    const rawRole = user?.role_name || '';
    const isDriver = rawRole === 'transportista' || rawRole === 'driver' || rawRole === 'admin';
    // Un conductor ve el directorio pero no se pide viaje a sí mismo
    const canRequest = rawRole !== 'transportista' && rawRole !== 'driver';

    const renderDriverItem = ({ item }: { item: DriverProfile }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
            // driver_id es el id de USUARIO del conductor (item.id es el del perfil y no sirve para el viaje)
            onPress={canRequest ? () => router.push(`/transportistas/solicitar?driver_id=${item.driver_id}` as any) : undefined}
            disabled={!canRequest}
            accessibilityRole={canRequest ? 'button' : undefined}
            accessibilityLabel={`${item.vehicle_model}, placa ${item.vehicle_plate}${item.is_available ? ', disponible' : ''}${canRequest ? '. Pedir viaje' : ''}`}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
                    <Car size={24} color={theme.primary} />
                </View>
                <View style={styles.cardInfo}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>{item.vehicle_model}</Text>
                    <Text style={[styles.cardPlate, { color: theme.textMuted }]}>{item.vehicle_plate}</Text>
                    {item.rating_avg != null && (
                        <View style={styles.ratingRow}>
                            <Star size={12} color={theme.warning} fill={theme.warning} />
                            <Text style={[styles.tagText, { color: theme.textMuted }]}>
                                {item.rating_avg.toFixed(1)} ({item.rating_count ?? 0})
                            </Text>
                        </View>
                    )}
                </View>
                {item.is_available && (
                    <View style={[styles.availableBadge, { backgroundColor: theme.secondary + '20' }]}>
                        <CheckCircle2 size={14} color={theme.secondary} />
                        <Text style={[styles.availableText, { color: theme.secondary }]}>Disponible</Text>
                    </View>
                )}
            </View>

            <View style={styles.tagsRow}>
                <View style={[styles.tag, { backgroundColor: theme.background }]}>
                    <Users size={12} color={theme.textMuted} />
                    <Text style={[styles.tagText, { color: theme.textMuted }]}>{item.max_capacity} mascotas</Text>
                </View>
                {item.has_air_conditioning && (
                    <View style={[styles.tag, { backgroundColor: theme.info + '20' }]}>
                        <Snowflake size={12} color={theme.info} />
                        <Text style={[styles.tagText, { color: theme.info }]}>A/C</Text>
                    </View>
                )}
                {item.has_carriers && (
                    <View style={[styles.tag, { backgroundColor: theme.warning + '20' }]}>
                        <Box size={12} color={theme.warning} />
                        <Text style={[styles.tagText, { color: theme.warning }]}>Transportín</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <ScreenContainer>
            <ScreenHeader
                title="🚗 Transportistas"
                subtitle="Transporte seguro para tu mascota"
            />

            <View style={styles.actionButtons}>
                {isDriver && (
                    <>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: theme.primary }]}
                            onPress={() => router.push('/transportistas/solicitudes' as any)}
                            accessibilityRole="button"
                            accessibilityLabel="Ver solicitudes de viaje"
                        >
                            <Inbox size={18} color="#fff" />
                            <Text style={[styles.actionButtonText, { color: '#fff' }]}>Solicitudes</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: theme.secondary }]}
                            onPress={() => router.push('/transportistas/perfil-conductor' as any)}
                            accessibilityRole="button"
                            accessibilityLabel="Mi vehículo"
                        >
                            <User size={18} color="#fff" />
                            <Text style={[styles.actionButtonText, { color: '#fff' }]}>Mi vehículo</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: theme.secondary }]}
                            onPress={() => router.push('/transportistas/historial' as any)}
                            accessibilityRole="button"
                            accessibilityLabel="Historial de viajes"
                        >
                            <Clock size={18} color="#fff" />
                            <Text style={[styles.actionButtonText, { color: '#fff' }]}>Historial</Text>
                        </TouchableOpacity>
                    </>
                )}
                {canRequest && (
                    <>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: theme.primary }]}
                            onPress={() => router.push('/transportistas/solicitar' as any)}
                            accessibilityRole="button"
                            accessibilityLabel="Solicitar transporte"
                        >
                            <Plus size={18} color="#fff" />
                            <Text style={[styles.actionButtonText, { color: '#fff' }]}>Solicitar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: theme.secondary }]}
                            onPress={() => router.push('/transportistas/mis-viajes' as any)}
                            accessibilityRole="button"
                            accessibilityLabel="Mis viajes"
                        >
                            <Route size={18} color="#fff" />
                            <Text style={[styles.actionButtonText, { color: '#fff' }]}>Mis viajes</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>

            <View style={{ marginHorizontal: 24, marginBottom: 20 }}>
                <SearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Buscar por modelo o placa..."
                />
            </View>

            {isLoading ? (
                <View style={{ paddingHorizontal: 24 }}>
                    <SkeletonList count={3} />
                </View>
            ) : (
                <FlatList
                    data={drivers}
                    renderItem={renderDriverItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.primary} />}
                    ListEmptyComponent={
                        isError ? (
                            <EmptyState
                                icon={<AlertCircle size={32} color={theme.textMuted} />}
                                title="No pudimos cargar los transportistas"
                                subtitle="Revisa tu conexión e intenta de nuevo."
                                actionLabel="Reintentar"
                                onAction={refetch}
                            />
                        ) : (
                            <EmptyState
                                icon={<Car size={32} color={theme.textMuted} />}
                                title={searchQuery ? 'No se encontraron transportistas.' : 'No hay transportistas disponibles.'}
                                subtitle={searchQuery ? undefined : 'Puedes enviar una solicitud abierta y el primero en aceptar te atenderá.'}
                                actionLabel={!searchQuery && canRequest ? 'Solicitar transporte' : undefined}
                                onAction={!searchQuery && canRequest ? () => router.push('/transportistas/solicitar' as any) : undefined}
                            />
                        )
                    }
                />
            )}
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    actionButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 24,
        gap: 12,
        marginBottom: 16,
    },
    actionButton: {
        flexDirection: 'row',
        flexGrow: 1,
        minHeight: 44,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    list: {
        paddingHorizontal: 24,
        paddingBottom: 100,
    },
    card: {
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 16,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardInfo: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 4,
    },
    cardPlate: {
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 1,
    },
    availableBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 4,
    },
    availableText: {
        fontSize: 12,
        fontWeight: '600',
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 4,
    },
    tagText: {
        fontSize: 12,
        fontWeight: '600',
    },
});
