/**
 * Formulario de reporte de mascota perdida/encontrada, compartido por `perdidas/nuevo` y `perdidas/editar/[id]`.
 */
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { AlertCircle, Search, MapPin, Check, Dog, Cat, PawPrint } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useReportForm } from '@/src/hooks/perdidas/useReportForm';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { DetailFooter } from '@/src/components/layout/DetailLayout';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import WebMapView from '@/src/components/WebMapView';
import FormField from '@/src/components/FormField';
import FormSection from '@/src/components/forms/FormSection';
import FormImagePicker from '@/src/components/forms/FormImagePicker';
import FilterChip from '@/src/components/FilterChip';
import Button from '@/src/components/Button';
import { Skeleton } from '@/src/components/Skeleton';
import { layout, radius, spacing, type } from '@/constants/design';

const SPECIES = [
    { value: 'perro', label: 'Perro', icon: Dog },
    { value: 'gato', label: 'Gato', icon: Cat },
    { value: 'otro', label: 'Otro', icon: PawPrint },
];
const SIZES = ['pequeño', 'mediano', 'grande'];
const AGES = ['cachorro', 'joven', 'adulto', 'viejito'];
const label = (v: string) => v.charAt(0).toUpperCase() + v.slice(1);

export default function ReportFormScreen() {
    const { theme } = useTheme();
    const f = useReportForm();
    const { form, errors, updateField } = f;
    const isLost = form.report_type === 'lost';
    const title = f.isEditing ? 'Editar reporte' : 'Nuevo reporte';

    if (f.loadingReport) {
        return (
            <ScreenContainer>
                <ScreenHeader title={title} />
                <View style={styles.content}>
                    <Skeleton height={48} />
                    <Skeleton height={200} />
                    <Skeleton height={56} />
                </View>
            </ScreenContainer>
        );
    }

    return (
        <ScreenContainer>
            <ScreenHeader title={title} subtitle={f.isEditing ? form.pet_name : 'Mientras antes, mejor: la comunidad recibe el aviso'} />
            <KeyboardScreen
                contentContainerStyle={styles.content}
                footer={(
                    <DetailFooter>
                        <Button
                            label={f.isEditing ? 'Guardar cambios' : 'Publicar reporte'}
                            icon={<Check size={layout.icon.sm} color={theme.onPrimary} />}
                            onPress={f.handleSave}
                            loading={f.saving}
                            variant={isLost ? 'danger' : 'primary'}
                            size="lg"
                            style={styles.flex}
                        />
                    </DetailFooter>
                )}
            >
                {!f.isEditing ? (
                    <View style={styles.types}>
                        <Button
                            label="Lo perdí"
                            variant={isLost ? 'danger' : 'secondary'}
                            icon={<AlertCircle size={layout.icon.sm} color={isLost ? theme.onPrimary : theme.text} />}
                            onPress={() => updateField('report_type', 'lost')}
                            style={styles.flex}
                        />
                        <Button
                            label="Lo encontré"
                            variant={!isLost ? 'primary' : 'secondary'}
                            icon={<Search size={layout.icon.sm} color={!isLost ? theme.onPrimary : theme.text} />}
                            onPress={() => updateField('report_type', 'found')}
                            style={styles.flex}
                        />
                    </View>
                ) : null}

                <FormSection title="Foto">
                    <FormImagePicker
                        imageUri={f.image}
                        onImageSelected={f.setImage}
                        onImageRemoved={() => f.setImage(null)}
                        aspect={[1, 1]}
                        previewHeight={200}
                        placeholder="Una foto reciente ayuda muchísimo a reconocerlo"
                    />
                </FormSection>

                <FormSection title={isLost ? '¿Cómo es?' : '¿Cómo es la mascota?'}>
                    <FormField
                        label={isLost ? 'Nombre *' : 'Descripción corta *'}
                        value={form.pet_name}
                        onChangeText={(t) => updateField('pet_name', t)}
                        placeholder={isLost ? 'Ej. Firulais' : 'Ej. Perro salchicha café'}
                        error={errors.pet_name}
                    />
                    <View style={styles.chips}>
                        {SPECIES.map(({ value, label: text, icon: Icon }) => {
                            const active = form.species === value;
                            return (
                                <FilterChip
                                    key={value}
                                    label={text}
                                    active={active}
                                    onPress={() => updateField('species', value)}
                                    icon={<Icon size={layout.icon.xs} color={active ? theme.onPrimary : theme.textMuted} />}
                                />
                            );
                        })}
                    </View>
                    <View style={styles.row}>
                        <View style={styles.flex}>
                            <FormField label="Raza" value={form.breed} onChangeText={(t) => updateField('breed', t)} placeholder="Ej. Husky" />
                        </View>
                        <View style={styles.flex}>
                            <FormField label="Color" value={form.color} onChangeText={(t) => updateField('color', t)} placeholder="Ej. Blanco y negro" />
                        </View>
                    </View>
                    <View style={styles.chips}>
                        {SIZES.map((v) => <FilterChip key={v} label={label(v)} active={form.size === v} onPress={() => updateField('size', v)} />)}
                    </View>
                    <View style={styles.chips}>
                        {AGES.map((v) => <FilterChip key={v} label={label(v)} active={form.age_approx === v} onPress={() => updateField('age_approx', v)} />)}
                    </View>
                    <FormField
                        label="Señas particulares"
                        value={form.description}
                        onChangeText={(t) => updateField('description', t)}
                        placeholder="Collar, cicatrices, si responde a su nombre…"
                        multiline
                    />
                </FormSection>

                <FormSection title={isLost ? '¿Dónde se vio por última vez?' : '¿Dónde lo encontraste?'}>
                    <FormField
                        label="Zona o referencia"
                        value={form.last_seen_location}
                        onChangeText={(t) => updateField('last_seen_location', t)}
                        placeholder="Ej. Parque México, Col. Condesa"
                    />
                    {f.point ? (
                        <View style={[styles.map, { borderColor: theme.border }]}>
                            <WebMapView
                                style={styles.flex}
                                initialLatitude={f.point.latitude}
                                initialLongitude={f.point.longitude}
                                initialZoom={15}
                                markers={[{ id: 'point', latitude: f.point.latitude, longitude: f.point.longitude, title: 'Punto del reporte', color: theme.primary }]}
                            />
                        </View>
                    ) : null}
                    <Button
                        label={f.point ? 'Mover el punto a mi ubicación actual' : 'Usar mi ubicación'}
                        variant="secondary"
                        icon={<MapPin size={layout.icon.sm} color={theme.text} />}
                        onPress={f.locate}
                        loading={f.locating}
                        fullWidth
                    />
                    {errors.location ? <Text style={[type.caption, { color: theme.error }]}>{errors.location}</Text> : null}
                </FormSection>

                <FormSection title="Contacto">
                    <FormField
                        label="Teléfono"
                        value={form.contact_phone}
                        onChangeText={(t) => updateField('contact_phone', t)}
                        placeholder="10 dígitos"
                        keyboardType="phone-pad"
                        autoComplete="tel"
                        textContentType="telephoneNumber"
                        error={errors.contact_phone}
                    />
                    <FormField
                        label="Correo"
                        value={form.contact_email}
                        onChangeText={(t) => updateField('contact_email', t)}
                        placeholder="tu@correo.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        error={errors.contact_email}
                        hint="Solo lo ven quienes tienen sesión en la app."
                    />
                </FormSection>
            </KeyboardScreen>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    content: { paddingHorizontal: layout.screenPadding, paddingTop: spacing.lg, paddingBottom: spacing.xl },
    types: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl },
    row: { flexDirection: 'row', gap: spacing.md },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    map: { height: 180, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1 },
});
