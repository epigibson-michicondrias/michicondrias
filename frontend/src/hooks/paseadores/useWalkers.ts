/**
 * useWalkers — listado de paseadores con búsqueda (`(app)/paseadores`).
 * Espejo de `mobile/src/hooks/paseadores/useWalkers.ts`.
 */
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listWalkers, type Walker } from "@/services/paseadores";

export function useWalkers() {
  const [search, setSearch] = useState("");

  const {
    data: walkers = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery<Walker[]>({
    queryKey: ["walkers"],
    queryFn: () => listWalkers(),
  });

  const filteredWalkers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return walkers;
    return walkers.filter(
      (walker) =>
        walker.display_name.toLowerCase().includes(q) ||
        (walker.location || "").toLowerCase().includes(q),
    );
  }, [walkers, search]);

  return {
    walkers: filteredWalkers,
    isLoading,
    isRefetching,
    refetch,
    search,
    setSearch,
    hasActiveFilters: search.trim() !== "",
  };
}
