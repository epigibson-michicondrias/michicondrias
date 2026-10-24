/**
 * useListings — lista de mascotas en adopción con filtros (`(app)/adopciones`).
 * Espejo de `mobile/src/hooks/adopciones/useListings.ts`.
 */
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getListings } from "@/services/adopciones";
import type { Listing } from "@/types/adopciones";

export function useListings() {
  const [search, setSearch] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState<string>("all");
  const [sizeFilter, setSizeFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const {
    data: listings = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["adopciones-listings"],
    queryFn: getListings,
  });

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      if (search) {
        const q = search.toLowerCase();
        const matchesSearch =
          listing.name?.toLowerCase().includes(q) ||
          listing.breed?.toLowerCase().includes(q) ||
          listing.location?.toLowerCase().includes(q) ||
          listing.description?.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }
      if (speciesFilter !== "all" && listing.species?.toLowerCase() !== speciesFilter) return false;
      if (sizeFilter !== "all" && listing.size?.toLowerCase() !== sizeFilter) return false;
      return true;
    });
  }, [listings, search, speciesFilter, sizeFilter]);

  const hasActiveFilters = search.trim() !== "" || speciesFilter !== "all" || sizeFilter !== "all";

  return {
    listings: filteredListings,
    allListings: listings,
    isLoading,
    isRefetching,
    refetch,
    search,
    setSearch,
    speciesFilter,
    setSpeciesFilter,
    sizeFilter,
    setSizeFilter,
    viewMode,
    setViewMode,
    hasActiveFilters,
  };
}

export type { Listing };
