import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Modal, TextInput, FlatList } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { usePrescriptions } from '@/src/hooks/clinica/usePrescriptions';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import SearchBar from '@/src/components/SearchBar';
import EmptyState from '@/src/components/EmptyState';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import { FileText, PlusCircle, AlertCircle, X } from 'lucide-react-native';

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
                gradient={['#10b981', '#059669', '#047857']}
                rightElement={
                    <TouchableOpacity 
                        style={[styles.headerAction, { backgroundColor: 'rgba(255,255,255,0.15)' }]}
                        onPress={() => setModalVisible(true)}
                    >
                        <PlusCircle size={20} color="#fff" />
                    </TouchableOpacity>
                }
            />

            <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    
                    {loadingPrescriptions ? (
                        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
                    ) : prescriptions.length === 0 ? (
                        <EmptyState
                            icon={<FileText size={40} color={theme.textMuted} />}
                            title="No hay recetas emitidas"
                        />
                    ) : (
                        prescriptions.map(presc => (
                            <View key={presc.id} style={[styles.prescCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                <View style={styles.prescHeader}>
                                    <View style={[styles.prescIcon, { backgroundColor: '#10b98115' }]}>
                                        <FileText size={20} color="#10b981" />
                                    </View>
                                    <View style={styles.prescInfo}>
                                        <Text style={[styles.patientLabel, { color: theme.textMuted }]}>Paciente ID: {presc.patientId.substring(0,8)}</Text>
                                        <Text style={[styles.dateLabel, { color: theme.text }]}>
                                            Emitida: {presc.issuedDate ? new Date(presc.issuedDate).toLocaleDateString() : 'N/A'}
                                        </Text>
                                    </View>
                                    <View style={[styles.statusBadge, { backgroundColor: presc.status === 'active' ? '#10b98120' : '#f59e0b20' }]}>
                                        <Text style={[styles.statusText, { color: presc.status === 'active' ? '#10b981' : '#f59e0b' }]}>
                                            {presc.status.toUpperCase()}
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
                                    <View style={[styles.notesBox, { backgroundColor: 'rgba(255,255,255,0.02)' }]}>
                                        <AlertCircle size={14} color={theme.textMuted} />
                                        <Text style={[styles.notesText, { color: theme.textMuted }]}>{presc.notes}</Text>
                                    </View>
                                )}

                                {presc.status === 'active' && (
                                    <View style={styles.statusActions}>
                                        <TouchableOpacity
                                            style={[styles.statusBtn, { backgroundColor: '#10b98115' }]}
                                            onPress={() => handleUpdateStatus(presc.id, 'filled')}
                                            disabled={isUpdatingStatus}
                                        >
                                            <Text style={[styles.statusBtnText, { color: '#10b981' }]}>✓ Surtir</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.statusBtn, { backgroundColor: '#ef444415' }]}
                                            onPress={() => handleUpdateStatus(presc.id, 'cancelled')}
                                            disabled={isUpdatingStatus}
                                        >
                                            <Text style={[styles.statusBtnText, { color: '#ef4444' }]}>✕ Cancelar</Text>
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
                                <Text style={{ color: newPresc.patientId ? theme.text : theme.textMuted, fontSize: 15, fontWeight: '500' }}>
                                    {newPresc.patientId
                                        ? resolvedPets.find(p => p.id === newPresc.patientId)?.name || `Paciente: ${newPresc.patientId.substring(0, 8)}...`
                                        : 'Seleccionar paciente'}
                                </Text>
                            </TouchableOpacity>

                            <Text style={[styles.inputLabel, { color: theme.text, marginTop: 24, fontSize: 14 }]}>Medicamento 1</Text>
                            
                            <Text style={[styles.inputLabel, { color: theme.text }]}>Nombre *</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                value={newPresc.medications[0].name}
                                onChangeText={t => setNewPresc({
                                    ...newPresc, 
                                    medications: [{ ...newPresc.medications[0], name: t }]
                                })}
                                placeholder="Ej. Amoxicilina 500mg"
                                placeholderTextColor={theme.textMuted}
                            />

                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.inputLabel, { color: theme.text }]}>Dosis</Text>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                        value={newPresc.medications[0].dosage}
                                        onChangeText={t => setNewPresc({
                                            ...newPresc, 
                                            medications: [{ ...newPresc.medications[0], dosage: t }]
                                        })}
                                        placeholder="1 tableta"
                                        placeholderTextColor={theme.textMuted}
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.inputLabel, { color: theme.text }]}>Frecuencia</Text>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                        value={newPresc.medications[0].frequency}
                                        onChangeText={t => setNewPresc({
                                            ...newPresc, 
                                            medications: [{ ...newPresc.medications[0], frequency: t }]
                                        })}
                                        placeholder="Cada 8 horas"
                                        placeholderTextColor={theme.textMuted}
                                    />
                                </View>
                            </View>

                            <Text style={[styles.inputLabel, { color: theme.text }]}>Duración</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                value={newPresc.medications[0].duration}
                                onChangeText={t => setNewPresc({
                                    ...newPresc, 
                                    medications: [{ ...newPresc.medications[0], duration: t }]
                                })}
                                placeholder="Por 7 días"
                                placeholderTextColor={theme.textMuted}
                            />

                            <Text style={[styles.inputLabel, { color: theme.text, marginTop: 24 }]}>Notas Adicionales</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border, height: 80 }]}
                                value={newPresc.notes}
                                onChangeText={t => setNewPresc({...newPresc, notes: t})}
                                placeholder="Tomar con alimentos..."
                                placeholderTextColor={theme.textMuted}
                                multiline
                            />
                            <View style={{ height: 40 }} />
                        </KeyboardScreen>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                                <Text style={[styles.cancelBtnText, { color: theme.text }]}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.saveBtn, { backgroundColor: theme.primary }]}
                                onPress={handleSavePrescription}
                                disabled={loadingAction}
                            >
                                {loadingAction ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.saveBtnText}>Emitir</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Patient Picker Modal */}
            <Modal visible={patientPickerVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.background, maxHeight: '70%' }]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <Text style={[styles.modalTitle, { marginBottom: 0 }]}>Seleccionar Paciente</Text>
                            <TouchableOpacity onPress={() => { setPatientPickerVisible(false); setPatientSearch(''); }}>
                                <X size={24} color={theme.textMuted} />
                            </TouchableOpacity>
                        </View>

                        <View style={{ marginBottom: 16 }}>
                            <SearchBar
                                value={patientSearch}
                                onChangeText={setPatientSearch}
                                placeholder="Buscar por nombre..."
                            />
                        </View>

                        {loadingPets ? (
                            <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
                        ) : (
                            <FlatList
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
                                                {item.breed || item.species} · {item.id.substring(0, 8)}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                )}
                                ListEmptyComponent={
                                    <View style={{ padding: 40, alignItems: 'center' }}>
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
    content: { padding: 24, paddingBottom: 100 },
    prescCard: {
        padding: 16, borderRadius: 20, borderWidth: 1,
        marginBottom: 16
    },
    prescHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
    prescIcon: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    prescInfo: { flex: 1 },
    patientLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 2 },
    dateLabel: { fontSize: 14, fontWeight: '800' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
    statusText: { fontSize: 10, fontWeight: '900' },
    medsContainer: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 16 },
    medRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
    medDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981', marginTop: 6 },
    medName: { fontSize: 15, fontWeight: '800' },
    medDetails: { fontSize: 13, fontWeight: '600', marginTop: 2 },
    notesBox: { flexDirection: 'row', gap: 8, padding: 12, borderRadius: 12, marginTop: 4 },
    notesText: { flex: 1, fontSize: 12, fontWeight: '500', lineHeight: 18 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: 40, maxHeight: '85%' },
    modalTitle: { fontSize: 20, fontWeight: '900', marginBottom: 20 },
    inputLabel: { fontSize: 12, fontWeight: '700', marginBottom: 8, marginTop: 16 },
    input: { height: 50, borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, fontSize: 15, fontWeight: '500' },
    modalActions: { flexDirection: 'row', gap: 12, marginTop: 16 },
    cancelBtn: { flex: 1, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.05)' },
    cancelBtnText: { fontSize: 15, fontWeight: '700' },
    saveBtn: { flex: 1, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
    petPickerItem: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 10 },
    petPickerInfo: { flex: 1 },
    petPickerName: { fontSize: 16, fontWeight: '800', marginBottom: 2 },
    petPickerBreed: { fontSize: 13, fontWeight: '500' },
    headerAction: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    statusActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
    statusBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
    statusBtnText: { fontSize: 13, fontWeight: '800' },
});
