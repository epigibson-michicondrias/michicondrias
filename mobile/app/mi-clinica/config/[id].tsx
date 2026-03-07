import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Switch, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getClinic, updateClinic, ClinicCreate } from '@/src/services/directorio';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ChevronLeft, Save, MapPin, Phone, Mail, Globe, Info, Clock, ShieldCheck, Camera } from 'lucide-react-native';

export default function ConfigClinicaScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState<ClinicCreate>({
        name: '',
        address: '',
        city: '',
        state: '',
        phone: '',
        email: '',
        website: '',
        description: '',
        logo_url: '',
        is_24_hours: false,
        has_emergency: false,
    });

    const { data: clinic, isLoading: loadingClinic } = useQuery({
        queryKey: ['clinic-detail', id],
        queryFn: () => getClinic(id as string),
        enabled: !!id,
    });

    useEffect(() => {
        if (clinic) {
            setForm({
                name: clinic.name,
                address: clinic.address,
                city: clinic.city,
                state: clinic.state,
                phone: clinic.phone,
                email: clinic.email,
                website: clinic.website,
                description: clinic.description,
                logo_url: clinic.logo_url,
                is_24_hours: clinic.is_24_hours,
                has_emergency: clinic.has_emergency,
            });
        }
    }, [clinic]);

    const handleSave = async () => {
        if (!form.name) {
            Alert.alert("Error", "El nombre de la clínica es obligatorio");
            return;
        }

        setLoading(true);
        try {
            await updateClinic(id as string, form);
            Alert.alert("Éxito", "Perfil de clínica actualizado correctamente");
            router.back();
        } catch (e) {
            Alert.alert("Error", "No se pudo actualizar el perfil");
        } finally {
            setLoading(false);
        }
    };

    if (loadingClinic) {
        return (
            <View style={[styles.center, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <ChevronLeft size={24} color={theme.text} />
                    </TouchableOpacity>
                    <View style={styles.titleBox}>
                        <Text style={[styles.headerTitle, { color: theme.text }]}>Configuración</Text>
                        <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>Perfil de tu clínica</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.saveTopBtn, { backgroundColor: theme.primary }]}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator size="small" color="#fff" /> : <Save size={20} color="#fff" />}
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    {/* Logo Section */}
                    <View style={styles.logoSection}>
                        <View style={styles.logoContainer}>
                            <Image
                                source={{ uri: form.logo_url || 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=400' }}
                                style={styles.logoImage}
                            />
                            <TouchableOpacity style={[styles.cameraBtn, { backgroundColor: theme.primary }]}>
                                <Camera size={16} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        <Text style={[styles.logoHint, { color: theme.textMuted }]}>Toca la cámara para cambiar el logo</Text>
                    </View>

                    {/* Basic Info */}
                    <Text style={[styles.sectionLabel, { color: theme.text }]}>Información General</Text>

                    <View style={styles.formGroup}>
                        <Text style={[styles.label, { color: theme.textMuted }]}>Nombre de la Clínica *</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                            value={form.name}
                            onChangeText={(v) => setForm({ ...form, name: v })}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={[styles.label, { color: theme.textMuted }]}>Descripción</Text>
                        <TextInput
                            style={[styles.input, styles.textArea, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                            value={form.description || ''}
                            onChangeText={(v) => setForm({ ...form, description: v })}
                            multiline
                            numberOfLines={4}
                        />
                    </View>

                    {/* Contact Info */}
                    <Text style={[styles.sectionLabel, { color: theme.text }]}>Contacto y Ubicación</Text>

                    <View style={styles.formGroup}>
                        <Text style={[styles.label, { color: theme.textMuted }]}>Dirección</Text>
                        <View style={[styles.inputRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                            <MapPin size={18} color={theme.textMuted} />
                            <TextInput
                                style={[styles.rowInput, { color: theme.text }]}
                                value={form.address || ''}
                                onChangeText={(v) => setForm({ ...form, address: v })}
                            />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.formGroup, { flex: 1 }]}>
                            <Text style={[styles.label, { color: theme.textMuted }]}>Ciudad</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                value={form.city || ''}
                                onChangeText={(v) => setForm({ ...form, city: v })}
                            />
                        </View>
                        <View style={[styles.formGroup, { flex: 1 }]}>
                            <Text style={[styles.label, { color: theme.textMuted }]}>Teléfono</Text>
                            <View style={[styles.inputRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                <Phone size={18} color={theme.textMuted} />
                                <TextInput
                                    style={[styles.rowInput, { color: theme.text }]}
                                    value={form.phone || ''}
                                    onChangeText={(v) => setForm({ ...form, phone: v })}
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </View>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={[styles.label, { color: theme.textMuted }]}>Email</Text>
                        <View style={[styles.inputRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                            <Mail size={18} color={theme.textMuted} />
                            <TextInput
                                style={[styles.rowInput, { color: theme.text }]}
                                value={form.email || ''}
                                onChangeText={(v) => setForm({ ...form, email: v })}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    {/* Services Status */}
                    <Text style={[styles.sectionLabel, { color: theme.text }]}>Servicios y Disponibilidad</Text>

                    <View style={[styles.switchCard, { backgroundColor: theme.surface }]}>
                        <View style={styles.switchInfo}>
                            <Clock size={20} color={theme.primary} />
                            <View>
                                <Text style={[styles.switchLabel, { color: theme.text }]}>Servicio 24 Horas</Text>
                                <Text style={[styles.switchSub, { color: theme.textMuted }]}>Indica si tu clínica nunca cierra</Text>
                            </View>
                        </View>
                        <Switch
                            value={form.is_24_hours}
                            onValueChange={(v) => setForm({ ...form, is_24_hours: v })}
                            trackColor={{ false: '#767577', true: theme.primary + '80' }}
                            thumbColor={form.is_24_hours ? theme.primary : '#f4f3f4'}
                        />
                    </View>

                    <View style={[styles.switchCard, { backgroundColor: theme.surface }]}>
                        <View style={styles.switchInfo}>
                            <ShieldCheck size={20} color="#10b981" />
                            <View>
                                <Text style={[styles.switchLabel, { color: theme.text }]}>Urgencias Médicas</Text>
                                <Text style={[styles.switchSub, { color: theme.textMuted }]}>Ofreces atención inmediata de emergencia</Text>
                            </View>
                        </View>
                        <Switch
                            value={form.has_emergency}
                            onValueChange={(v) => setForm({ ...form, has_emergency: v })}
                            trackColor={{ false: '#767577', true: '#10b98180' }}
                            thumbColor={form.has_emergency ? '#10b981' : '#f4f3f4'}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.saveBtn, { backgroundColor: theme.primary }]}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Guardar Cambios</Text>}
                    </TouchableOpacity>

                    <View style={{ height: 40 }} />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: 24, paddingBottom: 24, gap: 16 },
    backBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.03)', justifyContent: 'center', alignItems: 'center' },
    titleBox: { flex: 1 },
    headerTitle: { fontSize: 22, fontWeight: '900' },
    headerSubtitle: { fontSize: 13, fontWeight: '600', marginTop: 2 },
    saveTopBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    content: { paddingHorizontal: 24 },
    logoSection: { alignItems: 'center', marginVertical: 32, gap: 12 },
    logoContainer: { position: 'relative' },
    logoImage: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#7c3aed' },
    cameraBtn: { position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#1e293b' },
    logoHint: { fontSize: 12, fontWeight: '600' },
    sectionLabel: { fontSize: 18, fontWeight: '900', marginBottom: 20, marginTop: 12 },
    formGroup: { marginBottom: 24 },
    label: { fontSize: 13, fontWeight: '700', marginBottom: 10 },
    input: { height: 56, borderRadius: 16, paddingHorizontal: 20, borderWidth: 1, fontSize: 15, fontWeight: '600' },
    textArea: { height: 120, paddingVertical: 16, textAlignVertical: 'top' },
    inputRow: { flexDirection: 'row', alignItems: 'center', gap: 12, height: 56, borderRadius: 16, paddingHorizontal: 16, borderWidth: 1 },
    rowInput: { flex: 1, fontSize: 15, fontWeight: '600' },
    row: { flexDirection: 'row', gap: 16 },
    switchCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderRadius: 24, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    switchInfo: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 },
    switchLabel: { fontSize: 15, fontWeight: '800' },
    switchSub: { fontSize: 12, fontWeight: '600', marginTop: 2 },
    saveBtn: { height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
