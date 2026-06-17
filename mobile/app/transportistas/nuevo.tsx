import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { showAlert } from '@/src/components/AppAlert';
import { requestRide } from '../../src/services/rides';
import { useTheme } from '@/src/hooks/useTheme';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import { Car, MapPin, DollarSign, Box, Info, CheckCircle2 } from 'lucide-react-native';
import BackButton from '@/src/components/BackButton';

export default function NuevoTransportistaScreen() {
    const router = useRouter();
    const { theme, isDark } = useTheme();

    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        driver_id: '',
        pet_id: '',
        origin_address: '',
        destination_address: '',
        price: '',
        requires_carrier: false,
    });

    const handleSubmit = async () => {
        if (!form.driver_id || !form.pet_id || !form.origin_address || !form.destination_address) {
            showAlert({ type: 'error', title: 'Error', message: 'Por favor completa los campos obligatorios' });
            return;
        }

        setLoading(true);
        try {
            await requestRide({
                driver_id: form.driver_id,
                pet_id: form.pet_id,
                origin_address: form.origin_address,
                destination_address: form.destination_address,
                price: form.price ? parseFloat(form.price) : undefined,
                requires_carrier: form.requires_carrier,
            });
            showAlert({
                type: 'success',
                title: '¡Éxito!',
                message: 'Tu solicitud de transporte ha sido enviada.',
                onButtonPress: () => router.back(),
            });
        } catch (error) {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo solicitar el transporte.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardScreen style={{ backgroundColor: theme.background }}>
            <View style={styles.header}>
                <BackButton onPress={() => router.back()} />
                <Text style={[styles.title, { color: theme.text }]}>Solicitar Transporte</Text>
                <Text style={[styles.subtitle, { color: theme.textMuted }]}>Pide un viaje para tu mascota</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={[styles.label, { color: theme.text }]}>ID Conductor *</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                            placeholder="UUID del conductor"
                            placeholderTextColor={theme.textMuted}
                            value={form.driver_id}
                            onChangeText={(val) => setForm(f => ({ ...f, driver_id: val }))}
                        />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={[styles.label, { color: theme.text }]}>ID Mascota *</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                            placeholder="UUID de la mascota"
                            placeholderTextColor={theme.textMuted}
                            value={form.pet_id}
                            onChangeText={(val) => setForm(f => ({ ...f, pet_id: val }))}
                        />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>Dirección de Origen *</Text>
                    <View style={styles.inputWrapper}>
                        <MapPin size={18} color={theme.textMuted} style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, styles.inputWithIcon, { backgroundColor: theme.surface, color: theme.text }]}
                            placeholder="Ej. Calle Reforma 123, CDMX"
                            placeholderTextColor={theme.textMuted}
                            value={form.origin_address}
                            onChangeText={(val) => setForm(f => ({ ...f, origin_address: val }))}
                        />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>Dirección de Destino *</Text>
                    <View style={styles.inputWrapper}>
                        <MapPin size={18} color={theme.primary} style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, styles.inputWithIcon, { backgroundColor: theme.surface, color: theme.text }]}
                            placeholder="Ej. Veterinaria San José"
                            placeholderTextColor={theme.textMuted}
                            value={form.destination_address}
                            onChangeText={(val) => setForm(f => ({ ...f, destination_address: val }))}
                        />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>Precio Aproximado ($)</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                        placeholder="Ej. 150"
                        placeholderTextColor={theme.textMuted}
                        keyboardType="numeric"
                        value={form.price}
                        onChangeText={(val) => setForm(f => ({ ...f, price: val }))}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.toggleItem, { backgroundColor: theme.surface }]}
                    onPress={() => setForm(f => ({ ...f, requires_carrier: !f.requires_carrier }))}
                >
                    <View style={styles.toggleText}>
                        <Text style={[styles.toggleLabel, { color: theme.text }]}>Requiere Transportín</Text>
                        <Text style={[styles.toggleDesc, { color: theme.textMuted }]}>Necesito que el conductor traiga transportín</Text>
                    </View>
                    <CheckCircle2 color={form.requires_carrier ? theme.primary : theme.textMuted} />
                </TouchableOpacity>

                <View style={[styles.infoBox, { backgroundColor: theme.primary + '10' }]}>
                    <Info size={18} color={theme.primary} />
                    <Text style={[styles.infoText, { color: theme.textMuted }]}>
                        El transporte es seguro y supervisionado. Puedes rastrear tu mascota en tiempo real durante el viaje.
                    </Text>
                </View>

                <TouchableOpacity
                    style={[styles.submitBtn, { backgroundColor: theme.primary }, loading && { opacity: 0.7 }]}
                    disabled={loading}
                    onPress={handleSubmit}
                >
                    <Car size={20} color="#fff" />
                    <Text style={styles.submitBtnText}>{loading ? "Solicitando..." : "Solicitar Viaje"}</Text>
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
