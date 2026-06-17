import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Switch,
} from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useQuote } from '@/src/hooks/insurance/useQuote';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import type { InsurancePlan } from '@/src/services/insurance';
import type { Pet } from '@/src/types/mascotas';
import {
    Shield,
    DollarSign,
    CheckCircle,
    PawPrint,
    Calculator,
    CreditCard,
    ArrowRight,
} from 'lucide-react-native';

export default function CotizarScreen() {
    const { theme } = useTheme();
    const {
        plans,
        pets,
        quote,
        selectedPetId,
        selectedPlanId,
        selectedPet,
        selectedPlan,
        hasPreexisting,
        isLoading,
        isCalculating,
        isSubscribing,
        setSelectedPetId,
        setSelectedPlanId,
        setHasPreexisting,
        handleCalculateQuote,
        handleSubscribe,
    } = useQuote();

    if (isLoading) {
        return (
            <ScreenContainer>
                <ScreenHeader title="🛡️ Cotizar Seguro" subtitle="Protege a tu mascota" />
                <LoadingOverlay message="Cargando datos..." />
            </ScreenContainer>
        );
    }

    return (
        <ScreenContainer>
            <ScreenHeader
                title="🛡️ Cotizar Seguro"
                subtitle="Calcula y contrata el mejor plan"
                gradient={[theme.primary, '#1a7adb']}
            />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Pet Selector */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <PawPrint size={18} color={theme.primary} />
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Selecciona tu mascota</Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.petList}>
                        {pets.map((pet: Pet) => (
                            <TouchableOpacity
                                key={pet.id}
                                style={[
                                    styles.petCard,
                                    {
                                        backgroundColor: selectedPetId === pet.id ? theme.primary + '20' : theme.surface,
                                        borderColor: selectedPetId === pet.id ? theme.primary : theme.border,
                                    },
                                ]}
                                onPress={() => setSelectedPetId(pet.id)}
                            >
                                <Text style={styles.petEmoji}>
                                    {pet.species === 'perro' || pet.species === 'dog' ? '🐕' : '🐈'}
                                </Text>
                                <Text style={[styles.petName, { color: theme.text }]} numberOfLines={1}>
                                    {pet.name}
                                </Text>
                                <Text style={[styles.petBreed, { color: theme.textMuted }]} numberOfLines={1}>
                                    {pet.breed || pet.species}
                                </Text>
                                {selectedPetId === pet.id && (
                                    <CheckCircle size={16} color={theme.primary} style={styles.checkIcon} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    {pets.length === 0 && (
                        <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                            No tienes mascotas registradas.
                        </Text>
                    )}
                </View>

                {/* Plan Selector */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Shield size={18} color={theme.primary} />
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Elige un plan</Text>
                    </View>
                    {plans.map((plan: InsurancePlan) => (
                        <TouchableOpacity
                            key={plan.id}
                            style={[
                                styles.planOption,
                                {
                                    backgroundColor: selectedPlanId === plan.id ? theme.primary + '15' : theme.surface,
                                    borderColor: selectedPlanId === plan.id ? theme.primary : theme.border,
                                },
                            ]}
                            onPress={() => setSelectedPlanId(plan.id)}
                        >
                            <View style={styles.planOptionHeader}>
                                <View style={[styles.planIcon, { backgroundColor: theme.primary + '20' }]}>
                                    <Shield size={20} color={theme.primary} />
                                </View>
                                <View style={styles.planOptionInfo}>
                                    <Text style={[styles.planOptionName, { color: theme.text }]}>{plan.name}</Text>
                                    <Text style={[styles.planOptionDesc, { color: theme.textMuted }]} numberOfLines={1}>
                                        {plan.description || 'Sin descripción'}
                                    </Text>
                                </View>
                                {selectedPlanId === plan.id && <CheckCircle size={20} color={theme.primary} />}
                            </View>
                            <View style={styles.planOptionStats}>
                                <View style={styles.planStat}>
                                    <DollarSign size={12} color={theme.secondary} />
                                    <Text style={[styles.planStatText, { color: theme.text }]}>
                                        ${plan.coverage_limit.toLocaleString()}
                                    </Text>
                                    <Text style={[styles.planStatLabel, { color: theme.textMuted }]}>Cobertura</Text>
                                </View>
                                <View style={styles.planStat}>
                                    <CreditCard size={12} color={theme.primary} />
                                    <Text style={[styles.planStatText, { color: theme.text }]}>
                                        ${plan.base_premium}/mes
                                    </Text>
                                    <Text style={[styles.planStatLabel, { color: theme.textMuted }]}>Prima base</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Pre-existing conditions */}
                <View style={[styles.switchRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <View style={styles.switchInfo}>
                        <Text style={[styles.switchLabel, { color: theme.text }]}>Condiciones preexistentes</Text>
                        <Text style={[styles.switchDesc, { color: theme.textMuted }]}>
                            ¿Tu mascota tiene condiciones médicas previas?
                        </Text>
                    </View>
                    <Switch
                        value={hasPreexisting}
                        onValueChange={setHasPreexisting}
                        trackColor={{ false: theme.border, true: theme.primary + '60' }}
                        thumbColor={hasPreexisting ? theme.primary : '#f4f4f4'}
                    />
                </View>

                {/* Calculate Quote Button */}
                <TouchableOpacity
                    style={[
                        styles.calculateBtn,
                        {
                            backgroundColor: selectedPetId && selectedPlanId ? theme.primary : theme.border,
                        },
                    ]}
                    disabled={!selectedPetId || !selectedPlanId || isCalculating}
                    onPress={handleCalculateQuote}
                >
                    {isCalculating ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Calculator size={20} color="#fff" />
                            <Text style={styles.calculateBtnText}>Calcular Cotización</Text>
                        </>
                    )}
                </TouchableOpacity>

                {/* Quote Result */}
                {quote && (
                    <View style={[styles.quoteCard, { backgroundColor: theme.surface, borderColor: '#10b981' + '40' }]}>
                        <View style={[styles.quoteHeader, { borderBottomColor: theme.border }]}>
                            <View style={[styles.quoteBadge, { backgroundColor: '#10b981' + '15' }]}>
                                <CheckCircle size={20} color="#10b981" />
                            </View>
                            <Text style={[styles.quoteTitle, { color: theme.text }]}>Tu Cotización</Text>
                        </View>

                        <View style={styles.quoteDetails}>
                            <View style={styles.quoteRow}>
                                <Text style={[styles.quoteLabel, { color: theme.textMuted }]}>Prima base</Text>
                                <Text style={[styles.quoteValue, { color: theme.text }]}>
                                    ${quote.base_premium.toLocaleString()}/mes
                                </Text>
                            </View>
                            <View style={styles.quoteRow}>
                                <Text style={[styles.quoteLabel, { color: theme.textMuted }]}>Prima calculada</Text>
                                <Text style={[styles.quotePremium, { color: theme.primary }]}>
                                    ${quote.calculated_premium.toLocaleString()}/mes
                                </Text>
                            </View>
                            <View style={[styles.quoteRow, styles.quoteHighlight, { backgroundColor: theme.primary + '10' }]}>
                                <Text style={[styles.quoteLabel, { color: theme.text, fontWeight: '700' }]}>
                                    Cobertura máxima
                                </Text>
                                <Text style={[styles.quotePremium, { color: '#10b981' }]}>
                                    ${quote.coverage_limit.toLocaleString()}
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.subscribeBtn, { backgroundColor: '#10b981' }]}
                            disabled={isSubscribing}
                            onPress={handleSubscribe}
                        >
                            {isSubscribing ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Text style={styles.subscribeBtnText}>Contratar Seguro</Text>
                                    <ArrowRight size={20} color="#fff" />
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.bottomSpacer} />
            </ScrollView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 100,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
    },
    petList: {
        gap: 12,
        paddingRight: 24,
    },
    petCard: {
        width: 110,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: 'center',
        gap: 6,
    },
    petEmoji: {
        fontSize: 28,
    },
    petName: {
        fontSize: 14,
        fontWeight: '700',
    },
    petBreed: {
        fontSize: 11,
    },
    checkIcon: {
        position: 'absolute',
        top: 8,
        right: 8,
    },
    emptyText: {
        fontSize: 13,
        textAlign: 'center',
        marginTop: 8,
    },
    planOption: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 12,
    },
    planOptionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    planIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    planOptionInfo: {
        flex: 1,
    },
    planOptionName: {
        fontSize: 16,
        fontWeight: '800',
    },
    planOptionDesc: {
        fontSize: 12,
        marginTop: 2,
    },
    planOptionStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    planStat: {
        alignItems: 'center',
        gap: 2,
    },
    planStatText: {
        fontSize: 14,
        fontWeight: '700',
    },
    planStatLabel: {
        fontSize: 10,
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 24,
    },
    switchInfo: {
        flex: 1,
        marginRight: 12,
    },
    switchLabel: {
        fontSize: 14,
        fontWeight: '700',
    },
    switchDesc: {
        fontSize: 12,
        marginTop: 2,
    },
    calculateBtn: {
        flexDirection: 'row',
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        marginBottom: 24,
    },
    calculateBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
    },
    quoteCard: {
        borderRadius: 20,
        borderWidth: 1.5,
        overflow: 'hidden',
    },
    quoteHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 20,
        borderBottomWidth: 1,
    },
    quoteBadge: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quoteTitle: {
        fontSize: 20,
        fontWeight: '900',
    },
    quoteDetails: {
        padding: 20,
        gap: 16,
    },
    quoteRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    quoteHighlight: {
        padding: 12,
        borderRadius: 12,
        marginTop: 4,
    },
    quoteLabel: {
        fontSize: 14,
    },
    quoteValue: {
        fontSize: 16,
        fontWeight: '600',
    },
    quotePremium: {
        fontSize: 20,
        fontWeight: '900',
    },
    subscribeBtn: {
        flexDirection: 'row',
        height: 60,
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    subscribeBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
    },
    bottomSpacer: {
        height: 40,
    },
});
