import React from 'react';
import { RefreshControl, SectionList, StyleSheet, Text, View } from 'react-native';
import { AlertCircle, Inbox, MapPinOff } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useDriverRequests } from '@/src/hooks/rides/useDriverRequests';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import RoleGuard from '@/src/components/RoleGuard';
import Button from '@/src/components/Button';
import EmptyState from '@/src/components/EmptyState';
import SectionHeader from '@/src/components/SectionHeader';
import { SkeletonList } from '@/src/components/Skeleton';
import RideCard from '@/src/components/rides/RideCard';
import type { PetRide } from '@/src/services/rides';
import { spacing, type } from '@/constants/design';

function Screen() {
  const { theme } = useTheme();
  const { requests, activeRides, hasLocation, isLoading, isError, isRefetching, refetch, accept, reject, busyId, router } =
    useDriverRequests();

  const open = (r: PetRide) => router.push(`/transportistas/tracking/${r.id}` as any);

  const sections = [
    { key: 'active', title: 'Tus viajes', subtitle: 'Aceptados o en curso', data: activeRides },
    {
      key: 'requests',
      title: 'Solicitudes disponibles',
      subtitle: hasLocation ? 'Ordenadas por cercanía' : 'Activa tu ubicación para verlas por cercanía',
      data: requests,
    },
  ];

  return (
    <ScreenContainer>
      <ScreenHeader title="Solicitudes" subtitle="Viajes para aceptar" />
      {isLoading ? (
        <View style={styles.pad}>
          <SkeletonList count={4} />
        </View>
      ) : isError && !requests.length && !activeRides.length ? (
        <EmptyState
          icon={<AlertCircle size={32} color={theme.textMuted} />}
          title="No pudimos cargar las solicitudes"
          subtitle="Revisa tu conexión e intenta de nuevo."
          actionLabel="Reintentar"
          onAction={refetch}
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(r) => r.id}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.primary} />}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHead}>
              <SectionHeader title={section.title} subtitle={section.subtitle} />
              {section.key === 'requests' && !hasLocation && (
                <View style={styles.noLoc}>
                  <MapPinOff size={14} color={theme.textMuted} />
                  <Text style={[type.caption, { color: theme.textMuted }]}>Sin ubicación: se muestran todas las solicitudes.</Text>
                </View>
              )}
            </View>
          )}
          renderItem={({ item, section }) =>
            section.key === 'active' ? (
              <RideCard ride={item} perspective="driver" onPress={() => open(item)} />
            ) : (
              <RideCard
                ride={item}
                perspective="driver"
                onPress={() => open(item)}
                footer={
                  <>
                    {!!(item.preferred_driver_id || item.driver_id) && (
                      <Button
                        label="Rechazar"
                        variant="secondary"
                        size="sm"
                        fullWidth={false}
                        disabled={busyId === item.id}
                        onPress={() => reject(item.id)}
                        accessibilityLabel={`Rechazar viaje a ${item.destination_address}`}
                      />
                    )}
                    <Button
                      label="Aceptar"
                      size="sm"
                      fullWidth={false}
                      loading={busyId === item.id}
                      onPress={() => accept(item.id)}
                      accessibilityLabel={`Aceptar viaje a ${item.destination_address}`}
                    />
                  </>
                }
              />
            )
          }
          renderSectionFooter={({ section }) =>
            section.data.length === 0 ? (
              <EmptyState
                icon={<Inbox size={28} color={theme.textMuted} />}
                title={section.key === 'active' ? 'Sin viajes en curso' : 'No hay solicitudes por ahora'}
                subtitle={
                  section.key === 'active'
                    ? 'Los viajes que aceptes aparecerán aquí.'
                    : 'Te avisaremos cuando llegue una nueva. Tu perfil debe estar disponible.'
                }
              />
            ) : null
          }
        />
      )}
    </ScreenContainer>
  );
}

export default function SolicitudesConductorScreen() {
  return (
    <RoleGuard roles={['transportista']} message="Las solicitudes de viaje son para cuentas de transportista.">
      <Screen />
    </RoleGuard>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20 },
  list: { paddingHorizontal: 20, paddingBottom: 100 },
  sectionHead: { marginTop: spacing.md, marginBottom: spacing.sm, gap: spacing.xs },
  noLoc: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});
