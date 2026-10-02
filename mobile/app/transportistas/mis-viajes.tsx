import React from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { AlertCircle, Car } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useMyRides } from '@/src/hooks/rides/useMyRides';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import FilterChip from '@/src/components/FilterChip';
import EmptyState from '@/src/components/EmptyState';
import { SkeletonList } from '@/src/components/Skeleton';
import RideCard from '@/src/components/rides/RideCard';
import { Plus } from 'lucide-react-native';
import { spacing } from '@/constants/design';

export default function MisViajesScreen() {
  const { theme } = useTheme();
  const { filter, setFilter, rides, isLoading, isError, isRefetching, refetch, router } = useMyRides();

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Mis viajes"
        subtitle="Transporte de tus mascotas"
        actionIcon={Plus}
        actionLabel="Solicitar transporte"
        onAction={() => router.push('/transportistas/solicitar' as any)}
      />

      <View style={styles.chips}>
        <FilterChip label="Activos" active={filter === 'active'} onPress={() => setFilter('active')} />
        <FilterChip label="Historial" active={filter === 'history'} onPress={() => setFilter('history')} />
      </View>

      {isLoading ? (
        <View style={styles.pad}>
          <SkeletonList count={4} />
        </View>
      ) : (
        <FlatList
          data={rides}
          keyExtractor={(r) => r.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.primary} />}
          renderItem={({ item }) => (
            <RideCard ride={item} perspective="client" onPress={() => router.push(`/transportistas/tracking/${item.id}` as any)} />
          )}
          ListEmptyComponent={
            isError ? (
              <EmptyState
                icon={<AlertCircle size={32} color={theme.textMuted} />}
                title="No pudimos cargar tus viajes"
                subtitle="Revisa tu conexión e intenta de nuevo."
                actionLabel="Reintentar"
                onAction={refetch}
              />
            ) : (
              <EmptyState
                icon={<Car size={32} color={theme.textMuted} />}
                title={filter === 'active' ? 'No tienes viajes activos' : 'Aún no tienes viajes en tu historial'}
                subtitle="Solicita un traslado seguro para tu mascota."
                actionLabel="Solicitar transporte"
                onAction={() => router.push('/transportistas/solicitar' as any)}
              />
            )
          }
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: 20, marginBottom: spacing.md },
  pad: { paddingHorizontal: 20 },
  list: { paddingHorizontal: 20, paddingBottom: 100 },
});
