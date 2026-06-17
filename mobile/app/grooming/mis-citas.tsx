/**
 * Mis Citas Grooming — Client's grooming appointment list
 * Tabs: Upcoming / History with status badges
 */
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Scissors, Calendar, Clock, ChevronRight, Sparkles } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useGroomingClient } from '@/src/hooks/grooming/useGroomingClient';
import type { AppointmentTab } from '@/src/hooks/grooming/useGroomingClient';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import DataList from '@/src/components/data/DataList';
import type { GroomingAppointment } from '@/src/services/grooming';

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
    scheduled:   { label: 'Programada',  color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)' },
    confirmed:   { label: 'Confirmada',  color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    in_progress: { label: 'En Progreso', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    completed:   { label: 'Completada',  color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
    cancelled:   { label: 'Cancelada',   color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
};

export default function MisCitasGroomingScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const {
        activeTab,
        setActiveTab,
        displayedAppointments,
        appointmentsLoading,
        appointmentsRefetching,
        refetchAppointments,
        upcomingAppointments,
        pastAppointments,
    } = useGroomingClient();

    const tabs: { key: AppointmentTab; label: string; count: number }[] = [
        { key: 'upcoming', label: 'Próximas', count: upcomingAppointments.length },
        { key: 'history',  label: 'Historial', count: pastAppointments.length },
    ];

    const renderTab = (tab: typeof tabs[number]) => {
        const isActive = activeTab === tab.key;
        return (
            <TouchableOpacity
                key={tab.key}
                style={[
                    styles.tab,
                    {
                        backgroundColor: isActive ? theme.primary : theme.surface,
                        borderColor: isActive ? theme.primary : theme.cardBorder,
                    },
                ]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.7}
            >
                <Text style={[styles.tabLabel, { color: isActive ? '#fff' : theme.textMuted }]}>
                    {tab.label}
                </Text>
                {tab.count > 0 && (
                    <View style={[styles.tabBadge, { backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : theme.primaryLight }]}>
                        <Text style={[styles.tabBadgeText, { color: isActive ? '#fff' : theme.primary }]}>
                            {tab.count}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const renderAppointment = ({ item }: { item: GroomingAppointment }) => {
        const status = STATUS_MAP[item.status || 'scheduled'] ?? STATUS_MAP.scheduled;
        return (
            <TouchableOpacity
                style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
                activeOpacity={0.7}
                onPress={() => {
                    if (item.pet_id) {
                        router.push(`/grooming/historial/${item.pet_id}` as any);
                    }
                }}
            >
                <View style={styles.cardTop}>
                    <View style={[styles.cardIcon, { backgroundColor: theme.primaryLight }]}>
                        <Scissors size={22} color={theme.primary} />
                    </View>
                    <View style={styles.cardInfo}>
                        <Text style={[styles.cardService, { color: theme.text }]}>
                            {item.service_type || 'Grooming'}
                        </Text>
                        <View style={styles.cardDateRow}>
                            <Calendar size={13} color={theme.textMuted} />
                            <Text style={[styles.cardDate, { color: theme.textMuted }]}>{item.date}</Text>
                            <Clock size={13} color={theme.textMuted} />
                            <Text style={[styles.cardDate, { color: theme.textMuted }]}>{item.time}</Text>
                        </View>
                    </View>
                    <ChevronRight size={18} color={theme.textMuted} />
                </View>

                <View style={styles.cardBottom}>
                    <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                        <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                        <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                    </View>
                    {item.skin_report ? (
                        <Text style={[styles.skinReport, { color: theme.textMuted }]} numberOfLines={1}>
                            📝 {item.skin_report}
                        </Text>
                    ) : null}
                </View>
            </TouchableOpacity>
        );
    };

    const listHeader = (
        <View style={styles.tabsContainer}>
            {tabs.map(renderTab)}
        </View>
    );

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Mis Citas"
                subtitle="Grooming & Estética"
                gradient={[theme.primary, theme.secondary]}
                actionIcon={Sparkles}
                onAction={() => router.push('/grooming/agendar' as any)}
            />

            <DataList
                data={displayedAppointments}
                renderItem={renderAppointment}
                keyExtractor={(item) => item.id}
                isLoading={appointmentsLoading}
                loadingMessage="Cargando tus citas..."
                onRefresh={refetchAppointments}
                isRefreshing={appointmentsRefetching}
                header={listHeader}
                emptyIcon={<Scissors size={32} color={theme.textMuted} />}
                emptyTitle={activeTab === 'upcoming' ? 'No tienes citas próximas' : 'Sin historial aún'}
                emptySubtitle={activeTab === 'upcoming' ? 'Agenda una cita de grooming para tu mascota' : undefined}
                emptyActionLabel={activeTab === 'upcoming' ? 'Agendar cita' : undefined}
                onEmptyAction={activeTab === 'upcoming' ? () => router.push('/grooming/agendar' as any) : undefined}
                contentStyle={styles.list}
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    list: {
        paddingHorizontal: 24,
        paddingBottom: 100,
    },

    // Tabs
    tabsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
        marginTop: 8,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 14,
        borderRadius: 14,
        borderWidth: 1.5,
        gap: 8,
    },
    tabLabel: {
        fontSize: 15,
        fontWeight: '700',
    },
    tabBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    tabBadgeText: {
        fontSize: 12,
        fontWeight: '800',
    },

    // Card
    card: {
        padding: 18,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 14,
    },
    cardTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        marginBottom: 14,
    },
    cardIcon: {
        width: 50,
        height: 50,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardInfo: {
        flex: 1,
    },
    cardService: {
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 4,
    },
    cardDateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    cardDate: {
        fontSize: 13,
        fontWeight: '500',
    },
    cardBottom: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    // Status badge
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        gap: 6,
    },
    statusDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },
    skinReport: {
        flex: 1,
        fontSize: 12,
        textAlign: 'right',
        marginLeft: 10,
    },
});
