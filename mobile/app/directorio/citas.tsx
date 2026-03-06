import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ActivityIndicator, Dimensions, Modal, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getMyAppointments, cancelAppointment, AppointmentItem } from '../../src/services/directorio';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ChevronLeft, Info, Clock, CheckCircle2, XCircle, Calendar, MapPin, RefreshCcw, X, AlertCircle, Check } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const STATUS_MAP: Record<string, { label: string; emoji: string; color: string; bg: string }> = {
    pending: { label: "Pendiente", emoji: "⏳", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
    confirmed: { label: "Confirmada", emoji: "✅", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
    completed: { label: "Completada", emoji: "🎉", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
    cancelled: { label: "Cancelada", emoji: "❌", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
    no_show: { label: "No Asistió", emoji: "👻", color: "#6b7280", bg: "rgba(107,114,128,0.12)" },
};

export default function MisCitasScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];
    const [filter, setFilter] = useState('all');
    const [cancelModal, setCancelModal] = useState<{ visible: boolean; apptId: string | null }>({ visible: false, apptId: null });
    const [cancelReason, setCancelReason] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);

    const { data: appointments = [], isLoading, refetch } = useQuery({
        queryKey: ["my-appointments"],
        queryFn: getMyAppointments,
        refetchInterval: 60000,
    });

    const displayAppointments = appointments.filter(a => a.status !== "rescheduled");
    const filtered = filter === "all" ? displayAppointments : displayAppointments.filter(a => a.status === filter);

    const upcoming = displayAppointments.filter(a => ["pending", "confirmed"].includes(a.status));
    const completedCount = displayAppointments.filter(a => a.status === "completed").length;
    const cancelledCount = displayAppointments.filter(a => a.status === "cancelled").length;

    const handleCancel = async () => {
        if (!cancelModal.apptId) return;
        setIsCancelling(true);
        try {
            await cancelAppointment(cancelModal.apptId, cancelReason);
            setCancelModal({ visible: false, apptId: null });
            setCancelReason('');
            refetch();
        } catch (error) {
            console.error(error);
        } finally {
            setIsCancelling(false);
        }
    };

    const renderItem = ({ item }: { item: AppointmentItem }) => {
        const s = STATUS_MAP[item.status] || STATUS_MAP.pending;
        const date = new Date(item.date + "T12:00");

        return (
            <View style={[styles.card, { backgroundColor: theme.surface }]}>
                <View style={styles.cardMain}>
                    {/* Date Badge */}
                    <View style={styles.dateContainer}>
                        <View style={[styles.dateBadge, { backgroundColor: theme.primary + '15' }]}>
                            <Text style={[styles.dateDay, { color: theme.primary }]}>{date.getDate()}</Text>
                            <Text style={[styles.dateMonth, { color: theme.textMuted }]}>
                                {date.toLocaleDateString("es-MX", { month: "short" }).toUpperCase()}
                            </Text>
                        </View>
                    </View>

                    {/* Details */}
                    <View style={styles.detailsContainer}>
                        <View style={styles.titleRow}>
                            <Text style={[styles.serviceName, { color: theme.text }]} numberOfLines={1}>{item.service_name}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <MapPin size={12} color={theme.textMuted} />
                            <Text style={[styles.infoText, { color: theme.textMuted }]} numberOfLines={1}>{item.clinic_name}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Clock size={12} color={theme.textMuted} />
                            <Text style={[styles.infoText, { color: theme.textMuted }]}>{item.start_time} - {item.end_time}</Text>
                        </View>
                    </View>

                    {/* Status */}
                    <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
                        <Text style={[styles.statusLabel, { color: s.color }]}>{s.emoji} {s.label}</Text>
                    </View>
                </View>

                {["pending", "confirmed"].includes(item.status) && (
                    <View style={[styles.actions, { borderTopColor: 'rgba(255,255,255,0.05)' }]}>
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.rescheduleBtn]}
                            onPress={() => router.push(`/directorio/citas/agendar/${item.clinic_id}?service_id=${item.service_id}&reschedule_id=${item.id}&pet_id=${item.pet_id}`)}
                        >
                            <RefreshCcw size={16} color={theme.text} />
                            <Text style={[styles.actionBtnText, { color: theme.text }]}>Reagendar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.cancelBtn]}
                            onPress={() => setCancelModal({ visible: true, apptId: item.id })}
                        >
                            <X size={16} color="#ef4444" />
                            <Text style={[styles.actionBtnText, { color: '#ef4444' }]}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <ChevronLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <View style={styles.titleBox}>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Citas Médicas</Text>
                    <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>Tus trámites veterinarios</Text>
                </View>
                <TouchableOpacity style={styles.refreshBtn} onPress={() => refetch()}>
                    <Clock size={20} color={theme.textMuted} />
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={[styles.loadingText, { color: theme.textMuted }]}>Actualizando historial...</Text>
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    ListHeaderComponent={
                        <View>
                            {/* Stats */}
                            <View style={styles.statsContainer}>
                                <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
                                    <Calendar size={20} color="#a78bfa" />
                                    <Text style={[styles.statValue, { color: "#a78bfa" }]}>{upcoming.length}</Text>
                                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>Próximas</Text>
                                </View>
                                <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
                                    <CheckCircle2 size={20} color="#10b981" />
                                    <Text style={[styles.statValue, { color: "#10b981" }]}>{completedCount}</Text>
                                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>Completas</Text>
                                </View>
                                <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
                                    <XCircle size={20} color="#ef4444" />
                                    <Text style={[styles.statValue, { color: "#ef4444" }]}>{cancelledCount}</Text>
                                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>Cerradas</Text>
                                </View>
                            </View>

                            {/* Filters */}
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
                                <View style={styles.filtersContainer}>
                                    {[
                                        { key: "all", label: "Todas" },
                                        { key: "pending", label: "⏳ Pendientes" },
                                        { key: "confirmed", label: "✅ Confirmadas" },
                                        { key: "completed", label: "🎉 Completadas" },
                                        { key: "cancelled", label: "❌ Canceladas" },
                                    ].map(tab => (
                                        <TouchableOpacity
                                            key={tab.key}
                                            onPress={() => setFilter(tab.key)}
                                            style={[
                                                styles.filterTab,
                                                { backgroundColor: theme.surface, borderColor: theme.border },
                                                filter === tab.key && { backgroundColor: theme.primary + '20', borderColor: theme.primary }
                                            ]}
                                        >
                                            <Text style={[
                                                styles.filterText,
                                                { color: theme.textMuted },
                                                filter === tab.key && { color: theme.primary, fontWeight: '800' }
                                            ]}>
                                                {tab.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>
                    }
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Calendar size={64} color={theme.textMuted} strokeWidth={1} />
                            <Text style={[styles.emptyText, { color: theme.textMuted }]}>No hay citas para mostrar</Text>
                        </View>
                    }
                />
            )}

            {/* Cancel Modal */}
            <Modal
                visible={cancelModal.visible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setCancelModal({ visible: false, apptId: null })}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
                        <View style={styles.modalHeader}>
                            <AlertCircle size={32} color="#ef4444" />
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Cancelar Cita</Text>
                            <Text style={[styles.modalSub, { color: theme.textMuted }]}>¿Estás seguro que deseas cancelar esta cita médica?</Text>
                        </View>

                        <TextInput
                            style={[styles.reasonInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                            placeholder="Motivo de la cancelación (opcional)"
                            placeholderTextColor={theme.textMuted}
                            multiline={true}
                            value={cancelReason}
                            onChangeText={setCancelReason}
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalBtn, { backgroundColor: theme.background }]}
                                onPress={() => setCancelModal({ visible: false, apptId: null })}
                            >
                                <Text style={[styles.modalBtnText, { color: theme.text }]}>Mantener</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, { backgroundColor: '#ef4444' }]}
                                onPress={handleCancel}
                                disabled={isCancelling}
                            >
                                {isCancelling ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.modalBtnTextDanger}>Confirmar Cancelación</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20, gap: 16 },
    backBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.03)', justifyContent: 'center', alignItems: 'center' },
    titleBox: { flex: 1 },
    headerTitle: { fontSize: 22, fontWeight: '900' },
    headerSubtitle: { fontSize: 13, fontWeight: '600', marginTop: 2 },
    refreshBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
    list: { padding: 20, paddingBottom: 40 },
    statsContainer: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    statCard: { flex: 1, padding: 16, borderRadius: 24, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    statValue: { fontSize: 24, fontWeight: '900' },
    statLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
    filtersScroll: { marginBottom: 20, marginHorizontal: -20 },
    filtersContainer: { flexDirection: 'row', paddingHorizontal: 20, gap: 8 },
    filterTab: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, borderWidth: 1 },
    filterText: { fontSize: 13, fontWeight: '600' },
    card: { borderRadius: 28, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    cardMain: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    dateContainer: { width: 60 },
    dateBadge: { width: 60, paddingVertical: 12, borderRadius: 18, alignItems: 'center', gap: 2 },
    dateDay: { fontSize: 20, fontWeight: '900' },
    dateMonth: { fontSize: 10, fontWeight: '800' },
    detailsContainer: { flex: 1, gap: 4 },
    titleRow: { marginBottom: 2 },
    serviceName: { fontSize: 16, fontWeight: '800' },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    infoText: { fontSize: 12, fontWeight: '600' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
    statusLabel: { fontSize: 9, fontWeight: '800' },
    actions: { flexDirection: 'row', gap: 10, marginTop: 16, paddingTop: 16, borderTopWidth: 1 },
    actionBtn: { flex: 1, flexDirection: 'row', height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', gap: 8 },
    rescheduleBtn: { backgroundColor: 'rgba(255,255,255,0.05)' },
    cancelBtn: { backgroundColor: '#ef444410' },
    actionBtnText: { fontSize: 13, fontWeight: '700' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    loadingText: { marginTop: 16, fontSize: 15, fontWeight: '600' },
    empty: { paddingTop: 100, alignItems: 'center', gap: 20 },
    emptyText: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 24 },
    modalContent: { borderRadius: 32, padding: 24, paddingBottom: 0, gap: 16, overflow: 'hidden' },
    modalHeader: { alignItems: 'center', gap: 8 },
    modalTitle: { fontSize: 20, fontWeight: '900' },
    modalSub: { fontSize: 14, fontWeight: '600', textAlign: 'center', lineHeight: 20 },
    reasonInput: { height: 100, borderRadius: 20, padding: 16, borderWidth: 1, textAlignVertical: 'top', fontSize: 14, fontWeight: '600' },
    modalActions: { flexDirection: 'row', marginHorizontal: -24, marginTop: 8 },
    modalBtn: { flex: 1, height: 64, justifyContent: 'center', alignItems: 'center' },
    modalBtnText: { fontSize: 15, fontWeight: '700' },
    modalBtnTextDanger: { fontSize: 15, fontWeight: '800', color: '#fff' }
});
