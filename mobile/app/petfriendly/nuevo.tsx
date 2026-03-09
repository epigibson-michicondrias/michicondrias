import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker, UrlTile, PROVIDER_DEFAULT } from 'react-native-maps';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ChevronLeft, Camera, MapPin, Check, Plus, Coffee, Utensils, TreePine, ShoppingBag, Droplets, UtensilsCrossed, Info } from 'lucide-react-native';
import { createPlace, getPetfriendlyPresignedUrl } from '../../src/services/petfriendly';
import { useAuth } from '../../src/contexts/AuthContext';

const { width } = Dimensions.get('window');

const CATEGORIES = [
    { id: 'Restaurante', icon: Utensils, color: '#f87171' },
    { id: 'Cafetería', icon: Coffee, color: '#fbbf24' },
    { id: 'Parque', icon: TreePine, color: '#4ade80' },
    { id: 'Tienda', icon: ShoppingBag, color: '#60a5fa' },
];

const SIZES = ['Pequeño', 'Mediano', 'Grande', 'Todos'];

export default function NuevoLugarScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState<string | null>(null);
    const [location, setLocation] = useState<{ latitude: number, longitude: number } | null>(null);
    const [form, setForm] = useState({
        name: '',
        category: 'Restaurante',
        address: '',
        phone: '',
        website: '',
        description: '',
        pet_sizes_allowed: 'Todos',
        has_water_bowls: 'No',
        has_pet_menu: 'No',
    });

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;
            let loc = await Location.getCurrentPositionAsync({});
            setLocation({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
            });
        })();
    }, []);

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
        if (!form.name) return Alert.alert("Error", "El nombre del lugar es obligatorio");
        if (!location) return Alert.alert("Error", "Debes marcar la ubicación en el mapa");
        if (!user) return Alert.alert("Error", "Debes estar autenticado");

        setLoading(true);
        try {
            let image_url = null;

            if (image) {
                const ext = image.split('.').pop();
                const { url, object_key } = await getPetfriendlyPresignedUrl(ext || 'jpg');

                const response = await fetch(image);
                const blob = await response.blob();

                await fetch(url, {
                    method: 'PUT',
                    body: blob,
                    headers: { 'Content-Type': `image/${ext}` }
                });

                image_url = `https://michicondrias-storage-1.s3.us-east-1.amazonaws.com/${object_key}`;
            }

            await createPlace({
                ...form,
                added_by: user.id,
                latitude: location.latitude,
                longitude: location.longitude,
                image_url,
                rating: 5.0, // Default rating for new places
            });

            Alert.alert("¡Gracias!", "Has contribuido a que más michis y lomitos encuentren lugares geniales.");
            router.back();
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "No se pudo registrar el lugar.");
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
                    <Text style={[styles.title, { color: theme.text }]}>Registrar Lugar Pet Friendly</Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                    <TouchableOpacity style={styles.imageSelector} onPress={pickImage}>
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
                            style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
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
                                    <cat.icon size={18} color={form.category === cat.id ? '#fff' : cat.color} />
                                    <Text style={[styles.catText, { color: form.category === cat.id ? '#fff' : theme.text }]}>{cat.id}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <Text style={[styles.label, { color: theme.text }]}>Ubicación en el Mapa</Text>
                        <View style={styles.mapWrapper}>
                            <MapView
                                provider={PROVIDER_DEFAULT}
                                style={styles.map}
                                initialRegion={{
                                    latitude: location?.latitude || 19.4326,
                                    longitude: location?.longitude || -99.1332,
                                    latitudeDelta: 0.0122,
                                    longitudeDelta: 0.0121,
                                }}
                                onRegionChangeComplete={(region) => {
                                    setLocation({
                                        latitude: region.latitude,
                                        longitude: region.longitude
                                    });
                                }}
                                mapType="none"
                            >
                                <UrlTile
                                    urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    maximumZ={19}
                                    flipY={false}
                                />
                                {location && (
                                    <Marker
                                        coordinate={location}
                                        draggable
                                        onDragEnd={(e) => setLocation(e.nativeEvent.coordinate)}
                                    />
                                )}
                            </MapView>
                            <View style={styles.mapOverlay} pointerEvents="none">
                                <MapPin size={32} color={theme.primary} />
                            </View>
                        </View>

                        <Text style={[styles.label, { color: theme.text }]}>Dirección (Opcional)</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
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
                                {form.has_water_bowls === 'Sí' && <View style={styles.checkBadge}><Check size={10} color="#fff" /></View>}
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.amenityBtn, { backgroundColor: theme.surface }, form.has_pet_menu === 'Sí' && { borderColor: theme.primary }]}
                                onPress={() => setForm({ ...form, has_pet_menu: form.has_pet_menu === 'Sí' ? 'No' : 'Sí' })}
                            >
                                <UtensilsCrossed size={20} color={form.has_pet_menu === 'Sí' ? theme.primary : theme.textMuted} />
                                <Text style={[styles.amenityText, { color: theme.text }]}>Menú para mascotas</Text>
                                {form.has_pet_menu === 'Sí' && <View style={styles.checkBadge}><Check size={10} color="#fff" /></View>}
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
                            style={[styles.input, styles.textArea, { backgroundColor: theme.surface, color: theme.text }]}
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
        borderColor: 'rgba(255,255,255,0.05)',
    },
    catText: {
        fontSize: 14,
        fontWeight: '700',
    },
    mapWrapper: {
        height: 200,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
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
        borderColor: 'rgba(255,255,255,0.05)',
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
        backgroundColor: '#6366f1',
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
        borderColor: 'rgba(255,255,255,0.05)',
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
        shadowColor: '#6366f1',
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
