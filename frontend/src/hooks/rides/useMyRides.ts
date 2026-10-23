/**
 * useMyRides — viajes que pedí como cliente (`(app)/transportistas/mis-viajes`), con filtro activos / historial.
 * Espejo de `mobile/src/hooks/rides/useMyRides.ts`.
 */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getMyRides } from "@/services/rides";
import type { PetRide, RideListFilter } from "@/services/rides";

export function useMyRides() {
  const router = useRouter();
  const [filter, setFilter] = useState<RideListFilter>("active");

  const {
    data: rides = [],
    isLoading,
    isError,
    isRefetching,
    refetch,
  } = useQuery<PetRide[]>({
    queryKey: ["my-rides", filter],
    queryFn: () => getMyRides(filter),
    refetchInterval: filter === "active" ? 15_000 : false,
  });

  return { filter, setFilter, rides, isLoading, isError, isRefetching, refetch, router };
}
