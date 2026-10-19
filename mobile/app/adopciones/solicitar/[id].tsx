import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Home, Users, Heart, ShieldAlert, Lock, PartyPopper, Send } from 'lucide-react-native';
import { useApplyForm } from '@/src/hooks/adopciones/useApplyForm';
import { useTheme } from '@/src/hooks/useTheme';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { DetailFooter } from '@/src/components/layout/DetailLayout';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import FormField from '@/src/components/FormField';
import FormSection from '@/src/components/forms/FormSection';
import FormSwitch from '@/src/components/forms/FormSwitch';
import FilterChip from '@/src/components/FilterChip';
import Button from '@/src/components/Button';
import EmptyState from '@/src/components/EmptyState';
import { Skeleton } from '@/src/components/Skeleton';
import { layout, radius, spacing, type } from '@/constants/design';

const STEPS = [
    { title: 'Hogar', icon: Home },
    { title: 'Familia y rutina', icon: Users },
    { title: 'Compromiso', icon: Heart },
];
const HOUSE_TYPES = ['Casa', 'Departamento', 'Rancho', 'Otro'];

export default function SolicitarAdopcionScreen() {
    const { theme } = useTheme();
    const {
        listing, loadingListing, form, step, errors, loading, success,
        isAdmin, isVerified, isPending,
        updateField, handleNext, handleBack, handleSubmit,
        goToMyApplications, goToVerification, goBack,
    } = useApplyForm();
    const petName = listing?.name ?? 'esta mascota';

    if (loadingListing) {
        return (
            <ScreenContainer>
                <ScreenHeader title="Solicitud de adopción" />
                <View style={styles.content}>
                    <Skeleton height={20} width="40%" />
                    <Skeleton height={56} />
                    <Skeleton height={56} />
                    <Skeleton height={56} />
                </View>
            </ScreenContainer>
        );
    }

    // Un admin modera; no postula
    if (isAdmin) {
        return (
            <ScreenContainer>
                <ScreenHeader title="Solicitud de adopción" />
                <EmptyState
                    icon={<ShieldAlert size={layout.icon.xl} color={theme.textMuted} />}
                    title="Acción no disponible para administradores"
                    subtitle="Las solicitudes se revisan desde el panel de moderación."
                    actionLabel="Volver"
                    onAction={goBack}
                />
            </ScreenContainer>
        );
    }

    // Solo cuentas con identidad verificada pueden adoptar
    if (!isVerified) {
        return (
            <ScreenContainer>
                <ScreenHeader title="Solicitud de adopción" subtitle={listing?.name} />
                <EmptyState
                    icon={<Lock size={layout.icon.xl} color={theme.textMuted} />}
                    title={isPending ? 'Estamos verificando tu identidad' : 'Verifica tu identidad para adoptar'}
                    subtitle={isPending
                        ? 'Podrás enviar tu solicitud en cuanto el equipo valide tus documentos.'
                        : 'Por el bienestar de las mascotas, quien adopta debe tener su identidad verificada. Toma unos minutos.'}
                    actionLabel={isPending ? 'Ver el estado' : 'Verificar mi identidad'}
                    onAction={goToVerification}
                />
            </ScreenContainer>
        );
    }

    if (success) {
        return (
            <ScreenContainer>
                <ScreenHeader title="Solicitud enviada" showBack={false} />
                <EmptyState
                    icon={<PartyPopper size={layout.icon.xl} color={theme.success} />}
                    title={`¡Listo! Ya postulaste para adoptar a ${petName}`}
                    subtitle="Quien lo publicó revisará tu solicitud. Te avisaremos en cada cambio de estado."
                    actionLabel="Ver mis solicitudes"
                    onAction={goToMyApplications}
                />
            </ScreenContainer>
        );
    }

    const StepIcon = STEPS[step - 1].icon;

    return (
        <ScreenContainer>
            <ScreenHeader title="Solicitud de adopción" subtitle={`Para ${petName}`} onBack={handleBack} />

            <KeyboardScreen
                contentContainerStyle={styles.content}
                footer={(
                    <DetailFooter>
                        {step < 3 ? (
                            <Button label="Continuar" onPress={handleNext} size="lg" style={styles.flex} />
                        ) : (
                            <Button
                                label="Enviar solicitud"
                                icon={<Send size={layout.icon.sm} color={theme.onPrimary} />}
                                onPress={handleSubmit}
                                loading={loading}
                                size="lg"
                                style={styles.flex}
                            />
                        )}
                    </DetailFooter>
                )}
            >
                {/* Progreso */}
                <View style={styles.progress}>
                    <View style={styles.progressRow}>
                        <StepIcon size={layout.icon.sm} color={theme.primary} />
                        <Text style={[type.bodyStrong, styles.flex, { color: theme.text }]}>{STEPS[step - 1].title}</Text>
                        <Text style={[type.caption, { color: theme.textMuted }]}>Paso {step} de {STEPS.length}</Text>
                    </View>
                    <View style={[styles.track, { backgroundColor: theme.border }]}>
                        <View style={[styles.fill, { backgroundColor: theme.primary, width: `${(step / STEPS.length) * 100}%` }]} />
                    </View>
                </View>

                {step === 1 ? (
                    <>
                        <FormSection title="Sobre ti">
                            <FormField
                                label="Nombre completo *"
                                value={form.applicant_name || ''}
                                onChangeText={(t) => updateField('applicant_name', t)}
                                placeholder="Como aparece en tu identificación"
                                autoComplete="name"
                                textContentType="name"
                                error={errors.applicant_name}
                            />
                        </FormSection>
                        <FormSection title="Vivienda">
                            <View style={styles.chips}>
                                {HOUSE_TYPES.map((t) => (
                                    <FilterChip key={t} label={t} active={form.house_type === t} onPress={() => updateField('house_type', t)} />
                                ))}
                            </View>
                            <View style={styles.chips}>
                                {['Propia', 'Renta'].map((t) => (
                                    <FilterChip key={t} label={t === 'Propia' ? 'Es propia' : 'Rento'} active={form.own_or_rent === t} onPress={() => updateField('own_or_rent', t)} />
                                ))}
                            </View>
                            <FormSwitch variant="switch" label="Tiene patio o jardín" value={form.has_yard} onChange={(v) => updateField('has_yard', v)} />
                            {form.own_or_rent === 'Renta' ? (
                                <>
                                    <FormSwitch
                                        variant="switch"
                                        label="Mi arrendador permite mascotas"
                                        value={form.landlord_permission}
                                        onChange={(v) => updateField('landlord_permission', v)}
                                    />
                                    {errors.landlord_permission ? <Text style={[type.caption, { color: theme.error }]}>{errors.landlord_permission}</Text> : null}
                                </>
                            ) : null}
                        </FormSection>
                    </>
                ) : null}

                {step === 2 ? (
                    <>
                        <FormSection title="Familia">
                            <FormSwitch variant="switch" label="Hay niños en casa" value={form.has_children} onChange={(v) => updateField('has_children', v)} />
                            {form.has_children ? (
                                <FormField
                                    label="Edades de los niños"
                                    value={form.children_ages || ''}
                                    onChangeText={(t) => updateField('children_ages', t)}
                                    placeholder="Ej: 3 y 7 años"
                                />
                            ) : null}
                            <FormField
                                label="Otras mascotas"
                                value={form.other_pets || ''}
                                onChangeText={(t) => updateField('other_pets', t)}
                                placeholder="Especie, raza y edad (déjalo vacío si no tienes)"
                                multiline
                            />
                        </FormSection>
                        <FormSection title="Rutina">
                            <FormField
                                label="Horas al día que pasaría sola"
                                value={String(form.hours_alone ?? '')}
                                onChangeText={(t) => updateField('hours_alone', t.replace(/\D/g, '') === '' ? (undefined as unknown as number) : parseInt(t.replace(/\D/g, ''), 10))}
                                keyboardType="number-pad"
                                maxLength={2}
                                placeholder="0 a 24"
                                error={errors.hours_alone}
                            />
                        </FormSection>
                    </>
                ) : null}

                {step === 3 ? (
                    <FormSection title={`¿Por qué ${petName}?`}>
                        <FormField
                            label="¿Por qué quieres adoptar? *"
                            value={form.reason}
                            onChangeText={(t) => updateField('reason', t)}
                            placeholder="Cuéntale a quien lo cuida cómo sería su vida contigo"
                            multiline
                            error={errors.reason}
                        />
                        <FormField
                            label="Experiencia con mascotas"
                            value={form.previous_experience || ''}
                            onChangeText={(t) => updateField('previous_experience', t)}
                            placeholder="Ej: He tenido perros toda mi vida"
                            multiline
                        />
                        <FormSwitch
                            label="Me comprometo con sus gastos"
                            description="Comida, veterinario, vacunas y esterilización."
                            value={form.financial_commitment}
                            onChange={(v) => updateField('financial_commitment', v)}
                        />
                        {errors.financial_commitment ? <Text style={[type.caption, { color: theme.error }]}>{errors.financial_commitment}</Text> : null}
                    </FormSection>
                ) : null}
            </KeyboardScreen>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    content: { paddingHorizontal: layout.screenPadding, paddingTop: spacing.lg, paddingBottom: spacing.xl, gap: spacing.sm },
    progress: { gap: spacing.sm, marginBottom: spacing.md },
    progressRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    track: { height: spacing.xs, borderRadius: radius.pill, overflow: 'hidden' },
    fill: { height: '100%', borderRadius: radius.pill },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
