import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@/src/hooks/useTheme';
import { Camera, Dog, Cat, Heart, MapPin } from 'lucide-react-native';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { useListingForm } from '@/src/hooks/adopciones/useListingForm';

const SIZES = ['Pequeño', 'Mediano', 'Grande'];
const ENERGY_LEVELS = ['Baja', 'Media', 'Alta'];

export default function NuevaAdopcionScreen() {
    const { theme } = useTheme();
    const {
        form,
        image,
        loading,
        updateField,
        toggleField,
        handleImageSelected,
        handleSave,
    } = useListingForm();

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            handleImageSelected(result.assets[0].uri);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScreenContainer>
                <ScreenHeader title="Poner en Adopción" />

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                    <TouchableOpacity style={styles.imageSelector} onPress={pickImage}>
                        {image ? (
                            <Image source={{ uri: image }} style={styles.selectedImage} />
                        ) : (
                            <View style={[styles.imagePlaceholder, { backgroundColor: theme.surface }]}>
                                <Camera size={32} color={theme.textMuted} />
                                <Text style={[styles.imagePlaceholderText, { color: theme.textMuted }]}>Subir Foto</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <View style={styles.form}>
                        <Text style={[styles.label, { color: theme.text }]}>Nombre del Michi o Lomito</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                            placeholder="Ej. Bolita"
                            placeholderTextColor={theme.textMuted}
                            value={form.name}
                            onChangeText={(t) => updateField('name', t)}
                        />

                        <Text style={[styles.label, { color: theme.text }]}>Especie</Text>
                        <View style={styles.speciesRow}>
                            <TouchableOpacity
                                style={[styles.choiceBtn, form.species === 'perro' && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                                onPress={() => updateField('species', 'perro')}
                            >
                                <Dog size={20} color={form.species === 'perro' ? '#fff' : theme.textMuted} />
                                <Text style={[styles.choiceText, { color: form.species === 'perro' ? '#fff' : theme.textMuted }]}>Perro</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.choiceBtn, form.species === 'gato' && { backgroundColor: theme.secondary, borderColor: theme.secondary }]}
                                onPress={() => updateField('species', 'gato')}
                            >
                                <Cat size={20} color={form.species === 'gato' ? '#fff' : theme.textMuted} />
                                <Text style={[styles.choiceText, { color: form.species === 'gato' ? '#fff' : theme.textMuted }]}>Gato</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.label, { color: theme.text }]}>Raza (Opcional)</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                            placeholder="Ej. Mestizo"
                            placeholderTextColor={theme.textMuted}
                            value={form.breed}
                            onChangeText={(t) => updateField('breed', t)}
                        />

                        <View style={styles.row}>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.label, { color: theme.text }]}>Edad (Meses)</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                                    placeholder="Ej. 6"
                                    placeholderTextColor={theme.textMuted}
                                    keyboardType="numeric"
                                    value={form.age_months}
                                    onChangeText={(t) => updateField('age_months', t)}
                                />
                            </View>
                            <View style={{ width: 20 }} />
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.label, { color: theme.text }]}>Género</Text>
                                <View style={styles.genderRow}>
                                    <TouchableOpacity
                                        style={[styles.genderBtn, form.gender === 'macho' && { backgroundColor: theme.primary }]}
                                        onPress={() => updateField('gender', 'macho')}
                                    >
                                        <Text style={[styles.genderBtnText, { color: form.gender === 'macho' ? '#fff' : theme.textMuted }]}>♂️</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.genderBtn, form.gender === 'hembra' && { backgroundColor: theme.secondary }]}
                                        onPress={() => updateField('gender', 'hembra')}
                                    >
                                        <Text style={[styles.genderBtnText, { color: form.gender === 'hembra' ? '#fff' : theme.textMuted }]}>♀️</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        <Text style={[styles.label, { color: theme.text }]}>Tamaño</Text>
                        <View style={styles.sizeRow}>
                            {SIZES.map((size) => (
                                <TouchableOpacity
                                    key={size}
                                    style={[
                                        styles.sizeBtn,
                                        { backgroundColor: theme.surface },
                                        form.size === size && { backgroundColor: theme.primary, borderColor: theme.primary }
                                    ]}
                                    onPress={() => updateField('size', size)}
                                >
                                    <Text style={[styles.sizeText, { color: form.size === size ? '#fff' : theme.textMuted }]}>{size}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={[styles.label, { color: theme.text }]}>Ubicación</Text>
                        <View style={styles.inputWrapper}>
                            <MapPin size={18} color={theme.textMuted} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, styles.inputWithIcon, { backgroundColor: theme.surface, color: theme.text }]}
                                placeholder="Ej. Ciudad de México, CDMX"
                                placeholderTextColor={theme.textMuted}
                                value={form.location}
                                onChangeText={(t) => updateField('location', t)}
                            />
                        </View>

                        <TextInput
                            style={[styles.input, styles.textArea, { backgroundColor: theme.surface, color: theme.text }]}
                            placeholder="Cuéntanos su historia y qué tipo de familia necesita..."
                            placeholderTextColor={theme.textMuted}
                            multiline
                            numberOfLines={4}
                            value={form.description}
                            onChangeText={(t) => updateField('description', t)}
                        />

                        <Text style={[styles.label, { color: theme.text }]}>Temperamento / Rasgos</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                            placeholder="Ej. Juguetón, Tranquilo, Miedoso..."
                            placeholderTextColor={theme.textMuted}
                            value={form.temperament}
                            onChangeText={(t) => updateField('temperament', t)}
                        />

                        <Text style={[styles.label, { color: theme.text }]}>Nivel de Energía</Text>
                        <View style={styles.sizeRow}>
                            {ENERGY_LEVELS.map((level) => (
                                <TouchableOpacity
                                    key={level}
                                    style={[
                                        styles.sizeBtn,
                                        { backgroundColor: theme.surface },
                                        form.energy_level === level && { backgroundColor: theme.primary, borderColor: theme.primary }
                                    ]}
                                    onPress={() => updateField('energy_level', level)}
                                >
                                    <Text style={[styles.sizeText, { color: form.energy_level === level ? '#fff' : theme.textMuted }]}>{level}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.divider} />

                        <CustomSwitch
                            label="🚨 ¿Es un Caso Urgente?"
                            active={form.is_emergency}
                            onPress={() => toggleField('is_emergency')}
                            theme={theme}
                            activeColor="#ef4444"
                        />

                        <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>Salud</Text>
                        <View style={styles.switchGrid}>
                            <CustomSwitch label="Vacunado" active={form.is_vaccinated} onPress={() => toggleField('is_vaccinated')} theme={theme} />
                            <CustomSwitch label="Esterilizado" active={form.is_sterilized} onPress={() => toggleField('is_sterilized')} theme={theme} />
                            <CustomSwitch label="Desparasitado" active={form.is_dewormed} onPress={() => toggleField('is_dewormed')} theme={theme} />
                        </View>

                        <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>Socialización</Text>
                        <View style={styles.switchGrid}>
                            <CustomSwitch label="Apto c/ Gatos" active={form.social_cats} onPress={() => toggleField('social_cats')} theme={theme} />
                            <CustomSwitch label="Apto c/ Perros" active={form.social_dogs} onPress={() => toggleField('social_dogs')} theme={theme} />
                            <CustomSwitch label="Apto c/ Niños" active={form.social_children} onPress={() => toggleField('social_children')} theme={theme} />
                        </View>
                    </View>
                </ScrollView>

                <View style={[styles.footer, { borderTopColor: theme.border }]}>
                    <TouchableOpacity
                        style={[styles.saveBtn, { backgroundColor: theme.secondary }, loading && { opacity: 0.7 }]}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <Text style={styles.saveBtnText}>Publicando...</Text>
                        ) : (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <Heart size={20} color="#fff" />
                                <Text style={styles.saveBtnText}>Publicar Adopción</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </ScreenContainer>
        </KeyboardAvoidingView>
    );
}

function CustomSwitch({ label, active, onPress, theme, activeColor }: { label: string, active: boolean, onPress: () => void, theme: any, activeColor?: string }) {
    return (
        <View style={styles.switchRow}>
            <Text style={[styles.switchLabel, { color: theme.text }]}>{label}</Text>
            <TouchableOpacity
                style={[styles.switch, { backgroundColor: active ? (activeColor || '#10b981') : theme.surface }]}
                onPress={onPress}
            >
                <View style={[styles.switchThumb, active && styles.switchThumbActive]} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    scroll: {
        padding: 24,
    },
    imageSelector: {
        alignSelf: 'center',
        width: 150,
        height: 150,
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 32,
    },
    imagePlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.05)',
        borderStyle: 'dashed',
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
    form: {
        gap: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '800',
        marginBottom: 4,
        marginLeft: 4,
    },
    input: {
        height: 56,
        borderRadius: 16,
        paddingHorizontal: 16,
        fontSize: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    inputWrapper: {
        position: 'relative',
    },
    inputIcon: {
        position: 'absolute',
        left: 16,
        top: 18,
        zIndex: 1,
    },
    inputWithIcon: {
        paddingLeft: 46,
    },
    textArea: {
        height: 120,
        paddingTop: 16,
        textAlignVertical: 'top',
    },
    speciesRow: {
        flexDirection: 'row',
        gap: 12,
    },
    choiceBtn: {
        flex: 1,
        height: 50,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    choiceText: {
        fontSize: 15,
        fontWeight: '700',
    },
    row: {
        flexDirection: 'row',
    },
    genderRow: {
        flexDirection: 'row',
        gap: 10,
    },
    genderBtn: {
        flex: 1,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    genderBtnText: {
        fontSize: 20,
    },
    sizeRow: {
        flexDirection: 'row',
        gap: 8,
    },
    sizeBtn: {
        flex: 1,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    sizeText: {
        fontSize: 12,
        fontWeight: '700',
    },
    footer: {
        padding: 24,
        paddingBottom: 40,
        borderTopWidth: 1,
    },
    saveBtn: {
        height: 64,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#ec4899',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 8,
    },
    saveBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginVertical: 8,
    },
    sectionSubtitle: {
        fontSize: 12,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginTop: 10,
    },
    switchGrid: {
        gap: 12,
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    switchLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    switch: {
        width: 48,
        height: 26,
        borderRadius: 13,
        padding: 3,
    },
    switchThumb: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#fff',
    },
    switchThumbActive: {
        alignSelf: 'flex-end',
    }
});
