import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ChevronLeft, Camera, Dog, Cat, Check } from 'lucide-react-native';
import { createPet, getMascotasPresignedUrl } from '../../src/services/mascotas';
import { useAuth } from '../../src/contexts/AuthContext';

export default function NuevaMascotaScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState<string | null>(null);
    const [form, setForm] = useState({
        name: '',
        species: 'perro',
        breed: '',
        age_months: '',
        gender: 'macho',
        description: '',
        is_vaccinated: false,
        is_sterilized: false,
        is_dewormed: false,
        weight_kg: '',
        microchip_number: '',
    });

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        if (!form.name) return Alert.alert("Error", "El nombre es obligatorio");
        if (!user) return Alert.alert("Error", "Debes estar autenticado");

        setLoading(true);
        try {
            let photo_url = null;

            if (image) {
                const ext = image.split('.').pop();
                const { url, object_key } = await getMascotasPresignedUrl(ext || 'jpg');

                const response = await fetch(image);
                const blob = await response.blob();

                await fetch(url, {
                    method: 'PUT',
                    body: blob,
                    headers: { 'Content-Type': `image/${ext}` }
                });

                photo_url = `https://michicondrias-storage-1.s3.us-east-1.amazonaws.com/${object_key}`;
            }

            await createPet({
                ...form,
                owner_id: user.id,
                age_months: form.age_months ? parseInt(form.age_months) : undefined,
                weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : undefined,
                photo_url,
            } as any);

            Alert.alert("¡Éxito!", `${form.name} ha sido registrado correctamente.`);
            router.back();
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "No se pudo registrar la mascota.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <ChevronLeft size={24} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: theme.text }]}>Nueva Mascota</Text>
                    <View style={{ width: 44 }} />
                </View>

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
                        <Text style={[styles.label, { color: theme.text }]}>Nombre</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                            placeholder="Ej. Firulais"
                            placeholderTextColor={theme.textMuted}
                            value={form.name}
                            onChangeText={(t) => setForm({ ...form, name: t })}
                        />

                        <Text style={[styles.label, { color: theme.text }]}>Especie</Text>
                        <View style={styles.speciesRow}>
                            <TouchableOpacity
                                style={[styles.choiceBtn, form.species === 'perro' && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                                onPress={() => setForm({ ...form, species: 'perro' })}
                            >
                                <Dog size={20} color={form.species === 'perro' ? '#fff' : theme.textMuted} />
                                <Text style={[styles.choiceText, { color: form.species === 'perro' ? '#fff' : theme.textMuted }]}>Perro</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.choiceBtn, form.species === 'gato' && { backgroundColor: theme.secondary, borderColor: theme.secondary }]}
                                onPress={() => setForm({ ...form, species: 'gato' })}
                            >
                                <Cat size={20} color={form.species === 'gato' ? '#fff' : theme.textMuted} />
                                <Text style={[styles.choiceText, { color: form.species === 'gato' ? '#fff' : theme.textMuted }]}>Gato</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.label, { color: theme.text }]}>Raza (Opcional)</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                            placeholder="Ej. Husky Siberiano"
                            placeholderTextColor={theme.textMuted}
                            value={form.breed}
                            onChangeText={(t) => setForm({ ...form, breed: t })}
                        />

                        <View style={styles.row}>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.label, { color: theme.text }]}>Edad (Meses)</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                                    placeholder="Ej. 12"
                                    placeholderTextColor={theme.textMuted}
                                    keyboardType="numeric"
                                    value={form.age_months}
                                    onChangeText={(t) => setForm({ ...form, age_months: t })}
                                />
                            </View>
                            <View style={{ width: 20 }} />
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.label, { color: theme.text }]}>Género</Text>
                                <View style={styles.genderRow}>
                                    <TouchableOpacity
                                        style={[styles.genderBtn, form.gender === 'macho' && { backgroundColor: theme.primary }]}
                                        onPress={() => setForm({ ...form, gender: 'macho' })}
                                    >
                                        <Text style={[styles.genderBtnText, { color: form.gender === 'macho' ? '#fff' : theme.textMuted }]}>♂️</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.genderBtn, form.gender === 'hembra' && { backgroundColor: theme.secondary }]}
                                        onPress={() => setForm({ ...form, gender: 'hembra' })}
                                    >
                                        <Text style={[styles.genderBtnText, { color: form.gender === 'hembra' ? '#fff' : theme.textMuted }]}>♀️</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        <Text style={[styles.label, { color: theme.text }]}>Descripción</Text>
                        <TextInput
                            style={[styles.input, styles.textArea, { backgroundColor: theme.surface, color: theme.text }]}
                            placeholder="Cuéntanos un poco de tu mascota..."
                            placeholderTextColor={theme.textMuted}
                            multiline
                            numberOfLines={4}
                            value={form.description}
                            onChangeText={(t) => setForm({ ...form, description: t })}
                        />

                        <Text style={[styles.label, { color: theme.text, marginTop: 10 }]}>🩺 Salud y Registro</Text>
                        <View style={styles.healthGrid}>
                            <HealthCheck
                                label="Vacunado"
                                active={form.is_vaccinated}
                                onPress={() => setForm({ ...form, is_vaccinated: !form.is_vaccinated })}
                                theme={theme}
                            />
                            <HealthCheck
                                label="Esterilizado"
                                active={form.is_sterilized}
                                onPress={() => setForm({ ...form, is_sterilized: !form.is_sterilized })}
                                theme={theme}
                            />
                            <HealthCheck
                                label="Desparasitado"
                                active={form.is_dewormed}
                                onPress={() => setForm({ ...form, is_dewormed: !form.is_dewormed })}
                                theme={theme}
                            />
                        </View>

                        <View style={styles.row}>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.label, { color: theme.text }]}>Peso (kg)</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                                    placeholder="Ej. 12.5"
                                    placeholderTextColor={theme.textMuted}
                                    keyboardType="numeric"
                                    value={form.weight_kg}
                                    onChangeText={(t) => setForm({ ...form, weight_kg: t })}
                                />
                            </View>
                            <View style={{ width: 20 }} />
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.label, { color: theme.text }]}>Microchip</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                                    placeholder="Opcional"
                                    placeholderTextColor={theme.textMuted}
                                    value={form.microchip_number}
                                    onChangeText={(t) => setForm({ ...form, microchip_number: t })}
                                />
                            </View>
                        </View>
                    </View>
                </ScrollView>

                <View style={[styles.footer, { borderTopColor: theme.border }]}>
                    <TouchableOpacity
                        style={[styles.saveBtn, { backgroundColor: theme.primary }, loading && { opacity: 0.7 }]}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <Text style={styles.saveBtnText}>Guardando...</Text>
                        ) : (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <Check size={20} color="#fff" />
                                <Text style={styles.saveBtnText}>Registrar Mascota</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

function HealthCheck({ label, active, onPress, theme }: any) {
    return (
        <TouchableOpacity
            style={[styles.healthBadge, { backgroundColor: active ? theme.primary : theme.surface }]}
            onPress={onPress}
        >
            <Text style={[styles.healthText, { color: active ? '#fff' : theme.textMuted }]}>{label}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '900',
    },
    scroll: {
        padding: 24,
    },
    imageSelector: {
        alignSelf: 'center',
        width: 150,
        height: 150,
        borderRadius: 75,
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
        shadowColor: '#7c3aed',
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
    healthGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 8,
    },
    healthBadge: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    healthText: {
        fontSize: 13,
        fontWeight: '700',
    }
});
