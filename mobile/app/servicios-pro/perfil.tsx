import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Save } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useServiceProfile } from '@/src/hooks/servicios-pro/useServiceProfile';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { DetailFooter } from '@/src/components/layout/DetailLayout';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import FormField from '@/src/components/FormField';
import FormSection from '@/src/components/forms/FormSection';
import FormSwitch from '@/src/components/forms/FormSwitch';
import Button from '@/src/components/Button';
import { SkeletonList } from '@/src/components/Skeleton';
import { layout, spacing } from '@/constants/design';

/** Texto controlado aunque el perfil aún no tenga el dato (evita «changing an uncontrolled input»). */
const text = (v: unknown) => (v == null ? '' : String(v));

export default function ProfessionalProfileScreen() {
    const { theme } = useTheme();
    const { isWalker, formData, updateField, saving, isLoading, handleSave } = useServiceProfile();
    const money = (v: string) => v.replace(/[^\d.]/g, '');

    if (isLoading) {
        return (
            <ScreenContainer>
                <ScreenHeader title="Mi perfil de servicio" />
                <SkeletonList count={4} />
            </ScreenContainer>
        );
    }

    return (
        <ScreenContainer>
            <ScreenHeader title="Mi perfil de servicio" subtitle={isWalker ? 'Lo que ven los dueños al buscar paseador' : 'Lo que ven los dueños al buscar cuidador'} />
            <KeyboardScreen
                contentContainerStyle={styles.content}
                footer={(
                    <DetailFooter>
                        <Button label="Guardar perfil" icon={<Save size={layout.icon.sm} color={theme.onPrimary} />} onPress={handleSave} loading={saving} size="lg" style={styles.flex} />
                    </DetailFooter>
                )}
            >
                <FormSection title="Visibilidad">
                    <FormSwitch
                        variant="switch"
                        label={formData.is_active ? 'Visible para nuevos clientes' : 'Perfil oculto'}
                        description="Ocúltalo cuando no puedas recibir solicitudes (vacaciones, agenda llena)."
                        value={!!formData.is_active}
                        onChange={(v) => updateField('is_active', v)}
                    />
                </FormSection>

                <FormSection title="Sobre ti">
                    <FormField label="Nombre que verán los clientes" value={text(formData.display_name)} onChangeText={(v) => updateField('display_name', v)} placeholder="Ej. Juan, paseador en Coyoacán" />
                    <FormField label="Experiencia" value={text(formData.bio)} onChangeText={(v) => updateField('bio', v)} placeholder="Años de experiencia, razas que conoces, certificaciones…" multiline />
                </FormSection>

                <FormSection title="Tarifas (MXN)">
                    <View style={styles.row}>
                        {isWalker ? (
                            <>
                                <View style={styles.flex}>
                                    <FormField label="Por paseo" value={text(formData.price_per_walk)} onChangeText={(v) => updateField('price_per_walk', money(v))} keyboardType="decimal-pad" placeholder="0" />
                                </View>
                                <View style={styles.flex}>
                                    <FormField label="Por hora" value={text(formData.price_per_hour)} onChangeText={(v) => updateField('price_per_hour', money(v))} keyboardType="decimal-pad" placeholder="0" />
                                </View>
                            </>
                        ) : (
                            <>
                                <View style={styles.flex}>
                                    <FormField label="Por día (hospedaje)" value={text(formData.price_per_day)} onChangeText={(v) => updateField('price_per_day', money(v))} keyboardType="decimal-pad" placeholder="0" />
                                </View>
                                <View style={styles.flex}>
                                    <FormField label="Por visita" value={text(formData.price_per_visit)} onChangeText={(v) => updateField('price_per_visit', money(v))} keyboardType="decimal-pad" placeholder="0" />
                                </View>
                            </>
                        )}
                    </View>
                </FormSection>

                <FormSection title="Mascotas que aceptas">
                    <FormSwitch label="Perros" value={!!formData.accepts_dogs} onChange={(v) => updateField('accepts_dogs', v)} />
                    <FormSwitch label="Gatos" value={!!formData.accepts_cats} onChange={(v) => updateField('accepts_cats', v)} />
                </FormSection>
            </KeyboardScreen>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    content: { paddingHorizontal: layout.screenPadding, paddingTop: spacing.lg, paddingBottom: spacing.xl },
    row: { flexDirection: 'row', gap: spacing.md },
});
