import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useWalkRequests } from '@/src/hooks/paseadores';
import { WalkRequest } from '@/src/services/paseadores';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { 
    Calendar, Clock, MapPin, Dog, ChevronRight,
    MessageCircle
} from 'lucide-react-native';
import { showAlert } from '@/src/components/AppAlert';
import SearchBar from '@/src/components/SearchBar';
import FilterChip from '@/src/components/FilterChip';
import EmptyState from '@/src/components/EmptyState';
import LoadingOverlay from '@/src/components/LoadingOverlay';

export default function WalkerRequestsScreen() {
    const { theme } = useTheme();
    const {
        requests: filteredRequests,
        isLoading,
        statusFilter,
        setStatusFilter,
        searchQuery,
        setSearchQuery,
        getStatusConfig,
        statusFilters,
    } = useWalkRequests();

    const renderRequestItem = ({ item }: { item: WalkRequest }) => {
        const statusConfig = getStatusConfig(item.status);
        const StatusIcon = statusConfig.icon;

        return (
            <TouchableOpacity
                style={[styles.requestCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => {
                    showAlert({
                        type: 'info',
                        title: 'Detalles de la Solicitud',
                        message: `Mascota: ${item.pet_id}\nFecha: ${item.requested_date}\nEstado: ${statusConfig.label}`,
                        showCancel: true,
                        cancelText: 'Cancelar',
                        buttonText: 'Ver Detalles',
                        onButtonPress: () => showAlert({ type: 'info', title: 'Detalles', message: 'Función de detalles en desarrollo...' }),
                    });
                }}
            >
                <View style={styles.requestHeader}>
                    <View style={styles.clientInfo}>
                        <View style={[styles.avatarPlaceholder, { backgroundColor: theme.primary + '20' }]}>
                            <Text style={[styles.avatarText, { color: theme.primary }]}>
                                {item.pet_id.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                        <View style={styles.clientDetails}>
                            <Text style={[styles.clientName, { color: theme.text }]}>{item.pet_id}</Text>
                            <Text style={[styles.petInfo, { color: theme.textMuted }]}>
                                Cliente: {item.client_user_id}
                            </Text>
                        </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
                        <StatusIcon size={14} color={statusConfig.color} />
                        <Text style={[styles.statusText, { color: statusConfig.color }]}>
                            {statusConfig.label}
                        </Text>
                    </View>
                </View>

                <View style={styles.requestDetails}>
                    <View style={styles.detailRow}>
                        <Calendar size={14} color={theme.textMuted} />
                        <Text style={[styles.detailText, { color: theme.textMuted }]}>
                            {item.requested_date}
                        </Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Clock size={14} color={theme.textMuted} />
                        <Text style={[styles.detailText, { color: theme.textMuted }]}>
                            Duración: {item.duration_minutes} min
                        </Text>
                    </View>
                    {item.pickup_address && (
                        <View style={styles.detailRow}>
                            <MapPin size={14} color={theme.textMuted} />
                            <Text style={[styles.detailText, { color: theme.textMuted }]}>
                                {item.pickup_address}
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.requestFooter}>
                    <View style={styles.priceContainer}>
                        <Text style={[styles.priceText, { color: theme.primary }]}>
                            ${item.total_price ?? 0}
                        </Text>
                        <Text style={[styles.priceLabel, { color: theme.textMuted }]}>
                            por paseo
                        </Text>
                    </View>

                    {item.status === 'pending' && (
                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: '#ef4444' }]}
                                onPress={() => showAlert({ type: 'warning', title: 'Rechazar', message: '¿Rechazar esta solicitud?' })}
                            >
                                <Text style={styles.actionButtonText}>Rechazar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: theme.primary }]}
                                onPress={() => showAlert({ type: 'success', title: 'Aceptar', message: '¿Aceptar esta solicitud?' })}
                            >
                                <Text style={styles.actionButtonText}>Aceptar</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {item.status === 'confirmed' && (
                        <TouchableOpacity
                            style={[styles.contactButton, { backgroundColor: theme.secondary }]}
                            onPress={() => showAlert({ type: 'info', title: 'Contactar', message: 'Abriendo chat con el cliente...' })}
                        >
                            <MessageCircle size={16} color="#fff" />
                            <Text style={styles.contactButtonText}>Contactar</Text>
                        </TouchableOpacity>
                    )}

                    <ChevronRight size={20} color={theme.textMuted} />
                </View>
            </TouchableOpacity>
        );
    };

    if (isLoading) {
        return <LoadingOverlay />;
    }

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Mis Solicitudes de Paseo"
                subtitle="Gestiona tus solicitudes de paseo"
            />

            {/* Search */}
            <View style={{ marginHorizontal: 24, marginBottom: 16 }}>
                <SearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Buscar por cliente, mascota o ubicación..."
                />
            </View>

            {/* Status Filters */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filtersContainer}
                contentContainerStyle={styles.filtersContentContainer}
            >
                {statusFilters.map((filter) => (
                    <FilterChip
                        key={filter.id}
                        label={`${filter.label} (${filter.count})`}
                        active={statusFilter === filter.id}
                        onPress={() => setStatusFilter(filter.id)}
                    />
                ))}
            </ScrollView>

            {/* Requests List */}
            <FlatList
                data={filteredRequests}
                renderItem={renderRequestItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <EmptyState
                        icon={<Dog size={32} color={theme.textMuted} />}
                        title={searchQuery || statusFilter !== 'all' ? 'Sin resultados' : 'Sin solicitudes'}
                        subtitle={searchQuery || statusFilter !== 'all' ? 
                            'No encontramos solicitudes con esos filtros.' : 
                            'No tienes solicitudes de paseo.'
                        }
                    />
                }
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    filtersContainer: {
        marginBottom: 16,
    },
    filtersContentContainer: {
        paddingHorizontal: 24,
        gap: 8,
    },
    list: {
        paddingHorizontal: 24,
        paddingBottom: 100,
    },
    requestCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
    },
    requestHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    clientInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 16,
        fontWeight: '800',
    },
    clientDetails: {
        flex: 1,
    },
    clientName: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 2,
    },
    petInfo: {
        fontSize: 13,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    requestDetails: {
        gap: 6,
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    detailText: {
        fontSize: 13,
    },
    requestFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    priceContainer: {
        alignItems: 'baseline',
    },
    priceText: {
        fontSize: 18,
        fontWeight: '800',
    },
    priceLabel: {
        fontSize: 11,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 13,
        fontWeight: '600',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '600',
    },
    contactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        gap: 4,
    },
    contactButtonText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '600',
    },
});
