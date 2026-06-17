import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { usePatientHistory } from '@/src/hooks/clinica/usePatientHistory';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { Plus, Trash2, Stethoscope, Pill, Save } from 'lucide-react-native';

export default function GenerarFichaMedicaScreen() {
    const { id, appointment_id } = useLocalSearchParams();
    const router = useRouter();
    const { theme } = useTheme();
    const {
        loading, reason, setReason, diagnosis, setDiagnosis,
        treatment, setTreatment, weight, setWeight, temp, setTemp,
        notes, setNotes, prescriptions, appointment,
        addPrescriptionRow, updatePrescription, removePrescription, handleSave,
    } = usePatientHistory(id as string, appointment_id as string | undefined);

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScreenContainer>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <ScreenHeader
                        title="Generar Ficha"
                        subtitle="Expediente Clínico Digital"
                    />

                    <View style={styles.content}>
                        {/* Visual Section Info */}
                        <View style={[styles.infoBanner, { backgroundColor: theme.primary + '10' }]}>
                            <Stethoscope size={24} color={theme.primary} />
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.bannerTitle, { color: theme.text }]}>Consulta Médica</Text>
                                <Text style={[styles.bannerSub, { color: theme.textMuted }]}>
                                    {appointment ? `Cita de: ${appointment.clinic_name}` : 'Documentación Directa'}
                                </Text>
                            </View>
                        </View>

                        {/* Section 1: Basic Info */}
                        <Text style={[styles.sectionLabel, { color: theme.text }]}>Información de la Visita</Text>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: theme.textMuted }]}>Motivo de Consulta *</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                value={reason}
                                onChangeText={setReason}
                                placeholder="Ej: Revisión Post-Operatoria"
                                placeholderTextColor={theme.textMuted}
                            />
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.formGroup, { flex: 1 }]}>
                                <Text style={[styles.label, { color: theme.textMuted }]}>Peso (kg)</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                    value={weight}
                                    onChangeText={setWeight}
                                    keyboardType="numeric"
                                    placeholder="0.0"
                                    placeholderTextColor={theme.textMuted}
                                />
                            </View>
                            <View style={[styles.formGroup, { flex: 1 }]}>
                                <Text style={[styles.label, { color: theme.textMuted }]}>Temp (°C)</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                    value={temp}
                                    onChangeText={setTemp}
                                    keyboardType="numeric"
                                    placeholder="38.5"
                                    placeholderTextColor={theme.textMuted}
                                />
                            </View>
                        </View>

                        {/* Section 2: Medical Details */}
                        <Text style={[styles.sectionLabel, { color: theme.text }]}>Evaluación Clínica</Text>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: theme.textMuted }]}>Diagnóstico *</Text>
                            <TextInput
                                style={[styles.input, styles.textArea, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                value={diagnosis}
                                onChangeText={setDiagnosis}
                                multiline
                                placeholder="Describe el diagnóstico médico..."
                                placeholderTextColor={theme.textMuted}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: theme.textMuted }]}>Tratamiento Sugerido</Text>
                            <TextInput
                                style={[styles.input, styles.textArea, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                value={treatment}
                                onChangeText={setTreatment}
                                multiline
                                placeholder="Indica el tratamiento a seguir..."
                                placeholderTextColor={theme.textMuted}
                            />
                        </View>

                        {/* Section 3: Prescriptions */}
                        <View style={styles.sectionHeaderRow}>
                            <Text style={[styles.sectionLabel, { color: theme.text }]}>Receta Médica</Text>
                            <TouchableOpacity style={[styles.addPrescBtn, { backgroundColor: theme.primary + '15' }]} onPress={addPrescriptionRow}>
                                <Plus size={16} color={theme.primary} />
                                <Text style={{ color: theme.primary, fontWeight: '700' }}>Añadir Medicamento</Text>
                            </TouchableOpacity>
                        </View>

                        {prescriptions.map((p, idx) => (
                            <View key={idx} style={[styles.prescCard, { backgroundColor: theme.surface }]}>
                                <View style={styles.prescHeader}>
                                    <Pill size={18} color={theme.primary} />
                                    <Text style={[styles.prescTitle, { color: theme.text }]}>Medicamento #{idx + 1}</Text>
                                    <TouchableOpacity onPress={() => removePrescription(idx)}>
                                        <Trash2 size={18} color="#ef4444" />
                                    </TouchableOpacity>
                                </View>

                                <TextInput
                                    style={[styles.pInput, { color: theme.text, borderBottomColor: theme.border }]}
                                    placeholder="Nombre del fármaco"
                                    placeholderTextColor={theme.textMuted}
                                    value={p.medication_name}
                                    onChangeText={(v) => updatePrescription(idx, 'medication_name', v)}
                                />

                                <TextInput
                                    style={[styles.pInput, { color: theme.text, borderBottomColor: theme.border }]}
                                    placeholder="Dosis (Ej: 1 tableta, 5ml)"
                                    placeholderTextColor={theme.textMuted}
                                    value={p.dosage}
                                    onChangeText={(v) => updatePrescription(idx, 'dosage', v)}
                                />

                                <View style={styles.row}>
                                    <TextInput
                                        style={[styles.pInput, { flex: 1, color: theme.text, borderBottomColor: theme.border }]}
                                        placeholder="Cada (hrs)"
                                        placeholderTextColor={theme.textMuted}
                                        keyboardType="numeric"
                                        value={p.frequency_hours.toString()}
                                        onChangeText={(v) => updatePrescription(idx, 'frequency_hours', v)}
                                    />
                                    <TextInput
                                        style={[styles.pInput, { flex: 1, color: theme.text, borderBottomColor: theme.border }]}
                                        placeholder="Días"
                                        placeholderTextColor={theme.textMuted}
                                        keyboardType="numeric"
                                        value={p.duration_days.toString()}
                                        onChangeText={(v) => updatePrescription(idx, 'duration_days', v)}
                                    />
                                </View>

                                <TextInput
                                    style={[styles.pInput, { color: theme.text, borderBottomColor: theme.border }]}
                                    placeholder="Instrucciones adicionales"
                                    placeholderTextColor={theme.textMuted}
                                    value={p.instructions}
                                    onChangeText={(v) => updatePrescription(idx, 'instructions', v)}
                                />
                            </View>
                        ))}

                        {prescriptions.length === 0 && (
                            <View style={[styles.emptyPresc, { borderColor: theme.border }]}>
                                <Text style={{ color: theme.textMuted, fontWeight: '600' }}>No se han recetado medicamentos.</Text>
                            </View>
                        )}

                        <TouchableOpacity
                            style={[styles.saveBtn, { backgroundColor: theme.primary }]}
                            onPress={handleSave}
                            disabled={loading}
                        >
                            {loading ? <ActivityIndicator color="#fff" /> : (
                                <>
                                    <Save size={20} color="#fff" />
                                    <Text style={styles.saveBtnText}>Guardar Expediente</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </ScreenContainer>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    content: { paddingHorizontal: 24, paddingBottom: 100 },
    infoBanner: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 24, gap: 16, marginBottom: 32 },
    bannerTitle: { fontSize: 16, fontWeight: '800' },
    bannerSub: { fontSize: 12, fontWeight: '600' },
    sectionLabel: { fontSize: 18, fontWeight: '900', marginBottom: 20 },
    formGroup: { marginBottom: 20 },
    label: { fontSize: 13, fontWeight: '700', marginBottom: 10 },
    input: { height: 56, borderRadius: 16, paddingHorizontal: 20, borderWidth: 1, fontSize: 15, fontWeight: '600' },
    textArea: { height: 120, paddingVertical: 20, textAlignVertical: 'top' },
    row: { flexDirection: 'row', gap: 16 },
    sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 12 },
    addPrescBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
    prescCard: { padding: 20, borderRadius: 24, marginBottom: 16, gap: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    prescHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
    prescTitle: { fontSize: 14, fontWeight: '800', flex: 1 },
    pInput: { height: 44, borderBottomWidth: 1, fontSize: 14, fontWeight: '600' },
    emptyPresc: { padding: 30, borderRadius: 20, borderStyle: 'dashed', borderWidth: 1, alignItems: 'center', marginBottom: 24 },
    saveBtn: { height: 64, borderRadius: 24, flexDirection: 'row', gap: 12, justifyContent: 'center', alignItems: 'center', marginTop: 20, shadowColor: '#7c3aed', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 12 },
    saveBtnText: { color: '#fff', fontSize: 17, fontWeight: '900' },
});
