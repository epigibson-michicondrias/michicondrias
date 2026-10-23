/**
 * useListingDetail — ficha de mascota en adopción (`(app)/adopciones/mascota/[id]`).
 * Espejo de `mobile/src/hooks/adopciones/useListingDetail.ts` con `next/navigation`.
 */
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { getListing, getMyRequests } from "@/services/adopciones";
import { useAuth } from "@/contexts/AuthContext";
import type { Listing } from "@/types/adopciones";

export function useListingDetail() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const { user } = useAuth();

  const {
    data: listing,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["adopcion", id],
    queryFn: () => getListing(id!),
    enabled: !!id,
  });

  // Solicitudes propias: para no dejar postular dos veces y llevar al seguimiento
  const { data: myRequests = [] } = useQuery({
    queryKey: ["my-adoption-requests"],
    queryFn: getMyRequests,
    enabled: !!user?.id,
  });
  const myRequest = myRequests.find((r) => r.listing_id === id && r.status !== "REJECTED");
  const isOwner = !!user?.id && user.id === listing?.published_by;

  const goBack = () => (window.history.length > 1 ? router.back() : router.replace("/adopciones"));
  const goToMyRequests = () => router.push("/adopciones/mis-solicitudes");
  /** Para quien publicó: las solicitudes recibidas de esta mascota. */
  const goToRequests = () => {
    if (id) router.push(`/adopciones/solicitudes?listing=${id}`);
  };
  const goToApply = () => {
    if (id) router.push(`/adopciones/solicitar/${id}`);
  };

  return {
    listing,
    isLoading,
    error,
    refetch,
    goBack,
    goToApply,
    goToMyRequests,
    goToRequests,
    myRequest,
    isOwner,
  };
}

export type { Listing };
