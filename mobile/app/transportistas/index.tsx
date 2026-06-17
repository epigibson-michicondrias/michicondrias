import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useTransporters } from '@/src/hooks/rides/useTransporters';
import { DriverProfile } from '@/src/services/rides';
import { useAuth } from '@/src/contexts/AuthContext';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { Car, Users, Snowflake, Box, CheckCircle2, Plus, Clock, User } from 'lucide-react-native';
import SearchBar from '@/src/components/SearchBar';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import EmptyState from '@/src/components/EmptyState';

export default function TransportistasScreen() {
    const { theme } = useTheme();
    const { user } = useAuth();
    const { searchQuery, setSearchQuery, drivers, isLoading, router } = useTransporters();

    const rawRole = user?.role_name || '';
    const isDriver = rawRole === 'transportista' || rawRole === 'driver' || rawRole === 'admin';

    const renderDriverItem = ({ item }: { item: DriverProfile }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => {}}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
                    <Car size={24} color={theme.primary} />
                </View>
                <View style={styles.cardInfo}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>{item.vehicle_model}</Text>
                    <Text style={[styles.cardPlate, { color: theme.textMuted }]}>{item.vehicle_plate}</Text>
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
                    <View style={[styles.tag, { backgroundColor: '#06b6d420' }]}>
                        <Snowflake size={12} color="#06b6d4" />
                        <Text style={[styles.tagText, { color: '#06b6d4' }]}>A/C</Text>
                    </View>
                )}
                {item.has_carriers && (
                    <View style={[styles.tag, { backgroundColor: '#f59e0b20' }]}>
                        <Box size={12} color="#f59e0b" />
                        <Text style={[styles.tagText, { color: '#f59e0b' }]}>Transportín</Text>
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
                {isDriver ? (
                    <>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: theme.primary }]}
                            onPress={() => router.push('/transportistas/perfil-conductor' as any)}
                        >
                            <User size={18} color="#fff" />
                            <Text style={[styles.actionButtonText, { color: '#fff' }]}>Mi Vehículo</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: theme.secondary }]}
                            onPress={() => router.push('/transportistas/historial' as any)}
                        >
                            <Clock size={18} color="#fff" />
                            <Text style={[styles.actionButtonText, { color: '#fff' }]}>Viajes</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.primary }]}
                        onPress={() => router.push('/transportistas/solicitar' as any)}
                    >
                        <Plus size={18} color="#fff" />
                        <Text style={[styles.actionButtonText, { color: '#fff' }]}>Solicitar Transporte</Text>
                    </TouchableOpacity>
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
                <LoadingOverlay message="Cargando transportistas..." />
            ) : (
                <FlatList
                    data={drivers}
                    renderItem={renderDriverItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <EmptyState
                            icon={<Car size={32} color={theme.textMuted} />}
                            title={searchQuery ? 'No se encontraron transportistas.' : 'No hay transportistas disponibles.'}
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
        flexDirection: 'row',
        flex: 1,
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
