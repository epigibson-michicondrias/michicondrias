/**
 * PetForm — formulario común de mascota (alta y edición).
 * Comparte los campos entre `app/mascotas/nuevo` y `app/mascotas/editar/[id]`. Toda la validación es inline
 * (`hooks/mascotas/petFormRules`): solo llama a `onSubmit` cuando no hay errores.
 */
import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Check } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import FormField from '@/src/components/FormField';
import Button from '@/src/components/Button';
import FormImagePicker from '@/src/components/forms/FormImagePicker';
import FormSelect from '@/src/components/forms/FormSelect';
import FormSwitch from '@/src/components/forms/FormSwitch';
import { SPECIES_OPTIONS, GENDER_OPTIONS, type PetFormData } from '@/src/types/mascotas';
import { validatePetForm, type PetFormErrors } from '@/src/hooks/mascotas/petFormRules';
import { layout, radius, spacing, type } from '@/constants/design';

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

export default function PetForm({ form, updateField, image, setImage, submitLabel, onSubmit, busy, children }: PetFormProps) {
    const { theme } = useTheme();
    const [errors, setErrors] = useState<PetFormErrors>({});

    /** Al corregir un campo se quita su error. */
    const change = (key: keyof PetFormData, value: string | boolean) => {
        updateField(key, value);
        if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

    const handleSubmit = () => {
        const next = validatePetForm(form);
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
                        placeholder="Subir foto"
                        circular
                    />
                </View>

                <View style={[styles.formCard, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
                    <Text style={[type.title, { color: theme.text }]}>Datos básicos</Text>

                    <FormField
                        label="Nombre *"
                        placeholder="Ej. Michi"
                        value={form.name}
                        onChangeText={(t) => change('name', t)}
                        error={errors.name}
                    />
                    <FormSelect
                        label="Especie"
                        options={SPECIES_OPTIONS}
                        value={form.species}
                        onChange={(v) => change('species', v)}
                    />
                    <FormSelect
                        label="Género"
                        options={GENDER_OPTIONS}
                        value={form.gender}
                        onChange={(v) => change('gender', v)}
                    />
                    <FormField
                        label="Raza"
                        placeholder="Ej. Siamés (opcional)"
                        value={form.breed}
                        onChangeText={(t) => change('breed', t)}
                        error={errors.breed}
                    />
                    <View style={styles.row}>
                        <View style={styles.rowItem}>
                            <FormField
                                label="Edad (años)"
                                placeholder="Ej. 3"
                                keyboardType="number-pad"
                                value={form.age_years}
                                onChangeText={(t) => change('age_years', t)}
                                error={errors.age_years}
                            />
                        </View>
                        <View style={styles.rowItem}>
                            <FormField
                                label="Meses"
                                placeholder="0 a 11"
                                keyboardType="number-pad"
                                value={form.age_months}
                                onChangeText={(t) => change('age_months', t)}
                                error={errors.age_months}
                            />
                        </View>
                    </View>
                    <FormField
                        label="Peso (kg)"
                        placeholder="Ej. 4.5"
                        keyboardType="decimal-pad"
                        value={form.weight_kg}
                        onChangeText={(t) => change('weight_kg', t)}
                        error={errors.weight_kg}
                    />
                    <FormField
                        label="Sobre tu mascota"
                        placeholder="Carácter, manías, lo que le gusta… (opcional)"
                        value={form.description}
                        onChangeText={(t) => change('description', t)}
                        error={errors.description}
                        multiline
                        numberOfLines={4}
                    />
                </View>

                <View style={[styles.formCard, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
                    <Text style={[type.title, { color: theme.text }]}>Salud y registro</Text>
                    <FormSwitch label="Esterilizado" value={form.is_sterilized} onChange={(v) => change('is_sterilized', v)} />
                    <FormSwitch label="Desparasitado" value={form.is_dewormed} onChange={(v) => change('is_dewormed', v)} />
                    <FormField
                        label="Microchip"
                        placeholder="Opcional"
                        value={form.microchip_id}
                        onChangeText={(t) => change('microchip_id', t)}
                    />
                </View>

                {children}
            </ScrollView>

            <View style={[styles.footer, { borderTopColor: theme.borderLight }]}>
                <Button
                    label={submitLabel}
                    onPress={handleSubmit}
                    loading={busy}
                    size="lg"
                    fullWidth
                    icon={<Check size={layout.icon.md} color={theme.onPrimary} />}
                />
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
});
