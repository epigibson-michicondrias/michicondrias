import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import FormSwitch from '@/src/components/forms/FormSwitch';
import { FileCheck, PenTool } from 'lucide-react-native';
import { useAdoptionContract } from '@/src/hooks/adopciones/useAdoptionContract';

export default function AdoptionContractScreen() {
    const { theme } = useTheme();
    const {
        terms,
        agreed,
        setAgreed,
        handleSign,
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
                        Lee atentamente los términos antes de firmar
                    </Text>
                </View>

                <View style={[styles.contractBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Text style={[styles.contractText, { color: theme.text }]}>{terms}</Text>
                </View>

                <View style={styles.agreementSection}>
                    <FormSwitch
                        label="He leído y acepto los términos del contrato"
                        description="Al marcar esta casilla, confirmas que entiendes y aceptas todas las condiciones"
                        value={agreed}
                        onChange={setAgreed}
                    />
                </View>
            </ScrollView>

            <View style={[styles.footer, { borderTopColor: theme.border }]}>
                <TouchableOpacity
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
        padding: 24,
        paddingBottom: 40,
    },
    contractHeader: {
        alignItems: 'center',
        padding: 24,
        borderRadius: 20,
        marginBottom: 24,
        gap: 8,
    },
    contractTitle: {
        fontSize: 18,
        fontWeight: '900',
        textAlign: 'center',
    },
    contractSubtitle: {
        fontSize: 13,
        fontWeight: '500',
        textAlign: 'center',
    },
    contractBox: {
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 24,
    },
    contractText: {
        fontSize: 14,
        lineHeight: 22,
    },
    agreementSection: {
        marginBottom: 8,
    },
    footer: {
        padding: 24,
        paddingBottom: 40,
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
        gap: 10,
    },
    signBtnText: {
        fontSize: 17,
        fontWeight: '800',
    },
});
