import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { showAlert } from '@/src/components/AppAlert';
import { createFuneraryService } from '../../src/services/funerary';
import { useTheme } from '@/src/hooks/useTheme';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import { Heart, DollarSign, Info, CheckCircle2 } from 'lucide-react-native';
import BackButton from '@/src/components/BackButton';

export default function NuevaFunerariaScreen() {
    const router = useRouter();
    const { theme, isDark } = useTheme();

    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: '',
        description: '',
        price: '',
        cremation_type: 'individual',
        urn_included: false,
    });

    const CREMATION_TYPES = ['individual', 'colectiva', 'doméstica'];

    const handleSubmit = async () => {
        if (!form.name || !form.price) {
            showAlert({ type: 'error', title: 'Error', message: 'Por favor completa los campos obligatorios' });
            return;
        }

        setLoading(true);
        try {
            await createFuneraryService({
                name: form.name,
                description: form.description || undefined,
                price: parseFloat(form.price),
                cremation_type: form.cremation_type,
                urn_included: form.urn_included,
            });
            showAlert({
                type: 'success',
                title: '¡Éxito!',
                message: 'El servicio funerario ha sido registrado.',
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
                <BackButton onPress={() => router.back()} />
                <Text style={[styles.title, { color: theme.text }]}>Nuevo Servicio</Text>
                <Text style={[styles.subtitle, { color: theme.textMuted }]}>Registra un servicio funerario</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>Nombre del Servicio *</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                        placeholder="Ej. Cremación individual"
                        placeholderTextColor={theme.textMuted}
                        value={form.name}
                        onChangeText={(val) => setForm(f => ({ ...f, name: val }))}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>Descripción</Text>
                    <TextInput
                        style={[styles.textArea, { backgroundColor: theme.surface, color: theme.text }]}
                        placeholder="Describe el servicio..."
                        placeholderTextColor={theme.textMuted}
                        multiline
                        numberOfLines={4}
                        value={form.description}
                        onChangeText={(val) => setForm(f => ({ ...f, description: val }))}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>Precio ($) *</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                        placeholder="Ej. 1500"
                        placeholderTextColor={theme.textMuted}
                        keyboardType="numeric"
                        value={form.price}
                        onChangeText={(val) => setForm(f => ({ ...f, price: val }))}
                    />
                </View>

                <Text style={[styles.label, { color: theme.text }]}>Tipo de Cremación</Text>
                <View style={styles.typeRow}>
                    {CREMATION_TYPES.map((type) => (
                        <TouchableOpacity
                            key={type}
                            style={[
                                styles.typeBtn,
                                { backgroundColor: theme.surface, borderColor: theme.border },
                                form.cremation_type === type && { backgroundColor: theme.primary, borderColor: theme.primary }
                            ]}
                            onPress={() => setForm(f => ({ ...f, cremation_type: type }))}
                        >
                            <Text style={[styles.typeText, { color: form.cremation_type === type ? '#fff' : theme.text }]}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity
                    style={[styles.toggleItem, { backgroundColor: theme.surface }]}
                    onPress={() => setForm(f => ({ ...f, urn_included: !f.urn_included }))}
                >
                    <View style={styles.toggleText}>
                        <Text style={[styles.toggleLabel, { color: theme.text }]}>Urna Incluida</Text>
                        <Text style={[styles.toggleDesc, { color: theme.textMuted }]}>El servicio incluye una urna</Text>
                    </View>
                    <CheckCircle2 color={form.urn_included ? theme.primary : theme.textMuted} />
                </TouchableOpacity>

                <View style={[styles.infoBox, { backgroundColor: theme.primary + '10' }]}>
                    <Info size={18} color={theme.primary} />
                    <Text style={[styles.infoText, { color: theme.textMuted }]}>
                        Los servicios funerarios ayudan a las familias a despedirse de sus mascotas con dignidad.
                    </Text>
                </View>

                <TouchableOpacity
                    style={[styles.submitBtn, { backgroundColor: theme.secondary }, loading && { opacity: 0.7 }]}
                    disabled={loading}
                    onPress={handleSubmit}
                >
                    <Heart size={20} color="#fff" />
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
    typeRow: {
        flexDirection: 'row',
        gap: 8,
    },
    typeBtn: {
        flex: 1,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    typeText: {
        fontSize: 13,
        fontWeight: '700',
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
