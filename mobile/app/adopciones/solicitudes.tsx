import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Inbox, SearchX } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useApplications, REQUEST_FILTERS } from '@/src/hooks/adopciones/useApplications';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import DataList from '@/src/components/data/DataList';
import FilterChip from '@/src/components/FilterChip';
import RequestCard from '@/src/features/adopciones/RequestCard';
import { layout, spacing } from '@/constants/design';

export default function SolicitudesAdopcionScreen() {
    const { theme } = useTheme();
    const a = useApplications();
    const pending = a.countFor('PENDING');

    const header = a.total > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll} contentContainerStyle={styles.chips}>
            {REQUEST_FILTERS.map((f) => {
                const count = a.countFor(f.key);
                if (f.key !== 'all' && count === 0 && a.filter !== f.key) return null;
                return (
                    <FilterChip
                        key={f.key}
                        label={f.label}
                        count={f.key === 'all' ? undefined : count}
                        active={a.filter === f.key}
                        onPress={() => a.setFilter(f.key)}
                    />
                );
            })}
        </ScrollView>
    ) : undefined;

    const empty = a.total > 0
        ? { emptyIcon: <SearchX size={layout.icon.xl} color={theme.textMuted} />, emptyTitle: 'Nada en este filtro', emptySubtitle: 'No hay solicitudes con este estado.', emptyActionLabel: 'Ver todas', onEmptyAction: () => a.setFilter('all') }
        : a.hasListings
            ? { emptyIcon: <Inbox size={layout.icon.xl} color={theme.textMuted} />, emptyTitle: 'Aún no hay solicitudes', emptySubtitle: 'Cuando alguien quiera adoptar a una de tus mascotas aparecerá aquí y te avisaremos.' }
            : { emptyIcon: <Inbox size={layout.icon.xl} color={theme.textMuted} />, emptyTitle: 'No tienes mascotas publicadas', emptySubtitle: 'Publica una mascota en adopción para empezar a recibir solicitudes.', emptyActionLabel: 'Dar en adopción', onEmptyAction: a.goPublish };

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Solicitudes recibidas"
                subtitle={a.isLoading ? undefined : pending > 0 ? `${pending} por revisar` : `${a.total} en total`}
            />
            <DataList
                data={a.requests}
                renderItem={({ item }) => <RequestCard request={item.request} petName={item.petName} onPress={() => a.openRequest(item.request.id)} />}
                keyExtractor={(item) => item.request.id}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                header={header}
                isLoading={a.isLoading}
                skeleton
                onRefresh={a.refetch}
                isRefreshing={a.isRefetching}
                {...empty}
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    chipsScroll: { marginHorizontal: -layout.screenPadding, marginBottom: spacing.md },
    chips: { gap: spacing.sm, paddingHorizontal: layout.screenPadding },
    separator: { height: spacing.sm },
});
