import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, Switch, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useClinicConfig } from '@/src/hooks/clinica/useClinicConfig';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { Save, MapPin, Phone, Mail, Clock, ShieldCheck, Camera } from 'lucide-react-native';

export default function ConfigClinicaScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { theme } = useTheme();
    const {
        loading, form, setForm, loadingClinic, handleSave, updateField,
    } = useClinicConfig(id as string);

    if (loadingClinic) {
        return (
            <ScreenContainer style={styles.center}>
                <ActivityIndicator size="large" color={theme.primary} />
            </ScreenContainer>
        );
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScreenContainer>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <ScreenHeader
                        title="Configuración"
                        subtitle="Perfil de tu clínica"
                        rightElement={
                            <TouchableOpacity
                                style={[styles.saveTopBtn, { backgroundColor: theme.primary }]}
                                onPress={handleSave}
                                disabled={loading}
                            >
                                {loading ? <ActivityIndicator size="small" color="#fff" /> : <Save size={20} color="#fff" />}
                            </TouchableOpacity>
                        }
                    />

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
                                onChangeText={(v) => updateField('name', v)}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: theme.textMuted }]}>Descripción</Text>
                            <TextInput
                                style={[styles.input, styles.textArea, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                value={form.description || ''}
                                onChangeText={(v) => updateField('description', v)}
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
                                    onChangeText={(v) => updateField('address', v)}
                                />
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.formGroup, { flex: 1 }]}>
                                <Text style={[styles.label, { color: theme.textMuted }]}>Ciudad</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                    value={form.city || ''}
                                    onChangeText={(v) => updateField('city', v)}
                                />
                            </View>
                            <View style={[styles.formGroup, { flex: 1 }]}>
                                <Text style={[styles.label, { color: theme.textMuted }]}>Teléfono</Text>
                                <View style={[styles.inputRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                    <Phone size={18} color={theme.textMuted} />
                                    <TextInput
                                        style={[styles.rowInput, { color: theme.text }]}
                                        value={form.phone || ''}
                                        onChangeText={(v) => updateField('phone', v)}
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
                                    onChangeText={(v) => updateField('email', v)}
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
                                onValueChange={(v) => updateField('is_24_hours', v)}
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
                                onValueChange={(v) => updateField('has_emergency', v)}
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
            </ScreenContainer>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    center: { justifyContent: 'center', alignItems: 'center' },
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
});
