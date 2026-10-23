import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Modal, FlatList } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import FormField from '@/src/components/FormField';
import Button from '@/src/components/Button';
import { usePrescriptions } from '@/src/hooks/clinica/usePrescriptions';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import SearchBar from '@/src/components/SearchBar';
import EmptyState from '@/src/components/EmptyState';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import { FileText, Plus, AlertCircle, X } from 'lucide-react-native';
import AppRefreshControl from '@/src/components/AppRefreshControl';
import { font, spacing } from '@/constants/design';

export default function RecetasScreen() {
    const { theme } = useTheme();
    const {
        modalVisible, setModalVisible, loadingAction, patientPickerVisible,
        setPatientPickerVisible, patientSearch, setPatientSearch, newPresc,
        setNewPresc, loadingClinics, loadingPrescriptions, prescriptions,
        resolvedPets, filteredPets, loadingPets, handleSavePrescription, selectPatient,
        handleUpdateStatus, isUpdatingStatus,
    } = usePrescriptions();

    if (loadingClinics) {
        return (
            <ScreenContainer>
                <LoadingOverlay message="Cargando recetas..." />
            </ScreenContainer>
        );
    }

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Recetas Médicas"
                actions={[{ icon: Plus, label: 'Emitir receta', onPress: () => setModalVisible(true) }]}
            />

            <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    
                    {loadingPrescriptions ? (
                        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: spacing.huge }} />
                    ) : prescriptions.length === 0 ? (
                        <EmptyState
                            icon={<FileText size={40} color={theme.textMuted} />}
                            title="No hay recetas emitidas"
                        />
                    ) : (
                        prescriptions.map(presc => (
                            <View key={presc.id} style={[styles.prescCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                <View style={styles.prescHeader}>
                                    <View style={[styles.prescIcon, { backgroundColor: theme.success + '15' }]}>
                                        <FileText size={20} color={theme.success} />
                                    </View>
                                    <View style={styles.prescInfo}>
                                        <Text style={[styles.patientLabel, { color: theme.textMuted }]}>{presc.patientName || 'Paciente'}</Text>
                                        <Text style={[styles.dateLabel, { color: theme.text }]}>
                                            Emitida: {presc.issuedDate ? new Date(presc.issuedDate).toLocaleDateString('es-MX') : 'N/A'}
                                        </Text>
                                    </View>
                                    <View style={[styles.statusBadge, { backgroundColor: presc.status === 'active' ? theme.success + '20' : theme.warning + '20' }]}>
                                        <Text style={[styles.statusText, { color: presc.status === 'active' ? theme.success : theme.warning }]}>
                                            {({ active: 'ACTIVA', filled: 'SURTIDA', cancelled: 'CANCELADA', expired: 'VENCIDA' } as Record<string, string>)[presc.status] || presc.status.toUpperCase()}
                                        </Text>
                                    </View>
                                </View>
                                
                                <View style={styles.medsContainer}>
                                    {presc.medications.map((med, idx) => (
                                        <View key={idx} style={styles.medRow}>
                                            <View style={styles.medDot} />
                                            <View style={{ flex: 1 }}>
                                                <Text style={[styles.medName, { color: theme.text }]}>{med.name}</Text>
                                                <Text style={[styles.medDetails, { color: theme.textMuted }]}>
                                                    {med.dosage} - {med.frequency} por {med.duration}
                                                </Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                                
                                {presc.notes && (
                                    <View style={[styles.notesBox, { backgroundColor: theme.background }]}>
                                        <AlertCircle size={14} color={theme.textMuted} />
                                        <Text style={[styles.notesText, { color: theme.textMuted }]}>{presc.notes}</Text>
                                    </View>
                                )}

                                {presc.status === 'active' && (
                                    <View style={styles.statusActions}>
                                        <TouchableOpacity
                                            style={[styles.statusBtn, { backgroundColor: theme.success + '15' }]}
                                            accessibilityRole="button"
                                            accessibilityLabel="Marcar receta como surtida"
                                            onPress={() => handleUpdateStatus(presc.id, 'filled')}
                                            disabled={isUpdatingStatus}
                                        >
                                            <Text style={[styles.statusBtnText, { color: theme.success }]}>Surtir</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.statusBtn, { backgroundColor: theme.error + '15' }]}
                                            accessibilityRole="button"
                                            accessibilityLabel="Cancelar receta"
                                            onPress={() => handleUpdateStatus(presc.id, 'cancelled')}
                                            disabled={isUpdatingStatus}
                                        >
                                            <Text style={[styles.statusBtnText, { color: theme.error }]}>Cancelar</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>

            {/* Create Prescription Modal */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Nueva Receta</Text>
                        
                        <KeyboardScreen>
                            <Text style={[styles.inputLabel, { color: theme.text }]}>Paciente *</Text>
                            <TouchableOpacity
                                style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, justifyContent: 'center' }]}
                                onPress={() => setPatientPickerVisible(true)}
                            >
                                <Text style={{ color: newPresc.patientId ? theme.text : theme.textMuted, fontSize: font.lg, fontWeight: '500' }}>
                                    {newPresc.patientId
                                        ? resolvedPets.find(p => p.id === newPresc.patientId)?.name || `Paciente: ${newPresc.patientId.substring(0, 8)}...`
                                        : 'Seleccionar paciente'}
                                </Text>
                            </TouchableOpacity>

                            <Text style={[styles.inputLabel, { color: theme.text, marginTop: spacing.xxl, fontSize: font.base }]}>Medicamento 1</Text>
                            
                            <FormField label="Nombre *" value={newPresc.medications[0].name} onChangeText={t => setNewPresc({
                                    ...newPresc, 
                                    medications: [{ ...newPresc.medications[0], name: t }] })} placeholder="Ej. Amoxicilina 500mg" />

                            <View style={{ flexDirection: 'row', gap: spacing.md }}>
                                <View style={{ flex: 1 }}>
                                    <FormField label="Dosis" value={newPresc.medications[0].dosage} onChangeText={t => setNewPresc({
                                            ...newPresc, 
                                            medications: [{ ...newPresc.medications[0], dosage: t }] })} placeholder="1 tableta" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <FormField label="Frecuencia" value={newPresc.medications[0].frequency} onChangeText={t => setNewPresc({
                                            ...newPresc, 
                                            medications: [{ ...newPresc.medications[0], frequency: t }] })} placeholder="Cada 8 horas" />
                                </View>
                            </View>

                            <FormField label="Duración" value={newPresc.medications[0].duration} onChangeText={t => setNewPresc({
                                    ...newPresc, 
                                    medications: [{ ...newPresc.medications[0], duration: t }] })} placeholder="Por 7 días" />

                            <FormField label="Notas Adicionales" value={newPresc.notes ?? ''} onChangeText={t => setNewPresc({...newPresc, notes: t})} placeholder="Tomar con alimentos..." multiline />
                            <View style={{ height: 40 }} />
                        </KeyboardScreen>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                                <Text style={[styles.cancelBtnText, { color: theme.text }]}>Cancelar</Text>
                            </TouchableOpacity>
                            <Button label="Emitir" onPress={handleSavePrescription} loading={loadingAction} />
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Patient Picker Modal */}
            <Modal visible={patientPickerVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.background, maxHeight: '70%' }]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
                            <Text style={[styles.modalTitle, { marginBottom: 0, color: theme.text }]}>Seleccionar Paciente</Text>
                            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Cerrar" onPress={() => { setPatientPickerVisible(false); setPatientSearch(''); }}>
                                <X size={24} color={theme.textMuted} />
                            </TouchableOpacity>
                        </View>

                        <View style={{ marginBottom: spacing.lg }}>
                            <SearchBar
                                value={patientSearch}
                                onChangeText={setPatientSearch}
                                placeholder="Buscar por nombre..."
                            />
                        </View>

                        {loadingPets ? (
                            <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: spacing.huge }} />
                        ) : (
                            <FlatList
            refreshControl={<AppRefreshControl />}
                                data={filteredPets}
                                keyExtractor={(item) => item.id}
                                style={{ maxHeight: 400 }}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[styles.petPickerItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
                                        onPress={() => selectPatient(item.id)}
                                    >
                                        <View style={styles.petPickerInfo}>
                                            <Text style={[styles.petPickerName, { color: theme.text }]}>{item.name}</Text>
                                            <Text style={[styles.petPickerBreed, { color: theme.textMuted }]}>
                                                {[item.breed || item.species, item.owner && `Dueño: ${item.owner}`].filter(Boolean).join(' · ')}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                )}
                                ListEmptyComponent={
                                    <View style={{ padding: spacing.huge, alignItems: 'center' }}>
                                        <Text style={{ color: theme.textMuted }}>No se encontraron pacientes</Text>
                                    </View>
                                }
                            />
                        )}
                    </View>
                </View>
            </Modal>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    contentScroll: { flex: 1 },
    content: { padding: spacing.xxl, paddingBottom: 100 },
    prescCard: {
        padding: spacing.lg, borderRadius: 20, borderWidth: 1,
        marginBottom: spacing.lg
    },
    prescHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
    prescIcon: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    prescInfo: { flex: 1 },
    patientLabel: { fontSize: font.sm, fontWeight: '700', textTransform: 'uppercase', marginBottom: spacing.xxs },
    dateLabel: { fontSize: font.base, fontWeight: '800' },
    statusBadge: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 8 },
    statusText: { fontSize: font.xs, fontWeight: '900' },
    medsContainer: { borderTopWidth: 1, borderTopColor: 'rgba(128,128,128,0.2)', paddingTop: spacing.lg },
    medRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, marginBottom: spacing.md },
    medDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981', marginTop: spacing.sm },
    medName: { fontSize: font.lg, fontWeight: '800' },
    medDetails: { fontSize: font.base, fontWeight: '600', marginTop: spacing.xxs },
    notesBox: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md, borderRadius: 12, marginTop: spacing.xs },
    notesText: { flex: 1, fontSize: font.md, fontWeight: '500', lineHeight: 18 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: spacing.xxl, paddingBottom: spacing.huge, maxHeight: '85%' },
    modalTitle: { fontSize: font.h3, fontWeight: '900', marginBottom: spacing.xl },
    inputLabel: { fontSize: font.md, fontWeight: '700', marginBottom: spacing.sm, marginTop: spacing.lg },
    input: { height: 50, borderWidth: 1, borderRadius: 14, paddingHorizontal: spacing.lg, fontSize: font.lg, fontWeight: '500' },
    modalActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
    cancelBtn: { flex: 1, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.05)' },
    cancelBtnText: { fontSize: font.lg, fontWeight: '700' },
    saveBtn: { flex: 1, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    saveBtnText: { color: '#fff', fontSize: font.lg, fontWeight: '800' },
    petPickerItem: { padding: spacing.lg, borderRadius: 16, borderWidth: 1, marginBottom: spacing.md },
    petPickerInfo: { flex: 1 },
    petPickerName: { fontSize: font.xl, fontWeight: '800', marginBottom: spacing.xxs },
    petPickerBreed: { fontSize: font.base, fontWeight: '500' },
    statusActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
    statusBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    statusBtnText: { fontSize: font.base, fontWeight: '800' },
});
