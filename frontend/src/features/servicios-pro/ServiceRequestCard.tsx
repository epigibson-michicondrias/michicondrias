"use client";

/**
 * ServiceRequestCard — tarjeta de una solicitud de paseo o cuidado.
 * Espejo de `mobile/src/features/servicios-pro/ServiceRequestCard.tsx`: mismas acciones por rol y estado.
 */
import type { ReactNode } from "react";
import { Calendar, Clock, Loader2, MapPin, Star, StickyNote } from "lucide-react";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { showAlert } from "@/components/AppAlert";
import type { Perspective, ProRequest, RequestKind } from "./useProRequests";
import { formatIsoDate, normalizeStatus } from "./requestStatus";
import StatusBadge from "./StatusBadge";
import s from "./servicios-pro.module.css";

interface ServiceRequestCardProps {
  kind: RequestKind;
  request: ProRequest;
  perspective: Perspective;
  busy?: boolean;
  onStatus: (status: string) => void;
  /** El cliente abre el perfil del profesional para calificar el servicio completado. */
  onReview?: () => void;
  /** Abre el perfil del profesional (vista de cliente). */
  onOpenProfile?: () => void;
}

const SIT_TYPE_LABELS: Record<string, string> = {
  hosting: "Hospedaje",
  visiting: "Visitas a domicilio",
};

export default function ServiceRequestCard({
  kind, request, perspective, busy, onStatus, onReview, onOpenProfile,
}: ServiceRequestCardProps) {
  const status = normalizeStatus(request.status);
  const isWalk = kind === "walk";
  const walk = request as { walker_name?: string | null; requested_date?: string; requested_time?: string | null; duration_minutes?: number; pickup_address?: string | null };
  const sit = request as { sitter_name?: string | null; start_date?: string; end_date?: string; service_type?: string; address?: string | null };
  const providerName = isWalk ? walk.walker_name : sit.sitter_name;
  const petName = request.pet_name || "Mascota";
  const subtitle =
    perspective === "provider"
      ? `Cliente: ${request.client_name || "Sin nombre"}`
      : `${isWalk ? "Paseador" : "Cuidador"}: ${providerName || "Sin nombre"}`;

  const dateText = isWalk
    ? formatIsoDate(walk.requested_date)
    : (sit.start_date ?? "").substring(0, 10) === (sit.end_date ?? "").substring(0, 10)
      ? formatIsoDate(sit.start_date)
      : `${formatIsoDate(sit.start_date)} → ${formatIsoDate(sit.end_date)}`;
  const serviceText = isWalk ? "Paseo" : SIT_TYPE_LABELS[sit.service_type ?? ""] || "Cuidado";
  const address = isWalk ? walk.pickup_address : sit.address;
  const timeText = isWalk
    ? [walk.requested_time, walk.duration_minutes ? `${walk.duration_minutes} min` : null].filter(Boolean).join(" · ")
    : "";

  const confirm = (title: string, message: string, next: string, buttonText: string, type: "warning" | "info" = "warning") =>
    showAlert({ type, title, message, showCancel: true, cancelText: "Volver", buttonText, onButtonPress: () => onStatus(next) });

  const providerActions = () => {
    if (status === "pending") {
      return (
        <>
          <Button
            label="Rechazar"
            variant="danger"
            size="sm"
            fullWidth={false}
            disabled={busy}
            onPress={() =>
              confirm(
                "Rechazar solicitud",
                `Se cancelará la solicitud de ${petName}. El cliente será notificado en su lista.`,
                "cancelled",
                "Rechazar",
              )
            }
          />
          <Button label="Aceptar" size="sm" fullWidth={false} disabled={busy} onPress={() => onStatus("accepted")} />
        </>
      );
    }
    if (status === "accepted") {
      return (
        <>
          <Button
            label="Cancelar"
            variant="danger"
            size="sm"
            fullWidth={false}
            disabled={busy}
            onPress={() => confirm("Cancelar servicio", `¿Cancelar el servicio de ${petName}?`, "cancelled", "Cancelar servicio")}
          />
          <Button label="Iniciar" variant="secondary" size="sm" fullWidth={false} disabled={busy} onPress={() => onStatus("in_progress")} />
        </>
      );
    }
    if (status === "in_progress") {
      return (
        <Button
          label="Marcar completado"
          size="sm"
          fullWidth={false}
          disabled={busy}
          onPress={() =>
            confirm("Completar servicio", `¿Confirmas que el servicio de ${petName} ya terminó?`, "completed", "Completar", "info")
          }
        />
      );
    }
    return null;
  };

  const clientActions = () => {
    if (status === "pending" || status === "accepted") {
      return (
        <Button
          label="Cancelar solicitud"
          variant="danger"
          size="sm"
          fullWidth={false}
          disabled={busy}
          onPress={() => confirm("Cancelar solicitud", "¿Quieres cancelar esta solicitud?", "cancelled", "Cancelar solicitud")}
        />
      );
    }
    if (status === "completed" && !request.has_review && onReview) {
      return <Button label="Calificar" size="sm" fullWidth={false} icon={<Star size={14} />} onPress={onReview} />;
    }
    return null;
  };

  const actions = perspective === "provider" ? providerActions() : clientActions();

  return (
    <Card>
      <div className={s.requestCard}>
        <div
          className={`${s.requestHeader} ${onOpenProfile ? s.requestHeaderClickable : ""}`}
          onClick={onOpenProfile}
          role={onOpenProfile ? "button" : undefined}
          tabIndex={onOpenProfile ? 0 : undefined}
          onKeyDown={
            onOpenProfile
              ? (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onOpenProfile();
                  }
                }
              : undefined
          }
          aria-label={onOpenProfile ? `Ver perfil. ${petName}. ${subtitle}` : undefined}
        >
          <div className={s.requestAvatar}>{petName.charAt(0).toUpperCase()}</div>
          <div className={s.requestInfo}>
            <p className={s.requestTitle}>{petName}</p>
            <p className={s.requestSubtitle}>{subtitle}</p>
          </div>
          <StatusBadge status={status} />
        </div>

        <div className={s.detailRows}>
          <DetailRow icon={<Calendar size={14} />} text={`${serviceText} · ${dateText}`} />
          {timeText ? <DetailRow icon={<Clock size={14} />} text={timeText} /> : null}
          {address ? <DetailRow icon={<MapPin size={14} />} text={address} /> : null}
          {request.notes ? <DetailRow icon={<StickyNote size={14} />} text={request.notes} /> : null}
        </div>

        <div className={s.requestFooter}>
          <p className={s.requestPrice}>
            {request.total_price != null ? `$${request.total_price.toLocaleString("es-MX")}` : "Por acordar"}
            <span className={s.requestPriceLabel}>Estimado</span>
          </p>
          <div className={s.requestActions}>
            {busy ? <span className={s.busy} role="status" aria-label="Actualizando"><Loader2 size={20} /></span> : actions}
          </div>
        </div>
      </div>
    </Card>
  );
}

function DetailRow({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <p className={s.detailRow}>
      {icon}
      <span>{text}</span>
    </p>
  );
}
