import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useMyPolicies } from '@/src/hooks/insurance/useMyPolicies';
import type { PetWithPolicy } from '@/src/hooks/insurance/useMyPolicies';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { formatDateMx, statusTone } from '@/src/features/salud/format';
import DataList from '@/src/components/data/DataList';
import { Shield, ShieldCheck, ShieldX, Calendar, DollarSign, FileText, ChevronRight, Dog, Cat } from 'lucide-react-native';
import { font, spacing, layout } from '@/constants/design';

export default function MisPolizasScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const {
        petsWithPolicies,
        insuredCount,
        uninsuredCount,
        isLoading,
        refetch,
        isRefetching,
    } = useMyPolicies();

    const renderPetPolicy = ({ item }: { item: PetWithPolicy }) => {
        const { pet, policy } = item;
        const hasPolicy = policy !== null;
        const PetIcon = pet.species === 'perro' || pet.species === 'dog' ? Dog : Cat;

        return (
            <View style={[styles.policyCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                {/* Pet Header */}
                <View style={styles.petHeader}>
                    <PetIcon size={layout.icon.lg} color={theme.primary} />
                    <View style={styles.petInfo}>
                        <Text style={[styles.petName, { color: theme.text }]}>{pet.name}</Text>
                        <Text style={[styles.petBreed, { color: theme.textMuted }]}>
                            {pet.breed || pet.species}
                            {pet.age_months ? ` • ${Math.round(pet.age_months / 12)} años` : ''}
                        </Text>
                    </View>
                    <View
                        style={[
                            styles.statusBadge,
                            { backgroundColor: hasPolicy ? theme.successLight : theme.errorLight },
                        ]}
                    >
                        {hasPolicy ? (
                            <ShieldCheck size={14} color={theme.success} />
                        ) : (
                            <ShieldX size={14} color={theme.error} />
                        )}
                        <Text
                            style={[
                                styles.statusText,
                                { color: hasPolicy ? theme.success : theme.error },
                            ]}
                        >
                            {hasPolicy ? 'Asegurado' : 'Sin seguro'}
                        </Text>
                    </View>
                </View>

                {/* Policy Details */}
                {policy ? (
                    <View style={[styles.policyDetails, { borderTopColor: theme.border }]}>
                        <View style={styles.detailRow}>
                            <FileText size={14} color={theme.primary} />
                            <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Póliza</Text>
                            <Text style={[styles.detailValue, { color: theme.text }]}>
                                {policy.policy_number}
                            </Text>
                        </View>
                        <View style={styles.detailRow}>
                            <DollarSign size={14} color={theme.secondary} />
                            <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Prima</Text>
                            <Text style={[styles.detailValue, { color: theme.text }]}>
                                ${policy.monthly_premium}/mes
                            </Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Calendar size={14} color={theme.textMuted} />
                            <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Vigencia</Text>
                            <Text style={[styles.detailValue, { color: theme.text }]}>
                                {formatDateMx(policy.start_date)} — {formatDateMx(policy.end_date)}
                            </Text>
                        </View>
                        {policy.coverage_details && (
                            <View style={[styles.coverageBadge, { backgroundColor: theme.primary + '10' }]}>
                                <Shield size={12} color={theme.primary} />
                                <Text style={[styles.coverageText, { color: theme.primary }]}>
                                    {policy.coverage_details}
                                </Text>
                            </View>
                        )}
                        {policy.status && (
                            <View style={[styles.policyStatusBadge, { backgroundColor: theme.primary + '10' }]}>
                                <Text style={[styles.policyStatusText, { color: theme.primary }]}>
                                    Estado: {statusTone(theme, policy.status).label}
                                </Text>
                            </View>
                        )}
                        {(policy.claims || []).map((c) => {
                            const tone = statusTone(theme, c.status);
                            return (
                                <View key={c.id} style={styles.detailRow}>
                                    <FileText size={14} color={tone.color} />
                                    <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Reclamo</Text>
                                    <Text style={[styles.detailValue, { color: theme.text }]} numberOfLines={1}>${c.amount_claimed}</Text>
                                    <Text style={{ color: tone.color, fontWeight: '700', fontSize: font.md }}>{tone.label}</Text>
                                </View>
                            );
                        })}
                        <TouchableOpacity
                            accessibilityRole="button"
                            accessibilityLabel={`Presentar reclamo para ${pet.name}`}
                            style={[styles.insureCta, { backgroundColor: theme.primary + '10' }]}
                            onPress={() => router.push({ pathname: '/aseguradoras/reclamo/nuevo', params: { pet_id: pet.id } } as any)}
                        >
                            <Text style={[styles.insureCtaText, { color: theme.primary }]}>Presentar reclamo</Text>
                            <ChevronRight size={16} color={theme.primary} />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={[styles.insureCta, { backgroundColor: theme.primary + '10' }]}
                        onPress={() => router.push({ pathname: '/aseguradoras/cotizar', params: { pet_id: pet.id } } as any)}
                    >
                        <Text style={[styles.insureCtaText, { color: theme.primary }]}>
                            Cotizar seguro para {pet.name}
                        </Text>
                        <ChevronRight size={16} color={theme.primary} />
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Mis Pólizas"
                subtitle="Seguros activos de tus mascotas"
            />

            {/* Summary Stats */}
            {!isLoading && petsWithPolicies.length > 0 && (
                <View style={styles.statsRow}>
                    <View style={[styles.statCard, { backgroundColor: theme.successLight }]}>
                        <ShieldCheck size={20} color={theme.success} />
                        <Text style={[styles.statValue, { color: theme.success }]}>{insuredCount}</Text>
                        <Text style={[styles.statLabel, { color: theme.success }]}>Aseguradas</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: theme.errorLight }]}>
                        <ShieldX size={20} color={theme.error} />
                        <Text style={[styles.statValue, { color: theme.error }]}>{uninsuredCount}</Text>
                        <Text style={[styles.statLabel, { color: theme.error }]}>Sin seguro</Text>
                    </View>
                </View>
            )}

            <DataList<PetWithPolicy>
                data={petsWithPolicies}
                renderItem={renderPetPolicy}
                keyExtractor={(item) => item.pet.id}
                isLoading={isLoading}
                loadingMessage="Cargando pólizas..."
                onRefresh={refetch}
                isRefreshing={isRefetching}
                emptyIcon={<Shield size={32} color={theme.textMuted} />}
                emptyTitle="No tienes mascotas registradas"
                emptySubtitle="Registra una mascota para poder asegurarla"
                contentStyle={styles.list}
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: layout.screenPadding,
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    statCard: {
        flex: 1,
        padding: spacing.lg,
        borderRadius: 16,
        alignItems: 'center',
        gap: spacing.sm,
    },
    statValue: {
        fontSize: font.h1,
        fontWeight: '800',
    },
    statLabel: {
        fontSize: font.md,
        fontWeight: '600',
    },
    list: {
        paddingHorizontal: layout.screenPadding,
        paddingBottom: 100,
    },
    policyCard: {
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: spacing.lg,
        overflow: 'hidden',
    },
    petHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        gap: spacing.md,
    },
    petEmoji: {
        fontSize: font.display,
    },
    petInfo: {
        flex: 1,
    },
    petName: {
        fontSize: font.xxl,
        fontWeight: '800',
    },
    petBreed: {
        fontSize: font.base,
        marginTop: spacing.xxs,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 10,
        gap: spacing.xs,
    },
    statusText: {
        fontSize: font.sm,
        fontWeight: '700',
    },
    policyDetails: {
        padding: spacing.lg,
        borderTopWidth: 1,
        gap: spacing.md,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    detailLabel: {
        fontSize: font.base,
        width: 60,
    },
    detailValue: {
        fontSize: font.base,
        fontWeight: '600',
        flex: 1,
    },
    coverageBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: 10,
        gap: spacing.sm,
        marginTop: spacing.xs,
    },
    coverageText: {
        fontSize: font.md,
        fontWeight: '600',
        flex: 1,
    },
    policyStatusBadge: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    policyStatusText: {
        fontSize: font.sm,
        fontWeight: '700',
    },
    insureCta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.lg,
        gap: spacing.sm,
    },
    insureCtaText: {
        fontSize: font.base,
        fontWeight: '700',
    },
});
