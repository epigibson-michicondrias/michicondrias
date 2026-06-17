import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useCampaignStats } from '@/src/hooks/sponsors/useCampaignStats';
import { CampaignWithStats } from '@/src/services/sponsors';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import EmptyState from '@/src/components/EmptyState';
import { BarChart3, Eye, MousePointerClick, TrendingUp, DollarSign, Megaphone } from 'lucide-react-native';

export default function EstadisticasScreen() {
    const { theme } = useTheme();
    const {
        campaigns,
        isLoading,
        refetch,
        isRefetching,
        metrics,
        handleRecordClick,
    } = useCampaignStats();

    const renderStatsCards = () => (
        <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={[styles.statIcon, { backgroundColor: '#3b82f620' }]}>
                    <Eye size={20} color="#3b82f6" />
                </View>
                <Text style={[styles.statValue, { color: theme.text }]}>
                    {metrics.totalViews.toLocaleString()}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>Vistas</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={[styles.statIcon, { backgroundColor: '#10b98120' }]}>
                    <MousePointerClick size={20} color="#10b981" />
                </View>
                <Text style={[styles.statValue, { color: theme.text }]}>
                    {metrics.totalClicks.toLocaleString()}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>Clicks</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={[styles.statIcon, { backgroundColor: '#f59e0b20' }]}>
                    <TrendingUp size={20} color="#f59e0b" />
                </View>
                <Text style={[styles.statValue, { color: theme.text }]}>
                    {metrics.averageCTR.toFixed(1)}%
                </Text>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>CTR</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={[styles.statIcon, { backgroundColor: '#ef444420' }]}>
                    <DollarSign size={20} color="#ef4444" />
                </View>
                <Text style={[styles.statValue, { color: theme.text }]}>
                    ${metrics.totalSpent.toLocaleString()}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>Gastado</Text>
            </View>
        </View>
    );

    const renderCampaignItem = ({ item }: { item: CampaignWithStats }) => {
        const views = item.stats?.views_count ?? 0;
        const clicks = item.stats?.clicks_count ?? 0;
        const ctr = views > 0 ? ((clicks / views) * 100).toFixed(1) : '0.0';
        const budgetUsed = item.budget_limit > 0
            ? ((item.spent / item.budget_limit) * 100).toFixed(0)
            : '0';

        return (
            <TouchableOpacity
                style={[styles.campaignCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => handleRecordClick(item.id)}
            >
                <View style={styles.campaignHeader}>
                    <View style={[styles.campaignIcon, { backgroundColor: '#f59e0b20' }]}>
                        <Megaphone size={20} color="#f59e0b" />
                    </View>
                    <View style={styles.campaignInfo}>
                        <Text style={[styles.campaignTitle, { color: theme.text }]} numberOfLines={1}>
                            {item.title}
                        </Text>
                        <View style={styles.statusRow}>
                            <View style={[
                                styles.statusBadge,
                                { backgroundColor: item.active ? '#10b98120' : '#ef444420' },
                            ]}>
                                <Text style={[
                                    styles.statusText,
                                    { color: item.active ? '#10b981' : '#ef4444' },
                                ]}>
                                    {item.active ? 'Activa' : 'Inactiva'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.metricsRow}>
                    <View style={[styles.metricItem, { backgroundColor: theme.background }]}>
                        <Eye size={12} color="#3b82f6" />
                        <Text style={[styles.metricValue, { color: theme.text }]}>{views}</Text>
                        <Text style={[styles.metricLabel, { color: theme.textMuted }]}>vistas</Text>
                    </View>
                    <View style={[styles.metricItem, { backgroundColor: theme.background }]}>
                        <MousePointerClick size={12} color="#10b981" />
                        <Text style={[styles.metricValue, { color: theme.text }]}>{clicks}</Text>
                        <Text style={[styles.metricLabel, { color: theme.textMuted }]}>clicks</Text>
                    </View>
                    <View style={[styles.metricItem, { backgroundColor: theme.background }]}>
                        <TrendingUp size={12} color="#f59e0b" />
                        <Text style={[styles.metricValue, { color: theme.text }]}>{ctr}%</Text>
                        <Text style={[styles.metricLabel, { color: theme.textMuted }]}>CTR</Text>
                    </View>
                </View>

                {/* Budget progress bar */}
                <View style={styles.budgetRow}>
                    <Text style={[styles.budgetLabel, { color: theme.textMuted }]}>
                        ${item.spent} / ${item.budget_limit}
                    </Text>
                    <Text style={[styles.budgetPercent, { color: theme.primary }]}>{budgetUsed}%</Text>
                </View>
                <View style={[styles.progressTrack, { backgroundColor: theme.background }]}>
                    <View
                        style={[
                            styles.progressBar,
                            {
                                backgroundColor: theme.primary,
                                width: `${Math.min(Number(budgetUsed), 100)}%`,
                            },
                        ]}
                    />
                </View>
            </TouchableOpacity>
        );
    };

    if (isLoading) {
        return (
            <ScreenContainer>
                <ScreenHeader title="📊 Estadísticas" subtitle="Métricas de tus campañas" />
                <LoadingOverlay message="Cargando estadísticas..." />
            </ScreenContainer>
        );
    }

    return (
        <ScreenContainer>
            <ScreenHeader
                title="📊 Estadísticas"
                subtitle="Métricas de tus campañas"
            />

            <FlatList
                data={campaigns}
                renderItem={renderCampaignItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={renderStatsCards}
                ListEmptyComponent={
                    <EmptyState
                        icon={<BarChart3 size={32} color={theme.textMuted} />}
                        title="Sin datos estadísticos"
                    />
                }
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={refetch}
                        tintColor={theme.primary}
                    />
                }
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    list: {
        paddingHorizontal: 24,
        paddingBottom: 100,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        width: '47%',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: 'center',
        gap: 8,
    },
    statIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statValue: {
        fontSize: 22,
        fontWeight: '900',
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    campaignCard: {
        padding: 20,
        borderRadius: 16,
        marginBottom: 14,
        borderWidth: 1,
    },
    campaignHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    campaignIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    campaignInfo: {
        flex: 1,
    },
    campaignTitle: {
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 4,
    },
    statusRow: {
        flexDirection: 'row',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
    },
    metricsRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 14,
    },
    metricItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderRadius: 10,
        gap: 4,
    },
    metricValue: {
        fontSize: 13,
        fontWeight: '800',
    },
    metricLabel: {
        fontSize: 10,
        fontWeight: '600',
    },
    budgetRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    budgetLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    budgetPercent: {
        fontSize: 12,
        fontWeight: '800',
    },
    progressTrack: {
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 3,
    },
});
