import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useFuneraryProvider } from '@/src/hooks/funerary/useFuneraryProvider';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import { Heart, Info, CheckCircle2 } from 'lucide-react-native';

import { CREMATION_OPTIONS } from '@/src/services/funerary';
import { font, spacing } from '@/constants/design';

export default function NuevoServicioScreen() {
    const { theme } = useTheme();
    const { form, updateForm, handleCreateService, isCreatingService } = useFuneraryProvider();

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Nuevo Servicio"
                subtitle="Registra un servicio funerario"
            />

            <KeyboardScreen contentContainerStyle={styles.scrollContent}>
                <View style={styles.content}>
                    {/* Service Name */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>Nombre del Servicio *</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                            placeholder="Ej. Cremación individual"
                            placeholderTextColor={theme.textMuted}
                            value={form.name}
                            onChangeText={(val) => updateForm('name', val)}
                        />
                    </View>

                    {/* Description */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>Descripción</Text>
                        <TextInput
                            style={[styles.textArea, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                            placeholder="Describe el servicio..."
                            placeholderTextColor={theme.textMuted}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            value={form.description}
                            onChangeText={(val) => updateForm('description', val)}
                        />
                    </View>

                    {/* Price */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>Precio ($) *</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                            placeholder="Ej. 1500"
                            placeholderTextColor={theme.textMuted}
                            keyboardType="numeric"
                            value={form.price}
                            onChangeText={(val) => updateForm('price', val)}
                        />
                    </View>

                    {/* Cremation type */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>Tipo de Cremación</Text>
                        <View style={styles.typeRow}>
                            {CREMATION_OPTIONS.map((opt) => (
                                <TouchableOpacity
                                    key={opt.value}
                                    style={[
                                        styles.typeBtn,
                                        { backgroundColor: theme.surface, borderColor: theme.border },
                                        form.cremation_type === opt.value && { backgroundColor: theme.primary, borderColor: theme.primary },
                                    ]}
                                    onPress={() => updateForm('cremation_type', opt.value)}
                                >
                                    <Text
                                        style={[
                                            styles.typeText,
                                            { color: form.cremation_type === opt.value ? '#fff' : theme.text },
                                        ]}
                                    >
                                        {opt.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Urn included toggle */}
                    <TouchableOpacity
                        style={[styles.toggleItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
                        onPress={() => updateForm('urn_included', !form.urn_included)}
                    >
                        <View style={styles.toggleText}>
                            <Text style={[styles.toggleLabel, { color: theme.text }]}>Urna Incluida</Text>
                            <Text style={[styles.toggleDesc, { color: theme.textMuted }]}>El servicio incluye una urna</Text>
                        </View>
                        <CheckCircle2 color={form.urn_included ? theme.primary : theme.textMuted} />
                    </TouchableOpacity>

                    {/* Info box */}
                    <View style={[styles.infoBox, { backgroundColor: theme.primary + '10' }]}>
                        <Info size={18} color={theme.primary} />
                        <Text style={[styles.infoText, { color: theme.textMuted }]}>
                            Los servicios funerarios ayudan a las familias a despedirse de sus mascotas con dignidad.
                        </Text>
                    </View>

                    {/* Submit */}
                    <TouchableOpacity
                        style={[styles.submitBtn, { backgroundColor: theme.secondary }, isCreatingService && { opacity: 0.7 }]}
                        disabled={isCreatingService}
                        onPress={handleCreateService}
                    >
                        <Heart size={20} color={theme.onPrimary} />
                        <Text style={styles.submitBtnText}>
                            {isCreatingService ? 'Registrando...' : 'Registrar Servicio'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardScreen>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        padding: spacing.xxl,
        gap: spacing.xl,
    },
    inputGroup: {
        gap: spacing.sm,
    },
    label: {
        fontSize: font.base,
        fontWeight: '700',
        marginLeft: spacing.xs,
    },
    input: {
        height: 56,
        borderRadius: 16,
        paddingHorizontal: spacing.lg,
        fontSize: font.xl,
        borderWidth: 1,
    },
    textArea: {
        height: 120,
        borderRadius: 16,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.lg,
        fontSize: font.xl,
        textAlignVertical: 'top',
        borderWidth: 1,
    },
    typeRow: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    typeBtn: {
        flex: 1,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    typeText: {
        fontSize: font.base,
        fontWeight: '700',
    },
    toggleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.lg,
        borderRadius: 20,
        borderWidth: 1,
    },
    toggleText: {
        flex: 1,
    },
    toggleLabel: {
        fontSize: font.lg,
        fontWeight: '700',
    },
    toggleDesc: {
        fontSize: font.md,
        marginTop: spacing.xxs,
    },
    infoBox: {
        flexDirection: 'row',
        padding: spacing.lg,
        borderRadius: 16,
        gap: spacing.md,
        alignItems: 'center',
    },
    infoText: {
        flex: 1,
        fontSize: font.md,
        lineHeight: 18,
    },
    submitBtn: {
        height: 64,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: spacing.md,
        marginTop: spacing.md,
        marginBottom: spacing.huge,
    },
    submitBtnText: {
        color: '#fff',
        fontSize: font.xxl,
        fontWeight: '800',
    },
});
