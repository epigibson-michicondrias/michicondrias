import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useFuneraryProvider } from '@/src/hooks/funerary/useFuneraryProvider';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import { Heart, DollarSign, Info, CheckCircle2 } from 'lucide-react-native';

const CREMATION_TYPES = ['individual', 'colectiva', 'doméstica'];

export default function NuevoServicioScreen() {
    const { theme } = useTheme();
    const { form, updateForm, handleCreateService, isCreatingService } = useFuneraryProvider();

    return (
        <ScreenContainer>
            <ScreenHeader
                title="🕊️ Nuevo Servicio"
                subtitle="Registra un servicio funerario"
            />

            <KeyboardScreen contentContainerStyle={styles.scrollContent}>
                <View style={styles.content}>
                    {/* Service Name */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>Nombre del Servicio *</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                            placeholder="Ej. Cremación individual"
                            placeholderTextColor={theme.textMuted}
                            value={form.name}
                            onChangeText={(val) => updateForm('name', val)}
                        />
                    </View>

                    {/* Description */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>Descripción</Text>
                        <TextInput
                            style={[styles.textArea, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                            placeholder="Describe el servicio..."
                            placeholderTextColor={theme.textMuted}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            value={form.description}
                            onChangeText={(val) => updateForm('description', val)}
                        />
                    </View>

                    {/* Price */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>Precio ($) *</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                            placeholder="Ej. 1500"
                            placeholderTextColor={theme.textMuted}
                            keyboardType="numeric"
                            value={form.price}
                            onChangeText={(val) => updateForm('price', val)}
                        />
                    </View>

                    {/* Cremation type */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>Tipo de Cremación</Text>
                        <View style={styles.typeRow}>
                            {CREMATION_TYPES.map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    style={[
                                        styles.typeBtn,
                                        { backgroundColor: theme.surface, borderColor: theme.border },
                                        form.cremation_type === type && { backgroundColor: theme.primary, borderColor: theme.primary },
                                    ]}
                                    onPress={() => updateForm('cremation_type', type)}
                                >
                                    <Text
                                        style={[
                                            styles.typeText,
                                            { color: form.cremation_type === type ? '#fff' : theme.text },
                                        ]}
                                    >
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Urn included toggle */}
                    <TouchableOpacity
                        style={[styles.toggleItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
                        onPress={() => updateForm('urn_included', !form.urn_included)}
                    >
                        <View style={styles.toggleText}>
                            <Text style={[styles.toggleLabel, { color: theme.text }]}>Urna Incluida</Text>
                            <Text style={[styles.toggleDesc, { color: theme.textMuted }]}>El servicio incluye una urna</Text>
                        </View>
                        <CheckCircle2 color={form.urn_included ? theme.primary : theme.textMuted} />
                    </TouchableOpacity>

                    {/* Info box */}
                    <View style={[styles.infoBox, { backgroundColor: theme.primary + '10' }]}>
                        <Info size={18} color={theme.primary} />
                        <Text style={[styles.infoText, { color: theme.textMuted }]}>
                            Los servicios funerarios ayudan a las familias a despedirse de sus mascotas con dignidad.
                        </Text>
                    </View>

                    {/* Submit */}
                    <TouchableOpacity
                        style={[styles.submitBtn, { backgroundColor: theme.secondary }, isCreatingService && { opacity: 0.7 }]}
                        disabled={isCreatingService}
                        onPress={handleCreateService}
                    >
                        <Heart size={20} color="#fff" />
                        <Text style={styles.submitBtnText}>
                            {isCreatingService ? 'Registrando...' : 'Registrar Servicio'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardScreen>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
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
    },
    textArea: {
        height: 120,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 16,
        textAlignVertical: 'top',
        borderWidth: 1,
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
