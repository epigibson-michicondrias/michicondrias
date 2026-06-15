import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { showAlert } from '@/src/components/AppAlert';
import { createGroomingService } from '../../src/services/grooming';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import { ChevronLeft, Scissors, DollarSign, Clock, Info } from 'lucide-react-native';

export default function NuevoEstilistaScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: '',
        description: '',
        price: '',
        duration_minutes: '30',
    });

    const handleSubmit = async () => {
        if (!form.name || !form.price) {
            showAlert({ type: 'error', title: 'Error', message: 'Por favor completa los campos obligatorios' });
            return;
        }

        setLoading(true);
        try {
            await createGroomingService({
                name: form.name,
                description: form.description || undefined,
                price: parseFloat(form.price),
                duration_minutes: parseInt(form.duration_minutes) || 30,
            });
            showAlert({
                type: 'success',
                title: '¡Éxito!',
                message: 'Tu servicio de grooming ha sido registrado.',
                onButtonPress: () => router.back(),
            });
        } catch (error) {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo registrar el servicio.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardScreen style={{ backgroundColor: theme.background }}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <ChevronLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.text }]}>Nuevo Servicio</Text>
                <Text style={[styles.subtitle, { color: theme.textMuted }]}>Ofrece tus servicios de grooming</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>Nombre del Servicio *</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                        placeholder="Ej. Baño y corte básico"
                        placeholderTextColor={theme.textMuted}
                        value={form.name}
                        onChangeText={(val) => setForm(f => ({ ...f, name: val }))}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>Descripción</Text>
                    <TextInput
                        style={[styles.textArea, { backgroundColor: theme.surface, color: theme.text }]}
                        placeholder="Describe tu servicio..."
                        placeholderTextColor={theme.textMuted}
                        multiline
                        numberOfLines={4}
                        value={form.description}
                        onChangeText={(val) => setForm(f => ({ ...f, description: val }))}
                    />
                </View>

                <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={[styles.label, { color: theme.text }]}>Precio ($) *</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                            placeholder="Ej. 250"
                            placeholderTextColor={theme.textMuted}
                            keyboardType="numeric"
                            value={form.price}
                            onChangeText={(val) => setForm(f => ({ ...f, price: val }))}
                        />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={[styles.label, { color: theme.text }]}>Duración (min)</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                            placeholder="Ej. 30"
                            placeholderTextColor={theme.textMuted}
                            keyboardType="numeric"
                            value={form.duration_minutes}
                            onChangeText={(val) => setForm(f => ({ ...f, duration_minutes: val }))}
                        />
                    </View>
                </View>

                <View style={[styles.infoBox, { backgroundColor: theme.primary + '10' }]}>
                    <Info size={18} color={theme.primary} />
                    <Text style={[styles.infoText, { color: theme.textMuted }]}>
                        Al registrar tu servicio, los clientes podrán verlo y agendar citas contigo.
                    </Text>
                </View>

                <TouchableOpacity
                    style={[styles.submitBtn, { backgroundColor: theme.primary }, loading && { opacity: 0.7 }]}
                    disabled={loading}
                    onPress={handleSubmit}
                >
                    <Scissors size={20} color="#fff" />
                    <Text style={styles.submitBtnText}>{loading ? "Registrando..." : "Registrar Servicio"}</Text>
                </TouchableOpacity>
            </View>
        </KeyboardScreen>
    );
}

const styles = StyleSheet.create({
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
        flexDirection: 'row',
        gap: 10,
        marginTop: 10,
        marginBottom: 40,
    },
    submitBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
    },
});
