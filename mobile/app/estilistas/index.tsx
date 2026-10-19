import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { GroomingService } from '../../src/services/grooming';
import { useGroomingServices } from '@/src/hooks/grooming/useGroomingServices';
import { useTheme } from '@/src/hooks/useTheme';
import { Scissors, Clock, DollarSign, Plus } from 'lucide-react-native';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import DataList from '@/src/components/data/DataList';
import SearchBar from '@/src/components/SearchBar';
import { Stars } from '@/src/components/reviews/ReviewsSection';

import { useAuth } from '@/src/contexts/AuthContext';
import { font, spacing, layout } from '@/constants/design';

export default function EstilistasScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { user } = useAuth();

    const roleName = user?.role_name || '';
    const isStyler = roleName === 'estilista' || roleName === 'groomer' || roleName === 'admin';

    const {
        services,
        isLoading,
        refetch,
        isRefetching,
        searchQuery,
        setSearchQuery,
        hasActiveFilters,
    } = useGroomingServices();

    const renderServiceItem = ({ item }: { item: GroomingService }) => (
        <TouchableOpacity accessibilityRole="button"
            style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => router.push({ pathname: '/grooming/agendar', params: { service_id: item.id } } as any)}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
                    <Scissors size={24} color={theme.primary} />
                </View>
                <View style={styles.cardInfo}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>{item.name}</Text>
                    {item.description && (
                        <Text style={[styles.cardDesc, { color: theme.textMuted }]} numberOfLines={2}>
                            {item.description}
                        </Text>
                    )}
                    {item.groomer_rating_count ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs }}>
                            <Stars value={item.groomer_rating_avg ?? 0} size={13} />
                            <Text style={[styles.cardDesc, { color: theme.textMuted }]}>
                                {(item.groomer_rating_avg ?? 0).toFixed(1)} ({item.groomer_rating_count})
                            </Text>
                        </View>
                    ) : null}
                </View>
            </View>

            <View style={styles.cardMeta}>
                <View style={styles.metaItem}>
                    <DollarSign size={14} color={theme.secondary} />
                    <Text style={[styles.metaText, { color: theme.secondary }]}>${item.price}</Text>
                </View>
                <View style={styles.metaItem}>
                    <Clock size={14} color={theme.textMuted} />
                    <Text style={[styles.metaText, { color: theme.textMuted }]}>{item.duration_minutes} min</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const listHeader = (
        <>
            <View style={styles.actionButtons}>
                {isStyler ? (
                    <TouchableOpacity accessibilityRole="button"
                        style={[styles.actionButton, { backgroundColor: theme.primary }]}
                        onPress={() => router.push('/estilistas/nuevo')}
                    >
                        <Plus size={18} color={theme.onPrimary} />
                        <Text style={[styles.actionButtonText, { color: theme.onPrimary }]}>Ofrecer Servicios</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity accessibilityRole="button"
                        style={[styles.actionButton, { backgroundColor: theme.secondary }]}
                        onPress={() => router.push('/grooming/mis-citas')}
                    >
                        <Scissors size={18} color={theme.onPrimary} />
                        <Text style={[styles.actionButtonText, { color: theme.onPrimary }]}>Mis Citas</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.searchContainer}>
                <SearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Buscar servicios de grooming..."
                />
            </View>
        </>
    );

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Estilistas"
                subtitle="Servicios de grooming y estética para tu mascota"
            />

            <DataList
                data={services}
                renderItem={renderServiceItem}
                keyExtractor={(item) => item.id}
                isLoading={isLoading}
                loadingMessage="Cargando servicios..."
                onRefresh={refetch}
                isRefreshing={isRefetching}
                header={listHeader}
                emptyIcon={<Scissors size={32} color={theme.textMuted} />}
                emptyTitle={hasActiveFilters ? 'No se encontraron servicios.' : 'No hay servicios disponibles.'}
                contentStyle={styles.list}
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    actionButtons: {
        flexDirection: 'row',
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
    searchContainer: {
        marginBottom: spacing.xl,
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
    cardDesc: {
        fontSize: font.base,
        lineHeight: 20,
    },
    cardMeta: {
        flexDirection: 'row',
        gap: spacing.xl,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    metaText: {
        fontSize: font.base,
        fontWeight: '600',
    },
});
