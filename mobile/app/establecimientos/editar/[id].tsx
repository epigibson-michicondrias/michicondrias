import RoleGuard from '@/src/components/RoleGuard';
import React from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useVenueForm } from '@/src/hooks/venues/useVenueForm';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import FormSection from '@/src/components/forms/FormSection';
import FormSwitch from '@/src/components/forms/FormSwitch';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import { Building2, MapPin, Tag, FileText, Save, Trash2 } from 'lucide-react-native';
import { font, spacing, layout } from '@/constants/design';

export default function EditarEstablecimientoScreen() {
    return (
        <RoleGuard roles={['establecimiento', 'admin']}>
            <EditarEstablecimientoScreenContent />
        </RoleGuard>
    );
}

function EditarEstablecimientoScreenContent() {
    const { theme } = useTheme();
    const {
        formData,
        amenities,
        updateField,
        toggleAmenity,
        handleSubmit,
        handleDelete,
        isLoadingVenue,
        isSubmitting,
        isDeleting,
    } = useVenueForm('edit');

    if (isLoadingVenue) {
        return (
            <ScreenContainer>
                <ScreenHeader title="Editar local" />
                <LoadingOverlay message="Cargando establecimiento..." />
            </ScreenContainer>
        );
    }

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Editar local"
                subtitle="Actualiza la información de tu negocio"
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

                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                { backgroundColor: theme.primary },
                                isSubmitting && styles.submitDisabled,
                            ]}
                            onPress={handleSubmit}
                            disabled={isSubmitting || isDeleting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator size="small" color={theme.onPrimary} />
                            ) : (
                                <>
                                    <Save size={20} color={theme.onPrimary} />
                                    <Text style={styles.submitText}>Guardar Cambios</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.deleteButton,
                                { backgroundColor: theme.error + '15', borderColor: theme.error },
                                isDeleting && styles.submitDisabled,
                            ]}
                            onPress={handleDelete}
                            disabled={isSubmitting || isDeleting}
                        >
                            {isDeleting ? (
                                <ActivityIndicator size="small" color={theme.error} />
                            ) : (
                                <>
                                    <Trash2 size={20} color={theme.error} />
                                    <Text style={[styles.deleteText, { color: theme.error }]}>Eliminar</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
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
        paddingHorizontal: layout.screenPadding,
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
    actionButtons: {
        gap: spacing.md,
        marginTop: spacing.sm,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.lg,
        borderRadius: 16,
        gap: spacing.md,
    },
    submitDisabled: {
        opacity: 0.7,
    },
    submitText: {
        fontSize: font.xl,
        fontWeight: '700',
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.lg,
        borderRadius: 16,
        borderWidth: 1.5,
        gap: spacing.md,
    },
    deleteText: {
        fontSize: font.xl,
        fontWeight: '700',
    },
});
