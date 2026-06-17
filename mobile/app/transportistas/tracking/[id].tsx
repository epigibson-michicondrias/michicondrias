import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useRideTracking } from '@/src/hooks/rides/useRideTracking';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import {
  MapPin,
  Navigation,
  Play,
  Square,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader,
} from 'lucide-react-native';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pendiente', color: '#f59e0b', icon: Clock },
  pendiente: { label: 'Pendiente', color: '#f59e0b', icon: Clock },
  in_progress: { label: 'En Curso', color: '#06b6d4', icon: Navigation },
  en_curso: { label: 'En Curso', color: '#06b6d4', icon: Navigation },
  completed: { label: 'Completado', color: '#10b981', icon: CheckCircle2 },
  completado: { label: 'Completado', color: '#10b981', icon: CheckCircle2 },
  cancelled: { label: 'Cancelado', color: '#ef4444', icon: AlertCircle },
  cancelado: { label: 'Cancelado', color: '#ef4444', icon: AlertCircle },
};

export default function RideTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const {
    tracking,
    isLoading,
    isError,
    isRideActive,
    isRidePending,
    isRideCompleted,
    handleStart,
    handleFinish,
    isStarting,
    isFinishing,
  } = useRideTracking(id ?? '');

  if (isLoading) {
    return (
      <ScreenContainer>
        <ScreenHeader title="📍 Rastreo en Vivo" subtitle="Seguimiento del viaje" />
        <LoadingOverlay message="Cargando datos del viaje..." />
      </ScreenContainer>
    );
  }

  if (isError || !tracking) {
    return (
      <ScreenContainer>
        <ScreenHeader title="📍 Rastreo en Vivo" subtitle="Seguimiento del viaje" />
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color={theme.textMuted} />
          <Text style={[styles.errorText, { color: theme.text }]}>No se pudo cargar el viaje</Text>
          <Text style={[styles.errorSub, { color: theme.textMuted }]}>
            Verifica que el ID del viaje sea correcto
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  const statusConfig = STATUS_CONFIG[tracking.status] ?? {
    label: tracking.status,
    color: theme.textMuted,
    icon: Loader,
  };
  const StatusIcon = statusConfig.icon;

  return (
    <ScreenContainer>
      <ScreenHeader title="📍 Rastreo en Vivo" subtitle="Seguimiento del viaje" />

      <View style={styles.content}>
        {/* Status badge */}
        <View style={[styles.statusCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}>
            <StatusIcon size={20} color={statusConfig.color} />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
          </View>
          <Text style={[styles.rideId, { color: theme.textMuted }]}>ID: {tracking.id}</Text>
        </View>

        {/* Map placeholder */}
        <View style={[styles.mapContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={[styles.mapPlaceholder, { backgroundColor: theme.background }]}>
            <Navigation size={40} color={theme.primary} />
            <Text style={[styles.mapTitle, { color: theme.text }]}>Mapa en tiempo real</Text>

            {tracking.current_lat != null && tracking.current_lng != null ? (
              <View style={styles.coordsContainer}>
                <View style={[styles.coordBadge, { backgroundColor: theme.primary + '15' }]}>
                  <MapPin size={14} color={theme.primary} />
                  <Text style={[styles.coordText, { color: theme.primary }]}>
                    {tracking.current_lat.toFixed(6)}, {tracking.current_lng.toFixed(6)}
                  </Text>
                </View>
              </View>
            ) : (
              <Text style={[styles.mapSubtitle, { color: theme.textMuted }]}>
                Esperando ubicación del conductor...
              </Text>
            )}
          </View>

          {/* Live indicator */}
          {isRideActive && (
            <View style={styles.liveIndicator}>
              <View style={[styles.liveDot, { backgroundColor: '#10b981' }]} />
              <Text style={[styles.liveText, { color: '#10b981' }]}>EN VIVO</Text>
            </View>
          )}
        </View>

        {/* Ride info */}
        <View style={[styles.infoCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.infoTitle, { color: theme.text }]}>Información del Viaje</Text>

          <View style={styles.infoRow}>
            <View style={[styles.infoIconContainer, { backgroundColor: theme.primary + '15' }]}>
              <Navigation size={16} color={theme.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Estado</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{statusConfig.label}</Text>
            </View>
          </View>

          {tracking.current_lat != null && (
            <View style={styles.infoRow}>
              <View style={[styles.infoIconContainer, { backgroundColor: '#06b6d420' }]}>
                <MapPin size={16} color="#06b6d4" />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Última ubicación</Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>
                  {tracking.current_lat.toFixed(4)}°N, {Math.abs(tracking.current_lng ?? 0).toFixed(4)}°W
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Driver action buttons */}
        <View style={styles.actionsContainer}>
          {isRidePending && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#10b981' }, isStarting && { opacity: 0.7 }]}
              onPress={handleStart}
              disabled={isStarting}
              activeOpacity={0.85}
            >
              <Play size={22} color="#fff" />
              <Text style={styles.actionBtnText}>{isStarting ? 'Iniciando...' : 'Iniciar Viaje'}</Text>
            </TouchableOpacity>
          )}

          {isRideActive && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#ef4444' }, isFinishing && { opacity: 0.7 }]}
              onPress={handleFinish}
              disabled={isFinishing}
              activeOpacity={0.85}
            >
              <Square size={22} color="#fff" />
              <Text style={styles.actionBtnText}>{isFinishing ? 'Finalizando...' : 'Finalizar Viaje'}</Text>
            </TouchableOpacity>
          )}

          {isRideCompleted && (
            <View style={[styles.completedBanner, { backgroundColor: '#10b98115' }]}>
              <CheckCircle2 size={24} color="#10b981" />
              <Text style={[styles.completedText, { color: '#10b981' }]}>Viaje completado exitosamente</Text>
            </View>
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 24,
    gap: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  errorSub: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 8,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '800',
  },
  rideId: {
    fontSize: 11,
    fontWeight: '500',
  },
  mapContainer: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  mapPlaceholder: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    padding: 24,
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  mapSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  coordsContainer: {
    marginTop: 4,
  },
  coordBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
  },
  coordText: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  liveIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  infoCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    gap: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  actionsContainer: {
    gap: 12,
    marginTop: 8,
    marginBottom: 40,
  },
  actionBtn: {
    height: 64,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 16,
    gap: 10,
  },
  completedText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
