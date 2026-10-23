import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Heart } from 'lucide-react-native';
import { useViewApplications } from '@/src/hooks/adopciones/useViewApplications';
import { useTheme } from '@/src/hooks/useTheme';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import DataList from '@/src/components/data/DataList';
import RequestCard from '@/src/features/adopciones/RequestCard';
import type { AdoptionRequest } from '@/src/services/adopciones';
import { layout, spacing } from '@/constants/design';

export default function VerSolicitudesScreen() {
    const { theme } = useTheme();
    const { requests, listing, isLoading, refetch, isRefetching, pendingCount, openRequest } = useViewApplications();

    const renderItem = ({ item }: { item: AdoptionRequest }) => <RequestCard request={item} onPress={() => openRequest(item.id)} />;

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
    separator: { height: spacing.sm },
});
