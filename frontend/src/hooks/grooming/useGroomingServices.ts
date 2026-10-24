/**
 * useGroomingServices — catálogo público de servicios de estética (`(app)/estilistas`).
 * Espejo de `mobile/src/hooks/grooming/useGroomingServices.ts`.
 */
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getActiveServices, type GroomingService } from "@/services/grooming";

export function useGroomingServices() {
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: services = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery<GroomingService[]>({
    queryKey: ["grooming-services"],
    queryFn: () => getActiveServices(),
  });

  const filteredServices = useMemo(() => {
    return services.filter(
      (service) =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (service.description || "").toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [services, searchQuery]);

  const hasActiveFilters = searchQuery !== "";

  return {
    services: filteredServices,
    isLoading,
    refetch,
    isRefetching,
    searchQuery,
    setSearchQuery,
    hasActiveFilters,
  };
}

export type { GroomingService };
