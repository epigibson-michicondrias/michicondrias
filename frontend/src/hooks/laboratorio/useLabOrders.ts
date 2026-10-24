/**
 * useLabOrders — lado cliente de laboratorio (`(app)/laboratorio`).
 * Espejo de `mobile/src/hooks/laboratorio/useLabOrders.ts`.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getClientLabAppointments,
  createLabAppointment,
  getPetLabHistory,
  getLabTests,
  updateLabAppointmentStatus,
} from "@/services/laboratorio";
import { showAlert } from "@/components/AppAlert";

export function useLabOrders(petId?: string) {
  const queryClient = useQueryClient();

  const appointmentsQuery = useQuery({
    queryKey: ["lab-appointments-client"],
    queryFn: getClientLabAppointments,
  });

  const testsQuery = useQuery({
    queryKey: ["lab-tests"],
    queryFn: getLabTests,
  });

  const historyQuery = useQuery({
    queryKey: ["lab-history", petId],
    queryFn: () => getPetLabHistory(petId!),
    enabled: !!petId,
  });

  const createAppointmentMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => createLabAppointment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lab-appointments-client"] });
      queryClient.invalidateQueries({ queryKey: ["lab-appointments-provider"] });
    },
    onError: (e: Error) => {
      showAlert({ type: "error", title: "No se pudo crear la cita", message: e?.message || "Inténtalo de nuevo." });
    },
  });

  const cancelAppointmentMutation = useMutation({
    mutationFn: (id: string) => updateLabAppointmentStatus(id, "cancelled"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lab-appointments-client"] });
      queryClient.invalidateQueries({ queryKey: ["lab-appointments-provider"] });
    },
    onError: (e: Error) => {
      showAlert({ type: "error", title: "No se pudo cancelar", message: e?.message || "Inténtalo de nuevo." });
    },
  });

  return {
    appointments: appointmentsQuery.data || [],
    tests: testsQuery.data || [],
    history: historyQuery.data || [],
    isLoadingAppointments: appointmentsQuery.isLoading,
    isLoadingTests: testsQuery.isLoading,
    isLoadingHistory: historyQuery.isLoading,
    createAppointment: createAppointmentMutation.mutateAsync,
    cancelAppointment: cancelAppointmentMutation.mutate,
    isCancelling: cancelAppointmentMutation.isPending,
    isCreatingAppointment: createAppointmentMutation.isPending,
    refetchAppointments: appointmentsQuery.refetch,
    refetchTests: testsQuery.refetch,
  };
}
