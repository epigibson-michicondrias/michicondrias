/**
 * PetForm — formulario común de mascota (alta y edición).
 * Comparte los campos entre `app/mascotas/nuevo` y `app/mascotas/editar/[id]` y adopta
 * `FormField` + `utils/validators` para la validación inline (U2). La pasada visual final va en U6.
 */
import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Check } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import FormField from '@/src/components/FormField';
import FormImagePicker from '@/src/components/forms/FormImagePicker';
import FormSelect from '@/src/components/forms/FormSelect';
import FormSwitch from '@/src/components/forms/FormSwitch';
import { SPECIES_OPTIONS, GENDER_OPTIONS, type PetFormData } from '@/src/types/mascotas';
import { validateRequired } from '@/src/utils/validators';
import { spacing, radius } from '@/constants/design';

interface PetFormProps {
    form: PetFormData;
    updateField: (key: keyof PetFormData, value: string | boolean) => void;
    image: string | null;
    setImage: (uri: string | null) => void;
    submitLabel: string;
    onSubmit: () => void;
    busy: boolean;
    /** Bloque extra bajo los campos (p. ej. «Eliminar mascota» al editar). */
    children?: React.ReactNode;
}

/** Campos obligatorios en la app (el backend no exige raza ni descripción, pero el formulario sí). */
const REQUIRED = [
    { key: 'name', label: 'Nombre' },
    { key: 'breed', label: 'Raza' },
    { key: 'description', label: 'Descripción' },
] as const;

export default function PetForm({ form, updateField, image, setImage, submitLabel, onSubmit, busy, children }: PetFormProps) {
    const { theme } = useTheme();
    const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

    /** Validación inline al enviar (utils/validators): marca los campos que faltan y no sigue. */
    const handleSubmit = () => {
        const next: Record<string, string> = {};
        for (const { key, label } of REQUIRED) {
            const result = validateRequired(String(form[key] ?? ''), label);
            if (!result.valid) next[key] = result.message!;
        }
        setErrors(next);
        if (Object.keys(next).length === 0) onSubmit();
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                <View style={[styles.formCard, styles.photoCard, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
                    <FormImagePicker
                        imageUri={image}
                        onImageSelected={setImage}
                        onImageRemoved={() => setImage(null)}
                        aspect={[1, 1]}
                        previewHeight={120}
                        placeholder="Subir Foto"
                        circular
                    />
                </View>

                <View style={[styles.formCard, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
                    <Text style={[styles.sectionTitle, { color: theme.primary }]}>INFORMACIÓN BÁSICA</Text>

                    <FormField
                        label="Nombre *"
                        placeholder="Ej. Firulais"
                        value={form.name}
                        onChangeText={(t) => updateField('name', t)}
                        error={errors.name}
                    />
                    <FormSelect
                        label="Especie *"
                        options={SPECIES_OPTIONS}
                        value={form.species}
                        onChange={(v) => updateField('species', v)}
                    />
                    <FormField
                        label="Raza *"
                        placeholder="Ej. Husky Siberiano"
                        value={form.breed}
                        onChangeText={(t) => updateField('breed', t)}
                        error={errors.breed}
                    />
                    <View style={styles.row}>
                        <View style={styles.rowItem}>
                            <FormField
                                label="Edad (meses)"
                                placeholder="Ej. 12"
                                keyboardType="numeric"
                                value={form.age_months}
                                onChangeText={(t) => updateField('age_months', t)}
                            />
                        </View>
                        <View style={styles.rowItem}>
                            <FormSelect
                                label="Género"
                                options={GENDER_OPTIONS}
                                value={form.gender}
                                onChange={(v) => updateField('gender', v)}
                            />
                        </View>
                    </View>
                    <FormField
                        label="Descripción *"
                        placeholder="Cuéntanos un poco de tu mascota..."
                        value={form.description}
                        onChangeText={(t) => updateField('description', t)}
                        error={errors.description}
                        multiline
                        numberOfLines={4}
                    />
                </View>

                <View style={[styles.formCard, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
                    <Text style={[styles.sectionTitle, { color: theme.primary }]}>SALUD Y REGISTRO</Text>
                    <FormSwitch label="Vacunado" value={form.is_vaccinated} onChange={(v) => updateField('is_vaccinated', v)} />
                    <FormSwitch label="Esterilizado" value={form.is_sterilized} onChange={(v) => updateField('is_sterilized', v)} />
                    <FormSwitch label="Desparasitado" value={form.is_dewormed} onChange={(v) => updateField('is_dewormed', v)} />
                    <View style={styles.row}>
                        <View style={styles.rowItem}>
                            <FormField
                                label="Peso (kg)"
                                placeholder="Ej. 12.5"
                                keyboardType="decimal-pad"
                                value={form.weight_kg}
                                onChangeText={(t) => updateField('weight_kg', t)}
                            />
                        </View>
                        <View style={styles.rowItem}>
                            <FormField
                                label="Microchip"
                                placeholder="Opcional"
                                value={form.microchip_id}
                                onChangeText={(t) => updateField('microchip_id', t)}
                            />
                        </View>
                    </View>
                </View>

                {children}
            </ScrollView>

            <View style={[styles.footer, { borderTopColor: theme.borderLight }]}>
                <TouchableOpacity
                    style={[styles.saveBtn, { backgroundColor: theme.primary }, busy && styles.busy]}
                    onPress={handleSubmit}
                    disabled={busy}
                    accessibilityRole="button"
                >
                    {busy ? (
                        <Text style={styles.saveBtnText}>Guardando…</Text>
                    ) : (
                        <View style={styles.saveBtnRow}>
                            <Check size={20} color={theme.onPrimary} />
                            <Text style={styles.saveBtnText}>{submitLabel}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    scroll: {
        padding: spacing.xl,
        paddingBottom: spacing.huge,
    },
    formCard: {
        borderRadius: radius.lg,
        borderWidth: 1,
        padding: spacing.lg,
        marginBottom: spacing.lg,
        gap: spacing.md,
    },
    photoCard: {
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1,
    },
    row: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    rowItem: {
        flex: 1,
    },
    footer: {
        borderTopWidth: 1,
        padding: spacing.lg,
    },
    saveBtn: {
        borderRadius: radius.md,
        minHeight: 52,
        alignItems: 'center',
        justifyContent: 'center',
    },
    busy: { opacity: 0.7 },
    saveBtnRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    saveBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
    },
});
