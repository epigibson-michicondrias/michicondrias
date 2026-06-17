import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { showAlert } from '@/src/components/AppAlert';
import { createPlan } from '../../src/services/insurance';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import { Shield, DollarSign, Info, CheckCircle2 } from 'lucide-react-native';
import BackButton from '@/src/components/BackButton';

export default function NuevoPlanScreen() {
    const router = useRouter();
    const { theme } = useTheme();

    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: '',
        description: '',
        coverage_limit: '',
        base_premium: '',
        min_age: '0',
        max_age: '20',
    });
    const [allowedSpecies, setAllowedSpecies] = useState<string[]>(['dog', 'cat']);

    const toggleSpecies = (species: string) => {
        setAllowedSpecies(prev =>
            prev.includes(species) ? prev.filter(s => s !== species) : [...prev, species]
        );
    };

    const handleSubmit = async () => {
        if (!form.name || !form.coverage_limit || !form.base_premium) {
            showAlert({ type: 'error', title: 'Error', message: 'Por favor completa los campos obligatorios' });
            return;
        }

        setLoading(true);
        try {
            await createPlan({
                name: form.name,
                description: form.description || undefined,
                coverage_limit: parseFloat(form.coverage_limit),
                base_premium: parseFloat(form.base_premium),
                min_age: parseInt(form.min_age) || 0,
                max_age: parseInt(form.max_age) || 20,
                allowed_species: allowedSpecies,
            });
            showAlert({
                type: 'success',
                title: '¡Plan creado!',
                message: 'El plan de seguro ha sido registrado exitosamente.',
                onButtonPress: () => router.back(),
            });
        } catch (error) {
            showAlert({ type: 'error', title: 'Error', message: 'No pudimos crear el plan. Inténtalo de nuevo.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardScreen style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <BackButton onPress={() => router.back()} />
                <View style={styles.headerInfo}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
                        <Shield size={28} color={theme.primary} />
                    </View>
                    <Text style={[styles.title, { color: theme.text }]}>Nuevo Plan</Text>
                    <Text style={[styles.subtitle, { color: theme.textMuted }]}>Crea un plan de seguro para mascotas</Text>
                </View>
            </View>

            <View style={styles.content}>
                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>Nombre del Plan *</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                        placeholder="Ej. Plan Básico"
                        placeholderTextColor={theme.textMuted}
                        value={form.name}
                        onChangeText={(val) => setForm(f => ({ ...f, name: val }))}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>Descripción</Text>
                    <TextInput
                        style={[styles.textArea, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                        placeholder="Describe los beneficios del plan..."
                        placeholderTextColor={theme.textMuted}
                        multiline
                        numberOfLines={3}
                        value={form.description}
                        onChangeText={(val) => setForm(f => ({ ...f, description: val }))}
                    />
                </View>

                <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={[styles.label, { color: theme.text }]}>Cobertura *</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                            placeholder="$0"
                            placeholderTextColor={theme.textMuted}
                            keyboardType="numeric"
                            value={form.coverage_limit}
                            onChangeText={(val) => setForm(f => ({ ...f, coverage_limit: val }))}
                        />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={[styles.label, { color: theme.text }]}>Prima Mensual *</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                            placeholder="$0"
                            placeholderTextColor={theme.textMuted}
                            keyboardType="numeric"
                            value={form.base_premium}
                            onChangeText={(val) => setForm(f => ({ ...f, base_premium: val }))}
                        />
                    </View>
                </View>

                <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={[styles.label, { color: theme.text }]}>Edad Mínima</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                            placeholder="0"
                            placeholderTextColor={theme.textMuted}
                            keyboardType="numeric"
                            value={form.min_age}
                            onChangeText={(val) => setForm(f => ({ ...f, min_age: val }))}
                        />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={[styles.label, { color: theme.text }]}>Edad Máxima</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                            placeholder="20"
                            placeholderTextColor={theme.textMuted}
                            keyboardType="numeric"
                            value={form.max_age}
                            onChangeText={(val) => setForm(f => ({ ...f, max_age: val }))}
                        />
                    </View>
                </View>

                <Text style={[styles.label, { color: theme.text }]}>Especies Permitidas</Text>
                <View style={styles.speciesContainer}>
                    <TouchableOpacity
                        style={[
                            styles.speciesButton,
                            allowedSpecies.includes('dog') && { backgroundColor: theme.primary + '20', borderColor: theme.primary },
                            { backgroundColor: allowedSpecies.includes('dog') ? theme.primary + '20' : theme.surface, borderColor: allowedSpecies.includes('dog') ? theme.primary : theme.border }
                        ]}
                        onPress={() => toggleSpecies('dog')}
                    >
                        <Text style={[styles.speciesButtonText, { color: allowedSpecies.includes('dog') ? theme.primary : theme.text }]}>
                            🐕 Perros
                        </Text>
                        {allowedSpecies.includes('dog') && <CheckCircle2 size={16} color={theme.primary} />}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.speciesButton,
                            { backgroundColor: allowedSpecies.includes('cat') ? theme.primary + '20' : theme.surface, borderColor: allowedSpecies.includes('cat') ? theme.primary : theme.border }
                        ]}
                        onPress={() => toggleSpecies('cat')}
                    >
                        <Text style={[styles.speciesButtonText, { color: allowedSpecies.includes('cat') ? theme.primary : theme.text }]}>
                            🐈 Gatos
                        </Text>
                        {allowedSpecies.includes('cat') && <CheckCircle2 size={16} color={theme.primary} />}
                    </TouchableOpacity>
                </View>

                <View style={[styles.infoBox, { backgroundColor: theme.primary + '10' }]}>
                    <Info size={18} color={theme.primary} />
                    <Text style={[styles.infoText, { color: theme.textMuted }]}>
                        Los planes de seguro protegen a las mascotas contra gastos médicos inesperados.
                    </Text>
                </View>

                <TouchableOpacity
                    style={[styles.submitBtn, { backgroundColor: loading ? theme.primary + '80' : theme.primary }]}
                    disabled={loading}
                    onPress={handleSubmit}
                >
                    <Text style={styles.submitBtnText}>{loading ? 'Creando...' : 'Crear Plan'}</Text>
                </TouchableOpacity>
            </View>
        </KeyboardScreen>
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

    headerInfo: {
        gap: 8,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
    },
    subtitle: {
        fontSize: 14,
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
    },
    textArea: {
        minHeight: 80,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 16,
        textAlignVertical: 'top',
        borderWidth: 1,
    },
    speciesContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    speciesButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        gap: 8,
    },
    speciesButtonText: {
        fontSize: 14,
        fontWeight: '600',
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
    },
});
