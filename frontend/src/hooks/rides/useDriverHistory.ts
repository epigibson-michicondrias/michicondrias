/**
 * useDriverHistory — historial y ganancias del conductor (`(app)/transportistas/historial`).
 * Espejo de `mobile/src/hooks/rides/useDriverHistory.ts`.
 */
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getDriverRideHistory } from "@/services/rides";
import type { DriverRideHistory } from "@/services/rides";

export type DriverHistoryData = DriverRideHistory;

export function useDriverHistory() {
  const router = useRouter();

  const {
    data: history,
    isLoading,
    isError,
    isRefetching,
    refetch,
  } = useQuery<DriverHistoryData>({
    queryKey: ["driver-ride-history"],
    queryFn: () => getDriverRideHistory(),
  });

  const totalEarnings = history?.total_earnings ?? 0;
  const ridesCount = history?.rides_count ?? 0;
  const rides = history?.rides ?? [];
  const ratingAvg = history?.rating_avg ?? null;
  const ratingCount = history?.rating_count ?? 0;

  return {
    totalEarnings,
    ridesCount,
    rides,
    ratingAvg,
    ratingCount,
    isLoading,
    isError,
    isRefetching,
    refetch,
    router,
  };
}
