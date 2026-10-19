import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Heart, Dog, Cat } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useListingForm } from '@/src/hooks/adopciones/useListingForm';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { DetailFooter } from '@/src/components/layout/DetailLayout';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import FormField from '@/src/components/FormField';
import FormSection from '@/src/components/forms/FormSection';
import FormSwitch from '@/src/components/forms/FormSwitch';
import FormImagePicker from '@/src/components/forms/FormImagePicker';
import FilterChip from '@/src/components/FilterChip';
import Button from '@/src/components/Button';
import { Skeleton } from '@/src/components/Skeleton';
import { layout, spacing } from '@/constants/design';

const SIZES = ['Pequeño', 'Mediano', 'Grande'];
const ENERGY_LEVELS = ['Baja', 'Media', 'Alta'];
const SPECIES = [
    { value: 'perro', label: 'Perro', icon: Dog },
    { value: 'gato', label: 'Gato', icon: Cat },
];
const GENDERS = [
    { value: 'macho', label: 'Macho' },
    { value: 'hembra', label: 'Hembra' },
];

export default function NuevaAdopcionScreen() {
    const { theme } = useTheme();
    const {
        form, image, loading, errors, isEditing, loadingExisting,
        updateField, toggleField, handleImageSelected, handleImageRemoved, handleSave,
    } = useListingForm();
    const title = isEditing ? 'Editar publicación' : 'Dar en adopción';

    if (loadingExisting) {
        return (
            <ScreenContainer>
                <ScreenHeader title={title} />
                <View style={styles.content}>
                    <Skeleton height={200} />
                    <Skeleton height={56} />
                    <Skeleton height={56} />
                </View>
            </ScreenContainer>
        );
    }

    return (
        <ScreenContainer>
            <ScreenHeader
                title={title}
                subtitle={isEditing ? 'Si cambias datos, se vuelve a revisar' : 'Un admin la revisa antes de publicarla'}
            />
            <KeyboardScreen
                contentContainerStyle={styles.content}
                footer={(
                    <DetailFooter>
                        <Button
                            label={isEditing ? 'Guardar cambios' : 'Enviar a revisión'}
                            onPress={handleSave}
                            loading={loading}
                            icon={<Heart size={layout.icon.sm} color={theme.onPrimary} />}
                            size="lg"
                            style={styles.flex}
                        />
                    </DetailFooter>
                )}
            >
                <FormSection title="Foto">
                    <FormImagePicker
                        imageUri={image}
                        onImageSelected={handleImageSelected}
                        onImageRemoved={handleImageRemoved}
                        aspect={[1, 1]}
                        previewHeight={200}
                        placeholder="Una foto clara de su cara ayuda a que lo adopten"
                    />
                </FormSection>

                <FormSection title="¿Quién es?">
                    <FormField
                        label="Nombre *"
                        value={form.name}
                        onChangeText={(t) => updateField('name', t)}
                        placeholder="Ej. Bolita"
                        maxLength={60}
                        error={errors.name}
                    />
                    <View style={styles.chips}>
                        {SPECIES.map(({ value, label, icon: Icon }) => {
                            const active = form.species === value;
                            return (
                                <FilterChip
                                    key={value}
                                    label={label}
                                    active={active}
                                    onPress={() => updateField('species', value)}
                                    icon={<Icon size={layout.icon.xs} color={active ? theme.onPrimary : theme.textMuted} />}
                                />
                            );
                        })}
                        {GENDERS.map(({ value, label }) => (
                            <FilterChip key={value} label={label} active={form.gender === value} onPress={() => updateField('gender', value)} />
                        ))}
                    </View>
                    <View style={styles.row}>
                        <View style={styles.flex}>
                            <FormField label="Raza" value={form.breed} onChangeText={(t) => updateField('breed', t)} placeholder="Ej. Mestizo" />
                        </View>
                        <View style={styles.flex}>
                            <FormField
                                label="Edad en meses"
                                value={form.age_months}
                                onChangeText={(t) => updateField('age_months', t.replace(/\D/g, ''))}
                                placeholder="Ej. 6"
                                keyboardType="number-pad"
                                maxLength={3}
                                error={errors.age_months}
                            />
                        </View>
                    </View>
                    <FormField
                        label="Ubicación *"
                        value={form.location}
                        onChangeText={(t) => updateField('location', t)}
                        placeholder="Ej. Guadalajara, Jalisco"
                        error={errors.location}
                    />
                </FormSection>

                <FormSection title="Tamaño y energía">
                    <View style={styles.chips}>
                        {SIZES.map((size) => (
                            <FilterChip key={size} label={size} active={form.size === size} onPress={() => updateField('size', size)} />
                        ))}
                    </View>
                    <View style={styles.chips}>
                        {ENERGY_LEVELS.map((level) => (
                            <FilterChip key={level} label={`Energía ${level.toLowerCase()}`} active={form.energy_level === level} onPress={() => updateField('energy_level', level)} />
                        ))}
                    </View>
                </FormSection>

                <FormSection title="Su historia">
                    <FormField
                        label="Historia"
                        value={form.description}
                        onChangeText={(t) => updateField('description', t)}
                        placeholder="Cómo llegó contigo y qué tipo de familia necesita"
                        multiline
                    />
                    <FormField
                        label="Personalidad"
                        value={form.temperament}
                        onChangeText={(t) => updateField('temperament', t)}
                        placeholder="Separada por comas: juguetón, tranquilo, cariñoso"
                    />
                </FormSection>

                <FormSection title="Salud">
                    <FormSwitch label="Vacunado" value={form.is_vaccinated} onChange={() => toggleField('is_vaccinated')} />
                    <FormSwitch label="Desparasitado" value={form.is_dewormed} onChange={() => toggleField('is_dewormed')} />
                    <FormSwitch label="Esterilizado" value={form.is_sterilized} onChange={() => toggleField('is_sterilized')} />
                </FormSection>

                <FormSection title="Convivencia">
                    <FormSwitch label="Convive con perros" value={form.social_dogs} onChange={() => toggleField('social_dogs')} />
                    <FormSwitch label="Convive con gatos" value={form.social_cats} onChange={() => toggleField('social_cats')} />
                    <FormSwitch label="Convive con niños" value={form.social_children} onChange={() => toggleField('social_children')} />
                </FormSection>

                <FormSection title="Prioridad">
                    <FormSwitch
                        variant="switch"
                        label="Caso urgente"
                        description="Se destaca en el listado. Úsalo solo si corre peligro o necesita hogar ya."
                        value={form.is_emergency}
                        onChange={() => toggleField('is_emergency')}
                    />
                </FormSection>
            </KeyboardScreen>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    content: { paddingHorizontal: layout.screenPadding, paddingTop: spacing.lg, paddingBottom: spacing.xl },
    row: { flexDirection: 'row', gap: spacing.md },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
