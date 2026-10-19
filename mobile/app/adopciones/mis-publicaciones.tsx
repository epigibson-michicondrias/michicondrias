import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Plus, Pencil, Trash2, PawPrint, Heart, MapPin, Inbox } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import DataList from '@/src/components/data/DataList';
import { MediaRow } from '@/src/components/MediaCard';
import IconButton from '@/src/components/IconButton';
import Badge from '@/src/components/Badge';
import { useMyListings } from '@/src/hooks/adopciones/useMyListings';
import type { Listing } from '@/src/types/adopciones';
import { capitalize, formatAge } from '@/src/utils/formatters';
import { layout, spacing } from '@/constants/design';

export default function MisPublicacionesScreen() {
    const { theme } = useTheme();
    const { listings, isLoading, isRefetching, refetch, goToNewListing, goToRequests, goToEditListing, handleDelete, deletingId } = useMyListings();

    const statusBadge = (item: Listing) => {
        if (item.status?.toLowerCase() === 'adoptado') return <Badge label="Adoptado" color={theme.accent} size="sm" />;
        if (item.status?.toLowerCase() === 'en_proceso') return <Badge label="En proceso" color={theme.warning} size="sm" />;
        if (!item.is_approved) return <Badge label="En revisión" color={theme.info} size="sm" />;
        return <Badge label="Publicado" color={theme.success} size="sm" />;
    };

    const renderItem = ({ item }: { item: Listing }) => {
        const adopted = item.status?.toLowerCase() === 'adoptado';
        return (
            <MediaRow
                imageUrl={item.photo_url}
                fallbackIcon={PawPrint}
                title={item.name}
                trailing={statusBadge(item)}
                lines={[
                    { text: [capitalize(item.breed || item.species), item.age_months ? formatAge(item.age_months) : null].filter(Boolean).join(' · ') },
                    ...(item.location ? [{ text: item.location, icon: MapPin }] : []),
                    { text: 'Ver solicitudes', icon: Inbox },
                ]}
                onPress={() => goToRequests(item.id)}
                accessibilityLabel={`${item.name}: ver solicitudes`}
                actions={adopted ? undefined : (
                    <>
                        <IconButton icon={Pencil} accessibilityLabel={`Editar ${item.name}`} onPress={() => goToEditListing(item.id)} size="sm" />
                        <IconButton
                            icon={Trash2}
                            accessibilityLabel={`Eliminar la publicación de ${item.name}`}
                            onPress={() => handleDelete(item.id, item.name)}
                            loading={deletingId === item.id}
                            color={theme.error}
                            size="sm"
                        />
                    </>
                )}
            />
        );
    };

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Mis publicaciones"
                subtitle={listings.length > 0 ? `${listings.length} ${listings.length === 1 ? 'mascota' : 'mascotas'}` : undefined}
                actions={[{ icon: Plus, label: 'Dar en adopción', onPress: goToNewListing }]}
            />
            <DataList
                data={listings}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                isLoading={isLoading}
                skeleton
                onRefresh={refetch}
                isRefreshing={isRefetching}
                emptyIcon={<Heart size={layout.icon.xl} color={theme.textMuted} strokeWidth={1.5} />}
                emptyTitle="No has publicado mascotas"
                emptySubtitle="Si tienes un michi o lomito buscando hogar, publícalo y recibe solicitudes."
                emptyActionLabel="Dar en adopción"
                onEmptyAction={goToNewListing}
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    separator: { height: spacing.sm },
});
