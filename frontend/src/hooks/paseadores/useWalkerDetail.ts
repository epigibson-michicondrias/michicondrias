/**
 * useWalkerDetail — ficha del paseador (`(app)/paseadores/[id]`): datos, solicitud de paseo y reseñas.
 * Espejo de `mobile/src/hooks/paseadores/useWalkerDetail.ts` con `next/navigation`.
 */
import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getWalker,
  requestWalk,
  getWalkerReviews,
  createWalkerReview,
  getMyWalkRequests,
  type WalkRequest,
} from "@/services/paseadores";
import { getUserPets } from "@/services/mascotas";
import { useAuth } from "@/contexts/AuthContext";
import { showAlert } from "@/components/AppAlert";
import { errorMessage, toLocalIsoDate } from "@/features/servicios-pro/requestStatus";

const DURATIONS = [30, 45, 60, 90];

export function useWalkerDetail() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [walkModalVisible, setWalkModalVisible] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  // Hoy por defecto: el selector necesita una fecha válida desde que se abre
  const [walkDate, setWalkDate] = useState(() => toLocalIsoDate(new Date()));
  const [walkNotes, setWalkNotes] = useState("");
  const [walkDuration, setWalkDuration] = useState(30);

  const { data: walker, isLoading, error, refetch } = useQuery({
    queryKey: ["walker", id],
    queryFn: () => getWalker(id!),
    enabled: !!id,
  });

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ["walker-reviews", id],
    queryFn: () => getWalkerReviews(id!),
    enabled: !!id,
  });

  const { data: myPets = [] } = useQuery({
    queryKey: ["user-pets", user?.id],
    queryFn: () => getUserPets(user!.id),
    enabled: !!user?.id,
  });

  const { data: myWalkRequests = [] } = useQuery<WalkRequest[]>({
    queryKey: ["my-walk-requests"],
    queryFn: getMyWalkRequests,
    enabled: !!user?.id,
  });

  const unreviewedCompletedRequests = myWalkRequests.filter(
    (req) => req.walker_id === id && req.status === "completed" && !reviews.some((rev) => rev.walk_request_id === req.id),
  );

  const requestWalkMutation = useMutation({
    mutationFn: (data: Partial<WalkRequest>) => requestWalk(id!, data),
    onSuccess: () => {
      setWalkModalVisible(false);
      resetWalkForm();
      showAlert({
        type: "success",
        title: "Solicitud enviada",
        message: "El paseador la verá en sus solicitudes. Sigue su estado en «Mis solicitudes»",
      });
      queryClient.invalidateQueries({ queryKey: ["my-walk-requests"] });
      queryClient.invalidateQueries({ queryKey: ["walker-requests"] });
    },
    onError: (e) => {
      showAlert({ type: "error", title: "No se pudo enviar", message: errorMessage(e, "No se pudo enviar la solicitud de paseo.") });
    },
  });

  const createReviewMutation = useMutation({
    mutationFn: ({ requestId, data }: { requestId: string; data: { rating: number; comment: string } }) =>
      createWalkerReview(id!, requestId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["walker-reviews", id] });
      queryClient.invalidateQueries({ queryKey: ["walker", id] });
      queryClient.invalidateQueries({ queryKey: ["walkers"] });
      queryClient.invalidateQueries({ queryKey: ["my-walk-requests"] });
      showAlert({ type: "success", title: "¡Reseña enviada!", message: "Tu reseña ha sido publicada." });
    },
    onError: (e) => {
      showAlert({ type: "error", title: "No se pudo enviar", message: errorMessage(e, "No se pudo enviar la reseña.") });
    },
  });

  const resetWalkForm = () => {
    setSelectedPetId(null);
    setWalkDate(toLocalIsoDate(new Date()));
    setWalkNotes("");
    setWalkDuration(30);
  };

  const handleSubmitWalkRequest = () => {
    if (!selectedPetId) {
      showAlert({ type: "info", title: "Elige a tu mascota", message: "Selecciona a quién llevará a pasear." });
      return;
    }
    requestWalkMutation.mutate({
      pet_id: selectedPetId,
      requested_date: walkDate,
      duration_minutes: walkDuration,
      notes: walkNotes || undefined,
    });
  };

  const isOwnProfile = !!walker && walker.user_id === user?.id;

  return {
    id,
    isOwnProfile,
    walker,
    isLoading,
    error,
    refetch,
    handleBook: () => setWalkModalVisible(true),
    // Solicitud de paseo
    walkModalVisible,
    setWalkModalVisible,
    selectedPetId,
    setSelectedPetId,
    walkDate,
    setWalkDate,
    walkNotes,
    setWalkNotes,
    walkDuration,
    setWalkDuration,
    durations: DURATIONS,
    myPets,
    handleSubmitWalkRequest,
    isRequestingWalk: requestWalkMutation.isPending,
    // Reseñas
    reviews,
    reviewsLoading,
    handleCreateReview: (requestId: string, data: { rating: number; comment: string }) =>
      createReviewMutation.mutate({ requestId, data }),
    isCreatingReview: createReviewMutation.isPending,
    unreviewedCompletedRequests,
  };
}
