/**
 * useSitterDetail — ficha del cuidador (`(app)/cuidadores/[id]`): datos, solicitud de cuidado y reseñas.
 * Espejo de `mobile/src/hooks/cuidadores/useSitterDetail.ts` con `next/navigation`.
 */
import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSitter,
  requestSit,
  getSitterReviews,
  createSitterReview,
  getMySitRequests,
  type SitRequest,
} from "@/services/cuidadores";
import { getUserPets } from "@/services/mascotas";
import { useAuth } from "@/contexts/AuthContext";
import { showAlert } from "@/components/AppAlert";
import { errorMessage, toLocalIsoDate } from "@/features/servicios-pro/requestStatus";

export function useSitterDetail() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [sitModalVisible, setSitModalVisible] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(() => toLocalIsoDate(new Date()));
  const [endDate, setEndDate] = useState(() => toLocalIsoDate(new Date()));
  const [sitServiceType, setSitServiceType] = useState<"hosting" | "visiting">("hosting");
  const [sitNotes, setSitNotes] = useState("");

  const { data: sitter, isLoading, error, refetch } = useQuery({
    queryKey: ["sitter", id],
    queryFn: () => getSitter(id!),
    enabled: !!id,
  });

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ["sitter-reviews", id],
    queryFn: () => getSitterReviews(id!),
    enabled: !!id,
  });

  const { data: myPets = [] } = useQuery({
    queryKey: ["user-pets", user?.id],
    queryFn: () => getUserPets(user!.id),
    enabled: !!user?.id,
  });

  const { data: mySitRequests = [] } = useQuery<SitRequest[]>({
    queryKey: ["my-sit-requests"],
    queryFn: getMySitRequests,
    enabled: !!user?.id,
  });

  const unreviewedCompletedRequests = mySitRequests.filter(
    (req) => req.sitter_id === id && req.status === "completed" && !reviews.some((rev) => rev.sit_request_id === req.id),
  );

  const requestSitMutation = useMutation({
    mutationFn: (data: Partial<SitRequest>) => requestSit(id!, data),
    onSuccess: () => {
      setSitModalVisible(false);
      resetSitForm();
      showAlert({ type: "success", title: "¡Solicitud enviada!", message: "Tu solicitud de cuidado ha sido enviada." });
      queryClient.invalidateQueries({ queryKey: ["my-sit-requests"] });
      queryClient.invalidateQueries({ queryKey: ["sitter-requests"] });
    },
    onError: (e) => {
      showAlert({ type: "error", title: "No se pudo enviar", message: errorMessage(e, "No se pudo enviar la solicitud.") });
    },
  });

  const createReviewMutation = useMutation({
    mutationFn: ({ requestId, data }: { requestId: string; data: { rating: number; comment: string } }) =>
      createSitterReview(id!, requestId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sitter-reviews", id] });
      queryClient.invalidateQueries({ queryKey: ["sitter", id] });
      queryClient.invalidateQueries({ queryKey: ["sitters"] });
      queryClient.invalidateQueries({ queryKey: ["my-sit-requests"] });
      showAlert({ type: "success", title: "¡Reseña enviada!", message: "Tu reseña ha sido publicada." });
    },
    onError: (e) => {
      showAlert({ type: "error", title: "No se pudo enviar", message: errorMessage(e, "No se pudo enviar la reseña.") });
    },
  });

  const resetSitForm = () => {
    setSelectedPetId(null);
    setStartDate(toLocalIsoDate(new Date()));
    setEndDate(toLocalIsoDate(new Date()));
    setSitNotes("");
  };

  const handleSubmitSitRequest = () => {
    if (!selectedPetId) {
      showAlert({ type: "info", title: "Elige a tu mascota", message: "Selecciona a quién va a cuidar." });
      return;
    }
    if (!startDate || !endDate) {
      showAlert({ type: "info", title: "Faltan las fechas", message: "Elige desde y hasta cuándo." });
      return;
    }
    if (endDate < startDate) {
      showAlert({ type: "error", title: "Fechas inválidas", message: "La fecha de fin no puede ser anterior a la de inicio." });
      return;
    }
    requestSitMutation.mutate({
      pet_id: selectedPetId,
      service_type: sitter?.service_type === "both" ? sitServiceType : sitter?.service_type || sitServiceType,
      start_date: startDate,
      end_date: endDate,
      notes: sitNotes || undefined,
    });
  };

  const getServiceName = (type: string) => {
    switch (type) {
      case "hosting":
        return "Hospedaje en casa del cuidador";
      case "visiting":
        return "Visitas a domicilio";
      default:
        return "Hospedaje y visitas";
    }
  };

  const isOwnProfile = !!sitter && sitter.user_id === user?.id;

  return {
    id,
    isOwnProfile,
    sitter,
    isLoading,
    error,
    refetch,
    handleBook: () => setSitModalVisible(true),
    getServiceName,
    sitServiceType,
    setSitServiceType,
    // Solicitud de cuidado
    sitModalVisible,
    setSitModalVisible,
    selectedPetId,
    setSelectedPetId,
    startDate,
    // Si «Desde» pasa a «Hasta», se recorre «Hasta» para no dejar un rango inválido
    setStartDate: (iso: string) => {
      setStartDate(iso);
      if (endDate < iso) setEndDate(iso);
    },
    endDate,
    setEndDate,
    sitNotes,
    setSitNotes,
    myPets,
    handleSubmitSitRequest,
    isRequestingSit: requestSitMutation.isPending,
    // Reseñas
    reviews,
    reviewsLoading,
    handleCreateReview: (requestId: string, data: { rating: number; comment: string }) =>
      createReviewMutation.mutate({ requestId, data }),
    isCreatingReview: createReviewMutation.isPending,
    unreviewedCompletedRequests,
  };
}
