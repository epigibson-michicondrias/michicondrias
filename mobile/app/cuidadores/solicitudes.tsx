import React from 'react';
import { StyleSheet, View, FlatList, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useSitRequests } from '@/src/hooks/cuidadores';
import { STATUS_FILTERS } from '@/src/hooks/servicios-pro/requestStatus';
import ServiceRequestCard from '@/src/features/servicios-pro/ServiceRequestCard';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import SearchBar from '@/src/components/SearchBar';
import FilterChip from '@/src/components/FilterChip';
import EmptyState from '@/src/components/EmptyState';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import AppRefreshControl from '@/src/components/AppRefreshControl';
import { ClipboardList } from 'lucide-react-native';

export default function SitterRequestsScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const {
        perspective, requests, counts, isLoading, statusFilter, setStatusFilter,
        searchQuery, setSearchQuery, updateStatus, updatingId,
    } = useSitRequests();
    const isProvider = perspective === 'provider';
    const filtering = !!searchQuery || statusFilter !== 'all';

    if (isLoading) return <LoadingOverlay />;

    return (
        <ScreenContainer>
            <ScreenHeader
                title={isProvider ? 'Solicitudes de cuidado' : 'Mis solicitudes de cuidado'}
                subtitle={isProvider ? 'Acepta, inicia y completa los servicios' : 'Sigue el estado de tus solicitudes'}
            />
            <View style={styles.search}>
                <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder="Buscar por mascota o persona..." />
            </View>
            <View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
                    {STATUS_FILTERS.map(f => (
                        <FilterChip key={f.id} label={`${f.label} (${counts[f.id] || 0})`} active={statusFilter === f.id} onPress={() => setStatusFilter(f.id)} />
                    ))}
                </ScrollView>
            </View>
            <FlatList
                refreshControl={<AppRefreshControl />}
                data={requests}
                keyExtractor={r => r.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <ServiceRequestCard
                        kind="sit"
                        request={item}
                        perspective={perspective}
                        busy={updatingId === item.id}
                        onStatus={s => updateStatus(item.id, s)}
                        onOpenProfile={isProvider ? undefined : () => router.push('/cuidadores/' + (item as any).sitter_id as any)}
                        onReview={() => router.push('/cuidadores/' + (item as any).sitter_id as any)}
                    />
                )}
                ListEmptyComponent={
                    <EmptyState
                        icon={<ClipboardList size={32} color={theme.textMuted} />}
                        title={filtering ? 'Sin resultados' : 'Sin solicitudes'}
                        subtitle={filtering ? 'No encontramos solicitudes con esos filtros.' : isProvider ? 'Cuando un cliente te solicite un servicio aparecerá aquí.' : 'Aún no has solicitado ningún servicio.'}
                        actionLabel={!isProvider && !filtering ? 'Buscar profesionales' : undefined}
                        onAction={!isProvider && !filtering ? () => router.push('/cuidadores' as any) : undefined}
                    />
                }
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    search: { marginHorizontal: 24, marginBottom: 12 },
    chips: { paddingHorizontal: 24, gap: 8, paddingBottom: 12 },
    list: { paddingHorizontal: 24, paddingTop: 4, paddingBottom: 100 },
});
