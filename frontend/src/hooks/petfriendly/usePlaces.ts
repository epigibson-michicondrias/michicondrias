/**
 * usePlaces — lista de lugares pet-friendly (`(app)/petfriendly`).
 * Espejo de `mobile/src/hooks/petfriendly/usePlaces.ts`.
 */
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getPlaces } from "@/services/petfriendly";

export function usePlaces() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const {
    data: places = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["petfriendly-places"],
    queryFn: () => getPlaces(),
  });

  const categories = useMemo(
    () => Array.from(new Set(places.map((p) => p.category).filter(Boolean))).sort(),
    [places],
  );

  const filteredPlaces = useMemo(
    () =>
      places.filter(
        (p) =>
          (!category || p.category === category) &&
          (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.city || "").toLowerCase().includes(searchQuery.toLowerCase())),
      ),
    [places, category, searchQuery],
  );

  const hasActiveFilters = searchQuery.trim() !== "" || !!category;

  const goToPlace = (id: string) => router.push(`/petfriendly/${id}`);
  const goToNewPlace = () => router.push("/petfriendly/nuevo");
  const goBack = () => (window.history.length > 1 ? router.back() : router.replace("/"));

  return {
    places: filteredPlaces,
    isLoading,
    isError,
    isRefetching,
    refetch,
    categories,
    category,
    setCategory,
    searchQuery,
    setSearchQuery,
    hasActiveFilters,
    goToPlace,
    goToNewPlace,
    goBack,
  };
}
