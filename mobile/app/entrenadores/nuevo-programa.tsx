import React from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useTrainerDashboard } from '@/src/hooks/training';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { Dumbbell, FileText, DollarSign, Clock, Sparkles } from 'lucide-react-native';

const DIFFICULTY_LEVELS = ['Básico', 'Intermedio', 'Avanzado'];

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
                <ScreenHeader title="Nuevo Programa" rightElement={<View style={styles.placeholder} />} />

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

                    {/* Difficulty Level */}
                    <View style={styles.fieldGroup}>
                        <Text style={[styles.labelText, { color: theme.text, marginBottom: 10 }]}>Nivel de dificultad</Text>
                        <View style={styles.difficultyRow}>
                            {DIFFICULTY_LEVELS.map((level) => (
                                <TouchableOpacity
                                    key={level}
                                    style={[
                                        styles.difficultyChip,
                                        {
                                            backgroundColor: theme.overlay,
                                            borderColor: theme.cardBorder,
                                        },
                                    ]}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.difficultyText, { color: theme.text }]}>{level}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Submit Button */}
                <View style={styles.actionContainer}>
                    <TouchableOpacity
                        style={[styles.submitButton, { backgroundColor: theme.primary }]}
                        onPress={handleCreateProgram}
                        disabled={isCreatingProgram}
                        activeOpacity={0.8}
                    >
                        {isCreatingProgram ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Dumbbell size={20} color="#fff" />
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
    placeholder: { width: 24 },
    illustrationContainer: {
        alignItems: 'center',
        paddingVertical: 20,
        gap: 8,
    },
    illustrationCircle: {
        width: 72,
        height: 72,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    illustrationTitle: {
        fontSize: 20,
        fontWeight: '900',
    },
    illustrationSubtitle: {
        fontSize: 14,
        textAlign: 'center',
    },
    formSection: {
        marginHorizontal: 24,
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        gap: 20,
        marginBottom: 24,
    },
    fieldGroup: { gap: 6 },
    fieldLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    labelText: {
        fontSize: 14,
        fontWeight: '600',
    },
    input: {
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 14,
        borderWidth: 1,
        fontSize: 15,
    },
    textArea: {
        minHeight: 100,
        paddingTop: 14,
    },
    rowFields: {
        flexDirection: 'row',
        gap: 12,
    },
    difficultyRow: {
        flexDirection: 'row',
        gap: 10,
    },
    difficultyChip: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    difficultyText: {
        fontSize: 13,
        fontWeight: '600',
    },
    actionContainer: {
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        gap: 10,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    footer: { height: 20 },
});
