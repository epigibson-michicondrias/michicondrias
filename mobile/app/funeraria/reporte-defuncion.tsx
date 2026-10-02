import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useDeathReport } from '@/src/hooks/funerary/useDeathReport';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import DatePicker from '@/src/components/DatePicker';
import PetPicker from '@/src/features/salud/PetPicker';
import { toISODate } from '@/src/features/salud/format';
import { CREMATION_OPTIONS } from '@/src/services/funerary';
import { useAuth } from '@/src/contexts/AuthContext';
import { useFuneraryProvider } from '@/src/hooks/funerary/useFuneraryProvider';
import { FileText, Info, AlertTriangle, PawPrint } from 'lucide-react-native';

export default function ReporteDefuncionScreen() {
    const { theme } = useTheme();
    const { form, updateForm, handleSubmitReport, isSubmitting } = useDeathReport();
    const { user } = useAuth();
    const isFuneralHome = user?.role_name === 'funeraria';
    // La funeraria solo puede reportar mascotas con una reserva suya vigente (lo exige el backend)
    const { providerBookings } = useFuneraryProvider();
    const reportable = providerBookings.filter((b, i, arr) => b.status !== 'cancelled' && arr.findIndex((x) => x.pet_id === b.pet_id) === i);

    return (
        <ScreenContainer>
            <ScreenHeader
                title="📋 Reporte de Defunción"
                subtitle="Registra el fallecimiento de una mascota"
            />

            <KeyboardScreen contentContainerStyle={styles.scrollContent}>
                <View style={styles.content}>
                    {/* Warning banner */}
                    <View style={[styles.warningBox, { backgroundColor: theme.errorLight }]}>
                        <AlertTriangle size={18} color={theme.error} />
                        <Text style={[styles.warningText, { color: theme.error }]}>
                            Este registro es oficial. Verifica los datos antes de enviar.
                        </Text>
                    </View>

                    {/* Mascota */}
                    <View style={styles.inputGroup}>
                        {isFuneralHome ? (
                            <View>
                                <Text style={[styles.label, { color: theme.text }]}>Mascota con reserva *</Text>
                                {reportable.length === 0 ? (
                                    <Text style={{ color: theme.textMuted, fontSize: 14 }}>
                                        No tienes reservas vigentes. Solo puedes reportar mascotas con una reserva de tu funeraria.
                                    </Text>
                                ) : (
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                        {reportable.map((b) => {
                                            const selected = form.pet_id === b.pet_id;
                                            return (
                                                <TouchableOpacity
                                                    key={b.pet_id}
                                                    accessibilityRole="button"
                                                    accessibilityState={{ selected }}
                                                    onPress={() => updateForm('pet_id', b.pet_id)}
                                                    style={{
                                                        flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 14,
                                                        borderRadius: 999, borderWidth: 1,
                                                        backgroundColor: selected ? theme.primary : theme.surface,
                                                        borderColor: selected ? theme.primary : theme.border,
                                                    }}
                                                >
                                                    <PawPrint size={14} color={selected ? '#fff' : theme.textMuted} />
                                                    <Text style={{ color: selected ? '#fff' : theme.text, fontWeight: '700', fontSize: 14 }}>
                                                        {b.pet_name || `Mascota ${b.pet_id.slice(0, 6)}`}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                )}
                            </View>
                        ) : (
                            <PetPicker value={form.pet_id} onChange={(id) => updateForm('pet_id', id)} />
                        )}
                    </View>

                    {/* Fecha de defunción */}
                    <View style={styles.inputGroup}>
                        <DatePicker
                            label="Fecha de Defunción *"
                            value={form.date_of_death ? new Date(form.date_of_death + 'T12:00:00') : new Date()}
                            maximumDate={new Date()}
                            onChange={(d) => updateForm('date_of_death', toISODate(d))}
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
                            {CREMATION_OPTIONS.map((opt) => (
                                <TouchableOpacity
                                    key={opt.value}
                                    style={[
                                        styles.typeBtn,
                                        { backgroundColor: theme.surface, borderColor: theme.border },
                                        form.cremation_type === opt.value && { backgroundColor: theme.primary, borderColor: theme.primary },
                                    ]}
                                    onPress={() => updateForm('cremation_type', opt.value)}
                                >
                                    <Text
                                        style={[
                                            styles.typeText,
                                            { color: form.cremation_type === opt.value ? '#fff' : theme.text },
                                        ]}
                                    >
                                        {opt.label}
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
