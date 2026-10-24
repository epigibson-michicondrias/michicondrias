"use client";

/**
 * Tarjeta de una solicitud de adopción recibida: quién, cuándo, estado y motivo.
 * Espejo de `mobile/src/features/adopciones/RequestCard.tsx`.
 */
import { ChevronRight } from "lucide-react";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import { requestStatusInfo, requestStatusColor } from "./requestStatus";
import { formatDate } from "@/utils/formatters";
import type { AdoptionRequest } from "@/types/adopciones";
import s from "./adopciones.module.css";

interface RequestCardProps {
  request: AdoptionRequest;
  /** Nombre de la mascota (en la lista de todas las solicitudes). */
  petName?: string;
  onPress: () => void;
}

export default function RequestCard({ request, petName, onPress }: RequestCardProps) {
  const status = requestStatusInfo(request.status);
  const color = requestStatusColor(request.status);
  const who = request.applicant_name || "Interesado";
  return (
    <Card onPress={onPress} accessibilityLabel={`Solicitud de ${who}${petName ? ` por ${petName}` : ""}, ${status.label}`}>
      <div className={s.requestCard}>
        <div className={s.requestTop}>
          <div className={s.requestInfo}>
            <p className={s.requestName}>{who}</p>
            <p className={s.requestMeta}>
              {petName ? `Por ${petName} · ` : ""}
              {formatDate(request.created_at)}
            </p>
          </div>
          <Badge label={status.label} color={color} size="sm" />
        </div>
        {request.reason ? <p className={s.requestReason}>«{request.reason}»</p> : null}
        <div className={s.requestMore}>
          <span>{request.status === "PENDING" ? "Revisar solicitud" : "Ver solicitud"}</span>
          <ChevronRight size={16} aria-hidden />
        </div>
      </div>
    </Card>
  );
}
