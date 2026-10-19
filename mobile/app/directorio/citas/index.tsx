import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppointments, STATUS_CONFIG, FILTER_TABS, formatDateTime } from '@/src/hooks/directorio/useAppointments';
import type { Appointment } from '@/src/services/citas';
import { useTheme } from '@/src/hooks/useTheme';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import DataList from '@/src/components/data/DataList';
import { Calendar, Clock, MapPin, PawPrint, AlertCircle, CalendarClock, Ban } from 'lucide-react-native';
import { font, spacing } from '@/constants/design';

export default function CitasScreen() {
    const router = useRouter();
    const { theme, isDark } = useTheme();
    const {
        appointments: filtered,
        isLoading,
        isRefetching,
        refetch,
        activeFilter,
        setActiveFilter,
        handleCancel,
        handleReschedule,
        cancelMutation,
    } = useAppointments();

    const renderAppointment = ({ item }: { item: Appointment }) => {
        const statusInfo = STATUS_CONFIG[item.status] || STATUS_CONFIG.scheduled;
        const { date, time } = formatDateTime(item.appointment_date);
        const isActive = item.status !== 'cancelled' && item.status !== 'completed' && item.status !== 'rescheduled';

        return (
            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={styles.cardTop}>
                    <View style={styles.cardHeader}>
                        <View style={[styles.clinicIcon, { backgroundColor: theme.primary + '20' }]}>
                            <MapPin size={18} color={theme.primary} />
                        </View>
                        <View style={styles.clinicInfo}>
                            <Text style={[styles.clinicName, { color: theme.text }]} numberOfLines={1}>
                                {item.clinic_name || 'Clínica'}
                            </Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: statusInfo.lightColor }]}>
                            <Text style={[styles.statusText, { color: statusInfo.color }]}>
                                {statusInfo.label}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={[styles.cardBody, { borderTopColor: theme.border }]}>
                    <View style={styles.infoRow}>
                        <PawPrint size={15} color={theme.textMuted} />
                        <Text style={[styles.infoText, { color: theme.text }]}>
                            {item.pet_name || 'Mascota'}
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Calendar size={15} color={theme.textMuted} />
                        <Text style={[styles.infoText, { color: theme.text }]}>{date}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Clock size={15} color={theme.textMuted} />
                        <Text style={[styles.infoText, { color: theme.text }]}>{time}</Text>
                    </View>
                    {item.reason ? (
                        <View style={styles.infoRow}>
                            <AlertCircle size={15} color={theme.textMuted} />
                            <Text style={[styles.infoText, { color: theme.textMuted }]} numberOfLines={2}>
                                {item.reason}
                            </Text>
                        </View>
                    ) : null}
                    {item.is_emergency && (
                        <View style={[styles.emergencyBadge, { backgroundColor: '#ef444420' }]}>
                            <AlertCircle size={14} color="#ef4444" />
                            <Text style={styles.emergencyText}>Emergencia</Text>
                        </View>
                    )}
                </View>

                {isActive && (
                    <View style={[styles.cardActions, { borderTopColor: theme.border }]}>
                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: theme.overlay, borderColor: theme.border }]}
                            onPress={() => handleReschedule(item)}
                            accessibilityRole="button"
                            accessibilityLabel={`Reagendar cita en ${item.clinic_name || 'la clínica'}`}
                        >
                            <CalendarClock size={16} color={theme.text} />
                            <Text style={[styles.actionBtnText, { color: theme.text }]}>Reagendar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.cancelBtn, { backgroundColor: '#ef444415', borderColor: '#ef444440' }]}
                            onPress={() => handleCancel(item)}
                            disabled={cancelMutation.isPending}
                            accessibilityRole="button"
                            accessibilityLabel={`Cancelar cita en ${item.clinic_name || 'la clínica'}`}
                        >
                            <Ban size={16} color="#ef4444" />
                            <Text style={[styles.actionBtnText, { color: '#ef4444' }]}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    return (
        <ScreenContainer style={{ backgroundColor: theme.background }}>
            <ScreenHeader title="Mis Citas" />

            <View style={styles.tabsContainer}>
                {FILTER_TABS.map(tab => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[styles.tab, {
                            backgroundColor: activeFilter === tab.key ? theme.primary : theme.surface,
                            borderColor: activeFilter === tab.key ? theme.primary : theme.border,
                        }]}
                        onPress={() => setActiveFilter(tab.key)}
                        accessibilityRole="button"
                        accessibilityState={{ selected: activeFilter === tab.key }}
                    >
                        <Text style={[styles.tabText, { color: activeFilter === tab.key ? '#fff' : theme.text }]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <DataList
                data={filtered}
                keyExtractor={(item) => item.id}
                renderItem={renderAppointment}
                isLoading={isLoading}
                isRefreshing={isRefetching}
                onRefresh={refetch}
                contentStyle={styles.list}
                emptyIcon={<Calendar size={48} color={theme.textMuted} />}
                emptyTitle="Sin citas"
                emptySubtitle={
                    activeFilter === 'all'
                        ? 'Aún no tienes citas agendadas. Busca una clínica para agendar tu primera cita.'
                        : 'No hay citas con este filtro.'
                }
                emptyActionLabel={activeFilter === 'all' ? 'Buscar Clínicas' : undefined}
                onEmptyAction={activeFilter === 'all' ? () => router.push('/directorio' as any) : undefined}
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: spacing.xxl,
        marginBottom: spacing.lg,
        gap: spacing.sm,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        borderRadius: 12,
        borderWidth: 1.5,
    },
    tabText: { fontSize: font.base, fontWeight: '700' },
    list: { paddingHorizontal: spacing.xxl, paddingBottom: 100 },
    card: {
        borderRadius: 20,
        marginBottom: spacing.lg,
        borderWidth: 1,
        overflow: 'hidden',
    },
    cardTop: { padding: spacing.xl, paddingBottom: spacing.lg },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    clinicIcon: {
        width: 42,
        height: 42,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    clinicInfo: { flex: 1 },
    clinicName: { fontSize: font.xl, fontWeight: '800' },
    statusBadge: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: 8,
    },
    statusText: { fontSize: font.sm, fontWeight: '700' },
    cardBody: {
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.lg,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        gap: spacing.sm,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    infoText: { fontSize: font.base, fontWeight: '500', flex: 1 },
    emergencyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginTop: spacing.xs,
    },
    emergencyText: { fontSize: font.md, fontWeight: '700', color: '#ef4444' },
    cardActions: {
        flexDirection: 'row',
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.lg,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        gap: spacing.md,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        borderRadius: 12,
        gap: spacing.sm,
    },
    cancelBtn: {
        borderWidth: 1,
    },
    actionBtnText: { fontSize: font.base, fontWeight: '700' },
});
