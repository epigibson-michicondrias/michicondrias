import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Linking } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useSponsors } from '@/src/hooks/sponsors/useSponsors';
import { SponsorCampaign, recordCampaignClick } from '@/src/services/sponsors';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { useAuth } from '@/src/contexts/AuthContext';
import { Megaphone, DollarSign, TrendingUp, Plus } from 'lucide-react-native';
import SearchBar from '@/src/components/SearchBar';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import EmptyState from '@/src/components/EmptyState';
import AppRefreshControl from '@/src/components/AppRefreshControl';
import { font, spacing, layout } from '@/constants/design';

export default function PatrocinadoresScreen() {
    const { theme } = useTheme();
    const { user } = useAuth();
    const { searchQuery, setSearchQuery, campaigns, isLoading, router } = useSponsors();

    const renderCampaignItem = ({ item }: { item: SponsorCampaign }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
            disabled={!item.target_link}
            onPress={() => { if (item.target_link) { recordCampaignClick(item.id).catch(() => {}); Linking.openURL(item.target_link).catch(() => {}); } }}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: '#f59e0b20' }]}>
                    <Megaphone size={24} color="#f59e0b" />
                </View>
                <View style={styles.cardInfo}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
                    {item.target_link && (
                        <Text style={[styles.cardLink, { color: theme.primary }]} numberOfLines={1}>
                            {item.target_link}
                        </Text>
                    )}
                </View>
            </View>

            {item.sponsor_id === user?.id && (
            <View style={styles.statsRow}>
                <View style={[styles.statItem, { backgroundColor: theme.background }]}>
                    <DollarSign size={14} color={theme.secondary} />
                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>Presupuesto</Text>
                    <Text style={[styles.statValue, { color: theme.secondary }]}>${item.budget_limit}</Text>
                </View>
                <View style={[styles.statItem, { backgroundColor: theme.background }]}>
                    <TrendingUp size={14} color={theme.primary} />
                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>Gastado</Text>
                    <Text style={[styles.statValue, { color: theme.primary }]}>${item.spent}</Text>
                </View>
            </View>
            )}
        </TouchableOpacity>
    );

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Patrocinadores"
                subtitle="Campañas publicitarias y promociones activas"
            />

            {user?.role_name === 'patrocinador' && (
            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.primary }]}
                    onPress={() => router.push('/patrocinadores/nuevo')}
                >
                    <Plus size={18} color="#fff" />
                    <Text style={[styles.actionButtonText, { color: '#fff' }]}>Nueva campaña</Text>
                </TouchableOpacity>
            </View>
            )}

            <View style={{ marginHorizontal: layout.screenPadding, marginBottom: spacing.xl }}>
                <SearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Buscar campañas..."
                />
            </View>

            {isLoading ? (
                <LoadingOverlay message="Cargando campañas..." />
            ) : (
                <FlatList
            refreshControl={<AppRefreshControl />}
                    data={campaigns}
                    renderItem={renderCampaignItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <EmptyState
                            icon={<Megaphone size={32} color={theme.textMuted} />}
                            title={searchQuery ? 'No se encontraron campañas.' : 'No hay campañas activas.'}
                        />
                    }
                />
            )}
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    actionButtons: {
        flexDirection: 'row',
        paddingHorizontal: layout.screenPadding,
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    actionButton: {
        flexDirection: 'row',
        flex: 1,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
    },
    actionButtonText: {
        fontSize: font.base,
        fontWeight: '600',
    },
    list: {
        paddingHorizontal: layout.screenPadding,
        paddingBottom: 100,
    },
    card: {
        padding: spacing.xl,
        borderRadius: 16,
        marginBottom: spacing.lg,
        borderWidth: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
        gap: spacing.lg,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardInfo: {
        flex: 1,
    },
    cardTitle: {
        fontSize: font.xxl,
        fontWeight: '800',
        marginBottom: spacing.xs,
    },
    cardLink: {
        fontSize: font.base,
    },
    statsRow: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    statItem: {
        flex: 1,
        padding: spacing.md,
        borderRadius: 12,
        alignItems: 'center',
        gap: spacing.xs,
    },
    statLabel: {
        fontSize: font.sm,
        fontWeight: '600',
    },
    statValue: {
        fontSize: font.xl,
        fontWeight: '800',
    },
});
