import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { Users, Clock, CheckCircle, XCircle, AlertCircle, Heart, Home, Filter } from 'lucide-react-native';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import EmptyState from '@/src/components/EmptyState';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import { useApplications } from '@/src/hooks/adopciones/useApplications';
import type { Listing, AdoptionRequest } from '@/src/types/adopciones';
import type { ListingWithRequests } from '@/src/hooks/adopciones/useApplications';

export default function SolicitudesAdopcionScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const {
        listings,
        isLoading,
        refreshing,
        filterStatus,
        setFilterStatus,
        onRefresh,
        handleStatusUpdate,
        filterRequests,
        filteredAllRequests,
        getStatusInfo,
        goToRequestDetail,
        goToListingRequests,
        FILTER_OPTIONS,
    } = useApplications();

    const renderRequestItem = ({ request, listing }: { request: AdoptionRequest, listing: Listing }) => {
        const statusInfo = getStatusInfo(request.status);

        return (
            <View style={[styles.requestCard, { backgroundColor: theme.surface }]}>
                <View style={styles.requestHeader}>
                    <View style={styles.requesterInfo}>
                        <View style={[styles.avatar, { backgroundColor: theme.primary + '20' }]}>
                            <Users size={20} color={theme.primary} />
                        </View>
                        <View style={styles.requesterDetails}>
                            <Text style={[styles.requesterName, { color: theme.text }]}>
                                {request.applicant_name || 'Usuario'}
                            </Text>
                            <Text style={[styles.requestDate, { color: theme.textMuted }]}>
                                {new Date(request.created_at).toLocaleDateString()}
                            </Text>
                        </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
                        <Text style={[styles.statusText, { color: statusInfo.color }]}>
                            {statusInfo.icon} {statusInfo.label}
                        </Text>
                    </View>
                </View>

                <View style={styles.requestContent}>
                    <View style={styles.petInfo}>
                        <Heart size={16} color={theme.primary} />
                        <Text style={[styles.petName, { color: theme.text }]}>
                            Interés en: {listing.name}
                        </Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Home size={14} color={theme.textMuted} />
                        <Text style={[styles.infoText, { color: theme.text }]}>
                            Tipo de vivienda: {request.house_type}
                        </Text>
                    </View>

                    {request.has_yard && (
                        <View style={styles.infoRow}>
                            <CheckCircle size={14} color="#22c55e" />
                            <Text style={[styles.infoText, { color: theme.text }]}>
                            Tiene patio/jardín
                            </Text>
                        </View>
                    )}

                    {request.reason && (
                        <View style={styles.reasonSection}>
                            <Text style={[styles.reasonLabel, { color: theme.textMuted }]}>
                                Razón de adopción:
                            </Text>
                            <Text style={[styles.reasonText, { color: theme.text }]}>
                                {request.reason}
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.primary }]}
                        onPress={() => goToRequestDetail(request.id)}
                    >
                        <Text style={styles.actionButtonText}>Ver Detalles</Text>
                    </TouchableOpacity>

                    {request.status === 'PENDING' && (
                        <View style={styles.statusActions}>
                            <TouchableOpacity
                                style={[styles.statusButton, { backgroundColor: '#ef4444' }]}
                                onPress={() => handleStatusUpdate(request.id, 'REJECTED')}
                            >
                                <XCircle size={16} color="#fff" />
                                <Text style={styles.statusButtonText}>Rechazar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.statusButton, { backgroundColor: '#22c55e' }]}
                                onPress={() => handleStatusUpdate(request.id, 'REVIEWING')}
                            >
                                <CheckCircle size={16} color="#fff" />
                                <Text style={styles.statusButtonText}>Revisar</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {request.status === 'REVIEWING' && (
                        <TouchableOpacity
                            style={[styles.statusButton, { backgroundColor: '#8b5cf6' }]}
                            onPress={() => handleStatusUpdate(request.id, 'INTERVIEW_SCHEDULED')}
                        >
                            <Clock size={16} color="#fff" />
                            <Text style={styles.statusButtonText}>Programar Entrevista</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    const renderListingItem = ({ item }: { item: ListingWithRequests }) => {
        const filteredRequests = filterRequests(item.requests);

        if (filteredRequests.length === 0) return null;

        return (
            <View style={styles.listingSection}>
                <View style={styles.listingHeader}>
                    <View style={styles.listingInfo}>
                        <Text style={[styles.listingTitle, { color: theme.text }]}>
                            {item.name}
                        </Text>
                        <Text style={[styles.listingSubtitle, { color: theme.textMuted }]}>
                            {filteredRequests.length} solicitud(es)
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.viewAllButton, { backgroundColor: theme.surface }]}
                        onPress={() => goToListingRequests(item.id)}
                    >
                        <Text style={[styles.viewAllText, { color: theme.primary }]}>Ver Todas</Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={filteredRequests}
                    keyExtractor={(request) => request.id}
                    renderItem={({ item: request }) => renderRequestItem({ request, listing: item })}
                    scrollEnabled={false}
                />
            </View>
        );
    };

    if (isLoading) {
        return (
            <ScreenContainer>
                <LoadingOverlay message="Cargando solicitudes..." />
            </ScreenContainer>
        );
    }

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.background }]}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <ScreenHeader title="Solicitudes de Adopción" />

            <View style={[styles.filterContainer, { backgroundColor: theme.surface }]}>
                <Filter size={20} color={theme.textMuted} />
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {FILTER_OPTIONS.map((filter) => (
                        <TouchableOpacity
                            key={filter.key}
                            style={[
                                styles.filterChip,
                                {
                                    backgroundColor: filterStatus === filter.key ? theme.primary : 'transparent',
                                    borderColor: theme.primary,
                                }
                            ]}
                            onPress={() => setFilterStatus(filter.key)}
                        >
                            <Text style={[
                                styles.filterChipText,
                                { color: filterStatus === filter.key ? '#fff' : theme.primary }
                            ]}>
                                {filter.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {filteredAllRequests.length === 0 ? (
                <EmptyState
                    icon={<AlertCircle size={48} color={theme.textMuted} />}
                    title="No hay solicitudes"
                    subtitle={
                        filterStatus === 'all'
                            ? "No tienes solicitudes de adopción pendientes"
                            : `No hay solicitudes con estado "${filterStatus}"`
                    }
                />
            ) : (
                <FlatList
                    data={listings}
                    keyExtractor={(item) => item.id}
                    renderItem={renderListingItem}
                    scrollEnabled={false}
                    style={styles.list}
                />
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    filterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 24,
        marginBottom: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 12,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        marginRight: 8,
    },
    filterChipText: {
        fontSize: 14,
        fontWeight: '600',
    },
    list: {
        paddingHorizontal: 24,
        paddingBottom: 100,
    },
    listingSection: {
        marginBottom: 24,
    },
    listingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    listingInfo: {
        flex: 1,
    },
    listingTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    listingSubtitle: {
        fontSize: 14,
        marginTop: 2,
    },
    viewAllButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: '600',
    },
    requestCard: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    requestHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    requesterInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    requesterDetails: {
        flex: 1,
    },
    requesterName: {
        fontSize: 16,
        fontWeight: '700',
    },
    requestDate: {
        fontSize: 12,
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    requestContent: {
        marginBottom: 16,
    },
    petInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    petName: {
        fontSize: 15,
        fontWeight: '600',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6,
    },
    infoText: {
        fontSize: 14,
        flex: 1,
    },
    reasonSection: {
        marginTop: 12,
        padding: 12,
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: 8,
    },
    reasonLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 4,
    },
    reasonText: {
        fontSize: 14,
        lineHeight: 20,
    },
    actionButtons: {
        gap: 12,
    },
    actionButton: {
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    statusActions: {
        flexDirection: 'row',
        gap: 8,
    },
    statusButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderRadius: 8,
    },
    statusButtonText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
});
