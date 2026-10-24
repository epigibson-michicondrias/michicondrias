"use client";

/**
 * RideCard — tarjeta de viaje reutilizable (cliente y conductor).
 * Espejo de `mobile/src/components/rides/RideCard.tsx`.
 */
import type { ReactNode } from "react";
import { Calendar, MapPin, PawPrint, Truck, User } from "lucide-react";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import type { PetRide } from "@/types/rides";
import { RIDE_STATUS_LABELS, type RideStatus } from "@/types/rides";
import l from "./transportistas.module.css";

export function rideStatusInfo(status: string): { label: string; color: string } {
  const label = RIDE_STATUS_LABELS[status as RideStatus] ?? status;
  switch (status as RideStatus) {
    case "pending":
      return { label, color: "var(--color-warning)" };
    case "accepted":
      return { label, color: "var(--color-info)" };
    case "in_transit":
      return { label, color: "var(--color-primary)" };
    case "completed":
      return { label, color: "var(--color-success)" };
    case "cancelled":
    case "rejected":
      return { label, color: "var(--color-error)" };
    default:
      return { label, color: "var(--color-text-muted)" };
  }
}

export function formatMoney(value?: number | null): string {
  return value == null ? "—" : `$${Number(value).toFixed(2)}`;
}

export function formatDateTime(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface Props {
  ride: PetRide;
  onPress?: () => void;
  /** Muestra a la contraparte: 'client' enseña al conductor; 'driver' enseña al cliente. */
  perspective: "client" | "driver";
  footer?: ReactNode;
}

export default function RideCard({ ride, onPress, perspective, footer }: Props) {
  const info = rideStatusInfo(ride.status);
  const who =
    perspective === "client"
      ? ride.driver_name || (ride.vehicle_model ? ride.vehicle_model : null)
      : ride.client_name;
  const when = formatDateTime(ride.scheduled_at || ride.created_at);

  const body = (
    <div className={l.card}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-md)" }}>
        <Badge label={info.label} color={info.color} size="sm" />
        <span className={l.price}>{formatMoney(ride.price)}</span>
      </div>

      <div className={l.routeRow}>
        <MapPin size={14} color="var(--color-success)" aria-hidden />
        <span>{ride.origin_address}</span>
      </div>
      <div className={l.routeRow}>
        <MapPin size={14} color="var(--color-primary)" aria-hidden />
        <span>{ride.destination_address}</span>
      </div>

      <div className={l.metaRow}>
        {ride.pet_name ? (
          <span className={l.metaItem}>
            <PawPrint size={13} aria-hidden />
            {ride.pet_name}
          </span>
        ) : null}
        {who ? (
          <span className={l.metaItem}>
            {perspective === "client" ? <Truck size={13} aria-hidden /> : <User size={13} aria-hidden />}
            {who}
          </span>
        ) : null}
        {when ? (
          <span className={l.metaItem}>
            <Calendar size={13} aria-hidden />
            {ride.scheduled_at ? "Programado " : ""}
            {when}
          </span>
        ) : null}
      </div>
    </div>
  );

  // Con `footer` la tarjeta no puede ser botón (habría botones dentro de botón)
  return (
    <Card onPress={footer ? undefined : onPress}>
      {footer && onPress ? (
        <button
          type="button"
          onClick={onPress}
          style={{ background: "none", border: 0, padding: 0, cursor: "pointer", width: "100%", textAlign: "left" }}
          aria-label={`Ver viaje a ${ride.destination_address}`}
        >
          {body}
        </button>
      ) : (
        body
      )}
      {footer ? <div className={l.cardActions}>{footer}</div> : null}
    </Card>
  );
}
