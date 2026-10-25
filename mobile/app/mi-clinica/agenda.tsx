import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ActivityIndicator, Modal, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useAgenda } from '@/src/hooks/clinica/useAgenda';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { AppointmentItem } from '@/src/services/directorio';
import { CheckCircle2, X, MessageSquare, Stethoscope, AlertCircle, Clock, ClipboardList, Search } from 'lucide-react-native';
import { statusTone } from '@/src/features/salud/format';
import AppRefreshControl from '@/src/components/AppRefreshControl';
import { families, font, layout, spacing } from '@/constants/design';
import { SkeletonList } from '@/src/components/Skeleton';

export default function AgendaClinicaScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const {
        filtered,
        loadingAppts,
        filter,
        setFilter,
        showSearch,
        toggleSearch,
        searchQuery,
        setSearchQuery,
        actionLoading,
        handleConfirm,
        handleComplete,
        handleCancelSubmit,
        cancelModal,
        cancelReason,
        setCancelReason,
        openCancelModal,
        closeCancelModal,
        goToRecord,
    } = useAgenda();

    const renderItem = ({ item }: { item: AppointmentItem }) => {
        const s = statusTone(theme, item.status);
        const date = new Date(item.date + "T12:00");

        return (
            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={styles.cardHeader}>
                    <View style={[styles.dateBox, { backgroundColor: theme.background }]}>
                        <Text style={[styles.dateDay, { color: theme.primary }]}>{date.getDate()}</Text>
                        <Text style={[styles.dateMonth, { color: theme.textMuted }]}>{date.toLocaleDateString("es-MX", { month: "short" }).toUpperCase()}</Text>
                    </View>
                    <View style={styles.headerInfo}>
                        <Text style={[styles.serviceName, { color: theme.text }]}>{item.service_name}{item.is_emergency ? '  ·  Urgencia' : ''}</Text>
                        {!!item.pet_name && <Text style={[styles.timeText, { color: theme.text }]}>Paciente: {item.pet_name}</Text>}
                        <Text style={[styles.timeText, { color: theme.textMuted }]}>{item.start_time} - {item.end_time}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
                        <Text style={[styles.statusLabel, { color: s.color }]}>{s.label}</Text>
                    </View>
                </View>

                {!!item.notes && (
                    <View style={[styles.notesBox, { backgroundColor: theme.background }]}>
                        <MessageSquare size={14} color={theme.textMuted} />
                        <Text style={[styles.notesText, { color: theme.textMuted }]}>{item.notes}</Text>
                    </View>
                )}

                <View style={[styles.actions, { borderTopColor: theme.border }]}>
                    {item.status === 'pending' && (
                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: theme.successLight }]}
                            onPress={() => handleConfirm(item.id)}
                            disabled={!!actionLoading}
                        >
                            {actionLoading === item.id ? (
                                <ActivityIndicator size="small" color={theme.success} />
                            ) : (
                                <>
                                    <CheckCircle2 size={16} color={theme.success} />
                                    <Text style={[styles.actionText, { color: theme.success }]}>Confirmar</Text>
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
                            style={[styles.actionBtn, { backgroundColor: theme.errorLight }]}
                            onPress={() => openCancelModal(item.id)}
                        >
                            <X size={16} color={theme.error} />
                            <Text style={[styles.actionText, { color: theme.error }]}>Cancelar</Text>
                        </TouchableOpacity>
                    )}

                    {item.status === 'completed' && (
                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: theme.overlay }]}
                            onPress={() => goToRecord(item.id)}
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
        <ScreenContainer>
            <ScreenHeader
                title="Agenda"
                subtitle="Control de citas recibidas"
                actions={[{ icon: showSearch ? X : Search, label: showSearch ? 'Cerrar búsqueda' : 'Buscar cita', onPress: toggleSearch }]}
            />

            {showSearch && (
                <View style={styles.searchContainer}>
                    <TextInput
                        style={[styles.searchInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                        placeholder="Buscar cita..."
                        placeholderTextColor={theme.textMuted}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoFocus
                    />
                </View>
            )}

            {/* Filter Tabs */}
            <View style={styles.tabsRow}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
                    {[
                        { key: "all", label: "Todas" },
                        { key: "pending", label: "Pendientes" },
                        { key: "confirmed", label: "Confirmadas" },
                        { key: "completed", label: "Finalizadas" },
                        { key: "cancelled", label: "Canceladas" },
                    ].map(tab => (
                        <TouchableOpacity
                            key={tab.key}
                            accessibilityRole="button"
                            accessibilityState={{ selected: filter === tab.key }}
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
                                filter === tab.key && { color: theme.primary, fontFamily: families.extrabold }
                            ]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {loadingAppts ? (
                <View style={styles.center}>
                    <SkeletonList count={3} />
                </View>
            ) : (
                <FlatList
            refreshControl={<AppRefreshControl />}
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
                onRequestClose={closeCancelModal}
            >
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
                        <View style={styles.modalHeaderTitle}>
                            <AlertCircle size={32} color={theme.error} />
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
                                onPress={closeCancelModal}
                            >
                                <Text style={[styles.modalBtnText, { color: theme.text }]}>Mantener</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, { backgroundColor: theme.error }]}
                                onPress={handleCancelSubmit}
                            >
                                <Text style={[styles.modalBtnTextDanger, { color: theme.onPrimary }, { color: theme.onPrimary }]}>Confirmar Cierre</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    tabsRow: { marginBottom: spacing.md },
    tabsScroll: { paddingHorizontal: spacing.xl, gap: spacing.sm },
    tab: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    tabText: { fontSize: font.base, fontFamily: families.semibold },
    list: { padding: spacing.xl, paddingBottom: spacing.huge },
    card: { borderRadius: 28, padding: spacing.xl, marginBottom: spacing.lg, borderWidth: 1, borderColor: 'rgba(128,128,128,0.2)' },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
    dateBox: { width: 48, paddingVertical: spacing.md, borderRadius: 14, alignItems: 'center' },
    dateDay: { fontSize: font.xxl, fontFamily: families.black },
    dateMonth: { fontSize: font.xs, fontFamily: families.extrabold },
    headerInfo: { flex: 1, gap: spacing.xs },
    serviceName: { fontSize: font.xl, fontFamily: families.extrabold },
    timeText: { fontSize: font.md, fontFamily: families.semibold },
    statusBadge: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 12 },
    statusLabel: { fontSize: font.xs, fontFamily: families.extrabold },
    notesBox: { flexDirection: 'row', padding: spacing.md, borderRadius: 16, marginTop: spacing.lg, gap: spacing.md, alignItems: 'center' },
    notesText: { fontSize: font.md, fontFamily: families.semibold, fontStyle: 'italic', flex: 1 },
    actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg, paddingTop: spacing.lg, borderTopWidth: 1 },
    actionBtn: { flex: 1, flexDirection: 'row', height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', gap: spacing.sm },
    actionText: { fontSize: font.base, fontFamily: families.bold },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    empty: { paddingTop: 100, alignItems: 'center', gap: spacing.xl },
    emptyText: { fontSize: font.xl, fontFamily: families.semibold, textAlign: 'center' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: spacing.xxl },
    modalContent: { borderRadius: 32, padding: spacing.xxl, paddingBottom: 0, gap: spacing.lg, overflow: 'hidden' },
    modalHeaderTitle: { alignItems: 'center', gap: spacing.sm },
    modalTitle: { fontSize: font.h3, fontFamily: families.black },
    modalSub: { fontSize: font.base, fontFamily: families.semibold, textAlign: 'center', lineHeight: 20 },
    reasonInput: { height: 100, borderRadius: 20, padding: spacing.lg, borderWidth: 1, textAlignVertical: 'top', fontSize: font.base, fontFamily: families.semibold },
    modalActions: { flexDirection: 'row', marginHorizontal: -24, marginTop: spacing.sm },
    modalBtn: { flex: 1, height: 64, justifyContent: 'center', alignItems: 'center' },
    modalBtnText: { fontSize: font.lg, fontFamily: families.bold },
    modalBtnTextDanger: { fontSize: font.lg, fontFamily: families.extrabold, },
    searchContainer: { paddingHorizontal: layout.screenPadding, paddingBottom: spacing.lg },
    searchInput: { height: 44, borderRadius: 12, paddingHorizontal: spacing.lg, borderWidth: 1, fontFamily: families.semibold }
});
