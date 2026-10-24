/**
 * useVenueDetail — ficha de establecimiento (`(app)/establecimientos/[id]`).
 * Espejo de `mobile/src/hooks/venues/useVenueDetail.ts` con `next/navigation`.
 */
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getVenue, type Venue } from "@/services/venues";
import { showAlert } from "@/components/AppAlert";

export function useVenueDetail() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data: venue, isLoading, error } = useQuery<Venue>({
    queryKey: ["venue", id],
    queryFn: () => getVenue(id!),
    enabled: !!id,
  });

  /** Abre la dirección en Google Maps. */
  const handleContact = () => {
    if (!venue?.address) return;
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venue.name} ${venue.address}`)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return {
    venue,
    isLoading,
    error,
    handleContact,
  };
}
