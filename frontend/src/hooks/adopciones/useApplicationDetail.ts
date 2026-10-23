/**
 * useApplicationDetail — gestión de una solicitud de adopción (`(app)/adopciones/solicitud/[id]`).
 * Espejo de `mobile/src/hooks/adopciones/useApplicationDetail.ts`.
 */
import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getListing,
  getRequest,
  updateRequestStatus,
  approveAdoption,
} from "@/services/adopciones";
import { showAlert } from "@/components/AppAlert";
import { useAuth } from "@/contexts/AuthContext";
import { requestStatusInfo } from "@/features/adopciones/requestStatus";

export function useApplicationDetail() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [notes, setNotes] = useState("");
  const [interviewDate, setInterviewDate] = useState("");

  const { data: request, isLoading } = useQuery({
    queryKey: ["adoption-request", id],
    queryFn: () => getRequest(id!),
    enabled: !!id,
  });

  const { data: listing } = useQuery({
    queryKey: ["adopcion", request?.listing_id],
    queryFn: () => getListing(request!.listing_id),
    enabled: !!request?.listing_id,
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["adoption-request", id] });
    queryClient.invalidateQueries({ queryKey: ["user-listings-with-requests"] });
    queryClient.invalidateQueries({ queryKey: ["adopciones-listings"] });
    queryClient.invalidateQueries({ queryKey: ["my-adopciones"] });
    queryClient.invalidateQueries({ queryKey: ["my-requests"] });
    if (request?.listing_id) queryClient.invalidateQueries({ queryKey: ["adopcion", request.listing_id] });
  };

  const statusMutation = useMutation({
    mutationFn: (status: string) => {
      const parts: string[] = [];
      if (status === "INTERVIEW_SCHEDULED" && interviewDate) parts.push(`Entrevista: ${interviewDate}.`);
      if (notes.trim()) parts.push(notes.trim());
      return updateRequestStatus(id!, status, parts.join(" ") || undefined);
    },
    onSuccess: () => {
      invalidateAll();
      showAlert({ type: "success", title: "Listo", message: "Le avisamos a quien envió la solicitud." });
    },
    onError: (e: Error) => {
      showAlert({ type: "error", title: "No se pudo actualizar", message: e.message || "Inténtalo de nuevo." });
    },
  });

  const approveMutation = useMutation({
    mutationFn: () => approveAdoption(id!),
    onSuccess: () => {
      invalidateAll();
      queryClient.invalidateQueries({ queryKey: ["user-pets"] });
      showAlert({
        type: "success",
        title: "Adopción aprobada",
        message: "La mascota ya aparece en la cuenta del adoptante.",
      });
    },
    onError: (e: Error) => {
      showAlert({ type: "error", title: "No se pudo aprobar", message: e.message || "Inténtalo de nuevo." });
    },
  });

  const handleStatusUpdate = (status: string) => {
    const statusInfo = requestStatusInfo(status);

    if (status === "INTERVIEW_SCHEDULED" && !interviewDate) {
      showAlert({
        type: "info",
        title: "Falta la fecha",
        message: "Escribe cuándo y dónde será la entrevista.",
      });
      return;
    }

    showAlert({
      type: "warning",
      title: status === "REJECTED" ? "¿Rechazar esta solicitud?" : `¿Pasar a «${statusInfo.label}»?`,
      message:
        status === "REJECTED"
          ? "Se le avisará a quien la envió. No se puede deshacer."
          : "Se le avisará a quien la envió.",
      showCancel: true,
      cancelText: "Cancelar",
      buttonText: status === "REJECTED" ? "Rechazar" : "Confirmar",
      onButtonPress: () => statusMutation.mutate(status),
    });
  };

  const handleApprove = () => {
    showAlert({
      type: "warning",
      title: "¿Aprobar la adopción?",
      message:
        "¿Aprobar esta adopción? La mascota se registrará a nombre del adoptante, las demás solicitudes se rechazarán y esta acción no se puede deshacer.",
      showCancel: true,
      cancelText: "Cancelar",
      buttonText: "Aprobar",
      onButtonPress: () => approveMutation.mutate(),
    });
  };

  const statusInfo = request ? requestStatusInfo(request.status) : requestStatusInfo("PENDING");

  return {
    request,
    listing,
    isLoading,
    statusInfo,
    notes,
    interviewDate,
    /** Quien envió la solicitud la puede ver, pero no gestionarla. */
    isApplicant: !!user && request?.user_id === user.id,
    isMutating: statusMutation.isPending || approveMutation.isPending,
    setNotes,
    setInterviewDate,
    handleStatusUpdate,
    handleApprove,
  };
}
