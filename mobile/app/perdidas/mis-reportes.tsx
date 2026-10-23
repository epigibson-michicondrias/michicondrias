import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Plus, Pencil, Trash2, PawPrint, MapPin, Clock, Search } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useMyReports } from '@/src/hooks/perdidas/useMyReports';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import DataList from '@/src/components/data/DataList';
import { MediaRow } from '@/src/components/MediaCard';
import IconButton from '@/src/components/IconButton';
import Badge from '@/src/components/Badge';
import type { LostPetReport } from '@/src/services/perdidas';
import { getTimeAgo } from '@/src/utils/formatters';
import { layout, spacing } from '@/constants/design';

export default function MisReportesScreen() {
    const { theme } = useTheme();
    const r = useMyReports();

    const statusBadge = (item: LostPetReport) => {
        if (item.is_resolved) return <Badge label={item.report_type === 'lost' ? 'Reunido' : 'Devuelto'} color={theme.success} size="sm" />;
        if (item.status === 'expired') return <Badge label="Vencido" color={theme.textMuted} size="sm" />;
        return <Badge label={item.report_type === 'lost' ? 'Perdido' : 'Encontrado'} color={item.report_type === 'lost' ? theme.error : theme.info} size="sm" />;
    };

    const renderItem = ({ item }: { item: LostPetReport }) => (
        <MediaRow
            imageUrl={item.image_url}
            fallbackIcon={PawPrint}
            title={item.pet_name}
            trailing={statusBadge(item)}
            lines={[
                ...(item.last_seen_location ? [{ text: item.last_seen_location, icon: MapPin }] : []),
                ...(item.created_at ? [{ text: `Reportado ${getTimeAgo(item.created_at).toLowerCase()}`, icon: Clock }] : []),
            ]}
            onPress={() => r.openReport(item.id)}
            accessibilityLabel={`Ver el reporte de ${item.pet_name}`}
            actions={(
                <>
                    {!item.is_resolved ? (
                        <IconButton icon={Pencil} accessibilityLabel={`Editar el reporte de ${item.pet_name}`} onPress={() => r.editReport(item.id)} size="sm" />
                    ) : null}
                    <IconButton
                        icon={Trash2}
                        accessibilityLabel={`Eliminar el reporte de ${item.pet_name}`}
                        onPress={() => r.handleDelete(item)}
                        loading={r.deletingId === item.id}
                        color={theme.error}
                        size="sm"
                    />
                </>
            )}
        />
    );

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Mis reportes"
                subtitle={r.reports.length > 0 ? r.activeLabel : undefined}
                actions={[{ icon: Plus, label: 'Nuevo reporte', onPress: r.goToNew }]}
            />
            <DataList
                data={r.reports}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                isLoading={r.isLoading}
                skeleton
                onRefresh={r.refetch}
                isRefreshing={r.isRefetching}
                emptyIcon={<Search size={layout.icon.xl} color={theme.textMuted} />}
                emptyTitle="No has hecho reportes"
                emptySubtitle="Si perdiste o encontraste una mascota, repórtala y la comunidad te ayuda."
                emptyActionLabel="Hacer un reporte"
                onEmptyAction={r.goToNew}
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    separator: { height: spacing.sm },
});
