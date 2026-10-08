import React from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Syringe, Hash, Info, Plus, X } from 'lucide-react-native';
import { useVaccineForm } from '@/src/hooks/carnet/useVaccineForm';
import { useTheme } from '@/src/hooks/useTheme';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import Button from '@/src/components/Button';
import DatePicker from '@/src/components/DatePicker';
import { spacing, radius, type, layout } from '@/constants/design';

export default function NuevaVacunaScreen() {
    const { theme } = useTheme();
    const {
        name, setName, nameError,
        batch, setBatch,
        appliedOn, setAppliedOn,
        nextDue, setNextDue, addNextDue, clearNextDue,
        notes, setNotes,
        today,
        handleSave,
        isSaving,
        isVet,
        isEditing,
    } = useVaccineForm();

    const fieldStyle = [styles.inputGroup, { borderColor: theme.border, backgroundColor: theme.surface }];

    return (
        <ScreenContainer>
            <ScreenHeader title={isEditing ? 'Editar vacuna' : 'Registrar vacuna'} />

            <KeyboardScreen contentContainerStyle={styles.scrollContent}>
                <View style={styles.sectionHeader}>
                    <Syringe size={layout.icon.sm} color={theme.info} />
                    <Text style={[type.title, { color: theme.text }]}>Información de la vacuna</Text>
                </View>

                <View style={[fieldStyle, nameError && { borderColor: theme.error }]}>
                    <Text style={[type.label, styles.label, { color: theme.textMuted }]}>Nombre de la vacuna *</Text>
                    <TextInput
                        style={[type.subtitle, styles.input, { color: theme.text }]}
                        placeholder="Ej. Quíntuple canina, Rabia..."
                        placeholderTextColor={theme.textMuted}
                        value={name}
                        onChangeText={setName}
                        returnKeyType="next"
                        accessibilityLabel="Nombre de la vacuna"
                    />
                </View>
                {nameError && <Text style={[type.caption, styles.fieldError, { color: theme.error }]}>{nameError}</Text>}

                {/* La fecha de aplicación es un dato clínico: al editar solo se puede consultar */}
                {isEditing ? (
                    <View style={fieldStyle}>
                        <Text style={[type.label, styles.label, { color: theme.textMuted }]}>Fecha de aplicación</Text>
                        <Text style={[type.subtitle, { color: theme.text }]}>
                            {appliedOn.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </Text>
                    </View>
                ) : (
                    <View style={fieldStyle}>
                        <DatePicker
                            value={appliedOn}
                            onChange={setAppliedOn}
                            mode="date"
                            label="Fecha de aplicación"
                            maximumDate={today}
                        />
                    </View>
                )}

                <View style={fieldStyle}>
                    {nextDue ? (
                        <>
                            <DatePicker
                                value={nextDue}
                                onChange={setNextDue}
                                mode="date"
                                label="Próximo refuerzo"
                                minimumDate={appliedOn}
                            />
                            <Text style={[type.caption, { color: theme.textMuted }]}>
                                Te avisaremos en tus notificaciones una semana antes.
                            </Text>
                            <TouchableOpacity
                                style={styles.inlineAction}
                                onPress={clearNextDue}
                                accessibilityRole="button"
                                accessibilityLabel="Quitar próximo refuerzo"
                            >
                                <X size={layout.icon.xs} color={theme.textMuted} />
                                <Text style={[type.caption, { color: theme.textMuted }]}>Sin refuerzo</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <TouchableOpacity
                            style={styles.inlineAction}
                            onPress={addNextDue}
                            accessibilityRole="button"
                            accessibilityLabel="Agregar fecha del próximo refuerzo"
                        >
                            <Plus size={layout.icon.sm} color={theme.primary} />
                            <Text style={[type.bodyStrong, { color: theme.primary }]}>Agregar próximo refuerzo</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={fieldStyle}>
                    <View style={styles.labelRow}>
                        <Hash size={layout.icon.xs} color={theme.textMuted} />
                        <Text style={[type.label, { color: theme.textMuted }]}>Número de lote</Text>
                    </View>
                    <TextInput
                        style={[type.subtitle, styles.input, { color: theme.text }]}
                        placeholder="Ej. BTX-90210"
                        placeholderTextColor={theme.textMuted}
                        value={batch}
                        onChangeText={setBatch}
                        autoCapitalize="characters"
                        accessibilityLabel="Número de lote"
                    />
                </View>

                <View style={fieldStyle}>
                    <Text style={[type.label, styles.label, { color: theme.textMuted }]}>Notas</Text>
                    <TextInput
                        style={[type.body, styles.input, { color: theme.text }]}
                        placeholder="Observaciones de la aplicación..."
                        placeholderTextColor={theme.textMuted}
                        value={notes}
                        onChangeText={setNotes}
                        multiline
                        accessibilityLabel="Notas"
                    />
                </View>

                <View style={[styles.infoBox, { backgroundColor: theme.infoLight }]}>
                    <Info size={layout.icon.sm} color={theme.info} />
                    <Text style={[type.caption, styles.infoText, { color: theme.text }]}>
                        {isVet
                            ? 'Verifica la vigencia y el lote de la vacuna antes de registrarla.'
                            : 'Registra las vacunas que ya le aplicaron a tu mascota, con su fecha real, para tener su historial siempre a la mano.'}
                    </Text>
                </View>

                <Button
                    label="Guardar vacuna"
                    onPress={handleSave}
                    loading={isSaving}
                    size="lg"
                    fullWidth
                    style={styles.saveButton}
                />
            </KeyboardScreen>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        padding: layout.screenPadding,
        paddingBottom: spacing.huge,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    inputGroup: {
        borderRadius: radius.lg,
        padding: spacing.lg,
        marginBottom: spacing.md,
        borderWidth: 1,
    },
    label: {
        marginBottom: spacing.sm,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginBottom: spacing.sm,
    },
    input: {
        minHeight: spacing.xxl,
    },
    fieldError: {
        marginTop: -spacing.sm,
        marginBottom: spacing.md,
        marginLeft: spacing.xs,
    },
    inlineAction: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        minHeight: layout.minTouch,
    },
    infoBox: {
        flexDirection: 'row',
        gap: spacing.md,
        padding: spacing.lg,
        borderRadius: radius.lg,
        marginTop: spacing.sm,
    },
    infoText: {
        flex: 1,
    },
    saveButton: {
        marginTop: spacing.xxl,
    },
});
