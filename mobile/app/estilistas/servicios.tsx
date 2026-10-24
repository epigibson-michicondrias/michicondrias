import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Plus, Scissors, Pencil, Eye, EyeOff, Clock } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useMyGroomingServices } from '@/src/hooks/grooming/useMyGroomingServices';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import DataList from '@/src/components/data/DataList';
import { MediaRow } from '@/src/components/MediaCard';
import IconButton from '@/src/components/IconButton';
import Badge from '@/src/components/Badge';
import BottomSheet from '@/src/components/BottomSheet';
import FormField from '@/src/components/FormField';
import Button from '@/src/components/Button';
import RoleGuard from '@/src/components/RoleGuard';
import type { GroomingService } from '@/src/services/grooming';
import { formatCurrency } from '@/src/utils/formatters';
import { layout, spacing } from '@/constants/design';

function MisServicios() {
    const { theme } = useTheme();
    const s = useMyGroomingServices();

    const renderItem = ({ item }: { item: GroomingService }) => (
        <MediaRow
            fallbackIcon={Scissors}
            title={item.name}
            trailing={item.is_active
                ? <Badge label="Visible" color={theme.success} size="sm" />
                : <Badge label="Pausado" color={theme.textMuted} size="sm" />}
            lines={[
                { text: formatCurrency(item.price) },
                { text: `${item.duration_minutes} min`, icon: Clock },
            ]}
            onPress={() => s.openEdit(item)}
            accessibilityLabel={`Editar ${item.name}`}
            actions={(
                <>
                    <IconButton
                        icon={item.is_active ? Eye : EyeOff}
                        accessibilityLabel={item.is_active ? `Pausar ${item.name}` : `Volver a publicar ${item.name}`}
                        onPress={() => s.toggle(item)}
                        loading={s.togglingId === item.id}
                        color={item.is_active ? theme.primary : theme.textMuted}
                        size="sm"
                    />
                    <IconButton icon={Pencil} accessibilityLabel={`Editar ${item.name}`} onPress={() => s.openEdit(item)} size="sm" />
                </>
            )}
        />
    );

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Mis servicios"
                subtitle={s.services.length > 0 ? `${s.services.filter((x) => x.is_active).length} visibles en el catálogo` : undefined}
                actions={[{ icon: Plus, label: 'Nuevo servicio', onPress: s.goToNew }]}
            />
            <DataList
                data={s.services}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                isLoading={s.isLoading}
                isError={s.isError}
                skeleton
                onRefresh={s.refetch}
                isRefreshing={s.isRefetching}
                emptyIcon={<Scissors size={layout.icon.xl} color={theme.textMuted} />}
                emptyTitle="Aún no ofreces servicios"
                emptySubtitle="Publica tu primer servicio de estética para que los clientes agenden contigo."
                emptyActionLabel="Nuevo servicio"
                onEmptyAction={s.goToNew}
            />

            <BottomSheet
                visible={!!s.editing}
                onClose={s.closeEdit}
                title="Editar servicio"
                subtitle={s.editing?.name}
                footer={(
                    <>
                        <Button label="Cancelar" variant="secondary" onPress={s.closeEdit} style={styles.flex} />
                        <Button label="Guardar" onPress={s.save} loading={s.saving} style={styles.primary} />
                    </>
                )}
            >
                <FormField label="Nombre" value={s.draft.name} onChangeText={(v) => s.updateDraft('name', v)} error={s.errors.name} />
                <View style={styles.row}>
                    <View style={styles.flex}>
                        <FormField label="Precio (MXN)" value={s.draft.price} onChangeText={(v) => s.updateDraft('price', v)} keyboardType="decimal-pad" error={s.errors.price} />
                    </View>
                    <View style={styles.flex}>
                        <FormField label="Duración (min)" value={s.draft.duration_minutes} onChangeText={(v) => s.updateDraft('duration_minutes', v.replace(/\D/g, ''))} keyboardType="number-pad" maxLength={3} error={s.errors.duration_minutes} />
                    </View>
                </View>
                <FormField label="Descripción" value={s.draft.description} onChangeText={(v) => s.updateDraft('description', v)} multiline />
            </BottomSheet>
        </ScreenContainer>
    );
}

export default function MisServiciosEsteticaScreen() {
    return (
        <RoleGuard roles={['estilista']}>
            <MisServicios />
        </RoleGuard>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    primary: { flex: 1.6 },
    row: { flexDirection: 'row', gap: spacing.md },
    separator: { height: spacing.sm },
});
