import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import DataList from '@/src/components/data/DataList';
import { ClipboardList, Eye, Clock, CheckCircle, XCircle } from 'lucide-react-native';
import {
    useRefugeApplications,
    STATUS_COLORS,
    STATUS_LABELS,
} from '@/src/hooks/adopciones/useRefugeApplications';
import type { AdoptionForm } from '@/src/types/adopciones';

export default function RefugeApplicationsScreen() {
    const { theme } = useTheme();
    const {
        applications,
        isLoading,
        isRefetching,
        refetch,
        goToApplicationDetail,
    } = useRefugeApplications();

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <CheckCircle size={14} color={STATUS_COLORS[status]} />;
            case 'rejected':
                return <XCircle size={14} color={STATUS_COLORS[status]} />;
            default:
                return <Clock size={14} color={STATUS_COLORS[status] || '#f59e0b'} />;
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
        const statusColor = STATUS_COLORS[item.status] || '#f59e0b';
        const statusLabel = STATUS_LABELS[item.status] || item.status;

        return (
            <TouchableOpacity
                style={[styles.card, { backgroundColor: theme.surface }]}
                onPress={() => goToApplicationDetail(item.id)}
                activeOpacity={0.7}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.cardTitleRow}>
                        <ClipboardList size={20} color={theme.primary} />
                        <Text style={[styles.cardTitle, { color: theme.text }]}>
                            Solicitud #{item.id.slice(0, 8)}
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
                                                item.compatibility_score >= 70 ? '#10b981' :
                                                item.compatibility_score >= 40 ? '#f59e0b' : '#ef4444',
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
                            {item.experience_level || 'No especificada'}
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
            <ScreenHeader title="Solicitudes del Refugio" />

            <DataList
                data={applications}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                isLoading={isLoading}
                onRefresh={refetch}
                isRefreshing={isRefetching}
                contentStyle={styles.list}
                emptyIcon={<Text style={{ fontSize: 48 }}>📋</Text>}
                emptyTitle="Sin solicitudes"
                emptySubtitle="Aún no hay solicitudes de adopción para revisar"
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    list: {
        padding: 20,
        gap: 16,
    },
    card: {
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '800',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
    },
    cardBody: {
        gap: 12,
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: 13,
        fontWeight: '600',
    },
    infoValue: {
        fontSize: 13,
        fontWeight: '700',
    },
    scoreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
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
        fontSize: 13,
        fontWeight: '800',
    },
    reviewBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 14,
        gap: 8,
    },
    reviewBtnText: {
        fontSize: 14,
        fontWeight: '800',
    },
});
