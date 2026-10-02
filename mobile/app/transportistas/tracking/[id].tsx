import React, { useState } from 'react';
import { Platform, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { AlertCircle, Banknote, Box, Calendar, MapPin, PawPrint, Route, Star, StickyNote, Truck, User } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useRideTracking } from '@/src/hooks/rides/useRideTracking';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import Card from '@/src/components/Card';
import Badge from '@/src/components/Badge';
import Button from '@/src/components/Button';
import EmptyState from '@/src/components/EmptyState';
import SectionHeader from '@/src/components/SectionHeader';
import { Skeleton } from '@/src/components/Skeleton';
import WebMapView, { type MapMarker } from '@/src/components/WebMapView';
import { showAlert } from '@/src/components/AppAlert';
import { formatDateTime, formatMoney, rideStatusInfo } from '@/src/components/rides/rideStatus';
import { radius, spacing, type } from '@/constants/design';

function InfoRow({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  const { theme } = useTheme();
  return (
    <View style={styles.infoRow} accessible accessibilityLabel={`${label}: ${value}`}>
      <Icon size={16} color={color} />
      <View style={styles.flex}>
        <Text style={[type.caption, { color: theme.textMuted }]}>{label}</Text>
        <Text style={[type.bodyStrong, { color: theme.text }]}>{value}</Text>
      </View>
    </View>
  );
}

export default function RideDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const r = useRideTracking(id ?? '');
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');
  const ride = r.ride;

  if (r.isLoading) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Viaje" subtitle="Detalle y seguimiento" />
        <View style={styles.pad}>
          <Skeleton height={80} />
          <Skeleton height={200} style={{ marginTop: spacing.md }} />
          <Skeleton height={140} style={{ marginTop: spacing.md }} />
        </View>
      </ScreenContainer>
    );
  }

  if (r.isError || !ride) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Viaje" subtitle="Detalle y seguimiento" />
        <EmptyState
          icon={<AlertCircle size={32} color={theme.textMuted} />}
          title="No se pudo cargar el viaje"
          subtitle={r.errorMessage || 'Verifica tu conexión e intenta de nuevo.'}
          actionLabel="Reintentar"
          onAction={() => r.refetch()}
        />
      </ScreenContainer>
    );
  }

  const info = rideStatusInfo(ride.status, theme);
  const isDriverSide = ride.viewer_role === 'driver' || ride.viewer_role === 'candidate';

  const markers: MapMarker[] = [];
  if (ride.origin_lat != null && ride.origin_lng != null)
    markers.push({ id: 'origin', latitude: ride.origin_lat, longitude: ride.origin_lng, title: 'Origen', description: ride.origin_address, color: theme.success });
  if (ride.destination_lat != null && ride.destination_lng != null)
    markers.push({ id: 'dest', latitude: ride.destination_lat, longitude: ride.destination_lng, title: 'Destino', description: ride.destination_address, color: theme.primary });
  if (ride.current_lat != null && ride.current_lng != null && (ride.status === 'accepted' || ride.status === 'in_transit'))
    markers.push({ id: 'driver', latitude: ride.current_lat, longitude: ride.current_lng, title: 'Conductor', color: theme.info });

  const confirmCancel = () => {
    const releasing = ride.viewer_role === 'driver';
    showAlert({
      type: 'warning',
      title: releasing ? '¿Liberar este viaje?' : '¿Cancelar este viaje?',
      message: releasing
        ? 'El viaje volverá a quedar disponible para otros conductores y avisaremos al cliente.'
        : 'Avisaremos al conductor. Esta acción no se puede deshacer.',
      buttonText: releasing ? 'Liberar viaje' : 'Cancelar viaje',
      showCancel: true,
      cancelText: 'Volver',
      onButtonPress: () => r.cancel(),
    });
  };

  const confirmReject = () =>
    showAlert({
      type: 'warning',
      title: '¿Rechazar solicitud?',
      message: 'El cliente podrá pedir el viaje de nuevo.',
      buttonText: 'Rechazar',
      showCancel: true,
      cancelText: 'Volver',
      onButtonPress: () => r.reject(),
    });

  const timeline = [
    { label: 'Solicitado', at: ride.created_at },
    { label: 'Aceptado', at: ride.accepted_at },
    { label: 'En camino', at: ride.started_at },
    { label: 'Completado', at: ride.completed_at },
    { label: 'Cancelado', at: ride.cancelled_at },
  ].filter((t) => !!t.at);

  return (
    <ScreenContainer>
      <ScreenHeader title="Viaje" subtitle={isDriverSide ? 'Gestiona este viaje' : 'Seguimiento de tu mascota'} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={r.isRefetching} onRefresh={() => r.refetch()} tintColor={theme.primary} />}
      >
        <Card style={styles.statusCard}>
          <View style={styles.rowBetween}>
            <Badge label={info.label} color={info.color} />
            <Text style={[type.title, { color: theme.primary }]}>{formatMoney(ride.price)}</Text>
          </View>
          {r.isSharingLocation && (
            <Text style={[type.caption, { color: theme.info }]}>Compartiendo tu ubicación con el cliente</Text>
          )}
          {ride.status === 'in_transit' && !isDriverSide && (
            <Text style={[type.caption, { color: theme.success }]}>Tu mascota va en camino. Se actualiza automáticamente.</Text>
          )}
          {ride.status === 'pending' && !isDriverSide && (
            <Text style={[type.caption, { color: theme.textMuted }]}>Estamos buscando un conductor. Te avisaremos cuando acepte.</Text>
          )}
          {ride.status === 'cancelled' && !!ride.cancel_reason && (
            <Text style={[type.caption, { color: theme.textMuted }]}>Motivo: {ride.cancel_reason}</Text>
          )}
        </Card>

        {Platform.OS !== 'web' && markers.length > 0 && (
          <View style={[styles.map, { borderColor: theme.border }]} accessible accessibilityLabel="Mapa del viaje">
            <WebMapView
              key={markers.map((m) => `${m.id}:${m.latitude.toFixed(4)},${m.longitude.toFixed(4)}`).join('|')}
              style={styles.flex}
              initialLatitude={markers[markers.length - 1].latitude}
              initialLongitude={markers[markers.length - 1].longitude}
              initialZoom={13}
              markers={markers}
            />
          </View>
        )}

        <Card style={styles.block}>
          <SectionHeader title="Detalles" />
          {!!ride.pet_name && <InfoRow icon={PawPrint} label="Mascota" value={ride.pet_name} color={theme.primary} />}
          <InfoRow icon={MapPin} label="Origen" value={ride.origin_address} color={theme.success} />
          <InfoRow icon={MapPin} label="Destino" value={ride.destination_address} color={theme.primary} />
          {ride.distance_km != null && <InfoRow icon={Route} label="Distancia" value={`${ride.distance_km.toFixed(1)} km`} color={theme.textMuted} />}
          <InfoRow icon={Banknote} label="Tarifa" value={formatMoney(ride.price)} color={theme.textMuted} />
          {ride.requires_carrier && <InfoRow icon={Box} label="Transportín" value="El conductor lo aporta" color={theme.warning} />}
          {!!ride.scheduled_at && <InfoRow icon={Calendar} label="Programado" value={formatDateTime(ride.scheduled_at)} color={theme.info} />}
          {!!ride.notes && <InfoRow icon={StickyNote} label="Notas" value={ride.notes} color={theme.textMuted} />}
          {isDriverSide && !!ride.client_name && <InfoRow icon={User} label="Cliente" value={ride.client_name} color={theme.textMuted} />}
          {!isDriverSide && !!(ride.driver_name || ride.vehicle_model) && (
            <InfoRow
              icon={Truck}
              label="Conductor"
              value={[ride.driver_name, [ride.vehicle_model, ride.vehicle_plate].filter(Boolean).join(' · ')].filter(Boolean).join(' — ')}
              color={theme.textMuted}
            />
          )}
        </Card>

        {timeline.length > 1 && (
          <Card style={styles.block}>
            <SectionHeader title="Línea de tiempo" />
            {timeline.map((t) => (
              <View key={t.label} style={styles.rowBetween}>
                <Text style={[type.body, { color: theme.text }]}>{t.label}</Text>
                <Text style={[type.caption, { color: theme.textMuted }]}>{formatDateTime(t.at)}</Text>
              </View>
            ))}
          </Card>
        )}

        {r.isRideCompleted && (ride.rating != null || r.canRate) && !isDriverSide && (
          <Card style={styles.block}>
            <SectionHeader title={ride.rating != null ? 'Tu calificación' : 'Califica al conductor'} />
            <View style={styles.stars} accessibilityRole="adjustable">
              {[1, 2, 3, 4, 5].map((n) => {
                const filled = n <= (ride.rating ?? stars);
                return (
                  <TouchableOpacity
                    key={n}
                    disabled={ride.rating != null}
                    onPress={() => setStars(n)}
                    accessibilityRole="button"
                    accessibilityLabel={`${n} ${n === 1 ? 'estrella' : 'estrellas'}`}
                    accessibilityState={{ selected: filled }}
                    style={styles.star}
                  >
                    <Star size={30} color={theme.warning} fill={filled ? theme.warning : 'transparent'} />
                  </TouchableOpacity>
                );
              })}
            </View>
            {ride.rating != null ? (
              !!ride.rating_comment && <Text style={[type.body, { color: theme.textMuted }]}>{ride.rating_comment}</Text>
            ) : (
              <>
                <TextInput
                  value={comment}
                  onChangeText={setComment}
                  placeholder="Comentario (opcional)"
                  placeholderTextColor={theme.textMuted}
                  maxLength={500}
                  multiline
                  accessibilityLabel="Comentario de la calificación"
                  style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
                />
                <Button
                  label="Enviar calificación"
                  disabled={stars === 0}
                  loading={r.isActing}
                  onPress={() => r.rate(stars, comment)}
                />
              </>
            )}
          </Card>
        )}

        {r.isRideCompleted && isDriverSide && ride.rating != null && (
          <Card style={styles.block}>
            <SectionHeader title="Calificación del cliente" />
            <Text style={[type.title, { color: theme.text }]}>{ride.rating}/5</Text>
            {!!ride.rating_comment && <Text style={[type.body, { color: theme.textMuted }]}>{ride.rating_comment}</Text>}
          </Card>
        )}

        <View style={styles.actions}>
          {r.canAccept && <Button label="Aceptar viaje" size="lg" loading={r.isActing} onPress={r.accept} />}
          {r.canReject && <Button label="Rechazar" variant="secondary" disabled={r.isActing} onPress={confirmReject} />}
          {r.canStart && <Button label="Iniciar viaje" size="lg" loading={r.isStarting} disabled={r.isActing} onPress={r.handleStart} />}
          {r.canFinish && <Button label="Finalizar viaje" size="lg" loading={r.isFinishing} disabled={r.isActing} onPress={r.handleFinish} />}
          {r.canCancel && (
            <Button
              label={ride.viewer_role === 'driver' ? 'Liberar viaje' : 'Cancelar viaje'}
              variant="danger"
              disabled={r.isActing}
              onPress={confirmCancel}
            />
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pad: { paddingHorizontal: 20 },
  content: { paddingHorizontal: 20, paddingBottom: 100, gap: spacing.md },
  statusCard: { gap: spacing.sm },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  map: { height: 220, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1 },
  block: { gap: spacing.md },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  stars: { flexDirection: 'row', gap: spacing.xs, justifyContent: 'center' },
  star: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  input: { minHeight: 72, borderRadius: radius.md, borderWidth: 1, padding: spacing.md, textAlignVertical: 'top' },
  actions: { gap: spacing.sm, marginTop: spacing.sm },
});
