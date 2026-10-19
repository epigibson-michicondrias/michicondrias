import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Heart, ChevronRight } from 'lucide-react-native';
import { useViewApplications } from '@/src/hooks/adopciones/useViewApplications';
import { useTheme } from '@/src/hooks/useTheme';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import DataList from '@/src/components/data/DataList';
import Card from '@/src/components/Card';
import Badge from '@/src/components/Badge';
import { useRequestStatus } from '@/src/features/adopciones/requestStatus';
import type { AdoptionRequest } from '@/src/services/adopciones';
import { formatDate } from '@/src/utils/formatters';
import { layout, spacing, type } from '@/constants/design';

export default function VerSolicitudesScreen() {
    const { theme } = useTheme();
    const statusOf = useRequestStatus();
    const { requests, listing, isLoading, refetch, isRefetching, pendingCount, openRequest } = useViewApplications();

    const renderItem = ({ item }: { item: AdoptionRequest }) => {
        const status = statusOf(item.status);
        return (
            <Card onPress={() => openRequest(item.id)} accessibilityLabel={`Solicitud de ${item.applicant_name || 'un interesado'}, ${status.label}`}>
                <View style={styles.card}>
                    <View style={styles.row}>
                        <View style={styles.flex}>
                            <Text style={[type.title, { color: theme.text }]} numberOfLines={1}>{item.applicant_name || 'Interesado'}</Text>
                            <Text style={[type.caption, { color: theme.textMuted }]}>Enviada el {formatDate(item.created_at)}</Text>
                        </View>
                        <Badge label={status.label} color={status.color} size="sm" />
                    </View>
                    {item.reason ? (
                        <Text style={[type.body, { color: theme.textMuted }]} numberOfLines={2}>«{item.reason}»</Text>
                    ) : null}
                    <View style={styles.more}>
                        <Text style={[type.bodyStrong, { color: theme.primary }]}>Revisar solicitud</Text>
                        <ChevronRight size={layout.icon.sm} color={theme.primary} />
                    </View>
                </View>
            </Card>
        );
    };

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Solicitudes recibidas"
                subtitle={listing ? `${listing.name} · ${pendingCount > 0 ? `${pendingCount} por revisar` : `${requests.length} en total`}` : undefined}
            />
            <DataList
                data={requests}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                isLoading={isLoading}
                skeleton
                onRefresh={refetch}
                isRefreshing={isRefetching}
                emptyIcon={<Heart size={layout.icon.xl} color={theme.textMuted} strokeWidth={1.5} />}
                emptyTitle="Aún no hay interesados"
                emptySubtitle={`Las solicitudes que recibas para ${listing?.name || 'esta mascota'} aparecerán aquí.`}
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    card: { gap: spacing.sm },
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    more: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    separator: { height: spacing.sm },
});
