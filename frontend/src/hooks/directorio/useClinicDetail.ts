/**
 * useClinicDetail — ficha de clínica: datos, servicios, rating y reseñas.
 * Espejo de `mobile/src/hooks/directorio/useClinicDetail.ts`.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import {
  getClinic,
  getClinicServices,
  getClinicRating,
  getClinicReviews,
  createClinicReview,
  type ClinicReview,
} from "@/services/directorio";
import { showAlert } from "@/components/AppAlert";
import { useAuth } from "@/contexts/AuthContext";
import { openExternalUrl, shareContent } from "@/features/directorio/links";

export function useClinicDetail() {
  const params = useParams<{ id: string }>();
  const clinicId = params.id;
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user } = useAuth();

  const { data: clinic, isLoading } = useQuery({
    queryKey: ["clinic", clinicId],
    queryFn: () => getClinic(clinicId),
    enabled: !!clinicId,
  });

  const { data: services = [] } = useQuery({
    queryKey: ["clinic-services", clinicId],
    queryFn: () => getClinicServices(clinicId),
    enabled: !!clinicId,
  });

  const { data: rating } = useQuery({
    queryKey: ["clinic-rating", clinicId],
    queryFn: () => getClinicRating(clinicId),
    enabled: !!clinicId,
  });

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery<ClinicReview[]>({
    queryKey: ["clinic-reviews", clinicId],
    queryFn: () => getClinicReviews(clinicId),
    enabled: !!clinicId,
  });

  const createReviewMutation = useMutation({
    mutationFn: ({ rating: value, comment }: { rating: number; comment?: string }) =>
      createClinicReview(clinicId, value, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinic-reviews", clinicId] });
      queryClient.invalidateQueries({ queryKey: ["clinic-rating", clinicId] });
      queryClient.invalidateQueries({ queryKey: ["directorio-clinics"] });
      showAlert({ type: "success", title: "Reseña enviada", message: "Tu reseña ha sido publicada." });
    },
    onError: (e: Error) => {
      showAlert({ type: "error", title: "No se pudo enviar", message: e?.message || "No se pudo enviar la reseña." });
    },
  });

  const phoneDigits = clinic?.phone?.replace(/\D/g, "") ?? "";
  const place = [clinic?.address, clinic?.city].filter(Boolean).join(", ");

  return {
    clinicId,
    /** Quien administra la clínica no se reseña a sí mismo (el backend responde 403). */
    canReview: !!user && !!clinic && clinic.owner_user_id !== user.id,
    call: phoneDigits ? () => openExternalUrl(`tel:${phoneDigits}`) : undefined,
    whatsapp: phoneDigits
      ? () => openExternalUrl(`https://wa.me/${phoneDigits.length === 10 ? `52${phoneDigits}` : phoneDigits}`)
      : undefined,
    directions: () =>
      openExternalUrl(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          [clinic?.name, place].filter(Boolean).join(", "),
        )}`,
      ),
    website: clinic?.website
      ? () =>
          openExternalUrl(
            clinic.website!.startsWith("http") ? clinic.website! : `https://${clinic.website}`,
          )
      : undefined,
    share: () =>
      clinic && shareContent(clinic.name, `${clinic.name}${place ? ` — ${place}` : ""}. La encontré en Michicondrias 🐾`),
    book: (serviceId?: string) =>
      router.push(
        `/directorio/citas/agendar/${clinicId}${serviceId ? `?service_id=${serviceId}` : ""}`,
      ),
    goBack: () => (window.history.length > 1 ? router.back() : router.replace("/directorio")),
    clinic,
    isLoading,
    services,
    rating,
    reviews,
    reviewsLoading,
    handleCreateReview: (value: number, comment?: string) => createReviewMutation.mutate({ rating: value, comment }),
    isCreatingReview: createReviewMutation.isPending,
  };
}
