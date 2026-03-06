import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { createClinic } from '../../src/services/directorio';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ChevronLeft, Hospital, MapPin, Phone, Globe, Info, CheckCircle2 } from 'lucide-react-native';

export default function NuevoRegistroProfesionalScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: '',
        address: '',
        city: '',
        phone: '',
        website: '',
        description: '',
        is_24_hours: false,
        has_emergency: false
    });

    const handleSubmit = async () => {
        if (!form.name || !form.city || !form.phone) {
            Alert.alert("Error", "Por favor completa los campos obligatorios (Nombre, Ciudad y Teléfono)");
            return;
        }

        setLoading(true);
        try {
            await createClinic(form);
            Alert.alert(
                "¡Éxito!",
                "Tu solicitud ha sido enviada. Un administrador revisará tu información pronto.",
                [{ text: "OK", onPress: () => router.back() }]
            );
        } catch (error) {
            console.error("Error al registrar:", error);
            Alert.alert("Error", "No pudimos procesar tu registro. Inténtalo de nuevo.");
        } finally {
            setLoading(false);
        }
    };

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
                    <Text style={[styles.title, { color: theme.text }]}>Registrar Negocio</Text>
                    <Text style={[styles.subtitle, { color: theme.textMuted }]}>Únete a la red médica de Michicondrias</Text>
                </View>

                <View style={styles.content}>
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>Nombre de la Clínica *</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                            placeholder="Ej. Veterinaria San José"
                            placeholderTextColor={theme.textMuted}
                            value={form.name}
                            onChangeText={(val) => setForm(f => ({ ...f, name: val }))}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>Dirección</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                            placeholder="Calle, número y colonia"
                            placeholderTextColor={theme.textMuted}
                            value={form.address}
                            onChangeText={(val) => setForm(f => ({ ...f, address: val }))}
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={[styles.label, { color: theme.text }]}>Ciudad *</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                                placeholder="Ej. CDMX"
                                placeholderTextColor={theme.textMuted}
                                value={form.city}
                                onChangeText={(val) => setForm(f => ({ ...f, city: val }))}
                            />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={[styles.label, { color: theme.text }]}>Teléfono *</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                                placeholder="10 dígitos"
                                placeholderTextColor={theme.textMuted}
                                keyboardType="phone-pad"
                                value={form.phone}
                                onChangeText={(val) => setForm(f => ({ ...f, phone: val }))}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>Sitio Web / Facebook</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                            placeholder="https://..."
                            placeholderTextColor={theme.textMuted}
                            autoCapitalize="none"
                            value={form.website}
                            onChangeText={(val) => setForm(f => ({ ...f, website: val }))}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>Descripción del Servicio</Text>
                        <TextInput
                            style={[styles.textArea, { backgroundColor: theme.surface, color: theme.text }]}
                            placeholder="Cuéntanos sobre tus especialidades y servicios..."
                            placeholderTextColor={theme.textMuted}
                            multiline
                            numberOfLines={4}
                            value={form.description}
                            onChangeText={(val) => setForm(f => ({ ...f, description: val }))}
                        />
                    </View>

                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Servicios Especiales</Text>

                    <TouchableOpacity
                        style={[styles.toggleItem, { backgroundColor: theme.surface }]}
                        onPress={() => setForm(f => ({ ...f, is_24_hours: !f.is_24_hours }))}
                    >
                        <View style={styles.toggleText}>
                            <Text style={[styles.toggleLabel, { color: theme.text }]}>Servicio 24 Horas</Text>
                            <Text style={[styles.toggleDesc, { color: theme.textMuted }]}>Atención médica todo el día</Text>
                        </View>
                        <CheckCircle2 color={form.is_24_hours ? theme.primary : theme.textMuted} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.toggleItem, { backgroundColor: theme.surface }]}
                        onPress={() => setForm(f => ({ ...f, has_emergency: !f.has_emergency }))}
                    >
                        <View style={styles.toggleText}>
                            <Text style={[styles.toggleLabel, { color: theme.text }]}>Urgencias</Text>
                            <Text style={[styles.toggleDesc, { color: theme.textMuted }]}>Equipo disponible para emergencias</Text>
                        </View>
                        <CheckCircle2 color={form.has_emergency ? theme.primary : theme.textMuted} />
                    </TouchableOpacity>

                    <View style={[styles.infoBox, { backgroundColor: theme.primary + '10' }]}>
                        <Info size={18} color={theme.primary} />
                        <Text style={[styles.infoText, { color: theme.textMuted }]}>
                            Al registrarte, aceptas que Michicondrias verifique la autenticidad de tu cédula y negocio.
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.submitBtn, { backgroundColor: theme.primary }]}
                        disabled={loading}
                        onPress={handleSubmit}
                    >
                        <Text style={styles.submitBtnText}>{loading ? "Enviando..." : "Enviar Solicitud"}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 20,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
    },
    subtitle: {
        fontSize: 14,
        marginTop: 4,
    },
    content: {
        padding: 24,
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    row: {
        flexDirection: 'row',
        gap: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
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
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 16,
        textAlignVertical: 'top',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginTop: 10,
    },
    toggleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    toggleText: {
        flex: 1,
    },
    toggleLabel: {
        fontSize: 15,
        fontWeight: '700',
    },
    toggleDesc: {
        fontSize: 12,
        marginTop: 2,
    },
    infoBox: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        gap: 12,
        alignItems: 'center',
    },
    infoText: {
        flex: 1,
        fontSize: 12,
        lineHeight: 18,
    },
    submitBtn: {
        height: 64,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 40,
    },
    submitBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
    }
});
