import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput, Switch, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useServiceProfile } from '@/src/hooks/servicios-pro';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { Save } from 'lucide-react-native';

export default function ProfessionalProfileScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const {
        isWalker,
        formData,
        updateField,
        saving,
        isLoading,
        handleSave,
    } = useServiceProfile();

    if (isLoading) {
        return (
            <View style={[styles.center, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <ScreenContainer>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <ScreenHeader
                        title="Configuración Prof."
                        subtitle="Tus servicios y precios"
                        rightElement={
                            <TouchableOpacity
                                style={[styles.saveBtn, { backgroundColor: theme.primary }]}
                                onPress={handleSave}
                                disabled={saving}
                            >
                                {saving ? <ActivityIndicator size="small" color="#fff" /> : <Save size={20} color="#fff" />}
                            </TouchableOpacity>
                        }
                    />

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
                                    onValueChange={(val) => updateField('is_active', val)}
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
                                    onChangeText={(val) => updateField('display_name', val)}
                                    placeholder="Ej: Juan El Paseador"
                                    placeholderTextColor={theme.textMuted}
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.textMuted }]}>Biografía / Experiencia</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea, { color: theme.text, borderColor: theme.border }]}
                                    value={formData.bio}
                                    onChangeText={(val) => updateField('bio', val)}
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
                                                onChangeText={(val) => updateField('price_per_walk', val)}
                                                keyboardType="numeric"
                                            />
                                        </View>
                                        <View style={[styles.inputGroup, { flex: 1 }]}>
                                            <Text style={[styles.label, { color: theme.textMuted }]}>Por Hora</Text>
                                            <TextInput
                                                style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                                                value={formData.price_per_hour}
                                                onChangeText={(val) => updateField('price_per_hour', val)}
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
                                                onChangeText={(val) => updateField('price_per_day', val)}
                                                keyboardType="numeric"
                                            />
                                        </View>
                                        <View style={[styles.inputGroup, { flex: 1 }]}>
                                            <Text style={[styles.label, { color: theme.textMuted }]}>Por Visita</Text>
                                            <TextInput
                                                style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                                                value={formData.price_per_visit}
                                                onChangeText={(val) => updateField('price_per_visit', val)}
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
                                    onValueChange={(val) => updateField('accepts_dogs', val)}
                                    trackColor={{ false: '#767577', true: '#10b98180' }}
                                    thumbColor={formData.accepts_dogs ? '#10b981' : '#f4f3f4'}
                                />
                            </View>
                            <View style={[styles.toggleItem, { marginTop: 12 }]}>
                                <Text style={[styles.infoLabel, { color: theme.text }]}>Acepta Gatos</Text>
                                <Switch
                                    value={formData.accepts_cats}
                                    onValueChange={(val) => updateField('accepts_cats', val)}
                                    trackColor={{ false: '#767577', true: '#10b98180' }}
                                    thumbColor={formData.accepts_cats ? '#10b981' : '#f4f3f4'}
                                />
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </ScreenContainer>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
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
