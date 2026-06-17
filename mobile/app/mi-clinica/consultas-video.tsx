import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ActivityIndicator, Modal, TextInput } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useVideoConsultations } from '@/src/hooks/clinica/useVideoConsultations';
import { ConsultationItem } from '@/src/services/directorio';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import EmptyState from '@/src/components/EmptyState';
import { Plus, Video, Calendar, Clock, VideoOff, ExternalLink, X } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';

export default function ConsultasVideoScreen() {
    const { theme } = useTheme();
    const {
        modalVisible, setModalVisible, loadingAction,
        selectedPetId, setSelectedPetId, selectedClinicId, setSelectedClinicId,
        selectedVetId, setSelectedVetId, scheduledAt, setScheduledAt,
        notes, setNotes, isVet, isLoading, consultations,
        pets, clinics, vets, handleBook, handleStatusUpdate,
        launchVideoRoom, getStatusColor, openBookingModal,
    } = useVideoConsultations();

    const renderConsultationItem = ({ item }: { item: ConsultationItem }) => {
        const statusColor = getStatusColor(item.status);
        const dateObj = new Date(item.scheduled_at);
        const formattedDate = dateObj.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const formattedTime = dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

        return (
            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={styles.cardHeader}>
                    <View style={styles.roomBadgeContainer}>
                        <Video size={18} color={theme.primary} />
                        <Text style={[styles.cardTitle, { color: theme.text }]}>Tele-Consulta</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
                        <Text style={[styles.statusText, { color: statusColor }]}>
                            {item.status.toUpperCase()}
                        </Text>
                    </View>
                </View>

                <View style={styles.cardBody}>
                    <View style={styles.timeRow}>
                        <Calendar size={16} color={theme.textMuted} />
                        <Text style={[styles.timeText, { color: theme.text }]}>{formattedDate}</Text>
                    </View>
                    <View style={styles.timeRow}>
                        <Clock size={16} color={theme.textMuted} />
                        <Text style={[styles.timeText, { color: theme.text }]}>{formattedTime}</Text>
                    </View>
                    {item.notes && (
                        <View style={styles.notesBox}>
                            <Text style={[styles.notesLabel, { color: theme.textMuted }]}>SÍNTOMAS / NOTAS:</Text>
                            <Text style={[styles.notesText, { color: theme.text }]}>{item.notes}</Text>
                        </View>
                    )}
                </View>

                <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
                    {isVet && item.status === 'scheduled' && (
                        <TouchableOpacity
                            style={[styles.btnSecondary, { borderColor: '#10b981', borderWidth: 1 }]}
                            onPress={() => handleStatusUpdate(item.id, 'active')}
                        >
                            <Text style={{ color: '#10b981', fontWeight: '800', fontSize: 13 }}>Iniciar Sala</Text>
                        </TouchableOpacity>
                    )}

                    {isVet && item.status === 'active' && (
                        <TouchableOpacity
                            style={[styles.btnSecondary, { borderColor: '#8b5cf6', borderWidth: 1 }]}
                            onPress={() => handleStatusUpdate(item.id, 'completed')}
                        >
                            <Text style={{ color: '#8b5cf6', fontWeight: '800', fontSize: 13 }}>Finalizar Consulta</Text>
                        </TouchableOpacity>
                    )}

                    {item.status === 'active' && item.room_url ? (
                        <TouchableOpacity
                            style={[styles.btnPrimary, { backgroundColor: '#10b981' }]}
                            onPress={() => launchVideoRoom(item.room_url)}
                        >
                            <ExternalLink size={16} color="#fff" />
                            <Text style={styles.btnText}>Unirse al Video</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.disabledRoom}>
                            <VideoOff size={16} color={theme.textMuted} />
                            <Text style={[styles.disabledRoomText, { color: theme.textMuted }]}>Sala no iniciada</Text>
                        </View>
                    )}
                </View>
            </View>
        );
    };

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Videoconsultas"
                rightElement={
                    !isVet ? (
                        <TouchableOpacity
                            style={[styles.addBtn, { backgroundColor: theme.primary }]}
                            onPress={openBookingModal}
                        >
                            <Plus size={20} color="#fff" />
                        </TouchableOpacity>
                    ) : (
                        <View style={{ width: 44 }} />
                    )
                }
            />

            <View style={styles.content}>
                {isLoading ? (
                    <LoadingOverlay message="Cargando videoconsultas..." />
                ) : (
                    <FlatList
                        data={consultations}
                        renderItem={renderConsultationItem}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContainer}
                        ListEmptyComponent={
                            <EmptyState
                                icon={<VideoOff size={64} color={theme.textMuted} strokeWidth={1} />}
                                title="No tienes videoconsultas programadas"
                            />
                        }
                    />
                )}
            </View>

            {/* Modal para agendar consulta */}
            <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
                <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <X size={24} color={theme.text} />
                        </TouchableOpacity>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Agendar Consulta</Text>
                        <TouchableOpacity onPress={handleBook} disabled={loadingAction}>
                            {loadingAction ? (
                                <ActivityIndicator size="small" color={theme.primary} />
                            ) : (
                                <Text style={[styles.saveBtnText, { color: theme.primary }]}>Agendar</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <KeyboardScreen style={{ padding: 24 }}>
                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: theme.textMuted }]}>Mascota</Text>
                            <View style={[styles.pickerContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                <Picker
                                    selectedValue={selectedPetId}
                                    onValueChange={(val) => setSelectedPetId(val)}
                                    style={{ color: theme.text }}
                                >
                                    <Picker.Item label="-- Elige una mascota --" value="" />
                                    {pets.map((pet) => (
                                        <Picker.Item key={pet.id} label={pet.name} value={pet.id} />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: theme.textMuted }]}>Clínica</Text>
                            <View style={[styles.pickerContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                <Picker
                                    selectedValue={selectedClinicId}
                                    onValueChange={(val) => setSelectedClinicId(val)}
                                    style={{ color: theme.text }}
                                >
                                    <Picker.Item label="-- Elige una clínica (Opcional) --" value="" />
                                    {clinics.map((c) => (
                                        <Picker.Item key={c.id} label={c.name} value={c.id} />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: theme.textMuted }]}>Médico Veterinario</Text>
                            <View style={[styles.pickerContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                <Picker
                                    selectedValue={selectedVetId}
                                    onValueChange={(val) => setSelectedVetId(val)}
                                    style={{ color: theme.text }}
                                    enabled={!!selectedClinicId}
                                >
                                    <Picker.Item label="-- Elige un médico (Opcional) --" value="" />
                                    {vets.map((v) => (
                                        <Picker.Item key={v.id} label={`${v.first_name} ${v.last_name || ''}`} value={v.id} />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: theme.textMuted }]}>Fecha y Hora (ISO Formato) *</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                value={scheduledAt}
                                onChangeText={setScheduledAt}
                                placeholder="Ej. 2026-06-20T10:00:00Z"
                                placeholderTextColor={theme.textMuted}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: theme.textMuted }]}>Detalle de Síntomas o Notas</Text>
                            <TextInput
                                style={[styles.textArea, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                value={notes}
                                onChangeText={setNotes}
                                placeholder="Escribe el motivo de la videoconsulta..."
                                placeholderTextColor={theme.textMuted}
                                multiline
                                numberOfLines={3}
                            />
                        </View>
                        
                        <View style={{ height: 60 }} />
                    </KeyboardScreen>
                </View>
            </Modal>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    content: { flex: 1 },
    listContainer: { padding: 24, gap: 16, paddingBottom: 100 },
    card: {
        padding: 16, borderRadius: 24, borderWidth: 1, gap: 12,
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 5,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    roomBadgeContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    cardTitle: { fontSize: 15, fontWeight: '800' },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    statusText: { fontSize: 10, fontWeight: '800' },
    cardBody: { gap: 6 },
    timeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    timeText: { fontSize: 13, fontWeight: '600' },
    notesBox: { padding: 12, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.02)', marginTop: 6 },
    notesLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5, marginBottom: 4 },
    notesText: { fontSize: 12, fontWeight: '500', lineHeight: 16 },
    cardFooter: {
        flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center',
        borderTopWidth: 1, paddingTop: 12, gap: 10,
    },
    btnPrimary: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
    btnSecondary: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    btnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
    disabledRoom: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    disabledRoomText: { fontSize: 12, fontWeight: '700' },
    addBtn: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    modalContainer: { flex: 1 },
    modalHeader: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 24, paddingVertical: 20,
        borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    modalTitle: { fontSize: 18, fontWeight: '800' },
    saveBtnText: { fontSize: 16, fontWeight: '800' },
    formGroup: { marginBottom: 20 },
    label: { fontSize: 12, fontWeight: '800', marginBottom: 8, textTransform: 'uppercase' },
    pickerContainer: { height: 54, borderRadius: 16, borderWidth: 1, justifyContent: 'center', overflow: 'hidden' },
    input: { height: 52, borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, fontSize: 14, fontWeight: '600' },
    textArea: { height: 100, borderRadius: 16, paddingHorizontal: 16, paddingTop: 12, borderWidth: 1, fontSize: 14, fontWeight: '600', textAlignVertical: 'top' },
});
