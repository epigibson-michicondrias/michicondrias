/**
 * usePlaceDetail — ficha de lugar pet-friendly (`(app)/petfriendly/[id]`).
 * Espejo de `mobile/src/hooks/petfriendly/usePlaceDetail.ts` con `next/navigation`.
 */
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPlaceById,
  getPlaceReviews,
  createPlaceReview,
  deletePlace,
  type PetfriendlyReview,
  type PetfriendlyReviewCreate,
} from "@/services/petfriendly";
import { useAuth } from "@/contexts/AuthContext";
import { showAlert } from "@/components/AppAlert";

export function usePlaceDetail() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: place, isLoading } = useQuery({
    queryKey: ["petfriendly-place", id],
    queryFn: () => getPlaceById(id!),
    enabled: !!id,
  });

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery<PetfriendlyReview[]>({
    queryKey: ["petfriendly-reviews", id],
    queryFn: () => getPlaceReviews(id!),
    enabled: !!id,
  });

  const createReviewMutation = useMutation({
    mutationFn: (data: PetfriendlyReviewCreate) => createPlaceReview(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["petfriendly-place", id] });
      queryClient.invalidateQueries({ queryKey: ["petfriendly-reviews", id] });
      queryClient.invalidateQueries({ queryKey: ["petfriendly-places"] });
      showAlert({ type: "success", title: "Reseña enviada", message: "Tu reseña ha sido publicada." });
    },
    onError: (err: Error) => {
      showAlert({
        type: "error",
        title: "No se pudo enviar la reseña",
        message: err.message || "Inténtalo de nuevo.",
      });
    },
  });

  /** Devuelve true si se publicó (la pantalla limpia el formulario solo entonces). */
  const handleCreateReview = async (rating: number, comment: string): Promise<boolean> => {
    if (rating < 1 || rating > 5) {
      showAlert({ type: "info", title: "Elige una calificación", message: "Toca de 1 a 5 estrellas." });
      return false;
    }
    try {
      await createReviewMutation.mutateAsync({ rating, comment });
      return true;
    } catch {
      return false; // el error ya se muestra en onError
    }
  };

  const openMap = () => {
    if (!place) return;
    const hasCoords = place.latitude != null && place.longitude != null;
    const query = hasCoords
      ? `${place.latitude},${place.longitude}`
      : encodeURIComponent(`${place.name} ${place.address || ""} ${place.city || ""}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank", "noopener,noreferrer");
  };

  const callPlace = () => {
    if (place?.phone) window.location.href = `tel:${place.phone}`;
  };

  const openWebsite = () => {
    if (!place?.website) return;
    const url = /^https?:\/\//i.test(place.website) ? place.website : `https://${place.website}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const sharePlace = async () => {
    if (!place) return;
    const text = `${place.name} es pet friendly. Míralo en Michicondrias 🐾`;
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Lugar pet friendly", text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text} ${url}`);
      showAlert({ type: "success", title: "Enlace copiado", message: "Compártelo con quien quieras." });
    } catch {
      // el usuario canceló el compartir: no molestar
    }
  };

  const deleteMutation = useMutation({
    mutationFn: () => deletePlace(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["petfriendly-places"] });
      showAlert({
        type: "success",
        title: "Lugar eliminado",
        message: "El lugar ya no aparece en la lista.",
        onButtonPress: () => router.replace("/petfriendly"),
      });
    },
    onError: (err: Error) => {
      showAlert({
        type: "error",
        title: "No se pudo eliminar",
        message: err?.message || "Inténtalo de nuevo.",
      });
    },
  });

  const isOwner = !!user?.id && place?.added_by === user.id;
  const handleDelete = () => {
    showAlert({
      type: "warning",
      title: "Eliminar lugar",
      message: "Se borrará el lugar y todas sus reseñas. Esta acción no se puede deshacer.",
      showCancel: true,
      cancelText: "Cancelar",
      buttonText: "Eliminar",
      onButtonPress: () => deleteMutation.mutate(),
    });
  };

  const goBack = () => (window.history.length > 1 ? router.back() : router.replace("/petfriendly"));

  return {
    place,
    isLoading,
    reviews,
    reviewsLoading,
    isCreatingReview: createReviewMutation.isPending,
    openMap,
    callPlace,
    openWebsite,
    sharePlace,
    goBack,
    handleCreateReview,
    isOwner,
    handleDelete,
    isDeleting: deleteMutation.isPending,
  };
}
