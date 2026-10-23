"use client";

/**
 * Detalle y seguimiento de un viaje (`/transportistas/tracking/[id]`).
 * Espejo de `mobile/app/transportistas/tracking/[id].tsx`.
 */
import { useState } from "react";
import { useParams } from "next/navigation";
import {
  AlertCircle,
  Banknote,
  Box,
  Calendar,
  MapPin,
  PawPrint,
  Route,
  Star,
  StickyNote,
  Truck,
  User,
} from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";
import SectionHeader from "@/components/SectionHeader";
import FormField from "@/components/FormField";
import { Skeleton } from "@/components/Skeleton";
import { showAlert } from "@/components/AppAlert";
import { useRideTracking } from "@/hooks/rides/useRideTracking";
import { formatDateTime, formatMoney, rideStatusInfo } from "../../RideCard";
import l from "../../transportistas.module.css";

function InfoRow({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof PawPrint;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className={l.infoRow}>
      <Icon size={16} color={color} aria-hidden />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p className={l.infoLabel}>{label}</p>
        <p className={l.infoValue}>{value}</p>
      </div>
    </div>
  );
}

export default function TrackingViajePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const r = useRideTracking(id ?? "");
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const ride = r.ride;

  if (r.isLoading) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Viaje" subtitle="Detalle y seguimiento" />
        <Skeleton height={80} />
        <Skeleton height={160} style={{ marginTop: "var(--space-md)" }} />
        <Skeleton height={140} style={{ marginTop: "var(--space-md)" }} />
      </ScreenContainer>
    );
  }

  if (r.isError || !ride) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Viaje" subtitle="Detalle y seguimiento" />
        <EmptyState
          icon={<AlertCircle size={28} />}
          title="No se pudo cargar el viaje"
          subtitle={r.errorMessage || "Verifica tu conexión e intenta de nuevo."}
          actionLabel="Reintentar"
          onAction={() => r.refetch()}
        />
      </ScreenContainer>
    );
  }

  const info = rideStatusInfo(ride.status);
  const isDriverSide = ride.viewer_role === "driver" || ride.viewer_role === "candidate";

  const confirmCancel = () => {
    const releasing = ride.viewer_role === "driver";
    showAlert({
      type: "warning",
      title: releasing ? "¿Liberar este viaje?" : "¿Cancelar este viaje?",
      message: releasing
        ? "El viaje volverá a quedar disponible para otros conductores y avisaremos al cliente."
        : "Avisaremos al conductor. Esta acción no se puede deshacer.",
      buttonText: releasing ? "Liberar viaje" : "Cancelar viaje",
      showCancel: true,
      cancelText: "Volver",
      onButtonPress: () => r.cancel(),
    });
  };

  const confirmReject = () =>
    showAlert({
      type: "warning",
      title: "¿Rechazar solicitud?",
      message: "El cliente podrá pedir el viaje de nuevo.",
      buttonText: "Rechazar",
      showCancel: true,
      cancelText: "Volver",
      onButtonPress: () => r.reject(),
    });

  const timeline = [
    { label: "Solicitado", at: ride.created_at },
    { label: "Aceptado", at: ride.accepted_at },
    { label: "En camino", at: ride.started_at },
    { label: "Completado", at: ride.completed_at },
    { label: "Cancelado", at: ride.cancelled_at },
  ].filter((t) => !!t.at);

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Viaje"
        subtitle={isDriverSide ? "Gestiona este viaje" : "Seguimiento de tu mascota"}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-md)" }}>
            <Badge label={info.label} color={info.color} />
            <span className={l.price}>{formatMoney(ride.price)}</span>
          </div>
          {r.isSharingLocation ? (
            <p style={{ margin: "var(--space-sm) 0 0", fontSize: "var(--font-sm)", color: "var(--color-info)" }}>
              Compartiendo tu ubicación con el cliente
            </p>
          ) : null}
          {ride.status === "in_transit" && !isDriverSide ? (
            <p style={{ margin: "var(--space-sm) 0 0", fontSize: "var(--font-sm)", color: "var(--color-success)" }}>
              Tu mascota va en camino. Se actualiza automáticamente.
            </p>
          ) : null}
          {ride.status === "pending" && !isDriverSide ? (
            <p style={{ margin: "var(--space-sm) 0 0", fontSize: "var(--font-sm)", color: "var(--color-text-muted)" }}>
              Estamos buscando un conductor. Te avisaremos cuando acepte.
            </p>
          ) : null}
          {ride.status === "cancelled" && ride.cancel_reason ? (
            <p style={{ margin: "var(--space-sm) 0 0", fontSize: "var(--font-sm)", color: "var(--color-text-muted)" }}>
              Motivo: {ride.cancel_reason}
            </p>
          ) : null}
        </Card>

        <Card>
          <SectionHeader title="Detalles" />
          {ride.pet_name ? <InfoRow icon={PawPrint} label="Mascota" value={ride.pet_name} color="var(--color-primary)" /> : null}
          <InfoRow icon={MapPin} label="Origen" value={ride.origin_address} color="var(--color-success)" />
          <InfoRow icon={MapPin} label="Destino" value={ride.destination_address} color="var(--color-primary)" />
          {ride.distance_km != null ? (
            <InfoRow icon={Route} label="Distancia" value={`${ride.distance_km.toFixed(1)} km`} color="var(--color-text-muted)" />
          ) : null}
          <InfoRow icon={Banknote} label="Tarifa" value={formatMoney(ride.price)} color="var(--color-text-muted)" />
          {ride.requires_carrier ? (
            <InfoRow icon={Box} label="Transportín" value="El conductor lo aporta" color="var(--color-warning)" />
          ) : null}
          {ride.scheduled_at ? (
            <InfoRow icon={Calendar} label="Programado" value={formatDateTime(ride.scheduled_at)} color="var(--color-info)" />
          ) : null}
          {ride.notes ? <InfoRow icon={StickyNote} label="Notas" value={ride.notes} color="var(--color-text-muted)" /> : null}
          {isDriverSide && ride.client_name ? (
            <InfoRow icon={User} label="Cliente" value={ride.client_name} color="var(--color-text-muted)" />
          ) : null}
          {!isDriverSide && (ride.driver_name || ride.vehicle_model) ? (
            <InfoRow
              icon={Truck}
              label="Conductor"
              value={[ride.driver_name, [ride.vehicle_model, ride.vehicle_plate].filter(Boolean).join(" · ")]
                .filter(Boolean)
                .join(" — ")}
              color="var(--color-text-muted)"
            />
          ) : null}
        </Card>

        {timeline.length > 1 ? (
          <Card>
            <SectionHeader title="Línea de tiempo" />
            <div className={l.timeline}>
              {timeline.map((t) => (
                <div key={t.label} className={l.timelineItem}>
                  <span className={l.timelineDot} />
                  <div style={{ flex: 1, display: "flex", justifyContent: "space-between", gap: "var(--space-md)" }}>
                    <p className={l.timelineTitle}>{t.label}</p>
                    <p className={l.timelineMeta}>{formatDateTime(t.at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : null}

        {r.isRideCompleted && (ride.rating != null || r.canRate) && !isDriverSide ? (
          <Card>
            <SectionHeader title={ride.rating != null ? "Tu calificación" : "Califica al conductor"} />
            <div style={{ display: "flex", justifyContent: "center", gap: "var(--space-xs)" }}>
              {[1, 2, 3, 4, 5].map((n) => {
                const filled = n <= (ride.rating ?? stars);
                return (
                  <button
                    key={n}
                    type="button"
                    disabled={ride.rating != null}
                    onClick={() => setStars(n)}
                    aria-label={`${n} ${n === 1 ? "estrella" : "estrellas"}`}
                    aria-pressed={filled}
                    style={{
                      background: "none",
                      border: 0,
                      cursor: ride.rating != null ? "default" : "pointer",
                      minWidth: 44,
                      minHeight: 44,
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <Star
                      size={28}
                      color="var(--color-accent)"
                      fill={filled ? "var(--color-accent)" : "transparent"}
                    />
                  </button>
                );
              })}
            </div>
            {ride.rating != null ? (
              ride.rating_comment ? (
                <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-md)" }}>{ride.rating_comment}</p>
              ) : null
            ) : (
              <>
                <FormField
                  label="Comentario (opcional)"
                  value={comment}
                  onChangeText={setComment}
                  placeholder="Comentario (opcional)"
                  maxLength={500}
                  multiline
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
        ) : null}

        {r.isRideCompleted && isDriverSide && ride.rating != null ? (
          <Card>
            <SectionHeader title="Calificación del cliente" />
            <p style={{ margin: 0, fontSize: "var(--font-xl)", fontWeight: 800, color: "var(--color-text)" }}>
              {ride.rating}/5
            </p>
            {ride.rating_comment ? (
              <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-md)" }}>{ride.rating_comment}</p>
            ) : null}
          </Card>
        ) : null}

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
          {r.canAccept ? <Button label="Aceptar viaje" size="lg" loading={r.isActing} onPress={r.accept} /> : null}
          {r.canReject ? (
            <Button label="Rechazar" variant="secondary" disabled={r.isActing} onPress={confirmReject} />
          ) : null}
          {r.canStart ? (
            <Button
              label="Iniciar viaje"
              size="lg"
              loading={r.isStarting}
              disabled={r.isActing}
              onPress={r.handleStart}
            />
          ) : null}
          {r.canFinish ? (
            <Button
              label="Finalizar viaje"
              size="lg"
              loading={r.isFinishing}
              disabled={r.isActing}
              onPress={r.handleFinish}
            />
          ) : null}
          {r.canCancel ? (
            <Button
              label={ride.viewer_role === "driver" ? "Liberar viaje" : "Cancelar viaje"}
              variant="danger"
              disabled={r.isActing}
              onPress={confirmCancel}
            />
          ) : null}
        </div>
      </div>
    </ScreenContainer>
  );
}
