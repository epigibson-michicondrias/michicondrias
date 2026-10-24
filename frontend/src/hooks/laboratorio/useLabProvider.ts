/**
 * useLabProvider — gestión del laboratorio (`(app)/laboratorio/gestion`).
 * Espejo de `mobile/src/hooks/laboratorio/useLabProvider.ts`.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getLabOrders,
  getMyLabTests,
  setLabTestActive,
  updateLabAppointmentStatus,
  getProviderLabAppointments,
  getLabAnomalies,
  uploadLabResults,
  updateLabOrderStatus,
  createLabTest,
} from "@/services/laboratorio";
import { showAlert } from "@/components/AppAlert";

export function useLabProvider() {
  const queryClient = useQueryClient();

  const pendingOrdersQuery = useQuery({
    queryKey: ["lab-orders-all"],
    queryFn: () => getLabOrders(),
  });

  const myTestsQuery = useQuery({
    queryKey: ["lab-tests-mine"],
    queryFn: getMyLabTests,
  });

  const appointmentsQuery = useQuery({
    queryKey: ["lab-appointments-provider"],
    queryFn: getProviderLabAppointments,
  });

  const anomaliesQuery = useQuery({
    queryKey: ["lab-anomalies"],
    queryFn: getLabAnomalies,
  });

  const invalidateOrders = () => {
    queryClient.invalidateQueries({ queryKey: ["lab-orders-all"] });
    queryClient.invalidateQueries({ queryKey: ["lab-anomalies"] });
    queryClient.invalidateQueries({ queryKey: ["lab-history"] });
  };

  const appointmentStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "confirmed" | "completed" | "cancelled" }) =>
      updateLabAppointmentStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lab-appointments-provider"] });
      queryClient.invalidateQueries({ queryKey: ["lab-appointments-client"] });
    },
    onError: (e: Error) =>
      showAlert({ type: "error", title: "No se pudo actualizar", message: e?.message || "Inténtalo de nuevo." }),
  });

  const toggleTestMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => setLabTestActive(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lab-tests-mine"] });
      queryClient.invalidateQueries({ queryKey: ["lab-tests"] });
    },
    onError: (e: Error) =>
      showAlert({ type: "error", title: "No se pudo actualizar", message: e?.message || "Inténtalo de nuevo." }),
  });

  const uploadResultsMutation = useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: Record<string, unknown> }) =>
      uploadLabResults(orderId, data),
    onSuccess: () => {
      invalidateOrders();
      showAlert({
        type: "success",
        title: "Resultados enviados",
        message: "Notificamos al dueño y al veterinario.",
      });
    },
    onError: (e: Error) => {
      showAlert({
        type: "error",
        title: "No se pudieron subir los resultados",
        message: e?.message || "Inténtalo de nuevo.",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      updateLabOrderStatus(orderId, status),
    onSuccess: invalidateOrders,
    onError: (e: Error) => {
      showAlert({
        type: "error",
        title: "No se pudo actualizar el estado",
        message: e?.message || "Inténtalo de nuevo.",
      });
    },
  });

  const createTestMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => createLabTest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lab-tests"] });
      queryClient.invalidateQueries({ queryKey: ["lab-tests-mine"] });
      showAlert({
        type: "success",
        title: "Estudio publicado",
        message: "Ya aparece en el catálogo para los clientes.",
      });
    },
    onError: (e: Error) => {
      showAlert({
        type: "error",
        title: "No se pudo crear el estudio",
        message: e?.message || "Inténtalo de nuevo.",
      });
    },
  });

  return {
    orders: pendingOrdersQuery.data || [],
    appointments: appointmentsQuery.data || [],
    anomalies: anomaliesQuery.data || [],
    myTests: myTestsQuery.data || [],
    isLoadingOrders: pendingOrdersQuery.isLoading,
    isLoadingAppointments: appointmentsQuery.isLoading,
    isLoadingAnomalies: anomaliesQuery.isLoading,
    isLoadingTests: myTestsQuery.isLoading,
    updateAppointmentStatus: (id: string, status: "confirmed" | "completed" | "cancelled") =>
      appointmentStatusMutation.mutate({ id, status }),
    isUpdatingAppointment: appointmentStatusMutation.isPending,
    toggleTest: (id: string, active: boolean) => toggleTestMutation.mutate({ id, active }),
    uploadResults: uploadResultsMutation.mutateAsync,
    isUploadingResults: uploadResultsMutation.isPending,
    updateOrderStatus: updateStatusMutation.mutate,
    isUpdatingStatus: updateStatusMutation.isPending,
    createTest: createTestMutation.mutateAsync,
    isCreatingTest: createTestMutation.isPending,
    refetchOrders: pendingOrdersQuery.refetch,
    refetchAppointments: appointmentsQuery.refetch,
    refetchAnomalies: anomaliesQuery.refetch,
  };
}
