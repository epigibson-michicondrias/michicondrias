import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Info, Plus, X, Save } from 'lucide-react-native';
import { useVaccineForm } from '@/src/hooks/carnet/useVaccineForm';
import { useTheme } from '@/src/hooks/useTheme';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import RoleGuard from '@/src/components/RoleGuard';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { DetailFooter } from '@/src/components/layout/DetailLayout';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import FormField from '@/src/components/FormField';
import FormSection from '@/src/components/forms/FormSection';
import Button from '@/src/components/Button';
import DatePicker from '@/src/components/DatePicker';
import { formatDate } from '@/src/utils/formatters';
import { layout, radius, spacing, tint, type } from '@/constants/design';

/** El carnet solo lo escribe el equipo clínico (el backend rechaza al dueño): ver ROUTE_ACCESS. */
export default function NuevaVacunaScreen() {
    return (
        <RoleGuard roles={['veterinario', 'hospital']} message="El carnet lo registra el veterinario o la clínica que atiende a tu mascota.">
            <VaccineFormContent />
        </RoleGuard>
    );
}

function VaccineFormContent() {
    const { theme } = useTheme();
    const v = useVaccineForm();

    return (
        <ScreenContainer>
            <ScreenHeader title={v.isEditing ? 'Editar vacuna' : 'Registrar vacuna'} />
            <KeyboardScreen
                contentContainerStyle={styles.content}
                footer={(
                    <DetailFooter>
                        <Button label="Guardar vacuna" icon={<Save size={layout.icon.sm} color={theme.onPrimary} />} onPress={v.handleSave} loading={v.isSaving} size="lg" style={styles.flex} />
                    </DetailFooter>
                )}
            >
                <FormSection title="Vacuna">
                    <FormField
                        label="Nombre *"
                        value={v.name}
                        onChangeText={v.setName}
                        placeholder="Ej. Quíntuple canina, rabia…"
                        returnKeyType="next"
                        error={v.nameError}
                    />
                    <FormField
                        label="Número de lote"
                        value={v.batch}
                        onChangeText={v.setBatch}
                        placeholder="Ej. BTX-90210"
                        autoCapitalize="characters"
                    />
                </FormSection>

                <FormSection title="Fechas">
                    {/* La fecha de aplicación es un dato clínico: al editar solo se consulta */}
                    {v.isEditing ? (
                        <FormField label="Aplicada el" value={formatDate(v.appliedOn.toISOString())} onChangeText={() => {}} editable={false} />
                    ) : (
                        <DatePicker value={v.appliedOn} onChange={v.setAppliedOn} mode="date" label="Aplicada el" maximumDate={v.today} />
                    )}
                    {v.nextDue ? (
                        <>
                            <DatePicker value={v.nextDue} onChange={v.setNextDue} mode="date" label="Próximo refuerzo" minimumDate={v.appliedOn} />
                            <Text style={[type.caption, { color: theme.textMuted }]}>Te avisaremos en tus notificaciones una semana antes.</Text>
                            <Button label="Sin refuerzo" variant="ghost" size="sm" icon={<X size={layout.icon.xs} color={theme.primary} />} onPress={v.clearNextDue} />
                        </>
                    ) : (
                        <Button label="Agregar próximo refuerzo" variant="secondary" icon={<Plus size={layout.icon.sm} color={theme.text} />} onPress={v.addNextDue} fullWidth />
                    )}
                </FormSection>

                <FormSection title="Notas">
                    <FormField label="Observaciones" value={v.notes} onChangeText={v.setNotes} placeholder="Reacciones, indicaciones…" multiline />
                </FormSection>

                <View style={[styles.note, { backgroundColor: theme.info + tint.faint }]}>
                    <Info size={layout.icon.sm} color={theme.info} />
                    <Text style={[type.caption, styles.flex, { color: theme.text }]}>
                        {v.isVet
                            ? 'Verifica la vigencia y el lote de la vacuna antes de registrarla.'
                            : 'Registra las vacunas que ya le aplicaron, con su fecha real, para tener su historial a la mano.'}
                    </Text>
                </View>
            </KeyboardScreen>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    content: { paddingHorizontal: layout.screenPadding, paddingTop: spacing.lg, paddingBottom: spacing.xl },
    note: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: radius.md },
});
