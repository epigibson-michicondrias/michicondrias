import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { showAlert } from '@/src/components/AppAlert';
import { createCampaign } from '../../src/services/sponsors';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import { Megaphone, DollarSign, Link, Info } from 'lucide-react-native';
import BackButton from '@/src/components/BackButton';

export default function NuevoPatrocinadorScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        title: '',
        banner_url: '',
        target_link: '',
        budget_limit: '',
    });

    const handleSubmit = async () => {
        if (!form.title || !form.budget_limit) {
            showAlert({ type: 'error', title: 'Error', message: 'Por favor completa los campos obligatorios' });
            return;
        }

        setLoading(true);
        try {
            await createCampaign({
                title: form.title,
                banner_url: form.banner_url || 'https://placehold.co/600x200',
                target_link: form.target_link || undefined,
                budget_limit: parseFloat(form.budget_limit),
            });
            showAlert({
                type: 'success',
                title: '¡Éxito!',
                message: 'Tu campaña de patrocinio ha sido creada.',
                onButtonPress: () => router.back(),
            });
        } catch (error) {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo crear la campaña.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardScreen style={{ backgroundColor: theme.background }}>
            <View style={styles.header}>
                <BackButton onPress={() => router.back()} />
                <Text style={[styles.title, { color: theme.text }]}>Nueva Campaña</Text>
                <Text style={[styles.subtitle, { color: theme.textMuted }]}>Crea una campaña de patrocinio</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>Título de la Campaña *</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                        placeholder="Ej. Promo Navideña 2024"
                        placeholderTextColor={theme.textMuted}
                        value={form.title}
                        onChangeText={(val) => setForm(f => ({ ...f, title: val }))}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>URL del Banner</Text>
                    <View style={styles.inputWrapper}>
                        <Megaphone size={18} color={theme.textMuted} style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, styles.inputWithIcon, { backgroundColor: theme.surface, color: theme.text }]}
                            placeholder="https://..."
                            placeholderTextColor={theme.textMuted}
                            autoCapitalize="none"
                            value={form.banner_url}
                            onChangeText={(val) => setForm(f => ({ ...f, banner_url: val }))}
                        />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>Enlace de Destino</Text>
                    <View style={styles.inputWrapper}>
                        <Link size={18} color={theme.textMuted} style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, styles.inputWithIcon, { backgroundColor: theme.surface, color: theme.text }]}
                            placeholder="https://..."
                            placeholderTextColor={theme.textMuted}
                            autoCapitalize="none"
                            value={form.target_link}
                            onChangeText={(val) => setForm(f => ({ ...f, target_link: val }))}
                        />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>Presupuesto ($) *</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                        placeholder="Ej. 5000"
                        placeholderTextColor={theme.textMuted}
                        keyboardType="numeric"
                        value={form.budget_limit}
                        onChangeText={(val) => setForm(f => ({ ...f, budget_limit: val }))}
                    />
                </View>

                <View style={[styles.infoBox, { backgroundColor: '#f59e0b10' }]}>
                    <Info size={18} color="#f59e0b" />
                    <Text style={[styles.infoText, { color: theme.textMuted }]}>
                        Las campañas de patrocinio ayudan a financiar alertas de mascotas perdidas y mejorar la plataforma.
                    </Text>
                </View>

                <TouchableOpacity
                    style={[styles.submitBtn, { backgroundColor: theme.primary }, loading && { opacity: 0.7 }]}
                    disabled={loading}
                    onPress={handleSubmit}
                >
                    <Megaphone size={20} color="#fff" />
                    <Text style={styles.submitBtnText}>{loading ? "Creando..." : "Crear Campaña"}</Text>
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
    inputWrapper: {
        position: 'relative',
    },
    inputIcon: {
        position: 'absolute',
        left: 16,
        top: 18,
        zIndex: 1,
    },
    inputWithIcon: {
        paddingLeft: 46,
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
