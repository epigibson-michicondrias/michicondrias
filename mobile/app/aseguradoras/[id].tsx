import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useInsurancePlans } from '@/src/hooks/insurance';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import BackButton from '@/src/components/BackButton';
import { Shield, Clock, DollarSign, Info, CheckCircle, ArrowRight, PawPrint, Award, HeartHandshake } from 'lucide-react-native';

export default function PlanDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { theme } = useTheme();
    const { plans, isLoading } = useInsurancePlans();

    const plan = plans.find((p) => p.id === id);

    if (isLoading) {
        return (
            <ScreenContainer>
                <ScreenHeader title="Detalle del Plan" rightElement={<View style={styles.placeholder} />} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={[styles.loadingText, { color: theme.textMuted }]}>Cargando información del plan...</Text>
                </View>
            </ScreenContainer>
        );
    }

    if (!plan) {
        return (
            <ScreenContainer>
                <ScreenHeader title="Plan no encontrado" rightElement={<View style={styles.placeholder} />} />
                <View style={styles.errorContainer}>
                    <Shield size={64} color={theme.textMuted} style={{ marginBottom: 16 }} />
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

    // Standard high-value benefits list for premium feel
    const benefits = [
        "🩺 Consultas veterinarias generales y de urgencia",
        "🏥 Hospitalización y cirugías complejas por accidente o enfermedad",
        "💉 Cobertura de vacunas obligatorias y desparasitación anual",
        "⚖️ Responsabilidad civil por daños a terceros o mascotas",
        "🧼 Descuentos especiales en servicios de estética y hospedaje",
        "📞 Orientación médica telefónica disponible las 24 horas",
        "🧬 Cobertura de análisis de laboratorio y radiografías"
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
                        {plan.description || "Protección de salud completa para tu mascota ante emergencias médicas y accidentes."}
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
                        <DollarSign size={20} color="#10b981" />
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
                                            {species === 'dog' || species === 'perro' ? '🐕 Perro' : species === 'cat' || species === 'gato' ? '🐈 Gato' : species}
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
                        <Text style={[styles.sectionTitle, { color: theme.text, marginLeft: 8 }]}>¿Qué incluye este plan?</Text>
                    </View>
                    {benefits.map((benefit, index) => (
                        <View key={index} style={styles.benefitItem}>
                            <CheckCircle size={16} color="#10b981" style={styles.checkIcon} />
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
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 60,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        fontSize: 15,
        fontWeight: '600',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    retryButton: {
        paddingHorizontal: 28,
        paddingVertical: 14,
        borderRadius: 12,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
    heroCard: {
        alignItems: 'center',
        padding: 24,
        borderRadius: 24,
        borderWidth: 1,
        marginBottom: 16,
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
        marginBottom: 16,
    },
    planName: {
        fontSize: 22,
        fontWeight: '900',
        textAlign: 'center',
        marginBottom: 8,
    },
    planDesc: {
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
    },
    metricsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    metricCard: {
        flex: 1,
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        alignItems: 'center',
        gap: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    metricValue: {
        fontSize: 18,
        fontWeight: '800',
    },
    metricLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    section: {
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
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
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '700',
    },
    speciesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 4,
    },
    speciesBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    speciesText: {
        fontSize: 12,
        fontWeight: '600',
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
        gap: 10,
    },
    checkIcon: {
        marginTop: 2,
    },
    benefitText: {
        fontSize: 13,
        lineHeight: 18,
        flex: 1,
        fontWeight: '500',
    },
    actionContainer: {
        marginTop: 8,
    },
    ctaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 3,
    },
    ctaButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    footer: {
        height: 40,
    },
});
