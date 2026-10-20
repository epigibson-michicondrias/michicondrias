import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Info, Send } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useClinicForm } from '@/src/hooks/directorio/useClinicForm';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { DetailFooter } from '@/src/components/layout/DetailLayout';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import FormField from '@/src/components/FormField';
import FormSection from '@/src/components/forms/FormSection';
import FormSwitch from '@/src/components/forms/FormSwitch';
import Button from '@/src/components/Button';
import RoleGuard from '@/src/components/RoleGuard';
import { layout, radius, spacing, tint, type } from '@/constants/design';

export default function NuevoRegistroProfesionalScreen() {
    const { theme } = useTheme();
    const { form, errors, updateField, handleSubmit, saving } = useClinicForm();

    return (
        <RoleGuard roles={['veterinario', 'hospital', 'admin']}>
            <ScreenContainer>
                <ScreenHeader title="Registrar en el directorio" subtitle="Tu consultorio o clínica, visible para los dueños" />
                <KeyboardScreen
                    contentContainerStyle={styles.content}
                    footer={(
                        <DetailFooter>
                            <Button label="Enviar a revisión" icon={<Send size={layout.icon.sm} color={theme.onPrimary} />} onPress={handleSubmit} loading={saving} size="lg" style={styles.flex} />
                        </DetailFooter>
                    )}
                >
                    <FormSection title="Datos">
                        <FormField label="Nombre *" value={form.name} onChangeText={(v) => updateField('name', v)} placeholder="Ej. Veterinaria San José" error={errors.name} />
                        <FormField label="Dirección" value={form.address} onChangeText={(v) => updateField('address', v)} placeholder="Calle, número y colonia" autoComplete="street-address" />
                        <View style={styles.row}>
                            <View style={styles.flex}>
                                <FormField label="Ciudad *" value={form.city} onChangeText={(v) => updateField('city', v)} placeholder="Ej. CDMX" error={errors.city} />
                            </View>
                            <View style={styles.flex}>
                                <FormField label="Teléfono *" value={form.phone} onChangeText={(v) => updateField('phone', v)} placeholder="10 dígitos" keyboardType="phone-pad" autoComplete="tel" error={errors.phone} />
                            </View>
                        </View>
                        <FormField label="Sitio web o Facebook" value={form.website} onChangeText={(v) => updateField('website', v)} placeholder="https://…" keyboardType="url" autoCapitalize="none" error={errors.website} />
                        <FormField label="Descripción" value={form.description} onChangeText={(v) => updateField('description', v)} placeholder="Especialidades y servicios" multiline />
                    </FormSection>
                    <FormSection title="Atención">
                        <FormSwitch variant="switch" label="Abierto 24 horas" description="Atención todo el día" value={form.is_24_hours} onChange={(v) => updateField('is_24_hours', v)} />
                        <FormSwitch variant="switch" label="Urgencias" description="Equipo listo para emergencias" value={form.has_emergency} onChange={(v) => updateField('has_emergency', v)} />
                    </FormSection>
                    <View style={[styles.note, { backgroundColor: theme.info + tint.faint }]}>
                        <Info size={layout.icon.sm} color={theme.info} />
                        <Text style={[type.caption, styles.flex, { color: theme.text }]}>
                            Michicondrias verifica tu cédula y el negocio antes de publicarlo.
                        </Text>
                    </View>
                </KeyboardScreen>
            </ScreenContainer>
        </RoleGuard>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    content: { paddingHorizontal: layout.screenPadding, paddingTop: spacing.lg, paddingBottom: spacing.xl },
    row: { flexDirection: 'row', gap: spacing.md },
    note: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: radius.md },
});
