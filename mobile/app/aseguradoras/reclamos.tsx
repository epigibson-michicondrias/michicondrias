import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useInsuranceAdmin } from '@/src/hooks/insurance/useInsuranceAdmin';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import DataList from '@/src/components/data/DataList';
import type { InsuranceClaimDetail } from '@/src/services/insurance';
import { statusTone } from '@/src/features/salud/format';
import { useQueryClient } from '@tanstack/react-query';
import {
    FileText,
    DollarSign,
    CheckCircle,
    XCircle,
    Shield,
    AlertTriangle,
    Sparkles,
} from 'lucide-react-native';
import { font, spacing } from '@/constants/design';

export default function ReclamosScreen() {
    const { theme } = useTheme();
    const {
        allClaims,
        isLoadingClaims,
        handleUpdateClaimStatus,
        isUpdatingClaim,
    } = useInsuranceAdmin();
    const queryClient = useQueryClient();
    const [refreshing, setRefreshing] = React.useState(false);
    const refetchClaims = async () => {
        setRefreshing(true);
        try { await queryClient.refetchQueries({ queryKey: ['insuranceClaims'] }); } finally { setRefreshing(false); }
    };

    const openReceipt = (url?: string) => {
        if (!url || !/^https?:\/\//i.test(url)) return;
        Linking.openURL(url).catch(() => undefined);
    };

    const renderClaimItem = ({ item }: { item: InsuranceClaimDetail }) => {
        const isPending = !item.status || item.status === 'pending';
        const isApproved = item.status === 'approved';
        const tone = statusTone(theme, item.status);

        return (
            <View style={[styles.claimCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={styles.claimHeader}>
                    <View style={[styles.claimIcon, { backgroundColor: tone.bg }]}>
                        {isPending ? (
                            <AlertTriangle size={20} color={tone.color} />
                        ) : isApproved ? (
                            <CheckCircle size={20} color={tone.color} />
                        ) : (
                            <XCircle size={20} color={tone.color} />
                        )}
                    </View>
                    <View style={styles.claimInfo}>
                        <Text style={[styles.claimId, { color: theme.text }]} numberOfLines={1}>
                            {item.pet_name ? `Reclamo de ${item.pet_name}` : `Reclamo #${item.id.substring(0, 8)}`}
                        </Text>
                        {item.reason && (
                            <Text style={[styles.claimReason, { color: theme.textMuted }]} numberOfLines={2}>
                                {item.reason}
                            </Text>
                        )}
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: tone.bg }]}>
                        <Text style={[styles.statusText, { color: tone.color }]}>{tone.label}</Text>
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
                            {item.policy_number || `${item.policy_id.substring(0, 12)}...`}
                        </Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Sparkles size={14} color={theme.primary} />
                        <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Recibo</Text>
                        {item.medical_receipt_url ? (
                            <TouchableOpacity accessibilityRole="link" accessibilityLabel="Ver comprobante" onPress={() => openReceipt(item.medical_receipt_url)} style={{ flex: 1 }}>
                                <Text style={[styles.receiptLink, { color: theme.primary }]} numberOfLines={1}>Ver comprobante</Text>
                            </TouchableOpacity>
                        ) : (
                            <Text style={[styles.receiptLink, { color: theme.warning }]}>Sin comprobante</Text>
                        )}
                    </View>
                </View>

                {/* Action Buttons (only for pending) */}
                {isPending && (
                    <View style={styles.actionRow}>
                        <TouchableOpacity
                            style={[styles.rejectBtn, { borderColor: theme.error }]}
                            disabled={isUpdatingClaim}
                            onPress={() => handleUpdateClaimStatus(item.id, 'rejected')}
                        >
                            {isUpdatingClaim ? (
                                <ActivityIndicator size="small" color={theme.error} />
                            ) : (
                                <>
                                    <XCircle size={16} color={theme.error} />
                                    <Text style={[styles.rejectBtnText, { color: theme.error }]}>Rechazar</Text>
                                </>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.approveBtn, { backgroundColor: theme.success }]}
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
                title="Reclamos"
                subtitle="Gestión de reclamos de seguros"
            />

            <DataList<InsuranceClaimDetail>
                data={allClaims}
                renderItem={renderClaimItem}
                keyExtractor={(item) => item.id}
                isLoading={isLoadingClaims}
                loadingMessage="Cargando reclamos..."
                onRefresh={refetchClaims}
                isRefreshing={refreshing}
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
        paddingHorizontal: spacing.xxl,
        paddingBottom: 100,
    },
    claimCard: {
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: spacing.lg,
        overflow: 'hidden',
    },
    claimHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        gap: spacing.md,
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
        fontSize: font.xl,
        fontWeight: '800',
    },
    claimReason: {
        fontSize: font.md,
        lineHeight: 16,
        marginTop: spacing.xxs,
    },
    statusBadge: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: 8,
    },
    statusText: {
        fontSize: font.sm,
        fontWeight: '700',
    },
    claimDetails: {
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
        width: 55,
    },
    detailValue: {
        fontSize: font.base,
        fontWeight: '600',
        flex: 1,
    },
    receiptLink: {
        fontSize: font.base,
        fontWeight: '600',
        flex: 1,
    },
    actionRow: {
        flexDirection: 'row',
        gap: spacing.md,
        padding: spacing.lg,
        paddingTop: 0,
    },
    rejectBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        borderRadius: 12,
        borderWidth: 1.5,
        gap: spacing.sm,
    },
    rejectBtnText: {
        fontSize: font.base,
        fontWeight: '700',
    },
    approveBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        borderRadius: 12,
        gap: spacing.sm,
    },
    approveBtnText: {
        color: '#fff',
        fontSize: font.base,
        fontWeight: '700',
    },
});
