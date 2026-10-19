import React from 'react';
import { SkeletonList } from '@/src/components/Skeleton';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useInsurancePlans } from '@/src/hooks/insurance/useInsurancePlans';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import BackButton from '@/src/components/BackButton';
import { Shield, Clock, DollarSign, CheckCircle, ArrowRight, PawPrint, Award, HeartHandshake } from 'lucide-react-native';
import { font, spacing } from '@/constants/design';

export default function PlanDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { theme } = useTheme();
    const { plans, isLoading } = useInsurancePlans();

    const plan = plans.find((p) => p.id === id);

    if (isLoading) {
        return (
            <ScreenContainer>
                <ScreenHeader title="Detalle del Plan" />
                <View style={{ padding: spacing.xl }}><SkeletonList count={4} /></View>
            </ScreenContainer>
        );
    }

    if (!plan) {
        return (
            <ScreenContainer>
                <ScreenHeader title="Plan no encontrado" />
                <View style={styles.errorContainer}>
                    <Shield size={64} color={theme.textMuted} style={{ marginBottom: spacing.lg }} />
                    <Text style={[styles.errorText, { color: theme.textMuted }]}>
                        No pudimos encontrar el plan de seguro solicitado.
                    </Text>
                    <TouchableOpacity
                        style={[styles.retryButton, { backgroundColor: theme.primary }]}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.retryButtonText}>Volver</Text>
                    </TouchableOpacity>
                </View>
            </ScreenContainer>
        );
    }

    // Pasos reales del flujo (no promesas de cobertura inventadas: el detalle lo define el plan)
    const benefits = [
        "Cotiza según la edad y especie de tu mascota",
        "Contrata y recibe tu póliza con vigencia de 1 año",
        "Presenta reclamos con tu comprobante desde Mis Pólizas",
        "La aseguradora revisa y resuelve; te avisamos por notificación",
    ];

    return (
        <ScreenContainer>
            <View style={[styles.customHeader, { borderBottomColor: theme.border + '30' }]}>
                <BackButton onPress={() => router.back()} />
                <Text style={[styles.headerTitle, { color: theme.text }]}>Detalle del Seguro</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Hero Card */}
                <View style={[styles.heroCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <View style={[styles.heroIconContainer, { backgroundColor: theme.primary + '15' }]}>
                        <Shield size={40} color={theme.primary} />
                    </View>
                    <Text style={[styles.planName, { color: theme.text }]}>{plan.name}</Text>
                    <Text style={[styles.planDesc, { color: theme.textMuted }]}>
                        {plan.description || "Consulta las condiciones con la aseguradora al contratar."}
                    </Text>
                </View>

                {/* Key Metrics Cards */}
                <View style={styles.metricsRow}>
                    <View style={[styles.metricCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <Award size={20} color={theme.secondary} />
                        <Text style={[styles.metricValue, { color: theme.text }]}>
                            ${plan.coverage_limit.toLocaleString()}
                        </Text>
                        <Text style={[styles.metricLabel, { color: theme.textMuted }]}>Cobertura Máxima</Text>
                    </View>
                    <View style={[styles.metricCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <DollarSign size={20} color={theme.success} />
                        <Text style={[styles.metricValue, { color: theme.text }]}>
                            ${plan.base_premium.toLocaleString()}
                        </Text>
                        <Text style={[styles.metricLabel, { color: theme.textMuted }]}>Prima Base / Mes</Text>
                    </View>
                </View>

                {/* Eligibility & Info */}
                <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Requisitos y Restricciones</Text>
                    
                    <View style={styles.infoRow}>
                        <View style={[styles.infoIconBg, { backgroundColor: theme.primary + '10' }]}>
                            <Clock size={16} color={theme.primary} />
                        </View>
                        <View style={styles.infoTextContainer}>
                            <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Rango de Edad</Text>
                            <Text style={[styles.infoValue, { color: theme.text }]}>
                                De {plan.min_age} a {plan.max_age} años
                            </Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <View style={[styles.infoIconBg, { backgroundColor: theme.secondary + '10' }]}>
                            <PawPrint size={16} color={theme.secondary} />
                        </View>
                        <View style={styles.infoTextContainer}>
                            <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Especies Cubiertas</Text>
                            <View style={styles.speciesRow}>
                                {plan.allowed_species.map((species, i) => (
                                    <View key={i} style={[styles.speciesBadge, { backgroundColor: theme.border + '30' }]}>
                                        <Text style={[styles.speciesText, { color: theme.text }]}>
                                            {species === 'dog' || species === 'perro' ? 'Perro' : species === 'cat' || species === 'gato' ? 'Gato' : species}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>
                </View>

                {/* Benefits List */}
                <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <View style={styles.sectionHeaderRow}>
                        <HeartHandshake size={20} color={theme.secondary} />
                        <Text style={[styles.sectionTitle, { color: theme.text, marginLeft: spacing.sm }]}>¿Cómo funciona?</Text>
                    </View>
                    {benefits.map((benefit, index) => (
                        <View key={index} style={styles.benefitItem}>
                            <CheckCircle size={16} color={theme.success} style={styles.checkIcon} />
                            <Text style={[styles.benefitText, { color: theme.text }]}>{benefit}</Text>
                        </View>
                    ))}
                </View>

                {/* CTA Action button */}
                <View style={styles.actionContainer}>
                    <TouchableOpacity
                        style={[styles.ctaButton, { backgroundColor: theme.primary }]}
                        onPress={() => router.push({ pathname: '/aseguradoras/cotizar', params: { plan_id: plan.id } } as any)}
                    >
                        <Text style={styles.ctaButtonText}>Cotizar y Contratar</Text>
                        <ArrowRight size={20} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View style={styles.footer} />
            </ScrollView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    placeholder: {
        width: 40,
    },
    customHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: font.xxl,
        fontWeight: '800',
    },
    scrollContent: {
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.lg,
        paddingBottom: 60,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.lg,
    },
    loadingText: {
        fontSize: font.lg,
        fontWeight: '600',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xxxl,
    },
    errorText: {
        fontSize: font.xl,
        textAlign: 'center',
        marginBottom: spacing.xxl,
        lineHeight: 22,
    },
    retryButton: {
        paddingHorizontal: spacing.xxxl,
        paddingVertical: spacing.lg,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    retryButtonText: {
        color: '#fff',
        fontSize: font.lg,
        fontWeight: '700',
    },
    heroCard: {
        alignItems: 'center',
        padding: spacing.xxl,
        borderRadius: 24,
        borderWidth: 1,
        marginBottom: spacing.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    heroIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    planName: {
        fontSize: font.h2,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    planDesc: {
        fontSize: font.base,
        lineHeight: 20,
        textAlign: 'center',
    },
    metricsRow: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    metricCard: {
        flex: 1,
        padding: spacing.lg,
        borderRadius: 20,
        borderWidth: 1,
        alignItems: 'center',
        gap: spacing.sm,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    metricValue: {
        fontSize: font.xxl,
        fontWeight: '800',
    },
    metricLabel: {
        fontSize: font.md,
        fontWeight: '600',
    },
    section: {
        padding: spacing.xl,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: spacing.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontSize: font.xl,
        fontWeight: '800',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
        gap: spacing.md,
    },
    infoIconBg: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoTextContainer: {
        flex: 1,
    },
    infoLabel: {
        fontSize: font.sm,
        fontWeight: '600',
        marginBottom: spacing.xxs,
    },
    infoValue: {
        fontSize: font.base,
        fontWeight: '700',
    },
    speciesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginTop: spacing.xs,
    },
    speciesBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: 8,
    },
    speciesText: {
        fontSize: font.md,
        fontWeight: '600',
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: spacing.md,
        gap: spacing.md,
    },
    checkIcon: {
        marginTop: spacing.xxs,
    },
    benefitText: {
        fontSize: font.base,
        lineHeight: 18,
        flex: 1,
        fontWeight: '500',
    },
    actionContainer: {
        marginTop: spacing.sm,
    },
    ctaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.lg,
        borderRadius: 16,
        gap: spacing.sm,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 3,
    },
    ctaButtonText: {
        color: '#fff',
        fontSize: font.xl,
        fontWeight: '700',
    },
    footer: {
        height: 40,
    },
});
