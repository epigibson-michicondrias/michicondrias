import React from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useFuneraryBooking } from '@/src/hooks/funerary/useFuneraryBooking';
import { FuneraryBooking } from '@/src/services/funerary';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import EmptyState from '@/src/components/EmptyState';
import AppRefreshControl from '@/src/components/AppRefreshControl';
import { formatDateMx, statusTone } from '@/src/features/salud/format';
import { Calendar, Clock, FileText, Plus } from 'lucide-react-native';
import { font, spacing, layout } from '@/constants/design';

export default function MisReservasScreen() {
    const { theme } = useTheme();
    const { clientBookings, isLoadingBookings, handleCancel, isCancelling, router } = useFuneraryBooking();

    const renderBooking = ({ item }: { item: FuneraryBooking }) => {
        const statusCfg = statusTone(theme, item.status);
        const canCancel = item.status === 'pending' || item.status === 'confirmed';

        return (
            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={styles.cardTop}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.secondary + '20' }]}>
                        <FileText size={22} color={theme.secondary} />
                    </View>
                    <View style={styles.cardInfo}>
                        <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>
                            {item.service_name || `Reserva #${item.id.slice(0, 8)}`}
                        </Text>
                        {!!item.pet_name && (
                            <Text style={[styles.dateText, { color: theme.textMuted }]} numberOfLines={1}>
                                Para {item.pet_name}
                            </Text>
                        )}
                        <View style={styles.dateRow}>
                            <Calendar size={12} color={theme.textMuted} />
                            <Text style={[styles.dateText, { color: theme.textMuted }]}>
                                {formatDateMx(item.scheduled_date)}
                            </Text>
                        </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
                        <Text style={[styles.statusText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
                    </View>
                </View>

                {item.notes && (
                    <Text style={[styles.notes, { color: theme.textMuted }]} numberOfLines={2}>
                        {item.notes}
                    </Text>
                )}

                {canCancel && (
                    <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel="Cancelar reserva"
                        disabled={isCancelling}
                        onPress={() => handleCancel(item.id)}
                        style={[styles.cancelBtn, { borderColor: theme.error }]}
                    >
                        <Text style={{ color: theme.error, fontWeight: '700', fontSize: font.base }}>Cancelar reserva</Text>
                    </TouchableOpacity>
                )}

                {item.created_at && (
                    <View style={styles.footerRow}>
                        <Clock size={12} color={theme.textMuted} />
                        <Text style={[styles.footerText, { color: theme.textMuted }]}>
                            Creada: {formatDateMx(item.created_at)}
                        </Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Mis Reservas"
                subtitle="Historial de reservas funerarias"
                actionIcon={Plus}
                onAction={() => router.push('/funeraria/reservar')}
            />

            {isLoadingBookings ? (
                <LoadingOverlay message="Cargando reservas..." />
            ) : (
                <FlatList
                    data={clientBookings}
                    renderItem={renderBooking}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<AppRefreshControl />}
                    ListEmptyComponent={
                        <EmptyState
                            icon={<Calendar size={32} color={theme.textMuted} />}
                            title="Sin reservas"
                            subtitle="Aún no tienes reservas de servicios funerarios."
                            actionLabel="Reservar servicio"
                            onAction={() => router.push('/funeraria/reservar')}
                        />
                    }
                />
            )}
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    list: {
        paddingHorizontal: layout.screenPadding,
        paddingTop: spacing.sm,
        paddingBottom: 100,
    },
    card: {
        padding: spacing.xl,
        borderRadius: 16,
        marginBottom: spacing.lg,
        borderWidth: 1,
    },
    cardTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
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
        fontSize: font.xl,
        fontWeight: '700',
        marginBottom: spacing.xs,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    dateText: {
        fontSize: font.base,
        fontWeight: '500',
    },
    statusBadge: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: 8,
    },
    statusText: {
        fontSize: font.md,
        fontWeight: '700',
    },
    cancelBtn: {
        marginTop: spacing.md,
        marginLeft: 60,
        alignSelf: 'flex-start',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        borderRadius: 10,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    notes: {
        fontSize: font.base,
        lineHeight: 19,
        marginTop: spacing.md,
        paddingLeft: 60,
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginTop: spacing.md,
        paddingLeft: 60,
    },
    footerText: {
        fontSize: font.sm,
        fontWeight: '500',
    },
});
