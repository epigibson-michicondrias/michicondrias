/**
 * useTransporters — directorio de conductores disponibles (`(app)/transportistas`).
 * Espejo de `mobile/src/hooks/rides/useTransporters.ts`.
 */
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getAvailableDrivers, type DriverProfile } from "@/services/rides";

export function useTransporters() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: drivers = [],
    isLoading,
    isError,
    isRefetching,
    refetch,
  } = useQuery<DriverProfile[]>({
    queryKey: ["available-drivers"],
    queryFn: () => getAvailableDrivers(),
  });

  const filteredDrivers = useMemo(
    () =>
      drivers.filter((driver) => {
        // vehicle_model / vehicle_plate pueden no estar guardados aún.
        const hay = `${driver.vehicle_model ?? ""} ${driver.vehicle_plate ?? ""}`.toLowerCase();
        return hay.includes(searchQuery.toLowerCase());
      }),
    [drivers, searchQuery],
  );

  return {
    searchQuery,
    setSearchQuery,
    drivers: filteredDrivers,
    isLoading,
    isError,
    isRefetching,
    refetch,
    router,
  };
}

export type { DriverProfile };
