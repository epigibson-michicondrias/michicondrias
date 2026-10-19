import React from 'react';
import { StyleSheet, View, Text, ScrollView, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useServiceManagement } from '@/src/hooks/servicios-pro/useServiceManagement';
import { normalizeStatus, STATUS_FILTERS } from '@/src/hooks/servicios-pro/requestStatus';
import ServiceRequestCard from '@/src/features/servicios-pro/ServiceRequestCard';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import EmptyState from '@/src/components/EmptyState';
import FilterChip from '@/src/components/FilterChip';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import AppRefreshControl from '@/src/components/AppRefreshControl';
import { Clock, ClipboardList, User, Activity } from 'lucide-react-native';
import { font, spacing, layout } from '@/constants/design';

export default function ProfessionalGestionScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { kind, filter, setFilter, actionLoading, allRequests, filtered, isLoading, handleStatusUpdate } = useServiceManagement();

    const pending = allRequests.filter(r => normalizeStatus(r.status) === 'pending').length;
    const active = allRequests.filter(r => ['accepted', 'in_progress'].includes(normalizeStatus(r.status))).length;

    const header = (
        <View>
            <View style={styles.statsRow}>
                <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Clock size={18} color={theme.warning} />
                    <View>
                        <Text style={[styles.statValue, { color: theme.text }]}>{pending}</Text>
                        <Text style={[styles.statLabel, { color: theme.textMuted }]}>Pendientes</Text>
                    </View>
                </View>
                <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Activity size={18} color={theme.success} />
                    <View>
                        <Text style={[styles.statValue, { color: theme.text }]}>{active}</Text>
                        <Text style={[styles.statLabel, { color: theme.textMuted }]}>Por atender</Text>
                    </View>
                </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
                {STATUS_FILTERS.map(f => (
                    <FilterChip key={f.id} label={f.label} active={filter === f.id} onPress={() => setFilter(f.id)} />
                ))}
            </ScrollView>
        </View>
    );

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Mis tareas"
                subtitle={kind === 'walk' ? 'Solicitudes de paseo' : 'Solicitudes de cuidado'}
                actions={[{ icon: User, label: 'Mi perfil profesional', onPress: () => router.push('/servicios-pro/perfil' as any) }]}
            />
            {isLoading ? (
                <LoadingOverlay message="Cargando solicitudes..." />
            ) : (
                <FlatList
                    refreshControl={<AppRefreshControl />}
                    data={filtered}
                    keyExtractor={r => r.id}
                    ListHeaderComponent={header}
                    contentContainerStyle={styles.list}
                    renderItem={({ item }) => (
                        <ServiceRequestCard
                            kind={kind}
                            request={item}
                            perspective="provider"
                            busy={actionLoading === item.id}
                            onStatus={s => handleStatusUpdate(item.id, s)}
                        />
                    )}
                    ListEmptyComponent={
                        <EmptyState
                            icon={<ClipboardList size={32} color={theme.textMuted} />}
                            title="Sin solicitudes"
                            subtitle={filter === 'all' ? 'Cuando un cliente te solicite un servicio aparecerá aquí.' : 'No hay solicitudes en esta categoría.'}
                        />
                    }
                />
            )}
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    statsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
    statBox: { flex: 1, flexDirection: 'row', padding: spacing.lg, borderRadius: 18, alignItems: 'center', gap: spacing.md, borderWidth: 1 },
    statValue: { fontSize: font.xxl, fontWeight: '800' },
    statLabel: { fontSize: font.sm, fontWeight: '700' },
    chips: { gap: spacing.sm, paddingBottom: spacing.lg },
    list: { paddingHorizontal: layout.screenPadding, paddingTop: spacing.lg, paddingBottom: 100 },
});
