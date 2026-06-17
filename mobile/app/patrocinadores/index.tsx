import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useSponsors } from '@/src/hooks/sponsors/useSponsors';
import { SponsorCampaign } from '@/src/services/sponsors';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { Megaphone, DollarSign, TrendingUp, Plus } from 'lucide-react-native';
import SearchBar from '@/src/components/SearchBar';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import EmptyState from '@/src/components/EmptyState';

export default function PatrocinadoresScreen() {
    const { theme } = useTheme();
    const { searchQuery, setSearchQuery, campaigns, isLoading, router } = useSponsors();

    const renderCampaignItem = ({ item }: { item: SponsorCampaign }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => {}}
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
        </TouchableOpacity>
    );

    return (
        <ScreenContainer>
            <ScreenHeader
                title="📣 Patrocinadores"
                subtitle="Campañas publicitarias y promociones activas"
            />

            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.primary }]}
                    onPress={() => router.push('/patrocinadores/nuevo')}
                >
                    <Plus size={18} color="#fff" />
                    <Text style={[styles.actionButtonText, { color: '#fff' }]}>Ser Patrocinador</Text>
                </TouchableOpacity>
            </View>

            <View style={{ marginHorizontal: 24, marginBottom: 20 }}>
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
        paddingHorizontal: 24,
        gap: 12,
        marginBottom: 16,
    },
    actionButton: {
        flexDirection: 'row',
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    list: {
        paddingHorizontal: 24,
        paddingBottom: 100,
    },
    card: {
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 16,
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
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 4,
    },
    cardLink: {
        fontSize: 13,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    statItem: {
        flex: 1,
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        gap: 4,
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '600',
    },
    statValue: {
        fontSize: 16,
        fontWeight: '800',
    },
});
