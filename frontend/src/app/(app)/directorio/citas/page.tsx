"use client";

/**
 * Mis citas — listado con filtros, cancelar y reagendar.
 * Espejo de `mobile/app/directorio/citas/index.tsx`.
 */
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Ban,
  Building2,
  Calendar,
  CalendarClock,
  Clock,
  FileText,
  Info,
  PawPrint,
  RefreshCw,
} from "lucide-react";
import type { ComponentType } from "react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import FilterChip from "@/components/FilterChip";
import EmptyState from "@/components/EmptyState";
import { SkeletonList } from "@/components/Skeleton";
import {
  useAppointments,
  STATUS_CONFIG,
  FILTER_TABS,
  formatDateTime,
} from "@/hooks/directorio/useAppointments";
import type { Appointment } from "@/services/citas";
import s from "./citas.module.css";

function Line({ icon: Icon, text, muted }: { icon: ComponentType<{ size?: number; color?: string }>; text: string; muted?: boolean }) {
  return (
    <div className={s.line}>
      <Icon size={15} color="var(--color-text-muted)" />
      <span className={muted ? s.lineMuted : s.lineText}>{text}</span>
    </div>
  );
}

function AppointmentCard({
  item,
  onCancel,
  onReschedule,
  cancelling,
}: {
  item: Appointment;
  onCancel: (a: Appointment) => void;
  onReschedule: (a: Appointment) => void;
  cancelling: boolean;
}) {
  const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.scheduled;
  const color = `var(--color-${status.tone})`;
  const { date, time } = formatDateTime(item.appointment_date);
  const isActive = !["cancelled", "completed", "rescheduled"].includes(item.status);

  return (
    <Card>
      <div className={s.body}>
        <div className={s.head}>
          <div className={s.iconBox}>
            <Building2 size={20} color="var(--color-primary)" />
          </div>
          <div className={s.headInfo}>
            <p className={s.clinicName}>{item.clinic_name || "Clínica"}</p>
            {item.service_name ? <p className={s.serviceName}>{item.service_name}</p> : null}
          </div>
          <Badge label={status.label} color={color} size="sm" />
        </div>

        <div className={s.lines}>
          <Line icon={Calendar} text={`${date}${time ? ` · ${time}` : ""}`} />
          <Line icon={PawPrint} text={item.pet_name || "Mascota"} />
          {item.reason ? <Line icon={FileText} text={item.reason} muted /> : null}
        </div>

        {item.is_emergency ? (
          <Badge label="Emergencia" color="var(--color-error)" size="sm" icon={<AlertTriangle size={12} />} />
        ) : null}

        {item.status === "cancelled" && item.cancellation_reason ? (
          <div className={s.note}>
            <Info size={15} color="var(--color-error)" />
            <span className={s.lineText}>Motivo: {item.cancellation_reason}</span>
          </div>
        ) : null}

        {isActive ? (
          <div className={s.actions}>
            <Button
              label="Reagendar"
              variant="secondary"
              size="sm"
              icon={<CalendarClock size={15} />}
              onPress={() => onReschedule(item)}
              accessibilityLabel={`Reagendar la cita en ${item.clinic_name || "la clínica"}`}
            />
            <Button
              label="Cancelar"
              variant="secondary"
              size="sm"
              icon={<Ban size={15} color="var(--color-error)" />}
              onPress={() => onCancel(item)}
              disabled={cancelling}
              accessibilityLabel={`Cancelar la cita en ${item.clinic_name || "la clínica"}`}
            />
          </div>
        ) : null}
      </div>
    </Card>
  );
}

export default function CitasPage() {
  const router = useRouter();
  const {
    appointments,
    countFor,
    isLoading,
    isRefetching,
    refetch,
    activeFilter,
    setActiveFilter,
    handleCancel,
    handleReschedule,
    cancelMutation,
  } = useAppointments();

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Mis citas"
        subtitle={countFor("all") > 0 ? `${countFor("all")} ${countFor("all") === 1 ? "cita" : "citas"}` : undefined}
        actions={[{ icon: RefreshCw, label: "Actualizar citas", onPress: () => refetch(), loading: isRefetching }]}
      />

      <div className={s.chips} role="group" aria-label="Filtrar citas">
        {FILTER_TABS.map((tab) => {
          const count = countFor(tab.key);
          return (
            <FilterChip
              key={tab.key}
              label={tab.label}
              count={tab.key === "all" || count === 0 ? undefined : count}
              active={activeFilter === tab.key}
              onPress={() => setActiveFilter(tab.key)}
            />
          );
        })}
      </div>

      {isLoading ? (
        <SkeletonList count={3} />
      ) : appointments.length === 0 ? (
        <EmptyState
          icon={activeFilter === "all" ? <Calendar size={28} /> : <Clock size={28} />}
          title={activeFilter === "all" ? "Aún no tienes citas" : "Nada en este filtro"}
          subtitle={
            activeFilter === "all"
              ? "Busca una clínica o especialista y agenda en minutos."
              : "No tienes citas con este estado."
          }
          actionLabel={activeFilter === "all" ? "Buscar veterinario" : "Ver todas"}
          onAction={
            activeFilter === "all" ? () => router.push("/directorio") : () => setActiveFilter("all")
          }
        />
      ) : (
        <div className={s.list}>
          {appointments.map((item) => (
            <AppointmentCard
              key={item.id}
              item={item}
              onCancel={handleCancel}
              onReschedule={handleReschedule}
              cancelling={cancelMutation.isPending}
            />
          ))}
        </div>
      )}
    </ScreenContainer>
  );
}
