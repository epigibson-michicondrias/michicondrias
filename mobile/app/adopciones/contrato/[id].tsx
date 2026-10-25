import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { DetailFooter } from '@/src/components/layout/DetailLayout';
import Button from '@/src/components/Button';
import FormSwitch from '@/src/components/forms/FormSwitch';
import { FileCheck, PenTool } from 'lucide-react-native';
import { useAdoptionContract } from '@/src/hooks/adopciones/useAdoptionContract';
import { families, font, layout, radius, spacing } from '@/constants/design';

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

            <DetailFooter>
                <Button
                    label="Rechazar"
                    variant="secondary"
                    onPress={handleReject}
                    loading={isRejecting}
                    disabled={isSigning}
                    size="lg"
                    style={styles.flex}
                />
                <Button
                    label="Firmar contrato"
                    icon={<PenTool size={layout.icon.sm} color={theme.onPrimary} />}
                    onPress={handleSign}
                    loading={isSigning}
                    disabled={!agreed || isRejecting}
                    size="lg"
                    style={styles.primary}
                />
            </DetailFooter>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    primary: { flex: 1.6 },
    content: {
        paddingHorizontal: layout.screenPadding,
        paddingTop: spacing.lg,
        paddingBottom: spacing.xl,
    },
    contractHeader: {
        alignItems: 'center',
        padding: spacing.xxl,
        borderRadius: radius.lg,
        marginBottom: spacing.xxl,
        gap: spacing.sm,
    },
    contractTitle: {
        fontSize: font.xxl,
        fontFamily: families.black,
        textAlign: 'center',
    },
    contractSubtitle: {
        fontSize: font.base,
        fontFamily: families.medium,
        textAlign: 'center',
    },
    contractBox: {
        padding: spacing.xl,
        borderRadius: radius.lg,
        borderWidth: 1,
        marginBottom: spacing.xxl,
    },
    contractText: {
        fontSize: font.base,
    },
    agreementSection: {
        marginBottom: spacing.sm,
    },
});
