import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput, Switch, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyWalkerProfile, updateWalker, Walker } from '../../src/services/paseadores';
import { getMySitterProfile, updateSitter, Sitter } from '../../src/services/cuidadores';
import { useAuth } from '../../src/contexts/AuthContext';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ChevronLeft, Save, User, MapPin, DollarSign, Clock, Info, CheckCircle2, AlertCircle } from 'lucide-react-native';

export default function ProfessionalProfileScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const isWalker = user?.role_name === 'walker';
    const isSitter = user?.role_name === 'sitter';

    const { data: walkerProfile, isLoading: loadingWalker } = useQuery({
        queryKey: ['my-walker-profile'],
        queryFn: getMyWalkerProfile,
        enabled: isWalker,
    });

    const { data: sitterProfile, isLoading: loadingSitter } = useQuery({
        queryKey: ['my-sitter-profile'],
        queryFn: getMySitterProfile,
        enabled: isSitter,
    });

    const [formData, setFormData] = useState<any>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isWalker && walkerProfile) {
            setFormData({
                display_name: walkerProfile.display_name,
                bio: walkerProfile.bio || '',
                location: walkerProfile.location || '',
                price_per_walk: walkerProfile.price_per_walk?.toString() || '0',
                price_per_hour: walkerProfile.price_per_hour?.toString() || '0',
                is_active: walkerProfile.is_active,
                accepts_dogs: walkerProfile.accepts_dogs,
                accepts_cats: walkerProfile.accepts_cats,
            });
        } else if (isSitter && sitterProfile) {
            setFormData({
                display_name: sitterProfile.display_name,
                bio: sitterProfile.bio || '',
                location: sitterProfile.location || '',
                price_per_day: sitterProfile.price_per_day?.toString() || '0',
                price_per_visit: sitterProfile.price_per_visit?.toString() || '0',
                is_active: sitterProfile.is_active,
                accepts_dogs: sitterProfile.accepts_dogs,
                accepts_cats: sitterProfile.accepts_cats,
            });
        }
    }, [walkerProfile, sitterProfile, isWalker, isSitter]);

    const handleSave = async () => {
        setSaving(true);
        try {
            if (isWalker && walkerProfile) {
                await updateWalker(walkerProfile.id, {
                    ...formData,
                    price_per_walk: parseFloat(formData.price_per_walk),
                    price_per_hour: parseFloat(formData.price_per_hour),
                });
                queryClient.invalidateQueries({ queryKey: ['my-walker-profile'] });
            } else if (isSitter && sitterProfile) {
                await updateSitter(sitterProfile.id, {
                    ...formData,
                    price_per_day: parseFloat(formData.price_per_day),
                    price_per_visit: parseFloat(formData.price_per_visit),
                });
                queryClient.invalidateQueries({ queryKey: ['my-sitter-profile'] });
            }
            Alert.alert("Éxito", "Perfil actualizado correctamente");
            router.back();
        } catch (e) {
            Alert.alert("Error", "No se pudo guardar el perfil");
        } finally {
            setSaving(false);
        }
    };

    if (loadingWalker || loadingSitter) {
        return (
            <View style={[styles.center, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: theme.background }]}
        >
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <ChevronLeft size={24} color={theme.text} />
                    </TouchableOpacity>
                    <View style={styles.titleBox}>
                        <Text style={[styles.headerTitle, { color: theme.text }]}>Configuración Prof.</Text>
                        <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>Tus servicios y precios</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.saveBtn, { backgroundColor: theme.primary }]}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        {saving ? <ActivityIndicator size="small" color="#fff" /> : <Save size={20} color="#fff" />}
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    {/* Status Toggle */}
                    <View style={[styles.section, { backgroundColor: theme.surface }]}>
                        <View style={styles.toggleRow}>
                            <View style={styles.toggleText}>
                                <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 4 }]}>Estatus de Servicio</Text>
                                <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>
                                    {formData.is_active ? "Estás visible para nuevos clientes" : "Perfil oculto temporalmente"}
                                </Text>
                            </View>
                            <Switch
                                value={formData.is_active}
                                onValueChange={(val) => setFormData({ ...formData, is_active: val })}
                                trackColor={{ false: '#767577', true: theme.primary + '80' }}
                                thumbColor={formData.is_active ? theme.primary : '#f4f3f4'}
                            />
                        </View>
                    </View>

                    {/* Basic Info */}
                    <Text style={[styles.groupTitle, { color: theme.textMuted }]}>INFORMACIÓN BÁSICA</Text>
                    <View style={[styles.section, { backgroundColor: theme.surface }]}>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.textMuted }]}>Nombre a mostrar</Text>
                            <TextInput
                                style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                                value={formData.display_name}
                                onChangeText={(val) => setFormData({ ...formData, display_name: val })}
                                placeholder="Ej: Juan El Paseador"
                                placeholderTextColor={theme.textMuted}
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.textMuted }]}>Biografía / Experiencia</Text>
                            <TextInput
                                style={[styles.input, styles.textArea, { color: theme.text, borderColor: theme.border }]}
                                value={formData.bio}
                                onChangeText={(val) => setFormData({ ...formData, bio: val })}
                                multiline
                                numberOfLines={4}
                                placeholder="Cuéntanos sobre tu experiencia..."
                                placeholderTextColor={theme.textMuted}
                            />
                        </View>
                    </View>

                    {/* Pricing */}
                    <Text style={[styles.groupTitle, { color: theme.textMuted }]}>TARIFAS Y PRECIOS (MXN)</Text>
                    <View style={[styles.section, { backgroundColor: theme.surface }]}>
                        {isWalker ? (
                            <>
                                <View style={styles.inputRow}>
                                    <View style={[styles.inputGroup, { flex: 1 }]}>
                                        <Text style={[styles.label, { color: theme.textMuted }]}>Por Paseo</Text>
                                        <TextInput
                                            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                                            value={formData.price_per_walk}
                                            onChangeText={(val) => setFormData({ ...formData, price_per_walk: val })}
                                            keyboardType="numeric"
                                        />
                                    </View>
                                    <View style={[styles.inputGroup, { flex: 1 }]}>
                                        <Text style={[styles.label, { color: theme.textMuted }]}>Por Hora</Text>
                                        <TextInput
                                            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                                            value={formData.price_per_hour}
                                            onChangeText={(val) => setFormData({ ...formData, price_per_hour: val })}
                                            keyboardType="numeric"
                                        />
                                    </View>
                                </View>
                            </>
                        ) : (
                            <>
                                <View style={styles.inputRow}>
                                    <View style={[styles.inputGroup, { flex: 1 }]}>
                                        <Text style={[styles.label, { color: theme.textMuted }]}>Por Día (Alojamiento)</Text>
                                        <TextInput
                                            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                                            value={formData.price_per_day}
                                            onChangeText={(val) => setFormData({ ...formData, price_per_day: val })}
                                            keyboardType="numeric"
                                        />
                                    </View>
                                    <View style={[styles.inputGroup, { flex: 1 }]}>
                                        <Text style={[styles.label, { color: theme.textMuted }]}>Por Visita</Text>
                                        <TextInput
                                            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                                            value={formData.price_per_visit}
                                            onChangeText={(val) => setFormData({ ...formData, price_per_visit: val })}
                                            keyboardType="numeric"
                                        />
                                    </View>
                                </View>
                            </>
                        )}
                    </View>

                    {/* Preferences */}
                    <Text style={[styles.groupTitle, { color: theme.textMuted }]}>PREFERENCIAS</Text>
                    <View style={[styles.section, { backgroundColor: theme.surface }]}>
                        <View style={styles.toggleItem}>
                            <Text style={[styles.infoLabel, { color: theme.text }]}>Acepta Perros</Text>
                            <Switch
                                value={formData.accepts_dogs}
                                onValueChange={(val) => setFormData({ ...formData, accepts_dogs: val })}
                                trackColor={{ false: '#767577', true: '#10b98180' }}
                                thumbColor={formData.accepts_dogs ? '#10b981' : '#f4f3f4'}
                            />
                        </View>
                        <View style={[styles.toggleItem, { marginTop: 12 }]}>
                            <Text style={[styles.infoLabel, { color: theme.text }]}>Acepta Gatos</Text>
                            <Switch
                                value={formData.accepts_cats}
                                onValueChange={(val) => setFormData({ ...formData, accepts_cats: val })}
                                trackColor={{ false: '#767577', true: '#10b98180' }}
                                thumbColor={formData.accepts_cats ? '#10b981' : '#f4f3f4'}
                            />
                        </View>
                    </View>
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
    headerSubtitle: { fontSize: 13, fontWeight: '600' },
    saveBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    content: { padding: 24, paddingBottom: 100 },
    section: { padding: 20, borderRadius: 24, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    groupTitle: { fontSize: 12, fontWeight: '800', marginBottom: 12, marginLeft: 12, letterSpacing: 1 },
    sectionTitle: { fontSize: 16, fontWeight: '800' },
    sectionSubtitle: { fontSize: 12, fontWeight: '600' },
    toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    toggleText: { flex: 1 },
    inputGroup: { marginBottom: 16 },
    label: { fontSize: 12, fontWeight: '700', marginBottom: 8 },
    input: { height: 50, borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, fontSize: 15, fontWeight: '600' },
    textArea: { height: 120, paddingTop: 12, textAlignVertical: 'top' },
    inputRow: { flexDirection: 'row', gap: 12 },
    toggleItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    infoLabel: { fontSize: 15, fontWeight: '700' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
