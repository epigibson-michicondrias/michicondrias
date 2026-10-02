import React from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { AlertCircle, DollarSign, Navigation, Star, TrendingUp } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useDriverHistory } from '@/src/hooks/rides/useDriverHistory';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import RoleGuard from '@/src/components/RoleGuard';
import Card from '@/src/components/Card';
import EmptyState from '@/src/components/EmptyState';
import { SkeletonList } from '@/src/components/Skeleton';
import RideCard from '@/src/components/rides/RideCard';
import { formatMoney } from '@/src/components/rides/rideStatus';
import { radius, spacing, type } from '@/constants/design';

function Screen() {
  const { theme } = useTheme();
  const { totalEarnings, ridesCount, ratingAvg, ratingCount, rides, isLoading, isError, isRefetching, refetch, router } =
    useDriverHistory();

  const stats = [
    { icon: DollarSign, color: theme.primary, value: formatMoney(totalEarnings), label: 'Ganancias totales' },
    { icon: TrendingUp, color: theme.success, value: String(ridesCount), label: 'Viajes realizados' },
    {
      icon: Star,
      color: theme.warning,
      value: ratingAvg != null ? ratingAvg.toFixed(1) : '—',
      label: ratingCount ? `${ratingCount} calificaciones` : 'Sin calificaciones',
    },
  ];

  return (
    <ScreenContainer>
      <ScreenHeader title="Historial" subtitle="Tus viajes completados" />

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
          ListHeaderComponent={
            isError ? null : (
              <View style={styles.stats}>
                {stats.map((s) => (
                  <Card key={s.label} style={styles.stat} accessibilityLabel={`${s.label}: ${s.value}`}>
                    <View style={[styles.statIcon, { backgroundColor: s.color + '20' }]}>
                      <s.icon size={18} color={s.color} />
                    </View>
                    <Text style={[type.h2, { color: theme.text }]} numberOfLines={1} adjustsFontSizeToFit>
                      {s.value}
                    </Text>
                    <Text style={[type.caption, { color: theme.textMuted, textAlign: 'center' }]}>{s.label}</Text>
                  </Card>
                ))}
              </View>
            )
          }
          renderItem={({ item }) => (
            <RideCard ride={item} perspective="driver" onPress={() => router.push(`/transportistas/tracking/${item.id}` as any)} />
          )}
          ListEmptyComponent={
            isError ? (
              <EmptyState
                icon={<AlertCircle size={32} color={theme.textMuted} />}
                title="No pudimos cargar tu historial"
                subtitle="Revisa tu conexión e intenta de nuevo."
                actionLabel="Reintentar"
                onAction={refetch}
              />
            ) : (
              <EmptyState
                icon={<Navigation size={32} color={theme.textMuted} />}
                title="Sin viajes aún"
                subtitle="Cuando completes viajes, aparecerán aquí."
                actionLabel="Ver solicitudes"
                onAction={() => router.push('/transportistas/solicitudes' as any)}
              />
            )
          }
        />
      )}
    </ScreenContainer>
  );
}

export default function HistorialConductorScreen() {
  return (
    <RoleGuard roles={['transportista']} message="El historial de viajes es para cuentas de transportista.">
      <Screen />
    </RoleGuard>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20 },
  list: { paddingHorizontal: 20, paddingBottom: 100 },
  stats: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl },
  stat: { flex: 1, alignItems: 'center', gap: spacing.xs, padding: spacing.md, borderRadius: radius.lg },
  statIcon: { width: 36, height: 36, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
});
