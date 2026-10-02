/**
 * useDriverHistory — Hook for driver ride history screen
 * Fetches ride history with earnings summary and ride list
 */
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { getDriverRideHistory } from '@/src/services/rides';
import type { DriverRideHistory } from '@/src/services/rides';

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
    queryKey: ['driver-ride-history'],
    queryFn: () => getDriverRideHistory(),
  });

  const totalEarnings = history?.total_earnings ?? 0;
  const ridesCount = history?.rides_count ?? 0;
  const rides = history?.rides ?? [];
  const ratingAvg = history?.rating_avg ?? null;
  const ratingCount = history?.rating_count ?? 0;

  return {
    // Data
    totalEarnings,
    ridesCount,
    rides,
    ratingAvg,
    ratingCount,
    isLoading,
    isError,
    isRefetching,

    // Actions
    refetch,

    // Navigation
    router,
  };
}
