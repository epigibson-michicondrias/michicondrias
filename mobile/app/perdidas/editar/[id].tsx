import React from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import FormSelect from '@/src/components/forms/FormSelect';
import { Camera, Save } from 'lucide-react-native';
import { useEditReport } from '@/src/hooks/perdidas/useEditReport';
import LoadingOverlay from '@/src/components/LoadingOverlay';

const SPECIES_OPTIONS = [
    { label: 'Perro', value: 'perro' },
    { label: 'Gato', value: 'gato' },
    { label: 'Otro', value: 'otro' },
];

const SIZE_OPTIONS = [
    { label: 'Pequeño', value: 'pequeño' },
    { label: 'Mediano', value: 'mediano' },
    { label: 'Grande', value: 'grande' },
];

const AGE_OPTIONS = [
    { label: 'Cachorro', value: 'cachorro' },
    { label: 'Joven', value: 'joven' },
    { label: 'Adulto', value: 'adulto' },
    { label: 'Viejito', value: 'viejito' },
];

export default function EditarReporteScreen() {
    const { theme } = useTheme();
    const {
        form,
        image,
        isLoadingReport,
        isUpdating,
        updateField,
        pickImage,
        handleUpdate,
    } = useEditReport();

    if (isLoadingReport) {
        return <LoadingOverlay message="Cargando reporte..." />;
    }

    return (
        <ScreenContainer>
            <ScreenHeader title="Editar Reporte" />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <TouchableOpacity style={styles.imageSelector} onPress={pickImage}>
                    {image ? (
                        <Image source={{ uri: image }} style={styles.selectedImage} />
                    ) : (
                        <View style={[styles.imagePlaceholder, { backgroundColor: theme.surface }]}>
                            <Camera size={40} color={theme.textMuted} />
                            <Text style={[styles.imagePlaceholderText, { color: theme.textMuted }]}>
                                Cambiar Foto
                            </Text>
                        </View>
                    )}
                    <View style={styles.imageEditBadge}>
                        <Camera size={14} color="#fff" />
                    </View>
                </TouchableOpacity>

                <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>Nombre o Identificador</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                            placeholder="Ej. Firulais"
                            placeholderTextColor={theme.textMuted}
                            value={form.pet_name}
                            onChangeText={(t) => updateField('pet_name', t)}
                        />
                    </View>

                    <FormSelect
                        label="Especie"
                        options={SPECIES_OPTIONS}
                        value={form.species}
                        onChange={(v) => updateField('species', v)}
                    />

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={[styles.label, { color: theme.text }]}>Raza</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                                placeholder="Ej. Husky"
                                placeholderTextColor={theme.textMuted}
                                value={form.breed}
                                onChangeText={(t) => updateField('breed', t)}
                            />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={[styles.label, { color: theme.text }]}>Color</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                                placeholder="Ej. Blanco"
                                placeholderTextColor={theme.textMuted}
                                value={form.color}
                                onChangeText={(t) => updateField('color', t)}
                            />
                        </View>
                    </View>

                    <FormSelect
                        label="Tamaño"
                        options={SIZE_OPTIONS}
                        value={form.size}
                        onChange={(v) => updateField('size', v)}
                    />

                    <FormSelect
                        label="Edad aproximada"
                        options={AGE_OPTIONS}
                        value={form.age_approx}
                        onChange={(v) => updateField('age_approx', v)}
                    />

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>Última ubicación conocida</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                            placeholder="Ej. Parque México"
                            placeholderTextColor={theme.textMuted}
                            value={form.last_seen_location}
                            onChangeText={(t) => updateField('last_seen_location', t)}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>Teléfono de Contacto</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                            placeholder="Tus 10 dígitos"
                            keyboardType="phone-pad"
                            placeholderTextColor={theme.textMuted}
                            value={form.contact_phone}
                            onChangeText={(t) => updateField('contact_phone', t)}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>Detalles Extra</Text>
                        <TextInput
                            style={[styles.input, styles.textArea, { backgroundColor: theme.surface, color: theme.text }]}
                            placeholder="Comportamiento, señas particulares..."
                            placeholderTextColor={theme.textMuted}
                            multiline
                            numberOfLines={4}
                            value={form.description}
                            onChangeText={(t) => updateField('description', t)}
                        />
                    </View>
                </View>
            </ScrollView>

            <View style={[styles.footer, { borderTopColor: theme.border }]}>
                <TouchableOpacity
                    style={[styles.saveBtn, { backgroundColor: theme.primary }, isUpdating && { opacity: 0.7 }]}
                    onPress={handleUpdate}
                    disabled={isUpdating}
                >
                    {isUpdating ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <View style={styles.btnContent}>
                            <Save size={20} color="#fff" />
                            <Text style={styles.saveBtnText}>Guardar Cambios</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    content: {
        padding: 24,
        paddingBottom: 40,
    },
    imageSelector: {
        width: '100%',
        height: 200,
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 24,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    imagePlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePlaceholderText: {
        fontSize: 12,
        fontWeight: '700',
        marginTop: 8,
    },
    selectedImage: {
        width: '100%',
        height: '100%',
    },
    imageEditBadge: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    formContainer: {
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    label: {
        fontSize: 14,
        fontWeight: '900',
        marginLeft: 4,
    },
    input: {
        height: 56,
        borderRadius: 16,
        paddingHorizontal: 20,
        fontSize: 16,
        fontWeight: '600',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    textArea: {
        height: 120,
        paddingTop: 16,
        textAlignVertical: 'top',
    },
    footer: {
        padding: 24,
        paddingBottom: 40,
        borderTopWidth: 1,
    },
    saveBtn: {
        height: 60,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    saveBtnText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '800',
    },
});
