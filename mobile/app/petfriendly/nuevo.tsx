import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import WebMapView from '../../src/components/WebMapView';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/src/hooks/useTheme';
import { Camera, MapPin, Check, Plus, Coffee, Utensils, TreePine, ShoppingBag, Droplets, UtensilsCrossed, Info } from 'lucide-react-native';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { showAlert } from '@/src/components/AppAlert';
import { createPlace, getPetfriendlyPresignedUrl } from '../../src/services/petfriendly';
import { useAuth } from '../../src/contexts/AuthContext';
import { getS3Url, getFileExtension } from '@/src/utils/helpers';
import { uploadImageToPresignedUrl } from '@/src/utils/upload';

const { width } = Dimensions.get('window');

const CATEGORIES = [
    { id: 'Restaurante', icon: Utensils },
    { id: 'Cafetería', icon: Coffee },
    { id: 'Parque', icon: TreePine },
    { id: 'Tienda', icon: ShoppingBag },
];

const SIZES = ['Pequeño', 'Mediano', 'Grande', 'Todos'];

export default function NuevoLugarScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { theme, isDark } = useTheme();

    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState<string | null>(null);
    const [location, setLocation] = useState<{ latitude: number, longitude: number } | null>(null);
    const [form, setForm] = useState({
        name: '',
        category: 'Restaurante',
        address: '',
        city: '',
        phone: '',
        website: '',
        description: '',
        pet_sizes_allowed: 'Todos',
        has_water_bowls: 'No',
        has_pet_menu: 'No',
    });

    const locate = async () => {
        {
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    showAlert({ type: 'warning', title: 'Permiso denegado', message: 'Activa la ubicación para registrar el lugar en el mapa.' });
                    return;
                }
                let loc = await Location.getCurrentPositionAsync({});
                setLocation({
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                });
            } catch (error) {
                showAlert({ type: 'warning', title: 'Ubicación no disponible', message: 'No pudimos obtener tu ubicación. Revisa que el GPS esté activo e inténtalo de nuevo.' });
            }
        }
    };

    useEffect(() => { locate(); }, []);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        if (!form.name.trim()) return showAlert({ type: 'error', title: 'Falta el nombre', message: 'El nombre del lugar es obligatorio.' });
        if (!location) return showAlert({ type: 'error', title: 'Falta la ubicación', message: 'Necesitamos tu ubicación para ubicar el lugar en el mapa. Toca "Usar mi ubicación actual".' });
        if (form.website.trim() && !/^https?:\/\//i.test(form.website.trim())) return showAlert({ type: 'error', title: 'Sitio web inválido', message: 'El enlace debe empezar con http:// o https://' });
        if (form.phone.trim() && form.phone.replace(/\D/g, '').length < 10) return showAlert({ type: 'error', title: 'Teléfono inválido', message: 'Escribe un teléfono de 10 dígitos.' });
        if (!user) return showAlert({ type: 'error', title: 'Error', message: 'Debes estar autenticado' });

        setLoading(true);
        try {
            let image_url = null;

            if (image) {
                const ext = getFileExtension(image);
                const { url, object_key } = await getPetfriendlyPresignedUrl(ext);
                await uploadImageToPresignedUrl(image, url, ext);

                image_url = getS3Url(object_key);
            }

            await createPlace({
                ...form,
                name: form.name.trim(),
                address: form.address.trim() || null,
                city: form.city.trim() || null,
                phone: form.phone.trim() || null,
                website: form.website.trim() || null,
                description: form.description.trim() || null,
                pet_sizes_allowed: form.pet_sizes_allowed.toLowerCase(),
                has_water_bowls: form.has_water_bowls === 'Sí' ? 'si' : 'no',
                has_pet_menu: form.has_pet_menu === 'Sí' ? 'si' : 'no',
                latitude: location.latitude,
                longitude: location.longitude,
                image_url,
            });

            queryClient.invalidateQueries({ queryKey: ['petfriendly-places'] });
            showAlert({ type: 'success', title: '¡Gracias!', message: 'Has contribuido a que más michis y lomitos encuentren lugares geniales.' });
            router.back();
        } catch (error) {
            showAlert({ type: 'error', title: 'No se pudo registrar el lugar', message: error instanceof Error ? error.message : 'Inténtalo de nuevo.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <ScreenHeader title="Registrar lugar" subtitle="Pet friendly" />

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                    <TouchableOpacity style={styles.imageSelector} onPress={pickImage} accessibilityRole="button" accessibilityLabel="Elegir foto de portada">
                        {image ? (
                            <Image source={{ uri: image }} style={styles.selectedImage} />
                        ) : (
                            <View style={[styles.imagePlaceholder, { backgroundColor: theme.surface }]}>
                                <Camera size={32} color={theme.textMuted} />
                                <Text style={[styles.imagePlaceholderText, { color: theme.textMuted }]}>Subir Foto de Portada</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <View style={styles.form}>
                        <Text style={[styles.label, { color: theme.text }]}>Nombre del Establecimiento</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                            placeholder="Ej. El Michi Café"
                            placeholderTextColor={theme.textMuted}
                            value={form.name}
                            onChangeText={(t) => setForm({ ...form, name: t })}
                        />

                        <Text style={[styles.label, { color: theme.text }]}>Categoría</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
                            {CATEGORIES.map((cat) => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[
                                        styles.catBtn,
                                        { backgroundColor: theme.surface },
                                        form.category === cat.id && { backgroundColor: theme.primary, borderColor: theme.primary }
                                    ]}
                                    onPress={() => setForm({ ...form, category: cat.id })}
                                >
                                    <cat.icon size={18} color={form.category === cat.id ? '#fff' : theme.primary} />
                                    <Text style={[styles.catText, { color: form.category === cat.id ? '#fff' : theme.text }]}>{cat.id}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <Text style={[styles.label, { color: theme.text }]}>Ubicación</Text>
                        <Text style={{ color: theme.textMuted, fontSize: 12, marginBottom: 8 }}>
                            Se usa tu posición actual: regístralo estando en el lugar.
                        </Text>
                        <View style={styles.mapWrapper}>
                            <WebMapView
                                style={styles.map}
                                initialLatitude={location?.latitude || 19.4326}
                                initialLongitude={location?.longitude || -99.1332}
                                initialZoom={15}
                                markers={location ? [{
                                    id: 'current',
                                    latitude: location.latitude,
                                    longitude: location.longitude,
                                    title: 'Ubicación seleccionada',
                                    color: theme.primary,
                                }] : []}
                            />
                        </View>

                        <TouchableOpacity
                            accessibilityRole="button"
                            accessibilityLabel="Usar mi ubicación actual"
                            onPress={locate}
                            style={{ alignSelf: 'flex-start', marginBottom: 16 }}
                        >
                            <Text style={{ color: theme.primary, fontWeight: '800' }}>{location ? 'Actualizar mi ubicación' : 'Usar mi ubicación actual'}</Text>
                        </TouchableOpacity>

                        <Text style={[styles.label, { color: theme.text }]}>Ciudad</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                            placeholder="Ej. Ciudad de México"
                            placeholderTextColor={theme.textMuted}
                            value={form.city}
                            onChangeText={(t) => setForm({ ...form, city: t })}
                        />

                        <Text style={[styles.label, { color: theme.text }]}>Teléfono (Opcional)</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                            placeholder="10 dígitos"
                            placeholderTextColor={theme.textMuted}
                            keyboardType="phone-pad"
                            value={form.phone}
                            onChangeText={(t) => setForm({ ...form, phone: t })}
                        />

                        <Text style={[styles.label, { color: theme.text }]}>Sitio web (Opcional)</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                            placeholder="https://..."
                            placeholderTextColor={theme.textMuted}
                            autoCapitalize="none"
                            keyboardType="url"
                            value={form.website}
                            onChangeText={(t) => setForm({ ...form, website: t })}
                        />

                        <Text style={[styles.label, { color: theme.text }]}>Dirección (Opcional)</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                            placeholder="Ej. Calle 123, Col. Centro"
                            placeholderTextColor={theme.textMuted}
                            value={form.address}
                            onChangeText={(t) => setForm({ ...form, address: t })}
                        />

                        <Text style={[styles.label, { color: theme.text }]}>Servicios Petfriendly</Text>
                        <View style={styles.amenitiesGrid}>
                            <TouchableOpacity
                                style={[styles.amenityBtn, { backgroundColor: theme.surface }, form.has_water_bowls === 'Sí' && { borderColor: theme.primary }]}
                                onPress={() => setForm({ ...form, has_water_bowls: form.has_water_bowls === 'Sí' ? 'No' : 'Sí' })}
                            >
                                <Droplets size={20} color={form.has_water_bowls === 'Sí' ? theme.primary : theme.textMuted} />
                                <Text style={[styles.amenityText, { color: theme.text }]}>Platos con agua</Text>
                                {form.has_water_bowls === 'Sí' && <View style={[styles.checkBadge, { backgroundColor: theme.primary }]}><Check size={10} color="#fff" /></View>}
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.amenityBtn, { backgroundColor: theme.surface }, form.has_pet_menu === 'Sí' && { borderColor: theme.primary }]}
                                onPress={() => setForm({ ...form, has_pet_menu: form.has_pet_menu === 'Sí' ? 'No' : 'Sí' })}
                            >
                                <UtensilsCrossed size={20} color={form.has_pet_menu === 'Sí' ? theme.primary : theme.textMuted} />
                                <Text style={[styles.amenityText, { color: theme.text }]}>Menú para mascotas</Text>
                                {form.has_pet_menu === 'Sí' && <View style={[styles.checkBadge, { backgroundColor: theme.primary }]}><Check size={10} color="#fff" /></View>}
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.label, { color: theme.text }]}>Tamaños Permitidos</Text>
                        <View style={styles.sizeRow}>
                            {SIZES.map((size) => (
                                <TouchableOpacity
                                    key={size}
                                    style={[
                                        styles.sizeBtn,
                                        { backgroundColor: theme.surface },
                                        form.pet_sizes_allowed === size && { backgroundColor: theme.primary, borderColor: theme.primary }
                                    ]}
                                    onPress={() => setForm({ ...form, pet_sizes_allowed: size })}
                                >
                                    <Text style={[styles.sizeText, { color: form.pet_sizes_allowed === size ? '#fff' : theme.textMuted }]}>{size}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={[styles.label, { color: theme.text }]}>Descripción y Tips</Text>
                        <TextInput
                            style={[styles.input, styles.textArea, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                            placeholder="Cosas que otros dueños deberían saber..."
                            placeholderTextColor={theme.textMuted}
                            multiline
                            numberOfLines={4}
                            value={form.description}
                            onChangeText={(t) => setForm({ ...form, description: t })}
                        />
                    </View>
                </ScrollView>

                <View style={[styles.footer, { borderTopColor: theme.border }]}>
                    <TouchableOpacity
                        style={[styles.saveBtn, { backgroundColor: theme.primary }, loading && { opacity: 0.7 }]}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <Text style={styles.saveBtnText}>Registrando...</Text>
                        ) : (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <Check size={20} color="#fff" />
                                <Text style={styles.saveBtnText}>Publicar Lugar</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
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
    title: {
        fontSize: 18,
        fontWeight: '900',
    },
    scroll: {
        padding: 24,
    },
    imageSelector: {
        width: '100%',
        height: 180,
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 32,
    },
    imagePlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(128,128,128,0.2)',
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
        borderColor: 'rgba(128,128,128,0.2)',
    },
    categoryRow: {
        gap: 10,
        paddingBottom: 4,
    },
    catBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 16,
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(128,128,128,0.2)',
    },
    catText: {
        fontSize: 14,
        fontWeight: '700',
    },
    mapWrapper: {
        height: 200,
        borderRadius: 24,
        overflow: 'hidden',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    mapOverlay: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -30,
        marginLeft: -12,
        pointerEvents: 'none',
    },
    amenitiesGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    amenityBtn: {
        flex: 1,
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(128,128,128,0.2)',
        alignItems: 'center',
        gap: 8,
    },
    amenityText: {
        fontSize: 11,
        fontWeight: '700',
        textAlign: 'center',
    },
    checkBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
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
        borderColor: 'rgba(128,128,128,0.2)',
    },
    sizeText: {
        fontSize: 12,
        fontWeight: '700',
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
        height: 64,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
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
});
