import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useColorScheme } from '@/components/useColorScheme';
import { 
    Calendar, Clock, MapPin, Home, ChevronRight, Filter, 
    Search, User, Star, MessageCircle, CheckCircle, XCircle, AlertCircle, Sun, Moon
} from 'lucide-react-native';
import { showAlert } from '@/src/components/AppAlert';
import { getIncomingSitRequests, SitRequest } from '@/src/services/cuidadores';

export default function SitterRequestsScreen() {
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

    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const { data: requests = [], isLoading } = useQuery({
        queryKey: ['sitter-requests'],
        queryFn: getIncomingSitRequests,
    });

    const filteredRequests = requests.filter((request: SitRequest) => {
        const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
        const matchesSearch = request.pet_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (request.address || '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'pending':
                return {
                    icon: AlertCircle,
                    color: '#f59e0b',
                    bgColor: '#f59e0b20',
                    label: 'Pendiente'
                };
            case 'confirmed':
                return {
                    icon: CheckCircle,
                    color: '#10b981',
                    bgColor: '#10b98120',
                    label: 'Confirmado'
                };
            case 'completed':
                return {
                    icon: CheckCircle,
                    color: '#6366f1',
                    bgColor: '#6366f120',
                    label: 'Completado'
                };
            case 'cancelled':
                return {
                    icon: XCircle,
                    color: '#ef4444',
                    bgColor: '#ef444420',
                    label: 'Cancelado'
                };
            default:
                return {
                    icon: AlertCircle,
                    color: theme.textMuted,
                    bgColor: theme.surface,
                    label: status
                };
        }
    };

    const getServiceConfig = (type: string) => {
        switch (type) {
            case 'daycare':
                return {
                    icon: Sun,
                    label: 'Guardería',
                    color: '#f59e0b'
                };
            case 'boarding':
                return {
                    icon: Moon,
                    label: 'Hospedaje',
                    color: '#6366f1'
                };
            default:
                return {
                    icon: Home,
                    label: type || 'Cuidado',
                    color: theme.primary
                };
        }
    };

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

    const statusFilters = [
        { id: 'all', label: 'Todas', count: requests.length },
        { id: 'pending', label: 'Pendientes', count: requests.filter((r: SitRequest) => r.status === 'pending').length },
        { id: 'confirmed', label: 'Confirmadas', count: requests.filter((r: SitRequest) => r.status === 'confirmed').length },
        { id: 'completed', label: 'Completadas', count: requests.filter((r: SitRequest) => r.status === 'completed').length },
        { id: 'cancelled', label: 'Canceladas', count: requests.filter((r: SitRequest) => r.status === 'cancelled').length },
    ];

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>Mis Solicitudes de Cuidado</Text>
                <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                    Gestiona tus solicitudes de cuidado de mascotas
                </Text>
            </View>

            {/* Search */}
            <View style={[styles.searchContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Search size={20} color={theme.textMuted} />
                <Text style={[styles.searchInput, { color: theme.textMuted }]}>
                    Buscar por cliente, mascota o ubicación...
                </Text>
            </View>

            {/* Status Filters */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
                {statusFilters.map((filter) => (
                    <TouchableOpacity
                        key={filter.id}
                        style={[
                            styles.filterChip,
                            statusFilter === filter.id && styles.filterChipActive,
                            { 
                                backgroundColor: statusFilter === filter.id ? theme.primary : theme.surface,
                                borderColor: theme.border 
                            }
                        ]}
                        onPress={() => setStatusFilter(filter.id)}
                    >
                        <Text style={[
                            styles.filterChipText,
                            { color: statusFilter === filter.id ? '#fff' : theme.text }
                        ]}>
                            {filter.label} ({filter.count})
                        </Text>
                    </TouchableOpacity>
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
                    <View style={styles.emptyState}>
                        <Home size={48} color={theme.textMuted} />
                        <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                            {searchQuery || statusFilter !== 'all' ? 
                                'No encontramos solicitudes con esos filtros.' : 
                                'No tienes solicitudes de cuidado.'
                            }
                        </Text>
                    </View>
                }
            />
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
        fontSize: 24,
        fontWeight: '900',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        opacity: 0.8,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 24,
        marginBottom: 16,
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
    filtersContainer: {
        paddingHorizontal: 24,
        marginBottom: 16,
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        marginRight: 8,
    },
    filterChipActive: {
        borderColor: 'transparent',
    },
    filterChipText: {
        fontSize: 12,
        fontWeight: '600',
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
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        gap: 16,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
    },
});
