import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useMyPolicies } from '@/src/hooks/insurance/useMyPolicies';
import type { PetWithPolicy } from '@/src/hooks/insurance/useMyPolicies';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import DataList from '@/src/components/data/DataList';
import {
    Shield,
    ShieldCheck,
    ShieldX,
    Calendar,
    DollarSign,
    FileText,
    ChevronRight,
} from 'lucide-react-native';

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
        const petEmoji = pet.species === 'perro' || pet.species === 'dog' ? '🐕' : '🐈';

        return (
            <View style={[styles.policyCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                {/* Pet Header */}
                <View style={styles.petHeader}>
                    <Text style={styles.petEmoji}>{petEmoji}</Text>
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
                            { backgroundColor: hasPolicy ? '#10b981' + '15' : '#ef4444' + '15' },
                        ]}
                    >
                        {hasPolicy ? (
                            <ShieldCheck size={14} color="#10b981" />
                        ) : (
                            <ShieldX size={14} color="#ef4444" />
                        )}
                        <Text
                            style={[
                                styles.statusText,
                                { color: hasPolicy ? '#10b981' : '#ef4444' },
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
                                {new Date(policy.start_date).toLocaleDateString()} — {new Date(policy.end_date).toLocaleDateString()}
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
                                    Estado: {policy.status}
                                </Text>
                            </View>
                        )}
                    </View>
                ) : (
                    <TouchableOpacity
                        style={[styles.insureCta, { backgroundColor: theme.primary + '10' }]}
                        onPress={() => router.push('/aseguradoras/cotizar' as any)}
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
                title="🛡️ Mis Pólizas"
                subtitle="Seguros activos de tus mascotas"
            />

            {/* Summary Stats */}
            {!isLoading && petsWithPolicies.length > 0 && (
                <View style={styles.statsRow}>
                    <View style={[styles.statCard, { backgroundColor: '#10b981' + '15' }]}>
                        <ShieldCheck size={20} color="#10b981" />
                        <Text style={[styles.statValue, { color: '#10b981' }]}>{insuredCount}</Text>
                        <Text style={[styles.statLabel, { color: '#10b981' }]}>Aseguradas</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: '#ef4444' + '15' }]}>
                        <ShieldX size={20} color="#ef4444" />
                        <Text style={[styles.statValue, { color: '#ef4444' }]}>{uninsuredCount}</Text>
                        <Text style={[styles.statLabel, { color: '#ef4444' }]}>Sin seguro</Text>
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
        paddingHorizontal: 24,
        gap: 12,
        marginBottom: 20,
    },
    statCard: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        gap: 6,
    },
    statValue: {
        fontSize: 28,
        fontWeight: '900',
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    list: {
        paddingHorizontal: 24,
        paddingBottom: 100,
    },
    policyCard: {
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 16,
        overflow: 'hidden',
    },
    petHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
    },
    petEmoji: {
        fontSize: 32,
    },
    petInfo: {
        flex: 1,
    },
    petName: {
        fontSize: 18,
        fontWeight: '800',
    },
    petBreed: {
        fontSize: 13,
        marginTop: 2,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
        gap: 4,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
    },
    policyDetails: {
        padding: 16,
        borderTopWidth: 1,
        gap: 12,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailLabel: {
        fontSize: 13,
        width: 60,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
    },
    coverageBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 10,
        gap: 6,
        marginTop: 4,
    },
    coverageText: {
        fontSize: 12,
        fontWeight: '600',
        flex: 1,
    },
    policyStatusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    policyStatusText: {
        fontSize: 11,
        fontWeight: '700',
    },
    insureCta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
        gap: 6,
    },
    insureCtaText: {
        fontSize: 14,
        fontWeight: '700',
    },
});
