import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ActivityIndicator, Modal, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useSurgeries } from '@/src/hooks/clinica';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { SurgeryItem } from '@/src/services/directorio';
import { Plus, MapPin, Clock, X, Calendar as CalendarIcon, HeartPulse, Search } from 'lucide-react-native';

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
    "scheduled": { label: "Programada", color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
    "in-progress": { label: "En Quirófano", color: "#ef4444", bg: "rgba(239,68,68,0.15)" },
    "completed": { label: "Completada", color: "#10b981", bg: "rgba(16,185,129,0.15)" },
    "cancelled": { label: "Cancelada", color: "#6b7280", bg: "rgba(107,114,128,0.15)" },
};

const TYPE_MAP: Record<string, { label: string; icon: string; color: string }> = {
    "elective": { label: "Electiva", icon: "🗓️", color: "#3b82f6" },
    "preventive": { label: "Preventiva", icon: "🛡️", color: "#10b981" },
    "emergency": { label: "Emergencia", icon: "🚨", color: "#ef4444" },
};

export default function CirugiasScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const {
        filtered,
        isLoading,
        filter,
        setFilter,
        showSearch,
        toggleSearch,
        searchQuery,
        setSearchQuery,
        modalVisible,
        setModalVisible,
        selectedPatientId,
        setSelectedPatientId,
        surgName,
        setSurgName,
        surgType,
        setSurgType,
        surgDate,
        setSurgDate,
        surgDuration,
        setSurgDuration,
        surgRoom,
        setSurgRoom,
        handleCreate,
        isCreating,
    } = useSurgeries();

    const renderItem = ({ item }: { item: SurgeryItem }) => {
        const status = STATUS_MAP[item.status] || STATUS_MAP["scheduled"];
        const typeInfo = TYPE_MAP[item.surgery_type] || TYPE_MAP["elective"];
        
        const dateObj = new Date(item.scheduled_date);
        const dateStr = dateObj.toLocaleDateString("es-MX", { month: "short", day: "numeric" }).toUpperCase();
        const timeStr = dateObj.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });

        return (
            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: item.status === 'in-progress' ? '#ef444450' : 'rgba(255,255,255,0.05)' }]}>
                <View style={styles.cardHeader}>
                    <View style={styles.headerInfo}>
                        <View style={styles.typeRow}>
                            <Text style={{ fontSize: 16 }}>{typeInfo.icon}</Text>
                            <Text style={[styles.typeText, { color: typeInfo.color }]}>{typeInfo.label}</Text>
                        </View>
                        <Text style={[styles.serviceName, { color: theme.text }]}>{item.surgery_name}</Text>
                        <View style={styles.roomRow}>
                            <MapPin size={12} color={theme.textMuted} />
                            <Text style={[styles.timeText, { color: theme.textMuted }]}>{item.operating_room || 'Sala por asignar'}</Text>
                        </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                        <Text style={[styles.statusLabel, { color: status.color }]}>{status.label}</Text>
                    </View>
                </View>

                <View style={[styles.actions, { borderTopColor: 'rgba(255,255,255,0.05)' }]}>
                    <View style={styles.timeBox}>
                        <CalendarIcon size={14} color={theme.textMuted} />
                        <Text style={[styles.timeDetail, { color: theme.text }]}>{dateStr} • {timeStr}</Text>
                    </View>
                    <View style={styles.timeBox}>
                        <Clock size={14} color={theme.textMuted} />
                        <Text style={[styles.timeDetail, { color: theme.text }]}>~{item.estimated_duration_minutes} min</Text>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Quirófano"
                subtitle="Gestión de Cirugías"
                rightElement={
                    <TouchableOpacity style={styles.filterBtn} onPress={toggleSearch}>
                        {showSearch ? <X size={20} color={theme.textMuted} /> : <Search size={20} color={theme.textMuted} />}
                    </TouchableOpacity>
                }
            />

            {showSearch && (
                <View style={styles.searchContainer}>
                    <TextInput
                        style={[styles.searchInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                        placeholder="Buscar cirugía o sala..."
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
                        { key: "scheduled", label: "⏳ Programadas" },
                        { key: "in-progress", label: "🚨 En Curso" },
                        { key: "completed", label: "✅ Completadas" },
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

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={(item) => item.id || Math.random().toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <HeartPulse size={64} color={theme.textMuted} strokeWidth={1} />
                            <Text style={[styles.emptyText, { color: theme.textMuted }]}>No hay cirugías en esta categoría</Text>
                        </View>
                    }
                />
            )}

            {/* Floating Action Button */}
            <TouchableOpacity 
                style={[styles.fab, { backgroundColor: theme.primary }]}
                onPress={() => setModalVisible(true)}
            >
                <Plus size={24} color="#fff" />
            </TouchableOpacity>

            {/* Modal de Agendamiento */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={[styles.modalTitle, { color: theme.text }]}>Agendar Cirugía</Text>
                                <Text style={[styles.modalSub, { color: theme.textMuted }]}>Programa una nueva intervención</Text>
                            </View>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={[styles.closeBtn, { backgroundColor: theme.surface }]}>
                                <X size={20} color={theme.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                            <View style={styles.formGroup}>
                                <Text style={[styles.label, { color: theme.text }]}>Nombre del Procedimiento</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                    placeholder="Ej: Ovariohisterectomía, Profilaxis..."
                                    placeholderTextColor={theme.textMuted}
                                    value={surgName}
                                    onChangeText={setSurgName}
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={[styles.label, { color: theme.text }]}>ID del Paciente</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                    placeholder="Ej: pet_abc123"
                                    placeholderTextColor={theme.textMuted}
                                    value={selectedPatientId}
                                    onChangeText={setSelectedPatientId}
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={[styles.label, { color: theme.text }]}>Tipo de Cirugía</Text>
                                <View style={styles.typeGrid}>
                                    {[
                                        { id: 'elective', label: 'Electiva', color: '#3b82f6' },
                                        { id: 'preventive', label: 'Preventiva', color: '#10b981' },
                                        { id: 'emergency', label: 'Emergencia', color: '#ef4444' }
                                    ].map(t => (
                                        <TouchableOpacity 
                                            key={t.id}
                                            style={[
                                                styles.typeBtn, 
                                                { borderColor: theme.border },
                                                surgType === t.id && { backgroundColor: t.color + '15', borderColor: t.color }
                                            ]}
                                            onPress={() => setSurgType(t.id)}
                                        >
                                            <Text style={{ color: surgType === t.id ? t.color : theme.textMuted, fontWeight: '700', fontSize: 12 }}>{t.label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.formRow}>
                                <View style={[styles.formGroup, { flex: 1 }]}>
                                    <Text style={[styles.label, { color: theme.text }]}>Fecha y Hora</Text>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                        placeholder="YYYY-MM-DDTHH:MM"
                                        placeholderTextColor={theme.textMuted}
                                        value={surgDate}
                                        onChangeText={setSurgDate}
                                    />
                                </View>
                                <View style={[styles.formGroup, { flex: 1 }]}>
                                    <Text style={[styles.label, { color: theme.text }]}>Duración (min)</Text>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                        placeholder="60"
                                        keyboardType="numeric"
                                        placeholderTextColor={theme.textMuted}
                                        value={surgDuration}
                                        onChangeText={setSurgDuration}
                                    />
                                </View>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={[styles.label, { color: theme.text }]}>Quirófano</Text>
                                <View style={styles.typeGrid}>
                                    {['OR-1', 'OR-2', 'Dentista'].map(room => (
                                        <TouchableOpacity 
                                            key={room}
                                            style={[
                                                styles.typeBtn, 
                                                { borderColor: theme.border },
                                                surgRoom === room && { backgroundColor: theme.primary + '15', borderColor: theme.primary }
                                            ]}
                                            onPress={() => setSurgRoom(room)}
                                        >
                                            <Text style={{ color: surgRoom === room ? theme.primary : theme.textMuted, fontWeight: '700', fontSize: 12 }}>{room}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                            
                            <View style={{ height: 40 }} />
                        </ScrollView>

                        <View style={[styles.modalFooter, { borderTopColor: theme.border }]}>
                            <TouchableOpacity
                                style={[styles.submitBtn, { backgroundColor: theme.primary }]}
                                onPress={handleCreate}
                                disabled={isCreating}
                            >
                                {isCreating ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.submitBtnText}>Agendar Intervención</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    filterBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
    tabsRow: { marginBottom: 10 },
    tabsScroll: { paddingHorizontal: 20, gap: 8 },
    tab: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, borderWidth: 1 },
    tabText: { fontSize: 13, fontWeight: '600' },
    list: { padding: 20, paddingBottom: 100 },
    card: { borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    headerInfo: { flex: 1, gap: 6 },
    typeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    typeText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
    serviceName: { fontSize: 18, fontWeight: '800' },
    roomRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    timeText: { fontSize: 12, fontWeight: '600' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
    statusLabel: { fontSize: 9, fontWeight: '900', textTransform: 'uppercase' },
    actions: { flexDirection: 'row', gap: 16, marginTop: 16, paddingTop: 16, borderTopWidth: 1 },
    timeBox: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    timeDetail: { fontSize: 13, fontWeight: '700' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    empty: { paddingTop: 100, alignItems: 'center', gap: 20 },
    emptyText: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
    fab: { position: 'absolute', bottom: 30, right: 24, width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 10 },
    modalOverlay: { flex: 1, justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, height: '85%', padding: 24, paddingBottom: 0 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { fontSize: 24, fontWeight: '900' },
    modalSub: { fontSize: 14, fontWeight: '600', marginTop: 4 },
    closeBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    formGroup: { marginBottom: 20 },
    formRow: { flexDirection: 'row', gap: 12 },
    label: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
    input: { height: 56, borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, fontSize: 16, fontWeight: '600' },
    typeGrid: { flexDirection: 'row', gap: 8 },
    typeBtn: { flex: 1, height: 48, borderRadius: 12, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
    modalFooter: { paddingVertical: 24, borderTopWidth: 1 },
    submitBtn: { height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
    searchContainer: { paddingHorizontal: 24, paddingBottom: 16 },
    searchInput: { height: 44, borderRadius: 12, paddingHorizontal: 16, borderWidth: 1, fontWeight: '600' }
});
