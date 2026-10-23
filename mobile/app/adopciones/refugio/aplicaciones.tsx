import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import DataList from '@/src/components/data/DataList';
import { ClipboardList, Eye, Clock, CheckCircle, XCircle } from 'lucide-react-native';
import {
    useRefugeApplications,
    STATUS_TONES,
    STATUS_LABELS,
} from '@/src/hooks/adopciones/useRefugeApplications';
import type { AdoptionForm } from '@/src/types/adopciones';
import { font, spacing } from '@/constants/design';

export default function RefugeApplicationsScreen() {
    const { theme } = useTheme();
    const {
        applications,
        isLoading,
        isRefetching,
        refetch,
        goToApplicationDetail,
    } = useRefugeApplications();

    const colorFor = (status: string) => theme[STATUS_TONES[status] || 'warning'] as string;

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <CheckCircle size={14} color={colorFor(status)} />;
            case 'rejected':
                return <XCircle size={14} color={colorFor(status)} />;
            default:
                return <Clock size={14} color={colorFor(status)} />;
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-MX', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const renderItem = ({ item }: { item: AdoptionForm }) => {
        const statusColor = colorFor(item.status);
        const statusLabel = STATUS_LABELS[item.status] || item.status;

        return (
            <TouchableOpacity
                style={[styles.card, { backgroundColor: theme.surface }]}
                accessibilityRole="button"
                accessibilityLabel={`Revisar postulación${item.pet_name ? ` por ${item.pet_name}` : ''}`}
                onPress={() => goToApplicationDetail(item.id)}
                activeOpacity={0.7}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.cardTitleRow}>
                        <ClipboardList size={20} color={theme.primary} />
                        <Text style={[styles.cardTitle, { color: theme.text }]}>
                            {item.pet_name ? `Postulación por ${item.pet_name}` : `Postulación #${item.id.slice(0, 8)}`}
                        </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                        {getStatusIcon(item.status)}
                        <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
                    </View>
                </View>

                <View style={styles.cardBody}>
                    <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Compatibilidad</Text>
                        <View style={styles.scoreContainer}>
                            <View style={[styles.scoreBar, { backgroundColor: theme.surface }]}>
                                <View
                                    style={[
                                        styles.scoreFill,
                                        {
                                            width: `${item.compatibility_score}%`,
                                            backgroundColor:
                                                item.compatibility_score >= 70 ? theme.success :
                                                item.compatibility_score >= 40 ? theme.warning : theme.error,
                                        },
                                    ]}
                                />
                            </View>
                            <Text style={[styles.scoreText, { color: theme.text }]}>
                                {item.compatibility_score}%
                            </Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Experiencia</Text>
                        <Text style={[styles.infoValue, { color: theme.text }]}>
                            {item.experience_level ? item.experience_level.charAt(0).toUpperCase() + item.experience_level.slice(1) : 'No especificada'}
                        </Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Fecha</Text>
                        <Text style={[styles.infoValue, { color: theme.text }]}>
                            {formatDate(item.created_at)}
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.reviewBtn, { backgroundColor: theme.primary + '15' }]}
                    onPress={() => goToApplicationDetail(item.id)}
                >
                    <Eye size={16} color={theme.primary} />
                    <Text style={[styles.reviewBtnText, { color: theme.primary }]}>Revisar</Text>
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    return (
        <ScreenContainer>
            <ScreenHeader title="Postulaciones" />

            <DataList
                data={applications}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                isLoading={isLoading}
                onRefresh={refetch}
                isRefreshing={isRefetching}
                contentStyle={styles.list}
                emptyIcon={<ClipboardList size={48} color={theme.textMuted} strokeWidth={1.5} />}
                emptyTitle="Sin solicitudes"
                emptySubtitle="Aún no hay solicitudes de adopción para revisar"
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    list: {
        padding: spacing.xl,
        gap: spacing.lg,
    },
    card: {
        borderRadius: 20,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: 'rgba(128,128,128,0.2)',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    cardTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    cardTitle: {
        fontSize: font.lg,
        fontWeight: '800',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: 8,
        gap: spacing.xs,
    },
    statusText: {
        fontSize: font.sm,
        fontWeight: '700',
    },
    cardBody: {
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: font.base,
        fontWeight: '600',
    },
    infoValue: {
        fontSize: font.base,
        fontWeight: '700',
    },
    scoreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    scoreBar: {
        width: 80,
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    scoreFill: {
        height: '100%',
        borderRadius: 3,
    },
    scoreText: {
        fontSize: font.base,
        fontWeight: '800',
    },
    reviewBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        borderRadius: 14,
        gap: spacing.sm,
    },
    reviewBtnText: {
        fontSize: font.base,
        fontWeight: '800',
    },
});
