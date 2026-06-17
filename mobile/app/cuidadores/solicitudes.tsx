import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useSitRequests } from '@/src/hooks/cuidadores';
import { SitRequest } from '@/src/services/cuidadores';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { 
    Calendar, Clock, MapPin, Home, ChevronRight, 
    MessageCircle
} from 'lucide-react-native';
import { showAlert } from '@/src/components/AppAlert';
import SearchBar from '@/src/components/SearchBar';
import FilterChip from '@/src/components/FilterChip';
import EmptyState from '@/src/components/EmptyState';
import LoadingOverlay from '@/src/components/LoadingOverlay';

export default function SitterRequestsScreen() {
    const { theme } = useTheme();
    const {
        requests: filteredRequests,
        isLoading,
        statusFilter,
        setStatusFilter,
        searchQuery,
        setSearchQuery,
        getStatusConfig,
        getServiceConfig,
        statusFilters,
    } = useSitRequests();

    const renderRequestItem = ({ item }: { item: SitRequest }) => {
        const statusConfig = getStatusConfig(item.status);
        const serviceConfig = getServiceConfig(item.service_type);
        const StatusIcon = statusConfig.icon;
        const ServiceIcon = serviceConfig.icon;

        const isMultiDay = item.start_date !== item.end_date;
        const dateDisplay = isMultiDay ? 
            `${item.start_date} - ${item.end_date}` : 
            item.start_date;

        return (
            <TouchableOpacity
                style={[styles.requestCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => {
                    showAlert({
                        type: 'info',
                        title: 'Detalles de la Solicitud',
                        message: `Mascota: ${item.pet_id}\nFechas: ${dateDisplay}\nServicio: ${serviceConfig.label}\nEstado: ${statusConfig.label}`,
                        showCancel: true,
                        cancelText: 'Cancelar',
                        buttonText: 'Ver Detalles',
                        onButtonPress: () => showAlert({ type: 'info', title: 'Detalles', message: 'Función de detalles en desarrollo...' }),
                    });
                }}
            >
                <View style={styles.requestHeader}>
                    <View style={styles.clientInfo}>
                        <View style={[styles.avatarPlaceholder, { backgroundColor: theme.secondary + '20' }]}>
                            <Text style={[styles.avatarText, { color: theme.secondary }]}>
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

                <View style={styles.serviceInfo}>
                    <View style={[styles.serviceBadge, { backgroundColor: serviceConfig.color + '20' }]}>
                        <ServiceIcon size={14} color={serviceConfig.color} />
                        <Text style={[styles.serviceText, { color: serviceConfig.color }]}>
                            {serviceConfig.label}
                        </Text>
                    </View>
                    <View style={styles.dateInfo}>
                        <Calendar size={14} color={theme.textMuted} />
                        <Text style={[styles.dateText, { color: theme.textMuted }]}>
                            {dateDisplay}
                        </Text>
                    </View>
                </View>

                <View style={styles.requestDetails}>
                    {item.address && (
                        <View style={styles.detailRow}>
                            <MapPin size={14} color={theme.textMuted} />
                            <Text style={[styles.detailText, { color: theme.textMuted }]}>
                                {item.address}
                            </Text>
                        </View>
                    )}
                    <View style={styles.detailRow}>
                        <Clock size={14} color={theme.textMuted} />
                        <Text style={[styles.detailText, { color: theme.textMuted }]}>
                            {isMultiDay ? 
                                `${Math.ceil((new Date(item.end_date).getTime() - new Date(item.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1} días` : 
                                '1 día'
                            }
                        </Text>
                    </View>
                </View>

                <View style={styles.requestFooter}>
                    <View style={styles.priceContainer}>
                        <Text style={[styles.priceText, { color: theme.primary }]}>
                            ${item.total_price ?? 0}
                        </Text>
                        <Text style={[styles.priceLabel, { color: theme.textMuted }]}>
                            total
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
                title="Mis Solicitudes de Cuidado"
                subtitle="Gestiona tus solicitudes de cuidado de mascotas"
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
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
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
                        icon={<Home size={32} color={theme.textMuted} />}
                        title={searchQuery || statusFilter !== 'all' ? 'Sin resultados' : 'Sin solicitudes'}
                        subtitle={searchQuery || statusFilter !== 'all' ? 
                            'No encontramos solicitudes con esos filtros.' : 
                            'No tienes solicitudes de cuidado.'
                        }
                    />
                }
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    filtersContainer: {
        paddingHorizontal: 24,
        marginBottom: 16,
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
    serviceInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    serviceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    serviceText: {
        fontSize: 11,
        fontWeight: '600',
    },
    dateInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    dateText: {
        fontSize: 12,
        fontWeight: '500',
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
    headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 6 },
});
