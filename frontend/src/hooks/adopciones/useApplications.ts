/**
 * useApplications — todas las solicitudes recibidas en mis publicaciones, con filtro por estado.
 * Espejo de `mobile/src/hooks/adopciones/useApplications.ts`.
 */
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMyListings, getListingRequests } from "@/services/adopciones";
import { useAuth } from "@/contexts/AuthContext";
import type { Listing, AdoptionRequest } from "@/types/adopciones";

export type ListingWithRequests = Listing & { requests: AdoptionRequest[] };

export const REQUEST_FILTERS = [
  { key: "all", label: "Todas" },
  { key: "PENDING", label: "Por revisar" },
  { key: "REVIEWING", label: "En revisión" },
  { key: "INTERVIEW_SCHEDULED", label: "Entrevista" },
  { key: "APPROVED", label: "Pre-aprobadas" },
  { key: "ADOPTED", label: "Adoptadas" },
  { key: "REJECTED", label: "Rechazadas" },
] as const;
export type RequestFilter = (typeof REQUEST_FILTERS)[number]["key"];

/** Primero las que esperan respuesta; las cerradas al final. */
const ORDER: Record<string, number> = {
  PENDING: 0,
  REVIEWING: 1,
  INTERVIEW_SCHEDULED: 2,
  APPROVED: 3,
  ADOPTED: 4,
  REJECTED: 5,
};

export function useApplications() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<RequestFilter>("all");

  const {
    data: listings = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["user-listings-with-requests"],
    queryFn: async () => {
      const userListings = await getMyListings();
      return Promise.all(
        userListings.map(async (listing) => {
          try {
            return { ...listing, requests: await getListingRequests(listing.id) };
          } catch {
            return { ...listing, requests: [] };
          }
        }),
      ) as Promise<ListingWithRequests[]>;
    },
    enabled: !!user?.id,
  });

  const all = useMemo(
    () =>
      listings
        .flatMap((listing) => listing.requests.map((request) => ({ request, petName: listing.name })))
        .sort(
          (a, b) =>
            (ORDER[a.request.status] ?? 9) - (ORDER[b.request.status] ?? 9) ||
            new Date(b.request.created_at).getTime() - new Date(a.request.created_at).getTime(),
        ),
    [listings],
  );

  const countFor = (key: RequestFilter) =>
    key === "all" ? all.length : all.filter((r) => r.request.status === key).length;

  return {
    isLoading,
    refetch,
    isRefetching,
    hasListings: listings.length > 0,
    requests: filter === "all" ? all : all.filter((r) => r.request.status === filter),
    total: all.length,
    filter,
    setFilter,
    countFor,
  };
}

export type { Listing, AdoptionRequest };
