import React from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useCampaignForm } from '@/src/hooks/sponsors/useCampaignForm';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import FormSection from '@/src/components/forms/FormSection';
import { Megaphone, DollarSign, Link2, Type, Image } from 'lucide-react-native';
import { font, spacing } from '@/constants/design';

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
                title="Nueva Campaña"
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
        paddingBottom: spacing.huge,
    },
    form: {
        paddingHorizontal: spacing.xxl,
    },
    inputGroup: {
        borderRadius: 14,
        borderWidth: 1,
        marginBottom: spacing.md,
        overflow: 'hidden',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        gap: spacing.md,
    },
    input: {
        flex: 1,
        fontSize: font.lg,
        paddingVertical: spacing.lg,
    },
    budgetHint: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: spacing.lg,
        borderRadius: 12,
        gap: spacing.md,
        marginTop: spacing.xs,
    },
    budgetHintText: {
        flex: 1,
        fontSize: font.base,
        lineHeight: 18,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.lg,
        borderRadius: 16,
        marginTop: spacing.sm,
        gap: spacing.md,
    },
    submitDisabled: {
        opacity: 0.7,
    },
    submitText: {
        color: '#fff',
        fontSize: font.xl,
        fontWeight: '700',
    },
});
