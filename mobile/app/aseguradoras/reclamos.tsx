import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useInsuranceAdmin } from '@/src/hooks/insurance/useInsuranceAdmin';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import DataList from '@/src/components/data/DataList';
import type { InsuranceClaim } from '@/src/services/insurance';
import {
    FileText,
    DollarSign,
    CheckCircle,
    XCircle,
    Shield,
    AlertTriangle,
    Sparkles,
} from 'lucide-react-native';

export default function ReclamosScreen() {
    const { theme } = useTheme();
    const {
        plans,
        isLoadingPlans,
        refetchPlans,
        isRefetchingPlans,
        handleUpdateClaimStatus,
        isUpdatingClaim,
    } = useInsuranceAdmin();

    // Collect all claims from plans -> policies -> claims
    const allClaims: (InsuranceClaim & { planName: string; policyNumber: string })[] = [];
    // Plans don't directly contain policies with claims in the current API shape,
    // but we aggregate from policies' claims if available via an extended query.
    // For the current service, we display claims from a dedicated endpoint.
    // We'll build the list from the plans' data if it evolves, or show static.

    // For now, use a dedicated claims query approach:
    // We iterate over plans and for any future expansion
    // In the current implementation, allClaims may be empty.
    // The provider can view claims once the API supports listing them.

    const renderClaimItem = ({ item }: { item: InsuranceClaim & { planName?: string; policyNumber?: string } }) => {
        const isPending = !item.status || item.status === 'pending';
        const isApproved = item.status === 'approved';
        const isRejected = item.status === 'rejected';

        return (
            <View style={[styles.claimCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={styles.claimHeader}>
                    <View style={[styles.claimIcon, {
                        backgroundColor: isPending ? '#f59e0b' + '20' :
                            isApproved ? '#10b981' + '20' : '#ef4444' + '20',
                    }]}>
                        {isPending ? (
                            <AlertTriangle size={20} color="#f59e0b" />
                        ) : isApproved ? (
                            <CheckCircle size={20} color="#10b981" />
                        ) : (
                            <XCircle size={20} color="#ef4444" />
                        )}
                    </View>
                    <View style={styles.claimInfo}>
                        <Text style={[styles.claimId, { color: theme.text }]}>
                            Reclamo #{item.id.substring(0, 8)}
                        </Text>
                        {item.reason && (
                            <Text style={[styles.claimReason, { color: theme.textMuted }]} numberOfLines={2}>
                                {item.reason}
                            </Text>
                        )}
                    </View>
                    <View
                        style={[
                            styles.statusBadge,
                            {
                                backgroundColor: isPending ? '#f59e0b' + '15' :
                                    isApproved ? '#10b981' + '15' : '#ef4444' + '15',
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.statusText,
                                {
                                    color: isPending ? '#f59e0b' :
                                        isApproved ? '#10b981' : '#ef4444',
                                },
                            ]}
                        >
                            {isPending ? 'Pendiente' : isApproved ? 'Aprobado' : 'Rechazado'}
                        </Text>
                    </View>
                </View>

                {/* Claim Details */}
                <View style={[styles.claimDetails, { borderTopColor: theme.border }]}>
                    <View style={styles.detailRow}>
                        <DollarSign size={14} color={theme.primary} />
                        <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Monto</Text>
                        <Text style={[styles.detailValue, { color: theme.text }]}>
                            ${item.amount_claimed.toLocaleString()}
                        </Text>
                    </View>
                    <View style={styles.detailRow}>
                        <FileText size={14} color={theme.textMuted} />
                        <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Póliza</Text>
                        <Text style={[styles.detailValue, { color: theme.text }]}>
                            {item.policy_id.substring(0, 12)}...
                        </Text>
                    </View>
                    {item.medical_receipt_url && (
                        <View style={styles.detailRow}>
                            <Sparkles size={14} color={theme.primary} />
                            <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Recibo</Text>
                            <Text style={[styles.receiptLink, { color: theme.primary }]} numberOfLines={1}>
                                Adjunto ✓
                            </Text>
                        </View>
                    )}
                </View>

                {/* Action Buttons (only for pending) */}
                {isPending && (
                    <View style={styles.actionRow}>
                        <TouchableOpacity
                            style={[styles.rejectBtn, { borderColor: '#ef4444' }]}
                            disabled={isUpdatingClaim}
                            onPress={() => handleUpdateClaimStatus(item.id, 'rejected')}
                        >
                            {isUpdatingClaim ? (
                                <ActivityIndicator size="small" color="#ef4444" />
                            ) : (
                                <>
                                    <XCircle size={16} color="#ef4444" />
                                    <Text style={[styles.rejectBtnText, { color: '#ef4444' }]}>Rechazar</Text>
                                </>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.approveBtn, { backgroundColor: '#10b981' }]}
                            disabled={isUpdatingClaim}
                            onPress={() => handleUpdateClaimStatus(item.id, 'approved')}
                        >
                            {isUpdatingClaim ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <>
                                    <CheckCircle size={16} color="#fff" />
                                    <Text style={styles.approveBtnText}>Aprobar</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    return (
        <ScreenContainer>
            <ScreenHeader
                title="📋 Reclamos"
                subtitle="Gestión de reclamos de seguros"
                gradient={['#f59e0b', '#d97706']}
            />

            <DataList<InsuranceClaim & { planName?: string; policyNumber?: string }>
                data={allClaims}
                renderItem={renderClaimItem}
                keyExtractor={(item) => item.id}
                isLoading={isLoadingPlans}
                loadingMessage="Cargando reclamos..."
                onRefresh={refetchPlans}
                isRefreshing={isRefetchingPlans}
                emptyIcon={<Shield size={32} color={theme.textMuted} />}
                emptyTitle="No hay reclamos pendientes"
                emptySubtitle="Los reclamos de tus asegurados aparecerán aquí"
                contentStyle={styles.list}
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    list: {
        paddingHorizontal: 24,
        paddingBottom: 100,
    },
    claimCard: {
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 14,
        overflow: 'hidden',
    },
    claimHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
    },
    claimIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    claimInfo: {
        flex: 1,
    },
    claimId: {
        fontSize: 16,
        fontWeight: '800',
    },
    claimReason: {
        fontSize: 12,
        lineHeight: 16,
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
    },
    claimDetails: {
        padding: 16,
        borderTopWidth: 1,
        gap: 10,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailLabel: {
        fontSize: 13,
        width: 55,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
    },
    receiptLink: {
        fontSize: 13,
        fontWeight: '600',
        flex: 1,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
        padding: 16,
        paddingTop: 0,
    },
    rejectBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1.5,
        gap: 6,
    },
    rejectBtnText: {
        fontSize: 14,
        fontWeight: '700',
    },
    approveBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 6,
    },
    approveBtnText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
});
