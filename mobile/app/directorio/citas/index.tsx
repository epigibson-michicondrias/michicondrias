import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppointments, STATUS_CONFIG, FILTER_TABS, formatDateTime } from '@/src/hooks/directorio/useAppointments';
import type { Appointment } from '@/src/services/citas';
import { useTheme } from '@/src/hooks/useTheme';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import DataList from '@/src/components/data/DataList';
import { Calendar, Clock, MapPin, PawPrint, AlertCircle, CalendarClock, Ban } from 'lucide-react-native';

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
        const isActive = item.status !== 'cancelled' && item.status !== 'completed';

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
                        >
                            <CalendarClock size={16} color={theme.text} />
                            <Text style={[styles.actionBtnText, { color: theme.text }]}>Reagendar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.cancelBtn, { backgroundColor: '#ef444415', borderColor: '#ef444440' }]}
                            onPress={() => handleCancel(item)}
                            disabled={cancelMutation.isPending}
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
        <ScreenContainer style={{ backgroundColor: isDark ? '#081a2e' : '#f0f9ff' }}>
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
        paddingHorizontal: 24,
        marginBottom: 16,
        gap: 8,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1.5,
    },
    tabText: { fontSize: 13, fontWeight: '700' },
    list: { paddingHorizontal: 24, paddingBottom: 100 },
    card: {
        borderRadius: 20,
        marginBottom: 14,
        borderWidth: 1,
        overflow: 'hidden',
    },
    cardTop: { padding: 18, paddingBottom: 14 },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    clinicIcon: {
        width: 42,
        height: 42,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    clinicInfo: { flex: 1 },
    clinicName: { fontSize: 16, fontWeight: '800' },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    statusText: { fontSize: 11, fontWeight: '700' },
    cardBody: {
        paddingHorizontal: 18,
        paddingBottom: 14,
        paddingTop: 10,
        borderTopWidth: 1,
        gap: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoText: { fontSize: 14, fontWeight: '500', flex: 1 },
    emergencyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginTop: 4,
    },
    emergencyText: { fontSize: 12, fontWeight: '700', color: '#ef4444' },
    cardActions: {
        flexDirection: 'row',
        paddingHorizontal: 18,
        paddingBottom: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        gap: 10,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 12,
        gap: 6,
    },
    cancelBtn: {
        borderWidth: 1,
    },
    actionBtnText: { fontSize: 13, fontWeight: '700' },
});
