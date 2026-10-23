"use client";

/**
 * Solicitudes de viaje del conductor (`/transportistas/solicitudes`).
 * Espejo de `mobile/app/transportistas/solicitudes.tsx`.
 */
import { AlertCircle, Inbox, MapPinOff } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";
import SectionHeader from "@/components/SectionHeader";
import RoleGuard from "@/components/RoleGuard";
import { SkeletonList } from "@/components/Skeleton";
import RideCard from "../RideCard";
import { useDriverRequests } from "@/hooks/rides/useDriverRequests";
import type { PetRide } from "@/services/rides";
import l from "../transportistas.module.css";

function SolicitudesContent() {
  const {
    requests,
    activeRides,
    hasLocation,
    isLoading,
    isError,
    refetch,
    accept,
    reject,
    busyId,
    router,
  } = useDriverRequests();

  const open = (r: PetRide) => router.push(`/transportistas/tracking/${r.id}`);

  return (
    <ScreenContainer>
      <ScreenHeader title="Solicitudes" subtitle="Viajes para aceptar" />

      {isLoading ? (
        <SkeletonList count={4} />
      ) : isError && !requests.length && !activeRides.length ? (
        <EmptyState
          icon={<AlertCircle size={28} />}
          title="No pudimos cargar las solicitudes"
          subtitle="Revisa tu conexión e intenta de nuevo."
          actionLabel="Reintentar"
          onAction={refetch}
        />
      ) : (
        <>
          <div className={l.sectionBlock}>
            <SectionHeader title="Tus viajes" subtitle="Aceptados o en curso" />
            {activeRides.length === 0 ? (
              <EmptyState
                icon={<Inbox size={28} />}
                title="Sin viajes en curso"
                subtitle="Los viajes que aceptes aparecerán aquí."
              />
            ) : (
              <div className={l.list}>
                {activeRides.map((item) => (
                  <RideCard key={item.id} ride={item} perspective="driver" onPress={() => open(item)} />
                ))}
              </div>
            )}
          </div>

          <div className={l.sectionBlock}>
            <SectionHeader
              title="Solicitudes disponibles"
              subtitle={hasLocation ? "Ordenadas por cercanía" : "Activa tu ubicación para verlas por cercanía"}
            />
            {!hasLocation ? (
              <p
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: "var(--font-sm)",
                  color: "var(--color-text-muted)",
                  margin: "0 0 var(--space-md)",
                }}
              >
                <MapPinOff size={14} />
                Sin ubicación: se muestran todas las solicitudes.
              </p>
            ) : null}
            {requests.length === 0 ? (
              <EmptyState
                icon={<Inbox size={28} />}
                title="No hay solicitudes por ahora"
                subtitle="Te avisaremos cuando llegue una nueva. Tu perfil debe estar disponible."
              />
            ) : (
              <div className={l.list}>
                {requests.map((item) => (
                  <RideCard
                    key={item.id}
                    ride={item}
                    perspective="driver"
                    onPress={() => open(item)}
                    footer={
                      <>
                        {item.preferred_driver_id || item.driver_id ? (
                          <Button
                            label="Rechazar"
                            variant="secondary"
                            size="sm"
                            fullWidth={false}
                            disabled={busyId === item.id}
                            onPress={() => reject(item.id)}
                            accessibilityLabel={`Rechazar viaje a ${item.destination_address}`}
                          />
                        ) : null}
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
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </ScreenContainer>
  );
}

export default function SolicitudesConductorPage() {
  return (
    <RoleGuard roles={["transportista"]} message="Las solicitudes de viaje son para cuentas de transportista.">
      <SolicitudesContent />
    </RoleGuard>
  );
}
