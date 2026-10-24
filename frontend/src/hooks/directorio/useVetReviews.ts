/**
 * useVetReviews — reseñas y rating de un especialista.
 * Espejo de `mobile/src/hooks/directorio/useVetReviews.ts`.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getVetReviews, getVetRating, createVetReview, type VetReview } from "@/services/directorio";
import { showAlert } from "@/components/AppAlert";

export function useVetReviews(vetId: string) {
  const queryClient = useQueryClient();

  const { data: rating } = useQuery({
    queryKey: ["vet-rating", vetId],
    queryFn: () => getVetRating(vetId),
    enabled: !!vetId,
  });

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery<VetReview[]>({
    queryKey: ["vet-reviews", vetId],
    queryFn: () => getVetReviews(vetId),
    enabled: !!vetId,
  });

  const createReviewMutation = useMutation({
    mutationFn: ({ rating: value, comment }: { rating: number; comment?: string }) =>
      createVetReview(vetId, value, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vet-reviews", vetId] });
      queryClient.invalidateQueries({ queryKey: ["vet-rating", vetId] });
      queryClient.invalidateQueries({ queryKey: ["directorio-vets"] });
      showAlert({ type: "success", title: "Reseña enviada", message: "Tu reseña ha sido publicada." });
    },
    onError: (e: Error) => {
      showAlert({ type: "error", title: "No se pudo enviar", message: e?.message || "No se pudo enviar la reseña." });
    },
  });

  return {
    rating,
    reviews,
    reviewsLoading,
    handleCreateReview: (value: number, comment?: string) => createReviewMutation.mutate({ rating: value, comment }),
    isCreatingReview: createReviewMutation.isPending,
  };
}
