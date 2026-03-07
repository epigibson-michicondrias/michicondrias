import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getClinicAppointments, AppointmentItem } from '@/src/services/directorio';
import { createRecord, MedicalRecordCreate } from '@/src/services/carnet';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ChevronLeft, Plus, Trash2, ClipboardList, Stethoscope, Pill, AlertCircle, Save } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function GenerarFichaMedicaScreen() {
    const { id, appointment_id } = useLocalSearchParams();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const [loading, setLoading] = useState(false);
    const [reason, setReason] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [treatment, setTreatment] = useState('');
    const [weight, setWeight] = useState('');
    const [temp, setTemp] = useState('');
    const [notes, setNotes] = useState('');
    const [prescriptions, setPrescriptions] = useState<any[]>([]);

    const { data: appointments = [] } = useQuery<AppointmentItem[]>({
        queryKey: ['clinic-appointments'],
        enabled: !!appointment_id,
    });

    const appointment = (appointments as AppointmentItem[]).find((a: AppointmentItem) => a.id === appointment_id);

    useEffect(() => {
        if (appointment) {
            setReason(appointment.service_name || '');
        }
    }, [appointment]);

    const addPrescriptionRow = () => {
        setPrescriptions([...prescriptions, {
            medication_name: '',
            dosage: '',
            frequency_hours: 8,
            duration_days: 7,
            instructions: ''
        }]);
    };

    const updatePrescription = (index: number, field: string, value: any) => {
        const newP = [...prescriptions];
        newP[index] = { ...newP[index], [field]: value };
        setPrescriptions(newP);
    };

    const removePrescription = (index: number) => {
        setPrescriptions(prescriptions.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (!reason || !diagnosis) {
            Alert.alert("Error", "El motivo y el diagnóstico son obligatorios");
            return;
        }

        setLoading(true);
        try {
            const payload: MedicalRecordCreate = {
                pet_id: appointment?.pet_id || (id as string),
                reason_for_visit: reason,
                diagnosis,
                treatment,
                weight_kg: weight ? parseFloat(weight) : undefined,
                temperature_c: temp ? parseFloat(temp) : undefined,
                notes,
                appointment_id: (appointment_id as string) || undefined,
                prescriptions: prescriptions.map(p => ({
                    ...p,
                    frequency_hours: parseInt(p.frequency_hours),
                    duration_days: parseInt(p.duration_days)
                }))
            };

            await createRecord(payload);

            Alert.alert("Éxito", "Ficha médica generada correctamente", [
                { text: "OK", onPress: () => router.push('/mi-clinica/agenda' as any) }
            ]);
        } catch (e) {
            Alert.alert("Error", "No se pudo guardar la ficha médica");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <ChevronLeft size={24} color={theme.text} />
                    </TouchableOpacity>
                    <View style={styles.titleBox}>
                        <Text style={[styles.headerTitle, { color: theme.text }]}>Generar Ficha</Text>
                        <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>Expediente Clínico Digital</Text>
                    </View>
                </View>

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
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: 24, paddingBottom: 24, gap: 16 },
    backBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.03)', justifyContent: 'center', alignItems: 'center' },
    titleBox: { flex: 1 },
    headerTitle: { fontSize: 22, fontWeight: '900' },
    headerSubtitle: { fontSize: 13, fontWeight: '600', marginTop: 2 },
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
    saveBtnText: { color: '#fff', fontSize: 17, fontWeight: '900' }
});
