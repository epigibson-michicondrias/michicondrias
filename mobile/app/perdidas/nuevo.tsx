import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform, Dimensions, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ChevronLeft, Camera, MapPin, AlertCircle, Check, Search, Phone, Mail, Info, Fingerprint, Scale, Calendar, ChevronDown } from 'lucide-react-native';
import { createReport, getPerdidasPresignedUrl } from '../../src/services/perdidas';
import { useAuth } from '../../src/contexts/AuthContext';

const { width } = Dimensions.get('window');

export default function NuevoReporteScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState<string | null>(null);
    const [location, setLocation] = useState<{ latitude: number, longitude: number } | null>(null);
    const [form, setForm] = useState({
        pet_name: '',
        report_type: 'lost' as 'lost' | 'found',
        species: 'gato',
        breed: '',
        color: '',
        size: 'mediano',
        age_approx: 'joven',
        last_seen_location: '',
        description: '',
        contact_phone: '',
        contact_email: user?.email || '',
    });

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permiso denegado', 'Necesitamos tu ubicación para marcar el reporte.');
                return;
            }

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
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        if (!form.pet_name) return Alert.alert("Error", "El nombre o descripción corta es obligatorio");
        if (!location) return Alert.alert("Error", "Debes marcar la ubicación en el mapa");
        if (!user) return Alert.alert("Error", "Debes estar autenticado");

        setLoading(true);
        try {
            let image_url = null;

            if (image) {
                const ext = image.split('.').pop();
                const { url, object_key } = await getPerdidasPresignedUrl(ext || 'jpg');

                const response = await fetch(image);
                const blob = await response.blob();

                await fetch(url, {
                    method: 'PUT',
                    body: blob,
                    headers: { 'Content-Type': `image/${ext}` }
                });

                image_url = `https://michicondrias-storage-1.s3.us-east-1.amazonaws.com/${object_key}`;
            }

            await createReport({
                ...form,
                reporter_id: user.id,
                latitude: location.latitude,
                longitude: location.longitude,
                image_url,
                status: 'active',
            });

            Alert.alert("¡Reporte Enviado!", "La comunidad ha sido notificada. Gracias por ayudar.");
            router.back();
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "No se pudo crear el reporte.");
        } finally {
            setLoading(false);
        }
    };

    const renderSelector = (label: string, value: string, options: string[], field: string) => (
        <View style={styles.selectorGroup}>
            <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
            <View style={styles.optionsRow}>
                {options.map(opt => (
                    <TouchableOpacity
                        key={opt}
                        style={[
                            styles.optionBtn,
                            { backgroundColor: theme.surface },
                            form[field as keyof typeof form] === opt && { backgroundColor: theme.primary, borderColor: theme.primary }
                        ]}
                        onPress={() => setForm({ ...form, [field]: opt })}
                    >
                        <Text style={[styles.optionText, { color: theme.textMuted }, form[field as keyof typeof form] === opt && { color: '#fff' }]}>
                            {opt.charAt(0).toUpperCase() + opt.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={styles.header}>
                    <TouchableOpacity style={[styles.backBtn, { backgroundColor: theme.surface }]} onPress={() => router.back()}>
                        <ChevronLeft size={24} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: theme.text }]}>Nuevo Reporte</Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                    <View style={styles.typeSelector}>
                        <TouchableOpacity
                            style={[
                                styles.typeBtn,
                                form.report_type === 'lost' && { backgroundColor: '#ef4444', borderColor: '#ef4444' }
                            ]}
                            onPress={() => setForm({ ...form, report_type: 'lost' })}
                        >
                            <AlertCircle size={20} color={form.report_type === 'lost' ? '#fff' : theme.textMuted} />
                            <Text style={[styles.typeText, { color: form.report_type === 'lost' ? '#fff' : theme.textMuted }]}>LO PERDÍ</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.typeBtn,
                                form.report_type === 'found' && { backgroundColor: '#6366f1', borderColor: '#6366f1' }
                            ]}
                            onPress={() => setForm({ ...form, report_type: 'found' })}
                        >
                            <Search size={20} color={form.report_type === 'found' ? '#fff' : theme.textMuted} />
                            <Text style={[styles.typeText, { color: form.report_type === 'found' ? '#fff' : theme.textMuted }]}>LO ENCONTRÉ</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.imageSelector} onPress={pickImage}>
                        {image ? (
                            <Image source={{ uri: image }} style={styles.selectedImage} />
                        ) : (
                            <View style={[styles.imagePlaceholder, { backgroundColor: theme.surface }]}>
                                <Camera size={40} color={theme.textMuted} />
                                <Text style={[styles.imagePlaceholderText, { color: theme.textMuted }]}>Subir Foto (Muy recomendado)</Text>
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
                                placeholder="Ej. Firulais / Perro salchicha café"
                                placeholderTextColor={theme.textMuted}
                                value={form.pet_name}
                                onChangeText={(t) => setForm({ ...form, pet_name: t })}
                            />
                        </View>

                        {renderSelector("Especie", form.species, ['perro', 'gato', 'otro'], 'species')}

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={[styles.label, { color: theme.text }]}>Raza</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                                    placeholder="Ej. Husky"
                                    placeholderTextColor={theme.textMuted}
                                    value={form.breed}
                                    onChangeText={(t) => setForm({ ...form, breed: t })}
                                />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={[styles.label, { color: theme.text }]}>Color</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                                    placeholder="Ej. Blanco / Negro"
                                    placeholderTextColor={theme.textMuted}
                                    value={form.color}
                                    onChangeText={(t) => setForm({ ...form, color: t })}
                                />
                            </View>
                        </View>

                        {renderSelector("Tamaño", form.size, ['pequeño', 'mediano', 'grande'], 'size')}
                        {renderSelector("Edad aproximada", form.age_approx, ['cachorro', 'joven', 'adulto', 'viejito'], 'age_approx')}

                        <Separator color={theme.border} />

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.text }]}>¿Dónde se vió por última vez?</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                                placeholder="Ej. Parque México"
                                placeholderTextColor={theme.textMuted}
                                value={form.last_seen_location}
                                onChangeText={(t) => setForm({ ...form, last_seen_location: t })}
                            />
                        </View>

                        <Text style={[styles.label, { color: theme.text }]}>Marca en el mapa (Arrastra o presiona)</Text>
                        <View style={[styles.mapWrapper, { borderColor: theme.border }]}>
                            {location && (
                                <MapView
                                    style={styles.map}
                                    region={{
                                        latitude: location.latitude,
                                        longitude: location.longitude,
                                        latitudeDelta: 0.005,
                                        longitudeDelta: 0.005,
                                    }}
                                    onPress={(e) => setLocation(e.nativeEvent.coordinate)}
                                    customMapStyle={mapStyle}
                                >
                                    <Marker coordinate={location} draggable />
                                </MapView>
                            )}
                            <View style={styles.mapOverlay} pointerEvents="none">
                                <MapPin size={32} color={form.report_type === 'lost' ? '#ef4444' : '#6366f1'} />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.text }]}>Teléfono de Contacto</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                                placeholder="Tus 10 dígitos"
                                keyboardType="phone-pad"
                                placeholderTextColor={theme.textMuted}
                                value={form.contact_phone}
                                onChangeText={(t) => setForm({ ...form, contact_phone: t })}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.text }]}>Detalles Extra</Text>
                            <TextInput
                                style={[styles.input, styles.textArea, { backgroundColor: theme.surface, color: theme.text }]}
                                placeholder="Comportamiento, señas particulares, si responde a su nombre..."
                                placeholderTextColor={theme.textMuted}
                                multiline
                                numberOfLines={4}
                                value={form.description}
                                onChangeText={(t) => setForm({ ...form, description: t })}
                            />
                        </View>
                    </View>
                </ScrollView>

                <View style={[styles.footer, { borderTopColor: theme.border }]}>
                    <TouchableOpacity
                        style={[
                            styles.saveBtn,
                            { backgroundColor: form.report_type === 'lost' ? '#ef4444' : '#6366f1' },
                            loading && { opacity: 0.7 }
                        ]}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <Check size={20} color="#fff" />
                                <Text style={styles.saveBtnText}>Publicar Reporte</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const Separator = ({ color }: { color: string }) => (
    <View style={{ height: 1, backgroundColor: color, marginVertical: 16 }} />
);

