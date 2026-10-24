import React from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Switch } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useFuneraryProvider } from '@/src/hooks/funerary/useFuneraryProvider';
import { FuneraryBooking , cremationLabel } from '@/src/services/funerary';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import EmptyState from '@/src/components/EmptyState';
import AppRefreshControl from '@/src/components/AppRefreshControl';
import { formatDateMx, statusTone } from '@/src/features/salud/format';
import { showAlert } from '@/src/components/AppAlert';
import { Calendar, Clock, Inbox, PawPrint, Plus } from 'lucide-react-native';
import { font, spacing, layout } from '@/constants/design';
import { hapticToggle, hapticWarning } from '@/src/lib/haptics';

export default function GestionScreen() {
    const { theme } = useTheme();
    const {
        providerBookings, isLoadingBookings, myServices, changeBookingStatus, isChangingStatus, toggleServiceActive, router,
    } = useFuneraryProvider();

    const confirmReject = (id: string) =>
        showAlert({
            type: 'warning',
            title: '¿Rechazar la solicitud?',
            message: 'La familia será notificada de la cancelación.',
            buttonText: 'Sí, rechazar',
            showCancel: true,
            cancelText: 'Volver',
            onButtonPress: () => { hapticWarning(); changeBookingStatus(id, 'cancelled'); },
        });

    const ActionBtn = ({ label, onPress, color, filled }: { label: string; onPress: () => void; color: string; filled?: boolean }) => (
        <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={label}
            disabled={isChangingStatus}
            onPress={onPress}
            style={[styles.actionBtn, { borderColor: color, backgroundColor: filled ? color : 'transparent' }, isChangingStatus && { opacity: 0.6 }]}
        >
            <Text style={{ color: filled ? theme.onPrimary : color, fontWeight: '700', fontSize: font.base }}>{label}</Text>
        </TouchableOpacity>
    );

    const renderBooking = ({ item }: { item: FuneraryBooking }) => {
        const statusCfg = statusTone(theme, item.status);

        return (
            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={styles.cardTop}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
                        <Inbox size={22} color={theme.primary} />
                    </View>
                    <View style={styles.cardInfo}>
                        <Text style={[styles.cardTitle, { color: theme.text }]}>
                            {item.service_name || `Solicitud #${item.id.slice(0, 8)}`}
                        </Text>
                        <View style={styles.metaRow}>
                            <PawPrint size={12} color={theme.textMuted} />
                            <Text style={[styles.metaText, { color: theme.textMuted }]}>
                                {item.pet_name ? `Mascota: ${item.pet_name}` : 'Mascota no disponible'}
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
                            {formatDateMx(item.scheduled_date)}
                        </Text>
                    </View>
                    {item.created_at && (
                        <View style={styles.detailItem}>
                            <Clock size={14} color={theme.textMuted} />
                            <Text style={[styles.detailText, { color: theme.textMuted }]}>
                                {formatDateMx(item.created_at)}
                            </Text>
                        </View>
                    )}
                </View>

                {item.notes && (
                    <Text style={[styles.notes, { color: theme.textMuted }]} numberOfLines={2}>
                        {item.notes}
                    </Text>
                )}

                {item.status === 'pending' && (
                    <View style={styles.actionsRow}>
                        <ActionBtn label="Confirmar" color={theme.success} filled onPress={() => changeBookingStatus(item.id, 'confirmed')} />
                        <ActionBtn label="Rechazar" color={theme.error} onPress={() => confirmReject(item.id)} />
                    </View>
                )}
                {item.status === 'confirmed' && (
                    <View style={styles.actionsRow}>
                        <ActionBtn label="Marcar completada" color={theme.info} filled onPress={() => changeBookingStatus(item.id, 'completed')} />
                        <ActionBtn label="Cancelar" color={theme.error} onPress={() => confirmReject(item.id)} />
                    </View>
                )}
            </View>
        );
    };

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Gestión"
                subtitle="Reservas de clientes"
                actionIcon={Plus}
                actionLabel="Nuevo servicio funerario"
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
                    refreshControl={<AppRefreshControl />}
                    ListHeaderComponent={
                        <View style={{ marginBottom: spacing.sm }}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Mis servicios</Text>
                            {myServices.length === 0 ? (
                                <Text style={[styles.metaText, { color: theme.textMuted, marginBottom: spacing.md }]}>
                                    Aún no publicas servicios. Toca + para crear el primero.
                                </Text>
                            ) : (
                                myServices.map((svc) => (
                                    <View key={svc.id} style={[styles.svcRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.cardTitle, { color: theme.text, marginBottom: spacing.xxs }]} numberOfLines={1}>{svc.name}</Text>
                                            <Text style={[styles.metaText, { color: theme.textMuted }]}>
                                                ${svc.price}{svc.cremation_type ? ` · ${cremationLabel(svc.cremation_type)}` : ''} · {svc.is_active ? 'Visible' : 'Oculto'}
                                            </Text>
                                        </View>
                                        <Switch
                                            accessibilityLabel={`Publicar ${svc.name}`}
                                            value={!!svc.is_active}
                                            onValueChange={(v) => { hapticToggle(); toggleServiceActive(svc.id, v); }}
                                            trackColor={{ true: theme.primary, false: theme.border }}
                                        />
                                    </View>
                                ))
                            )}
                            <Text style={[styles.sectionTitle, { color: theme.text, marginTop: spacing.md }]}>Solicitudes</Text>
                        </View>
                    }
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
        marginBottom: spacing.lg,
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
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    metaText: {
        fontSize: font.md,
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
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: spacing.lg,
        borderTopWidth: 1,
        marginBottom: spacing.sm,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    detailText: {
        fontSize: font.base,
        fontWeight: '600',
    },
    sectionTitle: { fontSize: font.xxl, fontWeight: '800', marginBottom: spacing.md },
    svcRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, borderRadius: 14, borderWidth: 1, marginBottom: spacing.md },
    actionsRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg, flexWrap: 'wrap' },
    actionBtn: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    notes: {
        fontSize: font.base,
        lineHeight: 19,
        marginTop: spacing.sm,
    },
});
