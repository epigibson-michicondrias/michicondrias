import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getMyClinics, getClinicAppointments, confirmAppointment, completeAppointment, cancelAppointment, AppointmentItem } from '../../src/services/directorio';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ChevronLeft, Filter, CheckCircle2, MoreHorizontal, X, MessageSquare, Stethoscope, AlertCircle, Clock, ClipboardList } from 'lucide-react-native';
import { ScrollView } from 'react-native';

const STATUS_MAP: Record<string, { label: string; emoji: string; color: string; bg: string }> = {
    pending: { label: "Pendiente", emoji: "⏳", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
    confirmed: { label: "Confirmada", emoji: "✅", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
    completed: { label: "Completada", emoji: "🎉", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
    cancelled: { label: "Cancelada", emoji: "❌", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
    no_show: { label: "No Asistió", emoji: "👻", color: "#6b7280", bg: "rgba(107,114,128,0.12)" },
};

export default function AgendaClinicaScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const [filter, setFilter] = useState('all');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [cancelModal, setCancelModal] = useState<{ visible: boolean; apptId: string | null }>({ visible: false, apptId: null });
    const [cancelReason, setCancelReason] = useState('');

    const { data: clinics = [], isLoading: loadingClinics } = useQuery({
        queryKey: ['my-clinics'],
        queryFn: getMyClinics,
    });

    const clinic = clinics[0];

    const { data: appointments = [], isLoading: loadingAppts, refetch } = useQuery({
        queryKey: ['clinic-appointments-full', clinic?.id],
        queryFn: () => getClinicAppointments(clinic!.id),
        enabled: !!clinic?.id,
    });

    const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);

    const handleConfirm = async (id: string) => {
        setActionLoading(id);
        try {
            await confirmAppointment(id);
            refetch();
        } catch (e) {
            Alert.alert("Error", "No se pudo confirmar la cita");
        } finally {
            setActionLoading(null);
        }
    };

    const handleComplete = async (id: string) => {
        // En un flujo real, aquí redirigiríamos a la creación de la receta/ficha médica
        router.push(`/mi-clinica/historial/nuevo?appointment_id=${id}` as any);
    };

    const handleCancelSubmit = async () => {
        if (!cancelModal.apptId) return;
        setActionLoading(cancelModal.apptId);
        try {
            await cancelAppointment(cancelModal.apptId, cancelReason);
            setCancelModal({ visible: false, apptId: null });
            setCancelReason('');
            refetch();
        } catch (e) {
            Alert.alert("Error", "No se pudo cancelar la cita");
        } finally {
            setActionLoading(null);
        }
    };

    const renderItem = ({ item }: { item: AppointmentItem }) => {
        const s = STATUS_MAP[item.status] || STATUS_MAP.pending;
        const date = new Date(item.date + "T12:00");

        return (
            <View style={[styles.card, { backgroundColor: theme.surface }]}>
                <View style={styles.cardHeader}>
                    <View style={[styles.dateBox, { backgroundColor: theme.background }]}>
                        <Text style={[styles.dateDay, { color: theme.primary }]}>{date.getDate()}</Text>
                        <Text style={[styles.dateMonth, { color: theme.textMuted }]}>{date.toLocaleDateString("es-MX", { month: "short" }).toUpperCase()}</Text>
                    </View>
                    <View style={styles.headerInfo}>
                        <Text style={[styles.serviceName, { color: theme.text }]}>{item.service_name}</Text>
                        <Text style={[styles.timeText, { color: theme.textMuted }]}>🕒 {item.start_time} - {item.end_time}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
                        <Text style={[styles.statusLabel, { color: s.color }]}>{s.emoji} {s.label}</Text>
                    </View>
                </View>

                {item.notes && (
                    <View style={[styles.notesBox, { backgroundColor: theme.background }]}>
                        <MessageSquare size={14} color={theme.textMuted} />
                        <Text style={[styles.notesText, { color: theme.textMuted }]}>{item.notes}</Text>
                    </View>
                )}

                <View style={[styles.actions, { borderTopColor: 'rgba(255,255,255,0.05)' }]}>
                    {item.status === 'pending' && (
                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: '#10b98120' }]}
                            onPress={() => handleConfirm(item.id)}
                            disabled={!!actionLoading}
                        >
                            {actionLoading === item.id ? (
                                <ActivityIndicator size="small" color="#10b981" />
                            ) : (
                                <>
                                    <CheckCircle2 size={16} color="#10b981" />
                                    <Text style={[styles.actionText, { color: '#10b981' }]}>Confirmar</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}

                    {item.status === 'confirmed' && (
                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: theme.primary + '20' }]}
                            onPress={() => handleComplete(item.id)}
                        >
                            <Stethoscope size={16} color={theme.primary} />
                            <Text style={[styles.actionText, { color: theme.primary }]}>Finalizar y Recetar</Text>
                        </TouchableOpacity>
                    )}

                    {['pending', 'confirmed'].includes(item.status) && (
                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: '#ef444410' }]}
                            onPress={() => setCancelModal({ visible: true, apptId: item.id })}
                        >
                            <X size={16} color="#ef4444" />
                            <Text style={[styles.actionText, { color: '#ef4444' }]}>Cancelar</Text>
                        </TouchableOpacity>
                    )}

                    {item.status === 'completed' && (
                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: 'rgba(255,255,255,0.05)' }]}
                            onPress={() => router.push(`/mi-clinica/historial/${item.id}` as any)}
                        >
                            <ClipboardList size={16} color={theme.text} />
                            <Text style={[styles.actionText, { color: theme.text }]}>Ver Ficha</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <ChevronLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <View style={styles.titleBox}>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Agenda</Text>
                    <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>Control de citas recibidas</Text>
                </View>
                <TouchableOpacity style={styles.filterBtn} onPress={() => { }}>
                    <Filter size={20} color={theme.textMuted} />
                </TouchableOpacity>
            </View>

            {/* Filter Tabs */}
            <View style={styles.tabsRow}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
                    {[
                        { key: "all", label: "Todas" },
                        { key: "pending", label: "⏳ Pendientes" },
                        { key: "confirmed", label: "✅ Confirmadas" },
                        { key: "completed", label: "🎉 Finalizadas" },
                        { key: "cancelled", label: "❌ Cerradas" },
                    ].map(tab => (
                        <TouchableOpacity
                            key={tab.key}
                            onPress={() => setFilter(tab.key)}
                            style={[
                                styles.tab,
                                { backgroundColor: theme.surface, borderColor: theme.border },
                                filter === tab.key && { backgroundColor: theme.primary + '20', borderColor: theme.primary }
                            ]}
                        >
                            <Text style={[
                                styles.tabText,
                                { color: theme.textMuted },
                                filter === tab.key && { color: theme.primary, fontWeight: '800' }
                            ]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {loadingAppts ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Clock size={64} color={theme.textMuted} strokeWidth={1} />
                            <Text style={[styles.emptyText, { color: theme.textMuted }]}>No hay citas en esta categoría</Text>
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
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
                        <View style={styles.modalHeaderTitle}>
                            <AlertCircle size={32} color="#ef4444" />
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Declinar Cita</Text>
                            <Text style={[styles.modalSub, { color: theme.textMuted }]}>
                                Indica el motivo por el cual no se puede atender esta cita.
                            </Text>
                        </View>

                        <TextInput
                            style={[styles.reasonInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                            placeholder="Ej: Clínica llena, el veterinario no estará disponible..."
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
                                onPress={handleCancelSubmit}
                            >
                                <Text style={styles.modalBtnTextDanger}>Confirmar Cierre</Text>
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
    filterBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
    tabsRow: { marginBottom: 10 },
    tabsScroll: { paddingHorizontal: 20, gap: 8 },
    tab: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, borderWidth: 1 },
    tabText: { fontSize: 13, fontWeight: '600' },
    list: { padding: 20, paddingBottom: 40 },
    card: { borderRadius: 28, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    dateBox: { width: 48, paddingVertical: 10, borderRadius: 14, alignItems: 'center' },
    dateDay: { fontSize: 18, fontWeight: '900' },
    dateMonth: { fontSize: 9, fontWeight: '800' },
    headerInfo: { flex: 1, gap: 4 },
    serviceName: { fontSize: 16, fontWeight: '800' },
    timeText: { fontSize: 12, fontWeight: '600' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
    statusLabel: { fontSize: 9, fontWeight: '800' },
    notesBox: { flexDirection: 'row', padding: 12, borderRadius: 16, marginTop: 16, gap: 10, alignItems: 'center' },
    notesText: { fontSize: 12, fontWeight: '600', fontStyle: 'italic', flex: 1 },
    actions: { flexDirection: 'row', gap: 10, marginTop: 16, paddingTop: 16, borderTopWidth: 1 },
    actionBtn: { flex: 1, flexDirection: 'row', height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', gap: 8 },
    actionText: { fontSize: 13, fontWeight: '700' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    empty: { paddingTop: 100, alignItems: 'center', gap: 20 },
    emptyText: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 24 },
    modalContent: { borderRadius: 32, padding: 24, paddingBottom: 0, gap: 16, overflow: 'hidden' },
    modalHeaderTitle: { alignItems: 'center', gap: 8 },
    modalTitle: { fontSize: 20, fontWeight: '900' },
    modalSub: { fontSize: 14, fontWeight: '600', textAlign: 'center', lineHeight: 20 },
    reasonInput: { height: 100, borderRadius: 20, padding: 16, borderWidth: 1, textAlignVertical: 'top', fontSize: 14, fontWeight: '600' },
    modalActions: { flexDirection: 'row', marginHorizontal: -24, marginTop: 8 },
    modalBtn: { flex: 1, height: 64, justifyContent: 'center', alignItems: 'center' },
    modalBtnText: { fontSize: 15, fontWeight: '700' },
    modalBtnTextDanger: { fontSize: 15, fontWeight: '800', color: '#fff' }
});
