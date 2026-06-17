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

export default function EditarEstablecimientoScreen() {
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
                <ScreenHeader title="Editar Establecimiento" />
                <LoadingOverlay message="Cargando establecimiento..." />
            </ScreenContainer>
        );
    }

    return (
        <ScreenContainer>
            <ScreenHeader
                title="✏️ Editar Establecimiento"
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
                                <Tag size={18} color="#f59e0b" />
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
                                <FileText size={18} color="#f59e0b" />
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
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <>
                                    <Save size={20} color="#fff" />
                                    <Text style={styles.submitText}>Guardar Cambios</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.deleteButton,
                                { backgroundColor: '#ef444415', borderColor: '#ef4444' },
                                isDeleting && styles.submitDisabled,
                            ]}
                            onPress={handleDelete}
                            disabled={isSubmitting || isDeleting}
                        >
                            {isDeleting ? (
                                <ActivityIndicator size="small" color="#ef4444" />
                            ) : (
                                <>
                                    <Trash2 size={20} color="#ef4444" />
                                    <Text style={[styles.deleteText, { color: '#ef4444' }]}>Eliminar</Text>
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
        paddingBottom: 40,
    },
    form: {
        paddingHorizontal: 24,
    },
    inputGroup: {
        borderRadius: 14,
        borderWidth: 1,
        marginBottom: 12,
        overflow: 'hidden',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        gap: 12,
    },
    input: {
        flex: 1,
        fontSize: 15,
        paddingVertical: 16,
    },
    actionButtons: {
        gap: 12,
        marginTop: 8,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        gap: 10,
    },
    submitDisabled: {
        opacity: 0.7,
    },
    submitText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        borderWidth: 1.5,
        gap: 10,
    },
    deleteText: {
        fontSize: 16,
        fontWeight: '700',
    },
});
