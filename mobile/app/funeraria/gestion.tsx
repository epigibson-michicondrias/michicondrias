import React from 'react';
import { StyleSheet, View, Text, FlatList } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useFuneraryProvider } from '@/src/hooks/funerary/useFuneraryProvider';
import { FuneraryBooking } from '@/src/services/funerary';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import EmptyState from '@/src/components/EmptyState';
import { Calendar, Clock, Inbox, User, Plus } from 'lucide-react-native';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: 'Pendiente', color: '#f59e0b', bg: '#f59e0b20' },
    confirmed: { label: 'Confirmada', color: '#10b981', bg: '#10b98120' },
    completed: { label: 'Completada', color: '#6366f1', bg: '#6366f120' },
    cancelled: { label: 'Cancelada', color: '#ef4444', bg: '#ef444420' },
};

export default function GestionScreen() {
    const { theme } = useTheme();
    const { providerBookings, isLoadingBookings, refetchBookings, router } = useFuneraryProvider();

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusConfig = (status: string) => {
        return STATUS_CONFIG[status.toLowerCase()] || STATUS_CONFIG.pending;
    };

    const renderBooking = ({ item }: { item: FuneraryBooking }) => {
        const statusCfg = getStatusConfig(item.status);

        return (
            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={styles.cardTop}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
                        <Inbox size={22} color={theme.primary} />
                    </View>
                    <View style={styles.cardInfo}>
                        <Text style={[styles.cardTitle, { color: theme.text }]}>
                            Solicitud #{item.id.slice(0, 8)}
                        </Text>
                        <View style={styles.metaRow}>
                            <User size={12} color={theme.textMuted} />
                            <Text style={[styles.metaText, { color: theme.textMuted }]}>
                                Cliente: {item.client_id.slice(0, 8)}...
                            </Text>
                        </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
                        <Text style={[styles.statusText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
                    </View>
                </View>

                <View style={[styles.detailsRow, { borderColor: theme.border }]}>
                    <View style={styles.detailItem}>
                        <Calendar size={14} color={theme.textMuted} />
                        <Text style={[styles.detailText, { color: theme.text }]}>
                            {formatDate(item.scheduled_date)}
                        </Text>
                    </View>
                    {item.created_at && (
                        <View style={styles.detailItem}>
                            <Clock size={14} color={theme.textMuted} />
                            <Text style={[styles.detailText, { color: theme.textMuted }]}>
                                {formatDate(item.created_at)}
                            </Text>
                        </View>
                    )}
                </View>

                {item.notes && (
                    <Text style={[styles.notes, { color: theme.textMuted }]} numberOfLines={2}>
                        📝 {item.notes}
                    </Text>
                )}
            </View>
        );
    };

    return (
        <ScreenContainer>
            <ScreenHeader
                title="📊 Gestión"
                subtitle="Reservas de clientes"
                actionIcon={Plus}
                onAction={() => router.push('/funeraria/nuevo-servicio')}
            />

            {isLoadingBookings ? (
                <LoadingOverlay message="Cargando solicitudes..." />
            ) : (
                <FlatList
                    data={providerBookings}
                    renderItem={renderBooking}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    onRefresh={refetchBookings}
                    refreshing={isLoadingBookings}
                    ListEmptyComponent={
                        <EmptyState
                            icon={<Inbox size={32} color={theme.textMuted} />}
                            title="Sin solicitudes"
                            subtitle="Aún no tienes solicitudes de servicios funerarios."
                        />
                    }
                />
            )}
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    list: {
        paddingHorizontal: 24,
        paddingTop: 8,
        paddingBottom: 100,
    },
    card: {
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
    },
    cardTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 14,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardInfo: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 12,
        fontWeight: '500',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 14,
        borderTopWidth: 1,
        marginBottom: 8,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    detailText: {
        fontSize: 13,
        fontWeight: '600',
    },
    notes: {
        fontSize: 13,
        lineHeight: 19,
        marginTop: 8,
    },
});
