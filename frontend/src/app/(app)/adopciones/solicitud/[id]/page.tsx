"use client";

/**
 * Detalle y gestión de una solicitud de adopción (`/adopciones/solicitud/[id]`).
 * Espejo de `mobile/app/adopciones/solicitud/[id].tsx`.
 */
import {
  AlertCircle, Home, Trees, Key, Baby, Clock, PawPrint, Wallet, Calendar, CheckCircle2, XCircle, Search,
} from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import EmptyState from "@/components/EmptyState";
import FormField from "@/components/FormField";
import Button from "@/components/Button";
import Badge from "@/components/Badge";
import Card from "@/components/Card";
import { Skeleton } from "@/components/Skeleton";
import { useApplicationDetail } from "@/hooks/adopciones/useApplicationDetail";
import { NEXT_STEP, requestStatusColor } from "@/features/adopciones/requestStatus";
import { formatDate, sentenceCase } from "@/utils/formatters";
import local from "@/features/adopciones/adopciones.module.css";

function Fact({ icon: Icon, label, value }: { icon: typeof Home; label: string; value: string }) {
  return (
    <div className={local.fact}>
      <Icon size={16} className={local.factIcon} aria-hidden />
      <span>{label}</span>
      <span className={local.factValue}>{sentenceCase(value)}</span>
    </div>
  );
}

export default function SolicitudDetallePage() {
  const {
    request, listing, isLoading, statusInfo, notes, interviewDate,
    setNotes, setInterviewDate, handleStatusUpdate, handleApprove, isMutating, isApplicant,
  } = useApplicationDetail();

  if (isLoading) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Solicitud" />
        <div style={{ display: "grid", gap: "var(--space-md)" }}>
          <Skeleton height={72} borderRadius={12} />
          <Skeleton height={140} borderRadius={12} />
          <Skeleton height={200} borderRadius={12} />
        </div>
      </ScreenContainer>
    );
  }

  if (!request) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Solicitud" />
        <EmptyState
          icon={<AlertCircle size={28} />}
          title="No encontramos esta solicitud"
          subtitle="Puede que se haya retirado o que no tengas acceso."
        />
      </ScreenContainer>
    );
  }

  const status = request.status;
  const isClosed = status === "ADOPTED" || status === "REJECTED" || isApplicant;
  const canApprove = status === "REVIEWING" || status === "INTERVIEW_SCHEDULED" || status === "APPROVED";
  const statusColor = requestStatusColor(status);
  const petName = listing?.name ?? request.pet_name ?? "la mascota";

  return (
    <ScreenContainer>
      <ScreenHeader
        title={request.applicant_name || "Solicitud"}
        subtitle={`Quiere adoptar a ${petName}`}
      />

      {/* Estado y siguiente paso */}
      <Card>
        <div className={local.statusRow}>
          <Badge label={statusInfo.label} color={statusColor} variant="solid" />
          <span className={local.statusDate}>Enviada el {formatDate(request.created_at)}</span>
        </div>
        <p className={local.desc} style={{ marginTop: "var(--space-sm)" }}>
          {isApplicant ? "Te avisaremos cada vez que cambie de estado." : NEXT_STEP[status] ?? ""}
        </p>
      </Card>

      <div className={local.section} style={{ marginTop: "var(--space-lg)" }}>
        <h2 className={local.sectionTitle}>Por qué quiere adoptar</h2>
        <p className={local.quote}>«{request.reason}»</p>
        {request.previous_experience ? (
          <p className={local.desc} style={{ marginTop: "var(--space-sm)" }}>
            Experiencia: {request.previous_experience}
          </p>
        ) : null}
      </div>

      <div className={local.section}>
        <h2 className={local.sectionTitle}>Su hogar</h2>
        <Card>
          <div className={local.facts}>
            <Fact icon={Home} label="Vivienda" value={request.house_type || "Sin dato"} />
            <Fact
              icon={Key}
              label="Es"
              value={
                request.own_or_rent === "Renta"
                  ? `Rentada${request.landlord_permission ? " · con permiso" : " · sin permiso"}`
                  : request.own_or_rent || "Sin dato"
              }
            />
            <Fact icon={Trees} label="Patio o jardín" value={request.has_yard ? "Sí" : "No"} />
            <Fact icon={Baby} label="Niños" value={request.has_children ? (request.children_ages || "Sí") : "No"} />
            <Fact icon={Clock} label="Horas sola al día" value={`${request.hours_alone} h`} />
            <Fact icon={PawPrint} label="Otras mascotas" value={request.other_pets || "Ninguna"} />
            <Fact icon={Wallet} label="Compromiso de gastos" value={request.financial_commitment ? "Aceptado" : "No"} />
          </div>
        </Card>
      </div>

      {request.compatibility_score != null ? (
        <div className={local.section}>
          <h2 className={local.sectionTitle}>Compatibilidad estimada: {request.compatibility_score}/100</h2>
          {request.vetting_notes ? <p className={local.desc}>{request.vetting_notes}</p> : null}
        </div>
      ) : null}

      {!isClosed ? (
        <div className={local.section}>
          <h2 className={local.sectionTitle}>Responder</h2>
          {status === "REVIEWING" ? (
            <div style={{ display: "grid", gap: "var(--space-sm)", marginBottom: "var(--space-md)" }}>
              <FormField
                label="Entrevista"
                value={interviewDate}
                onChangeText={setInterviewDate}
                placeholder="Ej: sábado 15, 10:00 a. m., en el refugio"
              />
              <Button
                label="Agendar entrevista"
                variant="secondary"
                icon={<Calendar size={18} />}
                onPress={() => handleStatusUpdate("INTERVIEW_SCHEDULED")}
                disabled={isMutating}
              />
            </div>
          ) : null}
          <FormField
            label="Mensaje para quien solicita (opcional)"
            value={notes}
            onChangeText={setNotes}
            placeholder="Se envía junto con el cambio de estado"
            multiline
          />
        </div>
      ) : null}

      {!isClosed ? (
        <div className={local.footerActions}>
          <Button
            label="Rechazar"
            variant="secondary"
            icon={<XCircle size={18} />}
            onPress={() => handleStatusUpdate("REJECTED")}
            disabled={isMutating}
          />
          {status === "PENDING" ? (
            <Button
              label="Empezar revisión"
              icon={<Search size={18} />}
              onPress={() => handleStatusUpdate("REVIEWING")}
              loading={isMutating}
              style={{ flex: 1.6 }}
            />
          ) : canApprove ? (
            <Button
              label="Aprobar adopción"
              icon={<CheckCircle2 size={18} />}
              onPress={handleApprove}
              loading={isMutating}
              style={{ flex: 1.6 }}
            />
          ) : null}
        </div>
      ) : null}
    </ScreenContainer>
  );
}
