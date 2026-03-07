import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useColorScheme } from '@/components/useColorScheme';
import { 
    Calendar, Clock, MapPin, Dog, ChevronRight, Filter, 
    Search, User, Star, MessageCircle, CheckCircle, XCircle, AlertCircle
} from 'lucide-react-native';

// Mock data - en producción esto vendría de la API
const mockRequests = [
    {
        id: '1',
        walker_name: 'Carlos Rodríguez',
        client_name: 'María González',
        pet_name: 'Max',
        pet_type: 'Perro',
        date: '2024-01-15',
        time: '10:00 AM',
        duration: '1 hora',
        status: 'pending',
        price: 25,
        location: 'Polanco, CDMX',
        rating: null,
    },
    {
        id: '2',
        walker_name: 'Ana Martínez',
        client_name: 'Juan López',
        pet_name: 'Luna',
        pet_type: 'Perro',
        date: '2024-01-14',
        time: '2:00 PM',
        duration: '30 min',
        status: 'confirmed',
        price: 20,
        location: 'Condesa, CDMX',
        rating: 5,
    },
    {
        id: '3',
        walker_name: 'Carlos Rodríguez',
        client_name: 'Laura Torres',
        pet_name: 'Mishi',
        pet_type: 'Gato',
        date: '2024-01-13',
        time: '11:00 AM',
        duration: '45 min',
        status: 'completed',
        price: 22,
        location: 'Roma Norte, CDMX',
        rating: 4,
    },
    {
        id: '4',
        walker_name: 'Ana Martínez',
        client_name: 'Pedro Ramírez',
        pet_name: 'Rocky',
        pet_type: 'Perro',
        date: '2024-01-12',
        time: '3:00 PM',
        duration: '1 hora',
        status: 'cancelled',
        price: 25,
        location: 'San Ángel, CDMX',
        rating: null,
    },
];

export default function WalkerRequestsScreen() {
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

    // Mock query - en producción usar useQuery con API real
    const { data: requests = [], isLoading } = useQuery({
        queryKey: ['walker-requests'],
        queryFn: () => Promise.resolve(mockRequests),
    });

    const filteredRequests = requests.filter((request: any) => {
        const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
        const matchesSearch = request.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            request.pet_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            request.location.toLowerCase().includes(searchQuery.toLowerCase());
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

    const renderRequestItem = ({ item }: { item: any }) => {
        const statusConfig = getStatusConfig(item.status);
        const StatusIcon = statusConfig.icon;

        return (
            <TouchableOpacity
                style={[styles.requestCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => {
                    Alert.alert(
                        "Detalles de la Solicitud",
                        `Cliente: ${item.client_name}\nMascota: ${item.pet_name}\nFecha: ${item.date}\nEstado: ${statusConfig.label}`,
                        [
                            {
                                text: "Ver Detalles",
                                onPress: () => Alert.alert("Detalles", "Función de detalles en desarrollo...")
                            },
                            {
                                text: "Cancelar",
                                style: "cancel"
                            }
                        ]
                    );
                }}
            >
                <View style={styles.requestHeader}>
                    <View style={styles.clientInfo}>
                        <View style={[styles.avatarPlaceholder, { backgroundColor: theme.primary + '20' }]}>
                            <Text style={[styles.avatarText, { color: theme.primary }]}>
                                {item.client_name.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                        <View style={styles.clientDetails}>
                            <Text style={[styles.clientName, { color: theme.text }]}>{item.client_name}</Text>
                            <Text style={[styles.petInfo, { color: theme.textMuted }]}>
                                {item.pet_name} • {item.pet_type}
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
                            {item.date} • {item.time}
                        </Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Clock size={14} color={theme.textMuted} />
                        <Text style={[styles.detailText, { color: theme.textMuted }]}>
                            Duración: {item.duration}
                        </Text>
                    </View>
                    <View style={styles.detailRow}>
                        <MapPin size={14} color={theme.textMuted} />
                        <Text style={[styles.detailText, { color: theme.textMuted }]}>
                            {item.location}
                        </Text>
                    </View>
                </View>

                <View style={styles.requestFooter}>
                    <View style={styles.priceContainer}>
                        <Text style={[styles.priceText, { color: theme.primary }]}>
                            ${item.price}
                        </Text>
                        <Text style={[styles.priceLabel, { color: theme.textMuted }]}>
                            por paseo
                        </Text>
                    </View>
                    
                    {item.status === 'completed' && item.rating && (
                        <View style={styles.ratingContainer}>
                            <Star size={14} color="#fbbf24" fill="#fbbf24" />
                            <Text style={[styles.ratingText, { color: theme.text }]}>
                                {item.rating}.0
                            </Text>
                        </View>
                    )}

                    {item.status === 'pending' && (
                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: '#ef4444' }]}
                                onPress={() => Alert.alert("Rechazar", "¿Rechazar esta solicitud?")}
                            >
                                <Text style={styles.actionButtonText}>Rechazar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: theme.primary }]}
                                onPress={() => Alert.alert("Aceptar", "¿Aceptar esta solicitud?")}
                            >
                                <Text style={styles.actionButtonText}>Aceptar</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {item.status === 'confirmed' && (
                        <TouchableOpacity
                            style={[styles.contactButton, { backgroundColor: theme.secondary }]}
                            onPress={() => Alert.alert("Contactar", "Abriendro chat con el cliente...")}
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
        { id: 'pending', label: 'Pendientes', count: requests.filter((r: any) => r.status === 'pending').length },
        { id: 'confirmed', label: 'Confirmadas', count: requests.filter((r: any) => r.status === 'confirmed').length },
        { id: 'completed', label: 'Completadas', count: requests.filter((r: any) => r.status === 'completed').length },
        { id: 'cancelled', label: 'Canceladas', count: requests.filter((r: any) => r.status === 'cancelled').length },
    ];

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>Mis Solicitudes de Paseo</Text>
                <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                    Gestiona tus solicitudes de paseo
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
                        <Dog size={48} color={theme.textMuted} />
                        <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                            {searchQuery || statusFilter !== 'all' ? 
                                'No encontramos solicitudes con esos filtros.' : 
                                'No tienes solicitudes de paseo.'
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
