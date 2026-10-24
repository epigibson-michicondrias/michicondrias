import React from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useAIDiagnosis } from '@/src/hooks/mascotas/useAIDiagnosis';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { Sparkles, AlertTriangle, ShieldAlert, Heart, Info, Clipboard, Activity } from 'lucide-react-native';
import FormSelect from '@/src/components/forms/FormSelect';
import FormField from '@/src/components/FormField';
import SegmentedControl from '@/src/components/SegmentedControl';
import Button from '@/src/components/Button';
import KeyboardScreen from '../../src/components/KeyboardScreen';
import { validateRequired } from '@/src/utils/validators';
import { spacing, radius, type, shadow, layout, font } from '@/constants/design';

export default function DiagnosticoIAScreen() {
    const { theme } = useTheme();
    const [symptomsError, setSymptomsError] = React.useState<string | null>(null);
    const [durationError, setDurationError] = React.useState<string | null>(null);
    const {
        activeTab,
        setActiveTab,
        symptoms,
        setSymptoms,
        durationHours,
        setDurationHours,
        triagePetId,
        setTriagePetId,
        triageLoading,
        triageResult,
        handleSymptomCheck,
        selectedPetId,
        setSelectedPetId,
        activityLevel,
        setActivityLevel,
        allergies,
        setAllergies,
        targetWeight,
        setTargetWeight,
        dietLoading,
        dietResult,
        handleDietPlan,
        pets,
        loadingPets,
        getTriageColor,
        goAddPet,
    } = useAIDiagnosis();

    // Validación inline de los campos obligatorios del triage antes de llamar al hook.
    const submitSymptomCheck = () => {
        const e1 = validateRequired(symptoms, 'La descripción de los síntomas', 'f');
        const e2 = validateRequired(durationHours, 'El tiempo de evolución');
        setSymptomsError(e1.valid ? null : e1.message!);
        setDurationError(e2.valid ? null : e2.message!);
        if (!e1.valid || !e2.valid) return;
        handleSymptomCheck();
    };

    const triagePetOptions = [
        { label: 'Sin especificar', value: '' },
        ...pets.map((pet) => ({
            label: pet.name,
            value: pet.id,
        })),
    ];

    const dietPetOptions = [
        { label: '-- Elige una mascota --', value: '' },
        ...pets.map((pet) => ({
            label: pet.name,
            value: pet.id,
        })),
    ];

    const activityOptions = [
        { label: 'Bajo (Poco ejercicio)', value: 'bajo' },
        { label: 'Medio (Normal / Juegos)', value: 'medio' },
        { label: 'Alto (Deportivo / Muy activo)', value: 'alto' },
    ];

    return (
        <ScreenContainer>
            {/* Header */}
            <ScreenHeader
                title="Michi-IA Asistente"
                leftElement={undefined}
            />

            {/* Segmented Control */}
            <View style={styles.segmentContainer}>
                <SegmentedControl
                    accessibilityLabel="Pestañas de asistente IA"
                    value={activeTab}
                    onChange={(val) => setActiveTab(val as 'triage' | 'diet')}
                    options={[
                        { value: 'triage', label: 'Sintomatología', icon: Activity },
                        { value: 'diet', label: 'Nutrición', icon: Heart },
                    ]}
                />
            </View>

            <KeyboardScreen contentContainerStyle={{ paddingHorizontal: spacing.xl }}>
                {activeTab === 'triage' ? (
                    <View style={styles.formContainer}>
                        <Text style={[type.h2, { color: theme.text, marginBottom: spacing.xs }]}>
                            Analizador Clínico Pre-Diagnóstico
                        </Text>
                        <Text style={[type.body, { color: theme.textMuted, marginBottom: spacing.xl }]}>
                            Te orientamos sobre qué tan urgente es atender a tu mascota según los síntomas. No es un diagnóstico ni sustituye a un veterinario.
                        </Text>

                        {/* Mascota del análisis */}
                        <View style={styles.formGroup}>
                            {loadingPets ? (
                                <ActivityIndicator size="small" color={theme.primary} />
                            ) : pets.length === 0 ? (
                                <View style={[styles.emptyPetsCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                    <AlertTriangle size={layout.icon.lg} color={theme.warning} />
                                    <Text style={[type.bodyStrong, { color: theme.text, textAlign: 'center' }]}>
                                        Registra a tu mascota para orientar el análisis con su especie, peso y edad.
                                    </Text>
                                    <Button
                                        label="Agregar mascota"
                                        onPress={goAddPet}
                                        variant="primary"
                                        size="sm"
                                    />
                                </View>
                            ) : (
                                <FormSelect
                                    label="¿A qué mascota le pasa? (opcional)"
                                    options={triagePetOptions}
                                    value={triagePetId}
                                    onChange={(val) => setTriagePetId(val)}
                                />
                            )}
                        </View>

                        <FormField
                            label="¿Qué síntomas presenta tu mascota? *"
                            value={symptoms}
                            onChangeText={(t) => { setSymptoms(t); if (symptomsError) setSymptomsError(null); }}
                            error={symptomsError}
                            multiline
                            numberOfLines={4}
                            placeholder="Describe detalladamente lo que notas (ej. vomito constante, decaído, no come)..."
                        />

                        <FormField
                            label="¿Hace cuántas horas comenzaron los síntomas? *"
                            value={durationHours}
                            onChangeText={(t) => { setDurationHours(t); if (durationError) setDurationError(null); }}
                            error={durationError}
                            keyboardType="numeric"
                            placeholder="Ej. 12"
                        />

                        <View style={styles.actionRow}>
                            <Button
                                label={triageLoading ? 'Analizando síntomas...' : 'Iniciar Análisis Clínico'}
                                onPress={submitSymptomCheck}
                                loading={triageLoading}
                                icon={<Sparkles size={layout.icon.md} color={theme.onPrimary} />}
                                fullWidth
                            />
                        </View>

                        {triageResult && (
                            <View style={[styles.resultCard, { backgroundColor: theme.surface, borderColor: getTriageColor(triageResult.urgency) }]}>
                                <View style={styles.resultHeader}>
                                    <ShieldAlert size={layout.icon.lg} color={getTriageColor(triageResult.urgency)} />
                                    <Text style={[type.title, { color: getTriageColor(triageResult.urgency) }]}>
                                        {triageResult.triage_level}
                                    </Text>
                                </View>

                                <Text style={[type.body, { color: theme.text }]}>
                                    {triageResult.summary}
                                </Text>

                                <View style={[styles.recommendationBox, { backgroundColor: theme.backgroundSecondary }]}>
                                    <Text style={[type.label, { color: theme.primary }]}>Plan de Acción Recomendado:</Text>
                                    <Text style={[type.body, { color: theme.text }]}>
                                        {triageResult.action_plan}
                                    </Text>
                                </View>

                                <View style={styles.disclaimerContainer}>
                                    <Info size={layout.icon.xs} color={theme.textMuted} />
                                    <Text style={[type.caption, { color: theme.textMuted }]}>
                                        {triageResult.disclaimer}
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>
                ) : (
                    <View style={styles.formContainer}>
                        <Text style={[type.h2, { color: theme.text, marginBottom: spacing.xs }]}>
                            Planificador Nutricional Personalizado
                        </Text>
                        <Text style={[type.body, { color: theme.textMuted, marginBottom: spacing.xl }]}>
                            Calcula las calorías diarias de tu mascota (fórmula RER/MER) y recibe una guía de alimentación balanceada.
                        </Text>

                        {loadingPets ? (
                            <ActivityIndicator size="small" color={theme.primary} />
                        ) : pets.length === 0 ? (
                            <View style={[styles.emptyPetsCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                <AlertTriangle size={layout.icon.lg} color={theme.warning} />
                                <Text style={[type.bodyStrong, { color: theme.text, textAlign: 'center' }]}>
                                    Necesitas registrar al menos una mascota para generar un plan nutricional.
                                </Text>
                                <Button
                                    label="Agregar mascota"
                                    onPress={goAddPet}
                                    variant="primary"
                                    size="sm"
                                />
                            </View>
                        ) : (
                            <>
                                <View style={styles.formGroup}>
                                    <FormSelect
                                        label="Selecciona tu Mascota *"
                                        options={dietPetOptions}
                                        value={selectedPetId}
                                        onChange={(val) => setSelectedPetId(val)}
                                    />
                                </View>

                                <View style={styles.formGroup}>
                                    <FormSelect
                                        label="Nivel de Actividad Física"
                                        options={activityOptions}
                                        value={activityLevel}
                                        onChange={(val) => setActivityLevel(val)}
                                    />
                                </View>

                                <FormField
                                    label="Alergias conocidas (opcional)"
                                    value={allergies}
                                    onChangeText={setAllergies}
                                    placeholder="Ej. Pollo, pescado, granos..."
                                />

                                <FormField
                                    label="Peso objetivo en kg (opcional)"
                                    value={targetWeight}
                                    onChangeText={setTargetWeight}
                                    keyboardType="decimal-pad"
                                    placeholder="Ej. 8.5"
                                />

                                <View style={styles.actionRow}>
                                    <Button
                                        label={dietLoading ? 'Generando plan...' : 'Generar Plan de Dieta'}
                                        onPress={handleDietPlan}
                                        loading={dietLoading}
                                        icon={<Sparkles size={layout.icon.md} color={theme.onPrimary} />}
                                        fullWidth
                                    />
                                </View>
                            </>
                        )}

                        {dietResult && (
                            <View style={[styles.resultCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
                                <View style={styles.resultHeader}>
                                    <Clipboard size={layout.icon.lg} color={theme.primary} />
                                    <Text style={[type.title, { color: theme.text }]}>
                                        Guía de Nutrición
                                    </Text>
                                </View>

                                <View style={styles.metricRow}>
                                    <View style={[styles.metricBox, { backgroundColor: theme.backgroundSecondary }]}>
                                        <Text style={[styles.metricVal, { color: theme.primary }]}>
                                            {dietResult.resting_energy_requirement_kcal}
                                        </Text>
                                        <Text style={[styles.metricLabel, { color: theme.textMuted }]}>RER (kcal/día)</Text>
                                    </View>
                                    <View style={[styles.metricBox, { backgroundColor: theme.backgroundSecondary }]}>
                                        <Text style={[styles.metricVal, { color: theme.success }]}>
                                            {dietResult.daily_energy_needs_kcal}
                                        </Text>
                                        <Text style={[styles.metricLabel, { color: theme.textMuted }]}>Meta Calórica</Text>
                                    </View>
                                    <View style={[styles.metricBox, { backgroundColor: theme.backgroundSecondary }]}>
                                        <Text style={[styles.metricVal, { color: theme.info }]}>
                                            {dietResult.hydration_target_ml}ml
                                        </Text>
                                        <Text style={[styles.metricLabel, { color: theme.textMuted }]}>Hidratación</Text>
                                    </View>
                                </View>

                                <View style={[styles.recommendationBox, { backgroundColor: theme.backgroundSecondary }]}>
                                    <Text style={[type.label, { color: theme.primary }]}>Pauta de Dieta Sugerida:</Text>
                                    <Text style={[type.body, { color: theme.text, lineHeight: 22 }]}>
                                        {dietResult.recommended_diet}
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>
                )}
            </KeyboardScreen>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    segmentContainer: {
        paddingHorizontal: spacing.xl,
        marginBottom: spacing.lg,
    },
    formContainer: {
        paddingBottom: 100,
    },
    formGroup: {
        marginBottom: spacing.lg,
    },
    input: {
        height: layout.inputHeight,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        borderWidth: 1,
        fontSize: font.lg,
        fontWeight: '600',
    },
    textArea: {
        minHeight: 120,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
        borderWidth: 1,
        fontSize: font.lg,
        fontWeight: '600',
        textAlignVertical: 'top',
    },
    actionRow: {
        marginTop: spacing.sm,
        marginBottom: spacing.xl,
    },
    resultCard: {
        padding: spacing.lg,
        borderRadius: radius.xl,
        borderWidth: 1.5,
        gap: spacing.md,
        marginBottom: spacing.xl,
        ...shadow.card,
    },
    resultHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    recommendationBox: {
        padding: spacing.md,
        borderRadius: radius.md,
        gap: spacing.xs,
    },
    disclaimerContainer: {
        flexDirection: 'row',
        gap: spacing.xs,
        alignItems: 'flex-start',
        opacity: 0.85,
    },
    emptyPetsCard: {
        padding: spacing.xl,
        borderRadius: radius.lg,
        borderWidth: 1,
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    metricRow: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    metricBox: {
        flex: 1,
        padding: spacing.md,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
    },
    metricVal: {
        fontSize: font.xxl,
        fontWeight: '900',
    },
    metricLabel: {
        fontSize: font.xs,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
});

