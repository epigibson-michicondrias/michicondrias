import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useConsultationForm } from '@/src/hooks/carnet/useConsultationForm';
import { useTheme } from '@/src/hooks/useTheme';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { Save, Plus, Trash2, ClipboardList, Weight, Thermometer, ShoppingBag, Info, Activity } from 'lucide-react-native';

export default function NuevaConsultaScreen() {
    const { theme } = useTheme();
    const {
        reason, setReason,
        diagnosis, setDiagnosis,
        treatment, setTreatment,
        notes, setNotes,
        weight, setWeight,
        temp, setTemp,
        prescriptions,
        addPrescription,
        updatePrescription,
        removePrescription,
        handleSave,
        isSaving,
    } = useConsultationForm();

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <ScreenContainer>
                <ScreenHeader
                    title="Nueva Consulta"
                    rightElement={
                        <TouchableOpacity
                            style={[styles.saveBtn, { backgroundColor: theme.primary }]}
                            onPress={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? <ActivityIndicator color="#fff" size="small" /> : <Save size={20} color="#fff" />}
                        </TouchableOpacity>
                    }
                />

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <ClipboardList size={18} color={theme.primary} />
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Motivo & Diagnóstico</Text>
                        </View>
                        <View style={[styles.inputGroup, { backgroundColor: theme.surface }]}>
                            <Text style={[styles.label, { color: theme.textMuted }]}>MOTIVO DE LA VISITA *</Text>
                            <TextInput
                                style={[styles.input, { color: theme.text }]}
                                placeholder="Ej. Chequeo general, Vómitos..."
                                placeholderTextColor={theme.textMuted}
                                value={reason}
                                onChangeText={setReason}
                                multiline
                            />
                        </View>
                        <View style={[styles.inputGroup, { backgroundColor: theme.surface }]}>
                            <Text style={[styles.label, { color: theme.textMuted }]}>DIAGNÓSTICO</Text>
                            <TextInput
                                style={[styles.input, { color: theme.text }]}
                                placeholder="Descripción clínica del estado..."
                                placeholderTextColor={theme.textMuted}
                                value={diagnosis}
                                onChangeText={setDiagnosis}
                                multiline
                            />
                        </View>
                        <View style={[styles.inputGroup, { backgroundColor: theme.surface }]}>
                            <Text style={[styles.label, { color: theme.textMuted }]}>TRATAMIENTO INDICADO</Text>
                            <TextInput
                                style={[styles.input, { color: theme.text }]}
                                placeholder="Acciones o procedimientos realizados..."
                                placeholderTextColor={theme.textMuted}
                                value={treatment}
                                onChangeText={setTreatment}
                                multiline
                            />
                        </View>
                        <View style={[styles.inputGroup, { backgroundColor: theme.surface }]}>
                            <Text style={[styles.label, { color: theme.textMuted }]}>NOTAS ADICIONALES</Text>
                            <TextInput
                                style={[styles.input, { color: theme.text }]}
                                placeholder="Observaciones internas..."
                                placeholderTextColor={theme.textMuted}
                                value={notes}
                                onChangeText={setNotes}
                                multiline
                            />
                        </View>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Activity size={18} color="#0891b2" />
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Constantes Vitales</Text>
                        </View>
                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1, backgroundColor: theme.surface }]}>
                                <View style={styles.labelRow}>
                                    <Weight size={14} color={theme.textMuted} />
                                    <Text style={[styles.label, { color: theme.textMuted }]}>PESO (KG)</Text>
                                </View>
                                <TextInput
                                    style={[styles.input, { color: theme.text }]}
                                    placeholder="0.0"
                                    placeholderTextColor={theme.textMuted}
                                    keyboardType="numeric"
                                    value={weight}
                                    onChangeText={setWeight}
                                />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1, backgroundColor: theme.surface }]}>
                                <View style={styles.labelRow}>
                                    <Thermometer size={14} color={theme.textMuted} />
                                    <Text style={[styles.label, { color: theme.textMuted }]}>TEMP (°C)</Text>
                                </View>
                                <TextInput
                                    style={[styles.input, { color: theme.text }]}
                                    placeholder="38.5"
                                    placeholderTextColor={theme.textMuted}
                                    keyboardType="numeric"
                                    value={temp}
                                    onChangeText={setTemp}
                                />
                            </View>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <ShoppingBag size={18} color="#10b981" />
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Receta Digital</Text>
                        </View>

                        {prescriptions.map((p, index) => (
                            <View key={index} style={[styles.prescriptionCard, { backgroundColor: theme.surface }]}>
                                <View style={styles.pCardHeader}>
                                    <Text style={[styles.pNumber, { color: theme.primary }]}>Medicamento #{index + 1}</Text>
                                    <TouchableOpacity onPress={() => removePrescription(index)}>
                                        <Trash2 size={16} color="#ef4444" />
                                    </TouchableOpacity>
                                </View>

                                <TextInput
                                    style={[styles.pInput, { color: theme.text, borderBottomColor: theme.background }]}
                                    placeholder="Nombre del medicamento"
                                    placeholderTextColor={theme.textMuted}
                                    value={p.medication_name}
                                    onChangeText={(v) => updatePrescription(index, 'medication_name', v)}
                                />

                                <View style={styles.row}>
                                    <View style={styles.pSubGroup}>
                                        <Text style={styles.pLabel}>DOSIS</Text>
                                        <TextInput
                                            style={[styles.pInput, { color: theme.text }]}
                                            placeholder="1/2 tableta"
                                            placeholderTextColor={theme.textMuted}
                                            value={p.dosage}
                                            onChangeText={(v) => updatePrescription(index, 'dosage', v)}
                                        />
                                    </View>
                                    <View style={styles.pSubGroup}>
                                        <Text style={styles.pLabel}>CADA (HRS)</Text>
                                        <TextInput
                                            style={[styles.pInput, { color: theme.text }]}
                                            placeholder="8"
                                            keyboardType="numeric"
                                            placeholderTextColor={theme.textMuted}
                                            value={p.frequency_hours.toString()}
                                            onChangeText={(v) => updatePrescription(index, 'frequency_hours', parseInt(v) || 0)}
                                        />
                                    </View>
                                    <View style={styles.pSubGroup}>
                                        <Text style={styles.pLabel}>DÍAS</Text>
                                        <TextInput
                                            style={[styles.pInput, { color: theme.text }]}
                                            placeholder="7"
                                            keyboardType="numeric"
                                            placeholderTextColor={theme.textMuted}
                                            value={p.duration_days.toString()}
                                            onChangeText={(v) => updatePrescription(index, 'duration_days', parseInt(v) || 0)}
                                        />
                                    </View>
                                </View>
                            </View>
                        ))}

                        <TouchableOpacity
                            style={[styles.addPresBtn, { borderColor: theme.primary }]}
                            onPress={addPrescription}
                        >
                            <Plus size={18} color={theme.primary} />
                            <Text style={[styles.addPresText, { color: theme.primary }]}>Agregar Medicamento</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.infoBox, { backgroundColor: theme.primary + '10' }]}>
                        <Info size={16} color={theme.primary} />
                        <Text style={[styles.infoText, { color: theme.text }]}>
                            La información registrada será visible para el dueño de la mascota desde su Carnet Digital.
                        </Text>
                    </View>
                </ScrollView>
            </ScreenContainer>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    saveBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 40,
    },
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
    },
    inputGroup: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    label: {
        fontSize: 10,
        fontWeight: '800',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    input: {
        fontSize: 16,
        fontWeight: '600',
        minHeight: 24,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    prescriptionCard: {
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    pCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    pNumber: {
        fontSize: 12,
        fontWeight: '900',
    },
    pInput: {
        fontSize: 15,
        fontWeight: '700',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.03)',
        marginBottom: 12,
    },
    pSubGroup: {
        flex: 1,
    },
    pLabel: {
        fontSize: 9,
        fontWeight: '800',
        color: 'rgba(255,255,255,0.3)',
        marginBottom: 4,
    },
    addPresBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 2,
        borderStyle: 'dashed',
        gap: 10,
        marginTop: 8,
    },
    addPresText: {
        fontSize: 14,
        fontWeight: '800',
    },
    infoBox: {
        flexDirection: 'row',
        gap: 12,
        padding: 16,
        borderRadius: 16,
        marginTop: 10,
    },
    infoText: {
        flex: 1,
        fontSize: 12,
        lineHeight: 18,
        fontWeight: '500',
        opacity: 0.8,
    }
});
