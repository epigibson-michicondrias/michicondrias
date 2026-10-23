/**
 * useVenues — lista de establecimientos (`(app)/establecimientos`).
 * Espejo de `mobile/src/hooks/venues/useVenues.ts`.
 */
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchVenues, type Venue } from "@/services/venues";

export function useVenues() {
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: venues = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery<Venue[]>({
    queryKey: ["venues"],
    queryFn: () => searchVenues(),
  });

  const filteredVenues = useMemo(
    () =>
      venues.filter(
        (venue) =>
          venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          venue.address.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [venues, searchQuery],
  );

  const hasActiveFilters = searchQuery !== "";

  return {
    venues: filteredVenues,
    isLoading,
    isError,
    refetch,
    isRefetching,
    searchQuery,
    setSearchQuery,
    hasActiveFilters,
  };
}
