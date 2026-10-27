/**
 * PetForm — formulario común de mascota (alta y edición) con diseño premium e interactivo.
 * Comparte los campos entre `app/mascotas/nuevo` y `app/mascotas/editar/[id]`.
 * Ofrece previsualización en vivo de la ficha, tarjetas agrupadas con iconos temáticos y validación inline.
 */
import React, { useRef, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import {
    AlertTriangle,
    Cat,
    Check,
    Dog,
    HeartPulse,
    Mars,
    PawPrint,
    Scale,
    Sparkles,
    Calendar,
    ShieldCheck,
    Venus,
} from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import FormField from '@/src/components/FormField';
import Button from '@/src/components/Button';
import FormImagePicker from '@/src/components/forms/FormImagePicker';
import FormSelect from '@/src/components/forms/FormSelect';
import FormSwitch from '@/src/components/forms/FormSwitch';
import { SPECIES_OPTIONS, GENDER_OPTIONS, type PetFormData } from '@/src/types/mascotas';
import { validatePetForm, type PetFormErrors } from '@/src/hooks/mascotas/petFormRules';
import { layout, radius, spacing, type, shadow, families } from '@/constants/design';

/** Icono por especie para los chips del selector. */
const SPECIES_WITH_ICONS = SPECIES_OPTIONS.map((o) => ({
    ...o,
    icon: o.value === 'perro' ? Dog : Cat,
}));

/** Icono por género (macho / hembra) para los chips del selector. */
const GENDER_WITH_ICONS = GENDER_OPTIONS.map((o) => ({
    ...o,
    icon: o.value === 'macho' ? Mars : Venus,
}));

interface PetFormProps {
    form: PetFormData;
    updateField: (key: keyof PetFormData, value: string | boolean) => void;
    image: string | null;
    setImage: (uri: string | null) => void;
    submitLabel: string;
    onSubmit: () => void;
    onCancel: () => void;
    busy: boolean;
    /** Bloque extra bajo los campos (p. ej. «Eliminar mascota» al editar). */
    children?: React.ReactNode;
}

/** Previsualización de edad legible (ej. "3 años y 2 meses"). */
function formatAgePreview(years: string, months: string): string | null {
    const y = parseInt(years, 10) || 0;
    const m = parseInt(months, 10) || 0;
    if (!y && !m) return null;
    return [
        y ? `${y} ${y === 1 ? 'año' : 'años'}` : null,
        m ? `${m} ${m === 1 ? 'mes' : 'meses'}` : null,
    ]
        .filter(Boolean)
        .join(' y ');
}

export default function PetForm({
    form,
    updateField,
    image,
    setImage,
    submitLabel,
    onSubmit,
    onCancel,
    busy,
    children,
}: PetFormProps) {
    const { theme } = useTheme();
    const scrollRef = useRef<ScrollView>(null);
    const [errors, setErrors] = useState<PetFormErrors>({});

    const errorList = Object.entries(errors).filter(([, v]) => !!v) as [string, string][];

    /** Al corregir un campo se quita su error. */
    const change = (key: keyof PetFormData, value: string | boolean) => {
        updateField(key, value);
        if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

    const handleSubmit = () => {
        const next = validatePetForm(form);
        setErrors(next);
        if (Object.keys(next).length === 0) {
            onSubmit();
        } else {
            scrollRef.current?.scrollTo({ y: 0, animated: true });
        }
    };

    const isDog = form.species === 'perro';
    const SpeciesIcon = isDog ? Dog : Cat;
    const speciesLabel = isDog ? 'Perro' : 'Gato';
    const isMale = form.gender === 'macho';
    const GenderIcon = isMale ? Mars : Venus;
    const genderLabel = isMale ? 'Macho' : 'Hembra';
    const ageString = formatAgePreview(form.age_years, form.age_months);
    const weightString = form.weight_kg.trim() ? `${form.weight_kg.trim()} kg` : null;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.flex}
        >
            <ScrollView
                ref={scrollRef}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scroll}
            >
                {/* Resumen de errores tras un guardado fallido */}
                {errorList.length > 0 && (
                    <View
                        style={[
                            styles.errorSummary,
                            { backgroundColor: theme.errorLight, borderColor: theme.error },
                        ]}
                        accessibilityRole="alert"
                        accessibilityLiveRegion="assertive"
                    >
                        <AlertTriangle size={20} color={theme.error} />
                        <View style={styles.flex}>
                            <Text style={[type.bodyStrong, { color: theme.error }]}>
                                Corrige {errorList.length} {errorList.length === 1 ? 'campo' : 'campos'} para continuar
                            </Text>
                            {errorList.map(([field, msg]) => (
                                <Text key={field} style={[type.caption, { color: theme.error }]}>
                                    • {msg}
                                </Text>
                            ))}
                        </View>
                    </View>
                )}

                {/* Hero interactivo: foto y previsualización de la tarjeta */}
                <View
                    style={[
                        styles.heroCard,
                        shadow.card,
                        { backgroundColor: theme.surface, borderColor: theme.borderLight },
                    ]}
                >
                    <View style={styles.photoContainer}>
                        <FormImagePicker
                            imageUri={image}
                            onImageSelected={setImage}
                            onImageRemoved={() => setImage(null)}
                            aspect={[1, 1]}
                            previewHeight={116}
                            placeholder="Agregar foto"
                            circular
                        />
                    </View>

                    <View style={styles.previewInfo}>
                        <Text style={[type.h2, { color: theme.text, textAlign: 'center' }]}>
                            {form.name.trim() || 'Tu mascota'}
                        </Text>
                        <Text style={[type.caption, { color: theme.textMuted, textAlign: 'center' }]}>
                            {form.breed.trim() ? `${speciesLabel} · ${form.breed.trim()}` : speciesLabel}
                        </Text>

                        {/* Chips con datos en tiempo real */}
                        <View style={styles.chipsRow}>
                            <View
                                style={[
                                    styles.previewChip,
                                    {
                                        backgroundColor: theme.primaryLight,
                                        borderColor: theme.primary + '30',
                                    },
                                ]}
                            >
                                <SpeciesIcon size={14} color={theme.primary} />
                                <Text style={[type.caption, { color: theme.primary, fontFamily: families.semibold }]}>
                                    {speciesLabel}
                                </Text>
                            </View>

                            <View
                                style={[
                                    styles.previewChip,
                                    {
                                        backgroundColor: theme.backgroundSecondary,
                                        borderColor: theme.borderLight,
                                    },
                                ]}
                            >
                                <GenderIcon size={13} color={theme.textMuted} />
                                <Text style={[type.caption, { color: theme.text }]}>
                                    {genderLabel}
                                </Text>
                            </View>

                            {ageString ? (
                                <View
                                    style={[
                                        styles.previewChip,
                                        {
                                            backgroundColor: theme.backgroundSecondary,
                                            borderColor: theme.borderLight,
                                        },
                                    ]}
                                >
                                    <Text style={[type.caption, { color: theme.text }]}>
                                        {ageString}
                                    </Text>
                                </View>
                            ) : null}

                            {weightString ? (
                                <View
                                    style={[
                                        styles.previewChip,
                                        {
                                            backgroundColor: theme.backgroundSecondary,
                                            borderColor: theme.borderLight,
                                        },
                                    ]}
                                >
                                    <Text style={[type.caption, { color: theme.text }]}>
                                        {weightString}
                                    </Text>
                                </View>
                            ) : null}
                        </View>
                    </View>
                </View>

                {/* Tarjeta 1: Datos básicos */}
                <View
                    style={[
                        styles.formCard,
                        shadow.card,
                        { backgroundColor: theme.surface, borderColor: theme.borderLight },
                    ]}
                >
                    <View style={styles.sectionHeader}>
                        <View
                            style={[
                                styles.iconBadge,
                                { backgroundColor: theme.primaryLight },
                            ]}
                        >
                            <PawPrint size={18} color={theme.primary} />
                        </View>
                        <View style={styles.flex}>
                            <Text style={[type.title, { color: theme.text }]}>Datos básicos</Text>
                            <Text style={[type.caption, { color: theme.textMuted }]}>
                                Identidad principal de tu compañero
                            </Text>
                        </View>
                    </View>

                    <FormField
                        label="Nombre *"
                        placeholder="Ej. Michi o Rocky"
                        value={form.name}
                        onChangeText={(t) => change('name', t)}
                        error={errors.name}
                        returnKeyType="next"
                    />

                    <FormSelect
                        label="Especie"
                        options={SPECIES_WITH_ICONS}
                        value={form.species}
                        onChange={(v) => change('species', v)}
                    />

                    <FormSelect
                        label="Género"
                        options={GENDER_WITH_ICONS}
                        value={form.gender}
                        onChange={(v) => change('gender', v)}
                    />

                    <FormField
                        label="Raza"
                        placeholder="Ej. Siamés, Golden Retriever, Mestizo"
                        value={form.breed}
                        onChangeText={(t) => change('breed', t)}
                        error={errors.breed}
                        hint="Opcional. Si no tiene raza definida, déjalo vacío o escribe «Mestizo»."
                    />
                </View>

                {/* Tarjeta 2: Edad y medidas */}
                <View
                    style={[
                        styles.formCard,
                        shadow.card,
                        { backgroundColor: theme.surface, borderColor: theme.borderLight },
                    ]}
                >
                    <View style={styles.sectionHeader}>
                        <View
                            style={[
                                styles.iconBadge,
                                { backgroundColor: theme.primaryLight },
                            ]}
                        >
                            <Scale size={18} color={theme.primary} />
                        </View>
                        <View style={styles.flex}>
                            <Text style={[type.title, { color: theme.text }]}>Edad y medidas</Text>
                            <Text style={[type.caption, { color: theme.textMuted }]}>
                                Para el cálculo de dosis, recetas y nutrición
                            </Text>
                        </View>
                    </View>

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
                        hint="Opcional. En kilogramos con decimales si corresponde."
                    />
                </View>

                {/* Tarjeta 3: Personalidad y notas */}
                <View
                    style={[
                        styles.formCard,
                        shadow.card,
                        { backgroundColor: theme.surface, borderColor: theme.borderLight },
                    ]}
                >
                    <View style={styles.sectionHeader}>
                        <View
                            style={[
                                styles.iconBadge,
                                { backgroundColor: theme.primaryLight },
                            ]}
                        >
                            <Sparkles size={18} color={theme.primary} />
                        </View>
                        <View style={styles.flex}>
                            <Text style={[type.title, { color: theme.text }]}>Sobre tu mascota</Text>
                            <Text style={[type.caption, { color: theme.textMuted }]}>
                                Carácter, gustos o hábitos que deba saber su cuidador
                            </Text>
                        </View>
                    </View>

                    <FormField
                        label="Descripción"
                        placeholder="¿Cómo es su personalidad? ¿Tiene manías o preferencias especiales?"
                        value={form.description}
                        onChangeText={(t) => change('description', t)}
                        error={errors.description}
                        multiline
                        numberOfLines={4}
                    />
                </View>

                {/* Tarjeta 4: Salud y registro */}
                <View
                    style={[
                        styles.formCard,
                        shadow.card,
                        { backgroundColor: theme.surface, borderColor: theme.borderLight },
                    ]}
                >
                    <View style={styles.sectionHeader}>
                        <View
                            style={[
                                styles.iconBadge,
                                { backgroundColor: theme.primaryLight },
                            ]}
                        >
                            <HeartPulse size={18} color={theme.primary} />
                        </View>
                        <View style={styles.flex}>
                            <Text style={[type.title, { color: theme.text }]}>Salud y registro</Text>
                            <Text style={[type.caption, { color: theme.textMuted }]}>
                                Cuidados clínicos básicos y chip identificador
                            </Text>
                        </View>
                    </View>

                    <View style={styles.switchesGroup}>
                        <FormSwitch
                            label="Esterilizado"
                            description="Cirugía preventiva de esterilización realizada"
                            value={form.is_sterilized}
                            onChange={(v) => change('is_sterilized', v)}
                            variant="switch"
                        />
                        <FormSwitch
                            label="Desparasitado"
                            description="Control interno/externo vigente"
                            value={form.is_dewormed}
                            onChange={(v) => change('is_dewormed', v)}
                            variant="switch"
                        />
                    </View>

                    <FormField
                        label="Número de Microchip"
                        placeholder="Ej. 981020000123456"
                        value={form.microchip_id}
                        onChangeText={(t) => change('microchip_id', t)}
                        hint="El número de 15 dígitos en su cartilla o certificado oficial."
                    />
                </View>

                {/* Slot para bloques adicionales (ej. Eliminar mascota en pantalla de editar) */}
                {children}
            </ScrollView>

            {/* Barra de acción inferior flotante */}
            <View
                style={[
                    styles.footer,
                    shadow.raised,
                    {
                        backgroundColor: theme.surface,
                        borderTopColor: theme.borderLight,
                    },
                ]}
            >
                <Button
                    label="Cancelar"
                    variant="ghost"
                    onPress={onCancel}
                    disabled={busy}
                    style={styles.footerBtn}
                />
                <Button
                    label={submitLabel}
                    onPress={handleSubmit}
                    loading={busy}
                    size="lg"
                    style={styles.footerBtn}
                    icon={<Check size={layout.icon.md} color={theme.onPrimary} />}
                />
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    scroll: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: spacing.huge * 1.5,
    },
    errorSummary: {
        flexDirection: 'row',
        gap: spacing.md,
        padding: spacing.md,
        borderRadius: radius.xl,
        borderWidth: 1,
        marginBottom: spacing.lg,
        alignItems: 'flex-start',
    },
    heroCard: {
        borderRadius: radius.xxl,
        borderWidth: 1,
        padding: spacing.xl,
        marginBottom: spacing.lg,
        alignItems: 'center',
    },
    photoContainer: {
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    previewInfo: {
        alignItems: 'center',
        width: '100%',
        gap: spacing.xs,
    },
    chipsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: spacing.xs,
        marginTop: spacing.sm,
    },
    previewChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: radius.pill,
        borderWidth: 1,
    },
    formCard: {
        borderRadius: radius.xl,
        borderWidth: 1,
        padding: spacing.xl,
        marginBottom: spacing.lg,
        gap: spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.xs,
    },
    iconBadge: {
        width: 38,
        height: 38,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    row: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    rowItem: {
        flex: 1,
    },
    switchesGroup: {
        gap: spacing.md,
    },
    footer: {
        borderTopWidth: 1,
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.md,
        paddingBottom: Platform.OS === 'ios' ? spacing.xxl : spacing.md,
        flexDirection: 'row',
        gap: spacing.md,
    },
    footerBtn: {
        flex: 1,
    },
});