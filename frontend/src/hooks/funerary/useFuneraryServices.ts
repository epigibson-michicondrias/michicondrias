/**
 * useFuneraryServices — catálogo de servicios funerarios (`(app)/funeraria`).
 * Espejo de `mobile/src/hooks/funerary/useFuneraryServices.ts`.
 */
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getActiveFuneraryServices } from "@/services/funerary";
import type { FuneraryService } from "@/services/funerary";

export function useFuneraryServices() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: services = [], isLoading, isRefetching, refetch } = useQuery<FuneraryService[]>({
    queryKey: ["funerary-services"],
    queryFn: getActiveFuneraryServices,
  });

  const filteredServices = useMemo(
    () =>
      services.filter(
        (service) =>
          service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (service.description || "").toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [services, searchQuery],
  );

  return {
    searchQuery,
    setSearchQuery,
    services: filteredServices,
    isLoading,
    isRefetching,
    refetch,
    hasSearch: searchQuery.trim() !== "",
  };
}

export type { FuneraryService };
