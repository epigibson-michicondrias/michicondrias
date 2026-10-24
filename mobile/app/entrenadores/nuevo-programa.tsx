import React from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useTrainerDashboard } from '@/src/hooks/training/useTrainerDashboard';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { Dumbbell, FileText, DollarSign, Clock, Sparkles } from 'lucide-react-native';
import { font, spacing, layout } from '@/constants/design';


export default function CreateProgramScreen() {
    const { theme } = useTheme();
    const {
        programForm,
        updateProgramField,
        handleCreateProgram,
        isCreatingProgram,
    } = useTrainerDashboard();

    return (
        <ScreenContainer>
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                <ScreenHeader title="Nuevo Programa" />

                {/* Header Illustration */}
                <View style={styles.illustrationContainer}>
                    <View style={[styles.illustrationCircle, { backgroundColor: theme.primaryLight }]}>
                        <Dumbbell size={36} color={theme.primary} />
                    </View>
                    <Text style={[styles.illustrationTitle, { color: theme.text }]}>Crea tu programa</Text>
                    <Text style={[styles.illustrationSubtitle, { color: theme.textMuted }]}>
                        Define los detalles del programa de entrenamiento
                    </Text>
                </View>

                {/* Form */}
                <View style={[styles.formSection, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
                    {/* Name */}
                    <View style={styles.fieldGroup}>
                        <View style={styles.fieldLabel}>
                            <Sparkles size={14} color={theme.primary} />
                            <Text style={[styles.labelText, { color: theme.text }]}>Nombre del programa *</Text>
                        </View>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                            placeholder="Ej: Obediencia básica"
                            placeholderTextColor={theme.textMuted}
                            value={programForm.title}
                            onChangeText={(v) => updateProgramField('title', v)}
                        />
                    </View>

                    {/* Description */}
                    <View style={styles.fieldGroup}>
                        <View style={styles.fieldLabel}>
                            <FileText size={14} color={theme.secondary} />
                            <Text style={[styles.labelText, { color: theme.text }]}>Descripción</Text>
                        </View>
                        <TextInput
                            style={[
                                styles.input,
                                styles.textArea,
                                { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text },
                            ]}
                            placeholder="Describe qué incluye el programa..."
                            placeholderTextColor={theme.textMuted}
                            value={programForm.description}
                            onChangeText={(v) => updateProgramField('description', v)}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Price & Duration Row */}
                    <View style={styles.rowFields}>
                        <View style={[styles.fieldGroup, { flex: 1 }]}>
                            <View style={styles.fieldLabel}>
                                <DollarSign size={14} color={theme.primary} />
                                <Text style={[styles.labelText, { color: theme.text }]}>Precio *</Text>
                            </View>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                                placeholder="0.00"
                                placeholderTextColor={theme.textMuted}
                                value={programForm.price}
                                onChangeText={(v) => updateProgramField('price', v)}
                                keyboardType="decimal-pad"
                            />
                        </View>

                        <View style={[styles.fieldGroup, { flex: 1 }]}>
                            <View style={styles.fieldLabel}>
                                <Clock size={14} color={theme.secondary} />
                                <Text style={[styles.labelText, { color: theme.text }]}>Semanas</Text>
                            </View>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                                placeholder="4"
                                placeholderTextColor={theme.textMuted}
                                value={programForm.duration_weeks}
                                onChangeText={(v) => updateProgramField('duration_weeks', v)}
                                keyboardType="number-pad"
                            />
                        </View>
                    </View>
                </View>

                {/* Submit Button */}
                <View style={styles.actionContainer}>
                    <TouchableOpacity accessibilityRole="button"
                        style={[styles.submitButton, { backgroundColor: theme.primary }]}
                        onPress={handleCreateProgram}
                        disabled={isCreatingProgram}
                        activeOpacity={0.8}
                    >
                        {isCreatingProgram ? (
                            <ActivityIndicator size="small" color={theme.onPrimary} />
                        ) : (
                            <>
                                <Dumbbell size={20} color={theme.onPrimary} />
                                <Text style={styles.submitButtonText}>Crear Programa</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.footer} />
            </ScrollView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    illustrationContainer: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
        gap: spacing.sm,
    },
    illustrationCircle: {
        width: 72,
        height: 72,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    illustrationTitle: {
        fontSize: font.h3,
        fontWeight: '800',
    },
    illustrationSubtitle: {
        fontSize: font.base,
        textAlign: 'center',
    },
    formSection: {
        marginHorizontal: layout.screenPadding,
        padding: spacing.xl,
        borderRadius: 20,
        borderWidth: 1,
        gap: spacing.xl,
        marginBottom: spacing.xxl,
    },
    fieldGroup: { gap: spacing.sm },
    fieldLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.xs,
    },
    labelText: {
        fontSize: font.base,
        fontWeight: '600',
    },
    input: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.lg,
        borderRadius: 14,
        borderWidth: 1,
        fontSize: font.lg,
    },
    textArea: {
        minHeight: 100,
        paddingTop: spacing.lg,
    },
    rowFields: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    difficultyRow: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    difficultyChip: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderRadius: 12,
        borderWidth: 1,
        justifyContent: 'center',
    },
    difficultyText: {
        fontSize: font.base,
        fontWeight: '600',
    },
    actionContainer: {
        paddingHorizontal: layout.screenPadding,
        marginBottom: spacing.xxl,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.lg,
        borderRadius: 16,
        gap: spacing.md,
    },
    submitButtonText: {
        fontSize: font.xl,
        fontWeight: '700',
    },
    footer: { height: 20 },
});
