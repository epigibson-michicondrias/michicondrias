import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Check, User, Tag, Calendar, Weight, Cpu, FileText } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useEditPet } from '@/src/hooks/mascotas';
import { SPECIES_OPTIONS, GENDER_OPTIONS } from '@/src/types/mascotas';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import FormImagePicker from '@/src/components/forms/FormImagePicker';
import FormSelect from '@/src/components/forms/FormSelect';
import FormSwitch from '@/src/components/forms/FormSwitch';
import LoadingOverlay from '@/src/components/LoadingOverlay';

export default function EditarMascotaScreen() {
    const { theme } = useTheme();
    const { form, updateField, image, setImage, isLoadingPet, isUpdating, handleUpdate } = useEditPet();
    const [focusedInput, setFocusedInput] = useState<string | null>(null);

    if (isLoadingPet) {
        return (
            <ScreenContainer style={styles.center}>
                <LoadingOverlay message="Cargando datos de tu mascota..." />
            </ScreenContainer>
        );
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScreenContainer style={{ backgroundColor: theme.background }}>
                <ScreenHeader title="Editar Mascota" />

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                    {/* Photo Picker Card */}
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

                    {/* Basic info Card */}
                    <View style={[styles.formCard, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
                        <Text style={[styles.sectionTitle, { color: theme.primary }]}>INFORMACIÓN BÁSICA</Text>
                        
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.text }]}>Nombre *</Text>
                            <View style={[
                                styles.inputContainer,
                                { 
                                    backgroundColor: theme.inputBg, 
                                    borderColor: focusedInput === 'name' ? theme.primary : theme.borderLight,
                                    borderWidth: focusedInput === 'name' ? 1.5 : 1,
                                }
                            ]}>
                                <User size={18} color={focusedInput === 'name' ? theme.primary : theme.textMuted} />
                                <TextInput
                                    style={[styles.textInput, { color: theme.text }]}
                                    placeholder="Ej. Firulais"
                                    placeholderTextColor={theme.textMuted}
                                    value={form.name}
                                    onChangeText={(t) => updateField('name', t)}
                                    onFocus={() => setFocusedInput('name')}
                                    onBlur={() => setFocusedInput(null)}
                                />
                            </View>
                        </View>

                        <FormSelect
                            label="Especie *"
                            options={SPECIES_OPTIONS}
                            value={form.species}
                            onChange={(v) => updateField('species', v)}
                        />

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.text }]}>Raza *</Text>
                            <View style={[
                                styles.inputContainer,
                                { 
                                    backgroundColor: theme.inputBg, 
                                    borderColor: focusedInput === 'breed' ? theme.primary : theme.borderLight,
                                    borderWidth: focusedInput === 'breed' ? 1.5 : 1,
                                }
                            ]}>
                                <Tag size={18} color={focusedInput === 'breed' ? theme.primary : theme.textMuted} />
                                <TextInput
                                    style={[styles.textInput, { color: theme.text }]}
                                    placeholder="Ej. Husky Siberiano"
                                    placeholderTextColor={theme.textMuted}
                                    value={form.breed}
                                    onChangeText={(t) => updateField('breed', t)}
                                    onFocus={() => setFocusedInput('breed')}
                                    onBlur={() => setFocusedInput(null)}
                                />
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.label, { color: theme.text }]}>Edad (Meses)</Text>
                                <View style={[
                                    styles.inputContainer,
                                    { 
                                        backgroundColor: theme.inputBg, 
                                        borderColor: focusedInput === 'age_months' ? theme.primary : theme.borderLight,
                                        borderWidth: focusedInput === 'age_months' ? 1.5 : 1,
                                    }
                                ]}>
                                    <Calendar size={18} color={focusedInput === 'age_months' ? theme.primary : theme.textMuted} />
                                    <TextInput
                                        style={[styles.textInput, { color: theme.text }]}
                                        placeholder="Ej. 12"
                                        placeholderTextColor={theme.textMuted}
                                        keyboardType="numeric"
                                        value={form.age_months}
                                        onChangeText={(t) => updateField('age_months', t)}
                                        onFocus={() => setFocusedInput('age_months')}
                                        onBlur={() => setFocusedInput(null)}
                                    />
                                </View>
                            </View>
                            <View style={{ width: 12 }} />
                            <View style={{ flex: 1 }}>
                                <FormSelect
                                    label="Género"
                                    options={GENDER_OPTIONS}
                                    value={form.gender}
                                    onChange={(v) => updateField('gender', v)}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.text }]}>Descripción *</Text>
                            <View style={[
                                styles.inputContainer,
                                styles.textAreaContainer,
                                { 
                                    backgroundColor: theme.inputBg, 
                                    borderColor: focusedInput === 'description' ? theme.primary : theme.borderLight,
                                    borderWidth: focusedInput === 'description' ? 1.5 : 1,
                                }
                            ]}>
                                <FileText size={18} color={focusedInput === 'description' ? theme.primary : theme.textMuted} style={{ marginTop: 2 }} />
                                <TextInput
                                    style={[styles.textInput, styles.textArea, { color: theme.text }]}
                                    placeholder="Cuéntanos un poco de tu mascota..."
                                    placeholderTextColor={theme.textMuted}
                                    multiline
                                    numberOfLines={4}
                                    value={form.description}
                                    onChangeText={(t) => updateField('description', t)}
                                    onFocus={() => setFocusedInput('description')}
                                    onBlur={() => setFocusedInput(null)}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Health Card */}
                    <View style={[styles.formCard, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
                        <Text style={[styles.sectionTitle, { color: theme.primary }]}>SALUD Y REGISTRO</Text>
                        
                        <FormSwitch
                            label="Vacunado"
                            value={form.is_vaccinated}
                            onChange={(v) => updateField('is_vaccinated', v)}
                        />
                        <FormSwitch
                            label="Esterilizado"
                            value={form.is_sterilized}
                            onChange={(v) => updateField('is_sterilized', v)}
                        />
                        <FormSwitch
                            label="Desparasitado"
                            value={form.is_dewormed}
                            onChange={(v) => updateField('is_dewormed', v)}
                        />

                        <View style={styles.row}>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.label, { color: theme.text }]}>Peso (kg)</Text>
                                <View style={[
                                    styles.inputContainer,
                                    { 
                                        backgroundColor: theme.inputBg, 
                                        borderColor: focusedInput === 'weight_kg' ? theme.primary : theme.borderLight,
                                        borderWidth: focusedInput === 'weight_kg' ? 1.5 : 1,
                                    }
                                ]}>
                                    <Weight size={18} color={focusedInput === 'weight_kg' ? theme.primary : theme.textMuted} />
                                    <TextInput
                                        style={[styles.textInput, { color: theme.text }]}
                                        placeholder="Ej. 12.5"
                                        placeholderTextColor={theme.textMuted}
                                        keyboardType="decimal-pad"
                                        value={form.weight_kg}
                                        onChangeText={(t) => updateField('weight_kg', t)}
                                        onFocus={() => setFocusedInput('weight_kg')}
                                        onBlur={() => setFocusedInput(null)}
                                    />
                                </View>
                            </View>
                            <View style={{ width: 12 }} />
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.label, { color: theme.text }]}>Microchip</Text>
                                <View style={[
                                    styles.inputContainer,
                                    { 
                                        backgroundColor: theme.inputBg, 
                                        borderColor: focusedInput === 'microchip_id' ? theme.primary : theme.borderLight,
                                        borderWidth: focusedInput === 'microchip_id' ? 1.5 : 1,
                                    }
                                ]}>
                                    <Cpu size={18} color={focusedInput === 'microchip_id' ? theme.primary : theme.textMuted} />
                                    <TextInput
                                        style={[styles.textInput, { color: theme.text }]}
                                        placeholder="Opcional"
                                        placeholderTextColor={theme.textMuted}
                                        value={form.microchip_id}
                                        onChangeText={(t) => updateField('microchip_id', t)}
                                        onFocus={() => setFocusedInput('microchip_id')}
                                        onBlur={() => setFocusedInput(null)}
                                    />
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>

                {/* Footer */}
                <View style={[styles.footer, { borderTopColor: theme.borderLight }]}>
                    <TouchableOpacity
                        style={[styles.saveBtn, { backgroundColor: theme.primary }, isUpdating && { opacity: 0.7 }]}
                        onPress={handleUpdate}
                        disabled={isUpdating}
                    >
                        {isUpdating ? (
                            <Text style={styles.saveBtnText}>Guardando...</Text>
                        ) : (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <Check size={20} color="#fff" />
                                <Text style={styles.saveBtnText}>Guardar Cambios</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </ScreenContainer>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    scroll: {
        padding: 16,
        paddingBottom: 32,
    },
    formCard: {
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        marginBottom: 20,
        gap: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
    },
    photoCard: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 24,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 1,
        marginBottom: 8,
    },
    inputGroup: {
        marginBottom: 4,
    },
    label: {
        fontSize: 12,
        fontWeight: '800',
        marginBottom: 6,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 56,
        borderRadius: 16,
        paddingHorizontal: 16,
        borderWidth: 1,
        gap: 12,
    },
    textInput: {
        flex: 1,
        height: '100%',
        fontSize: 15,
        fontWeight: '500',
    },
    textAreaContainer: {
        height: 120,
        alignItems: 'flex-start',
        paddingVertical: 14,
    },
    textArea: {
        textAlignVertical: 'top',
        height: '100%',
    },
    row: {
        flexDirection: 'row',
    },
    footer: {
        padding: 20,
        paddingBottom: 36,
        borderTopWidth: 1,
    },
    saveBtn: {
        height: 58,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 3,
    },
    saveBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
    },
});
