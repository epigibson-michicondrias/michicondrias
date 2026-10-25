import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Plus, Trash2, Info, Save } from 'lucide-react-native';
import { useConsultationForm } from '@/src/hooks/carnet/useConsultationForm';
import { useTheme } from '@/src/hooks/useTheme';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import RoleGuard from '@/src/components/RoleGuard';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { DetailFooter } from '@/src/components/layout/DetailLayout';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import FormField from '@/src/components/FormField';
import FormSection from '@/src/components/forms/FormSection';
import IconButton from '@/src/components/IconButton';
import Button from '@/src/components/Button';
import Card from '@/src/components/Card';
import { layout, radius, spacing, tint, type } from '@/constants/design';

/** El carnet solo lo escribe el equipo clínico (el backend rechaza al dueño): ver ROUTE_ACCESS. */
export default function NuevaConsultaScreen() {
    return (
        <RoleGuard roles={['veterinario', 'hospital']} message="El carnet lo registra el veterinario o la clínica que atiende a tu mascota.">
            <ConsultationFormContent />
        </RoleGuard>
    );
}

function ConsultationFormContent() {
    const { theme } = useTheme();
    const f = useConsultationForm();

    return (
        <ScreenContainer>
            <ScreenHeader title={f.isEditing ? 'Editar consulta' : 'Nueva consulta'} subtitle="El dueño la ve en el carnet de su mascota" />
            <KeyboardScreen
                contentContainerStyle={styles.content}
                footer={(
                    <DetailFooter>
                        <Button label="Guardar consulta" icon={<Save size={layout.icon.sm} color={theme.onPrimary} />} onPress={f.handleSave} loading={f.isSaving} size="lg" style={styles.flex} />
                    </DetailFooter>
                )}
            >
                <FormSection title="Motivo y diagnóstico">
                    <FormField label="Motivo de la visita *" value={f.reason} onChangeText={f.setReason} placeholder="Ej. Chequeo general, vómitos…" multiline error={f.errors.reason} />
                    <FormField label="Diagnóstico" value={f.diagnosis} onChangeText={f.setDiagnosis} placeholder="Estado clínico observado" multiline />
                    <FormField label="Tratamiento" value={f.treatment} onChangeText={f.setTreatment} placeholder="Procedimientos o indicaciones" multiline />
                    <FormField label="Notas" value={f.notes} onChangeText={f.setNotes} placeholder="Observaciones adicionales" multiline />
                </FormSection>

                <FormSection title="Signos vitales">
                    <View style={styles.row}>
                        <View style={styles.flex}>
                            <FormField label="Peso (kg)" value={f.weight} onChangeText={f.setWeight} placeholder="0.0" keyboardType="decimal-pad" error={f.errors.weight} />
                        </View>
                        <View style={styles.flex}>
                            <FormField label="Temperatura (°C)" value={f.temp} onChangeText={f.setTemp} placeholder="38.5" keyboardType="decimal-pad" error={f.errors.temp} />
                        </View>
                    </View>
                </FormSection>

                {/* La receta se gestiona aparte: al editar solo cambian los datos de la consulta */}
                {!f.isEditing ? (
                    <FormSection title="Receta">
                        {f.prescriptions.map((p, index) => (
                            <Card key={index}>
                                <View style={styles.rx}>
                                    <View style={styles.rxHead}>
                                        <Text style={[type.bodyStrong, styles.flex, { color: theme.text }]}>Medicamento {index + 1}</Text>
                                        <IconButton icon={Trash2} accessibilityLabel={`Quitar medicamento ${index + 1}`} onPress={() => f.removePrescription(index)} color={theme.error} size="sm" />
                                    </View>
                                    <FormField label="Nombre" value={p.medication_name} onChangeText={(v) => f.updatePrescription(index, 'medication_name', v)} placeholder="Ej. Amoxicilina 250 mg" />
                                    <FormField label="Dosis" value={p.dosage} onChangeText={(v) => f.updatePrescription(index, 'dosage', v)} placeholder="Ej. ½ tableta" />
                                    <View style={styles.row}>
                                        <View style={styles.flex}>
                                            <FormField
                                                label="Cada (horas)"
                                                value={p.frequency_hours ? String(p.frequency_hours) : ''}
                                                onChangeText={(v) => f.updatePrescription(index, 'frequency_hours', parseInt(v, 10) || 0)}
                                                placeholder="8"
                                                keyboardType="number-pad"
                                                maxLength={3}
                                            />
                                        </View>
                                        <View style={styles.flex}>
                                            <FormField
                                                label="Durante (días)"
                                                value={p.duration_days ? String(p.duration_days) : ''}
                                                onChangeText={(v) => f.updatePrescription(index, 'duration_days', parseInt(v, 10) || 0)}
                                                placeholder="7"
                                                keyboardType="number-pad"
                                                maxLength={3}
                                            />
                                        </View>
                                    </View>
                                </View>
                            </Card>
                        ))}
                        <Button label="Agregar medicamento" variant="secondary" icon={<Plus size={layout.icon.sm} color={theme.text} />} onPress={f.addPrescription} fullWidth />
                    </FormSection>
                ) : null}

                <View style={[styles.note, { backgroundColor: theme.primary + tint.faint }]}>
                    <Info size={layout.icon.sm} color={theme.primary} />
                    <Text style={[type.caption, styles.flex, { color: theme.text }]}>
                        Los medicamentos de la receta generan recordatorios para el dueño en la pestaña Salud.
                    </Text>
                </View>
            </KeyboardScreen>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    content: { paddingHorizontal: layout.screenPadding, paddingTop: spacing.lg, paddingBottom: spacing.xl },
    row: { flexDirection: 'row', gap: spacing.md },
    rx: { gap: spacing.md },
    rxHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    note: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: radius.md },
});
