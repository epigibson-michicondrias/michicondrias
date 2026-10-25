"use client";

/**
 * Mis citas — tabla (`DataTable`) con filtros, cancelar y reagendar. Criterio §0.
 */
import { useRouter } from "next/navigation";
import {
  AlertTriangle, Ban, Building2, Calendar, CalendarClock, Clock,
  FileText, PawPrint, RefreshCw,
} from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import FilterChip from "@/components/FilterChip";
import EmptyState from "@/components/EmptyState";
import { SkeletonList } from "@/components/Skeleton";
import DataTable, { type Column } from "@/components/DataTable";
import {
  useAppointments,
  STATUS_CONFIG,
  FILTER_TABS,
  formatDateTime,
} from "@/hooks/directorio/useAppointments";
import type { Appointment } from "@/services/citas";
import s from "./citas.module.css";

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

  const columns: Column<Appointment>[] = [
    {
      key: "clinic",
      header: "Clínica",
      render: (a) => (
        <div>
          <strong>{a.clinic_name || "Clínica"}</strong>
          {a.service_name ? <span>{a.service_name}</span> : null}
        </div>
      ),
    },
    {
      key: "date",
      header: "Fecha",
      render: (a) => {
        const { date, time } = formatDateTime(a.appointment_date);
        return <span>{date}{time ? ` · ${time}` : ""}</span>;
      },
    },
    {
      key: "pet",
      header: "Mascota",
      render: (a) => <span>{a.pet_name || "—"}</span>,
    },
    {
      key: "reason",
      header: "Motivo",
      render: (a) => <span>{a.reason || "—"}</span>,
    },
    {
      key: "status",
      header: "Estado",
      render: (a) => {
        const status = STATUS_CONFIG[a.status] || STATUS_CONFIG.scheduled;
        return (
          <span>
            <Badge label={status.label} color={`var(--color-${status.tone})`} size="sm" />
            {a.is_emergency && (
              <Badge label="Emergencia" color="var(--color-error)" size="sm" icon={<AlertTriangle size={12} />} />
            )}
          </span>
        );
      },
    },
  ];

  const rowActions = (a: Appointment) => {
    const isActive = !["cancelled", "completed", "rescheduled"].includes(a.status);
    if (!isActive) return null;
    return (
      <div className={s.actions}>
        <Button
          label="Reagendar"
          variant="ghost"
          size="sm"
          icon={<CalendarClock size={14} />}
          onPress={() => handleReschedule(a)}
          accessibilityLabel={`Reagendar la cita en ${a.clinic_name || "la clínica"}`}
        />
        <Button
          label="Cancelar"
          variant="ghost"
          size="sm"
          icon={<Ban size={14} color="var(--color-error)" />}
          onPress={() => handleCancel(a)}
          disabled={cancelMutation.isPending}
          accessibilityLabel={`Cancelar la cita en ${a.clinic_name || "la clínica"}`}
        />
      </div>
    );
  };

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
        <DataTable
          caption="Citas médicas"
          columns={columns}
          rows={appointments}
          rowKey={(a) => a.id}
          rowActions={rowActions}
        />
      )}
    </ScreenContainer>
  );
}
