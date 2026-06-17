import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import FormSection from '@/src/components/forms/FormSection';
import FormSelect from '@/src/components/forms/FormSelect';
import FormSwitch from '@/src/components/forms/FormSwitch';
import { Check, ChevronRight, ChevronLeft, Home, Clock, PawPrint, Award } from 'lucide-react-native';
import {
    useCompatibilityForm,
    EXPERIENCE_OPTIONS,
    HOURS_OPTIONS,
} from '@/src/hooks/adopciones/useCompatibilityForm';

export default function FormularioCompatibilidadScreen() {
    const { theme } = useTheme();
    const {
        form,
        step,
        totalSteps,
        updateField,
        nextStep,
        prevStep,
        handleSubmit,
        isSubmitting,
    } = useCompatibilityForm();

    const renderStepIndicator = () => (
        <View style={styles.stepIndicator}>
            {Array.from({ length: totalSteps }).map((_, i) => (
                <View
                    key={i}
                    style={[
                        styles.stepDot,
                        {
                            backgroundColor: i <= step ? theme.primary : theme.surface,
                            flex: i <= step ? 2 : 1,
                        },
                    ]}
                />
            ))}
        </View>
    );

    const renderStep = () => {
        switch (step) {
            case 0:
                return (
                    <FormSection title="🏠 Vivienda">
                        <FormSwitch
                            label="¿Tienes patio o jardín?"
                            description="Espacio exterior para que la mascota pueda ejercitarse"
                            value={form.has_yard}
                            onChange={(v) => updateField('has_yard', v)}
                        />
                        <View style={[styles.infoCard, { backgroundColor: theme.surface }]}>
                            <Home size={20} color={theme.primary} />
                            <Text style={[styles.infoText, { color: theme.textMuted }]}>
                                El tipo de vivienda nos ayuda a determinar qué mascota es más compatible contigo.
                            </Text>
                        </View>
                    </FormSection>
                );
            case 1:
                return (
                    <FormSection title="🐾 Experiencia">
                        <FormSelect
                            label="Nivel de experiencia con mascotas"
                            options={EXPERIENCE_OPTIONS}
                            value={form.experience_level}
                            onChange={(v) => updateField('experience_level', v)}
                        />
                        <View style={[styles.infoCard, { backgroundColor: theme.surface }]}>
                            <Award size={20} color={theme.primary} />
                            <Text style={[styles.infoText, { color: theme.textMuted }]}>
                                No te preocupes si no tienes experiencia, algunas mascotas son ideales para principiantes.
                            </Text>
                        </View>
                    </FormSection>
                );
            case 2:
                return (
                    <FormSection title="⏰ Disponibilidad">
                        <FormSelect
                            label="¿Cuántas horas estará sola la mascota?"
                            options={HOURS_OPTIONS}
                            value={form.hours_left_alone}
                            onChange={(v) => updateField('hours_left_alone', v)}
                        />
                        <View style={[styles.infoCard, { backgroundColor: theme.surface }]}>
                            <Clock size={20} color={theme.primary} />
                            <Text style={[styles.infoText, { color: theme.textMuted }]}>
                                Las mascotas necesitan compañía. Si pasas mucho tiempo fuera, considera adoptar en pareja.
                            </Text>
                        </View>
                    </FormSection>
                );
            case 3:
                return (
                    <FormSection title="🐶 Otras Mascotas">
                        <FormSwitch
                            label="¿Tienes otras mascotas en casa?"
                            description="Perros, gatos u otros animales"
                            value={form.has_other_pets}
                            onChange={(v) => updateField('has_other_pets', v)}
                        />
                        <View style={[styles.infoCard, { backgroundColor: theme.surface }]}>
                            <PawPrint size={20} color={theme.primary} />
                            <Text style={[styles.infoText, { color: theme.textMuted }]}>
                                Si tienes otras mascotas, buscaremos una que sea sociable y compatible.
                            </Text>
                        </View>
                    </FormSection>
                );
            default:
                return null;
        }
    };

    const isLastStep = step === totalSteps - 1;

    return (
        <ScreenContainer>
            <ScreenHeader title="Formulario de Compatibilidad" onBack={prevStep} />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {renderStepIndicator()}

                <Text style={[styles.stepLabel, { color: theme.textMuted }]}>
                    Paso {step + 1} de {totalSteps}
                </Text>

                {renderStep()}
            </ScrollView>

            <View style={[styles.footer, { borderTopColor: theme.border }]}>
                {isLastStep ? (
                    <TouchableOpacity
                        style={[styles.primaryBtn, { backgroundColor: theme.primary }, isSubmitting && { opacity: 0.7 }]}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <View style={styles.btnContent}>
                                <Check size={20} color="#fff" />
                                <Text style={styles.btnText}>Enviar Formulario</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
                        onPress={nextStep}
                    >
                        <View style={styles.btnContent}>
                            <Text style={styles.btnText}>Siguiente</Text>
                            <ChevronRight size={20} color="#fff" />
                        </View>
                    </TouchableOpacity>
                )}
            </View>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    content: {
        padding: 24,
        paddingBottom: 40,
    },
    stepIndicator: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    stepDot: {
        height: 6,
        borderRadius: 3,
    },
    stepLabel: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 24,
    },
    infoCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        gap: 12,
        marginTop: 16,
        alignItems: 'center',
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 18,
    },
    footer: {
        padding: 24,
        paddingBottom: 40,
        borderTopWidth: 1,
    },
    primaryBtn: {
        height: 60,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    btnText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '800',
    },
});
