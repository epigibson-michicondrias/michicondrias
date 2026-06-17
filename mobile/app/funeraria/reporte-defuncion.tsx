import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useDeathReport } from '@/src/hooks/funerary/useDeathReport';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import { FileText, Calendar, Info, AlertTriangle } from 'lucide-react-native';

const CREMATION_TYPES = ['individual', 'colectiva', 'doméstica'];

export default function ReporteDefuncionScreen() {
    const { theme } = useTheme();
    const { form, updateForm, handleSubmitReport, isSubmitting } = useDeathReport();

    return (
        <ScreenContainer>
            <ScreenHeader
                title="📋 Reporte de Defunción"
                subtitle="Registra el fallecimiento de una mascota"
            />

            <KeyboardScreen contentContainerStyle={styles.scrollContent}>
                <View style={styles.content}>
                    {/* Warning banner */}
                    <View style={[styles.warningBox, { backgroundColor: '#ef444410' }]}>
                        <AlertTriangle size={18} color="#ef4444" />
                        <Text style={[styles.warningText, { color: '#ef4444' }]}>
                            Este registro es oficial. Verifica los datos antes de enviar.
                        </Text>
                    </View>

                    {/* Pet ID */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>ID de Mascota *</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                            placeholder="Ingresa el ID de la mascota"
                            placeholderTextColor={theme.textMuted}
                            value={form.pet_id}
                            onChangeText={(val) => updateForm('pet_id', val)}
                        />
                    </View>

                    {/* Date of death */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>Fecha de Defunción *</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor={theme.textMuted}
                            value={form.date_of_death}
                            onChangeText={(val) => updateForm('date_of_death', val)}
                        />
                    </View>

                    {/* Cause of death */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>Causa de Defunción</Text>
                        <TextInput
                            style={[styles.textArea, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                            placeholder="Describe la causa..."
                            placeholderTextColor={theme.textMuted}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                            value={form.cause_of_death}
                            onChangeText={(val) => updateForm('cause_of_death', val)}
                        />
                    </View>

                    {/* Cremation type */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>Tipo de Cremación</Text>
                        <View style={styles.typeRow}>
                            {CREMATION_TYPES.map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    style={[
                                        styles.typeBtn,
                                        { backgroundColor: theme.surface, borderColor: theme.border },
                                        form.cremation_type === type && { backgroundColor: theme.primary, borderColor: theme.primary },
                                    ]}
                                    onPress={() => updateForm('cremation_type', type)}
                                >
                                    <Text
                                        style={[
                                            styles.typeText,
                                            { color: form.cremation_type === type ? '#fff' : theme.text },
                                        ]}
                                    >
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Urn model */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>Modelo de Urna</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                            placeholder="Ej. Urna de madera natural"
                            placeholderTextColor={theme.textMuted}
                            value={form.urn_model}
                            onChangeText={(val) => updateForm('urn_model', val)}
                        />
                    </View>

                    {/* Notes */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>Notas Adicionales</Text>
                        <TextInput
                            style={[styles.textArea, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                            placeholder="Información del veterinario, observaciones..."
                            placeholderTextColor={theme.textMuted}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                            value={form.notes}
                            onChangeText={(val) => updateForm('notes', val)}
                        />
                    </View>

                    {/* Info box */}
                    <View style={[styles.infoBox, { backgroundColor: theme.secondary + '10' }]}>
                        <Info size={18} color={theme.secondary} />
                        <Text style={[styles.infoText, { color: theme.textMuted }]}>
                            Al registrar el reporte, se generará un certificado de defunción que podrás descargar.
                        </Text>
                    </View>

                    {/* Submit */}
                    <TouchableOpacity
                        style={[styles.submitBtn, { backgroundColor: theme.secondary }, isSubmitting && { opacity: 0.7 }]}
                        disabled={isSubmitting}
                        onPress={handleSubmitReport}
                    >
                        <FileText size={20} color="#fff" />
                        <Text style={styles.submitBtnText}>
                            {isSubmitting ? 'Registrando...' : 'Registrar Reporte'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardScreen>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        padding: 24,
        gap: 20,
    },
    warningBox: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        gap: 12,
        alignItems: 'center',
    },
    warningText: {
        flex: 1,
        fontSize: 13,
        fontWeight: '600',
        lineHeight: 18,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        marginLeft: 4,
    },
    input: {
        height: 56,
        borderRadius: 16,
        paddingHorizontal: 16,
        fontSize: 16,
        borderWidth: 1,
    },
    textArea: {
        height: 100,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 16,
        textAlignVertical: 'top',
        borderWidth: 1,
    },
    typeRow: {
        flexDirection: 'row',
        gap: 8,
    },
    typeBtn: {
        flex: 1,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    typeText: {
        fontSize: 13,
        fontWeight: '700',
    },
    infoBox: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        gap: 12,
        alignItems: 'center',
    },
    infoText: {
        flex: 1,
        fontSize: 12,
        lineHeight: 18,
    },
    submitBtn: {
        height: 64,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 10,
        marginTop: 10,
        marginBottom: 40,
    },
    submitBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
    },
});
