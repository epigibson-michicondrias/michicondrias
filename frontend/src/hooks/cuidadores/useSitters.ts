/**
 * useSitters — listado de cuidadores con búsqueda y filtro de servicio (`(app)/cuidadores`).
 * Espejo de `mobile/src/hooks/cuidadores/useSitters.ts`.
 */
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listSitters, type Sitter } from "@/services/cuidadores";

export function useSitters() {
  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState<string>("");

  const {
    data: sitters = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery<Sitter[]>({
    queryKey: ["sitters"],
    queryFn: () => listSitters(),
  });

  const filteredSitters = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sitters.filter((sitter) => {
      const matchSearch =
        !q ||
        sitter.display_name.toLowerCase().includes(q) ||
        (sitter.location || "").toLowerCase().includes(q);
      const matchService =
        !serviceFilter || sitter.service_type === serviceFilter || sitter.service_type === "both";
      return matchSearch && matchService;
    });
  }, [sitters, search, serviceFilter]);

  return {
    sitters: filteredSitters,
    isLoading,
    isRefetching,
    refetch,
    search,
    setSearch,
    serviceFilter,
    setServiceFilter,
    hasActiveFilters: search.trim() !== "" || serviceFilter !== "",
  };
}
