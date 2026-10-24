/**
 * useAppointments — mis citas: listado, filtros y cancelación.
 * Espejo de `mobile/src/hooks/directorio/useAppointments.ts`.
 */
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserAppointments, cancelAppointment, type Appointment } from "@/services/citas";
import { getMyAppointments, type AppointmentItem } from "@/services/directorio";
import { showAlert } from "@/components/AppAlert";

export type FilterTab = "all" | "scheduled" | "confirmed" | "completed" | "cancelled";

/** Etiqueta y tono del color por estado (CSS: `var(--color-*)`). */
export const STATUS_CONFIG: Record<
  string,
  { label: string; tone: "warning" | "info" | "success" | "primary" | "error" }
> = {
  scheduled: { label: "Por confirmar", tone: "warning" },
  pending: { label: "Por confirmar", tone: "warning" },
  rescheduled: { label: "Reagendada", tone: "info" },
  confirmed: { label: "Confirmada", tone: "success" },
  completed: { label: "Completada", tone: "primary" },
  cancelled: { label: "Cancelada", tone: "error" },
};

export const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "scheduled", label: "Por confirmar" },
  { key: "confirmed", label: "Confirmadas" },
  { key: "completed", label: "Completadas" },
  { key: "cancelled", label: "Canceladas" },
];

export function formatDateTime(dateStr: string): { date: string; time: string } {
  try {
    const parts = dateStr.split(" ");
    if (parts.length >= 2) {
      return { date: parts[0], time: parts.slice(1).join(" ") };
    }
    const d = new Date(dateStr);
    return {
      date: d.toLocaleDateString("es-MX"),
      time: d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
    };
  } catch {
    return { date: dateStr, time: "" };
  }
}

function matches(a: Appointment, key: FilterTab) {
  if (key === "all") return a.status !== "cancelled" && a.status !== "rescheduled";
  if (key === "scheduled") return a.status === "pending" || a.status === "scheduled";
  return a.status === key;
}

export function useAppointments() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");

  const { data: appointments = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["user-appointments"],
    queryFn: getUserAppointments,
  });

  const { data: directorioAppointments = [], isLoading: directorioLoading } = useQuery<AppointmentItem[]>({
    queryKey: ["my-directorio-appointments"],
    queryFn: getMyAppointments,
  });

  const invalidateAppointments = () => {
    queryClient.invalidateQueries({ queryKey: ["user-appointments"] });
    queryClient.invalidateQueries({ queryKey: ["my-directorio-appointments"] });
    queryClient.invalidateQueries({ queryKey: ["clinic-slots"] });
  };

  const cancelMutation = useMutation({
    mutationFn: (id: string) => cancelAppointment(id),
    onSuccess: () => {
      invalidateAppointments();
      showAlert({
        type: "success",
        title: "Cita cancelada",
        message: "Tu cita ha sido cancelada exitosamente.",
      });
    },
    onError: (error: Error) => {
      showAlert({
        type: "error",
        title: "No se pudo cancelar",
        message: error.message || "Inténtalo de nuevo.",
      });
    },
  });

  const handleCancel = useCallback(
    (appointment: Appointment) => {
      showAlert({
        type: "warning",
        title: "¿Cancelar la cita?",
        message: `¿Estás seguro de cancelar tu cita en ${appointment.clinic_name || "esta clínica"}?`,
        buttonText: "Sí, cancelar",
        showCancel: true,
        cancelText: "No, mantener",
        onButtonPress: () => cancelMutation.mutate(appointment.id),
      });
    },
    [cancelMutation],
  );

  const handleReschedule = useCallback(
    (appointment: Appointment) => {
      const qs = new URLSearchParams({ reschedule_id: appointment.id });
      if (appointment.service_id) qs.set("service_id", appointment.service_id);
      router.push(`/directorio/citas/agendar/${appointment.clinic_id}?${qs.toString()}`);
    },
    [router],
  );

  const countFor = (key: FilterTab) => appointments.filter((a) => matches(a, key)).length;
  const filtered = appointments.filter((a) => matches(a, activeFilter));

  return {
    appointments: filtered,
    countFor,
    allAppointments: appointments,
    directorioAppointments,
    directorioLoading,
    isLoading,
    isRefetching,
    refetch,
    activeFilter,
    setActiveFilter,
    handleCancel,
    handleReschedule,
    cancelMutation,
  };
}
