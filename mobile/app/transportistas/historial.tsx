import React from 'react';
import { StyleSheet, View, Text, FlatList } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useDriverHistory } from '@/src/hooks/rides/useDriverHistory';
import type { PetRide } from '@/src/services/rides';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import EmptyState from '@/src/components/EmptyState';
import {
  DollarSign,
  Car,
  MapPin,
  CheckCircle2,
  Clock,
  TrendingUp,
  Navigation,
  AlertCircle,
} from 'lucide-react-native';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendiente', color: '#f59e0b' },
  pendiente: { label: 'Pendiente', color: '#f59e0b' },
  in_progress: { label: 'En Curso', color: '#06b6d4' },
  en_curso: { label: 'En Curso', color: '#06b6d4' },
  completed: { label: 'Completado', color: '#10b981' },
  completado: { label: 'Completado', color: '#10b981' },
  cancelled: { label: 'Cancelado', color: '#ef4444' },
  cancelado: { label: 'Cancelado', color: '#ef4444' },
};

export default function HistorialConductorScreen() {
  const { theme } = useTheme();
  const {
    totalEarnings,
    ridesCount,
    rides,
    isLoading,
    refetch,
  } = useDriverHistory();

  const renderRideItem = ({ item }: { item: PetRide }) => {
    const statusInfo = STATUS_LABELS[item.status] ?? { label: item.status, color: theme.textMuted };

    return (
      <View style={[styles.rideCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.rideCardHeader}>
          <View style={[styles.rideIconContainer, { backgroundColor: theme.primary + '15' }]}>
            <Car size={20} color={theme.primary} />
          </View>
          <View style={styles.rideCardInfo}>
            <View style={styles.rideCardTitleRow}>
              <Text style={[styles.rideCardTitle, { color: theme.text }]} numberOfLines={1}>
                {item.origin_address}
              </Text>
              {item.price != null && (
                <Text style={[styles.ridePrice, { color: theme.primary }]}>
                  ${item.price.toFixed(2)}
                </Text>
              )}
            </View>
            <View style={styles.rideRoute}>
              <MapPin size={12} color={theme.textMuted} />
              <Text style={[styles.rideDestination, { color: theme.textMuted }]} numberOfLines={1}>
                {item.destination_address}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.rideCardFooter}>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '15' }]}>
            <View style={[styles.statusDot, { backgroundColor: statusInfo.color }]} />
            <Text style={[styles.statusLabel, { color: statusInfo.color }]}>{statusInfo.label}</Text>
          </View>
          {item.requires_carrier && (
            <View style={[styles.carrierBadge, { backgroundColor: '#f59e0b15' }]}>
              <Text style={[styles.carrierText, { color: '#f59e0b' }]}>📦 Transportín</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <ScreenContainer>
        <ScreenHeader title="📊 Historial" subtitle="Tu historial de viajes" />
        <LoadingOverlay message="Cargando historial..." />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScreenHeader title="📊 Historial" subtitle="Tu historial de viajes" />

      {/* Summary cards */}
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, { backgroundColor: theme.primary + '15' }]}>
          <View style={[styles.summaryIconContainer, { backgroundColor: theme.primary + '25' }]}>
            <DollarSign size={22} color={theme.primary} />
          </View>
          <Text style={[styles.summaryValue, { color: theme.primary }]}>
            ${totalEarnings.toFixed(2)}
          </Text>
          <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Ganancias Totales</Text>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: '#10b98115' }]}>
          <View style={[styles.summaryIconContainer, { backgroundColor: '#10b98125' }]}>
            <TrendingUp size={22} color="#10b981" />
          </View>
          <Text style={[styles.summaryValue, { color: '#10b981' }]}>
            {ridesCount}
          </Text>
          <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Viajes Realizados</Text>
        </View>
      </View>

      {/* Rides list title */}
      <View style={styles.listHeader}>
        <Text style={[styles.listTitle, { color: theme.text }]}>Viajes Recientes</Text>
        <Text style={[styles.listCount, { color: theme.textMuted }]}>{rides.length} viajes</Text>
      </View>

      {/* Rides list */}
      <FlatList
        data={rides}
        renderItem={renderRideItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={false}
        onRefresh={refetch}
        ListEmptyComponent={
          <EmptyState
            icon={<Navigation size={32} color={theme.textMuted} />}
            title="Sin viajes aún"
            subtitle="Cuando completes viajes, aparecerán aquí"
          />
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    gap: 10,
  },
  summaryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '900',
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  listCount: {
    fontSize: 13,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  rideCard: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    gap: 14,
  },
  rideCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  rideIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rideCardInfo: {
    flex: 1,
    gap: 6,
  },
  rideCardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rideCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  ridePrice: {
    fontSize: 16,
    fontWeight: '900',
  },
  rideRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rideDestination: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  rideCardFooter: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  carrierBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  carrierText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
