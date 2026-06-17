import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useGroomingForm } from '@/src/hooks/grooming/useGroomingForm';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import FormSection from '@/src/components/forms/FormSection';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import { Scissors, Info } from 'lucide-react-native';

export default function NuevoEstilistaScreen() {
    const { theme } = useTheme();
    const { form, loading, updateField, handleSubmit } = useGroomingForm();

    return (
        <KeyboardScreen style={{ backgroundColor: theme.background }}>
            <ScreenHeader
                title="Nuevo Servicio"
                subtitle="Ofrece tus servicios de grooming"
            />

            <View style={styles.content}>
                <FormSection>
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>Nombre del Servicio *</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                            placeholder="Ej. Baño y corte básico"
                            placeholderTextColor={theme.textMuted}
                            value={form.name}
                            onChangeText={(val) => updateField('name', val)}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>Descripción</Text>
                        <TextInput
                            style={[styles.textArea, { backgroundColor: theme.surface, color: theme.text }]}
                            placeholder="Describe tu servicio..."
                            placeholderTextColor={theme.textMuted}
                            multiline
                            numberOfLines={4}
                            value={form.description}
                            onChangeText={(val) => updateField('description', val)}
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={[styles.label, { color: theme.text }]}>Precio ($) *</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                                placeholder="Ej. 250"
                                placeholderTextColor={theme.textMuted}
                                keyboardType="numeric"
                                value={form.price}
                                onChangeText={(val) => updateField('price', val)}
                            />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={[styles.label, { color: theme.text }]}>Duración (min)</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                                placeholder="Ej. 30"
                                placeholderTextColor={theme.textMuted}
                                keyboardType="numeric"
                                value={form.duration_minutes}
                                onChangeText={(val) => updateField('duration_minutes', val)}
                            />
                        </View>
                    </View>
                </FormSection>

                <View style={[styles.infoBox, { backgroundColor: theme.primary + '10' }]}>
                    <Info size={18} color={theme.primary} />
                    <Text style={[styles.infoText, { color: theme.textMuted }]}>
                        Al registrar tu servicio, los clientes podrán verlo y agendar citas contigo.
                    </Text>
                </View>

                <TouchableOpacity
                    style={[styles.submitBtn, { backgroundColor: theme.primary }, loading && { opacity: 0.7 }]}
                    disabled={loading}
                    onPress={handleSubmit}
                >
                    <Scissors size={20} color="#fff" />
                    <Text style={styles.submitBtnText}>{loading ? "Registrando..." : "Registrar Servicio"}</Text>
                </TouchableOpacity>
            </View>
        </KeyboardScreen>
    );
}

const styles = StyleSheet.create({
    content: {
        padding: 24,
        gap: 20,
    },
    inputGroup: {
        gap: 8,
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        gap: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        marginLeft: 4,
    },
    input: {
        height: 56,
        borderRadius: 16,
        paddingHorizontal: 16,
        fontSize: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    textArea: {
        height: 120,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 16,
        textAlignVertical: 'top',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    infoBox: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        gap: 12,
        alignItems: 'center',
    },
    infoText: {
        flex: 1,
        fontSize: 12,
        lineHeight: 18,
    },
    submitBtn: {
        height: 64,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 10,
        marginTop: 10,
        marginBottom: 40,
    },
    submitBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
    },
});
