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
import AppRefreshControl from '@/src/components/AppRefreshControl';
import { font, spacing } from '@/constants/design';

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
        const statusInfo = getStatusInfo(request.status, theme);

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
                                {new Date(request.created_at).toLocaleDateString('es-MX')}
                            </Text>
                        </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
                        <Text style={[styles.statusText, { color: statusInfo.color }]}>
                            {statusInfo.label}
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

                    {!!request.has_yard && (
                        <View style={styles.infoRow}>
                            <CheckCircle size={14} color={theme.success} />
                            <Text style={[styles.infoText, { color: theme.text }]}>
                            Tiene patio/jardín
                            </Text>
                        </View>
                    )}

                    {!!request.reason && (
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
                                style={[styles.statusButton, { backgroundColor: theme.error }]}
                                onPress={() => handleStatusUpdate(request.id, 'REJECTED')}
                            >
                                <XCircle size={16} color="#fff" />
                                <Text style={styles.statusButtonText}>Rechazar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.statusButton, { backgroundColor: theme.success }]}
                                onPress={() => handleStatusUpdate(request.id, 'REVIEWING')}
                            >
                                <CheckCircle size={16} color="#fff" />
                                <Text style={styles.statusButtonText}>Revisar</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {request.status === 'REVIEWING' && (
                        <TouchableOpacity
                            style={[styles.statusButton, { backgroundColor: theme.primary }]}
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
            refreshControl={<AppRefreshControl />}
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
            <ScreenHeader title="Solicitudes" />

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
                            : `No hay solicitudes en el estado seleccionado`
                    }
                />
            ) : (
                <FlatList
            refreshControl={<AppRefreshControl />}
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
        marginHorizontal: spacing.xxl,
        marginBottom: spacing.xl,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: 12,
        gap: spacing.md,
    },
    filterChip: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: 20,
        borderWidth: 1,
        marginRight: spacing.sm,
    },
    filterChipText: {
        fontSize: font.base,
        fontWeight: '600',
    },
    list: {
        paddingHorizontal: spacing.xxl,
        paddingBottom: 100,
    },
    listingSection: {
        marginBottom: spacing.xxl,
    },
    listingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    listingInfo: {
        flex: 1,
    },
    listingTitle: {
        fontSize: font.xxl,
        fontWeight: '700',
    },
    listingSubtitle: {
        fontSize: font.base,
        marginTop: spacing.xxs,
    },
    viewAllButton: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: 8,
    },
    viewAllText: {
        fontSize: font.base,
        fontWeight: '600',
    },
    requestCard: {
        borderRadius: 16,
        padding: spacing.lg,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: 'rgba(128,128,128,0.2)',
    },
    requestHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.md,
    },
    requesterInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: spacing.md,
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
        fontSize: font.xl,
        fontWeight: '700',
    },
    requestDate: {
        fontSize: font.md,
        marginTop: spacing.xxs,
    },
    statusBadge: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 12,
    },
    statusText: {
        fontSize: font.md,
        fontWeight: '600',
    },
    requestContent: {
        marginBottom: spacing.lg,
    },
    petInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    petName: {
        fontSize: font.lg,
        fontWeight: '600',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    infoText: {
        fontSize: font.base,
        flex: 1,
    },
    reasonSection: {
        marginTop: spacing.md,
        padding: spacing.md,
        backgroundColor: 'rgba(128,128,128,0.08)',
        borderRadius: 8,
    },
    reasonLabel: {
        fontSize: font.md,
        fontWeight: '600',
        marginBottom: spacing.xs,
    },
    reasonText: {
        fontSize: font.base,
        lineHeight: 20,
    },
    actionButtons: {
        gap: spacing.md,
    },
    actionButton: {
        paddingVertical: spacing.md,
        borderRadius: 8,
        alignItems: 'center',
    },
    actionButtonText: {
        color: '#fff',
        fontSize: font.base,
        fontWeight: '600',
    },
    statusActions: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    statusButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.md,
        borderRadius: 8,
    },
    statusButtonText: {
        color: '#fff',
        fontSize: font.base,
        fontWeight: '600',
    },
});
