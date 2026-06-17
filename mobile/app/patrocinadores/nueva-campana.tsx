import React from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useCampaignForm } from '@/src/hooks/sponsors/useCampaignForm';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import FormSection from '@/src/components/forms/FormSection';
import FormSwitch from '@/src/components/forms/FormSwitch';
import { Megaphone, DollarSign, Link2, Type, Image } from 'lucide-react-native';

export default function NuevaCampanaScreen() {
    const { theme } = useTheme();
    const {
        campaignForm,
        updateCampaignField,
        handleSubmitCampaign,
        isSubmittingCampaign,
    } = useCampaignForm('campaign');

    return (
        <ScreenContainer>
            <ScreenHeader
                title="📣 Nueva Campaña"
                subtitle="Crea una campaña publicitaria"
            />

            <KeyboardScreen contentContainerStyle={styles.scrollContent}>
                <View style={styles.form}>
                    <FormSection title="Información de la campaña">
                        <View style={[styles.inputGroup, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                            <View style={styles.inputRow}>
                                <Type size={18} color={theme.primary} />
                                <TextInput
                                    style={[styles.input, { color: theme.text }]}
                                    placeholder="Nombre de la campaña"
                                    placeholderTextColor={theme.textMuted}
                                    value={campaignForm.title}
                                    onChangeText={(v) => updateCampaignField('title', v)}
                                />
                            </View>
                        </View>

                        <View style={[styles.inputGroup, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                            <View style={styles.inputRow}>
                                <Image size={18} color={theme.primary} />
                                <TextInput
                                    style={[styles.input, { color: theme.text }]}
                                    placeholder="URL del banner"
                                    placeholderTextColor={theme.textMuted}
                                    value={campaignForm.banner_url}
                                    onChangeText={(v) => updateCampaignField('banner_url', v)}
                                    autoCapitalize="none"
                                    keyboardType="url"
                                />
                            </View>
                        </View>

                        <View style={[styles.inputGroup, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                            <View style={styles.inputRow}>
                                <Link2 size={18} color={theme.primary} />
                                <TextInput
                                    style={[styles.input, { color: theme.text }]}
                                    placeholder="Enlace de destino (opcional)"
                                    placeholderTextColor={theme.textMuted}
                                    value={campaignForm.target_link}
                                    onChangeText={(v) => updateCampaignField('target_link', v)}
                                    autoCapitalize="none"
                                    keyboardType="url"
                                />
                            </View>
                        </View>
                    </FormSection>

                    <FormSection title="Presupuesto">
                        <View style={[styles.inputGroup, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                            <View style={styles.inputRow}>
                                <DollarSign size={18} color={theme.secondary} />
                                <TextInput
                                    style={[styles.input, { color: theme.text }]}
                                    placeholder="Presupuesto máximo (MXN)"
                                    placeholderTextColor={theme.textMuted}
                                    value={campaignForm.budget_limit}
                                    onChangeText={(v) => updateCampaignField('budget_limit', v)}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>

                        <View style={[styles.budgetHint, { backgroundColor: theme.primary + '10' }]}>
                            <Megaphone size={16} color={theme.primary} />
                            <Text style={[styles.budgetHintText, { color: theme.textMuted }]}>
                                El presupuesto se irá descontando conforme los usuarios interactúen con tu campaña.
                            </Text>
                        </View>
                    </FormSection>

                    <FormSection title="Opciones avanzadas">
                        <FormSwitch
                            label="Modo alerta impulsada"
                            description="Impulsa alertas de mascotas perdidas a más usuarios"
                            value={campaignForm.is_boosted}
                            onChange={(v) => updateCampaignField('is_boosted', v)}
                        />
                    </FormSection>

                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            { backgroundColor: theme.primary },
                            isSubmittingCampaign && styles.submitDisabled,
                        ]}
                        onPress={handleSubmitCampaign}
                        disabled={isSubmittingCampaign}
                    >
                        {isSubmittingCampaign ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Megaphone size={20} color="#fff" />
                                <Text style={styles.submitText}>Crear Campaña</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardScreen>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: 40,
    },
    form: {
        paddingHorizontal: 24,
    },
    inputGroup: {
        borderRadius: 14,
        borderWidth: 1,
        marginBottom: 12,
        overflow: 'hidden',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        gap: 12,
    },
    input: {
        flex: 1,
        fontSize: 15,
        paddingVertical: 16,
    },
    budgetHint: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 14,
        borderRadius: 12,
        gap: 10,
        marginTop: 4,
    },
    budgetHintText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 18,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        marginTop: 8,
        gap: 10,
    },
    submitDisabled: {
        opacity: 0.7,
    },
    submitText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