const mapStyle = [
    { "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] },
    { "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }] },
    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#242f3e" }] },
    { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
    { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
    { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#263c3f" }] },
    { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#6b9a76" }] },
    { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#38414e" }] },
    { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#212a37" }] },
    { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#9ca5b3" }] },
    { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#746855" }] },
    { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#1f2835" }] },
    { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#f3d19c" }] },
    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#17263c" }] },
    { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#515c6d" }] },
    { "featureType": "water", "elementType": "labels.text.stroke", "stylers": [{ "color": "#17263c" }] }
];

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 20,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    title: {
        fontSize: 20,
        fontWeight: '900',
    },
    scroll: {
        padding: 24,
    },
    typeSelector: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 32,
    },
    typeBtn: {
        flex: 1,
        height: 60,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    typeText: {
        fontSize: 13,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    imageSelector: {
        width: '100%',
        height: 250,
        borderRadius: 32,
        overflow: 'hidden',
        marginBottom: 32,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    imagePlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.02)',
    },
    imagePlaceholderText: {
        fontSize: 12,
        fontWeight: '700',
        marginTop: 12,
    },
    selectedImage: {
        width: '100%',
        height: '100%',
    },
    imageEditBadge: {
        position: 'absolute',
        bottom: 20,
        right: 20,
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
        gap: 24,
    },
    inputGroup: {
        gap: 10,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    label: {
        fontSize: 14,
        fontWeight: '900',
        color: '#64748b',
        marginLeft: 4,
    },
    input: {
        height: 60,
        borderRadius: 18,
        paddingHorizontal: 20,
        fontSize: 16,
        fontWeight: '600',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    textArea: {
        height: 120,
        paddingTop: 18,
        textAlignVertical: 'top',
    },
    selectorGroup: {
        gap: 12,
    },
    optionsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    optionBtn: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    optionText: {
        fontSize: 13,
        fontWeight: '800',
    },
    mapWrapper: {
        height: 280,
        borderRadius: 32,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        marginTop: 8,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    mapOverlay: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -32,
        marginLeft: -16,
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
