import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import FormSwitch from '@/src/components/forms/FormSwitch';
import { FileCheck, PenTool } from 'lucide-react-native';
import { useAdoptionContract } from '@/src/hooks/adopciones/useAdoptionContract';
import { font, spacing } from '@/constants/design';

export default function AdoptionContractScreen() {
    const { theme } = useTheme();
    const {
        terms,
        agreed,
        setAgreed,
        handleSign,
        handleReject,
        isRejecting,
        isSigning,
    } = useAdoptionContract();

    return (
        <ScreenContainer>
            <ScreenHeader title="Contrato de Adopción" />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={[styles.contractHeader, { backgroundColor: theme.primary + '10' }]}>
                    <FileCheck size={32} color={theme.primary} />
                    <Text style={[styles.contractTitle, { color: theme.text }]}>
                        Contrato de Adopción Responsable
                    </Text>
                    <Text style={[styles.contractSubtitle, { color: theme.textMuted }]}>
                        El refugio firma este contrato para cerrar la postulación
                    </Text>
                </View>

                <View style={[styles.contractBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Text style={[styles.contractText, { color: theme.text }]}>{terms}</Text>
                </View>

                <View style={styles.agreementSection}>
                    <FormSwitch
                        label="He revisado los términos y los firmo como refugio"
                        description="Al marcar esta casilla, confirmas que entiendes y aceptas todas las condiciones"
                        value={agreed}
                        onChange={setAgreed}
                    />
                </View>
            </ScrollView>

            <View style={[styles.footer, { borderTopColor: theme.border }]}>
                <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="Rechazar postulación"
                    onPress={handleReject}
                    disabled={isRejecting || isSigning}
                    style={{ alignItems: 'center', paddingVertical: spacing.md, marginBottom: spacing.sm }}
                >
                    <Text style={{ color: theme.error, fontWeight: '800' }}>{isRejecting ? 'Rechazando...' : 'Rechazar postulación'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="Firmar contrato"
                    style={[
                        styles.signBtn,
                        {
                            backgroundColor: agreed ? theme.primary : theme.surface,
                            borderColor: agreed ? theme.primary : theme.border,
                        },
                        isSigning && { opacity: 0.7 },
                    ]}
                    onPress={handleSign}
                    disabled={isSigning || !agreed}
                >
                    {isSigning ? (
                        <ActivityIndicator color={agreed ? '#fff' : theme.textMuted} />
                    ) : (
                        <View style={styles.btnContent}>
                            <PenTool size={20} color={agreed ? '#fff' : theme.textMuted} />
                            <Text style={[styles.signBtnText, { color: agreed ? '#fff' : theme.textMuted }]}>
                                Firmar Contrato
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    content: {
        padding: spacing.xxl,
        paddingBottom: spacing.huge,
    },
    contractHeader: {
        alignItems: 'center',
        padding: spacing.xxl,
        borderRadius: 20,
        marginBottom: spacing.xxl,
        gap: spacing.sm,
    },
    contractTitle: {
        fontSize: font.xxl,
        fontWeight: '900',
        textAlign: 'center',
    },
    contractSubtitle: {
        fontSize: font.base,
        fontWeight: '500',
        textAlign: 'center',
    },
    contractBox: {
        padding: spacing.xl,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: spacing.xxl,
    },
    contractText: {
        fontSize: font.base,
        lineHeight: 22,
    },
    agreementSection: {
        marginBottom: spacing.sm,
    },
    footer: {
        padding: spacing.xxl,
        paddingBottom: spacing.huge,
        borderTopWidth: 1,
    },
    signBtn: {
        height: 60,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    btnContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    signBtnText: {
        fontSize: font.xxl,
        fontWeight: '800',
    },
});
