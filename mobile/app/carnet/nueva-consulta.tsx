import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useConsultationForm } from '@/src/hooks/carnet/useConsultationForm';
import { useTheme } from '@/src/hooks/useTheme';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { spacing, font } from '@/constants/design';
import Button from '@/src/components/Button';
import { Plus, Trash2, ClipboardList, Weight, Thermometer, ShoppingBag, Info, Activity } from 'lucide-react-native';

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
        isEditing,
    } = useConsultationForm();

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <ScreenContainer>
                <ScreenHeader
                    title={isEditing ? 'Editar Consulta' : 'Nueva Consulta'}
                />

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <ClipboardList size={18} color={theme.primary} />
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Motivo & Diagnóstico</Text>
                        </View>
                        <View style={[styles.inputGroup, { borderColor: theme.border }, { backgroundColor: theme.surface }]}>
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
                        <View style={[styles.inputGroup, { borderColor: theme.border }, { backgroundColor: theme.surface }]}>
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
                        <View style={[styles.inputGroup, { borderColor: theme.border }, { backgroundColor: theme.surface }]}>
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
                        <View style={[styles.inputGroup, { borderColor: theme.border }, { backgroundColor: theme.surface }]}>
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
                            <Activity size={18} color={theme.info} />
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Constantes Vitales</Text>
                        </View>
                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { borderColor: theme.border }, { flex: 1, backgroundColor: theme.surface }]}>
                                <View style={styles.labelRow}>
                                    <Weight size={14} color={theme.textMuted} />
                                    <Text style={[styles.label, { color: theme.textMuted }]}>PESO (KG)</Text>
                                </View>
                                <TextInput
                                    style={[styles.input, { color: theme.text }]}
                                    placeholder="0.0"
                                    placeholderTextColor={theme.textMuted}
                                    keyboardType="decimal-pad"
                                    value={weight}
                                    onChangeText={setWeight}
                                />
                            </View>
                            <View style={[styles.inputGroup, { borderColor: theme.border }, { flex: 1, backgroundColor: theme.surface }]}>
                                <View style={styles.labelRow}>
                                    <Thermometer size={14} color={theme.textMuted} />
                                    <Text style={[styles.label, { color: theme.textMuted }]}>TEMP (°C)</Text>
                                </View>
                                <TextInput
                                    style={[styles.input, { color: theme.text }]}
                                    placeholder="38.5"
                                    placeholderTextColor={theme.textMuted}
                                    keyboardType="decimal-pad"
                                    value={temp}
                                    onChangeText={setTemp}
                                />
                            </View>
                        </View>
                    </View>

                    {/* La receta se gestiona aparte: al editar solo cambian los datos de la consulta */}
                    {!isEditing && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <ShoppingBag size={18} color={theme.success} />
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Receta Digital</Text>
                        </View>

                        {prescriptions.map((p, index) => (
                            <View key={index} style={[styles.prescriptionCard, { borderColor: theme.border }, { backgroundColor: theme.surface }]}>
                                <View style={styles.pCardHeader}>
                                    <Text style={[styles.pNumber, { color: theme.primary }]}>Medicamento #{index + 1}</Text>
                                    <TouchableOpacity
                                        onPress={() => removePrescription(index)}
                                        accessibilityRole="button"
                                        accessibilityLabel={`Quitar medicamento ${index + 1}`}
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                    >
                                        <Trash2 size={16} color={theme.error} />
                                    </TouchableOpacity>
                                </View>

                                <TextInput
                                    style={[styles.pInput, { borderBottomColor: theme.border }, { color: theme.text, borderBottomColor: theme.background }]}
                                    placeholder="Nombre del medicamento"
                                    placeholderTextColor={theme.textMuted}
                                    value={p.medication_name}
                                    onChangeText={(v) => updatePrescription(index, 'medication_name', v)}
                                />

                                <View style={styles.row}>
                                    <View style={styles.pSubGroup}>
                                        <Text style={[styles.pLabel, { color: theme.textMuted }]}>DOSIS</Text>
                                        <TextInput
                                            style={[styles.pInput, { borderBottomColor: theme.border }, { color: theme.text }]}
                                            placeholder="1/2 tableta"
                                            placeholderTextColor={theme.textMuted}
                                            value={p.dosage}
                                            onChangeText={(v) => updatePrescription(index, 'dosage', v)}
                                        />
                                    </View>
                                    <View style={styles.pSubGroup}>
                                        <Text style={[styles.pLabel, { color: theme.textMuted }]}>CADA (HRS)</Text>
                                        <TextInput
                                            style={[styles.pInput, { borderBottomColor: theme.border }, { color: theme.text }]}
                                            placeholder="8"
                                            keyboardType="numeric"
                                            placeholderTextColor={theme.textMuted}
                                            value={p.frequency_hours.toString()}
                                            onChangeText={(v) => updatePrescription(index, 'frequency_hours', parseInt(v) || 0)}
                                        />
                                    </View>
                                    <View style={styles.pSubGroup}>
                                        <Text style={[styles.pLabel, { color: theme.textMuted }]}>DÍAS</Text>
                                        <TextInput
                                            style={[styles.pInput, { borderBottomColor: theme.border }, { color: theme.text }]}
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

                        <TouchableOpacity accessibilityRole="button"
                            style={[styles.addPresBtn, { borderColor: theme.primary }]}
                            onPress={addPrescription}
                        >
                            <Plus size={18} color={theme.primary} />
                            <Text style={[styles.addPresText, { color: theme.primary }]}>Agregar Medicamento</Text>
                        </TouchableOpacity>
                    </View>
                    )}

                    <View style={[styles.infoBox, { backgroundColor: theme.primary + '10' }]}>
                        <Info size={16} color={theme.primary} />
                        <Text style={[styles.infoText, { color: theme.text }]}>
                            La información registrada será visible para el dueño de la mascota desde su Carnet Digital.
                        </Text>
                    </View>
                    <Button label="Guardar consulta" onPress={handleSave} loading={isSaving} fullWidth style={styles.saveBtn} />
                </ScrollView>
            </ScreenContainer>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    saveBtn: { marginTop: spacing.xl },
    scrollContent: {
        padding: spacing.xxl,
        paddingBottom: spacing.huge,
    },
    section: {
        marginBottom: spacing.xxxl,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontSize: font.xl,
        fontWeight: '800',
    },
    inputGroup: {
        borderRadius: 16,
        padding: spacing.lg,
        marginBottom: spacing.md,
        borderWidth: 1,
    },
    label: {
        fontSize: font.xs,
        fontWeight: '800',
        marginBottom: spacing.sm,
        letterSpacing: 0.5,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    input: {
        fontSize: font.xl,
        fontWeight: '600',
        minHeight: 24,
    },
    row: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    prescriptionCard: {
        borderRadius: 20,
        padding: spacing.lg,
        marginBottom: spacing.md,
        borderWidth: 1,
    },
    pCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    pNumber: {
        fontSize: font.md,
        fontWeight: '800',
    },
    pInput: {
        fontSize: font.lg,
        fontWeight: '700',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        marginBottom: spacing.md,
    },
    pSubGroup: {
        flex: 1,
    },
    pLabel: {
        fontSize: font.xs,
        fontWeight: '800',
        marginBottom: spacing.xs,
    },
    addPresBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.lg,
        borderRadius: 16,
        borderWidth: 2,
        borderStyle: 'dashed',
        gap: spacing.md,
        marginTop: spacing.sm,
    },
    addPresText: {
        fontSize: font.base,
        fontWeight: '800',
    },
    infoBox: {
        flexDirection: 'row',
        gap: spacing.md,
        padding: spacing.lg,
        borderRadius: 16,
        marginTop: spacing.md,
    },
    infoText: {
        flex: 1,
        fontSize: font.md,
        lineHeight: 18,
        fontWeight: '500',
        opacity: 0.8,
    }
});
