import React from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useVenueForm } from '@/src/hooks/venues/useVenueForm';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import FormSection from '@/src/components/forms/FormSection';
import FormSwitch from '@/src/components/forms/FormSwitch';
import { Building2, MapPin, Tag, FileText, Plus } from 'lucide-react-native';
import { font, spacing } from '@/constants/design';

export default function NuevoEstablecimientoScreen() {
    const { theme } = useTheme();
    const {
        formData,
        amenities,
        updateField,
        toggleAmenity,
        handleSubmit,
        isSubmitting,
    } = useVenueForm('create');

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Nuevo Establecimiento"
                subtitle="Registra tu negocio pet-friendly"
            />

            <KeyboardScreen contentContainerStyle={styles.scrollContent}>
                <View style={styles.form}>
                    <FormSection title="Información básica">
                        <View style={[styles.inputGroup, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                            <View style={styles.inputRow}>
                                <Building2 size={18} color={theme.primary} />
                                <TextInput
                                    style={[styles.input, { color: theme.text }]}
                                    placeholder="Nombre del establecimiento"
                                    placeholderTextColor={theme.textMuted}
                                    value={formData.name}
                                    onChangeText={(v) => updateField('name', v)}
                                />
                            </View>
                        </View>

                        <View style={[styles.inputGroup, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                            <View style={styles.inputRow}>
                                <MapPin size={18} color={theme.primary} />
                                <TextInput
                                    style={[styles.input, { color: theme.text }]}
                                    placeholder="Dirección completa"
                                    placeholderTextColor={theme.textMuted}
                                    value={formData.address}
                                    onChangeText={(v) => updateField('address', v)}
                                />
                            </View>
                        </View>
                    </FormSection>

                    <FormSection title="Servicios y amenidades">
                        {Object.entries(amenities).map(([key, value]) => (
                            <FormSwitch
                                key={key}
                                label={key}
                                value={value}
                                onChange={() => toggleAmenity(key)}
                            />
                        ))}
                    </FormSection>

                    <FormSection title="Descuento (opcional)">
                        <View style={[styles.inputGroup, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                            <View style={styles.inputRow}>
                                <Tag size={18} color={theme.warning} />
                                <TextInput
                                    style={[styles.input, { color: theme.text }]}
                                    placeholder="Código de cupón"
                                    placeholderTextColor={theme.textMuted}
                                    value={formData.discount_coupon}
                                    onChangeText={(v) => updateField('discount_coupon', v)}
                                    autoCapitalize="characters"
                                />
                            </View>
                        </View>

                        <View style={[styles.inputGroup, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                            <View style={styles.inputRow}>
                                <FileText size={18} color={theme.warning} />
                                <TextInput
                                    style={[styles.input, { color: theme.text }]}
                                    placeholder="Descripción del descuento"
                                    placeholderTextColor={theme.textMuted}
                                    value={formData.discount_description}
                                    onChangeText={(v) => updateField('discount_description', v)}
                                    multiline
                                />
                            </View>
                        </View>
                    </FormSection>

                    <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel="Registrar establecimiento"
                        style={[
                            styles.submitButton,
                            { backgroundColor: theme.primary },
                            isSubmitting && styles.submitDisabled,
                        ]}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Plus size={20} color="#fff" />
                                <Text style={styles.submitText}>Registrar Establecimiento</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardScreen>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: spacing.huge,
    },
    form: {
        paddingHorizontal: spacing.xxl,
    },
    inputGroup: {
        borderRadius: 14,
        borderWidth: 1,
        marginBottom: spacing.md,
        overflow: 'hidden',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        gap: spacing.md,
    },
    input: {
        flex: 1,
        fontSize: font.lg,
        paddingVertical: spacing.lg,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.lg,
        borderRadius: 16,
        marginTop: spacing.sm,
        gap: spacing.md,
    },
    submitDisabled: {
        opacity: 0.7,
    },
    submitText: {
        color: '#fff',
        fontSize: font.xl,
        fontWeight: '700',
    },
});
