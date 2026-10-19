import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Scissors, Info } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useGroomingForm } from '@/src/hooks/grooming/useGroomingForm';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { DetailFooter } from '@/src/components/layout/DetailLayout';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import FormField from '@/src/components/FormField';
import FormSection from '@/src/components/forms/FormSection';
import Button from '@/src/components/Button';
import RoleGuard from '@/src/components/RoleGuard';
import { layout, radius, spacing, tint, type } from '@/constants/design';

export default function NuevoEstilistaScreen() {
    const { theme } = useTheme();
    const { form, errors, loading, updateField, handleSubmit } = useGroomingForm();

    return (
        <RoleGuard roles={['estilista']}>
            <ScreenContainer>
                <ScreenHeader title="Nuevo servicio" subtitle="Los clientes lo verán en el catálogo de estética" />
                <KeyboardScreen
                    contentContainerStyle={styles.content}
                    footer={(
                        <DetailFooter>
                            <Button label="Publicar servicio" icon={<Scissors size={layout.icon.sm} color={theme.onPrimary} />} onPress={handleSubmit} loading={loading} size="lg" style={styles.flex} />
                        </DetailFooter>
                    )}
                >
                    <FormSection title="Servicio">
                        <FormField label="Nombre *" value={form.name} onChangeText={(v) => updateField('name', v)} placeholder="Ej. Baño y corte higiénico" maxLength={80} error={errors.name} />
                        <FormField label="Descripción" value={form.description} onChangeText={(v) => updateField('description', v)} placeholder="Qué incluye, productos que usas…" multiline />
                    </FormSection>
                    <FormSection title="Precio y duración">
                        <View style={styles.row}>
                            <View style={styles.flex}>
                                <FormField label="Precio (MXN) *" value={form.price} onChangeText={(v) => updateField('price', v)} placeholder="0.00" keyboardType="decimal-pad" error={errors.price} />
                            </View>
                            <View style={styles.flex}>
                                <FormField label="Duración (min) *" value={form.duration_minutes} onChangeText={(v) => updateField('duration_minutes', v.replace(/\D/g, ''))} placeholder="30" keyboardType="number-pad" maxLength={3} error={errors.duration_minutes} />
                            </View>
                        </View>
                    </FormSection>
                    <View style={[styles.note, { backgroundColor: theme.primary + tint.faint }]}>
                        <Info size={layout.icon.sm} color={theme.primary} />
                        <Text style={[type.caption, styles.flex, { color: theme.text }]}>
                            Los clientes podrán agendar este servicio contigo en los horarios libres de tu agenda.
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
